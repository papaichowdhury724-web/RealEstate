"use client";
import { useMemo, useState } from "react";
import type { Section } from "@/lib/types";
import { Split } from "./Effects";
import { BookingForm, LazyVideo, PropertyCard, useSite } from "./ui";
import Walkthrough from "./Walkthrough";

function Head({ s, center = false }: { s: Section; center?: boolean }) {
  const { f } = useSite();
  return (
    <div className={`mb-12 md:mb-16 ${center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}`}>
      {s.eyebrow && <p className="eyebrow rv mb-4">{f(s.eyebrow)}</p>}
      {s.title && <Split text={f(s.title)} className="fh h2" />}
      {s.subtitle && <p className="rv muted mt-5 text-base md:text-lg" style={{ ["--d" as string]: "150ms" }}>{f(s.subtitle)}</p>}
    </div>
  );
}

function Wrap({ s, children, className = "py-24 md:py-36" }: { s: Section; children: React.ReactNode; className?: string }) {
  return (
    <section id={s.id} data-bg={s.bg.join("|")} className={`relative ${className}`}>
      {children}
    </section>
  );
}

function Hero({ s }: { s: Section }) {
  const { f, cfg, tx, openBooking } = useSite();
  return (
    <section id={s.id} data-bg={s.bg.join("|")} className="relative flex min-h-[100svh] items-end overflow-hidden">
      <div className="absolute inset-0" data-parallax>
        {s.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.image} alt="" className="kenburns absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
        )}
        {s.video && <LazyVideo src={s.video} poster={s.image} eager className="absolute inset-0 h-full w-full object-cover" />}
      </div>
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,.1) 35%, color-mix(in srgb, var(--bg) 92%, transparent) 100%)" }} />
      <div className="ctn relative z-10 pb-20 pt-40 md:pb-28">
        {s.eyebrow && <p className="eyebrow rv mb-6" style={{ ["--d" as string]: "200ms" }}>{f(s.eyebrow)}</p>}
        <Split as="h1" text={f(s.title)} className="fh h1 max-w-5xl text-white" delay={250} />
        {s.subtitle && <p className="rv mt-7 max-w-xl text-base text-white/80 md:text-lg" style={{ ["--d" as string]: "600ms" }}>{f(s.subtitle)}</p>}
        <div className="rv mt-10 flex flex-wrap gap-3" style={{ ["--d" as string]: "800ms" }}>
          {s.buttonLabel && <a href={s.buttonLink || "#properties"} className="btn btn-p">{f(s.buttonLabel)}</a>}
          {cfg.features.booking && <button onClick={() => openBooking()} className="btn btn-g text-white">{tx("bookCta")}</button>}
        </div>
      </div>
      <div className="absolute bottom-8 right-6 z-10 hidden items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-white/60 md:flex">
        {tx("scrollHint")} <span className="float-y inline-block h-10 w-px bg-white/50" />
      </div>
    </section>
  );
}

function Marquee({ s }: { s: Section }) {
  const { f } = useSite();
  const list = [...s.items, ...s.items];
  return (
    <section id={s.id} data-bg={s.bg.join("|")} className="relative overflow-hidden border-y py-8 md:py-10" style={{ borderColor: "color-mix(in srgb, var(--text) 10%, transparent)" }}>
      <div className="marq">
        {list.map((it, i) => (
          <span key={i} className="fh flex items-center gap-10 px-5 text-4xl italic md:text-6xl" style={{ color: i % 2 ? "var(--text)" : "transparent", WebkitTextStroke: i % 2 ? undefined : "1px var(--accent)" }}>
            {f(it.title)} <span className="text-xl not-italic" style={{ color: "var(--accent)" }}>✦</span>
          </span>
        ))}
      </div>
    </section>
  );
}

function Stats({ s }: { s: Section }) {
  const { f } = useSite();
  return (
    <Wrap s={s}>
      <div className="ctn">
        <Head s={s} />
        <div className="grid grid-cols-2 gap-px overflow-hidden rad md:grid-cols-4" style={{ background: "color-mix(in srgb, var(--text) 10%, transparent)" }}>
          {s.items.map((it, i) => (
            <div key={it.id} className="rv p-6 md:p-10" style={{ background: "var(--bg)", ["--d" as string]: `${i * 100}ms` }}>
              <div className="fh gold text-3xl md:text-5xl">{f(it.value)}</div>
              <div className="muted mt-3 text-xs uppercase tracking-[0.2em]">{f(it.title)}</div>
            </div>
          ))}
        </div>
      </div>
    </Wrap>
  );
}

function Properties({ s }: { s: Section }) {
  const { cfg, tx } = useSite();
  const all = cfg.properties.filter((p) => p.enabled);
  const types = useMemo(() => [tx("allFilter"), ...Array.from(new Set(all.map((p) => p.type)))], [all, tx]);
  const [typeIdx, setType] = useState(0);
  const type = typeIdx < types.length ? typeIdx : 0; // category may disappear when admin edits properties
  const [q, setQ] = useState("");
  const list = all
    .filter((p) => type === 0 || p.type === types[type])
    .filter((p) => !q || `${p.title} ${p.location} ${p.type} ${p.status}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => Number(b.featured) - Number(a.featured));
  const cols = cfg.theme.cardSize === "compact" ? "sm:grid-cols-2 lg:grid-cols-4" : cfg.theme.cardSize === "large" ? "md:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <Wrap s={s}>
      <div className="ctn">
        <Head s={s} />
        <div className="rv mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
            {types.map((t, i) => (
              <button key={t} onClick={() => setType(i)} className="shrink-0 rounded-full border px-5 py-2 text-sm transition"
                style={i === type ? { background: "var(--accent)", color: "var(--bg)", borderColor: "var(--accent)" } : { borderColor: "color-mix(in srgb, var(--text) 18%, transparent)" }}>
                {t}
              </button>
            ))}
          </div>
          {cfg.features.search && (
            <input className="md:max-w-xs" placeholder={tx("searchPlaceholder")} value={q} onChange={(e) => setQ(e.target.value)} />
          )}
        </div>
        <div className={`grid gap-6 md:gap-8 ${cols}`}>
          {list.map((p, i) => <PropertyCard key={p.id} p={p} i={i} />)}
        </div>
        {!list.length && <p className="muted py-16 text-center">No residences match your search.</p>}
      </div>
    </Wrap>
  );
}

function About({ s }: { s: Section }) {
  const { f } = useSite();
  return (
    <Wrap s={s}>
      <div className="ctn grid items-center gap-12 md:grid-cols-2 md:gap-20">
        <div className="rv relative overflow-hidden rad" style={{ aspectRatio: "4/5" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {s.image && <img src={s.image} alt="" loading="lazy" className="kenburns absolute inset-0 h-full w-full object-cover" />}
          {s.video && <LazyVideo src={s.video} poster={s.image} className="absolute inset-0 h-full w-full object-cover" />}
        </div>
        <div>
          {s.eyebrow && <p className="eyebrow rv mb-4">{f(s.eyebrow)}</p>}
          <Split text={f(s.title)} className="fh h2" />
          <p className="rv muted mt-7 whitespace-pre-line text-base leading-relaxed md:text-lg">{f(s.text)}</p>
          {s.buttonLabel && <a href={s.buttonLink} className="btn btn-p rv mt-10">{f(s.buttonLabel)}</a>}
        </div>
      </div>
    </Wrap>
  );
}

function Services({ s }: { s: Section }) {
  const { f } = useSite();
  return (
    <Wrap s={s}>
      <div className="ctn">
        <Head s={s} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {s.items.map((it, i) => (
            <div key={it.id} className="rv hv card p-7 md:p-8" style={{ ["--d" as string]: `${i * 90}ms` }}>
              {it.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.image} alt="" loading="lazy" className="mb-6 h-12 w-12 rounded-full object-cover" />
              ) : <div className="mb-6 text-3xl" style={{ color: "var(--accent)" }}>{it.icon || "✦"}</div>}
              <h3 className="fh text-2xl">{f(it.title)}</h3>
              <p className="muted mt-3 text-sm leading-relaxed">{f(it.text)}</p>
            </div>
          ))}
        </div>
      </div>
    </Wrap>
  );
}

function VideoSec({ s }: { s: Section }) {
  return (
    <Wrap s={s}>
      <div className="ctn">
        <Head s={s} center />
        <div className="rv relative overflow-hidden rad" style={{ aspectRatio: "16/9" }}>
          {s.video ? <LazyVideo src={s.video} poster={s.image} className="absolute inset-0 h-full w-full object-cover" /> :
            // eslint-disable-next-line @next/next/no-img-element
            s.image && <img src={s.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />}
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10 rad" />
        </div>
      </div>
    </Wrap>
  );
}

function Gallery({ s }: { s: Section }) {
  const { openLightbox } = useSite();
  return (
    <Wrap s={s}>
      <div className="ctn">
        <Head s={s} />
        <div className="columns-2 gap-4 md:columns-3 md:gap-6">
          {s.items.map((it, i) => (
            <button key={it.id} onClick={() => openLightbox(it.image)} className="rv hv mb-4 block w-full overflow-hidden rad md:mb-6" style={{ ["--d" as string]: `${(i % 3) * 100}ms` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.image} alt={it.title} loading="lazy" decoding="async" className="hv-img w-full object-cover" style={{ aspectRatio: i % 3 === 1 ? "3/4" : "4/3" }} />
            </button>
          ))}
        </div>
      </div>
    </Wrap>
  );
}

function Offers({ s }: { s: Section }) {
  const { cfg, f } = useSite();
  const [copied, setCopied] = useState("");
  const list = cfg.offers.filter((o) => o.enabled);
  if (!cfg.features.offers || !list.length) return null;
  return (
    <Wrap s={s}>
      <div className="ctn">
        <Head s={s} />
        <div className="grid gap-6 md:grid-cols-3">
          {list.map((o, i) => (
            <div key={o.id} className="rv hv card relative overflow-hidden p-8" style={{ ["--d" as string]: `${i * 100}ms` }}>
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20" style={{ background: "radial-gradient(closest-side, var(--accent), transparent)" }} />
              <div className="eyebrow">{o.discount}</div>
              <h3 className="fh mt-3 text-3xl">{f(o.title)}</h3>
              <p className="muted mt-3 text-sm leading-relaxed">{f(o.description)}</p>
              {o.code && (
                <button onClick={() => { navigator.clipboard?.writeText(o.code); setCopied(o.code); setTimeout(() => setCopied(""), 1600); }}
                  className="mt-6 flex w-full items-center justify-between rounded-xl border border-dashed px-4 py-3 font-mono text-sm tracking-widest"
                  style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
                  {o.code} <span className="font-sans text-xs tracking-normal">{copied === o.code ? "Copied ✓" : "Copy"}</span>
                </button>
              )}
              {o.validTill && <p className="muted mt-3 text-xs">Valid till {o.validTill}</p>}
            </div>
          ))}
        </div>
      </div>
    </Wrap>
  );
}

function Testimonials({ s }: { s: Section }) {
  const { f } = useSite();
  return (
    <Wrap s={s}>
      <div className="ctn">
        <Head s={s} />
        <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
          {s.items.map((it, i) => (
            <figure key={it.id} className="rv hv card w-[85%] shrink-0 snap-center p-8 md:w-auto" style={{ ["--d" as string]: `${i * 110}ms` }}>
              <div className="fh text-5xl leading-none" style={{ color: "var(--accent)" }}>“</div>
              <blockquote className="fh mt-2 text-xl leading-snug md:text-2xl">{f(it.text)}</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {it.image && <img src={it.image} alt="" className="h-10 w-10 rounded-full object-cover" />}
                <div><div className="text-sm font-semibold">{f(it.title)}</div><div className="muted text-xs">{f(it.value)}</div></div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </Wrap>
  );
}

function BookingSec({ s }: { s: Section }) {
  const { cfg, f, tx } = useSite();
  if (!cfg.features.booking || cfg.features.bookingPlacement === "popup") return null;
  return (
    <Wrap s={s}>
      <div className="ctn">
        <div className="card grid overflow-hidden md:grid-cols-5">
          <div className="relative min-h-[260px] md:col-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {s.image && <img src={s.image} alt="" loading="lazy" className="kenburns absolute inset-0 h-full w-full object-cover" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/10" />
            <div className="absolute bottom-0 p-8 text-white">
              {s.eyebrow && <p className="eyebrow mb-3">{f(s.eyebrow)}</p>}
              <h2 className="fh text-4xl md:text-5xl">{f(s.title)}</h2>
              {s.subtitle && <p className="mt-3 text-sm text-white/75">{f(s.subtitle)}</p>}
            </div>
          </div>
          <div className="rv p-6 md:col-span-3 md:p-12">
            <p className="fh mb-6 text-2xl">{tx("bookingTitle")}</p>
            <BookingForm />
          </div>
        </div>
      </div>
    </Wrap>
  );
}

function Faq({ s }: { s: Section }) {
  const { f } = useSite();
  return (
    <Wrap s={s}>
      <div className="ctn grid gap-10 md:grid-cols-5">
        <div className="md:col-span-2"><Head s={s} /></div>
        <div className="md:col-span-3">
          {s.items.map((it, i) => (
            <details key={it.id} className="rv group border-b py-6" style={{ borderColor: "color-mix(in srgb, var(--text) 12%, transparent)", ["--d" as string]: `${i * 80}ms` }}>
              <summary className="fh flex cursor-pointer list-none items-center justify-between gap-6 text-xl md:text-2xl">
                {f(it.title)} <span className="text-2xl transition group-open:rotate-45" style={{ color: "var(--accent)" }}>+</span>
              </summary>
              <p className="muted mt-4 leading-relaxed">{f(it.text)}</p>
            </details>
          ))}
        </div>
      </div>
    </Wrap>
  );
}

function Cta({ s }: { s: Section }) {
  const { f } = useSite();
  return (
    <Wrap s={s} className="py-16 md:py-24">
      <div className="ctn">
        <div className="rv relative overflow-hidden rad px-6 py-24 text-center md:py-36">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {s.image && <img src={s.image} alt="" loading="lazy" className="kenburns absolute inset-0 h-full w-full object-cover" />}
          <div className="absolute inset-0 bg-black/55" />
          <div className="relative text-white">
            <Split text={f(s.title)} className="fh h2 mx-auto max-w-4xl" />
            {s.subtitle && <p className="mx-auto mt-5 max-w-xl text-white/80">{f(s.subtitle)}</p>}
            {s.buttonLabel && <a href={s.buttonLink} className="btn btn-p mt-10">{f(s.buttonLabel)}</a>}
          </div>
        </div>
      </div>
    </Wrap>
  );
}

function Contact({ s }: { s: Section }) {
  const { cfg, f } = useSite();
  const c = cfg.site;
  return (
    <Wrap s={s}>
      <div className="ctn grid gap-10 md:grid-cols-2">
        <div>
          <Head s={s} />
          <div className="rv space-y-6 text-lg">
            <div><div className="eyebrow mb-1">Address</div><p>{f(c.address)}</p></div>
            <div><div className="eyebrow mb-1">Phone</div><a href={`tel:${c.phone}`}>{c.phone}</a></div>
            <div><div className="eyebrow mb-1">Email</div><a href={`mailto:${c.email}`}>{c.email}</a></div>
          </div>
        </div>
        {c.mapEmbed && (
          <div className="rv overflow-hidden rad" style={{ minHeight: 360 }}>
            <iframe src={c.mapEmbed} title="Map" loading="lazy" className="h-full min-h-[360px] w-full" style={{ border: 0, filter: cfg.theme.mode === "dark" ? "invert(.9) hue-rotate(180deg) saturate(.6)" : undefined }} />
          </div>
        )}
      </div>
    </Wrap>
  );
}

function Custom({ s }: { s: Section }) {
  const { f } = useSite();
  const hasMedia = s.image || s.video;
  return (
    <Wrap s={s}>
      <div className={`ctn ${hasMedia ? "grid items-center gap-12 md:grid-cols-2" : ""}`}>
        <div>
          <Head s={s} />
          {s.text && <p className="rv muted -mt-6 whitespace-pre-line leading-relaxed md:text-lg">{f(s.text)}</p>}
          {s.buttonLabel && <a href={s.buttonLink} className="btn btn-p rv mt-8">{f(s.buttonLabel)}</a>}
        </div>
        {hasMedia && (
          <div className="rv relative overflow-hidden rad" style={{ aspectRatio: "4/3" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {s.image && <img src={s.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />}
            {s.video && <LazyVideo src={s.video} poster={s.image} className="absolute inset-0 h-full w-full object-cover" />}
          </div>
        )}
      </div>
      {s.items.length > 0 && (
        <div className="ctn mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {s.items.map((it, i) => (
            <div key={it.id} className="rv hv card overflow-hidden" style={{ ["--d" as string]: `${i * 90}ms` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {it.image && <img src={it.image} alt="" loading="lazy" className="hv-img aspect-[4/3] w-full object-cover" />}
              <div className="p-6">
                {it.value && <div className="eyebrow mb-2">{f(it.value)}</div>}
                <h3 className="fh text-2xl">{f(it.title)}</h3>
                <p className="muted mt-2 text-sm">{f(it.text)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Wrap>
  );
}

export function SectionView({ s }: { s: Section }) {
  switch (s.type) {
    case "hero": return <Hero s={s} />;
    case "walkthrough": return <Walkthrough s={s} />;
    case "marquee": return <Marquee s={s} />;
    case "stats": return <Stats s={s} />;
    case "properties": return <Properties s={s} />;
    case "about": return <About s={s} />;
    case "services": return <Services s={s} />;
    case "video": return <VideoSec s={s} />;
    case "gallery": return <Gallery s={s} />;
    case "offers": return <Offers s={s} />;
    case "testimonials": return <Testimonials s={s} />;
    case "booking": return <BookingSec s={s} />;
    case "faq": return <Faq s={s} />;
    case "cta": return <Cta s={s} />;
    case "contact": return <Contact s={s} />;
    default: return <Custom s={s} />;
  }
}
