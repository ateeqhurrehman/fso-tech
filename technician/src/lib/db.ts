// Thin IndexedDB wrapper using `idb`. Mirrors the v3.5 SDD object-store sketch
// (`live_job_wo`, `upcoming_wos`, etc.) collapsed for the demo into a single
// `work_orders` store keyed by id + a `meta` store for the user/preferences.

import { openDB, type IDBPDatabase } from "idb";
import type { WorkOrder, TechUser, AppNotification } from "./types";
import { SEED_USER, seedWorkOrders } from "./seed";

const DB_NAME = "mts-fso-technician";
const DB_VERSION = 3;

interface Schema {
  work_orders: { key: string; value: WorkOrder };
  meta: { key: string; value: unknown };
  notifications: { key: string; value: AppNotification };
}

let dbPromise: Promise<IDBPDatabase<Schema>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<Schema>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, _newVersion, tx) {
        if (!db.objectStoreNames.contains("work_orders")) {
          db.createObjectStore("work_orders", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("meta")) {
          db.createObjectStore("meta");
        }
        if (!db.objectStoreNames.contains("notifications")) {
          db.createObjectStore("notifications", { keyPath: "id" });
        }
        if (oldVersion > 0 && oldVersion < 3) {
          // Phase H + H.5: clear seed flag so loadInitialState re-seeds with
          // Pre-G fields (serviceTarget, breakdownLocationNotes,
          // dispatcherServiceNotes, dispatcherNotes on line items) and
          // Phase H.5 SLA content (6-item specialHandlingMessages on
          // bridgestoneSLA / walkInSLA / new jbHuntSLA).
          // Existing work_orders records are overwritten by tx.store.put
          // on seed re-run (keyPath "id" collides → upsert).
          tx.objectStore("meta").delete("seeded");
        }
      },
    });
  }
  return dbPromise;
}

export async function loadInitialState(): Promise<{
  user: TechUser;
  workOrders: WorkOrder[];
  notifications: AppNotification[];
  darkMode: boolean;
  notificationsEnabled: boolean;
}> {
  const db = await getDB();
  let user = (await db.get("meta", "user")) as TechUser | undefined;
  let seeded = (await db.get("meta", "seeded")) as boolean | undefined;
  const darkMode = ((await db.get("meta", "darkMode")) as boolean) ?? false;
  const notificationsEnabled =
    ((await db.get("meta", "notificationsEnabled")) as boolean) ?? true;

  if (!user) {
    user = SEED_USER;
    await db.put("meta", user, "user");
  }
  if (!seeded) {
    const seed = seedWorkOrders();
    const tx = db.transaction("work_orders", "readwrite");
    for (const wo of seed) await tx.store.put(wo);
    await tx.done;
    await db.put("meta", true, "seeded");
    seeded = true;
  }
  const workOrders = await db.getAll("work_orders");
  const notifications = await db.getAll("notifications");
  notifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { user, workOrders, notifications, darkMode, notificationsEnabled };
}

export async function persistWorkOrder(wo: WorkOrder) {
  const db = await getDB();
  await db.put("work_orders", wo);
}

export async function persistNotification(n: AppNotification) {
  const db = await getDB();
  await db.put("notifications", n);
}

export async function setMeta<T>(key: string, value: T) {
  const db = await getDB();
  await db.put("meta", value, key);
}

export async function resetAll() {
  const db = await getDB();
  await db.clear("work_orders");
  await db.clear("meta");
  await db.clear("notifications");
  dbPromise = null;
}
