import { useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";
import { formatRelative } from "../lib/time";
import styles from "./NotificationsPanel.module.css";

interface Props {
  onClose: () => void;
}

export function NotificationsPanel({ onClose }: Props) {
  const notifications = useStore((s) => s.notifications);
  const markRead = useStore((s) => s.markNotificationRead);
  const workOrders = useStore((s) => s.workOrders);
  const navigate = useNavigate();

  const open = (woNumber?: string, id?: string) => {
    if (id) markRead(id);
    if (woNumber) {
      const wo = Object.values(workOrders).find((w) => w.number === woNumber);
      if (wo) {
        onClose();
        navigate(`/wo/${wo.id}`);
      }
    }
  };

  return (
    <>
      <div className={styles.scrim} onClick={onClose} />
      <div className={styles.panel}>
        <div className={styles.head}>
          <h3>Notifications</h3>
          <button className={styles.close} onClick={onClose}>
            Close
          </button>
        </div>
        {notifications.length === 0 ? (
          <div className={styles.empty}>No notifications.</div>
        ) : (
          <ul className={styles.list}>
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`${styles.item} ${n.read ? styles.read : ""}`}
                onClick={() => open(n.woNumber, n.id)}
              >
                <div className={styles.title}>{n.title}</div>
                <div className={styles.body}>{n.body}</div>
                <div className={styles.time}>{formatRelative(n.createdAt)}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
