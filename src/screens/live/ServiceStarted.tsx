import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardCheck, Save } from "lucide-react";
import type { WorkOrder } from "../../lib/types";
import { useStore } from "../../lib/store";
import { Section } from "../../components/Card";
import { LineItems } from "../../components/LineItems";
import { PhotoSlots } from "../../components/PhotoSlot";
import { DocumentList } from "../../components/DocumentList";
import { CommentsPanel } from "../../components/CommentsPanel";
import { Button } from "../../components/Button";
import { InfoGrid } from "../../components/InfoGrid";
import { EquipmentStrip } from "../../components/EquipmentStrip";
import { CustomerSlaCard } from "../../components/CustomerSlaCard";
import { DispatchHelp } from "../../components/DispatchHelp";
import { toast } from "../../components/Toast";
import styles from "./ServiceStarted.module.css";

interface Props {
  wo: WorkOrder;
}

export function ServiceStarted({ wo }: Props) {
  const navigate = useNavigate();
  const setNote = useStore((s) => s.setNote);
  const addPhoto = useStore((s) => s.addPhoto);
  const removePhoto = useStore((s) => s.removePhoto);
  const addDocument = useStore((s) => s.addDocument);
  const removeDocument = useStore((s) => s.removeDocument);
  const serviceComplete = useStore((s) => s.serviceComplete);

  const [completing, setCompleting] = useState(false);

  const saveDraft = () => {
    toast.success("Draft saved. Pick up where you left off from My Jobs.");
    navigate("/my-jobs/live");
  };

  const requiredPre = wo.sla.preServicePhotoSlots.filter((s) => s.required);
  const requiredMissing = requiredPre
    .filter((slot) => !wo.preServicePhotos.some((p) => p.slotLabel === slot.label))
    .map((s) => s.label);

  const handleComplete = async () => {
    if (wo.vehicle.odometerArrival == null) {
      toast.error("Arrival odometer is required before Service Complete.");
      return;
    }
    setCompleting(true);
    try {
      await serviceComplete(wo.id);
      if (requiredMissing.length > 0) {
        toast.warn(
          `Service complete. Missing ${requiredMissing.length} required photo(s) — flag visible to BA.`,
        );
      } else {
        toast.success(
          "Service complete. Capture post-service evidence and customer signature next.",
        );
      }
    } finally {
      setCompleting(false);
    }
  };

  return (
    <>
      <EquipmentStrip wo={wo} />

      <CustomerSlaCard wo={wo} />

      <Section
        title="Arrival"
        description="Travel distance is calculated from your departure and arrival odometers."
      >
        <InfoGrid
          items={[
            {
              label: "Departure Odometer",
              value:
                wo.vehicle.odometerDeparture != null
                  ? `${wo.vehicle.odometerDeparture.toLocaleString()} mi`
                  : "—",
            },
            {
              label: "Arrival Odometer",
              value:
                wo.vehicle.odometerArrival != null
                  ? `${wo.vehicle.odometerArrival.toLocaleString()} mi`
                  : "—",
            },
            {
              label: "Travel Distance",
              value:
                wo.vehicle.travelDistance != null
                  ? `${wo.vehicle.travelDistance} mi`
                  : "—",
            },
          ]}
        />
      </Section>

      <Section
        title="Dispatcher Service Notes"
        description="Read-only — notes attached by your dispatcher when the WO was created."
      >
        {wo.dispatcherServiceNotes ? (
          <div className={styles.dispatcherNotesCard}>
            {wo.dispatcherServiceNotes}
          </div>
        ) : (
          <div className={styles.dispatcherNotesEmpty}>
            No notes from dispatcher.
          </div>
        )}
      </Section>

      <Section
        title="Pre-Service Photos"
        description="Capture the condition you found on arrival. Required slots are flagged."
      >
        <PhotoSlots
          slots={wo.sla.preServicePhotoSlots}
          photos={wo.preServicePhotos}
          onAdd={(slotLabel, dataUrl) =>
            addPhoto(wo.id, "preServicePhotos", slotLabel, dataUrl)
          }
          onRemove={(id) => removePhoto(wo.id, "preServicePhotos", id)}
        />
        {requiredMissing.length > 0 && (
          <div className={styles.softWarn}>
            ⚠ Missing required photo(s): {requiredMissing.join(", ")}. You can
            still proceed — this is a soft warning, not a block.
          </div>
        )}
      </Section>

      <Section
        title="Pre-Service Notes"
        description="Free-text description of what you found on arrival."
      >
        <textarea
          placeholder="e.g. Vehicle parked on soft shoulder, front steer tire completely flat, sidewall damage visible."
          value={wo.preServiceNotes ?? ""}
          onChange={(e) => setNote(wo.id, "preServiceNotes", e.target.value)}
        />
      </Section>

      <Section
        title="Pre-Service Documents"
        description="Optional — inspection reports, scanned forms, etc."
      >
        <DocumentList
          docs={wo.preServiceDocuments}
          onAdd={(f) => addDocument(wo.id, "preServiceDocuments", f)}
          onRemove={(id) => removeDocument(wo.id, "preServiceDocuments", id)}
        />
      </Section>

      <Section
        title="Service Tasks"
        description="Record condition, work performed, and tire details for each line item."
      >
        <LineItems woId={wo.id} items={wo.lineItems} defaultOpen />
      </Section>

      <CommentsPanel wo={wo} />

      <DispatchHelp hint="Need additional items, vehicle issue, customer dispute — call dispatch before completing service." />

      <div className={styles.bar}>
        <div className={styles.hint}>
          {wo.vehicle.odometerArrival == null
            ? "Arrival odometer required before you can complete service."
            : requiredMissing.length > 0
              ? `${requiredMissing.length} required photo(s) missing — BA will see the flag.`
              : "Ready to complete service."}
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
            disabled={wo.vehicle.odometerArrival == null || completing}
            onClick={handleComplete}
            leftIcon={<ClipboardCheck size={20} />}
          >
            {completing ? "Completing…" : "Service Complete"}
          </Button>
        </div>
      </div>
    </>
  );
}
