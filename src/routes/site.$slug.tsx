import { useState } from "react";
import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { Sparkles, Check, Mail, Phone } from "lucide-react";
import { siteStore, siteSubmissionStore, makeSiteId, type Site, type SiteBlock } from "@/lib/sites";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/site/$slug")({
  head: () => ({
    meta: [{ title: "Site — Noxx" }, { name: "description", content: "A site built with Noxx." }],
  }),
  component: PublicSite,
});

function PublicSite() {
  const { slug } = useParams({ from: "/site/$slug" });
  const sites = useStore(siteStore);
  const site = sites.find((s) => s.slug === slug);

  if (!site) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold text-foreground">Site not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">No site exists at /site/{slug}.</p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            Go to Noxx
          </Link>
        </div>
      </div>
    );
  }

  if (!site.published) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            Draft
          </span>
          <h1 className="mt-3 text-xl font-semibold text-foreground">{site.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">This site isn't published yet.</p>
        </div>
      </div>
    );
  }

  const themeStyle = { ["--site-primary" as string]: site.theme.primary } as React.CSSProperties;

  return (
    <div className="min-h-screen bg-background text-foreground" style={themeStyle}>
      <header className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">
          <span className="text-sm font-semibold">{site.name}</span>
          {site.tagline && (
            <span className="hidden sm:inline text-xs text-muted-foreground">{site.tagline}</span>
          )}
        </div>
      </header>

      <main>
        {site.blocks.map((block) => (
          <BlockView key={block.id} block={block} site={site} />
        ))}
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            © {new Date().getFullYear()} {site.name}
          </span>
          <span className="inline-flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Built with Noxx
          </span>
        </div>
      </footer>
    </div>
  );
}

function BlockView({ block, site }: { block: SiteBlock; site: Site }) {
  const primary = site.theme.primary;

  if (block.kind === "hero") {
    return (
      <section
        className="px-6 py-20"
        style={{ background: `linear-gradient(135deg, ${primary}20, transparent)` }}
      >
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">{block.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{block.subtitle}</p>
          {block.ctaLabel && (
            <a
              href={block.ctaHref}
              className="mt-8 inline-flex items-center rounded-md px-5 py-2.5 text-sm font-medium text-white shadow-soft hover:opacity-90 transition"
              style={{ background: primary }}
            >
              {block.ctaLabel}
            </a>
          )}
        </div>
      </section>
    );
  }

  if (block.kind === "about") {
    return (
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-semibold">{block.heading}</h2>
          <p className="mt-3 text-base text-muted-foreground whitespace-pre-line">{block.body}</p>
        </div>
      </section>
    );
  }

  if (block.kind === "products") {
    return (
      <section id="products" className="px-6 py-16 bg-muted/30">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-semibold mb-6">{block.heading}</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {block.products.map((p) => (
              <div key={p.id} className="rounded-xl border border-border bg-card p-5 shadow-soft">
                <div
                  className="aspect-[4/3] rounded-md mb-3"
                  style={{ background: `linear-gradient(135deg, ${primary}30, ${primary}10)` }}
                />
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-semibold">${p.price}</span>
                  <button
                    className="rounded-md px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition"
                    style={{ background: primary }}
                  >
                    Buy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (block.kind === "services") {
    return (
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-semibold mb-6">{block.heading}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {block.services.map((s) => (
              <div key={s.id} className="rounded-xl border border-border bg-card p-5 shadow-soft">
                <div className="h-8 w-8 rounded-md mb-3" style={{ background: `${primary}20` }} />
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (block.kind === "contact") {
    return (
      <section id="contact" className="px-6 py-16 bg-muted/30">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold">{block.heading}</h2>
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
            {block.email && (
              <a
                href={`mailto:${block.email}`}
                className="inline-flex items-center gap-2 hover:underline"
              >
                <Mail className="h-4 w-4" />
                {block.email}
              </a>
            )}
            {block.phone && (
              <a
                href={`tel:${block.phone}`}
                className="inline-flex items-center gap-2 hover:underline"
              >
                <Phone className="h-4 w-4" />
                {block.phone}
              </a>
            )}
          </div>
          <ContactForm siteId={site.id} primary={primary} />
        </div>
      </section>
    );
  }

  if (block.kind === "ticket") {
    return (
      <section id="ticket" className="px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-semibold">{block.heading}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{block.intro}</p>
          <TicketForm siteId={site.id} primary={primary} />
        </div>
      </section>
    );
  }

  // cta
  return (
    <section
      className="px-6 py-16"
      style={{ background: `linear-gradient(135deg, ${primary}15, transparent)` }}
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-semibold">{block.heading}</h2>
        <p className="mt-2 text-muted-foreground">{block.body}</p>
        <a
          href={block.buttonHref}
          className="mt-6 inline-flex rounded-md px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition"
          style={{ background: primary }}
        >
          {block.buttonLabel}
        </a>
      </div>
    </section>
  );
}

const fieldCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30";

function ContactForm({ siteId, primary }: { siteId: string; primary: string }) {
  const [data, setData] = useState({ name: "", email: "", message: "" });
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    siteSubmissionStore.add({
      id: makeSiteId("sub"),
      siteId,
      kind: "contact",
      data,
      submittedAt: new Date().toISOString(),
    });
    setDone(true);
  };

  if (done) {
    return (
      <div className="mt-6 rounded-xl border border-border bg-card p-6 text-center">
        <div className="mx-auto h-10 w-10 rounded-full bg-success/15 text-success flex items-center justify-center">
          <Check className="h-5 w-5" />
        </div>
        <p className="mt-2 text-sm font-medium">Thanks — we'll be in touch.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 grid gap-3 text-left">
      <input
        required
        placeholder="Your name"
        className={fieldCls}
        value={data.name}
        onChange={(e) => setData({ ...data, name: e.target.value })}
      />
      <input
        required
        type="email"
        placeholder="Email"
        className={fieldCls}
        value={data.email}
        onChange={(e) => setData({ ...data, email: e.target.value })}
      />
      <textarea
        required
        rows={4}
        placeholder="Message"
        className={fieldCls}
        value={data.message}
        onChange={(e) => setData({ ...data, message: e.target.value })}
      />
      <button
        type="submit"
        className="rounded-md px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition"
        style={{ background: primary }}
      >
        Send message
      </button>
    </form>
  );
}

function TicketForm({ siteId, primary }: { siteId: string; primary: string }) {
  const [data, setData] = useState({
    name: "",
    email: "",
    subject: "",
    priority: "normal",
    body: "",
  });
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    siteSubmissionStore.add({
      id: makeSiteId("sub"),
      siteId,
      kind: "ticket",
      data,
      submittedAt: new Date().toISOString(),
    });
    setDone(true);
  };

  if (done) {
    return (
      <div className="mt-6 rounded-xl border border-border bg-card p-6 text-center">
        <div className="mx-auto h-10 w-10 rounded-full bg-success/15 text-success flex items-center justify-center">
          <Check className="h-5 w-5" />
        </div>
        <p className="mt-2 text-sm font-medium">Ticket received. We'll email you shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          required
          placeholder="Your name"
          className={fieldCls}
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
        />
        <input
          required
          type="email"
          placeholder="Email"
          className={fieldCls}
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
        />
      </div>
      <input
        required
        placeholder="Subject"
        className={fieldCls}
        value={data.subject}
        onChange={(e) => setData({ ...data, subject: e.target.value })}
      />
      <select
        className={fieldCls}
        value={data.priority}
        onChange={(e) => setData({ ...data, priority: e.target.value })}
      >
        <option value="low">Low priority</option>
        <option value="normal">Normal</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>
      <textarea
        required
        rows={5}
        placeholder="Describe the issue…"
        className={fieldCls}
        value={data.body}
        onChange={(e) => setData({ ...data, body: e.target.value })}
      />
      <button
        type="submit"
        className="rounded-md px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition"
        style={{ background: primary }}
      >
        Submit ticket
      </button>
    </form>
  );
}
