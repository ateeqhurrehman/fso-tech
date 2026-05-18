// SLA pressure chip — shows elapsed time on job + remaining time vs the
// customer's contractual completion SLA. Color graduates green → amber → red as
// the job approaches and exceeds the SLA target. Directly attacks the
// Bridgestone rejection driver (techs blowing SLA without realizing it).

import { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import type { WorkOrder } from "../lib/types";
import styles from "./SLATimer.module.css";

interface Props {
  wo: WorkOrder;
  variant?: "chip" | "block";
}

export function SLATimer({ wo, variant = "chip" }: Props) {
  const [, force] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => force((v) => v + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  if (!wo.acceptedAt) return null;

  const acceptedMs = new Date(wo.acceptedAt).getTime();
  const elapsedMin = Math.floor((Date.now() - acceptedMs) / 60_000);
  const slaTarget = wo.sla.completionTimeSlaMinutes;
  const remaining = slaTarget - elapsedMin;
  const pctUsed = elapsedMin / slaTarget;

  const tone =
    remaining < 0 ? "red" : pctUsed > 0.75 ? "amber" : "green";

  const elapsedLabel = formatMinutes(elapsedMin);
  const remainingLabel =
    remaining >= 0
      ? `${formatMinutes(remaining)} to SLA`
      : `${formatMinutes(-remaining)} past SLA`;

  if (variant === "chip") {
    return (
      <div className={`${styles.chip} ${styles[tone]}`}>
        {remaining < 0 ? <AlertTriangle size={13} /> : <Clock size={13} />}
        <span className={styles.elapsed}>{elapsedLabel} on site</span>
        <span className={styles.dot} />
        <span>{remainingLabel}</span>
      </div>
    );
  }

  return (
    <div className={`${styles.block} ${styles[tone]}`}>
      <div className={styles.blockHead}>
        {remaining < 0 ? <AlertTriangle size={14} /> : <Clock size={14} />}
        <span>SLA Tracking</span>
      </div>
      <div className={styles.blockRow}>
        <div>
          <div className={styles.blockLabel}>On site</div>
          <div className={styles.blockValue}>{elapsedLabel}</div>
        </div>
        <div className={styles.bar}>
          <div
            className={styles.barFill}
            style={{ width: `${Math.min(pctUsed * 100, 100)}%` }}
          />
        </div>
        <div className={styles.blockRight}>
          <div className={styles.blockLabel}>
            {remaining >= 0 ? "Remaining" : "Past SLA"}
          </div>
          <div className={styles.blockValue}>{formatMinutes(Math.abs(remaining))}</div>
        </div>
      </div>
    </div>
  );
}

function formatMinutes(m: number): string {
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r === 0 ? `${h}h` : `${h}h ${r}m`;
}
