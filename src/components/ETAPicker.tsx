import { useState } from "react";
import { Lock } from "lucide-react";
import { formatTime } from "../lib/time";
import { Button } from "./Button";
import styles from "./ETAPicker.module.css";

interface Props {
  value: number | null;
  expectedArrivalAt?: string;
  locked?: boolean;
  onChange: (minutes: number) => void;
}

const PRESETS = [60, 90, 120];

export function ETAPicker({ value, expectedArrivalAt, locked, onChange }: Props) {
  const [showCustom, setShowCustom] = useState(false);
  const [custom, setCustom] = useState("");

  if (locked) {
    return (
      <div className={styles.locked}>
        <div className={styles.lockedHead}>
          <Lock size={16} /> <span>ETA locked at Accept Job</span>
        </div>
        <div className={styles.lockedBody}>
          <div>
            <div className={styles.lockedLabel}>Committed ETA</div>
            <div className={styles.lockedValue}>{value} minutes</div>
          </div>
          {expectedArrivalAt && (
            <div>
              <div className={styles.lockedLabel}>Expected arrival</div>
              <div className={styles.lockedValue}>
                {formatTime(expectedArrivalAt)}
              </div>
            </div>
          )}
        </div>
        <div className={styles.lockedNote}>
          ETA cannot be edited after Accept Job (plan-vs-actual baseline). If
          delayed, call dispatch and add a note in Comments.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.picker}>
      <div className={styles.head}>
        <span>Committed ETA</span>
        <span className={styles.required}>Required to Accept Job</span>
      </div>
      <div className={styles.presets}>
        {PRESETS.map((m) => (
          <button
            key={m}
            type="button"
            className={`${styles.preset} ${value === m ? styles.active : ""}`}
            onClick={() => onChange(m)}
          >
            <div className={styles.presetNum}>{m}</div>
            <div className={styles.presetUnit}>min</div>
          </button>
        ))}
        <button
          type="button"
          className={`${styles.preset} ${showCustom ? styles.active : ""}`}
          onClick={() => setShowCustom((v) => !v)}
        >
          <div className={styles.presetNum}>Custom</div>
          <div className={styles.presetUnit}>1–999 min</div>
        </button>
      </div>
      {showCustom && (
        <div className={styles.customRow}>
          <input
            type="number"
            min={1}
            max={999}
            placeholder="Minutes"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
          />
          <Button
            variant="secondary"
            onClick={() => {
              const n = Number(custom);
              if (n >= 1 && n <= 999) {
                onChange(n);
                setShowCustom(false);
              }
            }}
          >
            Set
          </Button>
        </div>
      )}
      {value != null && (
        <div className={styles.preview}>
          Selected: <strong>{value} minutes</strong>. ETA locks the moment you
          tap Accept Job.
        </div>
      )}
    </div>
  );
}
