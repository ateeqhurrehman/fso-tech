// Domain types for MTS FSO Technician v3.5
// Mirrors USER-STORIES-MTS-FSO-v3_5-TECH.md

export type WOStatus =
  | "Assigned"
  | "Reassigned"
  | "Accepted"
  | "En_Route"
  | "Service_Started"
  | "Service_Completed"
  | "Left_Site"
  | "Completed"
  | "Rejected"
  | "Cancelled"
  | "Reassigned_From";

export type BillingStatus = "Pending_Review" | "Approved" | "Rejected" | null;

export type AxlePosition =
  | "Steer Left"
  | "Steer Right"
  | "Drive Left Inner"
  | "Drive Left Outer"
  | "Drive Right Inner"
  | "Drive Right Outer"
  | "Trailer Axle 1 Inner"
  | "Trailer Axle 1 Outer"
  | "Trailer Axle 2 Inner"
  | "Trailer Axle 2 Outer"
  | "Trailer Axle 3 Inner"
  | "Trailer Axle 3 Outer";

export interface PhotoSlot {
  label: string;
  description?: string;
  required: boolean;
}

export interface SLASnapshot {
  poRequired: boolean;
  poObtainMethod?: "Fax" | "Email" | null;
  poContact?: string;
  preServicePhotoSlots: PhotoSlot[];
  postServicePhotoSlots: PhotoSlot[];
  responseTimeSlaMinutes: number;
  completionTimeSlaMinutes: number;
  specialHandlingMessages: string[]; // sourced from AS400 customer record
  otherFields?: { label: string; value: string }[];
}

export interface TirePreference {
  axle: "Drive" | "Steer" | "Trailer";
  preferredSpec: string; // e.g. "Bridgestone R268"
}

export interface VehicleDetails {
  driverName?: string;
  vehicleNumber?: string;
  odometerDeparture?: number;
  odometerArrival?: number;
  travelDistance?: number; // computed
}

export interface LineItemDetail {
  conditionNotes?: string;
  workPerformed?: string;
  dotOff?: string;
  dotOn?: string;
  tireSize?: string;
  tireBrand?: string;
  treadDepth?: string;
  comments?: string;
}

export interface LineItem {
  id: string;
  serviceCode: string;
  description: string;
  quantity: number;
  dispatcherNotes?: string;
  isTire: boolean;
  axlePosition?: AxlePosition; // dispatcher-set, read-only to tech
  detail?: LineItemDetail;
}

export interface CapturedPhoto {
  id: string;
  slotLabel: string;
  dataUrl: string; // base64 (demo only; real impl would use Blob + S3)
  capturedAt: string;
  gpsLat?: number;
  gpsLon?: number;
  uploadStatus: "synced" | "queued" | "uploading" | "failed";
}

export interface CapturedDocument {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  uploadStatus: "synced" | "queued" | "uploading" | "failed";
}

export interface Signature {
  imageDataUrl: string;
  signerName: string;
  capturedAt: string;
  gpsLat?: number;
  gpsLon?: number;
}

export interface RejectionHistoryEntry {
  id: string;
  rejectedByUserId: string;
  rejectedByName: string;
  rejectedByRole: "Billing Agent" | "Manager";
  rejectedAt: string;
  reason: string;
  description: string;
  rejectionResponseNotes?: string; // tech's response, populated on resubmit (Gap K)
}

export interface Comment {
  id: string;
  authorUserId: string;
  authorName: string;
  text: string;
  createdAt: string;
  statusAtCreation: WOStatus;
  visibility: "internal" | "customer_facing"; // hardcoded internal in v1
  pendingSync?: boolean;
}

export interface WorkOrder {
  // Identity
  id: string;
  number: string; // WO-XXXXX
  customerName: string;
  customerAccountNumber: string;
  customerContact?: string;
  serviceLocation: string;
  driverName?: string;
  driverPhone?: string;
  tractorNumber?: string;
  trailerNumber?: string;
  problemType?: string;
  unitNumber?: string;
  isEmergency: boolean;
  scheduledTime?: string;

  // Service target — exclusive (a WO services either the tractor or the
  // trailer, not both). When absent, both identifiers may render (legacy).
  serviceTarget?: "tractor" | "trailer";

  // Dispatcher-filled, read-only to technician
  breakdownLocationNotes?: string;
  dispatcherServiceNotes?: string;

  // Dispatcher-set
  tirePreferences?: TirePreference[];
  specialHandlingInstructions?: string;
  lineItems: LineItem[];
  sla: SLASnapshot;

  // Status (dual-field model, v3.5)
  woStatus: WOStatus;
  billingStatus: BillingStatus;

  // Timestamps (locked at all states)
  assignedAt: string;
  acceptedAt?: string;
  enRouteAt?: string;
  serviceStartedAt?: string;
  serviceCompletedAt?: string;
  leftSiteAt?: string;
  completedAt?: string;
  withdrawnAt?: string;
  withdrawnReason?: "Cancelled" | "Reassigned";

  // ETA (locked at Accept Job per Lee F1)
  etaMinutes?: number;
  etaCommittedAt?: string;
  expectedArrivalAt?: string;
  etaLocked: boolean;

  // SLA acknowledgment
  slaAcknowledgedAt?: string;
  slaAcknowledgedByUserId?: string;

  // Vehicle details (snapshot-at-departure, locked)
  vehicle: VehicleDetails;

  // Notes (per-status narrative)
  preServiceNotes?: string;
  serviceNotes?: string;
  postServiceNotes?: string;
  leftSiteNotes?: string;
  rejectionResponseNotes?: string;

  // Captured evidence
  preServicePhotos: CapturedPhoto[];
  postServicePhotos: CapturedPhoto[];
  preServiceDocuments: CapturedDocument[];
  postServiceDocuments: CapturedDocument[];

  // Customer signature (single-capture immutable per SAC-27)
  signature?: Signature;
  customerNotAvailableAt?: string;

  // Rejection / resubmission state
  currentRejection?: RejectionHistoryEntry; // most recent (mirrored from history.last)
  rejectionHistory: RejectionHistoryEntry[];
  resubmissionCount: number;
  resubmitted: boolean;

  // Comments (latest-only displayed per Gap G; history preserved)
  comments: Comment[]; // append-only

  // Notifications waiting for tech (e.g. dispatcher added line items)
  pendingDispatcherUpdate?: string; // notification message
}

export interface TechUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  role: "Technician";
  memberSince: string;
}

export interface AppState {
  user: TechUser;
  workOrders: Record<string, WorkOrder>;
  online: boolean;
  darkMode: boolean;
  notificationsEnabled: boolean;
  notifications: AppNotification[];
}

export interface AppNotification {
  id: string;
  woNumber?: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export type CompletedFilter =
  | "this_week"
  | "last_week"
  | "this_month"
  | "last_month"
  | "custom";
