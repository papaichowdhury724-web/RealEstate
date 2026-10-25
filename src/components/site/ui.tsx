"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { Property, SiteConfig } from "@/lib/types";

export interface SiteCtx {
  cfg: SiteConfig;
  f: (s: string) => string;
  tx: (k: string) => string;
  shortlist: string[];
  toggleShort: (id: string) => void;
  openBooking: (property?: string) => void;
  openProperty: (p: Property) => void;
  openShortlist: () => void;
  openLightbox: (src: string) => void;
  preview: boolean;
}
export const Ctx = createContext<SiteCtx | null>(null);
export const useSite = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("SiteCtx missing");
  return c;
};

export { fillTokens } from "@/lib/tokens";

/* --------- Lazy, visibility-aware video (saves mobile battery & data) --------- */
export function LazyVideo({ src, poster, className = "", eager = false }: { src: string; poster?: string; className?: string; eager?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [load, setLoad] = useState(eager);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setLoad(true); v.play().catch(() => {}); } else v.pause();
    }, { rootMargin: "200px" });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  useEffect(() => { if (load) ref.current?.play().catch(() => {}); }, [load, src]);
  return (
    <video ref={ref} className={className} poster={poster || undefined} muted loop playsInline preload={eager ? "auto" : "none"}
      src={load ? src : undefined} />
  );
}

/* --------- Heart icon --------- */
export const Heart = ({ filled }: { filled: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
    <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.5 3 4.5 6.9 4.5c2.1 0 3.6 1.2 5.1 3 1.5-1.8 3-3 5.1-3 3.9 0 6 4 4.5 7.3C19.5 16.4 12 21 12 21z" />
  </svg>
);

/* --------- Property card --------- */
export function PropertyCard({ p, i }: { p: Property; i: number }) {
  const { cfg, tx, shortlist, toggleShort, openProperty } = useSite();
  const on = shortlist.includes(p.id);
  const size = cfg.theme.cardSize;
  return (
    <article className="rv hv card overflow-hidden group relative flex flex-col" style={{ ["--d" as string]: `${(i % 3) * 90}ms` }}>
      <button onClick={() => openProperty(p)} className="relative block overflow-hidden text-left"
        style={{ aspectRatio: size === "large" ? "16/10" : size === "compact" ? "4/3" : "5/4" }} aria-label={p.title}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.image} alt={p.title} loading="lazy" decoding="async" className="hv-img absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/10" />
        <div className="absolute left-4 top-4 flex gap-2">
          {p.tag && <span className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider" style={{ background: "var(--accent)", color: "var(--bg)" }}>{p.tag}</span>}
          <span className="rounded-full bg-black/45 px-3 py-1 text-[11px] uppercase tracking-wider text-white backdrop-blur">{p.status}</span>
        </div>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="fh text-2xl md:text-3xl">{p.price}</div>
        </div>
      </button>
      {cfg.features.shortlist && (
        <button onClick={() => toggleShort(p.id)} aria-label={on ? tx("removeFromShortlist") : tx("addToShortlist")}
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition hover:scale-110"
          style={on ? { color: "var(--accent)" } : undefined}>
          <Heart filled={on} />
        </button>
      )}
      <div className={`flex flex-1 flex-col ${size === "compact" ? "p-4" : "p-6"}`}>
        <h3 className="fh" style={{ fontSize: `${cfg.theme.cardTitleSize}px`, lineHeight: 1.15 }}>{p.title}</h3>
        <p className="muted mt-1 text-sm">{p.location}</p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs uppercase tracking-wider muted">
          <span><b style={{ color: "var(--text)" }}>{p.beds}</b> {tx("beds")}</span>
          <span><b style={{ color: "var(--text)" }}>{p.baths}</b> {tx("baths")}</span>
          <span><b style={{ color: "var(--text)" }}>{p.area}</b></span>
        </div>
        <div className="mt-auto pt-5">
          <button onClick={() => openProperty(p)} className="text-sm font-semibold tracking-wide" style={{ color: "var(--accent)" }}>
            {tx("viewDetails")} →
          </button>
        </div>
      </div>
    </article>
  );
}

/* --------- Booking form (fields controlled from admin) --------- */
export function BookingForm({ initialProperty = "", compact = false }: { initialProperty?: string; compact?: boolean }) {
  const { cfg, tx, preview } = useSite();
  const fields = cfg.bookingFields.filter((x) => x.enabled);
  const [vals, setVals] = useState<Record<string, string>>({ property: initialProperty });
  const [state, setState] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [err, setErr] = useState("");
  useEffect(() => { setVals((v) => ({ ...v, property: initialProperty || v.property })); }, [initialProperty]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (preview) { setState("ok"); return; }
    setState("sending"); setErr("");
    try {
      const r = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(vals) });
      const j = await r.json().catch(() => ({}));
      if (r.ok) { setState("ok"); setVals({}); } else { setState("err"); setErr(j.error || "Something went wrong"); }
    } catch { setState("err"); setErr("Network error — please try again"); }
  };

  if (state === "ok")
    return (
      <div className="modal-in py-10 text-center">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full text-2xl" style={{ background: "var(--accent)", color: "var(--bg)" }}>✓</div>
        <p className="fh text-2xl">{tx("bookingSuccess")}</p>
        <button className="btn btn-g mt-6" onClick={() => setState("idle")}>OK</button>
      </div>
    );

  const today = new Date().toISOString().slice(0, 10);
  return (
    <form onSubmit={submit} className={`grid gap-4 ${compact ? "" : "sm:grid-cols-2"}`}>
      {fields.map((fd) => {
        const full = fd.type === "textarea" || compact;
        const common = { required: fd.required, value: vals[fd.key] ?? "", placeholder: fd.placeholder,
          onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setVals({ ...vals, [fd.key]: e.target.value }) };
        let input: React.ReactNode;
        if (fd.type === "textarea") input = <textarea rows={3} {...common} />;
        else if (fd.type === "select" || fd.type === "property") {
          const opts = fd.type === "property" ? cfg.properties.filter((p) => p.enabled).map((p) => p.title) : fd.options.split(",").map((s) => s.trim()).filter(Boolean);
          input = (
            <select {...common}>
              <option value="">{fd.placeholder || "Select…"}</option>
              {opts.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          );
        } else input = <input type={fd.type} min={fd.type === "date" ? today : undefined} {...common} />;
        return (
          <label key={fd.id} className={`block ${full || fd.type === "textarea" ? "sm:col-span-2" : ""}`}>
            <span className="mb-1.5 block text-xs uppercase tracking-[0.18em] muted">{fd.label}{fd.required && <span style={{ color: "var(--accent)" }}> *</span>}</span>
            {input}
          </label>
        );
      })}
      {state === "err" && <p className="text-sm text-red-400 sm:col-span-2">{err}</p>}
      <div className="sm:col-span-2">
        <button disabled={state === "sending"} className="btn btn-p w-full sm:w-auto">{state === "sending" ? "…" : tx("bookingSubmit")}</button>
      </div>
    </form>
  );
}
