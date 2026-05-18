import { AlertTriangle } from "lucide-react";
import type { RejectionHistoryEntry } from "../lib/types";
import { formatDateTime } from "../lib/time";
import styles from "./RejectionBanner.module.css";

interface Props {
  rejection: RejectionHistoryEntry;
  resubmissionCount?: number;
}

export function RejectionBanner({ rejection, resubmissionCount }: Props) {
  const cycleNum = (resubmissionCount ?? 0) + 1;
  const repeatedCycle = cycleNum >= 3;
  return (
    <div className={styles.banner} role="alert">
      <AlertTriangle size={20} className={styles.icon} />
      <div className={styles.body}>
        <div className={styles.head}>
          Rejected by {rejection.rejectedByRole} {rejection.rejectedByName} ·{" "}
          {formatDateTime(rejection.rejectedAt)}
          {resubmissionCount != null && resubmissionCount > 0 && (
            <span className={styles.cycle}>Cycle #{cycleNum}</span>
          )}
        </div>
        <div className={styles.reason}>
          <strong>{rejection.reason}</strong> — {rejection.description}
        </div>
        {repeatedCycle && (
          <div className={styles.escalate}>
            ⚠ This work order has been rejected {resubmissionCount} times.
            Consider calling your manager before resubmitting again.
          </div>
        )}
        <div className={styles.hint}>
          Use Review to fix and resubmit. Photos, notes, and documents are
          editable; line items and timestamps stay locked.
        </div>
      </div>
    </div>
  );
}
