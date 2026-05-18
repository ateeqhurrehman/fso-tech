import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Navigation, Save } from "lucide-react";
import type { WorkOrder } from "../../lib/types";
import { useStore } from "../../lib/store";
import { Section } from "../../components/Card";
import { ETAPicker } from "../../components/ETAPicker";
import { CustomerSlaCard } from "../../components/CustomerSlaCard";
import { VehicleDetailsForm } from "../../components/VehicleDetailsForm";
import { LineItems } from "../../components/LineItems";
import { CommentsPanel } from "../../components/CommentsPanel";
import { Button } from "../../components/Button";
import { toast } from "../../components/Toast";
import { DispatchHelp } from "../../components/DispatchHelp";
import styles from "./Accepted.module.css";

interface Props {
  wo: WorkOrder;
}

export function Accepted({ wo }: Props) {
  const navigate = useNavigate();
  const saveVehicleDetails = useStore((s) => s.saveVehicleDetails);
  const acknowledgeSla = useStore((s) => s.acknowledgeSla);
  const leaveForLocation = useStore((s) => s.leaveForLocation);

  const [departing, setDeparting] = useState(false);

  const saveDraft = () => {
    toast.success("Draft saved. Pick up where you left off from My Jobs.");
    navigate("/my-jobs/live");
  };

  const vehicleReady =
    !!wo.vehicle.driverName &&
    !!wo.vehicle.vehicleNumber &&
    wo.vehicle.odometerDeparture != null;
  const slaAcked = !!wo.slaAcknowledgedAt;
  const canLeave = vehicleReady && slaAcked && wo.etaLocked;

  const missing: string[] = [];
  if (!vehicleReady) missing.push("Vehicle details");
  if (!slaAcked) missing.push("SLA acknowledgment");

  const depart = async () => {
    setDeparting(true);
    try {
      await leaveForLocation(wo.id);
      toast.success(
        "Departed. Driver-safe view active — drive carefully.",
      );
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setDeparting(false);
    }
  };

  return (
    <>
      <Section
        title="ETA (Locked)"
        description="ETA was committed at the moment you tapped Accept Job. Cannot be edited from here."
      >
        <ETAPicker
          locked
          value={wo.etaMinutes ?? 0}
          expectedArrivalAt={wo.expectedArrivalAt}
          onChange={() => {}}
        />
      </Section>

      <CustomerSlaCard wo={wo} acknowledgedAt={wo.slaAcknowledgedAt} />

      <div className={styles.slaAckRow}>
        <button
          type="button"
          className={`${styles.ackCheckbox} ${slaAcked ? styles.ackChecked : ""}`}
          onClick={() => !slaAcked && acknowledgeSla(wo.id)}
          disabled={slaAcked}
          aria-pressed={slaAcked}
        >
          <span className={styles.ackBox}>
            {slaAcked && <Check size={16} />}
          </span>
          <span className={styles.ackLabel}>
            I have read and understood the SLA.
            {slaAcked && " Acknowledged."}
          </span>
        </button>
      </div>

      <Section
        title="Service Tasks (Preview)"
        description="Read-only at this stage. You'll fill in tire details once service starts."
      >
        <LineItems woId={wo.id} items={wo.lineItems} readOnly />
      </Section>

      <Section
        title="Service Vehicle"
        description="Required before Leave for Location. Locked at departure (BA can correct via US-BILL-006 with audit)."
      >
        <VehicleDetailsForm
          value={wo.vehicle}
          onChange={(v) => saveVehicleDetails(wo.id, v)}
        />
      </Section>

      <CommentsPanel wo={wo} />

      <DispatchHelp hint="Wrong WO, missing info, vehicle breakdown — talk to dispatch before you leave." />

      <div className={styles.bar}>
        <div className={styles.hint}>
          {canLeave
            ? "Vehicle details and SLA captured — ready to depart."
            : `Please complete: ${missing.join(", ")}.`}
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
            disabled={!canLeave || departing}
            onClick={depart}
            leftIcon={<Navigation size={20} />}
          >
            {departing ? "Departing…" : "Leave for Location"}
          </Button>
        </div>
      </div>
    </>
  );
}
