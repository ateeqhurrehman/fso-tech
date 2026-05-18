import type { WorkOrder } from "../lib/types";
import { Stepper } from "../components/Stepper";
import { StatusBadge, EmergencyBadge } from "../components/StatusBadge";
import { SLATimer } from "../components/SLATimer";
import { useStore } from "../lib/store";
import { Accepted } from "./live/Accepted";
import { EnRoute } from "./live/EnRoute";
import { ServiceStarted } from "./live/ServiceStarted";
import { ServiceCompletedScreen } from "./live/ServiceCompleted";
import styles from "./LiveJob.module.css";
import wodStyles from "./WODetail.module.css";

interface Props {
  wo: WorkOrder;
}

export function LiveJob({ wo }: Props) {
  const refresh = useStore((s) => s.refreshFromDispatcher);

  // Driver-safe minimized view: hide stepper + header chrome at En Route.
  if (wo.woStatus === "En_Route") {
    return <EnRoute wo={wo} />;
  }

  return (
    <>
      <header className={wodStyles.header}>
        <div className={wodStyles.headTitle}>
          <h1>{wo.number}</h1>
          <div className={styles.customer}>{wo.customerName}</div>
          <div className={wodStyles.headBadges}>
            <StatusBadge status={wo.woStatus} />
            {wo.isEmergency && <EmergencyBadge />}
          </div>
        </div>
        {wo.acceptedAt && (
          <div className={styles.headSla}>
            <SLATimer wo={wo} variant="chip" />
          </div>
        )}
      </header>

      {wo.pendingDispatcherUpdate && (
        <div className={styles.dispatcherBanner}>
          <div>
            <strong>Dispatcher update.</strong> {wo.pendingDispatcherUpdate}
          </div>
          <button
            className={styles.refreshBtn}
            onClick={() => refresh(wo.id)}
          >
            Refresh
          </button>
        </div>
      )}

      <Stepper current={wo.woStatus} />

      {wo.woStatus === "Accepted" && <Accepted wo={wo} />}
      {wo.woStatus === "Service_Started" && <ServiceStarted wo={wo} />}
      {wo.woStatus === "Service_Completed" && (
        <ServiceCompletedScreen wo={wo} />
      )}
    </>
  );
}
