import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  BellOff,
  CheckCircle2,
  History,
  Moon,
  RefreshCw,
  Sun,
  XCircle,
} from "lucide-react";
import { useStore } from "../lib/store";
import { Section } from "../components/Card";
import { Button } from "../components/Button";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { toast } from "../components/Toast";
import { formatDate } from "../lib/time";
import { selectLive } from "../lib/selectors";
import styles from "./Profile.module.css";

export function Profile() {
  const user = useStore((s) => s.user);
  const workOrders = useStore((s) => s.workOrders);
  const darkMode = useStore((s) => s.darkMode);
  const toggleDark = useStore((s) => s.toggleDarkMode);
  const notificationsEnabled = useStore((s) => s.notificationsEnabled);
  const toggleNotif = useStore((s) => s.toggleNotifications);
  const resetDemo = useStore((s) => s.resetDemo);
  const navigate = useNavigate();
  const [resetConfirm, setResetConfirm] = useState(false);

  const summary = useMemo(() => {
    const list = Object.values(workOrders);
    return {
      completedApproved: list.filter(
        (w) => w.woStatus === "Completed" && w.billingStatus === "Approved",
      ).length,
      live: selectLive(workOrders) ? 1 : 0,
      rejected: list.filter((w) => w.woStatus === "Rejected").length,
      withdrawn: list.filter((w) =>
        ["Cancelled", "Reassigned_From"].includes(w.woStatus),
      ).length,
    };
  }, [workOrders]);

  const initials = user.fullName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.header}>
        <div className={styles.avatar}>{initials}</div>
        <div>
          <h1>{user.fullName}</h1>
          <div className={styles.role}>{user.role}</div>
          <div className={styles.status}>
            <span className={styles.dot} /> On Duty
          </div>
        </div>
      </header>

      <Section title="Summary">
        <div className={styles.statGrid}>
          <Stat
            icon={<CheckCircle2 />}
            label="Completed (approved)"
            value={summary.completedApproved}
            tone="ok"
          />
          <Stat icon={<History />} label="Live Job" value={summary.live} tone="red" />
          <Stat
            icon={<XCircle />}
            label="Needs your action"
            value={summary.rejected}
            tone={summary.rejected > 0 ? "red" : "neutral"}
          />
          <Stat
            icon={<RefreshCw />}
            label="Withdrawn"
            value={summary.withdrawn}
            tone="neutral"
          />
        </div>
      </Section>

      <Section
        title="Account Information"
        description="Read-only — managed by your administrator."
      >
        <div className={styles.account}>
          <Row label="Full Name" value={user.fullName} />
          <Row label="Username" value={user.username} />
          <Row label="Email" value={user.email} />
          <Row label="Phone" value={user.phone} />
          <Row label="Role" value={user.role} />
          <Row label="Member Since" value={formatDate(user.memberSince)} />
        </div>
      </Section>

      <Section title="Preferences">
        <div className={styles.prefRow}>
          <div className={styles.prefBody}>
            {darkMode ? <Moon size={18} /> : <Sun size={18} />}
            <div>
              <div className={styles.prefLabel}>Dark Mode</div>
              <div className={styles.prefSub}>
                Low-light interface for roadside conditions.
              </div>
            </div>
          </div>
          <Toggle on={darkMode} onChange={toggleDark} />
        </div>
        <div className={styles.prefRow}>
          <div className={styles.prefBody}>
            {notificationsEnabled ? <Bell size={18} /> : <BellOff size={18} />}
            <div>
              <div className={styles.prefLabel}>Notifications</div>
              <div className={styles.prefSub}>
                Assignments, status changes, rejections, dispatcher updates.
                Emergencies are always on.
              </div>
            </div>
          </div>
          <Toggle on={notificationsEnabled} onChange={toggleNotif} />
        </div>
      </Section>

      <Section title="Quick Actions">
        <div className={styles.quickRow}>
          <Button variant="secondary" onClick={() => navigate("/")}>
            My Jobs
          </Button>
          <Button variant="secondary" onClick={() => navigate("/")}>
            History
          </Button>
          <Button
            variant="danger"
            onClick={() => setResetConfirm(true)}
          >
            Reset Demo Data
          </Button>
        </div>
      </Section>

      <ConfirmDialog
        open={resetConfirm}
        title="Reset demo data?"
        description="This clears IndexedDB and restores the six seeded work orders. Your preferences will also reset."
        confirmLabel="Yes, Reset"
        destructive
        onCancel={() => setResetConfirm(false)}
        onConfirm={async () => {
          setResetConfirm(false);
          await resetDemo();
          toast.info("Demo data reset.");
          navigate("/");
        }}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.row}>
      <div className={styles.rowLabel}>{label}</div>
      <div className={styles.rowValue}>{value}</div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "ok" | "red" | "neutral";
}) {
  return (
    <div className={`${styles.stat} ${styles[`stat_${tone}`]}`}>
      <div className={styles.statIcon}>{icon}</div>
      <div>
        <div className={styles.statValue}>{value}</div>
        <div className={styles.statLabel}>{label}</div>
      </div>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      className={`${styles.toggle} ${on ? styles.on : ""}`}
      onClick={onChange}
    >
      <span className={styles.toggleKnob} />
    </button>
  );
}
