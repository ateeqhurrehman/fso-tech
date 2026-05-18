import { Wifi, WifiOff } from "lucide-react";
import { useStore } from "../lib/store";
import styles from "./ConnectivityIndicator.module.css";

export function ConnectivityChip() {
  const online = useStore((s) => s.online);
  return (
    <div className={`${styles.chip} ${online ? styles.on : styles.off}`}>
      {online ? <Wifi size={14} /> : <WifiOff size={14} />}
      <span>{online ? "Online" : "Offline"}</span>
    </div>
  );
}

export function OfflineBanner() {
  const online = useStore((s) => s.online);
  if (online) return null;
  return (
    <div className={styles.banner} role="status">
      <WifiOff size={16} />
      <span>You are offline. Data is saved locally and will sync when connectivity returns.</span>
    </div>
  );
}
