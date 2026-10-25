"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Property, SiteConfig, Widget } from "@/lib/types";
import { Background, Cursor, Loader, useClickFx, useReveal, useTilt } from "./Effects";
import { SectionView } from "./Sections";
import { BookingForm, Ctx, Heart, fillTokens, useSite, type SiteCtx } from "./ui";

export function fontsHref(cfg: SiteConfig) {
  const fams = Array.from(new Set([cfg.theme.headingFont, cfg.theme.bodyFont]))
    .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}:wght@300;400;500;600;700`).join("&");
  return `https://fonts.googleapis.com/css2?${fams}&display=swap`;
}

export function themeVars(cfg: SiteConfig): React.CSSProperties {
  const t = cfg.theme;
  return {
    ["--bg" as string]: t.bg, ["--surface" as string]: t.surface, ["--text" as string]: t.text, ["--muted" as string]: t.muted,
    ["--accent" as string]: t.accent, ["--accent2" as string]: t.accent2, ["--fh" as string]: `"${t.headingFont}"`, ["--fb" as string]: `"${t.bodyFont}"`,
    ["--base" as string]: `${t.baseSize}px`, ["--hs" as string]: String(t.headingScale), ["--radius" as string]: `${t.radius}px`,
    ["--container" as string]: `${t.containerWidth}px`, ["--spd" as string]: String(cfg.animations.speed || 1),
  };
}

const SHORT_KEY = "estate_shortlist";

export default function SiteApp({ initial }: { initial: SiteConfig }) {
  const [cfg, setCfg] = useState<SiteConfig>(initial);
  const [preview, setPreview] = useState(false);
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [booking, setBooking] = useState<{ open: boolean; property: string }>({ open: false, property: "" });
  const [prop, setProp] = useState<Property | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [lightbox, setLightbox] = useState("");
  const [menu, setMenu] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLElement>(null);
  const toTop = useRef<HTMLButtonElement>(null);

  /* ---- live updates: admin preview (postMessage) + saved (BroadcastChannel / polling) ---- */
  useEffect(() => {
    const inFrame = window.self !== window.top;
    setPreview(inFrame);
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "cfg-preview" && e.data.cfg) setCfg(e.data.cfg as SiteConfig);
    };
    window.addEventListener("message", onMsg);
    if (inFrame) window.parent.postMessage({ type: "preview-ready" }, window.location.origin);
    let bc: BroadcastChannel | null = null;
    const refetch = () => fetch("/api/config", { cache: "no-store" }).then((r) => r.json()).then((c) => c?.site && setCfg(c)).catch(() => {});
    if (!inFrame && "BroadcastChannel" in window) { bc = new BroadcastChannel("site-config"); bc.onmessage = refetch; }
    const onVis = () => { if (!inFrame && document.visibilityState === "visible") refetch(); };
    document.addEventListener("visibilitychange", onVis);
    try { setShortlist(JSON.parse(localStorage.getItem(SHORT_KEY) || "[]")); } catch {}
    return () => { window.removeEventListener("message", onMsg); bc?.close(); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  const f = useCallback((s: string) => fillTokens(s, cfg), [cfg]);
  const tx = useCallback((k: string) => fillTokens(cfg.texts[k] ?? k, cfg), [cfg]);
  const toggleShort = useCallback((id: string) => {
    setShortlist((cur) => {
      const n = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      try { localStorage.setItem(SHORT_KEY, JSON.stringify(n)); } catch {}
      return n;
    });
  }, []);
  const openBooking = useCallback((property = "") => {
    if (!cfg.features.booking) return;
    const hasSection = cfg.sections.some((s) => s.type === "booking" && s.enabled);
    if (cfg.features.bookingPlacement !== "popup" && hasSection && !property) {
      document.getElementById(cfg.sections.find((s) => s.type === "booking")!.id)?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setBooking({ open: true, property });
  }, [cfg]);

  const ctx: SiteCtx = useMemo(() => ({
    cfg, f, tx, shortlist, toggleShort, openBooking, openProperty: setProp, openShortlist: () => setDrawer(true), openLightbox: setLightbox, preview,
  }), [cfg, f, tx, shortlist, toggleShort, openBooking, preview]);

  /* ---- effects ---- */
  const a = cfg.animations;
  useReveal(root, `${cfg.sections.map((s) => s.id + s.enabled).join()}${a.scroll}${a.textReveal}`);
  useClickFx(a.click);
  useTilt(a.hover === "tilt");

  useEffect(() => {
    document.documentElement.classList.toggle("smooth", cfg.features.smoothScroll);
    document.title = f(cfg.site.seoTitle);
  }, [cfg.features.smoothScroll, cfg.site.seoTitle, f]);

  // single rAF-throttled scroll handler: progress bar, header state, parallax, back-to-top
  useEffect(() => {
    let ticking = false;
    const run = () => {
      ticking = false;
      const y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
      if (progress.current) progress.current.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
      header.current?.classList.toggle("scrolled", y > 40);
      if (toTop.current) toTop.current.style.opacity = y > 800 ? "1" : "0";
      if (cfg.animations.parallax && y < window.innerHeight * 1.2) {
        root.current?.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => { el.style.transform = `translate3d(0, ${y * 0.3}px, 0)`; });
      }
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } };
    window.addEventListener("scroll", onScroll, { passive: true });
    run();
    return () => window.removeEventListener("scroll", onScroll);
  }, [cfg.animations.parallax]);

  // lock body scroll when overlays are open
  const overlay = booking.open || !!prop || drawer || !!lightbox || menu;
  useEffect(() => { document.body.style.overflow = overlay ? "hidden" : ""; }, [overlay]);

  // intercept #booking links
  useEffect(() => {
    const h = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest?.("a[href^='#']") as HTMLAnchorElement | null;
      if (!el) return;
      setMenu(false);
      if (el.getAttribute("href") === "#booking") {
        if (!cfg.features.booking) { e.preventDefault(); return; }
        if (cfg.features.bookingPlacement === "popup" || !cfg.sections.some((s) => s.type === "booking" && s.enabled)) {
          e.preventDefault(); setBooking({ open: true, property: "" });
        }
      }
    };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, [cfg]);

  const sections = cfg.sections.filter((s) => s.enabled);
  const heroIdx = sections.findIndex((s) => s.type === "hero");
  const firstBg = (sections[0]?.bg ?? [cfg.theme.bg, cfg.theme.accent, cfg.theme.accent2]) as [string, string, string];
  const widgets = [...(cfg.features.updates ? cfg.updates : []), ...cfg.customFeatures].filter((w) => w.enabled);
  const bannerOffers = cfg.features.offers ? cfg.offers.filter((o) => o.enabled && o.showInBanner) : [];
  const topBars = widgets.filter((w) => w.type === "bar" && w.position !== "bottom");
  const inline = (pos: string) => widgets.filter((w) => w.type === "inline" && w.position === pos).map((w) => <InlineWidget key={w.id} w={w} />);

  return (
    <Ctx.Provider value={ctx}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={fontsHref(cfg)} />
      {cfg.theme.customCss && <style dangerouslySetInnerHTML={{ __html: cfg.theme.customCss }} />}
      <div ref={root} className="site" style={themeVars(cfg)} data-reveal={a.scroll} data-text={a.textReveal} data-hover={a.hover} data-btn={cfg.theme.buttonStyle}>
        <Background mode={a.background} intensity={a.bgIntensity} light={cfg.theme.mode === "light"}
          fallback={cfg.theme.mode === "light" ? [cfg.theme.bg, firstBg[1], firstBg[2]] : firstBg} scope={() => root.current} watchKey={sections.map((s) => s.id + s.bg.join()).join()} />
        {!preview && !loaded && <Loader type={a.loader} duration={a.loaderDuration} text={tx("loaderText")} onDone={() => setLoaded(true)} />}
        <Cursor type={a.cursor} />

        {cfg.features.scrollProgress && (
          <div ref={progress} className="fixed left-0 right-0 top-0 z-[60] h-[2px] origin-left" style={{ background: "var(--accent)", transform: "scaleX(0)" }} />
        )}

        {/* ---------- header ---------- */}
        <header ref={header} className={`${cfg.header.sticky ? "fixed" : "absolute"} group/h left-0 right-0 top-0 z-50`}>
          {bannerOffers.map((o) => (
            <Bar key={o.id} w={{ id: "offer-" + o.id, style: "accent", locked: false, text: `${o.title} — ${o.description}${o.code ? ` · Code: ${o.code}` : ""}`, buttonLabel: "", buttonLink: "#offers" } as Widget} />
          ))}
          {topBars.map((w) => <Bar key={w.id} w={w} />)}
          <div className="transition-all duration-500 group-[.scrolled]/h:bg-[color-mix(in_srgb,var(--bg)_70%,transparent)] group-[.scrolled]/h:backdrop-blur-xl">
            <div className="ctn flex h-[72px] items-center justify-between gap-4 md:h-[84px]">
              <a href="#" className="flex items-center gap-3" aria-label={cfg.site.brand}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {cfg.site.logoUrl ? <img src={cfg.site.logoUrl} alt={cfg.site.brand} style={{ height: cfg.header.logoHeight }} />
                  : <span className="fh text-2xl tracking-wide md:text-[1.7rem]" style={{ color: "var(--text)" }}>{cfg.site.brand}</span>}
              </a>
              <nav className="hidden items-center gap-8 lg:flex">
                {cfg.header.links.filter((l) => l.enabled).map((l) => (
                  <a key={l.id} href={l.href} className="group relative text-sm tracking-wide opacity-85 transition hover:opacity-100">
                    {f(l.label)}<span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 transition-transform duration-500 group-hover:origin-left group-hover:scale-x-100" style={{ background: "var(--accent)" }} />
                  </a>
                ))}
              </nav>
              <div className="flex items-center gap-2 md:gap-3">
                {cfg.header.showPhone && <a href={`tel:${cfg.site.phone}`} className="hidden text-sm opacity-80 xl:block">{cfg.site.phone}</a>}
                {cfg.features.shortlist && (
                  <button onClick={() => setDrawer(true)} className="relative grid h-11 w-11 place-items-center rounded-full border transition hover:border-[var(--accent)]" style={{ borderColor: "color-mix(in srgb, var(--text) 20%, transparent)" }} aria-label={tx("shortlistLabel")}>
                    <Heart filled={shortlist.length > 0} />
                    {shortlist.length > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-bold" style={{ background: "var(--accent)", color: "var(--bg)" }}>{shortlist.length}</span>}
                  </button>
                )}
                {cfg.header.ctaLabel && cfg.features.booking && <a href={cfg.header.ctaLink} className="btn btn-p hidden !py-3 sm:inline-flex">{f(cfg.header.ctaLabel)}</a>}
                <button onClick={() => setMenu(true)} className="grid h-11 w-11 place-items-center lg:hidden" aria-label="Menu">
                  <span className="block h-px w-6 bg-current shadow-[0_6px_0_currentColor,0_-6px_0_currentColor]" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* mobile menu */}
        {menu && (
          <div className="fade-in fixed inset-0 z-[70] flex flex-col p-6" style={{ background: "color-mix(in srgb, var(--bg) 96%, transparent)" }}>
            <div className="flex items-center justify-between">
              <span className="fh text-2xl">{cfg.site.brand}</span>
              <button onClick={() => setMenu(false)} className="text-3xl" aria-label="Close">×</button>
            </div>
            <nav className="mt-14 flex flex-col gap-5">
              {cfg.header.links.filter((l) => l.enabled).map((l, i) => (
                <a key={l.id} href={l.href} className="modal-in fh text-4xl" style={{ animationDelay: `${i * 60}ms` }}>{f(l.label)}</a>
              ))}
            </nav>
            <div className="mt-auto space-y-3">
              {cfg.features.booking && <button onClick={() => { setMenu(false); openBooking(); }} className="btn btn-p w-full">{tx("bookCta")}</button>}
              <a href={`tel:${cfg.site.phone}`} className="btn btn-g w-full">{cfg.site.phone}</a>
            </div>
          </div>
        )}

        <main>
          {sections.map((s, i) => (
            <div key={s.id}>
              <SectionView s={s} />
              {i === heroIdx && inline("after-hero")}
            </div>
          ))}
          {inline("before-footer")}
        </main>

        <Footer />

        {/* ---------- floating buttons ---------- */}
        <div className={`fixed bottom-5 z-40 flex flex-col gap-3 ${cfg.features.whatsappPosition === "left" ? "left-5" : "right-5"}`}>
          {cfg.features.backToTop && (
            <button ref={toTop} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="glass grid h-12 w-12 place-items-center rounded-full border transition-opacity duration-500" style={{ opacity: 0, borderColor: "color-mix(in srgb, var(--text) 18%, transparent)" }} aria-label="Back to top">↑</button>
          )}
          {cfg.features.callButton && <a href={`tel:${cfg.site.phone}`} className="grid h-12 w-12 place-items-center rounded-full text-lg shadow-lg" style={{ background: "var(--accent2)", color: "#fff" }} aria-label="Call">✆</a>}
          {cfg.features.whatsapp && (
            <a href={`https://wa.me/${cfg.site.whatsapp}?text=${encodeURIComponent(`Hello ${cfg.site.brand}, I'm interested in a property.`)}`} target="_blank" rel="noreferrer"
              className="grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-110" aria-label="WhatsApp">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4C2.7 15.6 2.2 13.8 2.2 12 2.2 6.6 6.6 2.2 12 2.2S21.8 6.6 21.8 12 17.4 21.8 12 21.8zM12 0C5.4 0 0 5.4 0 12c0 2.1.6 4.2 1.6 6L0 24l6.2-1.6C8 23.4 10 24 12 24c6.6 0 12-5.4 12-12S18.6 0 12 0z"/></svg>
            </a>
          )}
        </div>
        {cfg.features.booking && cfg.features.floatingBookButton && (
          <button onClick={() => setBooking({ open: true, property: "" })}
            className={`btn btn-p fixed bottom-5 z-40 shadow-2xl ${cfg.features.whatsappPosition === "left" ? "right-5" : "left-5"}`}>
            ✦ {tx("bookCta")}
          </button>
        )}

        {widgets.filter((w) => w.type === "bar" && w.position === "bottom").map((w) => (
          <div key={w.id} className="fixed bottom-0 left-0 right-0 z-[45]"><Bar w={w} /></div>
        ))}
        {widgets.filter((w) => w.type === "popup" || w.type === "floating").map((w) => <TriggeredWidget key={w.id} w={w} />)}

        {/* ---------- overlays ---------- */}
        {booking.open && (
          <Modal onClose={() => setBooking({ open: false, property: "" })}>
            <p className="eyebrow mb-2">{cfg.site.brand}</p>
            <h3 className="fh mb-1 text-3xl md:text-4xl">{tx("bookingTitle")}</h3>
            <p className="muted mb-7 text-sm">{tx("bookingSubtitle")}</p>
            <BookingForm initialProperty={booking.property} />
          </Modal>
        )}
        {prop && <PropertyModal p={prop} onClose={() => setProp(null)} />}
        {drawer && <ShortlistDrawer onClose={() => setDrawer(false)} />}
        {lightbox && (
          <div className="fade-in fixed inset-0 z-[80] grid place-items-center bg-black/90 p-4" onClick={() => setLightbox("")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightbox} alt="" className="modal-in max-h-[88vh] max-w-full rounded-xl object-contain" />
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}

/* ---------------- widgets ---------------- */
const widgetStyle = (s: Widget["style"]): React.CSSProperties =>
  s === "accent" ? { background: "var(--accent)", color: "var(--bg)" }
    : s === "dark" ? { background: "#0b0b0e", color: "#f5f1e8" }
    : s === "light" ? { background: "#f7f4ee", color: "#16130f" }
    : { background: "color-mix(in srgb, var(--surface) 80%, transparent)", color: "var(--text)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid color-mix(in srgb, var(--text) 12%, transparent)" };

function useDismiss(id: string, locked: boolean) {
  const { preview } = useSite();
  const [closed, setClosed] = useState(false);
  useEffect(() => { if (!locked && !preview && sessionStorage.getItem("w_" + id)) setClosed(true); }, [id, locked, preview]);
  const close = () => { setClosed(true); if (!preview) sessionStorage.setItem("w_" + id, "1"); };
  return [closed, close] as const;
}

function Bar({ w }: { w: Widget }) {
  const { f } = useSite();
  const [closed, close] = useDismiss(w.id, w.locked);
  if (closed) return null;
  return (
    <div className="bar-in relative flex items-center justify-center gap-3 px-10 py-2 text-center text-xs md:text-sm" style={widgetStyle(w.style)}>
      <span className="line-clamp-2">{f(w.text || w.title)}</span>
      {w.buttonLabel && <a href={w.buttonLink} className="shrink-0 underline underline-offset-4 font-semibold">{f(w.buttonLabel)}</a>}
      {!w.locked && <button onClick={close} className="absolute right-3 text-lg leading-none opacity-70" aria-label="Dismiss">×</button>}
    </div>
  );
}

function InlineWidget({ w }: { w: Widget }) {
  const { f } = useSite();
  return (
    <div className="ctn py-6">
      <div className="rv flex flex-col items-start gap-4 rad p-6 md:flex-row md:items-center md:justify-between md:p-8" style={widgetStyle(w.style)}>
        <div>
          {w.title && <div className="fh text-2xl md:text-3xl">{f(w.title)}</div>}
          {w.text && <p className="mt-1 text-sm opacity-80">{f(w.text)}</p>}
        </div>
        {w.buttonLabel && <a href={w.buttonLink} className="btn btn-g shrink-0" style={{ color: "inherit", borderColor: "currentColor" }}>{f(w.buttonLabel)}</a>}
      </div>
    </div>
  );
}

function TriggeredWidget({ w }: { w: Widget }) {
  const { f, preview } = useSite();
  const [closed, close] = useDismiss(w.id, w.locked);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (closed) return;
    if (preview || w.trigger === "load") { const t = setTimeout(() => setShow(true), preview ? 300 : 2400); return () => clearTimeout(t); }
    if (w.trigger === "delay") { const t = setTimeout(() => setShow(true), Math.max(0, w.delay) * 1000); return () => clearTimeout(t); }
    if (w.trigger === "scroll") {
      const h = () => { if (window.scrollY > (document.documentElement.scrollHeight - innerHeight) * 0.4) { setShow(true); window.removeEventListener("scroll", h); } };
      window.addEventListener("scroll", h, { passive: true });
      return () => window.removeEventListener("scroll", h);
    }
    if (w.trigger === "exit") {
      const h = (e: MouseEvent) => { if (e.clientY < 10) setShow(true); };
      document.addEventListener("mouseleave", h);
      const t = matchMedia("(hover: none)").matches ? setTimeout(() => setShow(true), 15000) : undefined;
      return () => { document.removeEventListener("mouseleave", h); if (t) clearTimeout(t); };
    }
  }, [w.trigger, w.delay, closed, preview]);
  if (closed || !show) return null;

  const body = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {w.image && <img src={w.image} alt="" className={`w-full object-cover ${w.type === "popup" ? "aspect-[16/9]" : "aspect-[16/8]"}`} />}
      <div className={w.type === "popup" ? "p-7 md:p-9" : "p-5"}>
        {w.title && <div className={`fh ${w.type === "popup" ? "text-3xl" : "text-xl"}`}>{f(w.title)}</div>}
        {w.text && <p className="mt-2 text-sm opacity-80">{f(w.text)}</p>}
        {w.buttonLabel && <a href={w.buttonLink} onClick={close} className="btn btn-p mt-5">{f(w.buttonLabel)}</a>}
      </div>
      {!w.locked && <button onClick={close} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white" aria-label="Close">×</button>}
    </>
  );
  if (w.type === "floating") {
    const pos = w.position === "bottom-left" ? "left-5 bottom-24" : w.position === "top" ? "right-5 top-28" : "right-5 bottom-24";
    return <div className={`modal-in fixed z-[55] w-[min(320px,calc(100vw-40px))] overflow-hidden rounded-2xl shadow-2xl ${pos}`} style={widgetStyle(w.style)}>{body}</div>;
  }
  return (
    <div className="fade-in fixed inset-0 z-[75] grid place-items-center bg-black/60 p-4" onClick={() => !w.locked && close()}>
      <div className="modal-in relative w-full max-w-md overflow-hidden rounded-3xl shadow-2xl" style={widgetStyle(w.style)} onClick={(e) => e.stopPropagation()}>{body}</div>
    </div>
  );
}

/* ---------------- overlays ---------------- */
function Modal({ children, onClose, wide = false }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="fade-in fixed inset-0 z-[78] flex items-end justify-center bg-black/70 sm:items-center sm:p-4" onClick={onClose}>
      <div className={`modal-in relative max-h-[92svh] w-full overflow-y-auto rounded-t-3xl p-6 sm:rounded-3xl md:p-10 ${wide ? "max-w-5xl" : "max-w-2xl"}`}
        style={{ background: "var(--surface)", border: "1px solid color-mix(in srgb, var(--text) 10%, transparent)" }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full text-xl" style={{ background: "color-mix(in srgb, var(--text) 10%, transparent)" }} aria-label="Close">×</button>
        {children}
      </div>
    </div>
  );
}

function PropertyModal({ p, onClose }: { p: Property; onClose: () => void }) {
  const { cfg, f, tx, shortlist, toggleShort, openBooking, openShortlist } = useSite();
  const imgs = [p.image, ...p.gallery].filter(Boolean);
  const on = shortlist.includes(p.id);
  return (
    <Modal onClose={onClose} wide>
      <div className="no-scrollbar -mx-6 -mt-6 flex snap-x snap-mandatory overflow-x-auto md:-mx-10 md:-mt-10">
        {imgs.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={src} alt="" className="aspect-[16/9] w-full shrink-0 snap-center object-cover" />
        ))}
      </div>
      {imgs.length > 1 && <p className="muted mt-2 text-center text-xs">← swipe · {imgs.length} photos →</p>}
      <div className="mt-6 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <p className="eyebrow">{p.type} · {p.status}</p>
          <h3 className="fh mt-2 text-4xl md:text-5xl">{p.title}</h3>
          <p className="muted mt-2">{p.location}</p>
          <p className="mt-6 leading-relaxed opacity-90">{f(p.description)}</p>
          {p.amenities.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {p.amenities.map((a) => <span key={a} className="rounded-full border px-3 py-1 text-xs" style={{ borderColor: "color-mix(in srgb, var(--text) 18%, transparent)" }}>{a}</span>)}
            </div>
          )}
        </div>
        <div className="card p-6">
          <div className="fh gold text-4xl">{p.price}</div>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs uppercase tracking-wider">
            <div><div className="fh text-2xl normal-case">{p.beds}</div><span className="muted">{tx("beds")}</span></div>
            <div><div className="fh text-2xl normal-case">{p.baths}</div><span className="muted">{tx("baths")}</span></div>
            <div><div className="fh text-lg normal-case">{p.area}</div><span className="muted">{tx("area")}</span></div>
          </div>
          <div className="mt-6 space-y-3">
            {cfg.features.booking && <button onClick={() => { onClose(); setTimeout(() => openBooking(p.title), 50); }} className="btn btn-p w-full">{tx("bookCta")}</button>}
            {cfg.features.shortlist && (
              <button onClick={() => toggleShort(p.id)} className="btn btn-g w-full"><Heart filled={on} /> {on ? tx("removeFromShortlist") : tx("addToShortlist")}</button>
            )}
            {cfg.features.enquiry && (
              <button onClick={() => { if (!on && cfg.features.shortlist) toggleShort(p.id); onClose(); openShortlist(); }} className="btn btn-g w-full">{tx("enquireNow")}</button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function ShortlistDrawer({ onClose }: { onClose: () => void }) {
  const { cfg, tx, shortlist, toggleShort, preview } = useSite();
  const items = cfg.properties.filter((p) => shortlist.includes(p.id));
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "", coupon: "" });
  const [state, setState] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [err, setErr] = useState("");
  const offer = cfg.features.offers ? cfg.offers.find((o) => o.enabled && o.code && o.code.toLowerCase() === form.coupon.trim().toLowerCase()) : undefined;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (preview) { setState("ok"); return; }
    setState("sending"); setErr("");
    try {
      const r = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, coupon: offer ? offer.code : form.coupon, propertyIds: items.map((p) => p.title) }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok) setState("ok"); else { setState("err"); setErr(j.error || "Error"); }
    } catch { setState("err"); setErr("Network error — please try again"); }
  };

  return (
    <div className="fade-in fixed inset-0 z-[78] bg-black/60" onClick={onClose}>
      <aside className="drawer-in absolute bottom-0 right-0 top-0 flex w-full max-w-md flex-col overflow-y-auto p-6 md:p-8" style={{ background: "var(--surface)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="fh text-3xl">{tx("shortlistLabel")} <span className="muted text-lg">({items.length})</span></h3>
          <button onClick={onClose} className="text-3xl" aria-label="Close">×</button>
        </div>
        <div className="mt-6 space-y-3">
          {!items.length && <p className="muted py-8 text-center text-sm">{tx("shortlistEmpty")}</p>}
          {items.map((p) => (
            <div key={p.id} className="card flex items-center gap-4 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt="" className="h-16 w-20 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold" style={{ fontSize: Math.max(14, cfg.theme.cardTitleSize - 6) }}>{p.title}</div>
                <div className="text-sm" style={{ color: "var(--accent)" }}>{p.price}</div>
              </div>
              {cfg.features.shortlist && <button onClick={() => toggleShort(p.id)} className="muted px-2 text-xl" aria-label="Remove">×</button>}
            </div>
          ))}
        </div>
        {cfg.features.enquiry && (
          state === "ok" ? (
            <div className="modal-in mt-8 rounded-2xl p-6 text-center" style={{ background: "color-mix(in srgb, var(--accent) 15%, transparent)" }}>
              <p className="fh text-2xl">{tx("enquirySuccess")}</p>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-8 space-y-3">
              <input required placeholder="Full name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input required type="tel" placeholder="Phone *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <textarea rows={3} placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              {cfg.features.offers && (
                <div>
                  <input placeholder={tx("couponLabel")} value={form.coupon} onChange={(e) => setForm({ ...form, coupon: e.target.value })} />
                  {form.coupon && <p className="mt-1.5 text-xs" style={{ color: offer ? "var(--accent)" : "#f87171" }}>{offer ? `${tx("couponApplied")} ${offer.title} (${offer.discount})` : tx("couponInvalid")}</p>}
                </div>
              )}
              {state === "err" && <p className="text-sm text-red-400">{err}</p>}
              <button disabled={state === "sending"} className="btn btn-p w-full">{state === "sending" ? "…" : tx("enquireNow")}</button>
            </form>
          )
        )}
      </aside>
    </div>
  );
}

/* ---------------- footer ---------------- */
function Footer() {
  const { cfg, f, tx, preview } = useSite();
  const [email, setEmail] = useState("");
  const [ok, setOk] = useState(false);
  const [nlErr, setNlErr] = useState("");
  const ft = cfg.footer;
  const sub = async (e: React.FormEvent) => {
    e.preventDefault();
    setNlErr("");
    if (!preview) {
      try {
        const r = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "newsletter", email }) });
        if (!r.ok) { const j = await r.json().catch(() => ({})); setNlErr(j.error || "Something went wrong"); return; }
      } catch { setNlErr("Network error — please try again"); return; }
    }
    setOk(true);
  };
  return (
    <footer data-bg={[cfg.theme.bg, cfg.theme.accent + "55", cfg.theme.accent2 + "44"].join("|")} className="relative border-t pb-28 pt-20 md:pb-12" style={{ borderColor: "color-mix(in srgb, var(--text) 10%, transparent)" }}>
      <div className="ctn">
        <div className="rv fh gold mb-14 text-[13vw] leading-none md:text-[9vw]">{cfg.site.brand}</div>
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="muted leading-relaxed">{f(ft.about)}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {ft.socials.filter((s) => s.enabled).map((s) => (
                <a key={s.id} href={s.url} target="_blank" rel="noreferrer" className="rounded-full border px-4 py-2 text-xs uppercase tracking-wider transition hover:border-[var(--accent)] hover:text-[var(--accent)]" style={{ borderColor: "color-mix(in srgb, var(--text) 18%, transparent)" }}>{s.label}</a>
              ))}
            </div>
          </div>
          {ft.columns.map((c) => (
            <div key={c.id} className="md:col-span-2">
              <div className="eyebrow mb-4">{f(c.title)}</div>
              <ul className="space-y-2.5">
                {c.links.filter((l) => l.enabled).map((l) => <li key={l.id}><a href={l.href} className="muted transition hover:text-[var(--text)]">{f(l.label)}</a></li>)}
              </ul>
            </div>
          ))}
          <div className="md:col-span-4 md:col-start-9">
            {ft.showContact && (
              <div className="muted space-y-1.5 text-sm">
                <p>{f(cfg.site.address)}</p>
                <p><a href={`tel:${cfg.site.phone}`}>{cfg.site.phone}</a> · <a href={`mailto:${cfg.site.email}`}>{cfg.site.email}</a></p>
              </div>
            )}
            {cfg.features.newsletter && (
              <form onSubmit={sub} className="mt-6">
                <div className="fh mb-3 text-2xl">{tx("newsletterTitle")}</div>
                {ok ? <p style={{ color: "var(--accent)" }}>{tx("newsletterSuccess")}</p> : (
                  <div className="flex gap-2">
                    <input required type="email" placeholder={tx("newsletterPlaceholder")} value={email} onChange={(e) => setEmail(e.target.value)} />
                    <button className="btn btn-p shrink-0">{tx("newsletterButton")}</button>
                  </div>
                )}
                {nlErr && <p className="mt-2 text-sm text-red-400">{nlErr}</p>}
              </form>
            )}
          </div>
        </div>
        <div className="muted mt-16 flex flex-col justify-between gap-3 border-t pt-6 text-xs md:flex-row" style={{ borderColor: "color-mix(in srgb, var(--text) 10%, transparent)" }}>
          <span>{f(ft.copyright)}</span>
          <span>{f(cfg.site.tagline)}</span>
        </div>
      </div>
    </footer>
  );
}
