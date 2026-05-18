// Persistent reference strip during Service Started / Service Completed —
// tractor #, trailer #, driver name. Tech is under a truck and forgets which
// unit they're working on; this saves a scroll back to the WO header.

import { Truck, User } from "lucide-react";
import type { WorkOrder } from "../lib/types";
import styles from "./EquipmentStrip.module.css";

interface Props {
  wo: WorkOrder;
}

export function EquipmentStrip({ wo }: Props) {
  if (!wo.tractorNumber && !wo.trailerNumber && !wo.driverName) return null;
  const showTractor =
    wo.serviceTarget !== "trailer" && Boolean(wo.tractorNumber);
  const showTrailer =
    wo.serviceTarget !== "tractor" && Boolean(wo.trailerNumber);
  return (
    <div className={styles.strip}>
      {showTractor && (
        <Cell icon={<Truck size={14} />} label="Tractor" value={wo.tractorNumber!} />
      )}
      {showTrailer && (
        <Cell icon={<Truck size={14} />} label="Trailer" value={wo.trailerNumber!} />
      )}
      {wo.driverName && (
        <Cell icon={<User size={14} />} label="Customer Driver" value={wo.driverName} />
      )}
    </div>
  );
}

function Cell({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className={styles.cell}>
      <span className={styles.icon}>{icon}</span>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
    </div>
  );
}
