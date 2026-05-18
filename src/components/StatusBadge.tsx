import type { WOStatus } from "../lib/types";
import styles from "./StatusBadge.module.css";

interface Props {
  status: WOStatus;
}

const LABELS: Record<WOStatus, string> = {
  Assigned: "Assigned",
  Reassigned: "Reassigned",
  Accepted: "Accepted",
  En_Route: "En Route",
  Service_Started: "Service Started",
  Service_Completed: "Service Completed",
  Left_Site: "Left Site",
  Completed: "Completed",
  Rejected: "Rejected",
  Cancelled: "Cancelled",
  Reassigned_From: "Reassigned Away",
};

const VARIANTS: Record<WOStatus, string> = {
  Assigned: "info",
  Reassigned: "info",
  Accepted: "live",
  En_Route: "live",
  Service_Started: "live",
  Service_Completed: "live",
  Left_Site: "warn",
  Completed: "ok",
  Rejected: "rejected",
  Cancelled: "muted",
  Reassigned_From: "muted",
};

export function StatusBadge({ status }: Props) {
  return (
    <span className={`${styles.badge} ${styles[VARIANTS[status]]}`}>
      {LABELS[status]}
    </span>
  );
}

export function EmergencyBadge() {
  return <span className={`${styles.badge} ${styles.emergency}`}>EMERGENCY</span>;
}

export function ResubmittedBadge() {
  return <span className={`${styles.badge} ${styles.resub}`}>RESUBMITTED</span>;
}
