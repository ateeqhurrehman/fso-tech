import { useState, useEffect } from "react";
import type { VehicleDetails } from "../lib/types";
import styles from "./VehicleDetailsForm.module.css";

interface Props {
  value: VehicleDetails;
  readOnly?: boolean;
  onChange: (
    next: Pick<
      VehicleDetails,
      "driverName" | "vehicleNumber" | "odometerDeparture"
    >,
  ) => void;
}

export function VehicleDetailsForm({ value, readOnly, onChange }: Props) {
  const [driver, setDriver] = useState(value.driverName ?? "");
  const [vehicle, setVehicle] = useState(value.vehicleNumber ?? "");
  const [odo, setOdo] = useState(
    value.odometerDeparture != null ? String(value.odometerDeparture) : "",
  );

  useEffect(() => {
    const id = setTimeout(() => {
      onChange({
        driverName: driver.trim() || undefined,
        vehicleNumber: vehicle.trim() || undefined,
        odometerDeparture: odo ? Number(odo) : undefined,
      });
    }, 250);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, vehicle, odo]);

  if (readOnly) {
    return (
      <div className={styles.readonly}>
        <Row label="Driver Name (MTS Tech)" value={value.driverName ?? "—"} />
        <Row label="Vehicle Number (MTS Truck)" value={value.vehicleNumber ?? "—"} />
        <Row
          label="Departure Odometer"
          value={
            value.odometerDeparture != null
              ? `${value.odometerDeparture.toLocaleString()} mi`
              : "—"
          }
        />
        {value.odometerArrival != null && (
          <Row
            label="Arrival Odometer"
            value={`${value.odometerArrival.toLocaleString()} mi`}
          />
        )}
        {value.travelDistance != null && (
          <Row label="Travel Distance" value={`${value.travelDistance} mi`} />
        )}
      </div>
    );
  }

  return (
    <div className={styles.form}>
      <Field label="Driver Name (MTS Tech)">
        <input
          type="text"
          value={driver}
          onChange={(e) => setDriver(e.target.value)}
          placeholder="Your name"
        />
      </Field>
      <Field label="Vehicle Number (MTS Truck)">
        <input
          type="text"
          value={vehicle}
          onChange={(e) => setVehicle(e.target.value)}
          placeholder="e.g. MTS-117"
        />
      </Field>
      <Field label="Departure Odometer (mi)">
        <input
          type="number"
          value={odo}
          onChange={(e) => setOdo(e.target.value)}
          placeholder="0"
        />
      </Field>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.row}>
      <div className={styles.rowLabel}>{label}</div>
      <div className={styles.rowValue}>{value}</div>
    </div>
  );
}
