// Completeness summary — sticky chip row showing the tech what's left to
// complete on the current step. Replaces buried "soft warnings" with always-
// visible progress feedback.

import { Check, X, Circle } from "lucide-react";
import styles from "./ProgressChips.module.css";

export interface Chip {
  label: string;
  state: "done" | "missing" | "optional" | "pending";
  hint?: string;
  required?: boolean;
}

interface Props {
  title?: string;
  chips: Chip[];
}

export function ProgressChips({ title = "Progress", chips }: Props) {
  const required = chips.filter((c) => c.required);
  const doneCount = required.filter((c) => c.state === "done").length;
  const allDone = required.length > 0 && doneCount === required.length;

  return (
    <div className={`${styles.bar} ${allDone ? styles.allDone : ""}`}>
      <div className={styles.head}>
        <span className={styles.title}>{title}</span>
        {required.length > 0 && (
          <span className={styles.counter}>
            {doneCount}/{required.length} required
          </span>
        )}
      </div>
      <div className={styles.chips}>
        {chips.map((c, i) => (
          <div key={i} className={`${styles.chip} ${styles[c.state]}`}>
            <span className={styles.icon}>
              {c.state === "done" && <Check size={12} />}
              {c.state === "missing" && <X size={12} />}
              {(c.state === "optional" || c.state === "pending") && (
                <Circle size={9} />
              )}
            </span>
            <span className={styles.label}>{c.label}</span>
            {c.hint && <span className={styles.hint}>{c.hint}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
