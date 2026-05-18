import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Bell,
  Briefcase,
  Moon,
  Sun,
  UserCircle2,
  Wifi,
  WifiOff,
  Radio,
} from "lucide-react";
import { useStore } from "../lib/store";
import { selectLive } from "../lib/selectors";
import { ConnectivityChip } from "./ConnectivityIndicator";
import { NotificationsPanel } from "./NotificationsPanel";
import { StatusBadge } from "./StatusBadge";
import styles from "./Header.module.css";

interface HeaderProps {
  onLogoClick: () => void;
}

export function Header({ onLogoClick }: HeaderProps) {
  const user = useStore((s) => s.user);
  const darkMode = useStore((s) => s.darkMode);
  const toggleDarkMode = useStore((s) => s.toggleDarkMode);
  const notifications = useStore((s) => s.notifications);
  const workOrders = useStore((s) => s.workOrders);
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;
  const live = selectLive(workOrders);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.row}`}>
        <button className={styles.brand} onClick={onLogoClick}>
          <div className={styles.logo}>MTS</div>
          <div className={styles.brandText}>
            <div className={styles.brandTitle}>Field Service</div>
            <div className={styles.brandSub}>Technician</div>
          </div>
        </button>

        <nav className={styles.nav}>
          <NavLink
            to="/my-jobs"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navActive : ""}`
            }
          >
            <Briefcase size={16} aria-hidden /> My Jobs
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navActive : ""}`
            }
          >
            <UserCircle2 size={16} aria-hidden /> Profile
          </NavLink>
        </nav>

        {live && (
          <button
            className={styles.liveChip}
            onClick={() => navigate(`/wo/${live.id}`)}
            title="Jump to your live work order"
          >
            <Radio size={12} className={styles.livePulse} />
            <span className={styles.liveLabel}>On duty</span>
            <span className={styles.liveSeparator} />
            <span className={styles.liveWo}>{live.number}</span>
            <span className={styles.liveStatus}>
              <StatusBadge status={live.woStatus} />
            </span>
          </button>
        )}

        <div className={styles.right}>
          <ConnectivityChip />
          <button
            className={styles.iconBtn}
            aria-label="Toggle dark mode"
            onClick={toggleDarkMode}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            className={styles.iconBtn}
            aria-label="Notifications"
            onClick={() => setNotifOpen((v) => !v)}
          >
            <Bell size={18} />
            {unread > 0 && <span className={styles.badge}>{unread}</span>}
          </button>
          <div className={styles.user} onClick={() => navigate("/profile")}>
            <div className={styles.avatar}>
              {user.fullName
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")}
            </div>
          </div>
        </div>
      </div>

      {notifOpen && (
        <NotificationsPanel onClose={() => setNotifOpen(false)} />
      )}
    </header>
  );
}

export function NetIcon({ online }: { online: boolean }) {
  return online ? <Wifi size={16} /> : <WifiOff size={16} />;
}
