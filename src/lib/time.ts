export const nowIso = () => new Date().toISOString();

export function uid(prefix = "id"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function formatRelative(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.round(diffMs / 60_000);
  if (Math.abs(mins) < 1) return "just now";
  if (mins < 0) {
    const future = Math.abs(mins);
    if (future < 60) return `in ${future} min`;
    return `in ${Math.round(future / 60)} hr`;
  }
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.round(hrs / 24)} d ago`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function minutesBetween(aIso: string, bIso: string): number {
  return Math.round(
    (new Date(bIso).getTime() - new Date(aIso).getTime()) / 60_000,
  );
}

export function etaCountdown(expectedArrivalAtIso: string): {
  text: string;
  exceeded: boolean;
} {
  const ms = new Date(expectedArrivalAtIso).getTime() - Date.now();
  const abs = Math.abs(ms);
  const mins = Math.floor(abs / 60_000);
  const secs = Math.floor((abs % 60_000) / 1000);
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (ms >= 0) return { text: `${pad(mins)}:${pad(secs)}`, exceeded: false };
  return {
    text: `ETA exceeded by ${pad(mins)}:${pad(secs)}`,
    exceeded: true,
  };
}
