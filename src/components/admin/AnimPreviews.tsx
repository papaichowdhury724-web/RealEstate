"use client";
import { useEffect, useRef, useState } from "react";
import type { Animations, SiteConfig } from "@/lib/types";
import { Background, Cursor, Loader, spawnClick, useTilt } from "@/components/site/Effects";
import { themeVars } from "@/components/site/SiteApp";

function useCycle(ms = 2600) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const t0 = setTimeout(() => setOn(true), 200);
    const t = setInterval(() => setOn((v) => !v), ms);
    return () => { clearTimeout(t0); clearInterval(t); };
  }, [ms]);
  return on;
}

function Frame({ cfg, children, className = "", attrs = {}, ...rest }: { cfg: SiteConfig; children: React.ReactNode; className?: string; attrs?: Record<string, string> } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...rest} {...attrs} className={`site relative h-40 overflow-hidden rounded-xl border border-zinc-800 ${className}`} style={{ ...themeVars(cfg), minHeight: 0 }}>
      {children}
    </div>
  );
}

const IMG = "https://images.pexels.com/photos/17174768/pexels-photo-17174768.jpeg?auto=compress&cs=tinysrgb&w=400";

export function LoaderPreview({ cfg, type }: { cfg: SiteConfig; type: Animations["loader"] }) {
  if (type === "none") return <Frame cfg={cfg} className="grid place-items-center text-xs text-zinc-500">No loader — site appears instantly</Frame>;
  return (
    <Frame cfg={cfg}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={IMG} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
      <div style={{ transform: "scale(.5)", transformOrigin: "center", position: "absolute", inset: "-50%" }}>
        <Loader key={type} type={type} duration={Math.min(cfg.animations.loaderDuration, 2)} text={cfg.site.brand} contained loop />
      </div>
    </Frame>
  );
}

export function RevealPreview({ cfg, mode }: { cfg: SiteConfig; mode: Animations["scroll"] }) {
  const on = useCycle();
  return (
    <Frame cfg={cfg} attrs={{ "data-reveal": mode }} className="flex items-center gap-3 p-4">
      <Background mode="static" intensity={0.6} light={false} fallback={[cfg.theme.bg, cfg.theme.accent, cfg.theme.accent2]} contained />
      {[0, 1, 2].map((i) => (
        <div key={i} className={`rv card relative flex-1 overflow-hidden ${on ? "in" : ""}`} style={{ ["--d" as string]: `${i * 120}ms`, height: "100%" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMG} alt="" className="h-2/3 w-full object-cover" />
          <div className="p-2 text-[10px]">Residence {i + 1}</div>
        </div>
      ))}
    </Frame>
  );
}

export function TextPreview({ cfg, mode }: { cfg: SiteConfig; mode: Animations["textReveal"] }) {
  const on = useCycle(2800);
  const words = "Where legacy finds its address".split(" ");
  return (
    <Frame cfg={cfg} attrs={{ "data-text": mode }} className="grid place-items-center p-4">
      <Background mode="aurora" intensity={0.5} light={false} fallback={[cfg.theme.bg, cfg.theme.accent, cfg.theme.accent2]} contained />
      <h3 className={`wr fh relative text-center text-3xl ${on || mode === "none" ? "in" : ""}`}>
        {words.map((w, i) => <span key={i}><span className="w"><i style={{ ["--i" as string]: i }}>{w}</i></span>{" "}</span>)}
      </h3>
    </Frame>
  );
}

export function HoverPreview({ cfg, mode }: { cfg: SiteConfig; mode: Animations["hover"] }) {
  useTilt(mode === "tilt");
  return (
    <Frame cfg={cfg} attrs={{ "data-hover": mode }} className="flex items-center justify-center gap-4 p-5">
      {[0, 1].map((i) => (
        <div key={i} className="hv card h-full w-36 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMG} alt="" className="hv-img h-2/3 w-full object-cover" />
          <div className="p-2 text-[10px]">Hover me</div>
        </div>
      ))}
    </Frame>
  );
}

export function ClickPreview({ cfg, mode }: { cfg: SiteConfig; mode: Animations["click"] }) {
  return (
    <Frame cfg={cfg} className="grid cursor-pointer place-items-center" onPointerDown={(e) => spawnClick(mode, e.clientX, e.clientY, e.target as HTMLElement)}>
      <button className="btn btn-p" style={{ background: "var(--accent)", color: "var(--bg)" }}>Click anywhere</button>
    </Frame>
  );
}

export function CursorPreview({ cfg, mode }: { cfg: SiteConfig; mode: Animations["cursor"] }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} className="site relative h-40 overflow-hidden rounded-xl border border-zinc-800" style={{ ...themeVars(cfg), minHeight: 0, cursor: mode === "default" ? "auto" : "none" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={IMG} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
      <div className="relative grid h-full place-items-center gap-2 text-xs text-white">
        <span>Move your mouse here</span>
        <button className="btn btn-g text-white">Hover button</button>
      </div>
      <Cursor key={mode} type={mode} scope={ref} />
    </div>
  );
}

export function BgPreview({ cfg, mode, intensity }: { cfg: SiteConfig; mode: Animations["background"]; intensity: number }) {
  const palettes = cfg.sections.filter((s) => s.enabled).map((s) => s.bg);
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((v) => (v + 1) % Math.max(1, palettes.length)), 2200); return () => clearInterval(t); }, [palettes.length]);
  const p = (palettes[i] ?? [cfg.theme.bg, cfg.theme.accent, cfg.theme.accent2]) as [string, string, string];
  return (
    <Frame cfg={cfg}>
      <Background mode={mode} intensity={intensity} light={cfg.theme.mode === "light"} fallback={cfg.theme.mode === "light" ? [cfg.theme.bg, p[1], p[2]] : p} contained />
      <div className="relative grid h-full place-items-center text-center text-xs" style={{ color: "var(--text)" }}>
        <div>Simulating scroll · section {i + 1}/{palettes.length}<br /><span className="opacity-60">background morphs per section</span></div>
      </div>
    </Frame>
  );
}

export function WalkthroughPreview({ cfg }: { cfg: SiteConfig }) {
  const w = cfg.animations.walkthrough;
  const sec = cfg.sections.find((x) => x.type === "walkthrough");
  const house = sec?.image || "/images/wt-house.jpg";
  const foyer = sec?.foyerImage || "/images/wt-foyer.jpg";
  const D = { x: sec?.doorX ?? 42.3, y: sec?.doorY ?? 35.7, w: sec?.doorW ?? 15.6, h: sec?.doorH ?? 46.4 };
  const leaf = (side: "l" | "r"): React.CSSProperties => ({
    width: `${20000 / D.w}%`, height: `${10000 / D.h}%`, top: `${(-100 * D.y) / D.h}%`,
    left: side === "l" ? `${(-200 * D.x) / D.w}%` : `${(-200 * (D.x + D.w / 2)) / D.w}%`,
  });
  return (
    <div className="wtp">
      <div className="cam" style={{ transformOrigin: `${D.x + D.w / 2}% ${D.y + D.h / 2}%` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="ext" src={house} alt="" />
        <div className="rect" style={{ left: `${D.x}%`, top: `${D.y}%`, width: `${D.w}%`, height: `${D.h}%` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="int" src={foyer} alt="" />
          <div className="lf l">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={house} alt="" style={leaf("l")} /></div>
          <div className="lf r">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={house} alt="" style={leaf("r")} /></div>
        </div>
      </div>
      {w.grain && <div className="wt-grain" style={{ position: "absolute" }} />}
      {w.letterbox && <><div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 12, background: "#000", zIndex: 2 }} /><div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 12, background: "#000", zIndex: 2 }} /></>}
      <div className="cap">{cfg.site.brand} · step inside</div>
    </div>
  );
}
