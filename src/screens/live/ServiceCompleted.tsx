import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, LogOut, Save } from "lucide-react";
import type { WorkOrder } from "../../lib/types";
import { useStore } from "../../lib/store";
import { Section } from "../../components/Card";
import { PhotoSlots } from "../../components/PhotoSlot";
import { DocumentList } from "../../components/DocumentList";
import { SignatureCapture } from "../../components/SignaturePad";
import { CommentsPanel } from "../../components/CommentsPanel";
import { Button } from "../../components/Button";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { ProgressChips, type Chip } from "../../components/ProgressChips";
import { EquipmentStrip } from "../../components/EquipmentStrip";
import { CustomerSlaCard } from "../../components/CustomerSlaCard";
import { DispatchHelp } from "../../components/DispatchHelp";
import { toast } from "../../components/Toast";
import { formatDateTime } from "../../lib/time";
import styles from "./ServiceCompleted.module.css";

interface Props {
  wo: WorkOrder;
}

export function ServiceCompletedScreen({ wo }: Props) {
  const navigate = useNavigate();
  const setNote = useStore((s) => s.setNote);
  const addPhoto = useStore((s) => s.addPhoto);
  const removePhoto = useStore((s) => s.removePhoto);
  const addDocument = useStore((s) => s.addDocument);
  const removeDocument = useStore((s) => s.removeDocument);
  const setSignature = useStore((s) => s.setSignature);
  const markCNA = useStore((s) => s.markCustomerNotAvailable);
  const leaveSite = useStore((s) => s.leaveSite);

  const [confirm, setConfirm] = useState(false);
  const [softWarn, setSoftWarn] = useState(false);

  const saveDraft = () => {
    toast.success("Draft saved. Pick up where you left off from My Jobs.");
    navigate("/my-jobs/live");
  };

  const requiredPost = wo.sla.postServicePhotoSlots.filter((s) => s.required);
  const postCaptured = requiredPost.filter((slot) =>
    wo.postServicePhotos.some((p) => p.slotLabel === slot.label),
  );
  const requiredMissing = requiredPost
    .filter((slot) => !wo.postServicePhotos.some((p) => p.slotLabel === slot.label))
    .map((s) => s.label);

  const hasSignature = !!wo.signature || !!wo.customerNotAvailableAt;

  const chips: Chip[] = [
    {
      label: "Customer signature",
      state: wo.signature
        ? "done"
        : wo.customerNotAvailableAt
          ? "optional"
          : "missing",
      required: !wo.customerNotAvailableAt,
      hint: wo.signature
        ? "Captured"
        : wo.customerNotAvailableAt
          ? "Customer not available"
          : "Capture before leaving",
    },
    {
      label: "Post-service photos",
      state:
        requiredPost.length === 0
          ? "optional"
          : postCaptured.length === requiredPost.length
            ? "done"
            : "missing",
      required: requiredPost.length > 0,
      hint:
        requiredPost.length > 0
          ? `${postCaptured.length}/${requiredPost.length}`
          : "Optional",
    },
    {
      label: "Post-service notes",
      state: wo.postServiceNotes?.trim() ? "done" : "optional",
    },
  ];

  const attemptLeave = () => {
    if (!hasSignature) {
      setSoftWarn(true);
      return;
    }
    setConfirm(true);
  };

  const doLeave = async () => {
    setConfirm(false);
    setSoftWarn(false);
    await leaveSite(wo.id);
    toast.success(
      `Left site. ${wo.number} is now in your Completed section — tap Review when you're ready.`,
    );
    navigate(`/my-jobs/completed?wo=${wo.id}`);
  };

  return (
    <>
      <ProgressChips title="Before you leave site" chips={chips} />

      <EquipmentStrip wo={wo} />

      <CustomerSlaCard wo={wo} acknowledgedAt={wo.slaAcknowledgedAt} />

      {/* Signature first — highest-stakes capture (Richa CR-6, single-shot
          immutable, irrecoverable once you've left site). */}
      <Section
        title="Customer Signature"
        description="Captured once and immutable. Must be captured before you leave the site (Richa CR-6)."
      >
        <SignatureCapture
          signature={wo.signature}
          customerNotAvailableAt={wo.customerNotAvailableAt}
          onCapture={(sig) => setSignature(wo.id, sig)}
          onCustomerNotAvailable={() => markCNA(wo.id)}
        />
      </Section>

      <Section
        title="Post-Service Photos"
        description="Capture the completed work. Required slots are flagged."
      >
        <PhotoSlots
          slots={wo.sla.postServicePhotoSlots}
          photos={wo.postServicePhotos}
          onAdd={(slotLabel, dataUrl) =>
            addPhoto(wo.id, "postServicePhotos", slotLabel, dataUrl)
          }
          onRemove={(id) => removePhoto(wo.id, "postServicePhotos", id)}
        />
        {requiredMissing.length > 0 && (
          <div className={styles.softWarn}>
            ⚠ Missing required photo(s): {requiredMissing.join(", ")}.
            You can still proceed — soft warning only.
          </div>
        )}
      </Section>

      <Section title="Post-Service Notes">
        <textarea
          placeholder="e.g. All four tires replaced and torqued to 450 ft-lbs. Customer advised rear alignment may be needed."
          value={wo.postServiceNotes ?? ""}
          onChange={(e) => setNote(wo.id, "postServiceNotes", e.target.value)}
        />
      </Section>

      <Section
        title="Post-Service Documents"
        description="Optional — completion certificates, inspection forms, etc."
      >
        <DocumentList
          docs={wo.postServiceDocuments}
          onAdd={(f) => addDocument(wo.id, "postServiceDocuments", f)}
          onRemove={(id) => removeDocument(wo.id, "postServiceDocuments", id)}
        />
      </Section>

      <Section
        title="Pre-Service Evidence (for reference)"
        description="Read-only — captured at Service Started."
      >
        {wo.preServicePhotos.length === 0 ? (
          <div className={styles.empty}>No pre-service photos captured.</div>
        ) : (
          <div className={styles.preGrid}>
            {wo.preServicePhotos.map((p) => (
              <div key={p.id} className={styles.preCell}>
                <img src={p.dataUrl} alt={p.slotLabel} />
                <div className={styles.preLabel}>{p.slotLabel}</div>
                <div className={styles.preTime}>
                  {formatDateTime(p.capturedAt)}
                </div>
              </div>
            ))}
          </div>
        )}
        {wo.preServiceNotes && (
          <div className={styles.preNote}>
            <strong>Pre-service notes:</strong> {wo.preServiceNotes}
          </div>
        )}
      </Section>

      <CommentsPanel wo={wo} />

      <DispatchHelp hint="Customer disputing work, missing parts, signature won't capture — dispatch can help before you leave." />

      <div className={styles.bar}>
        <div className={styles.hint}>
          {hasSignature
            ? "Ready to leave site — you'll review and complete from the Completed section."
            : "Capture customer signature OR tap 'Customer Not Available' before leaving (soft block)."}
        </div>
        <div className={styles.actions}>
          <Button
            size="lg"
            variant="secondary"
            onClick={saveDraft}
            leftIcon={<Save size={18} />}
          >
            Save Draft
          </Button>
          <Button
            size="xl"
            variant="primary"
            onClick={attemptLeave}
            leftIcon={<LogOut size={20} />}
          >
            Leave Site
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={softWarn}
        title="Customer signature is missing"
        description={
          <>
            You haven't captured a signature or marked "Customer Not Available."
            This is unusual — the billing agent will see a missing-signature
            flag. You can dismiss and proceed, or go back and capture.
          </>
        }
        confirmLabel="Proceed Anyway"
        cancelLabel="Go Back"
        onCancel={() => setSoftWarn(false)}
        onConfirm={() => {
          setSoftWarn(false);
          setConfirm(true);
        }}
      />

      <ConfirmDialog
        open={confirm}
        title="Leave the site?"
        description="Confirm you've completed all on-site work and are ready to depart. The work order will move to your Completed section."
        confirmLabel="Yes, Leave Site"
        onCancel={() => setConfirm(false)}
        onConfirm={doLeave}
      />

      <a
        className={styles.helpLink}
        href="https://maps.google.com"
        target="_blank"
        rel="noreferrer"
      >
        Need directions to next stop? <ExternalLink size={14} />
      </a>
    </>
  );
}
