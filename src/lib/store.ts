// Zustand store covering every status transition in the v3.5 technician flow.
// Each mutation writes-through to IndexedDB via `persistWorkOrder`.

import { create } from "zustand";
import type {
  AppNotification,
  AppState,
  CapturedDocument,
  CapturedPhoto,
  Comment,
  RejectionHistoryEntry,
  Signature,
  TechUser,
  VehicleDetails,
  WOStatus,
  WorkOrder,
} from "./types";
import {
  loadInitialState,
  persistNotification,
  persistWorkOrder,
  resetAll,
  setMeta,
} from "./db";
import { nowIso, uid } from "./time";
import { SEED_USER } from "./seed";

const LIVE_STATUSES: WOStatus[] = [
  "Accepted",
  "En_Route",
  "Service_Started",
  "Service_Completed",
];

interface State extends AppState {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  toggleDarkMode: () => void;
  toggleNotifications: () => void;
  setOnline: (online: boolean) => void;
  markNotificationRead: (id: string) => void;
  resetDemo: () => Promise<void>;

  // Status transitions
  acceptJob: (woId: string, etaMinutes: number) => Promise<void>;
  saveVehicleDetails: (
    woId: string,
    details: Pick<
      VehicleDetails,
      "driverName" | "vehicleNumber" | "odometerDeparture"
    >,
  ) => Promise<void>;
  acknowledgeSla: (woId: string) => Promise<void>;
  leaveForLocation: (woId: string) => Promise<void>;
  markAsArrived: (woId: string, odometerArrival: number) => Promise<void>;
  serviceComplete: (woId: string) => Promise<void>;
  leaveSite: (woId: string) => Promise<void>;
  completeJob: (woId: string) => Promise<void>;
  resubmit: (woId: string, responseNotes?: string) => Promise<void>;

  // Detail mutations
  updateLineItemDetail: (
    woId: string,
    lineItemId: string,
    detail: Partial<WorkOrder["lineItems"][number]["detail"]>,
  ) => Promise<void>;
  setNote: (
    woId: string,
    field:
      | "preServiceNotes"
      | "serviceNotes"
      | "postServiceNotes"
      | "leftSiteNotes"
      | "rejectionResponseNotes",
    value: string,
  ) => Promise<void>;
  addPhoto: (
    woId: string,
    bucket: "preServicePhotos" | "postServicePhotos",
    slotLabel: string,
    dataUrl: string,
  ) => Promise<void>;
  removePhoto: (
    woId: string,
    bucket: "preServicePhotos" | "postServicePhotos",
    photoId: string,
  ) => Promise<void>;
  addDocument: (
    woId: string,
    bucket: "preServiceDocuments" | "postServiceDocuments",
    file: { name: string; size: number },
  ) => Promise<void>;
  removeDocument: (
    woId: string,
    bucket: "preServiceDocuments" | "postServiceDocuments",
    docId: string,
  ) => Promise<void>;
  setSignature: (
    woId: string,
    signature: Pick<Signature, "imageDataUrl" | "signerName">,
  ) => Promise<void>;
  markCustomerNotAvailable: (woId: string) => Promise<void>;
  postComment: (woId: string, text: string) => Promise<void>;

  // Simulated BA actions (so the demo can exercise the rejection loop)
  simulateApproval: (woId: string) => Promise<void>;
  simulateRejection: (
    woId: string,
    reason: string,
    description: string,
  ) => Promise<void>;
  simulateDispatcherAddItem: (woId: string) => Promise<void>;
  refreshFromDispatcher: (woId: string) => Promise<void>;
}

function getWO(state: State, id: string): WorkOrder {
  const wo = state.workOrders[id];
  if (!wo) throw new Error(`Work order not found: ${id}`);
  return wo;
}

function getOtherLiveWO(
  workOrders: Record<string, WorkOrder>,
  excludeId: string,
): WorkOrder | undefined {
  return Object.values(workOrders).find(
    (wo) => wo.id !== excludeId && LIVE_STATUSES.includes(wo.woStatus),
  );
}

async function commit(woUpdater: () => WorkOrder, set: (fn: (s: State) => Partial<State>) => void) {
  const next = woUpdater();
  await persistWorkOrder(next);
  set((s) => ({ workOrders: { ...s.workOrders, [next.id]: next } }));
}

async function pushNotification(
  set: (fn: (s: State) => Partial<State>) => void,
  notif: Omit<AppNotification, "id" | "read" | "createdAt"> & {
    createdAt?: string;
  },
) {
  const n: AppNotification = {
    id: uid("notif"),
    read: false,
    createdAt: notif.createdAt ?? nowIso(),
    title: notif.title,
    body: notif.body,
    woNumber: notif.woNumber,
  };
  await persistNotification(n);
  set((s) => ({ notifications: [n, ...s.notifications] }));
}

const defaultUser: TechUser = SEED_USER;

export const useStore = create<State>((set, get) => ({
  user: defaultUser,
  workOrders: {},
  online: typeof navigator !== "undefined" ? navigator.onLine : true,
  darkMode: false,
  notificationsEnabled: true,
  notifications: [],
  hydrated: false,

  hydrate: async () => {
    const init = await loadInitialState();
    set({
      user: init.user,
      workOrders: Object.fromEntries(init.workOrders.map((w) => [w.id, w])),
      notifications: init.notifications,
      darkMode: init.darkMode,
      notificationsEnabled: init.notificationsEnabled,
      hydrated: true,
    });
  },

  toggleDarkMode: () => {
    const next = !get().darkMode;
    set({ darkMode: next });
    setMeta("darkMode", next);
  },

  toggleNotifications: () => {
    const next = !get().notificationsEnabled;
    set({ notificationsEnabled: next });
    setMeta("notificationsEnabled", next);
  },

  setOnline: (online) => set({ online }),

  markNotificationRead: async (id) => {
    const notif = get().notifications.find((n) => n.id === id);
    if (!notif) return;
    const updated = { ...notif, read: true };
    await persistNotification(updated);
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? updated : n)),
    }));
  },

  resetDemo: async () => {
    await resetAll();
    await get().hydrate();
  },

  // ---------------- Status transitions ----------------

  acceptJob: async (woId, etaMinutes) => {
    const state = get();
    if (getOtherLiveWO(state.workOrders, woId)) {
      throw new Error(
        "You already have a live work order. Tap Leave Site on it before accepting another.",
      );
    }
    await commit(() => {
      const wo = getWO(state, woId);
      const accepted = nowIso();
      const expected = new Date(
        Date.now() + etaMinutes * 60_000,
      ).toISOString();
      return {
        ...wo,
        woStatus: "Accepted",
        acceptedAt: accepted,
        etaMinutes,
        etaCommittedAt: accepted,
        expectedArrivalAt: expected,
        etaLocked: true,
      };
    }, set);
  },

  saveVehicleDetails: async (woId, details) => {
    await commit(() => {
      const wo = getWO(get(), woId);
      return { ...wo, vehicle: { ...wo.vehicle, ...details } };
    }, set);
  },

  acknowledgeSla: async (woId) => {
    await commit(() => {
      const wo = getWO(get(), woId);
      return {
        ...wo,
        slaAcknowledgedAt: nowIso(),
        slaAcknowledgedByUserId: get().user.id,
      };
    }, set);
  },

  leaveForLocation: async (woId) => {
    await commit(() => {
      const wo = getWO(get(), woId);
      if (
        !wo.vehicle.driverName ||
        !wo.vehicle.vehicleNumber ||
        wo.vehicle.odometerDeparture == null ||
        !wo.slaAcknowledgedAt ||
        !wo.etaLocked
      ) {
        throw new Error(
          "Vehicle details, ETA, and SLA acknowledgment are required before Leave for Location.",
        );
      }
      return { ...wo, woStatus: "En_Route", enRouteAt: nowIso() };
    }, set);
  },

  markAsArrived: async (woId, odometerArrival) => {
    await commit(() => {
      const wo = getWO(get(), woId);
      const travel =
        wo.vehicle.odometerDeparture != null
          ? odometerArrival - wo.vehicle.odometerDeparture
          : undefined;
      return {
        ...wo,
        woStatus: "Service_Started",
        serviceStartedAt: nowIso(),
        vehicle: {
          ...wo.vehicle,
          odometerArrival,
          travelDistance: travel,
        },
      };
    }, set);
  },

  serviceComplete: async (woId) => {
    await commit(() => {
      const wo = getWO(get(), woId);
      if (wo.vehicle.odometerArrival == null) {
        throw new Error("Arrival odometer is required before Service Complete.");
      }
      return {
        ...wo,
        woStatus: "Service_Completed",
        serviceCompletedAt: nowIso(),
      };
    }, set);
  },

  leaveSite: async (woId) => {
    await commit(() => {
      const wo = getWO(get(), woId);
      return { ...wo, woStatus: "Left_Site", leftSiteAt: nowIso() };
    }, set);
  },

  completeJob: async (woId) => {
    await commit(() => {
      const wo = getWO(get(), woId);
      const isResubmit = wo.woStatus === "Rejected";
      return {
        ...wo,
        woStatus: "Completed",
        billingStatus: "Pending_Review",
        completedAt: nowIso(),
        currentRejection: isResubmit ? undefined : wo.currentRejection,
        resubmissionCount: isResubmit
          ? wo.resubmissionCount + 1
          : wo.resubmissionCount,
        resubmitted: isResubmit ? true : wo.resubmitted,
        rejectionHistory: isResubmit
          ? wo.rejectionHistory.map((r, idx) =>
              idx === wo.rejectionHistory.length - 1
                ? {
                    ...r,
                    rejectionResponseNotes: wo.rejectionResponseNotes,
                  }
                : r,
            )
          : wo.rejectionHistory,
        rejectionResponseNotes: isResubmit
          ? undefined
          : wo.rejectionResponseNotes,
      };
    }, set);
  },

  resubmit: async (woId, _responseNotes) => {
    await get().completeJob(woId);
  },

  // ---------------- Detail mutations ----------------

  updateLineItemDetail: async (woId, lineItemId, detail) => {
    await commit(() => {
      const wo = getWO(get(), woId);
      const items = wo.lineItems.map((li) =>
        li.id === lineItemId
          ? { ...li, detail: { ...(li.detail ?? {}), ...detail } }
          : li,
      );
      return { ...wo, lineItems: items };
    }, set);
  },

  setNote: async (woId, field, value) => {
    await commit(() => {
      const wo = getWO(get(), woId);
      return { ...wo, [field]: value } as WorkOrder;
    }, set);
  },

  addPhoto: async (woId, bucket, slotLabel, dataUrl) => {
    const photo: CapturedPhoto = {
      id: uid("ph"),
      slotLabel,
      dataUrl,
      capturedAt: nowIso(),
      uploadStatus: get().online ? "synced" : "queued",
    };
    await commit(() => {
      const wo = getWO(get(), woId);
      const next: WorkOrder = { ...wo };
      next[bucket] = [...wo[bucket], photo];
      return next;
    }, set);
  },

  removePhoto: async (woId, bucket, photoId) => {
    await commit(() => {
      const wo = getWO(get(), woId);
      const next: WorkOrder = { ...wo };
      next[bucket] = wo[bucket].filter((p) => p.id !== photoId);
      return next;
    }, set);
  },

  addDocument: async (woId, bucket, file) => {
    const doc: CapturedDocument = {
      id: uid("doc"),
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: nowIso(),
      uploadStatus: get().online ? "synced" : "queued",
    };
    await commit(() => {
      const wo = getWO(get(), woId);
      const next: WorkOrder = { ...wo };
      next[bucket] = [...wo[bucket], doc];
      return next;
    }, set);
  },

  removeDocument: async (woId, bucket, docId) => {
    await commit(() => {
      const wo = getWO(get(), woId);
      const next: WorkOrder = { ...wo };
      next[bucket] = wo[bucket].filter((d) => d.id !== docId);
      return next;
    }, set);
  },

  setSignature: async (woId, sig) => {
    await commit(() => {
      const wo = getWO(get(), woId);
      if (wo.signature) return wo; // immutable single-capture per SAC-27
      return {
        ...wo,
        signature: {
          ...sig,
          capturedAt: nowIso(),
        },
        customerNotAvailableAt: undefined,
      };
    }, set);
  },

  markCustomerNotAvailable: async (woId) => {
    await commit(() => {
      const wo = getWO(get(), woId);
      return { ...wo, customerNotAvailableAt: nowIso() };
    }, set);
  },

  postComment: async (woId, text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    await commit(() => {
      const wo = getWO(get(), woId);
      const comment: Comment = {
        id: uid("c"),
        authorUserId: get().user.id,
        authorName: get().user.fullName,
        text: trimmed,
        createdAt: nowIso(),
        statusAtCreation: wo.woStatus,
        visibility: "internal",
      };
      return { ...wo, comments: [...wo.comments, comment] };
    }, set);
  },

  // ---------------- Simulated BA actions ----------------

  simulateApproval: async (woId) => {
    await commit(() => {
      const wo = getWO(get(), woId);
      return { ...wo, billingStatus: "Approved" };
    }, set);
    const wo = get().workOrders[woId];
    if (wo)
      await pushNotification(set, {
        title: "Work order approved",
        body: `Billing approved ${wo.number}. Invoice will be generated.`,
        woNumber: wo.number,
      });
  },

  simulateRejection: async (woId, reason, description) => {
    const rejection: RejectionHistoryEntry = {
      id: uid("rej"),
      rejectedByUserId: "ba-001",
      rejectedByName: "Linda Foster",
      rejectedByRole: "Billing Agent",
      rejectedAt: nowIso(),
      reason,
      description,
    };
    await commit(() => {
      const wo = getWO(get(), woId);
      return {
        ...wo,
        woStatus: "Rejected",
        billingStatus: "Rejected",
        currentRejection: rejection,
        rejectionHistory: [...wo.rejectionHistory, rejection],
      };
    }, set);
    const wo = get().workOrders[woId];
    if (wo)
      await pushNotification(set, {
        title: "Work order rejected",
        body: `${wo.number} was rejected by Billing Agent. Tap to review and resubmit.`,
        woNumber: wo.number,
      });
  },

  simulateDispatcherAddItem: async (woId) => {
    const wo = get().workOrders[woId];
    if (!wo) return;
    await commit(() => {
      return {
        ...wo,
        pendingDispatcherUpdate: `Dispatcher added a new line item to ${wo.number}. Refresh to view.`,
      };
    }, set);
    await pushNotification(set, {
      title: "New items on your work order",
      body: `Dispatcher has added 1 new item to ${wo.number}. Refresh to view.`,
      woNumber: wo.number,
    });
  },

  refreshFromDispatcher: async (woId) => {
    await commit(() => {
      const wo = getWO(get(), woId);
      if (!wo.pendingDispatcherUpdate) return wo;
      const newItem: WorkOrder["lineItems"][number] = {
        id: uid("li"),
        serviceCode: "T-REPL",
        description: "Dispatcher-added: additional tire replacement",
        quantity: 1,
        isTire: true,
        axlePosition: "Drive Left Outer",
      };
      return {
        ...wo,
        lineItems: [...wo.lineItems, newItem],
        pendingDispatcherUpdate: undefined,
      };
    }, set);
  },
}));
