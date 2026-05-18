import { useMemo, useState } from "react";
import { ShieldCheck, ChevronDown, ChevronUp, Check } from "lucide-react";
import type { WorkOrder } from "../lib/types";
import { formatDateTime } from "../lib/time";
import styles from "./CustomerSlaCard.module.css";

interface Props {
  wo: WorkOrder;
  acknowledgedAt?: string;
}

export function CustomerSlaCard({ wo, acknowledgedAt }: Props) {
  const sla = wo.sla;
  const [expanded, setExpanded] = useState(false);

  const bullets = useMemo(() => {
    const items: string[] = [];
    items.push(
      sla.poRequired
        ? `PO required — obtain via ${sla.poObtainMethod ?? "Email"}${sla.poContact ? ` (${sla.poContact})` : ""}`
        : "PO not required",
    );
    items.push(`Response SLA: ${sla.responseTimeSlaMinutes} min`);
    items.push(`Completion SLA: ${sla.completionTimeSlaMinutes} min`);
    const preRequired = sla.preServicePhotoSlots.filter((p) => p.required).length;
    const postRequired = sla.postServicePhotoSlots.filter((p) => p.required).length;
    if (preRequired > 0) {
      items.push(`${preRequired} required pre-service photo${preRequired === 1 ? "" : "s"}`);
    }
    if (postRequired > 0) {
      items.push(`${postRequired} required post-service photo${postRequired === 1 ? "" : "s"}`);
    }
    return items;
  }, [sla]);

  const notes = sla.specialHandlingMessages;
  const notesOverflowing = notes.length >= 3;

  return (
    <div className={styles.card}>
      <header className={styles.head}>
        <div className={styles.title}>
          <ShieldCheck size={16} className={styles.titleIcon} />
          <span>Customer SLA</span>
        </div>
        <span className={styles.eligible}>Eligible</span>
      </header>

      {acknowledgedAt && (
        <div className={styles.ackedBadge}>
          <Check size={12} /> Acknowledged at {formatDateTime(acknowledgedAt)}
        </div>
      )}

      <div className={styles.body}>
        <div className={styles.col}>
          <div className={styles.colLabel}>Requirements</div>
          <ul className={styles.list}>
            {bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>

        <div className={styles.col}>
          <div className={styles.colLabel}>SLA Notes</div>
          {notes.length === 0 ? (
            <div className={styles.empty}>No special handling notes.</div>
          ) : (
            <>
              <ul
                className={`${styles.list} ${
                  expanded || !notesOverflowing
                    ? styles.listExpanded
                    : styles.listClamped
                }`}
              >
                {notes.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
              {notesOverflowing && !expanded && (
                <div className={styles.fade} aria-hidden />
              )}
            </>
          )}
        </div>
      </div>

      {notesOverflowing && (
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          {expanded ? (
            <>
              <ChevronUp size={14} /> Show less
            </>
          ) : (
            <>
              <ChevronDown size={14} /> Show more
            </>
          )}
        </button>
      )}
    </div>
  );
}
