import { createStore } from "./store";

export type SiteBlockKind =
  | "hero"
  | "about"
  | "products"
  | "services"
  | "contact"
  | "ticket"
  | "cta";

export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  image?: string;
};

export type Service = {
  id: string;
  title: string;
  description: string;
};

export type SiteBlock =
  | { id: string; kind: "hero"; title: string; subtitle: string; ctaLabel: string; ctaHref: string; image?: string }
  | { id: string; kind: "about"; heading: string; body: string }
  | { id: string; kind: "products"; heading: string; products: Product[] }
  | { id: string; kind: "services"; heading: string; services: Service[] }
  | { id: string; kind: "contact"; heading: string; email: string; phone: string }
  | { id: string; kind: "ticket"; heading: string; intro: string }
  | { id: string; kind: "cta"; heading: string; body: string; buttonLabel: string; buttonHref: string };

export type SiteTheme = {
  primary: string; // hex
  accent: string;
  font: "sans" | "serif" | "mono";
};

export type Site = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  domain?: string;
  published: boolean;
  theme: SiteTheme;
  blocks: SiteBlock[];
  createdAt: string;
};

export const makeSiteId = (p = "site") =>
  `${p}_${Math.random().toString(36).slice(2, 9)}`;

const sample: Site[] = [
  {
    id: "site_demo",
    slug: "aurora",
    name: "Aurora Apparel",
    tagline: "Sustainable streetwear, shipped worldwide.",
    domain: "aurorastore.shop",
    published: true,
    theme: { primary: "#7c3aed", accent: "#22d3ee", font: "sans" },
    createdAt: new Date().toISOString(),
    blocks: [
      {
        id: "b1",
        kind: "hero",
        title: "Wear the night.",
        subtitle: "Premium hoodies, made from recycled cotton.",
        ctaLabel: "Shop now",
        ctaHref: "#products",
      },
      {
        id: "b2",
        kind: "products",
        heading: "Featured drops",
        products: [
          { id: "p1", name: "Aurora Hoodie", price: 89, description: "Heavyweight, oversized fit." },
          { id: "p2", name: "Night Tee", price: 39, description: "Soft cotton, midnight wash." },
          { id: "p3", name: "Cap", price: 29, description: "Curved brim, embroidered logo." },
        ],
      },
      {
        id: "b3",
        kind: "contact",
        heading: "Get in touch",
        email: "hello@aurorastore.shop",
        phone: "+1 (555) 010-2020",
      },
    ],
  },
];

export const siteStore = createStore<Site>(sample);

export const SITE_TEMPLATES: Array<{
  id: string;
  name: string;
  description: string;
  build: (name: string) => Omit<Site, "id" | "slug" | "createdAt">;
}> = [
  {
    id: "shop",
    name: "Online shop",
    description: "Hero, product grid, contact — for selling products.",
    build: (name) => ({
      name,
      tagline: "A small shop with big ambitions.",
      published: false,
      theme: { primary: "#7c3aed", accent: "#22d3ee", font: "sans" },
      blocks: [
        { id: makeSiteId("b"), kind: "hero", title: name, subtitle: "Shop our latest drop.", ctaLabel: "Browse", ctaHref: "#products" },
        {
          id: makeSiteId("b"),
          kind: "products",
          heading: "Products",
          products: [
            { id: makeSiteId("p"), name: "Product A", price: 49, description: "A great first product." },
            { id: makeSiteId("p"), name: "Product B", price: 79, description: "An even greater one." },
          ],
        },
        { id: makeSiteId("b"), kind: "contact", heading: "Contact us", email: "hello@example.com", phone: "" },
      ],
    }),
  },
  {
    id: "agency",
    name: "Agency / services",
    description: "Hero, about, services, contact — for showcasing what you do.",
    build: (name) => ({
      name,
      tagline: "We build things people love.",
      published: false,
      theme: { primary: "#0ea5e9", accent: "#22d3ee", font: "sans" },
      blocks: [
        { id: makeSiteId("b"), kind: "hero", title: name, subtitle: "Design, build, launch.", ctaLabel: "Talk to us", ctaHref: "#contact" },
        { id: makeSiteId("b"), kind: "about", heading: "About", body: "Tell visitors who you are and why they should care." },
        {
          id: makeSiteId("b"),
          kind: "services",
          heading: "What we do",
          services: [
            { id: makeSiteId("s"), title: "Strategy", description: "Plan the work." },
            { id: makeSiteId("s"), title: "Design", description: "Make it beautiful." },
            { id: makeSiteId("s"), title: "Build", description: "Ship it." },
          ],
        },
        { id: makeSiteId("b"), kind: "contact", heading: "Get in touch", email: "hello@example.com", phone: "" },
      ],
    }),
  },
  {
    id: "support",
    name: "Support portal",
    description: "Hero, about, ticket form — let customers raise tickets.",
    build: (name) => ({
      name,
      tagline: "We're here to help.",
      published: false,
      theme: { primary: "#10b981", accent: "#84cc16", font: "sans" },
      blocks: [
        { id: makeSiteId("b"), kind: "hero", title: `${name} support`, subtitle: "Fast answers, real humans.", ctaLabel: "Open a ticket", ctaHref: "#ticket" },
        { id: makeSiteId("b"), kind: "about", heading: "How it works", body: "Submit a ticket and we'll reply within 1 business day." },
        { id: makeSiteId("b"), kind: "ticket", heading: "Open a support ticket", intro: "Tell us what's happening and we'll take it from there." },
      ],
    }),
  },
  {
    id: "blank",
    name: "Blank canvas",
    description: "Start with just a hero and add what you need.",
    build: (name) => ({
      name,
      tagline: "",
      published: false,
      theme: { primary: "#111827", accent: "#6366f1", font: "sans" },
      blocks: [
        { id: makeSiteId("b"), kind: "hero", title: name, subtitle: "Add your tagline here.", ctaLabel: "Learn more", ctaHref: "#" },
      ],
    }),
  },
];

export type SiteSubmission = {
  id: string;
  siteId: string;
  kind: "contact" | "ticket";
  data: Record<string, string>;
  submittedAt: string;
};

export const siteSubmissionStore = createStore<SiteSubmission>([]);
