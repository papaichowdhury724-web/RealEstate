"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Section } from "@/lib/types";
import { DEFAULT_WT, DOOR_DEFAULT, WT_IMAGES } from "@/lib/wt";
import { useSite } from "./ui";

const c01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const ease = (t: number) => { const x = c01(t); return x * x * (3 - 2 * x); };
const seg = (a: number, lo: number, hi: number) => ease((a - lo) / (hi - lo));

type Kind = "entrance" | "room" | "finale";
interface Frame { kind: Kind; w: number; img?: string; kicker?: string; title?: string; text?: string }
interface Geo { vw: number; vh: number; Lx: number; Ly: number; ox: number; oy: number; dwp: number; dhp: number; sA: number; sB: number }

export default function Walkthrough({ s }: { s: Section }) {
  const { f, cfg } = useSite();
  const wa = { ...DEFAULT_WT, ...(cfg.animations.walkthrough || {}) };
  const outer = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const barT = useRef<HTMLDivElement>(null);
  const barB = useRef<HTMLDivElement>(null);
  const prog = useRef<HTMLElement>(null);
  const count = useRef<HTMLDivElement>(null);
  const rays = useRef<HTMLDivElement>(null);
  const sceneEls = useRef<(HTMLDivElement | null)[]>([]);
  const [muted, setMuted] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [coarse, setCoarse] = useState(false);
  const [asp, setAsp] = useState(16 / 9);

  const D = { x: s.doorX ?? DOOR_DEFAULT.x, y: s.doorY ?? DOOR_DEFAULT.y, w: s.doorW ?? DOOR_DEFAULT.w, h: s.doorH ?? DOOR_DEFAULT.h };
  const foyerImg = s.foyerImage || WT_IMAGES.foyer;

  const frames = useMemo<Frame[]>(() => {
    const rooms = s.items.filter((it) => it.image);
    const arr: Frame[] = [];
    arr.push({ kind: "entrance", w: 2.2, img: s.image, kicker: f(s.eyebrow || "Featured residence"), title: f(s.title), text: f(s.subtitle) });
    rooms.forEach((r, i) => arr.push({ kind: "room", w: 0.95, img: r.image, kicker: `${String(i + 1).padStart(2, "0")} · ${f(r.value || "The residence")}`, title: f(r.title), text: f(r.text) }));
    if (s.video) arr.push({ kind: "finale", w: 1.15, img: rooms[rooms.length - 1]?.image ?? foyerImg });
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s, foyerImg, cfg.site.brand, cfg.site.city]);

  const N = frames.length;
  const starts = useMemo(() => { let acc = 0; return frames.map((fr) => { const v = acc; acc += fr.w; return v; }); }, [frames]);
  const total = useMemo(() => frames.reduce((a, fr) => a + fr.w, 0), [frames]);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setCoarse(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  const optKey = `${wa.dust}${wa.sway}${wa.letterbox}${wa.flare}${D.x}${D.y}${D.w}${D.h}${asp}`;
  useEffect(() => {
    if (reduced) return;
    const root = outer.current, st = stage.current;
    if (!root || !st) return;
    const touch = window.matchMedia("(pointer: coarse)").matches;
    const low = touch || window.innerWidth < 900;
    root.dataset.perf = low ? "low" : "high";
    const q = <T extends HTMLElement>(el: ParentNode | null, sel: string) => (el ? el.querySelector<T>(sel) : null);

    const scenes = sceneEls.current.filter(Boolean) as HTMLDivElement[];
    const ent = scenes[0];
    const E = {
      scene: ent, camA: q(ent, ".wt-cam.a"), camB: q(ent, ".wt-cam.b"), ext: q(ent, ".wt-ext"),
      rect: q(ent, ".wt-rect"), int: q(ent, ".wt-int"), dk: q(ent, ".wt-int .dk"), L: q(ent, ".wt-leaf.l"), R: q(ent, ".wt-leaf.r"),
      shL: q(ent, ".wt-leaf.l .sh"), shR: q(ent, ".wt-leaf.r .sh"), hlL: q(ent, ".wt-leaf.l .hl"), hlR: q(ent, ".wt-leaf.r .hl"),
      glow: q(ent, ".wt-glow"), spill: q(ent, ".wt-spill"), flare: q(ent, ".wt-flare"), c1: q(ent, ".wt-cap.c1"), c2: q(ent, ".wt-cap.c2"),
    };
    const others = scenes.slice(1).map((el) => ({ el, img: q(el, ".wt-img"), cap: q(el, ".wt-cap"), vid: q(el, ".wt-vidwrap"), deal: q(el, ".wt-deal"), vis: true }));
    const video = root.querySelector<HTMLVideoElement>("video[data-wtv]");

    const g: Geo = { vw: 0, vh: 0, Lx: 0, Ly: 0, ox: 0, oy: 0, dwp: 1, dhp: 1, sA: 1.4, sB: 5.1 };
    const geo = () => {
      const vw = st.clientWidth, vh = st.clientHeight;
      if (!vw || !vh) return;
      const portrait = vw / vh < 0.9;
      const W = portrait ? vw * 2.15 : Math.max(vw, vh * asp);
      const H = W / asp;
      const dcy = (D.y + D.h / 2) / 100;
      g.vw = vw; g.vh = vh; g.Lx = (vw - W) / 2; g.Ly = portrait ? vh * 0.53 - dcy * H : (vh - H) / 2;
      g.dwp = (D.w / 100) * W; g.dhp = (D.h / 100) * H;
      g.ox = ((D.x + D.w / 2) / 100) * W; g.oy = dcy * H;
      g.sA = Math.max(1.08, Math.min((0.9 * vh) / g.dhp, (0.82 * vw) / g.dwp));
      g.sB = Math.max(g.sA * 1.38, Math.max(vw / g.dwp, vh / g.dhp) * 1.02);
      for (const cam of [E.camA, E.camB]) {
        if (!cam) continue;
        cam.style.left = `${g.Lx}px`; cam.style.top = `${g.Ly}px`; cam.style.width = `${W}px`; cam.style.height = `${H}px`;
        cam.style.transformOrigin = `${g.ox}px ${g.oy}px`;
      }
    };
    geo();

    let rz: ReturnType<typeof setTimeout>;
    const onResize = () => { clearTimeout(rz); rz = setTimeout(geo, 120); };
    window.addEventListener("resize", onResize);

    let raf = 0, running = false, cur = -1, lastIdx = -1, vLoaded = false, vPlaying = false;

    const paint = (p: number, now: number) => {
      const pr = p * total;
      const sx = wa.sway && !low ? Math.sin(now / 2600) * g.vw * 0.0014 : 0;
      const sy = wa.sway && !low ? Math.cos(now / 3200) * g.vh * 0.0012 : 0;
      const roll = wa.sway && !low ? Math.sin(now / 3600) * 0.025 : 0;

      const a0 = pr - starts[0];
      const w0 = frames[0].w;
      const t0 = a0 / w0;
      const show0 = a0 <= w0 + 0.14;
      if (show0) {
        E.scene.style.visibility = "visible"; E.scene.style.opacity = "1";
        const zp = seg(t0, 0, 0.5);
        const pt = seg(t0, 0.54, 0.9);
        const S = Math.exp(Math.log(g.sA) * zp + Math.log(g.sB / g.sA) * pt);
        const tx = (g.vw / 2 - g.Lx - g.ox) * zp + sx;
        const ty = (g.vh / 2 - g.Ly - g.oy) * zp + sy;
        const tf = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) rotate(${roll.toFixed(3)}deg) scale(${S.toFixed(4)})`;
        if (E.camA) E.camA.style.transform = tf;
        if (E.camB) E.camB.style.transform = tf;

        const cx = g.Lx + g.ox + tx, cy = g.Ly + g.oy + ty;
        const openL = seg(t0, 0.42, 0.7), openR = seg(t0, 0.45, 0.73), open = Math.max(openL, openR);
        if (E.L) E.L.style.transform = `rotateY(${(openL * 94).toFixed(2)}deg)`;
        if (E.R) E.R.style.transform = `rotateY(${(-openR * 91).toFixed(2)}deg)`;
        if (E.shL) E.shL.style.opacity = (openL * 0.76).toFixed(3);
        if (E.shR) E.shR.style.opacity = (openR * 0.76).toFixed(3);
        if (!low) {
          if (E.hlL) E.hlL.style.opacity = (Math.sin(Math.PI * openL) * 0.7).toFixed(3);
          if (E.hlR) E.hlR.style.opacity = (Math.sin(Math.PI * openR) * 0.7).toFixed(3);
        }

        const insideScale = 1 + seg(t0, 0.45, 0.92) * 0.15;
        if (E.int) {
          E.int.style.transform = `translate3d(${(cx - g.vw / 2).toFixed(2)}px, ${(cy - g.vh / 2).toFixed(2)}px, 0) scale(${insideScale.toFixed(4)})`;
          E.int.style.opacity = (0.1 + open * 0.95).toFixed(3);
        }
        if (E.dk) E.dk.style.opacity = (0.5 * (1 - seg(t0, 0.4, 0.68))).toFixed(3);
        if (E.glow) E.glow.style.opacity = (seg(t0, 0.14, 0.5) * (1 - seg(t0, 0.55, 0.82)) * 0.75).toFixed(3);
        if (!low && E.spill) {
          E.spill.style.opacity = (seg(t0, 0.43, 0.62) * (1 - seg(t0, 0.82, 1)) * 0.65).toFixed(3);
          E.spill.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0) translate(-50%, -50%) scale(${(0.6 + open * 0.5).toFixed(3)})`;
        }
        if (!low && E.flare && wa.flare) {
          E.flare.style.opacity = (Math.sin(Math.PI * seg(t0, 0.43, 0.72)) * 0.55).toFixed(3);
          E.flare.style.transform = `translate3d(0, ${cy.toFixed(1)}px, 0) scaleX(${(0.55 + open * 0.45).toFixed(3)})`;
        }
        if (E.c1) {
          const o = seg(t0, 0.03, 0.13) * (1 - seg(t0, 0.22, 0.38));
          E.c1.style.opacity = o.toFixed(3);
          E.c1.style.transform = `translate3d(0, ${((1 - seg(t0, 0.03, 0.13)) * 22 - seg(t0, 0.22, 0.38) * 14).toFixed(1)}px, 0)`;
        }
        if (E.c2) {
          const o = seg(t0, 0.67, 0.79) * (1 - seg(t0, 0.91, 1));
          E.c2.style.opacity = o.toFixed(3);
          E.c2.style.transform = `translate3d(0, ${((1 - seg(t0, 0.67, 0.79)) * 18).toFixed(1)}px, 0)`;
        }
      } else if (E.scene.style.visibility !== "hidden") {
        E.scene.style.visibility = "hidden"; E.scene.style.opacity = "0";
      }

      others.forEach((c, k) => {
        const i = k + 1;
        const fr = frames[i];
        const a = pr - starts[i];
        const w = fr.w;
        const t = a / w;
        const tt = c01(t);
        const last = i === N - 1;
        if (a < -0.42 || (!last && a > w + 0.12)) {
          if (c.vis) { c.vis = false; c.el.style.visibility = "hidden"; c.el.style.opacity = "0"; }
          return;
        }
        if (!c.vis) { c.vis = true; c.el.style.visibility = "visible"; }
        c.el.style.opacity = seg(a, -0.32, 0.03).toFixed(3);
        const exit = last ? 0 : seg(a, w - 0.28, w + 0.06);
        const enter = 1 - seg(a, -0.3, 0.02);
        if (fr.kind === "room") {
          const dir = i % 2 ? 1 : -1;
          if (c.img) c.img.style.transform = `translate3d(${(dir * (tt - 0.5) * (low ? 3.5 : 5)).toFixed(3)}%, ${(-tt * (low ? 1.2 : 1.8)).toFixed(3)}%, 0) scale(${(1.045 + tt * 0.055 + exit * 0.1 - enter * 0.04).toFixed(4)})`;
          if (c.cap) {
            const ci = seg(t, 0.07, 0.22), co = seg(t, 0.74, 0.9);
            c.cap.style.opacity = (ci * (1 - co)).toFixed(3);
            c.cap.style.transform = `translate3d(0, ${((1 - ci) * 18 - co * 14).toFixed(1)}px, 0)`;
          }
        } else {
          if (c.img) c.img.style.transform = `scale(${(1.03 - enter * 0.04).toFixed(4)})`;
          if (c.vid) c.vid.style.opacity = seg(a, -0.08, 0.34).toFixed(3);
          if (c.deal) {
            const d = seg(t, 0.3, 0.66);
            c.deal.style.opacity = d.toFixed(3);
            c.deal.style.transform = `translate3d(0, ${((1 - d) * 26).toFixed(1)}px, 0)`;
          }
        }
      });

      const bar = wa.letterbox ? seg(p, 0.0, 0.05) * (1 - seg(p, 0.955, 1)) : 0;
      if (barT.current) barT.current.style.transform = `scaleY(${bar.toFixed(3)})`;
      if (barB.current) barB.current.style.transform = `scaleY(${bar.toFixed(3)})`;
      if (prog.current) prog.current.style.transform = `scaleY(${p.toFixed(4)})`;
      if (!low && rays.current) rays.current.style.transform = `translate3d(${((p * 40) % 26 - 13).toFixed(1)}%, 0, 0)`;

      if (count.current) {
        let idx = 1;
        for (let i = 0; i < N; i++) if (pr >= starts[i] - 0.001) idx = i + 1;
        if (idx !== lastIdx) { lastIdx = idx; count.current.textContent = `${String(idx).padStart(2, "0")} / ${String(N).padStart(2, "0")}`; }
      }

      if (video) {
        const vt = pr - starts[N - 1];
        if (vt > -0.6 && !vLoaded) { vLoaded = true; video.src = video.dataset.src || ""; video.load(); }
        const want = vt > -0.16;
        if (want && !vPlaying) { vPlaying = true; video.play().catch(() => {}); }
        else if (!want && vPlaying) { vPlaying = false; video.pause(); }
      }
    };

    const tick = (now: number) => {
      const r = root.getBoundingClientRect();
      const range = r.height - window.innerHeight;
      const target = Math.min(1, Math.max(0, -r.top / (range || 1)));
      if (cur < 0) cur = target;
      cur += (target - cur) * (low ? 0.18 : 0.13);
      if (Math.abs(target - cur) < 0.0005) cur = target;
      paint(cur, now);
      if (running) raf = requestAnimationFrame(tick);
    };

    paint(0, 0);
    const io = new IntersectionObserver(([e]) => {
      running = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (running) raf = requestAnimationFrame(tick);
      else if (video) { video.pause(); vPlaying = false; }
    }, { rootMargin: "100px 0px" });
    io.observe(root);
    return () => { io.disconnect(); cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); clearTimeout(rz); };
  }, [N, reduced, frames, total, starts, optKey]);

  if (reduced) {
    const list = [s.image, foyerImg, ...s.items.map((i) => i.image)].filter(Boolean);
    return (
      <section id={s.id} data-bg={s.bg.join("|")} className="relative bg-black py-4">
        {list.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={src} alt="" loading={i ? "lazy" : "eager"} className="mb-2 w-full object-cover" style={{ maxHeight: "80svh" }} />
        ))}
        {s.video && <video src={s.video} controls muted loop playsInline className="w-full" />}
      </section>
    );
  }

  const scrollLen = Math.max(50, Math.min(220, wa.sceneLength)) * total;
  const leafImg = (side: "l" | "r"): React.CSSProperties => ({
    width: `${20000 / D.w}%`, height: `${10000 / D.h}%`, top: `${(-100 * D.y) / D.h}%`,
    left: side === "l" ? `${(-200 * D.x) / D.w}%` : `${(-200 * (D.x + D.w / 2)) / D.w}%`,
  });
  const rectStyle: React.CSSProperties = { left: `${D.x}%`, top: `${D.y}%`, width: `${D.w}%`, height: `${D.h}%` };

  return (
    <div ref={outer} className={`wt-wrap ${wa.letterbox ? "" : "wt-nobars"}`} style={{ height: `calc(${scrollLen}svh + 100svh)` }} data-bg={s.bg.join("|")} id={s.id}>
      <div ref={stage} className="wt-stage">
        {frames.map((fr, i) => (
          <div key={i} ref={(el) => { sceneEls.current[i] = el; }} className="wt-scene" data-kind={fr.kind} style={{ zIndex: i + 1, visibility: i ? "hidden" : "visible", opacity: i ? 0 : 1 }}>
            {fr.kind === "entrance" ? (
              <>
                <div className="wt-bgfill" />
                <div className="wt-cam a">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="wt-ext" src={fr.img} alt={fr.title || ""} fetchPriority="high" decoding="async" onLoad={(e) => { const im = e.currentTarget; if (im.naturalWidth) setAsp(im.naturalWidth / im.naturalHeight); }} />
                </div>
                <div className="wt-int">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={foyerImg} alt="" loading="eager" decoding="async" />
                  <div className="warm" />
                  <div className="dk" />
                </div>
                <div className="wt-cam b">
                  <div className="wt-glow" style={{ left: `${D.x + D.w / 2}%`, top: `${D.y + D.h / 2}%`, width: `${D.w * 4.2}%`, height: `${D.h * 2}%` }} />
                  <div className="wt-rect" style={rectStyle}>
                    <div className="wt-leaf l">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={fr.img} alt="" style={leafImg("l")} decoding="async" /><span className="hl" /><span className="sh" />
                    </div>
                    <div className="wt-leaf r">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={fr.img} alt="" style={leafImg("r")} decoding="async" /><span className="hl" /><span className="sh" />
                    </div>
                  </div>
                </div>
                <div className="wt-spill" />
                <div className="wt-flare" />
                <div className="wt-shade" />
                <div className="wt-cap c1" style={{ opacity: 0 }}>
                  {fr.kicker && <div className="kick">{fr.kicker}</div>}
                  {fr.title && <div className="ttl">{fr.title}</div>}
                  {fr.text && <p className="txt">{fr.text}</p>}
                </div>
                <div className="wt-cap c2" style={{ opacity: 0 }}>
                  <div className="kick">{cfg.site.brand}</div>
                  <div className="ttl">{f(s.text || "Step inside")}</div>
                </div>
              </>
            ) : fr.kind === "finale" ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {fr.img && <img className="wt-img" src={fr.img} alt="" loading="lazy" decoding="async" />}
                <div className="wt-vidwrap">
                  <video data-wtv data-src={s.video} poster={fr.img} muted={muted} loop playsInline preload="none" />
                  <div className="wt-vidshade" />
                </div>
                <div className="wt-deal">
                  <span className="wt-badge"><i />{f(s.dealLabel || "The best deal")}</span>
                  {s.price && <div className="wt-price">{f(s.price)}</div>}
                  <div className="fh mt-3 text-2xl md:text-4xl">{f(s.title)}</div>
                  {s.dealNote && <p className="wt-note">{f(s.dealNote)}</p>}
                  <div className="btns mt-6 flex flex-wrap items-center gap-3">
                    {s.buttonLabel && <a href={s.buttonLink || "#booking"} className="btn btn-p">{f(s.buttonLabel)}</a>}
                    <button onClick={() => {
                      const v = outer.current?.querySelector<HTMLVideoElement>("video[data-wtv]");
                      if (v) { v.muted = !v.muted; if (!v.muted) v.play().catch(() => {}); setMuted(v.muted); }
                    }} className="btn btn-g text-white">{muted ? "Turn sound on" : "Mute"}</button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {fr.img && <img className="wt-img" src={fr.img} alt={fr.title || ""} loading="lazy" decoding="async" />}
                <div className="wt-shade" />
                <div className="wt-warm" />
                <div className="wt-cap" style={{ opacity: 0 }}>
                  {fr.kicker && <div className="kick">{fr.kicker}</div>}
                  {fr.title && <div className="ttl">{fr.title}</div>}
                  {fr.text && <p className="txt">{fr.text}</p>}
                </div>
              </>
            )}
          </div>
        ))}

        {!coarse && <div className="wt-rays" ref={rays} aria-hidden />}
        {wa.dust && <div className="wt-dust" aria-hidden><span /><span /><span /><span /><span /><span /></div>}
        {wa.grain && <div className="wt-grain" aria-hidden />}
        <div className="wt-vig" aria-hidden />
        <div ref={barT} className="wt-bar t" aria-hidden />
        <div ref={barB} className="wt-bar b" aria-hidden />
        {wa.letterbox && <div className="wt-rec" aria-hidden><i />Private tour</div>}
        <div className="wt-prog" aria-hidden><i ref={prog} /></div>
        <div ref={count} className="wt-count" aria-hidden>01 / {String(N).padStart(2, "0")}</div>
        <button className="wt-skip" onClick={() => {
          const r = outer.current!.getBoundingClientRect();
          window.scrollTo({ top: window.scrollY + r.top + r.height - window.innerHeight + 4, behavior: "smooth" });
        }}>Skip tour ↓</button>
      </div>
    </div>
  );
}
