import { NavLink } from "react-router-dom";
import styles from "./Tabs.module.css";

export interface TabDef {
  to: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: TabDef[];
  ariaLabel?: string;
}

export function Tabs({ tabs, ariaLabel }: TabsProps) {
  return (
    <nav className={styles.nav} aria-label={ariaLabel ?? "Sub-navigation"}>
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end
          className={({ isActive }) =>
            `${styles.tab} ${isActive ? styles.active : ""}`
          }
        >
          <span className={styles.label}>{t.label}</span>
          {t.count != null && t.count > 0 && (
            <span className={styles.count}>{t.count}</span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
