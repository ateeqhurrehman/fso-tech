import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";
import { Header } from "./Header";
import { ToastHost } from "./Toast";
import { OfflineBanner } from "./ConnectivityIndicator";
import styles from "./AppShell.module.css";

export function AppShell() {
  const hydrate = useStore((s) => s.hydrate);
  const hydrated = useStore((s) => s.hydrated);
  const darkMode = useStore((s) => s.darkMode);
  const setOnline = useStore((s) => s.setOnline);
  const navigate = useNavigate();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
  }, [darkMode]);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, [setOnline]);

  if (!hydrated) {
    return (
      <div className={styles.loading}>
        <div>Loading…</div>
      </div>
    );
  }

  return (
    <div className={`app ${styles.shell}`}>
      <Header onLogoClick={() => navigate("/")} />
      <OfflineBanner />
      <main className={styles.main}>
        <Outlet />
      </main>
      <ToastHost />
    </div>
  );
}
