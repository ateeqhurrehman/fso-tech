import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  CheckCheck,
  ClipboardList,
  MessageSquare,
  Send,
  UserCheck,
} from "lucide-react";
import type { WorkOrder } from "../lib/types";
import { useStore } from "../lib/store";
import { Stepper } from "../components/Stepper";
import { StatusBadge, EmergencyBadge } from "../components/StatusBadge";
import { Section } from "../components/Card";
import { PhotoSlots } from "../components/PhotoSlot";
import { DocumentList } from "../components/DocumentList";
import { LineItems } from "../components/LineItems";
import { SignatureCapture } from "../components/SignaturePad";
import { VehicleDetailsForm } from "../components/VehicleDetailsForm";
import { RejectionBanner } from "../components/RejectionBanner";
import { CommentsPanel } from "../components/CommentsPanel";
import { Button } from "../components/Button";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { toast } from "../components/Toast";
import { formatDateTime } from "../lib/time";
import styles from "./ReviewScreen.module.css";
import wodStyles from "./WODetail.module.css";

interface Props {
  wo: WorkOrder;
}

type TabId = "photos" | "service" | "customer" | "comments";

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  badge?: { count: string; tone: "ok" | "missing" };
}

export function ReviewScreen({ wo }: Props) {
  const navigate = useNavigate();
  const completeJob = useStore((s) => s.completeJob);
  const setNote = useStore((s) => s.setNote);
  const addPhoto = useStore((s) => s.addPhoto);
  const removePhoto = useStore((s) => s.removePhoto);
  const addDocument = useStore((s) => s.addDocument);
  const removeDocument = useStore((s) => s.removeDocument);

  const [active, setActive] = useState<TabId>("photos");
  const [confirm, setConfirm] = useState(false);

  const isRejected = wo.woStatus === "Rejected";

  const reqPre = wo.sla.preServicePhotoSlots.filter((s) => s.required).length;
  const havePre = wo.sla.preServicePhotoSlots.filter(
    (s) =>
      s.required && wo.preServicePhotos.some((p) => p.slotLabel === s.label),
  ).length;
  const reqPost = wo.sla.postServicePhotoSlots.filter((s) => s.required).length;
  const havePost = wo.sla.postServicePhotoSlots.filter(
    (s) =>
      s.required && wo.postServicePhotos.some((p) => p.slotLabel === s.label),
  ).length;
  const totalReq = reqPre + reqPost;
  const totalHave = havePre + havePost;

  const tabs: TabDef[] = useMemo(
    () => [
      {
        id: "photos",
        label: "Photos",
        icon: <Camera size={14} />,
        badge: totalReq
          ? {
              count: `${totalHave}/${totalReq}`,
              tone: totalHave === totalReq ? "ok" : "missing",
            }
          : undefined,
      },
      {
        id: "service",
        label: "Service",
        icon: <ClipboardList size={14} />,
        badge: {
          count: `${wo.lineItems.length}`,
          tone: "ok",
        },
      },
      {
        id: "customer",
        label: "Customer",
        icon: <UserCheck size={14} />,
        badge: wo.signature
          ? { count: "✓", tone: "ok" }
          : wo.customerNotAvailableAt
            ? { count: "n/a", tone: "missing" }
            : { count: "!", tone: "missing" },
      },
      {
        id: "comments",
        label: "Comments",
        icon: <MessageSquare size={14} />,
        badge: wo.comments.length
          ? { count: `${wo.comments.length}`, tone: "ok" }
          : undefined,
      },
    ],
    [
      totalHave,
      totalReq,
      wo.lineItems.length,
      wo.signature,
      wo.customerNotAvailableAt,
      wo.comments.length,
    ],
  );

  const missing = [
    ...wo.sla.preServicePhotoSlots
      .filter(
        (s) =>
          s.required &&
          !wo.preServicePhotos.some((p) => p.slotLabel === s.label),
      )
      .map((s) => `Pre: ${s.label}`),
    ...wo.sla.postServicePhotoSlots
      .filter(
        (s) =>
          s.required &&
          !wo.postServicePhotos.some((p) => p.slotLabel === s.label),
      )
      .map((s) => `Post: ${s.label}`),
  ];

  const handleSubmit = async () => {
    setConfirm(false);
    await completeJob(wo.id);
    toast.success(
      isRejected
        ? `${wo.number} resubmitted to billing.`
        : `${wo.number} sent to billing — job complete.`,
    );
    navigate(`/wo/${wo.id}`, { replace: true });
  };

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
        <div className={styles.timeStack}>
          <Stamp label="Left Site" iso={wo.leftSiteAt} />
          {wo.completedAt && <Stamp label="Completed" iso={wo.completedAt} />}
        </div>
      </header>

      {isRejected && wo.currentRejection && (
        <RejectionBanner
          rejection={wo.currentRejection}
          resubmissionCount={wo.resubmissionCount}
        />
      )}

      <Stepper current={wo.woStatus} />

      <nav className={styles.tabs}>
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`${styles.tab} ${active === t.id ? styles.tabActive : ""}`}
            onClick={() => setActive(t.id)}
          >
            {t.icon}
            <span>{t.label}</span>
            {t.badge && (
              <span className={`${styles.tabBadge} ${styles[`tabBadge_${t.badge.tone}`]}`}>
                {t.badge.count}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className={styles.tabBody}>
        {active === "photos" && (
          <>
            <Section title="Pre-Service Photos">
              <PhotoSlots
                slots={wo.sla.preServicePhotoSlots}
                photos={wo.preServicePhotos}
                onAdd={(slotLabel, dataUrl) =>
                  addPhoto(wo.id, "preServicePhotos", slotLabel, dataUrl)
                }
                onRemove={(id) => removePhoto(wo.id, "preServicePhotos", id)}
              />
            </Section>
            <Section title="Post-Service Photos">
              <PhotoSlots
                slots={wo.sla.postServicePhotoSlots}
                photos={wo.postServicePhotos}
                onAdd={(slotLabel, dataUrl) =>
                  addPhoto(wo.id, "postServicePhotos", slotLabel, dataUrl)
                }
                onRemove={(id) => removePhoto(wo.id, "postServicePhotos", id)}
              />
            </Section>
            <Section title="Documents">
              <h4>Pre-Service</h4>
              <DocumentList
                docs={wo.preServiceDocuments}
                onAdd={(f) => addDocument(wo.id, "preServiceDocuments", f)}
                onRemove={(id) =>
                  removeDocument(wo.id, "preServiceDocuments", id)
                }
              />
              <h4 style={{ marginTop: 14 }}>Post-Service</h4>
              <DocumentList
                docs={wo.postServiceDocuments}
                onAdd={(f) => addDocument(wo.id, "postServiceDocuments", f)}
                onRemove={(id) =>
                  removeDocument(wo.id, "postServiceDocuments", id)
                }
              />
            </Section>
          </>
        )}

        {active === "service" && (
          <>
            <Section title="Services Performed">
              <LineItems woId={wo.id} items={wo.lineItems} />
            </Section>
            <Section title="Service Notes">
              <textarea
                value={wo.serviceNotes ?? ""}
                onChange={(e) => setNote(wo.id, "serviceNotes", e.target.value)}
              />
            </Section>
            <Section title="Pre-Service Notes">
              <textarea
                value={wo.preServiceNotes ?? ""}
                onChange={(e) =>
                  setNote(wo.id, "preServiceNotes", e.target.value)
                }
              />
            </Section>
            <Section title="Post-Service Notes">
              <textarea
                value={wo.postServiceNotes ?? ""}
                onChange={(e) =>
                  setNote(wo.id, "postServiceNotes", e.target.value)
                }
              />
            </Section>
          </>
        )}

        {active === "customer" && (
          <>
            <Section
              title="Customer Signature"
              description="Captured once and immutable — see SAC-27."
            >
              <SignatureCapture
                signature={wo.signature}
                customerNotAvailableAt={wo.customerNotAvailableAt}
                readOnly
                onCapture={() => {}}
                onCustomerNotAvailable={() => {}}
              />
            </Section>
            <Section
              title="Service Vehicle"
              description="Locked at Leave for Location — BA can correct via US-BILL-006 with audit."
            >
              <VehicleDetailsForm
                value={wo.vehicle}
                readOnly
                onChange={() => {}}
              />
            </Section>
            <Section title="Left Site Notes">
              <textarea
                value={wo.leftSiteNotes ?? ""}
                onChange={(e) =>
                  setNote(wo.id, "leftSiteNotes", e.target.value)
                }
                placeholder="Optional — anything you noticed after departure"
              />
            </Section>
            {isRejected && (
              <Section
                title="Response to Rejection"
                description="Explain what you changed to address the rejection. Saved to the rejection history row on resubmit (Gap K)."
              >
                <textarea
                  value={wo.rejectionResponseNotes ?? ""}
                  onChange={(e) =>
                    setNote(wo.id, "rejectionResponseNotes", e.target.value)
                  }
                  placeholder="e.g. Added the torque wrench photo per Swift SLA requirement."
                />
              </Section>
            )}
          </>
        )}

        {active === "comments" && <CommentsPanel wo={wo} />}
      </div>

      <div className={styles.bar}>
        <div className={styles.hint}>
          {isRejected
            ? "When you're done addressing the rejection, tap Complete Job to resubmit."
            : missing.length > 0
              ? `${missing.length} required item(s) missing — BA will see the flag.`
              : "Ready to send to billing."}
        </div>
        <div className={styles.btns}>
          <Button size="lg" variant="secondary" onClick={() => navigate("/")}>
            Back
          </Button>
          <Button
            size="xl"
            variant="primary"
            onClick={() => setConfirm(true)}
            leftIcon={
              isRejected ? <Send size={20} /> : <CheckCheck size={20} />
            }
          >
            {isRejected ? "Resubmit (Complete Job)" : "Complete Job"}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirm}
        title={isRejected ? "Resubmit to billing?" : "Complete this work order?"}
        description={
          isRejected ? (
            <>
              Your response will be paired with the BA's rejection reason in the
              audit history. The WO returns to the billing queue with a
              <strong> Resubmitted</strong> badge.
            </>
          ) : (
            <>
              After completion, only photos can be edited until the billing
              agent reviews. Once the BA approves, the WO is fully locked.
            </>
          )
        }
        confirmLabel={isRejected ? "Yes, Resubmit" : "Yes, Complete"}
        onCancel={() => setConfirm(false)}
        onConfirm={handleSubmit}
      />
    </>
  );
}

function Stamp({ label, iso }: { label: string; iso?: string }) {
  if (!iso) return null;
  return (
    <div className={styles.stamp}>
      <div className={styles.stampLabel}>{label}</div>
      <div className={styles.stampValue}>{formatDateTime(iso)}</div>
    </div>
  );
}
