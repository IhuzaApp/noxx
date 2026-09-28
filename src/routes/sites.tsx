import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Globe, ExternalLink, Trash2, Eye, Pencil, Copy, Check } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Topbar } from "@/components/Topbar";
import { Card } from "@/components/Card";
import { Modal, Field, inputCls } from "@/components/Modal";
import { useStore } from "@/lib/store";
import {
  siteStore,
  siteSubmissionStore,
  makeSiteId,
  SITE_TEMPLATES,
  type Site,
  type SiteBlock,
  type Product,
  type Service,
} from "@/lib/sites";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sites")({
  head: () => ({
    meta: [
      { title: "Sites — Noxx" },
      {
        name: "description",
        content:
          "Build simple branded websites — shops, support portals, contact pages — managed by Noxx.",
      },
    ],
  }),
  component: SitesPage,
});

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32) || "site";

function SitesPage() {
  const sites = useStore(siteStore);
  const submissions = useStore(siteSubmissionStore);
  const [picking, setPicking] = useState(false);
  const [editing, setEditing] = useState<Site | null>(null);

  const create = (templateId: string, name: string) => {
    const tpl = SITE_TEMPLATES.find((t) => t.id === templateId)!;
    const built = tpl.build(name);
    const slug = slugify(name);
    const site: Site = { ...built, id: makeSiteId(), slug, createdAt: new Date().toISOString() };
    siteStore.add(site);
    setPicking(false);
    setEditing(site);
  };

  return (
    <AppLayout>
      <Topbar
        title="Sites"
        subtitle={`${sites.length} active sites`}
        action={
          <button
            onClick={() => setPicking(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3.5 py-2 text-sm font-medium text-background hover:opacity-90 transition shadow-soft"
          >
            <Plus className="h-4 w-4" /> New site
          </button>
        }
      />
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        <div className="mx-auto max-w-7xl space-y-6">
          <Card className="p-4 flex flex-col sm:flex-row items-start gap-3 bg-primary/5 border-primary/20">
            <div className="h-8 w-8 rounded-md bg-primary/15 text-primary flex items-center justify-center shrink-0">
              <Globe className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-foreground">
                Launch simple branded websites
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
                Spin up a shop, a "what we do" page, a contact page or a ticket portal. Share the
                link, or point your own domain at it. We host and serve it through our APIs.
              </p>
            </div>
          </Card>

          {sites.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
              <Globe className="mx-auto h-10 w-10 text-muted-foreground" />
              <h3 className="mt-3 text-base font-medium text-foreground">No sites yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first one in under a minute.
              </p>
              <button
                onClick={() => setPicking(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-foreground px-3.5 py-2 text-sm font-medium text-background hover:opacity-90 transition"
              >
                <Plus className="h-4 w-4" /> New site
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sites.map((site) => {
                const subs = submissions.filter((s) => s.siteId === site.id).length;
                return (
                  <div
                    key={site.id}
                    className="rounded-xl border border-border bg-card p-5 shadow-soft flex flex-col"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{site.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {site.tagline || "—"}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium",
                          site.published
                            ? "bg-success/15 text-success"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {site.published ? "Live" : "Draft"}
                      </span>
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Globe className="h-3 w-3" /> {site.domain ?? `noxx.app/site/${site.slug}`}
                      </div>
                      <div>
                        {site.blocks.length} block{site.blocks.length === 1 ? "" : "s"} · {subs}{" "}
                        submission{subs === 1 ? "" : "s"}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={() => setEditing(site)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-muted transition"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <Link
                        to="/site/$slug"
                        params={{ slug: site.slug }}
                        target="_blank"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-muted transition"
                      >
                        <Eye className="h-3.5 w-3.5" /> Preview
                      </Link>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${site.name}"?`))
                            siteStore.remove((s) => s.id === site.id);
                        }}
                        className="rounded-md border border-input bg-background p-1.5 text-destructive hover:bg-destructive/10 transition"
                        aria-label="Delete site"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Template picker */}
      <Modal
        open={picking}
        onClose={() => setPicking(false)}
        title="Create a new site"
        description="Pick a starting template — you can change anything afterwards."
        size="lg"
      >
        <TemplatePicker onCreate={create} />
      </Modal>

      {/* Editor */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? `Edit · ${editing.name}` : ""}
        size="xl"
      >
        {editing && <SiteEditor site={editing} onClose={() => setEditing(null)} />}
      </Modal>
    </AppLayout>
  );
}

function TemplatePicker({ onCreate }: { onCreate: (templateId: string, name: string) => void }) {
  const [name, setName] = useState("");
  const [tpl, setTpl] = useState(SITE_TEMPLATES[0].id);
  return (
    <div className="space-y-4">
      <Field label="Site name">
        <input
          className={inputCls}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Aurora Apparel"
        />
      </Field>
      <div>
        <div className="text-xs font-medium text-foreground mb-2">Template</div>
        <div className="grid gap-2 sm:grid-cols-2">
          {SITE_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTpl(t.id)}
              className={cn(
                "text-left rounded-lg border p-3 transition",
                tpl === t.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:bg-muted/40",
              )}
            >
              <div className="text-sm font-semibold text-foreground">{t.name}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{t.description}</div>
            </button>
          ))}
        </div>
      </div>
      <button
        disabled={!name.trim()}
        onClick={() => onCreate(tpl, name.trim())}
        className="w-full rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 transition disabled:opacity-50"
      >
        Create site
      </button>
    </div>
  );
}

const BLOCK_LIBRARY: Array<{ kind: SiteBlock["kind"]; label: string; build: () => SiteBlock }> = [
  {
    kind: "hero",
    label: "Hero",
    build: () => ({
      id: makeSiteId("b"),
      kind: "hero",
      title: "Big headline",
      subtitle: "Supporting line.",
      ctaLabel: "Get started",
      ctaHref: "#",
    }),
  },
  {
    kind: "about",
    label: "About",
    build: () => ({
      id: makeSiteId("b"),
      kind: "about",
      heading: "About us",
      body: "Tell your story.",
    }),
  },
  {
    kind: "products",
    label: "Products",
    build: () => ({
      id: makeSiteId("b"),
      kind: "products",
      heading: "Products",
      products: [
        { id: makeSiteId("p"), name: "New product", price: 0, description: "Describe it." },
      ],
    }),
  },
  {
    kind: "services",
    label: "Services",
    build: () => ({
      id: makeSiteId("b"),
      kind: "services",
      heading: "Services",
      services: [{ id: makeSiteId("s"), title: "Service", description: "What it is." }],
    }),
  },
  {
    kind: "contact",
    label: "Contact info",
    build: () => ({
      id: makeSiteId("b"),
      kind: "contact",
      heading: "Contact us",
      email: "hello@example.com",
      phone: "",
    }),
  },
  {
    kind: "ticket",
    label: "Ticket form",
    build: () => ({
      id: makeSiteId("b"),
      kind: "ticket",
      heading: "Open a ticket",
      intro: "We'll get back within 1 business day.",
    }),
  },
  {
    kind: "cta",
    label: "Call to action",
    build: () => ({
      id: makeSiteId("b"),
      kind: "cta",
      heading: "Ready?",
      body: "Take the next step.",
      buttonLabel: "Contact us",
      buttonHref: "#",
    }),
  },
];

function SiteEditor({ site, onClose }: { site: Site; onClose: () => void }) {
  const [draft, setDraft] = useState<Site>(site);
  const [copied, setCopied] = useState(false);

  const save = () => {
    siteStore.update((s) => s.id === site.id, draft);
    onClose();
  };

  const updateBlock = (id: string, patch: Partial<SiteBlock>) => {
    setDraft((d) => ({
      ...d,
      blocks: d.blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as SiteBlock) : b)),
    }));
  };
  const removeBlock = (id: string) =>
    setDraft((d) => ({ ...d, blocks: d.blocks.filter((b) => b.id !== id) }));
  const moveBlock = (id: string, dir: -1 | 1) => {
    setDraft((d) => {
      const i = d.blocks.findIndex((b) => b.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= d.blocks.length) return d;
      const next = [...d.blocks];
      [next[i], next[j]] = [next[j], next[i]];
      return { ...d, blocks: next };
    });
  };
  const addBlock = (kind: SiteBlock["kind"]) => {
    const def = BLOCK_LIBRARY.find((b) => b.kind === kind)!;
    setDraft((d) => ({ ...d, blocks: [...d.blocks, def.build()] }));
  };

  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/site/${draft.slug}`;

  return (
    <div className="grid gap-5 md:grid-cols-[260px_1fr]">
      {/* Settings sidebar */}
      <div className="space-y-4">
        <Field label="Site name">
          <input
            className={inputCls}
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </Field>
        <Field label="Tagline">
          <input
            className={inputCls}
            value={draft.tagline}
            onChange={(e) => setDraft({ ...draft, tagline: e.target.value })}
          />
        </Field>
        <Field label="Slug" hint="Public URL path">
          <input
            className={inputCls}
            value={draft.slug}
            onChange={(e) => setDraft({ ...draft, slug: slugify(e.target.value) })}
          />
        </Field>
        <Field label="Custom domain (optional)" hint="Point an A record at our edge — see Domains.">
          <input
            className={inputCls}
            value={draft.domain ?? ""}
            placeholder="shop.example.com"
            onChange={(e) => setDraft({ ...draft, domain: e.target.value || undefined })}
          />
        </Field>
        <Field label="Brand color">
          <input
            type="color"
            className="h-9 w-full rounded-md border border-input bg-background"
            value={draft.theme.primary}
            onChange={(e) =>
              setDraft({ ...draft, theme: { ...draft.theme, primary: e.target.value } })
            }
          />
        </Field>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={draft.published}
            onChange={(e) => setDraft({ ...draft, published: e.target.checked })}
          />
          <span className="text-foreground font-medium">Published</span>
          <span className="text-muted-foreground">— anyone with the link can view</span>
        </label>
        <div className="rounded-md border border-border bg-muted/40 p-2 text-[11px] text-muted-foreground break-all">
          {url}
          <button
            onClick={() => {
              navigator.clipboard?.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
            className="ml-2 inline-flex items-center gap-1 text-primary hover:underline"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted transition"
        >
          <ExternalLink className="h-3.5 w-3.5" /> Open public page
        </a>
      </div>

      {/* Block builder */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-muted-foreground self-center mr-1">Add block:</span>
          {BLOCK_LIBRARY.map((b) => (
            <button
              key={b.kind}
              onClick={() => addBlock(b.kind)}
              className="rounded-md border border-input bg-background px-2 py-1 text-[11px] font-medium hover:bg-muted transition"
            >
              + {b.label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {draft.blocks.map((block, idx) => (
            <div key={block.id} className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  {block.kind}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveBlock(block.id, -1)}
                    disabled={idx === 0}
                    className="rounded border border-input bg-background px-1.5 py-0.5 text-xs disabled:opacity-30 hover:bg-muted"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveBlock(block.id, 1)}
                    disabled={idx === draft.blocks.length - 1}
                    className="rounded border border-input bg-background px-1.5 py-0.5 text-xs disabled:opacity-30 hover:bg-muted"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => removeBlock(block.id)}
                    className="rounded border border-input bg-background p-1 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <BlockEditor block={block} onChange={(patch) => updateBlock(block.id, patch)} />
            </div>
          ))}
          {draft.blocks.length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
              No blocks yet — add one above.
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background hover:opacity-90"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

function BlockEditor({
  block,
  onChange,
}: {
  block: SiteBlock;
  onChange: (patch: Partial<SiteBlock>) => void;
}) {
  if (block.kind === "hero") {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        <Field label="Title">
          <input
            className={inputCls}
            value={block.title}
            onChange={(e) => onChange({ title: e.target.value } as Partial<SiteBlock>)}
          />
        </Field>
        <Field label="Subtitle">
          <input
            className={inputCls}
            value={block.subtitle}
            onChange={(e) => onChange({ subtitle: e.target.value } as Partial<SiteBlock>)}
          />
        </Field>
        <Field label="Button label">
          <input
            className={inputCls}
            value={block.ctaLabel}
            onChange={(e) => onChange({ ctaLabel: e.target.value } as Partial<SiteBlock>)}
          />
        </Field>
        <Field label="Button link">
          <input
            className={inputCls}
            value={block.ctaHref}
            onChange={(e) => onChange({ ctaHref: e.target.value } as Partial<SiteBlock>)}
          />
        </Field>
      </div>
    );
  }
  if (block.kind === "about") {
    return (
      <div className="space-y-2">
        <Field label="Heading">
          <input
            className={inputCls}
            value={block.heading}
            onChange={(e) => onChange({ heading: e.target.value } as Partial<SiteBlock>)}
          />
        </Field>
        <Field label="Body">
          <textarea
            rows={4}
            className={inputCls}
            value={block.body}
            onChange={(e) => onChange({ body: e.target.value } as Partial<SiteBlock>)}
          />
        </Field>
      </div>
    );
  }
  if (block.kind === "products") {
    const products = block.products;
    const update = (i: number, patch: Partial<Product>) =>
      onChange({
        products: products.map((p, idx) => (idx === i ? { ...p, ...patch } : p)),
      } as Partial<SiteBlock>);
    return (
      <div className="space-y-2">
        <Field label="Section heading">
          <input
            className={inputCls}
            value={block.heading}
            onChange={(e) => onChange({ heading: e.target.value } as Partial<SiteBlock>)}
          />
        </Field>
        <div className="space-y-2">
          {products.map((p, i) => (
            <div
              key={p.id}
              className="rounded-md border border-border p-2 grid gap-2 sm:grid-cols-[1fr_90px_auto]"
            >
              <input
                className={inputCls}
                placeholder="Name"
                value={p.name}
                onChange={(e) => update(i, { name: e.target.value })}
              />
              <input
                className={inputCls}
                type="number"
                placeholder="Price"
                value={p.price}
                onChange={(e) => update(i, { price: Number(e.target.value) })}
              />
              <button
                onClick={() =>
                  onChange({
                    products: products.filter((_, idx) => idx !== i),
                  } as Partial<SiteBlock>)
                }
                className="rounded border border-input bg-background px-2 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <input
                className={cn(inputCls, "sm:col-span-3")}
                placeholder="Description"
                value={p.description}
                onChange={(e) => update(i, { description: e.target.value })}
              />
            </div>
          ))}
        </div>
        <button
          onClick={() =>
            onChange({
              products: [
                ...products,
                { id: makeSiteId("p"), name: "New product", price: 0, description: "" },
              ],
            } as Partial<SiteBlock>)
          }
          className="rounded border border-input bg-background px-2 py-1 text-xs hover:bg-muted"
        >
          + Add product
        </button>
      </div>
    );
  }
  if (block.kind === "services") {
    const services = block.services;
    const update = (i: number, patch: Partial<Service>) =>
      onChange({
        services: services.map((p, idx) => (idx === i ? { ...p, ...patch } : p)),
      } as Partial<SiteBlock>);
    return (
      <div className="space-y-2">
        <Field label="Section heading">
          <input
            className={inputCls}
            value={block.heading}
            onChange={(e) => onChange({ heading: e.target.value } as Partial<SiteBlock>)}
          />
        </Field>
        {services.map((s, i) => (
          <div
            key={s.id}
            className="rounded-md border border-border p-2 grid gap-2 sm:grid-cols-[1fr_2fr_auto]"
          >
            <input
              className={inputCls}
              placeholder="Title"
              value={s.title}
              onChange={(e) => update(i, { title: e.target.value })}
            />
            <input
              className={inputCls}
              placeholder="Description"
              value={s.description}
              onChange={(e) => update(i, { description: e.target.value })}
            />
            <button
              onClick={() =>
                onChange({ services: services.filter((_, idx) => idx !== i) } as Partial<SiteBlock>)
              }
              className="rounded border border-input bg-background px-2 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <button
          onClick={() =>
            onChange({
              services: [
                ...services,
                { id: makeSiteId("s"), title: "New service", description: "" },
              ],
            } as Partial<SiteBlock>)
          }
          className="rounded border border-input bg-background px-2 py-1 text-xs hover:bg-muted"
        >
          + Add service
        </button>
      </div>
    );
  }
  if (block.kind === "contact") {
    return (
      <div className="grid gap-2 sm:grid-cols-3">
        <Field label="Heading">
          <input
            className={inputCls}
            value={block.heading}
            onChange={(e) => onChange({ heading: e.target.value } as Partial<SiteBlock>)}
          />
        </Field>
        <Field label="Email">
          <input
            className={inputCls}
            value={block.email}
            onChange={(e) => onChange({ email: e.target.value } as Partial<SiteBlock>)}
          />
        </Field>
        <Field label="Phone">
          <input
            className={inputCls}
            value={block.phone}
            onChange={(e) => onChange({ phone: e.target.value } as Partial<SiteBlock>)}
          />
        </Field>
      </div>
    );
  }
  if (block.kind === "ticket") {
    return (
      <div className="space-y-2">
        <Field label="Heading">
          <input
            className={inputCls}
            value={block.heading}
            onChange={(e) => onChange({ heading: e.target.value } as Partial<SiteBlock>)}
          />
        </Field>
        <Field label="Intro">
          <textarea
            rows={2}
            className={inputCls}
            value={block.intro}
            onChange={(e) => onChange({ intro: e.target.value } as Partial<SiteBlock>)}
          />
        </Field>
      </div>
    );
  }
  // cta
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <Field label="Heading">
        <input
          className={inputCls}
          value={block.heading}
          onChange={(e) => onChange({ heading: e.target.value } as Partial<SiteBlock>)}
        />
      </Field>
      <Field label="Body">
        <input
          className={inputCls}
          value={block.body}
          onChange={(e) => onChange({ body: e.target.value } as Partial<SiteBlock>)}
        />
      </Field>
      <Field label="Button label">
        <input
          className={inputCls}
          value={block.buttonLabel}
          onChange={(e) => onChange({ buttonLabel: e.target.value } as Partial<SiteBlock>)}
        />
      </Field>
      <Field label="Button link">
        <input
          className={inputCls}
          value={block.buttonHref}
          onChange={(e) => onChange({ buttonHref: e.target.value } as Partial<SiteBlock>)}
        />
      </Field>
    </div>
  );
}
