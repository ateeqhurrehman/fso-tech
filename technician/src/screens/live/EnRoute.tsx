import { useEffect, useRef, useState } from "react";
import { MapPin, Phone, Truck } from "lucide-react";
import type { WorkOrder } from "../../lib/types";
import { useStore } from "../../lib/store";
import { Button } from "../../components/Button";
import { SLATimer } from "../../components/SLATimer";
import { DispatchHelp } from "../../components/DispatchHelp";
import { etaCountdown } from "../../lib/time";
import { toast } from "../../components/Toast";
import styles from "./EnRoute.module.css";

interface Props {
  wo: WorkOrder;
}

export function EnRoute({ wo }: Props) {
  const markAsArrived = useStore((s) => s.markAsArrived);
  const [odoOpen, setOdoOpen] = useState(false);
  const [odo, setOdo] = useState("");
  const [, force] = useState(0);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    tickRef.current = window.setInterval(() => force((v) => v + 1), 1000);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, []);

  const countdown = wo.expectedArrivalAt
    ? etaCountdown(wo.expectedArrivalAt)
    : { text: "—", exceeded: false };

  const arrive = async () => {
    const n = Number(odo);
    if (!n || (wo.vehicle.odometerDeparture && n < wo.vehicle.odometerDeparture)) {
      toast.warn(
        "Arrival odometer is below your departure odometer. Please confirm.",
      );
    }
    await markAsArrived(wo.id, n);
    toast.success(`Marked arrived at ${wo.serviceLocation}.`);
  };

  return (
    <div className={styles.driverSafe}>
      <div className={styles.badge}>EN ROUTE — DRIVER-SAFE VIEW</div>

      <div className={styles.locationCard}>
        <div className={styles.locLabel}>
          <MapPin size={20} /> Destination
        </div>
        <div className={styles.locValue}>{wo.serviceLocation}</div>
      </div>

      {wo.breakdownLocationNotes && (
        <div className={styles.breakdownNotes}>
          <div className={styles.breakdownNotesLabel}>
            Breakdown Location Notes
          </div>
          <div className={styles.breakdownNotesBody}>
            {wo.breakdownLocationNotes}
          </div>
        </div>
      )}

      {(() => {
        const showTractor =
          wo.serviceTarget !== "trailer" && Boolean(wo.tractorNumber);
        const showTrailer =
          wo.serviceTarget !== "tractor" && Boolean(wo.trailerNumber);
        if (!showTractor && !showTrailer) return null;
        return (
          <div className={styles.equipmentRow}>
            {showTractor && (
              <div className={styles.equipmentCell}>
                <Truck size={18} />
                <div>
                  <div className={styles.eqLabel}>Tractor</div>
                  <div className={styles.eqValue}>{wo.tractorNumber}</div>
                </div>
              </div>
            )}
            {showTrailer && (
              <div className={styles.equipmentCell}>
                <Truck size={18} />
                <div>
                  <div className={styles.eqLabel}>Trailer</div>
                  <div className={styles.eqValue}>{wo.trailerNumber}</div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      <div className={styles.callDriver}>
        <Phone size={22} />
        <div className={styles.callBody}>
          <div className={styles.callLabel}>Customer Driver Contact</div>
          <div className={styles.callValue}>
            {wo.driverName ?? "—"} · {wo.driverPhone ?? "—"}
          </div>
        </div>
      </div>

      <div
        className={`${styles.countdown} ${countdown.exceeded ? styles.late : ""}`}
      >
        <div className={styles.countLabel}>ETA Countdown</div>
        <div className={styles.countValue}>{countdown.text}</div>
        <div className={styles.countSub}>
          {countdown.exceeded
            ? "Call the driver — communicate verbally."
            : `Committed ${wo.etaMinutes} min ETA · cannot be edited`}
        </div>
      </div>

      <div className={styles.slaRow}>
        <SLATimer wo={wo} variant="chip" />
      </div>

      {!odoOpen ? (
        <Button
          size="xl"
          variant="primary"
          fullWidth
          onClick={() => setOdoOpen(true)}
        >
          Mark as Arrived
        </Button>
      ) : (
        <div className={styles.arrivePanel}>
          <label className={styles.arrLabel}>
            Arrival Odometer (mi)
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={odo}
            onChange={(e) => setOdo(e.target.value)}
            placeholder={
              wo.vehicle.odometerDeparture
                ? `${wo.vehicle.odometerDeparture + 1}`
                : "0"
            }
            className={styles.arrInput}
          />
          <div className={styles.arrRow}>
            <Button variant="secondary" size="lg" onClick={() => setOdoOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={!odo}
              onClick={arrive}
            >
              Confirm Arrival
            </Button>
          </div>
        </div>
      )}

      <DispatchHelp hint="Vehicle breakdown, wrong address, customer not on site — call dispatch immediately." />

      <div className={styles.driverNote}>
        Comments, line items, and SLA detail are hidden during En Route to keep
        you focused on the road (Lee F2).
      </div>
    </div>
  );
}
