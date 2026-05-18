// Derived selectors for the four home-screen sections.

import type { WorkOrder, WOStatus } from "./types";

const LIVE: WOStatus[] = [
  "Accepted",
  "En_Route",
  "Service_Started",
  "Service_Completed",
];
const UPCOMING: WOStatus[] = ["Assigned", "Reassigned"];
const COMPLETED: WOStatus[] = ["Left_Site", "Completed", "Rejected"];
const WITHDRAWN: WOStatus[] = ["Cancelled", "Reassigned_From"];

function sortBy<T>(arr: T[], key: (t: T) => string | number, dir: "asc" | "desc" = "asc"): T[] {
  return [...arr].sort((a, b) => {
    const av = key(a);
    const bv = key(b);
    if (av < bv) return dir === "asc" ? -1 : 1;
    if (av > bv) return dir === "asc" ? 1 : -1;
    return 0;
  });
}

export function selectLive(wos: Record<string, WorkOrder>): WorkOrder | undefined {
  const all = Object.values(wos).filter((w) => LIVE.includes(w.woStatus));
  return sortBy(all, (w) => w.acceptedAt ?? w.assignedAt)[0];
}

export function selectUpcoming(wos: Record<string, WorkOrder>): WorkOrder[] {
  const all = Object.values(wos).filter((w) => UPCOMING.includes(w.woStatus));
  return sortBy(all, (w) => `${w.isEmergency ? "0" : "1"}-${w.scheduledTime ?? w.assignedAt}`);
}

export function selectCompleted(wos: Record<string, WorkOrder>): WorkOrder[] {
  const all = Object.values(wos).filter((w) => COMPLETED.includes(w.woStatus));
  return sortBy(
    all,
    (w) => w.leftSiteAt ?? w.completedAt ?? w.assignedAt,
    "desc",
  );
}

export function selectWithdrawn(wos: Record<string, WorkOrder>): WorkOrder[] {
  const all = Object.values(wos).filter((w) => WITHDRAWN.includes(w.woStatus));
  return sortBy(all, (w) => w.withdrawnAt ?? w.assignedAt, "desc");
}

export function isLockedFully(wo: WorkOrder): boolean {
  return wo.woStatus === "Completed" && wo.billingStatus === "Approved";
}

export function isImageOnlyEdit(wo: WorkOrder): boolean {
  return wo.woStatus === "Completed" && wo.billingStatus === "Pending_Review";
}
