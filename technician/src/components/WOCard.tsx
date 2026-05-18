import { useNavigate } from "react-router-dom";
import { ChevronRight, MapPin, Truck, AlertCircle } from "lucide-react";
import type { WorkOrder } from "../lib/types";
import { EmergencyBadge, ResubmittedBadge, StatusBadge } from "./StatusBadge";
import { formatDateTime, formatRelative } from "../lib/time";
import styles from "./WOCard.module.css";

interface Props {
  wo: WorkOrder;
  context?: "live" | "upcoming" | "completed" | "withdrawn";
  highlight?: boolean;
}

export function WOCard({ wo, context = "upcoming", highlight }: Props) {
  const navigate = useNavigate();
  const rejected = wo.woStatus === "Rejected";
  return (
    <button
      className={`${styles.card} ${highlight ? styles.cardHighlight : ""}`}
      data-wo-id={wo.id}
      onClick={() => navigate(`/wo/${wo.id}`)}
    >
      <div className={styles.top}>
        <div className={styles.titleBlock}>
          <div className={styles.number}>{wo.number}</div>
          <div className={styles.customer}>{wo.customerName}</div>
        </div>
        <div className={styles.flags}>
          {wo.isEmergency && <EmergencyBadge />}
          <StatusBadge status={wo.woStatus} />
          {wo.resubmitted && <ResubmittedBadge />}
        </div>
      </div>

      <div className={styles.meta}>
        <div className={styles.metaRow}>
          <MapPin size={13} aria-hidden />
          <span>{wo.serviceLocation}</span>
        </div>
        {(() => {
          const showTractor =
            wo.serviceTarget !== "trailer" && Boolean(wo.tractorNumber);
          const showTrailer =
            wo.serviceTarget !== "tractor" && Boolean(wo.trailerNumber);
          if (!showTractor && !showTrailer) return null;
          return (
            <div className={styles.metaRow}>
              <Truck size={13} aria-hidden />
              <span>
                {showTractor ? `Tractor ${wo.tractorNumber}` : ""}
                {showTractor && showTrailer ? " · " : ""}
                {showTrailer ? `Trailer ${wo.trailerNumber}` : ""}
              </span>
            </div>
          );
        })()}
        {wo.problemType && (
          <div className={styles.metaRow}>
            <AlertCircle size={13} aria-hidden />
            <span>{wo.problemType}</span>
          </div>
        )}
      </div>

      {rejected && wo.currentRejection && (
        <div className={styles.rejection}>
          <strong>Rejected by {wo.currentRejection.rejectedByRole}</strong>{" "}
          {wo.currentRejection.reason}
        </div>
      )}

      <div className={styles.bottom}>
        <span className={styles.timing}>
          {context === "upcoming" &&
            (wo.scheduledTime
              ? `Scheduled ${formatDateTime(wo.scheduledTime)}`
              : "Awaiting acceptance")}
          {context === "live" &&
            wo.acceptedAt &&
            `Accepted ${formatRelative(wo.acceptedAt)}`}
          {context === "completed" &&
            (wo.completedAt
              ? `Completed ${formatRelative(wo.completedAt)}`
              : wo.leftSiteAt
                ? `Left site ${formatRelative(wo.leftSiteAt)}`
                : "")}
          {context === "withdrawn" &&
            wo.withdrawnAt &&
            `Withdrawn ${formatRelative(wo.withdrawnAt)}`}
        </span>
        <ChevronRight size={16} className={styles.chev} />
      </div>
    </button>
  );
}
