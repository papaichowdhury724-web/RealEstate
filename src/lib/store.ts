import { desc, eq } from "drizzle-orm";
import { defaultConfig, uid } from "./defaults";
import type { Booking, Enquiry, SiteConfig } from "./types";
import { isFirebaseEnabled, getFirebaseApp, FB } from "./firebase/client";

/* ---------------- deep merge so new keys always exist ---------------- */
function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
export function mergeConfig(base: unknown, over: unknown): unknown {
  if (!isObj(base) || !isObj(over)) return over === undefined ? base : over;
  const out: Record<string, unknown> = { ...base };
  for (const k of Object.keys(over)) out[k] = mergeConfig(base[k], over[k]);
  return out;
}

// Upgrade configs saved before newer walkthrough fields existed.
function migrate(cfg: SiteConfig): SiteConfig {
  const d = defaultConfig.sections.find((s) => s.type === "walkthrough");
  if (!d) return cfg;
  return {
    ...cfg,
    sections: cfg.sections.map((s) => {
      if (s.type !== "walkthrough") return s;
      const old = s.image.includes("31737862") || s.image.endsWith("/wt-exterior.jpg");
      return {
        ...s,
        image: old ? d.image : s.image,
        foyerImage: s.foyerImage ?? d.foyerImage,
        doorX: old ? d.doorX : s.doorX ?? d.doorX,
        doorY: old ? d.doorY : s.doorY ?? d.doorY,
        doorW: old ? d.doorW : s.doorW ?? d.doorW,
        doorH: old ? d.doorH : s.doorH ?? d.doorH,
        price: s.price ?? d.price,
        dealLabel: s.dealLabel ?? d.dealLabel,
        dealNote: s.dealNote ?? d.dealNote,
      };
    }),
  };
}

async function pg() {
  const { db } = await import("@/db");
  const schema = await import("@/db/schema");
  return { db, ...schema };
}
async function fs() {
  const m = await import("firebase/firestore/lite");
  return { ...m, fdb: m.getFirestore(getFirebaseApp()) };
}

/* ---------------- config ---------------- */
export async function getConfig(strict = false): Promise<SiteConfig> {
  try {
    let data: unknown = null;
    if (isFirebaseEnabled()) {
      const f = await fs();
      const snap = await f.getDoc(f.doc(f.fdb, ...FB.settingsDoc));
      data = snap.exists() ? snap.data() : null;
    } else {
      const { db, settings } = await pg();
      const rows = await db.select().from(settings).where(eq(settings.id, "site"));
      data = rows[0]?.data ?? null;
    }
    return migrate((data ? mergeConfig(defaultConfig, data) : defaultConfig) as SiteConfig);
  } catch (e) {
    // strict (admin): never show defaults when the real config couldn't be read,
    // otherwise saving would overwrite the stored site with defaults.
    if (strict) throw e;
    console.error("getConfig failed, using defaults", e);
    return defaultConfig;
  }
}

export async function saveConfig(cfg: SiteConfig) {
  if (isFirebaseEnabled()) {
    const f = await fs();
    await f.setDoc(f.doc(f.fdb, ...FB.settingsDoc), JSON.parse(JSON.stringify(cfg)));
    return;
  }
  const { db, settings } = await pg();
  await db.insert(settings).values({ id: "site", data: cfg })
    .onConflictDoUpdate({ target: settings.id, set: { data: cfg, updatedAt: new Date() } });
}

/* ---------------- bookings ---------------- */
export async function addBooking(data: Record<string, string>) {
  const id = uid() + uid();
  const createdAt = new Date().toISOString();
  if (isFirebaseEnabled()) {
    const f = await fs();
    await f.setDoc(f.doc(f.fdb, FB.bookings, id), { data, status: "pending", createdAt });
  } else {
    const { db, bookings } = await pg();
    await db.insert(bookings).values({ id, data, status: "pending" });
  }
  return id;
}
export async function listBookings(): Promise<Booking[]> {
  if (isFirebaseEnabled()) {
    const f = await fs();
    const s = await f.getDocs(f.query(f.collection(f.fdb, FB.bookings), f.orderBy("createdAt", "desc")));
    return s.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Booking, "id">) }));
  }
  const { db, bookings } = await pg();
  const rows = await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  return rows.map((r) => ({ id: r.id, data: r.data as Record<string, string>, status: r.status as Booking["status"], createdAt: r.createdAt.toISOString() }));
}
export async function updateBooking(id: string, status: string) {
  if (isFirebaseEnabled()) {
    const f = await fs();
    await f.updateDoc(f.doc(f.fdb, FB.bookings, id), { status });
    return;
  }
  const { db, bookings } = await pg();
  await db.update(bookings).set({ status }).where(eq(bookings.id, id));
}
export async function deleteBooking(id: string) {
  if (isFirebaseEnabled()) {
    const f = await fs();
    await f.deleteDoc(f.doc(f.fdb, FB.bookings, id));
    return;
  }
  const { db, bookings } = await pg();
  await db.delete(bookings).where(eq(bookings.id, id));
}

/* ---------------- enquiries ---------------- */
type EnquiryInput = Omit<Enquiry, "id" | "status" | "createdAt">;
export async function addEnquiry(data: EnquiryInput) {
  const id = uid() + uid();
  const createdAt = new Date().toISOString();
  if (isFirebaseEnabled()) {
    const f = await fs();
    await f.setDoc(f.doc(f.fdb, FB.enquiries, id), { ...data, status: "new", createdAt });
  } else {
    const { db, enquiries } = await pg();
    await db.insert(enquiries).values({ id, data, status: "new" });
  }
  return id;
}
export async function listEnquiries(): Promise<Enquiry[]> {
  if (isFirebaseEnabled()) {
    const f = await fs();
    const s = await f.getDocs(f.query(f.collection(f.fdb, FB.enquiries), f.orderBy("createdAt", "desc")));
    return s.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Enquiry, "id">) }));
  }
  const { db, enquiries } = await pg();
  const rows = await db.select().from(enquiries).orderBy(desc(enquiries.createdAt));
  return rows.map((r) => ({ ...(r.data as EnquiryInput), id: r.id, status: r.status as Enquiry["status"], createdAt: r.createdAt.toISOString() }));
}
export async function updateEnquiry(id: string, status: string) {
  if (isFirebaseEnabled()) {
    const f = await fs();
    await f.updateDoc(f.doc(f.fdb, FB.enquiries, id), { status });
    return;
  }
  const { db, enquiries } = await pg();
  await db.update(enquiries).set({ status }).where(eq(enquiries.id, id));
}
export async function deleteEnquiry(id: string) {
  if (isFirebaseEnabled()) {
    const f = await fs();
    await f.deleteDoc(f.doc(f.fdb, FB.enquiries, id));
    return;
  }
  const { db, enquiries } = await pg();
  await db.delete(enquiries).where(eq(enquiries.id, id));
}

/* ---------------- media ---------------- */
export async function uploadMedia(file: File): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer());
  const id = uid() + uid();
  if (isFirebaseEnabled()) {
    const st = await import("firebase/storage");
    const storage = st.getStorage(getFirebaseApp());
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(-80) || "file";
    const r = st.ref(storage, `${FB.storageMedia}/${id}-${safeName}`);
    await st.uploadBytes(r, new Uint8Array(buf), { contentType: file.type });
    return st.getDownloadURL(r);
  }
  const { db, media } = await pg();
  await db.insert(media).values({ id, name: file.name, mime: file.type || "application/octet-stream", bytes: buf });
  return `/api/media/${id}`;
}
export async function getMedia(id: string) {
  const { db, media } = await pg();
  const rows = await db.select().from(media).where(eq(media.id, id));
  return rows[0] ?? null;
}
