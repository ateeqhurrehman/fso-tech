import { useRef } from "react";
import { FilePlus2, FileText, X } from "lucide-react";
import type { CapturedDocument } from "../lib/types";
import { toast } from "./Toast";
import styles from "./DocumentList.module.css";

interface Props {
  docs: CapturedDocument[];
  readOnly?: boolean;
  onAdd: (file: { name: string; size: number }) => void;
  onRemove: (id: string) => void;
}

const MAX_BYTES = 25 * 1024 * 1024;

export function DocumentList({ docs, readOnly, onAdd, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_BYTES) {
      toast.error(
        `File too large. Maximum 25 MB per document. ${file.name} is ${(file.size / 1024 / 1024).toFixed(1)} MB.`,
      );
      return;
    }
    onAdd({ name: file.name, size: file.size });
  };

  return (
    <div className={styles.list}>
      {docs.length === 0 && (
        <div className={styles.empty}>No documents uploaded.</div>
      )}
      {docs.map((d) => (
        <div key={d.id} className={styles.row}>
          <FileText size={20} className={styles.icon} />
          <div className={styles.meta}>
            <div className={styles.name}>{d.fileName}</div>
            <div className={styles.size}>
              {(d.fileSize / 1024).toFixed(1)} KB
            </div>
          </div>
          {!readOnly && (
            <button
              type="button"
              className={styles.remove}
              aria-label="Remove document"
              onClick={() => onRemove(d.id)}
            >
              <X size={16} />
            </button>
          )}
        </div>
      ))}
      {!readOnly && (
        <>
          <button
            type="button"
            className={styles.add}
            onClick={() => inputRef.current?.click()}
          >
            <FilePlus2 size={18} /> Upload document
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              if (inputRef.current) inputRef.current.value = "";
            }}
          />
          <div className={styles.hint}>Max 25 MB per document — PDF, JPG, PNG.</div>
        </>
      )}
    </div>
  );
}
