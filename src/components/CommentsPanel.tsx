import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import type { WorkOrder } from "../lib/types";
import { useStore } from "../lib/store";
import { formatRelative } from "../lib/time";
import { Button } from "./Button";
import styles from "./CommentsPanel.module.css";

interface Props {
  wo: WorkOrder;
  /** Hidden in driver-safe En Route view */
  hidden?: boolean;
  /** Read-only (after Complete Job) */
  readOnly?: boolean;
}

export function CommentsPanel({ wo, hidden, readOnly }: Props) {
  const postComment = useStore((s) => s.postComment);
  const [text, setText] = useState("");
  if (hidden) return null;

  // Per Gap G — only the most recent comment is surfaced.
  const latest = wo.comments[wo.comments.length - 1];

  return (
    <section className={styles.panel}>
      <header className={styles.head}>
        <MessageSquare size={18} />
        <h3>Comments</h3>
        <span className={styles.sub}>
          Operational observations · latest-only display
        </span>
      </header>

      {latest ? (
        <div className={styles.latest}>
          <div className={styles.meta}>
            <strong>{latest.authorName}</strong>
            <span>@ {labelStatus(latest.statusAtCreation)}</span>
            <span className={styles.dot} />
            <span>{formatRelative(latest.createdAt)}</span>
          </div>
          <div className={styles.text}>{latest.text}</div>
        </div>
      ) : (
        <div className={styles.empty}>No comments yet.</div>
      )}

      {wo.comments.length > 1 && (
        <div className={styles.history}>
          {wo.comments.length - 1} earlier comment(s) preserved for audit (not
          shown in UI).
        </div>
      )}

      {!readOnly && (
        <div className={styles.composer}>
          <textarea
            placeholder="Add a comment (e.g. traffic delay, off-scope observation)…"
            maxLength={2000}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button
            variant="primary"
            size="md"
            disabled={!text.trim()}
            leftIcon={<Send size={16} />}
            onClick={async () => {
              await postComment(wo.id, text);
              setText("");
            }}
          >
            Post
          </Button>
        </div>
      )}
    </section>
  );
}

function labelStatus(s: WorkOrder["woStatus"]) {
  return s.replace(/_/g, " ");
}
