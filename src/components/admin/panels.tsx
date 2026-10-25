"use client";
import { useState } from "react";
import type { Animations, BookingField, NavLink, Section, SectionType, SiteConfig, Theme, Widget } from "@/lib/types";
import { blankProperty, blankSection, blankWidget, defaultConfig, FONT_OPTIONS, item, uid } from "@/lib/defaults";
import { Area, Btn, Card, Color, Media, Num, OrderBtns, Select, Text, Toggle, move } from "./fields";
import { BgPreview, ClickPreview, CursorPreview, HoverPreview, LoaderPreview, RevealPreview, TextPreview, WalkthroughPreview } from "./AnimPreviews";
import { DEFAULT_WT, DOOR_DEFAULT } from "@/lib/wt";

export type Setter = (fn: (c: SiteConfig) => SiteConfig) => void;
type P = { cfg: SiteConfig; set: Setter };

const Grid = ({ children, cols = 2 }: { children: React.ReactNode; cols?: number }) => (
  <div className={`grid gap-4 ${cols === 3 ? "md:grid-cols-3" : cols === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2"}`}>{children}</div>
);

/* ===================== Site settings ===================== */
export function SitePanel({ cfg, set }: P) {
  const s = cfg.site;
  const u = (k: keyof typeof s) => (v: string) => set((c) => ({ ...c, site: { ...c.site, [k]: v } }));
  return (
    <div className="space-y-5">
      <Card title="Brand" desc="The brand name replaces every {brand} token across the whole website — header, footer, loader, SEO, texts.">
        <Grid>
          <Text label="Brand name" value={s.brand} onChange={u("brand")} />
          <Text label="Tagline" value={s.tagline} onChange={u("tagline")} />
          <Text label="City" value={s.city} onChange={u("city")} hint="{city} token" />
          <Num label="Logo height (px)" value={cfg.header.logoHeight} min={20} max={90} onChange={(v) => set((c) => ({ ...c, header: { ...c.header, logoHeight: v } }))} />
          <Media label="Logo image (optional — brand text used if empty)" value={s.logoUrl} onChange={u("logoUrl")} />
          <Media label="Favicon" value={s.faviconUrl} onChange={u("faviconUrl")} />
        </Grid>
      </Card>
      <Card title="SEO">
        <Text label="Page title" value={s.seoTitle} onChange={u("seoTitle")} />
        <Area label="Meta description" value={s.seoDescription} onChange={u("seoDescription")} />
      </Card>
      <Card title="Contact details">
        <Grid>
          <Text label="Phone" value={s.phone} onChange={u("phone")} />
          <Text label="WhatsApp number" hint="country code, digits only" value={s.whatsapp} onChange={u("whatsapp")} />
          <Text label="Email" value={s.email} onChange={u("email")} />
          <Text label="Google Maps embed URL" value={s.mapEmbed} onChange={u("mapEmbed")} />
        </Grid>
        <Area label="Address" value={s.address} onChange={u("address")} rows={2} />
      </Card>
    </div>
  );
}

/* ===================== Texts ===================== */
export function TextsPanel({ cfg, set }: P) {
  const [nk, setNk] = useState("");
  const keys = Array.from(new Set([...Object.keys(defaultConfig.texts), ...Object.keys(cfg.texts)]));
  const human = (k: string) => k.replace(/([A-Z])/g, " $1").replace(/^./, (m) => m.toUpperCase());
  return (
    <Card title="Website texts" desc="Every button, label and message on the site. Use {brand}, {city}, {phone} tokens anywhere.">
      <Grid>
        {keys.map((k) => (
          <Text key={k} label={human(k)} value={cfg.texts[k] ?? defaultConfig.texts[k] ?? ""} onChange={(v) => set((c) => ({ ...c, texts: { ...c.texts, [k]: v } }))} />
        ))}
      </Grid>
      <div className="flex gap-2 border-t border-zinc-800 pt-4">
        <input type="text" placeholder="newTextKey" value={nk} onChange={(e) => setNk(e.target.value)} />
        <Btn onClick={() => { if (nk) { set((c) => ({ ...c, texts: { ...c.texts, [nk]: "" } })); setNk(""); } }}>Add text key</Btn>
      </div>
    </Card>
  );
}

/* ===================== Links editor ===================== */
function LinksEditor({ links, onChange }: { links: NavLink[]; onChange: (l: NavLink[]) => void }) {
  return (
    <div className="space-y-2">
      {links.map((l, i) => (
        <div key={l.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-800 p-2">
          <input type="checkbox" checked={l.enabled} onChange={(e) => onChange(links.map((x) => x.id === l.id ? { ...x, enabled: e.target.checked } : x))} className="h-4 w-4 accent-[#d4af6a]" />
          <input type="text" className="!w-36 flex-1" value={l.label} placeholder="Label" onChange={(e) => onChange(links.map((x) => x.id === l.id ? { ...x, label: e.target.value } : x))} />
          <input type="text" className="!w-40 flex-1" value={l.href} placeholder="#section or https://" onChange={(e) => onChange(links.map((x) => x.id === l.id ? { ...x, href: e.target.value } : x))} />
          <OrderBtns i={i} len={links.length} onMove={(d) => onChange(move(links, i, d))} onRemove={() => onChange(links.filter((x) => x.id !== l.id))} />
        </div>
      ))}
      <Btn small onClick={() => onChange([...links, { id: uid(), label: "New link", href: "#", enabled: true }])}>+ Add link</Btn>
    </div>
  );
}

export function HeaderPanel({ cfg, set }: P) {
  const h = cfg.header;
  const u = <K extends keyof typeof h>(k: K, v: (typeof h)[K]) => set((c) => ({ ...c, header: { ...c.header, [k]: v } }));
  return (
    <div className="space-y-5">
      <Card title="Navigation links" desc="Link to a section with #section-id (see Sections tab) or any external URL.">
        <LinksEditor links={h.links} onChange={(l) => u("links", l)} />
      </Card>
      <Card title="Header options">
        <Grid>
          <Text label="CTA button label" value={h.ctaLabel} onChange={(v) => u("ctaLabel", v)} hint="empty = hidden" />
          <Text label="CTA button link" value={h.ctaLink} onChange={(v) => u("ctaLink", v)} />
        </Grid>
        <Grid>
          <Toggle label="Sticky header" value={h.sticky} onChange={(v) => u("sticky", v)} />
          <Toggle label="Show phone number" value={h.showPhone} onChange={(v) => u("showPhone", v)} />
        </Grid>
      </Card>
    </div>
  );
}

export function FooterPanel({ cfg, set }: P) {
  const ft = cfg.footer;
  const u = <K extends keyof typeof ft>(k: K, v: (typeof ft)[K]) => set((c) => ({ ...c, footer: { ...c.footer, [k]: v } }));
  return (
    <div className="space-y-5">
      <Card title="Footer content">
        <Area label="About text" value={ft.about} onChange={(v) => u("about", v)} />
        <Text label="Copyright" value={ft.copyright} onChange={(v) => u("copyright", v)} />
        <Toggle label="Show contact details" value={ft.showContact} onChange={(v) => u("showContact", v)} />
      </Card>
      <Card title="Link columns" actions={<Btn small onClick={() => u("columns", [...ft.columns, { id: uid(), title: "New column", links: [] }])}>+ Column</Btn>}>
        {ft.columns.map((col, i) => (
          <div key={col.id} className="space-y-3 rounded-xl border border-zinc-800 p-4">
            <div className="flex items-end gap-2">
              <div className="flex-1"><Text label="Column title" value={col.title} onChange={(v) => u("columns", ft.columns.map((x) => x.id === col.id ? { ...x, title: v } : x))} /></div>
              <OrderBtns i={i} len={ft.columns.length} onMove={(d) => u("columns", move(ft.columns, i, d))} onRemove={() => u("columns", ft.columns.filter((x) => x.id !== col.id))} />
            </div>
            <LinksEditor links={col.links} onChange={(l) => u("columns", ft.columns.map((x) => x.id === col.id ? { ...x, links: l } : x))} />
          </div>
        ))}
      </Card>
      <Card title="Social links">
        <LinksEditor links={ft.socials.map((s) => ({ id: s.id, label: s.label, href: s.url, enabled: s.enabled }))}
          onChange={(l) => u("socials", l.map((x) => ({ id: x.id, label: x.label, url: x.href, enabled: x.enabled })))} />
      </Card>
    </div>
  );
}

/* ===================== Sections ===================== */
const SECTION_TYPES: SectionType[] = ["hero", "walkthrough", "marquee", "stats", "properties", "about", "services", "video", "gallery", "offers", "testimonials", "booking", "faq", "contact", "cta", "custom"];

export function SectionsPanel({ cfg, set }: P) {
  const [open, setOpen] = useState<string | null>(null);
  const [newType, setNewType] = useState<SectionType>("custom");
  const list = cfg.sections;
  const setList = (l: Section[]) => set((c) => ({ ...c, sections: l }));
  const upd = (id: string, p: Partial<Section>) => setList(list.map((s) => (s.id === id ? { ...s, ...p } : s)));
  return (
    <div className="space-y-3">
      <Card title="Add a section" desc="Add, edit, hide, reorder or delete any section. Each section has its own scroll-background colour palette.">
        <div className="flex gap-2">
          <select value={newType} onChange={(e) => setNewType(e.target.value as SectionType)}>{SECTION_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
          <Btn variant="gold" onClick={() => { const s = blankSection({ type: newType, title: "New " + newType + " section", eyebrow: "New" }); setList([...list, s]); setOpen(s.id); }}>+ Add</Btn>
        </div>
      </Card>
      {list.map((s, i) => (
        <div key={s.id} className={`rounded-2xl border bg-[#12141b] ${s.enabled ? "border-zinc-800" : "border-zinc-900 opacity-60"}`}>
          <div className="flex flex-wrap items-center gap-2 p-3">
            <span className="flex gap-0.5">{s.bg.map((c, k) => <span key={k} className="h-5 w-2.5 rounded-sm" style={{ background: c }} />)}</span>
            <button onClick={() => setOpen(open === s.id ? null : s.id)} className="min-w-0 flex-1 text-left">
              <span className="mr-2 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-[#d4af6a]">{s.type}</span>
              <span className="text-sm text-zinc-100">{s.title || s.eyebrow || "(untitled)"}</span>
              <span className="ml-2 text-xs text-zinc-500">#{s.id}</span>
            </button>
            <Btn small onClick={() => upd(s.id, { enabled: !s.enabled })}>{s.enabled ? "On" : "Off"}</Btn>
            <Btn small onClick={() => { const c = { ...structuredClone(s), id: uid() }; const n = [...list]; n.splice(i + 1, 0, c); setList(n); }}>Duplicate</Btn>
            <OrderBtns i={i} len={list.length} onMove={(d) => setList(move(list, i, d))} onRemove={() => setList(list.filter((x) => x.id !== s.id))} />
            <Btn small onClick={() => setOpen(open === s.id ? null : s.id)}>{open === s.id ? "Close" : "Edit"}</Btn>
          </div>
          {open === s.id && <div className="space-y-4 border-t border-zinc-800 p-4"><SectionEditor s={s} onChange={(p) => { upd(s.id, p); if (p.id) setOpen(p.id); }} /></div>}
        </div>
      ))}
    </div>
  );
}

function DoorPicker({ s, onChange }: { s: Section; onChange: (p: Partial<Section>) => void }) {
  const d = { x: s.doorX ?? DOOR_DEFAULT.x, y: s.doorY ?? DOOR_DEFAULT.y, w: s.doorW ?? DOOR_DEFAULT.w, h: s.doorH ?? DOOR_DEFAULT.h };
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Front-door position <span className="font-normal normal-case tracking-normal text-zinc-500">— frame the door exactly; these two halves will swing open</span></p>
      <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-zinc-800" style={{ aspectRatio: "16/9" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {s.image && <img src={s.image} alt="" className="absolute inset-0 h-full w-full object-fill" />}
        <div className="absolute border-2 border-[#d4af6a] bg-[#d4af6a]/20" style={{ left: `${d.x}%`, top: `${d.y}%`, width: `${d.w}%`, height: `${d.h}%` }} />
      </div>
      <Grid>
        <Num label="Door left (%)" value={d.x} min={0} max={100} step={0.1} onChange={(v) => onChange({ doorX: v })} />
        <Num label="Door top (%)" value={d.y} min={0} max={100} step={0.1} onChange={(v) => onChange({ doorY: v })} />
        <Num label="Door width (%)" value={d.w} min={3} max={60} step={0.1} onChange={(v) => onChange({ doorW: v })} />
        <Num label="Door height (%)" value={d.h} min={5} max={90} step={0.1} onChange={(v) => onChange({ doorH: v })} />
      </Grid>
      <Btn small onClick={() => onChange({ doorX: DOOR_DEFAULT.x, doorY: DOOR_DEFAULT.y, doorW: DOOR_DEFAULT.w, doorH: DOOR_DEFAULT.h })}>Reset to default house</Btn>
    </div>
  );
}

function SectionEditor({ s, onChange }: { s: Section; onChange: (p: Partial<Section>) => void }) {
  const noItems = ["hero", "properties", "about", "video", "offers", "booking", "contact", "cta"].includes(s.type);
  return (
    <>
      <Grid>
        <Text label="Section ID (anchor)" value={s.id} onChange={(v) => onChange({ id: v.replace(/\s+/g, "-") })} hint="link with #id" />
        <Select label="Type" value={s.type} onChange={(v) => onChange({ type: v })} options={SECTION_TYPES} />
        <Text label="Eyebrow" value={s.eyebrow} onChange={(v) => onChange({ eyebrow: v })} />
        <Text label="Title" value={s.title} onChange={(v) => onChange({ title: v })} />
      </Grid>
      <Area label="Subtitle" value={s.subtitle} onChange={(v) => onChange({ subtitle: v })} rows={2} />
      <Area label="Body text" value={s.text} onChange={(v) => onChange({ text: v })} />
      <Grid>
        <Media label="Image" value={s.image} onChange={(v) => onChange({ image: v })} />
        <Media label="Video" kind="video" value={s.video} onChange={(v) => onChange({ video: v })} />
        <Text label="Button label" value={s.buttonLabel} onChange={(v) => onChange({ buttonLabel: v })} />
        <Text label="Button link" value={s.buttonLink} onChange={(v) => onChange({ buttonLink: v })} />
      </Grid>
      {s.type === "walkthrough" && (
        <div className="space-y-4 rounded-xl border border-[#d4af6a]/30 bg-[#d4af6a]/5 p-4">
          <p className="text-xs text-zinc-400">
            <b className="text-[#d4af6a]">Cinematic walkthrough</b> — <b>Image</b> = the house photo (the camera zooms to its front door, and the door halves are cut from this same photo) · <b>Body text</b> = text shown on the doors ·
            <b> Video</b> = the final best-deal film · <b>Items</b> = the rooms you travel through (image + title + caption).
          </p>
          <Grid>
            <Media label="Foyer / hall image (revealed behind the doors)" value={s.foyerImage ?? ""} onChange={(v) => onChange({ foyerImage: v })} />
            <Text label="Deal badge" value={s.dealLabel ?? ""} onChange={(v) => onChange({ dealLabel: v })} />
            <Text label="Deal price" value={s.price ?? ""} onChange={(v) => onChange({ price: v })} />
          </Grid>
          <Area label="Deal note" rows={2} value={s.dealNote ?? ""} onChange={(v) => onChange({ dealNote: v })} />
          <DoorPicker s={s} onChange={onChange} />
        </div>
      )}
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Scroll background palette (base · glow 1 · glow 2)</p>
        <Grid cols={3}>{s.bg.map((c, k) => <Color key={k} label={["Base", "Glow 1", "Glow 2"][k]} value={c} onChange={(v) => { const b = [...s.bg] as Section["bg"]; b[k] = v; onChange({ bg: b }); }} />)}</Grid>
      </div>
      {!noItems && (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Items</p>
          {s.items.map((it, i) => (
            <div key={it.id} className="space-y-3 rounded-xl border border-zinc-800 p-3">
              <div className="flex justify-end gap-2"><OrderBtns i={i} len={s.items.length} onMove={(d) => onChange({ items: move(s.items, i, d) })} onRemove={() => onChange({ items: s.items.filter((x) => x.id !== it.id) })} /></div>
              <Grid>
                <Text label="Title" value={it.title} onChange={(v) => onChange({ items: s.items.map((x) => x.id === it.id ? { ...x, title: v } : x) })} />
                <Text label="Value / subtitle" value={it.value} onChange={(v) => onChange({ items: s.items.map((x) => x.id === it.id ? { ...x, value: v } : x) })} />
                <Text label="Icon (emoji/symbol)" value={it.icon} onChange={(v) => onChange({ items: s.items.map((x) => x.id === it.id ? { ...x, icon: v } : x) })} />
                <Media label="Image" value={it.image} onChange={(v) => onChange({ items: s.items.map((x) => x.id === it.id ? { ...x, image: v } : x) })} />
              </Grid>
              <Area label="Text" rows={2} value={it.text} onChange={(v) => onChange({ items: s.items.map((x) => x.id === it.id ? { ...x, text: v } : x) })} />
            </div>
          ))}
          <Btn small onClick={() => onChange({ items: [...s.items, item({ title: "New item" })] })}>+ Add item</Btn>
        </div>
      )}
    </>
  );
}

/* ===================== Properties ===================== */
export function PropertiesPanel({ cfg, set }: P) {
  const [open, setOpen] = useState<string | null>(null);
  const list = cfg.properties;
  const setList = (l: typeof list) => set((c) => ({ ...c, properties: l }));
  const upd = (id: string, p: Partial<(typeof list)[number]>) => setList(list.map((x) => (x.id === id ? { ...x, ...p } : x)));
  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <p className="text-sm text-zinc-400">{list.length} listings · {list.filter((p) => p.enabled).length} visible</p>
        <Btn variant="gold" onClick={() => { const p = blankProperty(); setList([p, ...list]); setOpen(p.id); }}>+ Add property</Btn>
      </div>
      {list.map((p, i) => (
        <div key={p.id} className={`rounded-2xl border border-zinc-800 bg-[#12141b] ${p.enabled ? "" : "opacity-60"}`}>
          <div className="flex flex-wrap items-center gap-3 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image} alt="" className="h-12 w-16 rounded-lg object-cover" />
            <button onClick={() => setOpen(open === p.id ? null : p.id)} className="min-w-0 flex-1 text-left">
              <div className="truncate text-sm text-zinc-100">{p.title} {p.featured && <span className="text-[#d4af6a]">★</span>}</div>
              <div className="text-xs text-zinc-500">{p.price} · {p.type} · {p.status}</div>
            </button>
            <Btn small onClick={() => upd(p.id, { enabled: !p.enabled })}>{p.enabled ? "Visible" : "Hidden"}</Btn>
            <OrderBtns i={i} len={list.length} onMove={(d) => setList(move(list, i, d))} onRemove={() => setList(list.filter((x) => x.id !== p.id))} />
            <Btn small onClick={() => setOpen(open === p.id ? null : p.id)}>{open === p.id ? "Close" : "Edit"}</Btn>
          </div>
          {open === p.id && (
            <div className="space-y-4 border-t border-zinc-800 p-4">
              <Grid>
                <Text label="Title" value={p.title} onChange={(v) => upd(p.id, { title: v })} />
                <Text label="Location" value={p.location} onChange={(v) => upd(p.id, { location: v })} />
                <Text label="Price" value={p.price} onChange={(v) => upd(p.id, { price: v })} />
                <Text label="Type (used as filter)" value={p.type} onChange={(v) => upd(p.id, { type: v })} />
                <Text label="Status" value={p.status} onChange={(v) => upd(p.id, { status: v })} hint="For Sale / For Rent / New Launch" />
                <Text label="Tag badge" value={p.tag} onChange={(v) => upd(p.id, { tag: v })} />
              </Grid>
              <Grid cols={3}>
                <Num label="Beds" value={p.beds} onChange={(v) => upd(p.id, { beds: v })} />
                <Num label="Baths" value={p.baths} onChange={(v) => upd(p.id, { baths: v })} />
                <Text label="Area" value={p.area} onChange={(v) => upd(p.id, { area: v })} />
              </Grid>
              <Area label="Description" value={p.description} onChange={(v) => upd(p.id, { description: v })} />
              <Text label="Amenities (comma separated)" value={p.amenities.join(", ")} onChange={(v) => upd(p.id, { amenities: v.split(",").map((x) => x.trim()).filter(Boolean) })} />
              <Media label="Cover image" value={p.image} onChange={(v) => upd(p.id, { image: v })} />
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Gallery</p>
                {p.gallery.map((g, gi) => (
                  <div key={gi} className="flex items-start gap-2">
                    <div className="flex-1"><Media label={`Photo ${gi + 1}`} value={g} onChange={(v) => upd(p.id, { gallery: p.gallery.map((x, k) => (k === gi ? v : x)) })} /></div>
                    <Btn small variant="danger" onClick={() => upd(p.id, { gallery: p.gallery.filter((_, k) => k !== gi) })}>✕</Btn>
                  </div>
                ))}
                <Btn small onClick={() => upd(p.id, { gallery: [...p.gallery, ""] })}>+ Add photo</Btn>
              </div>
              <Toggle label="Featured (shown first)" value={p.featured} onChange={(v) => upd(p.id, { featured: v })} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ===================== Offers ===================== */
export function OffersPanel({ cfg, set }: P) {
  const list = cfg.offers;
  const setList = (l: typeof list) => set((c) => ({ ...c, offers: l }));
  const upd = (id: string, p: Partial<(typeof list)[number]>) => setList(list.map((x) => (x.id === id ? { ...x, ...p } : x)));
  return (
    <div className="space-y-4">
      <Toggle label="Offers & coupons feature" hint="Off = offers section, banner and coupon field disappear from the site" value={cfg.features.offers} onChange={(v) => set((c) => ({ ...c, features: { ...c.features, offers: v } }))} />
      <Btn variant="gold" onClick={() => setList([...list, { id: uid(), title: "New offer", description: "", code: "", discount: "", validTill: "", enabled: true, showInBanner: false }])}>+ Add offer / coupon</Btn>
      {list.map((o, i) => (
        <Card key={o.id} title={o.title} actions={<OrderBtns i={i} len={list.length} onMove={(d) => setList(move(list, i, d))} onRemove={() => setList(list.filter((x) => x.id !== o.id))} />}>
          <Grid>
            <Text label="Title" value={o.title} onChange={(v) => upd(o.id, { title: v })} />
            <Text label="Coupon code" value={o.code} onChange={(v) => upd(o.id, { code: v.toUpperCase() })} />
            <Text label="Discount label" value={o.discount} onChange={(v) => upd(o.id, { discount: v })} />
            <Text label="Valid till" type="date" value={o.validTill} onChange={(v) => upd(o.id, { validTill: v })} />
          </Grid>
          <Area label="Description" rows={2} value={o.description} onChange={(v) => upd(o.id, { description: v })} />
          <Grid>
            <Toggle label="Active" value={o.enabled} onChange={(v) => upd(o.id, { enabled: v })} />
            <Toggle label="Show in top banner" value={o.showInBanner} onChange={(v) => upd(o.id, { showInBanner: v })} />
          </Grid>
        </Card>
      ))}
    </div>
  );
}

/* ===================== Widgets (updates / custom features) ===================== */
function WidgetsEditor({ list, onChange, addLabel }: { list: Widget[]; onChange: (l: Widget[]) => void; addLabel: string }) {
  const upd = (id: string, p: Partial<Widget>) => onChange(list.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const positions: Record<Widget["type"], Widget["position"][]> = {
    bar: ["top", "bottom"], popup: ["center"], floating: ["bottom-right", "bottom-left", "top"], inline: ["after-hero", "before-footer"],
  };
  return (
    <div className="space-y-4">
      <Btn variant="gold" onClick={() => onChange([...list, blankWidget({ name: "New item", title: "Title", text: "Message" })])}>{addLabel}</Btn>
      {list.map((w, i) => (
        <Card key={w.id} title={<span>{w.name} <span className="ml-1 text-xs font-normal text-zinc-500">{w.type} · {w.position} {w.locked ? "· 🔒 locked" : "· 🔓"}</span></span>}
          actions={<><Btn small onClick={() => upd(w.id, { enabled: !w.enabled })}>{w.enabled ? "On" : "Off"}</Btn><OrderBtns i={i} len={list.length} onMove={(d) => onChange(move(list, i, d))} onRemove={() => onChange(list.filter((x) => x.id !== w.id))} /></>}>
          <Grid cols={4}>
            <Text label="Internal name" value={w.name} onChange={(v) => upd(w.id, { name: v })} />
            <Select label="Display as" value={w.type} onChange={(v) => upd(w.id, { type: v, position: positions[v][0] })} options={[{ value: "bar", label: "Announcement bar" }, { value: "popup", label: "Popup modal" }, { value: "floating", label: "Floating card" }, { value: "inline", label: "Inline band" }]} />
            <Select label="Where" value={w.position} onChange={(v) => upd(w.id, { position: v })} options={positions[w.type]} />
            <Select label="Style" value={w.style} onChange={(v) => upd(w.id, { style: v })} options={["accent", "glass", "dark", "light"]} />
          </Grid>
          {(w.type === "popup" || w.type === "floating") && (
            <Grid>
              <Select label="When to show" value={w.trigger} onChange={(v) => upd(w.id, { trigger: v })} options={[{ value: "load", label: "On page load" }, { value: "delay", label: "After delay" }, { value: "scroll", label: "After 40% scroll" }, { value: "exit", label: "On exit intent" }]} />
              {w.trigger === "delay" && <Num label="Delay (seconds)" value={w.delay} min={0} max={60} onChange={(v) => upd(w.id, { delay: v })} />}
            </Grid>
          )}
          <Grid>
            <Text label="Title" value={w.title} onChange={(v) => upd(w.id, { title: v })} />
            <Text label="Text" value={w.text} onChange={(v) => upd(w.id, { text: v })} />
            <Text label="Button label" value={w.buttonLabel} onChange={(v) => upd(w.id, { buttonLabel: v })} />
            <Text label="Button link" value={w.buttonLink} onChange={(v) => upd(w.id, { buttonLink: v })} />
          </Grid>
          {w.type !== "bar" && w.type !== "inline" && <Media label="Image" value={w.image} onChange={(v) => upd(w.id, { image: v })} />}
          <Toggle label={w.locked ? "🔒 Locked — visitors cannot dismiss" : "🔓 Unlocked — visitors can close it"} value={w.locked} onChange={(v) => upd(w.id, { locked: v })} />
        </Card>
      ))}
    </div>
  );
}

export function UpdatesPanel({ cfg, set }: P) {
  return (
    <div className="space-y-4">
      <Toggle label="Updates & announcements feature" hint="Master switch for all updates below" value={cfg.features.updates} onChange={(v) => set((c) => ({ ...c, features: { ...c.features, updates: v } }))} />
      <WidgetsEditor list={cfg.updates} onChange={(l) => set((c) => ({ ...c, updates: l }))} addLabel="+ Add update" />
    </div>
  );
}

/* ===================== Features ===================== */
export function FeaturesPanel({ cfg, set }: P) {
  const ft = cfg.features;
  const u = <K extends keyof typeof ft>(k: K, v: (typeof ft)[K]) => set((c) => ({ ...c, features: { ...c.features, [k]: v } }));
  return (
    <div className="space-y-5">
      <Card title="Core features" desc="Switch any feature off and it disappears from the live website instantly after saving.">
        <Grid>
          <Toggle label="Site-visit booking" hint="Off = listings only, no booking anywhere" value={ft.booking} onChange={(v) => u("booking", v)} />
          <Toggle label="Shortlist (cart)" hint="Off = visitors can only view listings" value={ft.shortlist} onChange={(v) => u("shortlist", v)} />
          <Toggle label="Enquiry form" hint="Send-enquiry from property & shortlist" value={ft.enquiry} onChange={(v) => u("enquiry", v)} />
          <Toggle label="Offers & coupons" value={ft.offers} onChange={(v) => u("offers", v)} />
          <Toggle label="Updates & announcements" value={ft.updates} onChange={(v) => u("updates", v)} />
          <Toggle label="Property search" value={ft.search} onChange={(v) => u("search", v)} />
          <Toggle label="Newsletter signup" value={ft.newsletter} onChange={(v) => u("newsletter", v)} />
          <Toggle label="Scroll progress bar" value={ft.scrollProgress} onChange={(v) => u("scrollProgress", v)} />
          <Toggle label="Smooth anchor scrolling" value={ft.smoothScroll} onChange={(v) => u("smoothScroll", v)} />
          <Toggle label="Back-to-top button" value={ft.backToTop} onChange={(v) => u("backToTop", v)} />
        </Grid>
      </Card>
      <Card title="Placement">
        <Grid>
          <Select label="Booking form appears as" value={ft.bookingPlacement} onChange={(v) => u("bookingPlacement", v)} options={[{ value: "both", label: "Section + popup" }, { value: "section", label: "Page section only" }, { value: "popup", label: "Popup only" }]} />
          <Select label="Floating buttons side" value={ft.whatsappPosition} onChange={(v) => u("whatsappPosition", v)} options={["right", "left"]} />
          <Toggle label="Floating 'Book' button" value={ft.floatingBookButton} onChange={(v) => u("floatingBookButton", v)} />
          <Toggle label="WhatsApp button" value={ft.whatsapp} onChange={(v) => u("whatsapp", v)} />
          <Toggle label="Call button" value={ft.callButton} onChange={(v) => u("callButton", v)} />
        </Grid>
      </Card>
      <Card title="Custom features" desc="Create your own feature — a popup, floating card, announcement bar or inline band — and choose exactly where it appears.">
        <WidgetsEditor list={cfg.customFeatures} onChange={(l) => set((c) => ({ ...c, customFeatures: l }))} addLabel="+ Add custom feature" />
      </Card>
    </div>
  );
}

/* ===================== Booking form ===================== */
export function BookingPanel({ cfg, set }: P) {
  const list = cfg.bookingFields;
  const setList = (l: BookingField[]) => set((c) => ({ ...c, bookingFields: l }));
  const upd = (id: string, p: Partial<BookingField>) => setList(list.map((x) => (x.id === id ? { ...x, ...p } : x)));
  return (
    <div className="space-y-4">
      <Toggle label="Booking feature" value={cfg.features.booking} onChange={(v) => set((c) => ({ ...c, features: { ...c.features, booking: v } }))} />
      <Card title="Booking form fields" desc="Choose which details customers must provide. Toggle visibility and required status for each field.">
        {list.map((fd, i) => (
          <div key={fd.id} className={`space-y-3 rounded-xl border border-zinc-800 p-3 ${fd.enabled ? "" : "opacity-50"}`}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex-1 text-sm text-zinc-100">{fd.label} <span className="text-xs text-zinc-500">({fd.type})</span></span>
              <Btn small onClick={() => upd(fd.id, { enabled: !fd.enabled })}>{fd.enabled ? "Shown" : "Hidden"}</Btn>
              <Btn small variant={fd.required ? "gold" : "ghost"} onClick={() => upd(fd.id, { required: !fd.required })}>{fd.required ? "Required" : "Optional"}</Btn>
              <OrderBtns i={i} len={list.length} onMove={(d) => setList(move(list, i, d))} onRemove={() => setList(list.filter((x) => x.id !== fd.id))} />
            </div>
            <Grid cols={3}>
              <Text label="Label" value={fd.label} onChange={(v) => upd(fd.id, { label: v })} />
              <Select label="Type" value={fd.type} onChange={(v) => upd(fd.id, { type: v })} options={["text", "email", "tel", "date", "time", "number", "select", "textarea", "property"]} />
              <Text label="Placeholder" value={fd.placeholder} onChange={(v) => upd(fd.id, { placeholder: v })} />
            </Grid>
            {fd.type === "select" && <Text label="Options (comma separated)" value={fd.options} onChange={(v) => upd(fd.id, { options: v })} />}
          </div>
        ))}
        <Btn small onClick={() => setList([...list, { id: uid(), key: "f_" + uid(), label: "New field", type: "text", placeholder: "", options: "", enabled: true, required: false }])}>+ Add field</Btn>
      </Card>
    </div>
  );
}

/* ===================== Theme ===================== */
const PRESETS: { name: string; t: Partial<Theme> }[] = [
  { name: "Noir Gold", t: { mode: "dark", bg: "#08080b", surface: "#121218", text: "#f5f1e8", muted: "#a49f94", accent: "#d4af6a", accent2: "#8fa8d8" } },
  { name: "Ivory Light", t: { mode: "light", bg: "#f6f2ea", surface: "#ffffff", text: "#1a1712", muted: "#6f685c", accent: "#9a7330", accent2: "#3b5b8c" } },
  { name: "Emerald Night", t: { mode: "dark", bg: "#06100d", surface: "#0e1c17", text: "#ecf3ee", muted: "#94a89d", accent: "#c9a96e", accent2: "#3fae8a" } },
  { name: "Midnight Sapphire", t: { mode: "dark", bg: "#070a14", surface: "#0f1424", text: "#eef1fa", muted: "#98a0b8", accent: "#9fb6ff", accent2: "#d4af6a" } },
  { name: "Rose Champagne", t: { mode: "dark", bg: "#0e0a0b", surface: "#1a1214", text: "#f7eeea", muted: "#b19c97", accent: "#e8b4a0", accent2: "#c9a96e" } },
];

export function ThemePanel({ cfg, set }: P) {
  const t = cfg.theme;
  const u = <K extends keyof Theme>(k: K, v: Theme[K]) => set((c) => ({ ...c, theme: { ...c.theme, [k]: v } }));
  return (
    <div className="space-y-5">
      <Card title="Presets">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {PRESETS.map((p) => (
            <button key={p.name} onClick={() => set((c) => ({ ...c, theme: { ...c.theme, ...p.t } }))} className="overflow-hidden rounded-xl border border-zinc-800 text-left transition hover:border-[#d4af6a]">
              <div className="flex h-12">{[p.t.bg, p.t.surface, p.t.accent, p.t.accent2].map((c, i) => <span key={i} className="flex-1" style={{ background: c }} />)}</div>
              <div className="p-2 text-xs text-zinc-300">{p.name}</div>
            </button>
          ))}
        </div>
      </Card>
      <Card title="Colours">
        <Select label="Mode" value={t.mode} onChange={(v) => u("mode", v)} options={["dark", "light"]} />
        <Grid cols={3}>
          <Color label="Background" value={t.bg} onChange={(v) => u("bg", v)} />
          <Color label="Surface / cards" value={t.surface} onChange={(v) => u("surface", v)} />
          <Color label="Text" value={t.text} onChange={(v) => u("text", v)} />
          <Color label="Muted text" value={t.muted} onChange={(v) => u("muted", v)} />
          <Color label="Accent" value={t.accent} onChange={(v) => u("accent", v)} />
          <Color label="Accent 2" value={t.accent2} onChange={(v) => u("accent2", v)} />
        </Grid>
      </Card>
      <Card title="Typography">
        <Grid>
          <Select label="Heading font" value={t.headingFont} onChange={(v) => u("headingFont", v)} options={FONT_OPTIONS} />
          <Select label="Body font" value={t.bodyFont} onChange={(v) => u("bodyFont", v)} options={FONT_OPTIONS} />
          <Num label="Base font size (px)" value={t.baseSize} min={13} max={20} onChange={(v) => u("baseSize", v)} />
          <Num label="Heading scale" value={t.headingScale} min={0.6} max={1.5} step={0.05} onChange={(v) => u("headingScale", v)} />
        </Grid>
      </Card>
      <Card title="Layout & cards">
        <Grid>
          <Select label="Property card size" value={t.cardSize} onChange={(v) => u("cardSize", v)} options={["compact", "normal", "large"]} />
          <Num label="Card title size (px)" value={t.cardTitleSize} min={14} max={36} onChange={(v) => u("cardTitleSize", v)} />
          <Num label="Corner radius (px)" value={t.radius} min={0} max={40} onChange={(v) => u("radius", v)} />
          <Num label="Max content width (px)" value={t.containerWidth} min={960} max={1680} step={20} onChange={(v) => u("containerWidth", v)} />
          <Select label="Button style" value={t.buttonStyle} onChange={(v) => u("buttonStyle", v)} options={["solid", "outline", "glass"]} />
        </Grid>
      </Card>
      <Card title="Custom CSS" desc="Advanced: style anything on the site. Wrapper class is .site">
        <Area label="CSS" rows={6} value={t.customCss} onChange={(v) => u("customCss", v)} />
      </Card>
    </div>
  );
}

/* ===================== Animations ===================== */
function Choice<T extends string>({ label, value, options, onChange, preview }: { label: string; value: T; options: { v: T; l: string }[]; onChange: (v: T) => void; preview: React.ReactNode }) {
  return (
    <Card title={label}>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o.v} onClick={() => onChange(o.v)} className={`rounded-full border px-3.5 py-1.5 text-xs transition ${value === o.v ? "border-[#d4af6a] bg-[#d4af6a] text-black" : "border-zinc-700 text-zinc-300 hover:border-zinc-500"}`}>{o.l}</button>
        ))}
      </div>
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-wider text-zinc-500">Live preview</p>
        {preview}
      </div>
    </Card>
  );
}

export function AnimationsPanel({ cfg, set }: P) {
  const a = cfg.animations;
  const u = <K extends keyof Animations>(k: K, v: Animations[K]) => set((c) => ({ ...c, animations: { ...c.animations, [k]: v } }));
  const wt = { ...DEFAULT_WT, ...(a.walkthrough || {}) };
  const uw = <K extends keyof typeof wt>(k: K, v: (typeof wt)[K]) => set((c) => ({ ...c, animations: { ...c.animations, walkthrough: { ...DEFAULT_WT, ...c.animations.walkthrough, [k]: v } } }));
  return (
    <div className="space-y-5">
      <Card title="Global motion">
        <Grid>
          <Num label="Animation speed" value={a.speed} min={0.5} max={2} step={0.1} onChange={(v) => u("speed", v)} hint="1 = cinematic default" />
          <Num label="Loader duration (s)" value={a.loaderDuration} min={0.5} max={5} step={0.1} onChange={(v) => u("loaderDuration", v)} />
        </Grid>
        <Toggle label="Hero parallax" value={a.parallax} onChange={(v) => u("parallax", v)} />
      </Card>
      <Card title="Cinematic walkthrough (scroll tour)" desc="Controls the exterior → doors → rooms → deal film journey. Add or edit it in Sections.">
        <Grid>
          <Toggle label="Letterbox cinema bars" value={wt.letterbox} onChange={(v) => uw("letterbox", v)} />
          <Toggle label="Floating dust particles" value={wt.dust} onChange={(v) => uw("dust", v)} />
          <Toggle label="Film grain" value={wt.grain} onChange={(v) => uw("grain", v)} />
          <Toggle label="Light flare when doors open" value={wt.flare} onChange={(v) => uw("flare", v)} />
          <Toggle label="Handheld camera sway" value={wt.sway} onChange={(v) => uw("sway", v)} />
        </Grid>
        <Num label="Scroll length per scene (% of screen)" value={wt.sceneLength} min={50} max={200} step={5} onChange={(v) => uw("sceneLength", v)} hint="higher = slower, more dramatic" />
        <div><p className="mb-2 text-[11px] uppercase tracking-wider text-zinc-500">Live preview — doors opening</p><WalkthroughPreview cfg={cfg} /></div>
      </Card>
      <Choice label="Loading animation" value={a.loader} onChange={(v) => u("loader", v)}
        options={[{ v: "curtain", l: "Curtain" }, { v: "split", l: "Split doors" }, { v: "blinds", l: "Blinds" }, { v: "counter", l: "Counter" }, { v: "logo", l: "Logo pulse" }, { v: "none", l: "None" }]}
        preview={<LoaderPreview cfg={cfg} type={a.loader} />} />
      <Choice label="Scroll background" value={a.background} onChange={(v) => u("background", v)}
        options={[{ v: "aurora", l: "Aurora" }, { v: "mesh", l: "Mesh gradient" }, { v: "orbs", l: "Floating orbs" }, { v: "lines", l: "Grid lines" }, { v: "grain", l: "Film grain" }, { v: "static", l: "Static" }]}
        preview={<><BgPreview cfg={cfg} mode={a.background} intensity={a.bgIntensity} /><div className="mt-3"><Num label="Glow intensity" value={a.bgIntensity} min={0} max={1} step={0.05} onChange={(v) => u("bgIntensity", v)} /></div></>} />
      <Choice label="Scroll reveal" value={a.scroll} onChange={(v) => u("scroll", v)}
        options={[{ v: "fade-up", l: "Fade up" }, { v: "zoom", l: "Zoom" }, { v: "blur", l: "Blur in" }, { v: "slide", l: "Slide" }, { v: "clip", l: "Clip reveal" }, { v: "flip", l: "3D flip" }, { v: "none", l: "None" }]}
        preview={<RevealPreview cfg={cfg} mode={a.scroll} />} />
      <Choice label="Heading text reveal" value={a.textReveal} onChange={(v) => u("textReveal", v)}
        options={[{ v: "words", l: "Word by word" }, { v: "lines", l: "Line mask" }, { v: "fade", l: "Fade & track" }, { v: "none", l: "None" }]}
        preview={<TextPreview cfg={cfg} mode={a.textReveal} />} />
      <Choice label="Hover effect" value={a.hover} onChange={(v) => u("hover", v)}
        options={[{ v: "lift", l: "Lift" }, { v: "glow", l: "Glow" }, { v: "tilt", l: "3D tilt" }, { v: "zoom", l: "Image zoom" }, { v: "border", l: "Border" }, { v: "none", l: "None" }]}
        preview={<HoverPreview cfg={cfg} mode={a.hover} />} />
      <Choice label="Click effect" value={a.click} onChange={(v) => u("click", v)}
        options={[{ v: "ripple", l: "Ripple" }, { v: "pulse", l: "Pulse" }, { v: "burst", l: "Burst" }, { v: "none", l: "None" }]}
        preview={<ClickPreview cfg={cfg} mode={a.click} />} />
      <Choice label="Cursor (desktop only)" value={a.cursor} onChange={(v) => u("cursor", v)}
        options={[{ v: "dot-ring", l: "Dot + ring" }, { v: "glow", l: "Glow" }, { v: "blend", l: "Blend" }, { v: "spotlight", l: "Spotlight" }, { v: "default", l: "System" }]}
        preview={<CursorPreview cfg={cfg} mode={a.cursor} />} />
    </div>
  );
}
