import type { SiteConfig, Section, SectionItem, Widget, BookingField, Property } from "./types";
import { DEFAULT_WT, DOOR_DEFAULT, WT_IMAGES } from "./wt";

export const uid = () => Math.random().toString(36).slice(2, 10);

const IMG = (id: number, ext = "jpeg") =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.${ext}?auto=compress&cs=tinysrgb&w=1600`;

export const IMAGES = {
  villa1: IMG(16573669),
  villa2: IMG(28054849),
  villa3: IMG(17174768),
  villa4: IMG(10647324),
  villa5: IMG(37429855, "png"),
  villa6: IMG(29560257),
  int1: IMG(8135492),
  int2: IMG(8135496),
  int3: IMG(6585598),
  int4: IMG(8089172),
  int5: IMG(7722168),
  int6: IMG(6920439),
  bedroom: IMG(39955909),
  kitchen: IMG(7031879),
  bath: IMG(6587852),
  gate: WT_IMAGES.exterior,
};

export const INSIDE_VIDEO = "https://videos.pexels.com/video-files/7578552/7578552-uhd_3840_2160_30fps.mp4";

export const HERO_VIDEO = "https://videos.pexels.com/video-files/39105100/16638027_3840_2160_30fps.mp4";

export const item = (p: Partial<SectionItem>): SectionItem => ({
  id: uid(), title: "", text: "", image: "", value: "", icon: "", ...p,
});

export const blankSection = (p: Partial<Section>): Section => ({
  id: uid(), type: "custom", enabled: true, eyebrow: "", title: "", subtitle: "", text: "",
  image: "", video: "", buttonLabel: "", buttonLink: "", items: [], bg: ["#0b0b10", "#3a2a12", "#13213a"], ...p,
});

export const blankWidget = (p: Partial<Widget> = {}): Widget => ({
  id: uid(), name: "New widget", enabled: true, type: "popup", position: "center", trigger: "delay", delay: 3,
  locked: false, style: "glass", title: "", text: "", image: "", buttonLabel: "", buttonLink: "", ...p,
});

export const blankProperty = (p: Partial<Property> = {}): Property => ({
  id: uid(), title: "New Property", location: "New Delhi", price: "₹ 0 Cr", type: "Apartment", status: "For Sale",
  beds: 3, baths: 3, area: "2,000 sq.ft", image: IMAGES.villa1, gallery: [], description: "", amenities: [],
  tag: "", featured: false, enabled: true, ...p,
});

const field = (p: Partial<BookingField>): BookingField => ({
  id: uid(), key: uid(), label: "", type: "text", placeholder: "", options: "", enabled: true, required: false, ...p,
});

export const defaultConfig: SiteConfig = {
  site: {
    brand: "Aurelia Estates",
    tagline: "Delhi's most coveted addresses",
    logoUrl: "",
    faviconUrl: "",
    seoTitle: "{brand} — Luxury Real Estate in {city}",
    seoDescription: "{brand} curates ultra-premium villas, penthouses and farmhouses across {city} NCR.",
    phone: "+91 98100 00000",
    whatsapp: "919810000000",
    email: "concierge@aurelia.in",
    address: "14, Aurangzeb Road, Lutyens' Delhi, New Delhi 110011",
    city: "Delhi",
    mapEmbed: "https://www.google.com/maps?q=Lutyens+Delhi&output=embed",
  },
  texts: {
    bookCta: "Book a Private Visit",
    shortlistLabel: "Shortlist",
    addToShortlist: "Add to Shortlist",
    removeFromShortlist: "Shortlisted",
    enquireNow: "Send Enquiry",
    viewDetails: "View Residence",
    searchPlaceholder: "Search by name, locality or type…",
    allFilter: "All",
    bookingTitle: "Reserve your private viewing",
    bookingSubtitle: "A {brand} concierge will personally escort you.",
    bookingSubmit: "Confirm Visit",
    bookingSuccess: "Thank you! Your visit is requested — our concierge will call you shortly.",
    enquirySuccess: "Enquiry received. {brand} will reach out within the hour.",
    shortlistEmpty: "Your shortlist is empty. Explore residences and tap the heart.",
    couponLabel: "Have a privilege code?",
    couponApplied: "Privilege applied:",
    couponInvalid: "Invalid code",
    newsletterTitle: "Private listings, first.",
    newsletterPlaceholder: "Your email address",
    newsletterButton: "Subscribe",
    newsletterSuccess: "Welcome to the inner circle.",
    loaderText: "{brand}",
    scrollHint: "Scroll to explore",
    beds: "Beds",
    baths: "Baths",
    area: "Area",
    close: "Close",
  },
  header: {
    links: [
      { id: uid(), label: "Residences", href: "#properties", enabled: true },
      { id: uid(), label: "About", href: "#about", enabled: true },
      { id: uid(), label: "Services", href: "#services", enabled: true },
      { id: uid(), label: "Privileges", href: "#offers", enabled: true },
      { id: uid(), label: "Contact", href: "#contact", enabled: true },
    ],
    ctaLabel: "Book a Visit",
    ctaLink: "#booking",
    sticky: true,
    showPhone: true,
    logoHeight: 36,
  },
  footer: {
    about: "{brand} is {city}'s boutique luxury real estate house — curating legacy homes for discerning families since 2009.",
    columns: [
      { id: uid(), title: "Explore", links: [
        { id: uid(), label: "Residences", href: "#properties", enabled: true },
        { id: uid(), label: "Privileges", href: "#offers", enabled: true },
        { id: uid(), label: "Book a visit", href: "#booking", enabled: true },
      ] },
      { id: uid(), title: "Localities", links: [
        { id: uid(), label: "Lutyens' Delhi", href: "#properties", enabled: true },
        { id: uid(), label: "Vasant Vihar", href: "#properties", enabled: true },
        { id: uid(), label: "Golf Links", href: "#properties", enabled: true },
        { id: uid(), label: "Chhatarpur Farms", href: "#properties", enabled: true },
      ] },
    ],
    socials: [
      { id: uid(), label: "Instagram", url: "https://instagram.com", enabled: true },
      { id: uid(), label: "LinkedIn", url: "https://linkedin.com", enabled: true },
      { id: uid(), label: "YouTube", url: "https://youtube.com", enabled: true },
    ],
    copyright: "© 2026 {brand}. All rights reserved. RERA No. DLRERA2026A0001",
    showContact: true,
  },
  sections: [
    blankSection({ type: "hero", eyebrow: "{city} · Private Collection", title: "Where legacy finds its address",
      subtitle: "{brand} curates the rarest bungalows, penthouses and farm estates across {city} NCR.",
      image: IMAGES.villa2, video: HERO_VIDEO, buttonLabel: "Explore Residences", buttonLink: "#properties",
      bg: ["#07070a", "#3b2a10", "#0e1a33"] }),
    blankSection({ id: "inside", type: "walkthrough", eyebrow: "Featured residence", title: "The Meridian Mansion", subtitle: "Sunder Nagar, New Delhi · 5 Beds · ₹ 58 Cr",
      text: "Step inside", image: IMAGES.gate, video: INSIDE_VIDEO, buttonLabel: "Book this home", buttonLink: "#booking",
      foyerImage: WT_IMAGES.foyer, doorX: DOOR_DEFAULT.x, doorY: DOOR_DEFAULT.y, doorW: DOOR_DEFAULT.w, doorH: DOOR_DEFAULT.h, price: "₹ 58 Cr", dealLabel: "The best deal · This month",
      dealNote: "Zero brokerage · Complimentary interior consultation · Chauffeured private visit",
      items: [
        item({ image: IMAGES.int1, title: "The Drawing Room", text: "Double-height ceilings, hand-cut marble, a fireplace for winter evenings.", value: "Living" }),
        item({ image: IMAGES.bedroom, title: "The Master Suite", text: "Wake up above the treeline, with a dressing room of smoked oak.", value: "Suite" }),
        item({ image: IMAGES.kitchen, title: "The Chef's Kitchen", text: "A marble island made for long dinners and longer conversations.", value: "Kitchen" }),
        item({ image: IMAGES.bath, title: "The Marble Bath", text: "Book-matched stone, rain therapy and morning light.", value: "Bath" }),
      ], bg: ["#050505", "#2a1c0c", "#101a2e"] }),
    blankSection({ type: "marquee", items: ["Lutyens' Delhi", "Golf Links", "Vasant Vihar", "Jor Bagh", "Chhatarpur", "Sainik Farms", "Westend", "DLF Camellias"].map((t) => item({ title: t })),
      bg: ["#0a0a0f", "#2c1d0c", "#101a2f"] }),
    blankSection({ type: "stats", eyebrow: "Since 2009", title: "Numbers that speak quietly",
      items: [item({ value: "₹4,200 Cr+", title: "Transactions closed" }), item({ value: "380+", title: "Legacy homes" }),
        item({ value: "17", title: "Prime localities" }), item({ value: "98%", title: "Client referrals" })],
      bg: ["#0a0c12", "#13283d", "#2b1b0c"] }),
    blankSection({ id: "properties", type: "properties", eyebrow: "The Collection", title: "Residences of distinction",
      subtitle: "Hand-picked homes, each verified and RERA compliant.", bg: ["#0b0a0d", "#2e1a2a", "#13233a"] }),
    blankSection({ id: "about", type: "about", eyebrow: "About {brand}", title: "Crafted around the way you live",
      text: "For over fifteen years, {brand} has represented {city}'s most significant homes. Our advisors combine discretion, deep market intelligence and an obsession with detail — so that every acquisition feels effortless.",
      image: IMAGES.int1, buttonLabel: "Meet our advisors", buttonLink: "#contact", bg: ["#0c0b09", "#3a2c14", "#1b1410"] }),
    blankSection({ id: "services", type: "services", eyebrow: "What we do", title: "A concierge for your next chapter",
      items: [
        item({ icon: "◆", title: "Private Acquisitions", text: "Off-market access to bungalows and penthouses rarely listed publicly." }),
        item({ icon: "✦", title: "Legal & Due Diligence", text: "Title verification, RERA checks and documentation handled end-to-end." }),
        item({ icon: "❖", title: "Interior Curation", text: "Partnerships with award-winning architects and designers." }),
        item({ icon: "◈", title: "Wealth Advisory", text: "Portfolio strategy for NRIs, family offices and investors." }),
      ], bg: ["#08090f", "#1b2142", "#2d1a0d"] }),
    blankSection({ type: "video", eyebrow: "Film", title: "Step inside, cinematically", subtitle: "A two-minute walk through our signature Golf Links residence.",
      video: "https://videos.pexels.com/video-files/39105111/16638122_3840_2160_30fps.mp4", image: IMAGES.villa5, bg: ["#050506", "#1d1d24", "#2a2010"] }),
    blankSection({ type: "gallery", eyebrow: "Interiors", title: "Light, stone & silence",
      items: [IMAGES.int2, IMAGES.int3, IMAGES.villa3, IMAGES.int4, IMAGES.villa6, IMAGES.int5].map((i) => item({ image: i })),
      bg: ["#0d0b0a", "#33261a", "#151d2b"] }),
    blankSection({ id: "offers", type: "offers", eyebrow: "Privileges", title: "Exclusive offers this season", bg: ["#0b0809", "#3d1e1c", "#2c2210"] }),
    blankSection({ type: "testimonials", eyebrow: "Voices", title: "Trusted by {city}'s first families",
      items: [
        item({ title: "Ananya Kapoor", value: "Golf Links", text: "{brand} found us a home we didn't know was even available. Discreet, sharp and genuinely kind." }),
        item({ title: "Rohan Mehra", value: "NRI, London", text: "I bought a Vasant Vihar villa without flying in once. The video walkthroughs were cinematic." }),
        item({ title: "Ishita & Karan Malhotra", value: "Chhatarpur", text: "From legal to interiors, everything was orchestrated beautifully." }),
      ], bg: ["#090a0d", "#172a2a", "#2b1c10"] }),
    blankSection({ id: "booking", type: "booking", eyebrow: "Private viewing", title: "Reserve your visit",
      subtitle: "Choose a date, we'll arrange the rest — chauffeur included.", image: IMAGES.villa4, bg: ["#0a0a0c", "#3a2a10", "#0f1d33"] }),
    blankSection({ type: "faq", eyebrow: "FAQ", title: "Questions, answered",
      items: [
        item({ title: "Are all properties RERA registered?", text: "Yes. Every listing is verified for title, approvals and RERA compliance." }),
        item({ title: "Do you assist NRI buyers?", text: "Absolutely — including virtual tours, power of attorney and repatriation guidance." }),
        item({ title: "Is there a fee for site visits?", text: "Private visits are complimentary, with chauffeur pick-up within Delhi NCR." }),
      ], bg: ["#0b0b0e", "#1f1f2c", "#2c2312"] }),
    blankSection({ type: "cta", title: "Your next address is waiting", subtitle: "Speak to a {brand} advisor today.",
      image: IMAGES.villa1, buttonLabel: "Book a Private Visit", buttonLink: "#booking", bg: ["#09080a", "#3c2a0e", "#14223b"] }),
    blankSection({ id: "contact", type: "contact", eyebrow: "Contact", title: "Visit our {city} salon", bg: ["#08080a", "#1a1a22", "#2a1e0e"] }),
  ],
  properties: [
    blankProperty({ title: "The Lutyens Bungalow", location: "Prithviraj Road, Lutyens' Delhi", price: "₹ 210 Cr", type: "Bungalow", status: "For Sale", beds: 7, baths: 8, area: "1.2 acres", image: IMAGES.villa1, gallery: [IMAGES.int1, IMAGES.int2], tag: "Iconic", featured: true, description: "A heritage colonial bungalow set on 1.2 acres of manicured lawns in the heart of Lutyens' Delhi.", amenities: ["Private lawn", "Staff quarters", "Pool", "Home theatre"] }),
    blankProperty({ title: "Golf Links Residence", location: "Golf Links, New Delhi", price: "₹ 95 Cr", type: "Villa", status: "For Sale", beds: 5, baths: 6, area: "8,500 sq.ft", image: IMAGES.villa3, gallery: [IMAGES.int3], tag: "New", featured: true, description: "A contemporary rebuilt residence with double-height living and rooftop terrace.", amenities: ["Rooftop terrace", "Lift", "Smart home"] }),
    blankProperty({ title: "Camellias Sky Penthouse", location: "DLF Camellias, Gurugram", price: "₹ 68 Cr", type: "Penthouse", status: "For Sale", beds: 5, baths: 6, area: "11,000 sq.ft", image: IMAGES.int2, gallery: [IMAGES.int4], tag: "Skyline", featured: true, description: "A full-floor penthouse with private pool deck overlooking the Aravallis.", amenities: ["Private pool", "Concierge", "Club access"] }),
    blankProperty({ title: "Chhatarpur Farm Estate", location: "Chhatarpur, South Delhi", price: "₹ 120 Cr", type: "Farmhouse", status: "For Sale", beds: 6, baths: 7, area: "2.5 acres", image: IMAGES.villa2, gallery: [IMAGES.villa6], tag: "Estate", featured: false, description: "A resort-style farm estate with infinity pool, orchards and a pavilion for celebrations.", amenities: ["Infinity pool", "Orchard", "Party lawn"] }),
    blankProperty({ title: "Vasant Vihar Courtyard Villa", location: "Vasant Vihar, New Delhi", price: "₹ 8.5 L / month", type: "Villa", status: "For Rent", beds: 4, baths: 5, area: "6,000 sq.ft", image: IMAGES.villa4, gallery: [IMAGES.int5], tag: "Lease", featured: false, description: "Embassy-row villa with central courtyard, ideal for diplomats and CXOs.", amenities: ["Courtyard", "Basement", "Power backup"] }),
    blankProperty({ title: "Jor Bagh Modern Floor", location: "Jor Bagh, New Delhi", price: "₹ 42 Cr", type: "Apartment", status: "New Launch", beds: 4, baths: 4, area: "4,200 sq.ft", image: IMAGES.villa5, gallery: [IMAGES.int6], tag: "Launch", featured: false, description: "Boutique builder floor overlooking Lodhi Gardens with Italian marble finishes.", amenities: ["Garden view", "Lift", "Stilt parking"] }),
  ],
  offers: [
    { id: uid(), title: "Zero Brokerage Weekend", description: "Book a visit this weekend and enjoy zero advisory fee on select residences.", code: "AURELIA0", discount: "0% brokerage", validTill: "2026-12-31", enabled: true, showInBanner: true },
    { id: uid(), title: "NRI Privilege", description: "Complimentary legal & interior consultation worth ₹5 Lakh for NRI buyers.", code: "NRI5L", discount: "₹5 L value", validTill: "2026-12-31", enabled: true, showInBanner: false },
    { id: uid(), title: "Festive Collection", description: "Assured gold coin & modular kitchen upgrade on new launches.", code: "FESTIVE26", discount: "Upgrade", validTill: "2026-11-15", enabled: true, showInBanner: false },
  ],
  updates: [
    blankWidget({ name: "Top announcement", type: "bar", position: "top", trigger: "load", delay: 0, style: "accent", locked: false, text: "✦ New Launch: Jor Bagh boutique floors — private previews now open", buttonLabel: "Reserve", buttonLink: "#booking" }),
    blankWidget({ name: "Welcome popup", type: "popup", position: "center", trigger: "delay", delay: 9, style: "glass", title: "Private Preview Invitation", text: "Be among the first to view our off-market Lutyens collection. Use code AURELIA0 for zero brokerage.", image: IMAGES.villa6, buttonLabel: "Book Now", buttonLink: "#booking" }),
  ],
  customFeatures: [],
  features: {
    booking: true, bookingPlacement: "both", floatingBookButton: true, shortlist: false, enquiry: true, offers: true,
    updates: true, search: true, whatsapp: true, whatsappPosition: "right", callButton: false, backToTop: true,
    newsletter: true, scrollProgress: true, smoothScroll: true,
  },
  bookingFields: [
    field({ key: "name", label: "Full name", type: "text", placeholder: "Your name", required: true }),
    field({ key: "phone", label: "Phone", type: "tel", placeholder: "+91", required: true }),
    field({ key: "email", label: "Email", type: "email", placeholder: "you@email.com", required: false }),
    field({ key: "property", label: "Residence", type: "property", required: false }),
    field({ key: "date", label: "Preferred date", type: "date", required: true }),
    field({ key: "time", label: "Preferred time", type: "select", options: "10:00 AM, 12:00 PM, 3:00 PM, 5:00 PM, 7:00 PM", required: false }),
    field({ key: "guests", label: "Visitors", type: "number", placeholder: "2", required: false }),
    field({ key: "budget", label: "Budget", type: "select", options: "₹5–20 Cr, ₹20–50 Cr, ₹50–100 Cr, ₹100 Cr+", required: false }),
    field({ key: "message", label: "Notes", type: "textarea", placeholder: "Anything we should know?", required: false }),
  ],
  theme: {
    mode: "dark", bg: "#08080b", surface: "#121218", text: "#f5f1e8", muted: "#a49f94", accent: "#d4af6a", accent2: "#8fa8d8",
    headingFont: "Cormorant Garamond", bodyFont: "Manrope", baseSize: 16, headingScale: 1, radius: 18, cardSize: "normal",
    cardTitleSize: 22, buttonStyle: "solid", containerWidth: 1280, customCss: "",
  },
  animations: {
    loader: "curtain", loaderDuration: 1.8, scroll: "fade-up", textReveal: "words", hover: "lift", click: "ripple",
    cursor: "dot-ring", background: "aurora", bgIntensity: 0.7, speed: 1, parallax: true, walkthrough: { ...DEFAULT_WT },
  },
};

export const FONT_OPTIONS = [
  "Cormorant Garamond", "Playfair Display", "Bodoni Moda", "Cinzel", "DM Serif Display", "Italiana", "Marcellus",
  "Manrope", "Inter", "Outfit", "Poppins", "Montserrat", "Jost", "Urbanist", "Sora", "Space Grotesk", "Lora", "Syne",
];
