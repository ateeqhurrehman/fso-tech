// Persistent "Need help? Dispatch" affordance on Live Job screens.
// Generic guidance text — no specific phone number or email displayed.
// The technician already has driver contact info above this section.

import { HelpCircle } from "lucide-react";
import styles from "./DispatchHelp.module.css";

interface Props {
  hint?: string;
}

export function DispatchHelp({
  hint = "If you have trouble locating the destination, call the driver or dispatcher.",
}: Props) {
  return (
    <div className={styles.bar}>
      <HelpCircle size={16} className={styles.icon} />
      <div className={styles.body}>
        <div className={styles.head}>Need help?</div>
        <div className={styles.hint}>{hint}</div>
      </div>
    </div>
  );
}
