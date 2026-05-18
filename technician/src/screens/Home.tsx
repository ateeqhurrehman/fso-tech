import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle2,
  MapPin,
  Phone,
  Radio,
  XCircle,
} from "lucide-react";
import { useStore } from "../lib/store";
import {
  selectCompleted,
  selectLive,
  selectUpcoming,
  selectWithdrawn,
} from "../lib/selectors";
import { WOCard } from "../components/WOCard";
import { SLATimer } from "../components/SLATimer";
import { Tabs, type TabDef } from "../components/Tabs";
import { FILTER_LABELS, rangeFor } from "../lib/filters";
import { EmergencyBadge, StatusBadge } from "../components/StatusBadge";
import type { CompletedFilter, WorkOrder } from "../lib/types";
import styles from "./Home.module.css";

export function Home() {
  const workOrders = useStore((s) => s.workOrders);
  const user = useStore((s) => s.user);
  const { tab = "live" } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightWoId = searchParams.get("wo");
  const lastHighlightedRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      !highlightWoId ||
      tab !== "completed" ||
      lastHighlightedRef.current === highlightWoId
    ) {
      return;
    }
    lastHighlightedRef.current = highlightWoId;
    const raf = requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>(
        `[data-wo-id="${highlightWoId}"]`,
      );
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    return () => cancelAnimationFrame(raf);
  }, [highlightWoId, tab]);

  const live = useMemo(() => selectLive(workOrders), [workOrders]);
  const upcoming = useMemo(() => selectUpcoming(workOrders), [workOrders]);
  const completed = useMemo(() => selectCompleted(workOrders), [workOrders]);
  const withdrawn = useMemo(() => selectWithdrawn(workOrders), [workOrders]);

  const [completedFilter, setCompletedFilter] =
    useState<CompletedFilter>("this_week");
  const [withdrawnFilter, setWithdrawnFilter] =
    useState<CompletedFilter>("this_week");

  const completedRange = rangeFor(completedFilter);
  const withdrawnRange = rangeFor(withdrawnFilter);

  const filteredCompleted = completed.filter((w) => {
    const t = new Date(w.leftSiteAt ?? w.completedAt ?? w.assignedAt).getTime();
    return (
      t >= completedRange.from.getTime() && t <= completedRange.to.getTime()
    );
  });
  const filteredWithdrawn = withdrawn.filter((w) => {
    const t = new Date(w.withdrawnAt ?? w.assignedAt).getTime();
    return (
      t >= withdrawnRange.from.getTime() && t <= withdrawnRange.to.getTime()
    );
  });

  const rejectedCount = completed.filter((w) => w.woStatus === "Rejected").length;
  const firstName = user.fullName.split(" ")[0];

  const tabs: TabDef[] = [
    { to: "/my-jobs/live", label: "Live" },
    { to: "/my-jobs/upcoming", label: "Upcoming", count: upcoming.length },
    { to: "/my-jobs/completed", label: "Completed", count: completed.length },
    { to: "/my-jobs/withdrawn", label: "Withdrawn", count: withdrawn.length },
  ];

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.greeting}>
        <div className={styles.greetingLine}>
          Hi <strong>{firstName}</strong> — today you have{" "}
          <strong>{upcoming.length}</strong> upcoming job
          {upcoming.length === 1 ? "" : "s"}
          {rejectedCount > 0 && (
            <>
              {" "}· <strong className={styles.alert}>{rejectedCount}</strong>{" "}
              needs your action
            </>
          )}
          .
        </div>
      </div>

      <Tabs tabs={tabs} ariaLabel="My Jobs sub-navigation" />

      {tab === "live" &&
        (live ? (
          <LiveJobHero
            wo={live}
            onOpen={() => navigate(`/wo/${live.id}`)}
          />
        ) : (
          <NoLiveBanner upcoming={upcoming[0]} />
        ))}

      {tab === "upcoming" && (
        <Section
          icon={<Calendar size={16} />}
          title="Upcoming"
          subtitle={`${upcoming.length} assigned`}
          accent="info"
        >
          {upcoming.length === 0 ? (
            <EmptyState message="No upcoming work orders. Check with your dispatcher." />
          ) : (
            <div className={styles.list}>
              {upcoming.map((w) => (
                <WOCard key={w.id} wo={w} context="upcoming" />
              ))}
            </div>
          )}
        </Section>
      )}

      {tab === "completed" && (
        <Section
          icon={<CheckCircle2 size={16} />}
          title="Completed"
          subtitle={
            rejectedCount > 0
              ? `${rejectedCount} need your action`
              : "Left Site, Completed, or Rejected"
          }
          accent="ok"
          rightSlot={
            <FilterSelect value={completedFilter} onChange={setCompletedFilter} />
          }
        >
          {filteredCompleted.length === 0 ? (
            <EmptyState
              message={`No completed work orders for ${FILTER_LABELS[completedFilter]}.`}
            />
          ) : (
            <div className={styles.list}>
              {filteredCompleted.map((w) => (
                <WOCard
                  key={w.id}
                  wo={w}
                  context="completed"
                  highlight={w.id === highlightWoId}
                />
              ))}
            </div>
          )}
        </Section>
      )}

      {tab === "withdrawn" && (
        <Section
          icon={<XCircle size={16} />}
          title="Withdrawn"
          subtitle="Cancelled or reassigned before service started"
          accent="muted"
          rightSlot={
            <FilterSelect value={withdrawnFilter} onChange={setWithdrawnFilter} />
          }
        >
          {filteredWithdrawn.length === 0 ? (
            <EmptyState
              message={`No withdrawn work orders for ${FILTER_LABELS[withdrawnFilter]}.`}
            />
          ) : (
            <div className={styles.list}>
              {filteredWithdrawn.map((w) => (
                <WOCard key={w.id} wo={w} context="withdrawn" />
              ))}
            </div>
          )}
        </Section>
      )}
    </div>
  );
}

function LiveJobHero({ wo, onOpen }: { wo: WorkOrder; onOpen: () => void }) {
  const phaseLabel: Record<string, string> = {
    Accepted: "At the shop · vehicle details & SLA before departure",
    En_Route: "En route to the customer",
    Service_Started: "On site · servicing in progress",
    Service_Completed: "Service done · capture signature and leave site",
  };
  const nextAction: Record<string, string> = {
    Accepted: "Continue: Leave for Location",
    En_Route: "Continue: Mark as Arrived",
    Service_Started: "Continue: Service Complete",
    Service_Completed: "Continue: Leave Site",
  };
  return (
    <section className={styles.hero} onClick={onOpen}>
      <div className={styles.heroAccent}>
        <Radio size={12} className={styles.heroPulse} />
        <span>Live Job · {phaseLabel[wo.woStatus]}</span>
      </div>
      <div className={styles.heroTop}>
        <div className={styles.heroTitle}>
          <h1>{wo.number}</h1>
          <div className={styles.heroCustomer}>{wo.customerName}</div>
        </div>
        <div className={styles.heroBadges}>
          {wo.isEmergency && <EmergencyBadge />}
          <StatusBadge status={wo.woStatus} />
        </div>
      </div>

      <div className={styles.heroLocation}>
        <MapPin size={14} />
        <span>{wo.serviceLocation}</span>
      </div>

      {(() => {
        const showTractor =
          wo.serviceTarget !== "trailer" && Boolean(wo.tractorNumber);
        const showTrailer =
          wo.serviceTarget !== "tractor" && Boolean(wo.trailerNumber);
        const hasMeta =
          showTractor || showTrailer || Boolean(wo.driverName) || Boolean(wo.acceptedAt);
        if (!hasMeta) return null;
        return (
          <div className={styles.heroMeta}>
            {showTractor && (
              <span>Tractor <strong>{wo.tractorNumber}</strong></span>
            )}
            {showTrailer && (
              <span>Trailer <strong>{wo.trailerNumber}</strong></span>
            )}
            {wo.driverName && (
              <span>
                <Phone size={11} /> {wo.driverName}{" "}
                {wo.driverPhone && <span className={styles.phone}>{wo.driverPhone}</span>}
              </span>
            )}
          </div>
        );
      })()}

      {wo.acceptedAt && (
        <div className={styles.heroSla}>
          <SLATimer wo={wo} variant="chip" />
        </div>
      )}

      <div className={styles.heroCta}>
        <span>{nextAction[wo.woStatus]}</span>
        <ArrowRight size={18} />
      </div>
    </section>
  );
}

function NoLiveBanner({ upcoming }: { upcoming?: WorkOrder }) {
  return (
    <div className={styles.noLive}>
      <Briefcase size={18} />
      <div>
        <div className={styles.noLiveTitle}>No live work order</div>
        <div className={styles.noLiveSub}>
          {upcoming
            ? `Tap ${upcoming.number} below to review and accept your next job.`
            : "Wait for dispatch to assign you a job."}
        </div>
      </div>
    </div>
  );
}

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  accent: "red" | "info" | "ok" | "warn" | "muted";
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
}

function Section({
  icon,
  title,
  subtitle,
  accent,
  rightSlot,
  children,
}: SectionProps) {
  return (
    <section className={`${styles.section} ${styles[`accent_${accent}`]}`}>
      <header className={styles.head}>
        <div className={styles.headLeft}>
          <div className={styles.icon}>{icon}</div>
          <div>
            <h2>{title}</h2>
            <div className={styles.subtitle}>{subtitle}</div>
          </div>
        </div>
        {rightSlot && <div>{rightSlot}</div>}
      </header>
      <div className={styles.body}>{children}</div>
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div className={styles.empty}>{message}</div>;
}

function FilterSelect({
  value,
  onChange,
}: {
  value: CompletedFilter;
  onChange: (v: CompletedFilter) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as CompletedFilter)}
      className={styles.filter}
    >
      {Object.entries(FILTER_LABELS).map(([k, label]) => (
        <option key={k} value={k}>
          {label}
        </option>
      ))}
    </select>
  );
}
