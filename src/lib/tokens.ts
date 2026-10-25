import type { SiteConfig } from "./types";

// Replaces {brand}, {city}, {phone}, {email}, {tagline} everywhere on the site.
export function fillTokens(s: string, cfg: SiteConfig) {
  return (s ?? "")
    .replaceAll("{brand}", cfg.site.brand)
    .replaceAll("{city}", cfg.site.city)
    .replaceAll("{phone}", cfg.site.phone)
    .replaceAll("{email}", cfg.site.email)
    .replaceAll("{tagline}", cfg.site.tagline);
}
