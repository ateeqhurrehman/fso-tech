import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Image as ImageIcon, Lock, Send } from "lucide-react";
import type { WorkOrder } from "../lib/types";
import { useStore } from "../lib/store";
import { StatusBadge, EmergencyBadge, ResubmittedBadge } from "../components/StatusBadge";
import { RejectionBanner } from "../components/RejectionBanner";
import { Section } from "../components/Card";
import { PhotoSlots } from "../components/PhotoSlot";
import { DocumentList } from "../components/DocumentList";
import { LineItems } from "../components/LineItems";
import { VehicleDetailsForm } from "../components/VehicleDetailsForm";
import { SignatureCapture } from "../components/SignaturePad";
import { CommentsPanel } from "../components/CommentsPanel";
import { Button } from "../components/Button";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { toast } from "../components/Toast";
import { isImageOnlyEdit, isLockedFully } from "../lib/selectors";
import styles from "./CompletedDetail.module.css";
import wodStyles from "./WODetail.module.css";

interface Props {
  wo: WorkOrder;
}

export function CompletedDetail({ wo }: Props) {
  const navigate = useNavigate();
  const setNote = useStore((s) => s.setNote);
  const addPhoto = useStore((s) => s.addPhoto);
  const removePhoto = useStore((s) => s.removePhoto);
  const addDocument = useStore((s) => s.addDocument);
  const removeDocument = useStore((s) => s.removeDocument);
  const completeJob = useStore((s) => s.completeJob);

  const isRejected = wo.woStatus === "Rejected";
  const imageOnly = isImageOnlyEdit(wo);
  const fullyLocked = isLockedFully(wo);
  const docsReadOnly = !isRejected; // image-only or approved

  const [confirm, setConfirm] = useState(false);

  const handleResubmit = async () => {
    setConfirm(false);
    await completeJob(wo.id);
    toast.success(`${wo.number} resubmitted to billing.`);
  };

  return (
    <>
      <header className={wodStyles.header}>
        <div className={wodStyles.headTitle}>
          <h1>{wo.number}</h1>
          <div className={styles.customer}>{wo.customerName}</div>
          <div className={wodStyles.headBadges}>
            <StatusBadge status={wo.woStatus} />
            {wo.isEmergency && <EmergencyBadge />}
            {wo.resubmitted && <ResubmittedBadge />}
          </div>
        </div>
        <div className={styles.modeStack}>
          {fullyLocked && (
            <div className={`${styles.modeChip} ${styles.fully}`}>
              <Lock size={14} /> Locked — billing approved
            </div>
          )}
          {imageOnly && (
            <div className={`${styles.modeChip} ${styles.image}`}>
              <ImageIcon size={14} /> Photos can still be replaced
            </div>
          )}
          {isRejected && (
            <div className={`${styles.modeChip} ${styles.rejected}`}>
              <Send size={14} /> Fix the issue and resubmit
            </div>
          )}
        </div>
      </header>

      {isRejected && wo.currentRejection && (
        <RejectionBanner
          rejection={wo.currentRejection}
          resubmissionCount={wo.resubmissionCount}
        />
      )}

      <Section
        title={`Photos${imageOnly ? " (editable)" : ""}`}
        description={
          fullyLocked
            ? "Locked — invoice generated against these images."
            : imageOnly
              ? "You can replace photos only — notes/docs/signature are locked until BA acts."
              : "Photos, notes, and documents are editable until you resubmit."
        }
      >
        <h4>Pre-Service</h4>
        <PhotoSlots
          slots={wo.sla.preServicePhotoSlots}
          photos={wo.preServicePhotos}
          readOnly={fullyLocked}
          onAdd={(slotLabel, dataUrl) =>
            addPhoto(wo.id, "preServicePhotos", slotLabel, dataUrl)
          }
          onRemove={(id) => removePhoto(wo.id, "preServicePhotos", id)}
        />
        <h4 style={{ marginTop: 16 }}>Post-Service</h4>
        <PhotoSlots
          slots={wo.sla.postServicePhotoSlots}
          photos={wo.postServicePhotos}
          readOnly={fullyLocked}
          onAdd={(slotLabel, dataUrl) =>
            addPhoto(wo.id, "postServicePhotos", slotLabel, dataUrl)
          }
          onRemove={(id) => removePhoto(wo.id, "postServicePhotos", id)}
        />
      </Section>

      <Section title="Notes">
        <div className={styles.notesGrid}>
          <NoteField
            label="Pre-Service"
            value={wo.preServiceNotes ?? ""}
            readOnly={docsReadOnly}
            onChange={(v) => setNote(wo.id, "preServiceNotes", v)}
          />
          <NoteField
            label="Service"
            value={wo.serviceNotes ?? ""}
            readOnly={docsReadOnly}
            onChange={(v) => setNote(wo.id, "serviceNotes", v)}
          />
          <NoteField
            label="Post-Service"
            value={wo.postServiceNotes ?? ""}
            readOnly={docsReadOnly}
            onChange={(v) => setNote(wo.id, "postServiceNotes", v)}
          />
          <NoteField
            label="Left Site Notes"
            value={wo.leftSiteNotes ?? ""}
            readOnly={docsReadOnly}
            onChange={(v) => setNote(wo.id, "leftSiteNotes", v)}
          />
          {isRejected && (
            <NoteField
              label="Rejection Response Notes"
              value={wo.rejectionResponseNotes ?? ""}
              onChange={(v) => setNote(wo.id, "rejectionResponseNotes", v)}
            />
          )}
        </div>
      </Section>

      <Section title="Documents">
        <h4>Pre-Service</h4>
        <DocumentList
          docs={wo.preServiceDocuments}
          readOnly={docsReadOnly}
          onAdd={(f) => addDocument(wo.id, "preServiceDocuments", f)}
          onRemove={(id) => removeDocument(wo.id, "preServiceDocuments", id)}
        />
        <h4 style={{ marginTop: 16 }}>Post-Service</h4>
        <DocumentList
          docs={wo.postServiceDocuments}
          readOnly={docsReadOnly}
          onAdd={(f) => addDocument(wo.id, "postServiceDocuments", f)}
          onRemove={(id) => removeDocument(wo.id, "postServiceDocuments", id)}
        />
      </Section>

      <Section title="Service Vehicle" description="Locked at Leave for Location.">
        <VehicleDetailsForm value={wo.vehicle} readOnly onChange={() => {}} />
      </Section>

      <Section title="Services Performed" description="Read-only — line items managed by dispatcher.">
        <LineItems woId={wo.id} items={wo.lineItems} readOnly />
      </Section>

      <Section title="Customer Signature">
        <SignatureCapture
          signature={wo.signature}
          customerNotAvailableAt={wo.customerNotAvailableAt}
          readOnly
          onCapture={() => {}}
          onCustomerNotAvailable={() => {}}
        />
      </Section>

      <CommentsPanel wo={wo} readOnly={!isRejected} />

      {isRejected && (
        <div className={styles.bar}>
          <div className={styles.hint}>
            Address the rejection above, then tap Resubmit. The BA will see a
            Resubmitted badge.
          </div>
          <div className={styles.btns}>
            <Button size="lg" variant="secondary" onClick={() => navigate("/")}>
              Back
            </Button>
            <Button
              size="xl"
              variant="primary"
              leftIcon={<Send size={20} />}
              onClick={() => setConfirm(true)}
            >
              Resubmit (Complete Job)
            </Button>
          </div>
        </div>
      )}

      {fullyLocked && (
        <div className={`${styles.bar} ${styles.locked}`}>
          <CheckCircle2 size={20} className={styles.lockedIcon} />
          <span>
            Approved by billing — no further edits permitted (Gap A). To make
            a correction, the BA must reject the work order.
          </span>
        </div>
      )}

      <ConfirmDialog
        open={confirm}
        title="Resubmit to billing?"
        description="Your response notes will be paired with the BA's rejection reason in the audit history."
        confirmLabel="Yes, Resubmit"
        onCancel={() => setConfirm(false)}
        onConfirm={handleResubmit}
      />

    </>
  );
}

function NoteField({
  label,
  value,
  readOnly,
  onChange,
}: {
  label: string;
  value: string;
  readOnly?: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <label className={styles.noteField}>
      <span className={styles.noteLabel}>{label}</span>
      <textarea
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        placeholder={readOnly ? "(empty)" : "Add notes…"}
      />
    </label>
  );
}
