import { useRef } from "react";
import { Camera, Upload, X } from "lucide-react";
import type { CapturedPhoto, PhotoSlot as Slot } from "../lib/types";
import styles from "./PhotoSlot.module.css";

interface Props {
  slots: Slot[];
  photos: CapturedPhoto[];
  readOnly?: boolean;
  onAdd: (slotLabel: string, dataUrl: string) => void;
  onRemove: (photoId: string) => void;
}

export function PhotoSlots({ slots, photos, readOnly, onAdd, onRemove }: Props) {
  return (
    <div className={styles.grid}>
      {slots.map((slot) => {
        const photo = photos.find((p) => p.slotLabel === slot.label);
        return (
          <PhotoSlotCard
            key={slot.label}
            slot={slot}
            photo={photo}
            readOnly={readOnly}
            onAdd={(d) => onAdd(slot.label, d)}
            onRemove={() => photo && onRemove(photo.id)}
          />
        );
      })}
      {/* Extras outside SLA slots */}
      {photos
        .filter((p) => !slots.some((s) => s.label === p.slotLabel))
        .map((p) => (
          <PhotoSlotCard
            key={p.id}
            slot={{ label: p.slotLabel, required: false }}
            photo={p}
            readOnly={readOnly}
            onAdd={() => {}}
            onRemove={() => onRemove(p.id)}
          />
        ))}
    </div>
  );
}

interface CardProps {
  slot: Slot;
  photo?: CapturedPhoto;
  readOnly?: boolean;
  onAdd: (dataUrl: string) => void;
  onRemove: () => void;
}

function PhotoSlotCard({ slot, photo, readOnly, onAdd, onRemove }: CardProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onAdd(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Simulated camera capture — uses placeholder gradient since we can't
  // reliably trigger the iPad camera in a demo. The hidden file input still
  // accepts a real image upload as fallback.
  const simulateCapture = () => {
    const colors = ["#2563eb", "#15803d", "#d97706", "#c8102e", "#7c3aed"];
    const c = colors[Math.floor(Math.random() * colors.length)];
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 220;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "bold 14px -apple-system, sans-serif";
    ctx.fillText(slot.label, 14, 30);
    ctx.font = "12px -apple-system, sans-serif";
    ctx.fillText(new Date().toLocaleString(), 14, 50);
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillRect(0, canvas.height - 24, canvas.width, 24);
    ctx.fillStyle = "rgba(15,23,42,0.85)";
    ctx.font = "11px -apple-system, sans-serif";
    ctx.fillText("[demo photo capture]", 14, canvas.height - 8);
    onAdd(canvas.toDataURL("image/png"));
  };

  return (
    <div className={`${styles.slot} ${photo ? styles.filled : ""}`}>
      <div className={styles.slotHead}>
        <div className={styles.slotLabel}>{slot.label}</div>
        {slot.required && <div className={styles.required}>Required</div>}
      </div>
      {slot.description && (
        <div className={styles.slotDesc}>{slot.description}</div>
      )}

      {photo ? (
        <div className={styles.photoWrap}>
          <img src={photo.dataUrl} alt={slot.label} className={styles.photo} />
          {!readOnly && (
            <button
              type="button"
              className={styles.remove}
              onClick={onRemove}
              aria-label="Remove photo"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ) : (
        !readOnly && (
          <>
            <button
              type="button"
              className={styles.capture}
              onClick={simulateCapture}
              aria-label={`Take photo: ${slot.label}`}
            >
              <Camera size={28} />
              <span>Tap to capture</span>
            </button>
            <button
              type="button"
              className={styles.uploadLink}
              onClick={() => inputRef.current?.click()}
            >
              <Upload size={11} /> or upload from gallery
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </>
        )
      )}
    </div>
  );
}
