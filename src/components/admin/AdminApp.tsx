"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Booking, Enquiry, SiteConfig } from "@/lib/types";
import { defaultConfig } from "@/lib/defaults";
import { Btn, Card } from "./fields";
import {
  AnimationsPanel, BookingPanel, FeaturesPanel, FooterPanel, HeaderPanel, OffersPanel, PropertiesPanel,
  SectionsPanel, SitePanel, TextsPanel, ThemePanel, UpdatesPanel, type Setter,
} from "./panels";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: "◧" },
  { id: "site", label: "Site Settings", icon: "⚙" },
  { id: "texts", label: "Website Texts", icon: "T" },
  { id: "header", label: "Header", icon: "▔" },
  { id: "footer", label: "Footer", icon: "▁" },
  { id: "sections", label: "Sections", icon: "☰" },
  { id: "properties", label: "Properties", icon: "⌂" },
  { id: "offers", label: "Offers & Coupons", icon: "%" },
  { id: "updates", label: "Updates & Popups", icon: "✉" },
  { id: "features", label: "Features", icon: "⏻" },
  { id: "booking", label: "Booking Form", icon: "✎" },
  { id: "theme", label: "Theme & Fonts", icon: "◐" },
  { id: "animations", label: "Animations", icon: "✦" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export function Login() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    try {
      const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
      if (r.ok) location.reload(); else setErr("Incorrect password");
    } catch { setErr("Network error — please try again"); }
  };
  return (
    <div className="adm grid min-h-screen place-items-center bg-[#0a0b10] p-4 text-zinc-100">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-[#12141b] p-8 shadow-2xl">
        <div className="mb-1 text-xs uppercase tracking-[0.3em] text-[#d4af6a]">Admin</div>
        <h1 className="mb-6 font-serif text-3xl">Control Room</h1>
        <input type="password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
        {err && <p className="mt-2 text-sm text-red-400">{err}</p>}
        <button className="mt-4 w-full rounded-xl bg-[#d4af6a] py-3 font-semibold text-black">Enter</button>
        {process.env.NODE_ENV !== "production" && <p className="mt-4 text-center text-xs text-zinc-500">Dev password: <code>admin123</code> (set ADMIN_PASSWORD in .env)</p>}
      </form>
    </div>
  );
}

export default function AdminApp({ initial, firebase }: { initial: SiteConfig; firebase: boolean }) {
  const [cfg, setCfg] = useState<SiteConfig>(initial);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const [tab, setTab] = useState<Tab>("dashboard");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [nav, setNav] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const dirty = JSON.stringify(cfg) !== saved;

  const set: Setter = useCallback((fn) => setCfg((c) => fn(c)), []);

  const push = useCallback(() => {
    frame.current?.contentWindow?.postMessage({ type: "cfg-preview", cfg }, location.origin);
  }, [cfg]);
  useEffect(() => { const t = setTimeout(push, 200); return () => clearTimeout(t); }, [push]);
  useEffect(() => {
    const h = (e: MessageEvent) => { if (e.origin === location.origin && e.data?.type === "preview-ready") push(); };
    window.addEventListener("message", h);
    return () => window.removeEventListener("message", h);
  }, [push]);
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2400); };
  const save = async () => {
    setSaving(true);
    let r: Response;
    try {
      r = await fetch("/api/config", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cfg) });
    } catch { setSaving(false); flash("Save failed — check your connection"); return; }
    setSaving(false);
    if (r.ok) {
      setSaved(JSON.stringify(cfg));
      if ("BroadcastChannel" in window) { const bc = new BroadcastChannel("site-config"); bc.postMessage("saved"); bc.close(); }
      flash("✓ Saved — live website updated");
    } else flash(r.status === 401 ? "Session expired, please log in again" : "Save failed");
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); save(); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  const exportJson = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(cfg, null, 2)], { type: "application/json" }));
    a.download = "site-config.json"; a.click();
  };
  const importJson = (file: File) => file.text().then((t) => { try { const c = JSON.parse(t); if (c.site) { setCfg({ ...defaultConfig, ...c }); flash("Imported — review & save"); } } catch { flash("Invalid JSON"); } });
  const logout = async () => { await fetch("/api/admin/login", { method: "DELETE" }); location.reload(); };

  const widths = { desktop: "100%", tablet: "820px", mobile: "390px" };
  const P = { cfg, set };

  return (
    <div className="adm flex h-[100dvh] flex-col bg-[#0a0b10] text-zinc-100">
      {/* top bar */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-zinc-800 px-3 md:px-5">
        <button className="text-xl lg:hidden" onClick={() => setNav(!nav)} aria-label="Menu">☰</button>
        <div className="mr-auto flex items-center gap-2">
          <span className="font-serif text-lg text-[#d4af6a]">{cfg.site.brand}</span>
          <span className="hidden text-xs text-zinc-500 sm:inline">Admin · {firebase ? "Firebase" : "Local DB"}</span>
        </div>
        <span className={`hidden text-xs md:inline ${dirty ? "text-amber-400" : "text-zinc-500"}`}>{dirty ? "● Unsaved changes" : "All changes saved"}</span>
        <Btn small onClick={() => setShowPreview(!showPreview)}>{showPreview ? "Hide preview" : "Preview"}</Btn>
        <a href="/" target="_blank" className="hidden rounded-lg border border-zinc-700 px-2.5 py-1 text-xs sm:inline">View site ↗</a>
        <Btn variant="gold" onClick={save} disabled={saving || !dirty}>{saving ? "Saving…" : "Save"}</Btn>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* sidebar */}
        <aside className={`${nav ? "fixed inset-y-14 left-0 z-40 flex" : "hidden"} w-60 shrink-0 flex-col overflow-y-auto border-r border-zinc-800 bg-[#0d0e14] p-3 lg:static lg:flex`}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => { setTab(t.id); setNav(false); }}
              className={`mb-0.5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${tab === t.id ? "bg-[#d4af6a]/15 text-[#d4af6a]" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"}`}>
              <span className="w-4 text-center">{t.icon}</span>{t.label}
            </button>
          ))}
          <div className="mt-auto space-y-1 border-t border-zinc-800 pt-3 text-xs">
            <button onClick={exportJson} className="block w-full rounded-lg px-3 py-2 text-left text-zinc-400 hover:bg-zinc-800/50">⇩ Export config</button>
            <label className="block w-full cursor-pointer rounded-lg px-3 py-2 text-zinc-400 hover:bg-zinc-800/50">⇧ Import config<input type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} /></label>
            <button onClick={() => { if (confirm("Reset everything to defaults? (you still need to Save)")) setCfg(defaultConfig); }} className="block w-full rounded-lg px-3 py-2 text-left text-zinc-400 hover:bg-zinc-800/50">↺ Reset to defaults</button>
            <button onClick={() => { setCfg(JSON.parse(saved)); }} disabled={!dirty} className="block w-full rounded-lg px-3 py-2 text-left text-zinc-400 hover:bg-zinc-800/50 disabled:opacity-40">✕ Discard changes</button>
            <button onClick={logout} className="block w-full rounded-lg px-3 py-2 text-left text-red-400 hover:bg-red-950/30">⎋ Log out</button>
          </div>
        </aside>

        {/* editor */}
        <main className={`min-w-0 overflow-y-auto p-4 md:p-6 ${showPreview ? "w-full xl:w-[46%] xl:shrink-0" : "flex-1"}`}>
          <h2 className="mb-5 font-serif text-2xl">{TABS.find((t) => t.id === tab)?.label}</h2>
          {tab === "dashboard" && <Dashboard cfg={cfg} />}
          {tab === "site" && <SitePanel {...P} />}
          {tab === "texts" && <TextsPanel {...P} />}
          {tab === "header" && <HeaderPanel {...P} />}
          {tab === "footer" && <FooterPanel {...P} />}
          {tab === "sections" && <SectionsPanel {...P} />}
          {tab === "properties" && <PropertiesPanel {...P} />}
          {tab === "offers" && <OffersPanel {...P} />}
          {tab === "updates" && <UpdatesPanel {...P} />}
          {tab === "features" && <FeaturesPanel {...P} />}
          {tab === "booking" && <BookingPanel {...P} />}
          {tab === "theme" && <ThemePanel {...P} />}
          {tab === "animations" && <AnimationsPanel {...P} />}
          <div className="h-24" />
        </main>

        {/* live preview */}
        {showPreview && (
          <section className="fixed inset-0 top-14 z-30 flex flex-col border-l border-zinc-800 bg-[#050608] xl:static xl:z-auto xl:flex-1">
            <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2 text-xs">
              <span className="mr-auto text-zinc-500">Live preview (unsaved changes shown)</span>
              {(["desktop", "tablet", "mobile"] as const).map((d) => (
                <button key={d} onClick={() => setDevice(d)} className={`rounded-md px-2.5 py-1 capitalize ${device === d ? "bg-[#d4af6a] text-black" : "text-zinc-400 hover:text-white"}`}>{d}</button>
              ))}
              <button onClick={() => { if (frame.current) frame.current.src = "/"; }} className="rounded-md px-2 py-1 text-zinc-400 hover:text-white" title="Reload">↻</button>
              <button onClick={() => setShowPreview(false)} className="rounded-md px-2 py-1 text-zinc-400 hover:text-white xl:hidden">✕</button>
            </div>
            <div className="flex min-h-0 flex-1 justify-center overflow-auto p-2">
              <iframe ref={frame} src="/" title="Preview" onLoad={push} className="h-full rounded-lg border border-zinc-800 bg-black transition-all duration-500" style={{ width: widths[device], maxWidth: "100%" }} />
            </div>
          </section>
        )}
      </div>

      {toast && <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#d4af6a] px-5 py-2.5 text-sm font-semibold text-black shadow-2xl">{toast}</div>}
    </div>
  );
}

function Dashboard({ cfg }: { cfg: SiteConfig }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [enq, setEnq] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [b, e] = await Promise.all([
        fetch("/api/bookings").then((r) => r.json()).catch(() => []),
        fetch("/api/enquiries").then((r) => r.json()).catch(() => []),
      ]);
      setBookings(Array.isArray(b) ? b : []); setEnq(Array.isArray(e) ? e : []);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const patch = async (url: string, id: string, status: string) => { await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) }); load(); };
  const del = async (url: string, id: string) => { if (confirm("Delete?")) { await fetch(`${url}?id=${id}`, { method: "DELETE" }); load(); } };

  const stats = [
    { l: "Live properties", v: cfg.properties.filter((p) => p.enabled).length },
    { l: "Visit bookings", v: bookings.length },
    { l: "Pending bookings", v: bookings.filter((b) => b.status === "pending").length },
    { l: "Enquiries", v: enq.length },
  ];
  const sel = "rounded-lg border border-zinc-700 bg-[#0f1117] px-2 py-1 text-xs";
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l} className="rounded-2xl border border-zinc-800 bg-[#12141b] p-4">
            <div className="font-serif text-3xl text-[#d4af6a]">{s.v}</div>
            <div className="mt-1 text-xs text-zinc-500">{s.l}</div>
          </div>
        ))}
      </div>
      <Card title="Site-visit bookings" actions={<Btn small onClick={load}>{loading ? "…" : "Refresh"}</Btn>}>
        {!bookings.length && <p className="text-sm text-zinc-500">No bookings yet.</p>}
        {bookings.map((b) => (
          <div key={b.id} className="rounded-xl border border-zinc-800 p-3">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="text-xs text-zinc-500">{new Date(b.createdAt).toLocaleString("en-IN")}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${b.status === "confirmed" ? "bg-emerald-900/50 text-emerald-300" : b.status === "cancelled" ? "bg-red-900/40 text-red-300" : "bg-amber-900/40 text-amber-300"}`}>{b.status}</span>
              <span className="ml-auto flex gap-2">
                <select className={sel} value={b.status} onChange={(e) => patch("/api/bookings", b.id, e.target.value)}>
                  <option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option>
                </select>
                <Btn small variant="danger" onClick={() => del("/api/bookings", b.id)}>Delete</Btn>
              </span>
            </div>
            <div className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
              {Object.entries(b.data).map(([k, v]) => <div key={k}><span className="text-zinc-500">{k}:</span> {v}</div>)}
            </div>
          </div>
        ))}
      </Card>
      <Card title="Enquiries & newsletter">
        {!enq.length && <p className="text-sm text-zinc-500">No enquiries yet.</p>}
        {enq.map((e) => (
          <div key={e.id} className="rounded-xl border border-zinc-800 p-3 text-sm">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <b>{e.name}</b><span className="text-zinc-400">{e.phone} {e.email}</span>
              <span className="ml-auto flex gap-2">
                <select className={sel} value={e.status} onChange={(ev) => patch("/api/enquiries", e.id, ev.target.value)}>
                  <option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option>
                </select>
                <Btn small variant="danger" onClick={() => del("/api/enquiries", e.id)}>Delete</Btn>
              </span>
            </div>
            {e.propertyIds?.length > 0 && <div className="text-zinc-400">Shortlist: {e.propertyIds.join(", ")}</div>}
            {e.coupon && <div className="text-[#d4af6a]">Coupon: {e.coupon}</div>}
            {e.message && <div className="mt-1 text-zinc-300">{e.message}</div>}
            <div className="mt-1 text-xs text-zinc-600">{new Date(e.createdAt).toLocaleString("en-IN")}</div>
          </div>
        ))}
      </Card>
    </div>
  );
}
