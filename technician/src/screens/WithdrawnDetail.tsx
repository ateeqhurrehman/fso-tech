import type { WorkOrder } from "../lib/types";
import { StatusBadge, EmergencyBadge } from "../components/StatusBadge";
import { Section } from "../components/Card";
import { InfoGrid } from "../components/InfoGrid";
import { LineItems } from "../components/LineItems";
import { formatDateTime } from "../lib/time";
import { Ban } from "lucide-react";
import styles from "./WithdrawnDetail.module.css";
import wodStyles from "./WODetail.module.css";

interface Props {
  wo: WorkOrder;
}

export function WithdrawnDetail({ wo }: Props) {
  return (
    <>
      <header className={wodStyles.header}>
        <div className={wodStyles.headTitle}>
          <h1>{wo.number}</h1>
          <div className={styles.customer}>{wo.customerName}</div>
          <div className={wodStyles.headBadges}>
            <StatusBadge status={wo.woStatus} />
            {wo.isEmergency && <EmergencyBadge />}
          </div>
        </div>
        <div className={styles.withdrawCard}>
          <Ban size={18} />
          <div>
            <div className={styles.withdrawLabel}>
              {wo.withdrawnReason ?? "Withdrawn"}
            </div>
            {wo.withdrawnAt && (
              <div className={styles.withdrawTime}>
                {formatDateTime(wo.withdrawnAt)}
              </div>
            )}
          </div>
        </div>
      </header>

      <Section title="Work Order Snapshot">
        <InfoGrid
          items={[
            { label: "Service Location", value: wo.serviceLocation, full: true },
            { label: "Account", value: wo.customerAccountNumber },
            { label: "Problem Type", value: wo.problemType ?? "—" },
          ]}
        />
      </Section>

      <Section title="Captured Data (read-only)">
        <LineItems woId={wo.id} items={wo.lineItems} readOnly />
        <div className={styles.note}>
          All data captured before withdrawal is preserved for audit. No edits
          are possible from here.
        </div>
      </Section>
    </>
  );
}
