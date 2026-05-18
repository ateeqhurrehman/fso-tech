import { useState } from "react";
import { ChevronDown, ChevronRight, MessageSquare, Wrench } from "lucide-react";
import type { LineItem } from "../lib/types";
import { useStore } from "../lib/store";
import styles from "./LineItems.module.css";

interface Props {
  woId: string;
  items: LineItem[];
  readOnly?: boolean;
  /** Render line items expanded by default — used on Service Started where
      filling out detail IS the work. */
  defaultOpen?: boolean;
}

export function LineItems({ woId, items, readOnly, defaultOpen }: Props) {
  return (
    <div className={styles.list}>
      {items.map((li) => (
        <LineRow
          key={li.id}
          woId={woId}
          item={li}
          readOnly={readOnly}
          defaultOpen={defaultOpen}
        />
      ))}
      <div className={styles.dispatcherNote}>
        Need additional items? Call your dispatcher — they'll add items to this
        work order.
      </div>
    </div>
  );
}

function LineRow({
  woId,
  item,
  readOnly,
  defaultOpen,
}: {
  woId: string;
  item: LineItem;
  readOnly?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  const updateDetail = useStore((s) => s.updateLineItemDetail);
  const d = item.detail ?? {};

  return (
    <div className={styles.row}>
      <button
        type="button"
        className={styles.header}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        <Wrench size={16} className={styles.wrench} />
        <div className={styles.headBody}>
          <div className={styles.headTop}>
            <span className={styles.code}>{item.serviceCode}</span>
            <span className={styles.desc}>{item.description}</span>
          </div>
          <div className={styles.headMeta}>
            <span>Qty {item.quantity}</span>
            {item.axlePosition && (
              <span className={styles.axle}>{item.axlePosition}</span>
            )}
            {item.isTire && <span className={styles.tireFlag}>TIRE</span>}
          </div>
        </div>
      </button>

      {open && (
        <div className={styles.detail}>
          {item.dispatcherNotes && (
            <div className={styles.dispatcher}>
              <MessageSquare
                size={14}
                className={styles.dispatcherIcon}
                aria-hidden
              />
              <div className={styles.dispatcherBody}>
                <div className={styles.dispatcherLabel}>From Dispatcher</div>
                <div className={styles.dispatcherText}>
                  {item.dispatcherNotes}
                </div>
              </div>
            </div>
          )}
          <Field label="Condition Notes">
            <textarea
              value={d.conditionNotes ?? ""}
              readOnly={readOnly}
              onChange={(e) =>
                updateDetail(woId, item.id, { conditionNotes: e.target.value })
              }
              placeholder="e.g. Tire blown, sidewall damage, road debris"
            />
          </Field>
          <Field label="Work Performed">
            <textarea
              value={d.workPerformed ?? ""}
              readOnly={readOnly}
              onChange={(e) =>
                updateDetail(woId, item.id, { workPerformed: e.target.value })
              }
              placeholder="e.g. Replaced tire, torqued to spec"
            />
          </Field>

          {item.isTire && (
            <div className={styles.tireGrid}>
              <Field label="DOT (Off Tire)">
                <input
                  type="text"
                  value={d.dotOff ?? ""}
                  readOnly={readOnly}
                  onChange={(e) =>
                    updateDetail(woId, item.id, { dotOff: e.target.value })
                  }
                  placeholder="DOT_______"
                />
              </Field>
              <Field label="DOT (On Tire)">
                <input
                  type="text"
                  value={d.dotOn ?? ""}
                  readOnly={readOnly}
                  onChange={(e) =>
                    updateDetail(woId, item.id, { dotOn: e.target.value })
                  }
                  placeholder="DOT_______"
                />
              </Field>
              <Field label="Tire Size">
                <input
                  type="text"
                  value={d.tireSize ?? ""}
                  readOnly={readOnly}
                  onChange={(e) =>
                    updateDetail(woId, item.id, { tireSize: e.target.value })
                  }
                  placeholder="e.g. 11R22.5"
                />
              </Field>
              <Field label="Tire Brand">
                <input
                  type="text"
                  value={d.tireBrand ?? ""}
                  readOnly={readOnly}
                  onChange={(e) =>
                    updateDetail(woId, item.id, { tireBrand: e.target.value })
                  }
                  placeholder="e.g. Bridgestone"
                />
              </Field>
            </div>
          )}
          <Field label="Comments">
            <textarea
              value={d.comments ?? ""}
              readOnly={readOnly}
              onChange={(e) =>
                updateDetail(woId, item.id, { comments: e.target.value })
              }
              placeholder="Additional notes for billing"
            />
          </Field>
        </div>
      )}
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
      <span className={styles.fieldLabel}>{label}</span>
      {children}
    </label>
  );
}
