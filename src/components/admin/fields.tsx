"use client";
import { useState } from "react";

export function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
      {children} {hint && <span className="font-normal normal-case tracking-normal text-zinc-500">— {hint}</span>}
    </span>
  );
}

export function Text({ label, value, onChange, hint, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; hint?: string; type?: string; placeholder?: string }) {
  return <label className="block"><Label hint={hint}>{label}</Label><input type={type} value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} /></label>;
}

export function Area({ label, value, onChange, rows = 3, hint }: { label: string; value: string; onChange: (v: string) => void; rows?: number; hint?: string }) {
  return <label className="block"><Label hint={hint}>{label}</Label><textarea rows={rows} value={value ?? ""} onChange={(e) => onChange(e.target.value)} /></label>;
}

export function Num({ label, value, onChange, min, max, step = 1, hint }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; hint?: string }) {
  return (
    <label className="block">
      <Label hint={hint}>{label}</Label>
      <div className="flex items-center gap-3">
        {min !== undefined && max !== undefined && (
          <input type="range" className="flex-1 accent-[#d4af6a]" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
        )}
        <input type="number" className="!w-24" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      </div>
    </label>
  );
}

export function Toggle({ label, value, onChange, hint }: { label: string; value: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <button type="button" onClick={() => onChange(!value)} className="flex w-full items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-left transition hover:border-zinc-700">
      <span>
        <span className="block text-sm text-zinc-100">{label}</span>
        {hint && <span className="block text-xs text-zinc-500">{hint}</span>}
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${value ? "bg-[#d4af6a]" : "bg-zinc-700"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${value ? "left-[22px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

export function Select<T extends string>({ label, value, onChange, options, hint }: { label: string; value: T; onChange: (v: T) => void; options: (T | { value: T; label: string })[]; hint?: string }) {
  return (
    <label className="block">
      <Label hint={hint}>{label}</Label>
      <select value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => {
          const v = typeof o === "string" ? o : o.value;
          const l = typeof o === "string" ? o : o.label;
          return <option key={v} value={v}>{l}</option>;
        })}
      </select>
    </label>
  );
}

export function Color({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"} onChange={(e) => onChange(e.target.value)} />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </label>
  );
}

export function Media({ label, value, onChange, kind = "image" }: { label: string; value: string; onChange: (v: string) => void; kind?: "image" | "video" | "any" }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const upload = async (file: File) => {
    setBusy(true); setErr("");
    const fd = new FormData(); fd.append("file", file);
    try {
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      const j = await r.json().catch(() => ({}));
      if (r.ok) onChange(j.url); else setErr(j.error || "Upload failed");
    } catch { setErr("Upload failed — check your connection"); }
    finally { setBusy(false); }
  };
  const isVideo = kind === "video" || /\.(mp4|webm|mov)(\?|$)/i.test(value);
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2">
        <input type="url" placeholder="Paste URL or choose a file →" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
        <label className={`shrink-0 cursor-pointer rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-200 hover:border-[#d4af6a] ${busy ? "opacity-50" : ""}`}>
          {busy ? "Uploading…" : "Choose file"}
          <input type="file" hidden accept={kind === "image" ? "image/*" : kind === "video" ? "video/*" : "image/*,video/*"} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </label>
        {value && <button type="button" onClick={() => onChange("")} className="shrink-0 rounded-lg border border-zinc-700 px-2 text-xs text-zinc-400 hover:text-red-400">✕</button>}
      </div>
      {err && <p className="mt-1 text-xs text-red-400">{err}</p>}
      {value && (
        <div className="mt-2 overflow-hidden rounded-lg border border-zinc-800 bg-black/40">
          {isVideo ? <video src={value} muted loop autoPlay playsInline className="h-28 w-full object-cover" />
            // eslint-disable-next-line @next/next/no-img-element
            : <img src={value} alt="" className="h-28 w-full object-cover" />}
        </div>
      )}
    </div>
  );
}

export function Card({ title, children, actions, desc }: { title?: React.ReactNode; children: React.ReactNode; actions?: React.ReactNode; desc?: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#12141b] p-5">
      {(title || actions) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="text-base font-semibold text-zinc-100">{title}</h3>}
            {desc && <p className="mt-0.5 text-xs text-zinc-500">{desc}</p>}
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function Btn({ children, onClick, variant = "ghost", small = false, disabled }: { children: React.ReactNode; onClick?: () => void; variant?: "gold" | "ghost" | "danger"; small?: boolean; disabled?: boolean }) {
  const cls = variant === "gold" ? "bg-[#d4af6a] text-black hover:bg-[#e3c283]" : variant === "danger" ? "border border-red-900/60 text-red-400 hover:bg-red-950/40" : "border border-zinc-700 text-zinc-200 hover:border-zinc-500";
  return <button type="button" disabled={disabled} onClick={onClick} className={`rounded-lg font-medium transition disabled:opacity-40 ${small ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm"} ${cls}`}>{children}</button>;
}

/* list helpers */
export function move<T>(arr: T[], i: number, d: -1 | 1): T[] {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const n = [...arr]; [n[i], n[j]] = [n[j], n[i]]; return n;
}
export function OrderBtns({ i, len, onMove, onRemove }: { i: number; len: number; onMove: (d: -1 | 1) => void; onRemove?: () => void }) {
  return (
    <>
      <Btn small onClick={() => onMove(-1)} disabled={i === 0}>↑</Btn>
      <Btn small onClick={() => onMove(1)} disabled={i === len - 1}>↓</Btn>
      {onRemove && <Btn small variant="danger" onClick={() => { if (confirm("Remove this item?")) onRemove(); }}>Delete</Btn>}
    </>
  );
}
