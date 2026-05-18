import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertOctagon,
  MapPin,
  Phone,
  Truck,
  User,
} from "lucide-react";
import type { WorkOrder } from "../lib/types";
import { useStore } from "../lib/store";
import { Button } from "../components/Button";
import { EmergencyBadge, StatusBadge } from "../components/StatusBadge";
import { ETAPicker } from "../components/ETAPicker";
import { CustomerSlaCard } from "../components/CustomerSlaCard";
import { Section } from "../components/Card";
import { LineItems } from "../components/LineItems";
import { InfoGrid } from "../components/InfoGrid";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { toast } from "../components/Toast";
import { selectLive } from "../lib/selectors";
import styles from "./WODetail.module.css";
import upcomingStyles from "./UpcomingDetail.module.css";

interface Props {
  wo: WorkOrder;
}

export function UpcomingDetail({ wo }: Props) {
  const navigate = useNavigate();
  const acceptJob = useStore((s) => s.acceptJob);
  const workOrders = useStore((s) => s.workOrders);
  const otherLive = useMemo(() => selectLive(workOrders), [workOrders]);
  const [eta, setEta] = useState<number | null>(null);
  const [confirm, setConfirm] = useState(false);

  const canAccept = eta != null && !otherLive;

  const accept = async () => {
    if (eta == null) return;
    try {
      await acceptJob(wo.id, eta);
      toast.success(`Accepted ${wo.number}. ETA locked at ${eta} minutes.`);
      navigate(`/wo/${wo.id}`, { replace: true });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headTitle}>
          <h1>{wo.number}</h1>
          <div className={upcomingStyles.customer}>{wo.customerName}</div>
          <div className={styles.headBadges}>
            <StatusBadge status={wo.woStatus} />
            {wo.isEmergency && <EmergencyBadge />}
          </div>
        </div>
        <div className={upcomingStyles.account}>
          <div className={upcomingStyles.accountLabel}>Account</div>
          <div className={upcomingStyles.accountValue}>
            {wo.customerAccountNumber}
          </div>
        </div>
      </header>

      {otherLive && (
        <div className={upcomingStyles.lockWarning}>
          <AlertOctagon size={20} />
          <span>
            You already have a live work order ({otherLive.number}). Tap Leave
            Site on it before accepting another.
          </span>
        </div>
      )}

      <CustomerSlaCard wo={wo} acknowledgedAt={wo.slaAcknowledgedAt} />

      <Section title="Work Order Details">
        <InfoGrid
          items={[
            {
              label: "Service Location",
              value: (
                <span className={upcomingStyles.iconRow}>
                  <MapPin size={14} /> {wo.serviceLocation}
                </span>
              ),
              full: true,
            },
            ...(wo.breakdownLocationNotes
              ? [
                  {
                    label: "Breakdown Location Notes",
                    value: wo.breakdownLocationNotes,
                    full: true,
                  } as const,
                ]
              : []),
            {
              label: "Customer Driver",
              value: wo.driverName ? (
                <span className={upcomingStyles.iconRow}>
                  <User size={14} /> {wo.driverName}
                </span>
              ) : (
                "—"
              ),
            },
            {
              label: "Customer Driver Phone",
              value: wo.driverPhone ? (
                <a
                  href={`tel:${wo.driverPhone.replace(/\D/g, "")}`}
                  className={upcomingStyles.iconRow}
                >
                  <Phone size={14} /> {wo.driverPhone}
                </a>
              ) : (
                "—"
              ),
            },
            ...(wo.serviceTarget !== "trailer" && wo.tractorNumber
              ? [
                  {
                    label: "Tractor",
                    value: (
                      <span className={upcomingStyles.iconRow}>
                        <Truck size={14} /> {wo.tractorNumber}
                      </span>
                    ),
                  },
                ]
              : []),
            ...(wo.serviceTarget !== "tractor" && wo.trailerNumber
              ? [{ label: "Trailer", value: wo.trailerNumber }]
              : []),
            {
              label: "Problem",
              value: wo.problemType ?? "—",
              full: true,
            },
            {
              label: "Customer Contact",
              value: wo.customerContact ?? "—",
              full: true,
            },
          ]}
        />
      </Section>

      {wo.specialHandlingInstructions && (
        <Section
          title="Dispatcher Service Vehicle Instructions"
          description="Per-WO instructions from your dispatcher about this service vehicle and site. Distinct from the customer-account SLA."
        >
          <div className={upcomingStyles.shInstruction}>
            <div className={upcomingStyles.shLabel}>
              Special Handling Instructions
            </div>
            <div>{wo.specialHandlingInstructions}</div>
          </div>
        </Section>
      )}

      <Section
        title="Service Tasks"
        description="Read-only — dispatcher manages line items. You'll add tire details and notes once service starts."
      >
        <LineItems woId={wo.id} items={wo.lineItems} readOnly />
      </Section>

      <Section
        title="Estimated Time of Arrival (ETA)"
        description="Required to Accept Job. Locks the moment you tap Accept Job (Lee F1 — plan-vs-actual baseline)."
      >
        <ETAPicker
          value={eta}
          onChange={setEta}
          locked={false}
        />
      </Section>

      <div className={upcomingStyles.acceptBar}>
        <div className={upcomingStyles.acceptHint}>
          {!eta && "Select an ETA to enable Accept Job."}
          {eta && otherLive && "Resolve your live work order before accepting."}
          {eta && !otherLive && "Ready — tap Accept Job to begin."}
        </div>
        <Button
          size="xl"
          variant="primary"
          disabled={!canAccept}
          onClick={() => setConfirm(true)}
        >
          Accept Job
        </Button>
      </div>

      <ConfirmDialog
        open={confirm}
        title="Accept this work order?"
        description={
          <>
            Accepting commits you to this work order. Your ETA will be locked
            at <strong>{eta} minutes</strong> and cannot be changed
            afterwards.
          </>
        }
        confirmLabel="Yes, Accept Job"
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false);
          accept();
        }}
      />
    </>
  );
}
