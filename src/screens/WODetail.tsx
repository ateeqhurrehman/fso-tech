import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useStore } from "../lib/store";
import { UpcomingDetail } from "./UpcomingDetail";
import { LiveJob } from "./LiveJob";
import { CompletedDetail } from "./CompletedDetail";
import { WithdrawnDetail } from "./WithdrawnDetail";
import { ReviewScreen } from "./ReviewScreen";
import styles from "./WODetail.module.css";

export function WODetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const wo = useStore((s) => (id ? s.workOrders[id] : undefined));

  if (!wo) {
    return (
      <div className={`container ${styles.notFound}`}>
        <h2>Work order not found</h2>
        <button onClick={() => navigate("/")} className={styles.back}>
          <ChevronLeft size={18} /> Back to home
        </button>
      </div>
    );
  }

  let body: React.ReactNode = null;
  switch (wo.woStatus) {
    case "Assigned":
    case "Reassigned":
      body = <UpcomingDetail wo={wo} />;
      break;
    case "Accepted":
    case "En_Route":
    case "Service_Started":
    case "Service_Completed":
      body = <LiveJob wo={wo} />;
      break;
    case "Left_Site":
      body = <ReviewScreen wo={wo} />;
      break;
    case "Completed":
    case "Rejected":
      body = <CompletedDetail wo={wo} />;
      break;
    case "Cancelled":
    case "Reassigned_From":
      body = <WithdrawnDetail wo={wo} />;
      break;
  }

  return (
    <div className={`container ${styles.page}`}>
      <button onClick={() => navigate("/")} className={styles.back}>
        <ChevronLeft size={18} /> Back to home
      </button>
      {body}
    </div>
  );
}
