import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Card.module.css";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padded?: boolean;
}

export function Card({ children, padded = true, className, ...rest }: CardProps) {
  return (
    <div
      className={[styles.card, padded ? styles.pad : "", className ?? ""].join(
        " ",
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

interface SectionProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function Section({ title, description, action, children }: SectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <div>
          <h3>{title}</h3>
          {description && <div className={styles.sectionDesc}>{description}</div>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}
