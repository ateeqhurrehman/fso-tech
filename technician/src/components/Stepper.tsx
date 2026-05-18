import type { WOStatus } from "../lib/types";
import { Check } from "lucide-react";
import styles from "./Stepper.module.css";

interface StepDef {
  status: WOStatus;
  label: string;
}

const STEPS: StepDef[] = [
  { status: "Accepted", label: "Accepted" },
  { status: "En_Route", label: "En Route" },
  { status: "Service_Started", label: "Service Started" },
  { status: "Service_Completed", label: "Service Completed" },
  { status: "Left_Site", label: "Left Site" },
];

const ORDER: WOStatus[] = STEPS.map((s) => s.status);

interface Props {
  current: WOStatus;
  onJump?: (status: WOStatus) => void;
}

export function Stepper({ current, onJump }: Props) {
  // For Completed/Rejected/Cancelled the stepper shows all 5 done
  const completedAll =
    current === "Completed" || current === "Rejected" || current === "Cancelled" || current === "Reassigned_From";
  const currentIdx = completedAll ? ORDER.length - 1 : ORDER.indexOf(current);

  return (
    <ol className={styles.stepper}>
      {STEPS.map((s, idx) => {
        const isDone = completedAll || idx < currentIdx;
        const isCurrent = !completedAll && idx === currentIdx;
        const reachable = isDone || isCurrent;
        const cls = [
          styles.step,
          isDone ? styles.done : "",
          isCurrent ? styles.current : "",
          !reachable ? styles.future : "",
        ].join(" ");
        return (
          <li key={s.status} className={cls}>
            <button
              className={styles.dotBtn}
              disabled={!reachable || !onJump}
              onClick={() => reachable && onJump?.(s.status)}
              aria-current={isCurrent ? "step" : undefined}
            >
              <span className={styles.dot}>
                {isDone ? <Check size={16} /> : <span>{idx + 1}</span>}
              </span>
              <span className={styles.label}>{s.label}</span>
            </button>
            {idx < STEPS.length - 1 && (
              <span
                className={[
                  styles.connector,
                  isDone ? styles.connectorDone : "",
                ].join(" ")}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
