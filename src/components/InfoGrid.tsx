import type { ReactNode } from "react";
import styles from "./InfoGrid.module.css";

interface Item {
  label: string;
  value: ReactNode;
  full?: boolean;
}

interface Props {
  items: Item[];
}

export function InfoGrid({ items }: Props) {
  return (
    <div className={styles.grid}>
      {items.map((it, i) => (
        <div
          key={i}
          className={`${styles.cell} ${it.full ? styles.full : ""}`}
        >
          <div className={styles.label}>{it.label}</div>
          <div className={styles.value}>{it.value}</div>
        </div>
      ))}
    </div>
  );
}
