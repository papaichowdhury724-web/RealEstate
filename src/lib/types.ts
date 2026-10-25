// Shared data model. This mirrors the Firestore structure:
//   settings/site            -> SiteConfig (single document)
//   bookings/{id}            -> Booking
//   enquiries/{id}           -> Enquiry
//   (Storage) media/{file}   -> uploaded images / videos

export type Id = string;

export interface NavLink { id: Id; label: string; href: string; enabled: boolean }

export interface Property {
  id: Id;
  title: string;
  location: string;
  price: string;
  type: string;
  status: string;
  beds: number;
  baths: number;
  area: string;
  image: string;
  gallery: string[];
  description: string;
  amenities: string[];
  tag: string;
  featured: boolean;
  enabled: boolean;
}

export interface Offer {
  id: Id;
  title: string;
  description: string;
  code: string;
  discount: string;
  validTill: string;
  enabled: boolean;
  showInBanner: boolean;
}

export type WidgetType = "bar" | "popup" | "floating" | "inline";
export type WidgetPosition =
  | "top" | "bottom" | "center" | "bottom-left" | "bottom-right" | "before-footer" | "after-hero";
export type WidgetTrigger = "load" | "delay" | "scroll" | "exit";

export interface Widget {
  id: Id;
  name: string;
  enabled: boolean;
  type: WidgetType;
  position: WidgetPosition;
  trigger: WidgetTrigger;
  delay: number;
  locked: boolean; // locked = visitor cannot dismiss
  style: "accent" | "dark" | "glass" | "light";
  title: string;
  text: string;
  image: string;
  buttonLabel: string;
  buttonLink: string;
}

export interface SectionItem { id: Id; title: string; text: string; image: string; value: string; icon: string }

export type SectionType =
  | "hero" | "walkthrough" | "marquee" | "stats" | "properties" | "about" | "services" | "video" | "gallery"
  | "offers" | "testimonials" | "booking" | "faq" | "contact" | "cta" | "custom";

export interface Section {
  id: Id;
  type: SectionType;
  enabled: boolean;
  eyebrow: string;
  title: string;
  subtitle: string;
  text: string;
  image: string;
  video: string;
  buttonLabel: string;
  buttonLink: string;
  items: SectionItem[];
  bg: [string, string, string]; // scroll-background palette for this section
  // walkthrough-only (optional so older saved configs keep working)
  doorX?: number;
  doorY?: number;
  doorW?: number;
  doorH?: number;
  foyerImage?: string;
  price?: string;
  dealLabel?: string;
  dealNote?: string;
}

export interface BookingField {
  id: Id;
  key: string;
  label: string;
  type: "text" | "email" | "tel" | "date" | "time" | "number" | "select" | "textarea" | "property";
  placeholder: string;
  options: string;
  enabled: boolean;
  required: boolean;
}

export interface FooterColumn { id: Id; title: string; links: NavLink[] }
export interface Social { id: Id; label: string; url: string; enabled: boolean }

export interface Features {
  booking: boolean;
  bookingPlacement: "section" | "popup" | "both";
  floatingBookButton: boolean;
  shortlist: boolean; // "order / cart"
  enquiry: boolean;
  offers: boolean;
  updates: boolean;
  search: boolean;
  whatsapp: boolean;
  whatsappPosition: "left" | "right";
  callButton: boolean;
  backToTop: boolean;
  newsletter: boolean;
  scrollProgress: boolean;
  smoothScroll: boolean;
}

export interface Theme {
  mode: "dark" | "light";
  bg: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
  headingFont: string;
  bodyFont: string;
  baseSize: number;
  headingScale: number;
  radius: number;
  cardSize: "compact" | "normal" | "large";
  cardTitleSize: number;
  buttonStyle: "solid" | "outline" | "glass";
  containerWidth: number;
  customCss: string;
}

export interface Animations {
  loader: "curtain" | "logo" | "counter" | "split" | "blinds" | "none";
  loaderDuration: number;
  scroll: "fade-up" | "zoom" | "blur" | "slide" | "clip" | "flip" | "none";
  textReveal: "words" | "lines" | "fade" | "none";
  hover: "lift" | "glow" | "tilt" | "zoom" | "border" | "none";
  click: "ripple" | "pulse" | "burst" | "none";
  cursor: "default" | "dot-ring" | "glow" | "blend" | "spotlight";
  background: "aurora" | "mesh" | "orbs" | "lines" | "grain" | "static";
  bgIntensity: number;
  speed: number;
  parallax: boolean;
  walkthrough: {
    letterbox: boolean;
    dust: boolean;
    grain: boolean;
    flare: boolean;
    sway: boolean;
    sceneLength: number;
  };
}

export interface SiteInfo {
  brand: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  seoTitle: string;
  seoDescription: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  mapEmbed: string;
}

export interface HeaderCfg {
  links: NavLink[];
  ctaLabel: string;
  ctaLink: string;
  sticky: boolean;
  showPhone: boolean;
  logoHeight: number;
}

export interface FooterCfg {
  about: string;
  columns: FooterColumn[];
  socials: Social[];
  copyright: string;
  showContact: boolean;
}

export interface SiteConfig {
  site: SiteInfo;
  texts: Record<string, string>;
  header: HeaderCfg;
  footer: FooterCfg;
  sections: Section[];
  properties: Property[];
  offers: Offer[];
  updates: Widget[];
  customFeatures: Widget[];
  features: Features;
  bookingFields: BookingField[];
  theme: Theme;
  animations: Animations;
}

export interface Booking {
  id: Id;
  data: Record<string, string>;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
}

export interface Enquiry {
  id: Id;
  name: string;
  phone: string;
  email: string;
  message: string;
  coupon: string;
  propertyIds: string[];
  status: "new" | "contacted" | "closed";
  createdAt: string;
}
