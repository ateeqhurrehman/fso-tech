import { Check, Clock, FileCheck, Image as ImageIcon, ShieldAlert } from "lucide-react";
import type { SLASnapshot } from "../lib/types";
import styles from "./SLASection.module.css";

interface Props {
  sla: SLASnapshot;
  acknowledged?: boolean;
  onAcknowledge?: () => void;
  readOnly?: boolean;
}

export function SLASection({ sla, acknowledged, onAcknowledge, readOnly }: Props) {
  return (
    <div className={styles.sla}>
      <header className={styles.head}>
        <div>
          <h3>Customer SLA</h3>
          <p className={styles.sub}>
            Contractual requirements for this work order — sourced from the
            customer record. Read before tapping Leave for Location.
          </p>
        </div>
      </header>

      <div className={styles.grid}>
        <div className={styles.cell}>
          <div className={styles.cellHead}>
            <FileCheck size={16} />
            <span>PO Required</span>
          </div>
          <div className={styles.cellValue}>
            {sla.poRequired ? `Yes — via ${sla.poObtainMethod ?? "Email"}` : "No"}
          </div>
          {sla.poRequired && sla.poContact && (
            <div className={styles.cellSub}>Contact: {sla.poContact}</div>
          )}
        </div>

        <div className={styles.cell}>
          <div className={styles.cellHead}>
            <Clock size={16} />
            <span>Response Time SLA</span>
          </div>
          <div className={styles.cellValue}>{sla.responseTimeSlaMinutes} min</div>
        </div>

        <div className={styles.cell}>
          <div className={styles.cellHead}>
            <Clock size={16} />
            <span>Completion Time SLA</span>
          </div>
          <div className={styles.cellValue}>{sla.completionTimeSlaMinutes} min</div>
        </div>

        <div className={styles.cell}>
          <div className={styles.cellHead}>
            <ImageIcon size={16} />
            <span>Required Pre-Service Photos</span>
          </div>
          <ul className={styles.list}>
            {sla.preServicePhotoSlots
              .filter((p) => p.required)
              .map((p) => (
                <li key={p.label}>{p.label}</li>
              ))}
            {sla.preServicePhotoSlots.filter((p) => p.required).length === 0 && (
              <li className={styles.muted}>None required</li>
            )}
          </ul>
        </div>

        <div className={styles.cell}>
          <div className={styles.cellHead}>
            <ImageIcon size={16} />
            <span>Required Post-Service Photos</span>
          </div>
          <ul className={styles.list}>
            {sla.postServicePhotoSlots
              .filter((p) => p.required)
              .map((p) => (
                <li key={p.label}>{p.label}</li>
              ))}
            {sla.postServicePhotoSlots.filter((p) => p.required).length === 0 && (
              <li className={styles.muted}>None required</li>
            )}
          </ul>
        </div>
      </div>

      {sla.specialHandlingMessages.length > 0 && (
        <div className={styles.special}>
          <div className={styles.specialHead}>
            <ShieldAlert size={16} />
            <span>Special Handling (AS400)</span>
          </div>
          <ul className={styles.specialList}>
            {sla.specialHandlingMessages.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      {!readOnly && (
        <div className={styles.ackBox}>
          <button
            className={`${styles.ack} ${acknowledged ? styles.acked : ""}`}
            onClick={() => onAcknowledge?.()}
            disabled={acknowledged}
            aria-pressed={acknowledged}
          >
            <span className={styles.box}>{acknowledged && <Check size={18} />}</span>
            <span>
              I have read and understood the SLA.{" "}
              {acknowledged && (
                <span className={styles.ackedLabel}>Acknowledged.</span>
              )}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
