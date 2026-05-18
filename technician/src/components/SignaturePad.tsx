import { useEffect, useRef, useState } from "react";
import SignaturePadLib from "signature_pad";
import { Eraser, Lock, UserX } from "lucide-react";
import type { Signature } from "../lib/types";
import { Button } from "./Button";
import { formatDateTime } from "../lib/time";
import styles from "./SignaturePad.module.css";

interface Props {
  signature?: Signature;
  customerNotAvailableAt?: string;
  readOnly?: boolean;
  onCapture: (sig: { imageDataUrl: string; signerName: string }) => void;
  onCustomerNotAvailable: () => void;
}

export function SignatureCapture({
  signature,
  customerNotAvailableAt,
  readOnly,
  onCapture,
  onCustomerNotAvailable,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePadLib | null>(null);
  const [signerName, setSignerName] = useState("");

  useEffect(() => {
    if (signature || customerNotAvailableAt || readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Hi-DPI sizing
    const resize = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext("2d")?.scale(ratio, ratio);
      padRef.current?.clear();
    };
    padRef.current = new SignaturePadLib(canvas, {
      penColor: "#0f172a",
      backgroundColor: "rgba(255,255,255,0)",
    });
    resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      padRef.current?.off();
      padRef.current = null;
    };
  }, [signature, customerNotAvailableAt, readOnly]);

  if (customerNotAvailableAt) {
    return (
      <div className={styles.notAvailable}>
        <UserX size={22} />
        <div>
          <div className={styles.notTitle}>Customer Not Available</div>
          <div className={styles.notSub}>
            Marked at {formatDateTime(customerNotAvailableAt)}. No in-app undo —
            if this was a mistake, the billing agent must reject after submission
            to reopen the work order.
          </div>
        </div>
      </div>
    );
  }

  if (signature) {
    return (
      <div className={styles.captured}>
        <div className={styles.capHead}>
          <Lock size={16} />
          <span>Signature captured (immutable)</span>
        </div>
        <div className={styles.capRow}>
          <div className={styles.capLabel}>Signer name</div>
          <div className={styles.capValue}>{signature.signerName}</div>
        </div>
        <div className={styles.capRow}>
          <div className={styles.capLabel}>Captured at</div>
          <div className={styles.capValue}>
            {formatDateTime(signature.capturedAt)}
          </div>
        </div>
        {signature.imageDataUrl && (
          <img
            src={signature.imageDataUrl}
            alt="Customer signature"
            className={styles.capImage}
          />
        )}
      </div>
    );
  }

  if (readOnly) {
    return (
      <div className={styles.captured}>
        <div className={styles.capHead}>
          <Lock size={16} /> Signature not yet captured
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pad}>
      <label className={styles.signerLabel}>Signer name</label>
      <input
        type="text"
        value={signerName}
        onChange={(e) => setSignerName(e.target.value)}
        placeholder="Print signer's name"
      />
      <div className={styles.canvasWrap}>
        <canvas ref={canvasRef} className={styles.canvas} />
        <button
          type="button"
          className={styles.clearBtn}
          onClick={() => padRef.current?.clear()}
          aria-label="Clear signature"
        >
          <Eraser size={14} /> Clear
        </button>
      </div>
      <div className={styles.actions}>
        <Button
          variant="primary"
          disabled={!signerName.trim()}
          onClick={() => {
            if (!padRef.current || padRef.current.isEmpty()) return;
            const dataUrl = padRef.current.toDataURL("image/png");
            onCapture({ imageDataUrl: dataUrl, signerName: signerName.trim() });
          }}
        >
          Capture signature
        </Button>
        <Button variant="secondary" onClick={onCustomerNotAvailable}>
          Customer Not Available
        </Button>
      </div>
      <div className={styles.hint}>
        Captured once and immutable — see SAC-27. "Customer Not Available"
        cannot be undone in-app (Gap C).
      </div>
    </div>
  );
}
