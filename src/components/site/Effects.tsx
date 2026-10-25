"use client";
import { useEffect, useRef, useState } from "react";
import type { Animations } from "@/lib/types";

/* ---------------- Scroll-reactive cinematic background ---------------- */
export function Background({
  mode, intensity, light, fallback, scope, contained = false, watchKey,
}: {
  mode: Animations["background"]; intensity: number; light: boolean; fallback: [string, string, string];
  scope?: () => HTMLElement | null; contained?: boolean; watchKey?: string;
}) {
  const base = useRef<HTMLDivElement>(null);
  const blobs = useRef<(HTMLDivElement | null)[]>([]);
  const bgBase = fallback[0];

  useEffect(() => {
    const apply = (p: string[]) => {
      if (base.current) base.current.style.backgroundColor = light ? bgBase : p[0];
      const cols = light
        ? [p[1], p[2], p[1], p[2]].map((c) => `color-mix(in srgb, ${c} 30%, ${bgBase})`)
        : [p[1], p[2], p[1], p[2]];
      blobs.current.forEach((b, i) => { if (b) b.style.color = cols[i] ?? cols[0]; });
    };
    apply(fallback);
    if (contained) return;
    const root = scope?.() ?? document;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-bg]"));
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) apply((e.target as HTMLElement).dataset.bg!.split("|"));
        }
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [light, bgBase, fallback.join(), contained, watchKey]);

  return (
    <div className={`bgx ${light ? "light" : ""}`} data-mode={mode}
      style={{ ["--bgi" as string]: String(intensity), ...(contained ? { position: "absolute" } : {}) }} aria-hidden>
      <div className="base" ref={base} />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={`blob b${i + 1}`} ref={(el) => { blobs.current[i] = el; }} />
      ))}
      <div className="grid" />
      <div className="grain" />
      <div className="vig" />
    </div>
  );
}

/* ---------------- Loader ---------------- */
export function Loader({ type, duration, text, onDone, contained = false, loop = false }: {
  type: Animations["loader"]; duration: number; text: string; onDone?: () => void; contained?: boolean; loop?: boolean;
}) {
  const [phase, setPhase] = useState<"live" | "done" | "gone">("live");
  const [count, setCount] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (type === "none") { onDone?.(); return; }
    setPhase("live"); setCount(0);
    const ms = Math.max(400, duration * 1000);
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      setCount(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    if (type === "counter") raf = requestAnimationFrame(tick);
    const t1 = setTimeout(() => { setPhase("done"); onDone?.(); }, ms);
    const t2 = setTimeout(() => setPhase("gone"), ms + 1400);
    const t3 = loop ? setTimeout(() => setCycle((c) => c + 1), ms + 2200) : undefined;
    return () => { cancelAnimationFrame(raf); clearTimeout(t1); clearTimeout(t2); if (t3) clearTimeout(t3); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, duration, cycle]);

  if (type === "none" || (phase === "gone" && !loop)) return null;
  const cls = `ld ld-${type} ${phase === "live" ? "live" : ""} ${phase === "done" ? "done" : ""} ${phase === "gone" ? "done gone" : ""}`;
  const style = { ...(contained ? { position: "absolute" as const } : {}), ["--ldur" as string]: `${duration}s` };
  const label = <div className="ld-text fh">{text}</div>;

  if (type === "blinds")
    return (
      <div className={cls} style={style}>
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="blind" style={{ ["--i" as string]: i }} />)}
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>{label}</div>
      </div>
    );
  return (
    <div className={cls} style={style}>
      <div className="panel p1" />
      {(type === "curtain" || type === "split") && <div className="panel p2" />}
      {label}
      {type !== "counter" && <div className="ld-line" />}
      {type === "counter" && <div className="ld-count fh">{count}</div>}
    </div>
  );
}

/* ---------------- Custom cursor ---------------- */
export function Cursor({ type, scope }: { type: Animations["cursor"]; scope?: React.RefObject<HTMLElement | null> }) {
  const a = useRef<HTMLDivElement>(null);
  const b = useRef<HTMLDivElement>(null);
  const spot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (type === "default") return;
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    const target: HTMLElement | Window = scope?.current ?? window;
    let mx = -100, my = -100, rx = -100, ry = -100, raf = 0;
    const offset = () => {
      if (!scope?.current) return { x: 0, y: 0 };
      const r = scope.current.getBoundingClientRect();
      return { x: r.left, y: r.top };
    };
    const move = (e: Event) => {
      const ev = e as PointerEvent;
      const o = offset();
      mx = ev.clientX - o.x; my = ev.clientY - o.y;
      const el = ev.target as HTMLElement | null;
      const interactive = !!el?.closest?.("a,button,.hv,input,select,textarea");
      b.current?.classList.toggle("big", interactive);
      a.current?.classList.toggle("big", interactive);
      if (spot.current) { spot.current.style.setProperty("--mx", `${mx}px`); spot.current.style.setProperty("--my", `${my}px`); }
    };
    const loop = () => {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      if (a.current) a.current.style.transform = `translate3d(${type === "glow" || type === "blend" ? rx : mx}px, ${type === "glow" || type === "blend" ? ry : my}px, 0)`;
      if (b.current) b.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    target.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    if (!scope) document.documentElement.classList.add("has-cursor");
    return () => {
      target.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-cursor");
    };
  }, [type, scope]);

  if (type === "default") return null;
  const pos = scope ? { position: "absolute" as const } : {};
  if (type === "dot-ring") return (<><div ref={a} className="cur cur-dot" style={pos} /><div ref={b} className="cur cur-ring" style={pos} /></>);
  if (type === "glow") return (<><div ref={a} className="cur cur-glow" style={pos} /><div ref={b} className="cur cur-dot" style={pos} /></>);
  if (type === "blend") return <div ref={a} className="cur cur-blend" style={pos} />;
  return <div ref={spot} className="cur-spot" style={pos}><div ref={b} className="cur cur-dot" style={pos} /></div>;
}

/* ---------------- Click effects ---------------- */
export function spawnClick(type: Animations["click"], x: number, y: number, target?: HTMLElement | null) {
  if (type === "none") return;
  if (type === "ripple") {
    const d = document.createElement("div");
    d.className = "fx-ripple"; d.style.left = `${x}px`; d.style.top = `${y}px`;
    document.body.appendChild(d); setTimeout(() => d.remove(), 750);
  } else if (type === "pulse") {
    const el = target?.closest<HTMLElement>("a,button,.hv") ?? target;
    if (!el) return;
    el.classList.remove("fx-pulse"); void el.offsetWidth; el.classList.add("fx-pulse");
    setTimeout(() => el.classList.remove("fx-pulse"), 500);
  } else if (type === "burst") {
    for (let i = 0; i < 10; i++) {
      const d = document.createElement("div");
      const ang = (i / 10) * Math.PI * 2;
      d.className = "fx-dot"; d.style.left = `${x}px`; d.style.top = `${y}px`;
      d.style.setProperty("--tx", `${Math.cos(ang) * 46}px`); d.style.setProperty("--ty", `${Math.sin(ang) * 46}px`);
      document.body.appendChild(d); setTimeout(() => d.remove(), 700);
    }
  }
}

export function useClickFx(type: Animations["click"]) {
  useEffect(() => {
    if (type === "none") return;
    const h = (e: PointerEvent) => spawnClick(type, e.clientX, e.clientY, e.target as HTMLElement);
    window.addEventListener("pointerdown", h, { passive: true });
    return () => window.removeEventListener("pointerdown", h);
  }, [type]);
}

/* ---------------- Tilt hover (delegated) ---------------- */
export function useTilt(enabled: boolean) {
  useEffect(() => {
    if (!enabled || window.matchMedia("(hover: none)").matches) return;
    let last: HTMLElement | null = null;
    const move = (e: PointerEvent) => {
      const el = (e.target as HTMLElement)?.closest?.<HTMLElement>(".hv") ?? null;
      if (last && last !== el) { last.style.setProperty("--rx", "0deg"); last.style.setProperty("--ry", "0deg"); }
      last = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--rx", `${(-py * 8).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${(px * 10).toFixed(2)}deg`);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [enabled]);
}

/* ---------------- Reveal observer ---------------- */
export function useReveal(root: React.RefObject<HTMLElement | null>, key: string) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    const scan = () => el.querySelectorAll(".rv:not(.in), .wr:not(.in)").forEach((n) => io.observe(n));
    scan();
    let t: ReturnType<typeof setTimeout> | undefined;
    const mo = new MutationObserver(() => { clearTimeout(t); t = setTimeout(scan, 60); });
    mo.observe(el, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); clearTimeout(t); };
  }, [root, key]);
}

/* ---------------- Split text ---------------- */
export function Split({ text, className = "", as: Tag = "h2", delay = 0 }: { text: string; className?: string; as?: "h1" | "h2" | "h3" | "p"; delay?: number }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <Tag className={`wr ${className}`} style={{ ["--d" as string]: `${delay}ms` }}>
      {words.map((w, i) => (
        <span key={i}><span className="w"><i style={{ ["--i" as string]: i }}>{w}</i></span>{i < words.length - 1 ? " " : ""}</span>
      ))}
    </Tag>
  );
}
