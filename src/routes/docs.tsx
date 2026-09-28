import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { Sparkles, ArrowRight } from "lucide-react";
import { docsNav } from "@/lib/docs-nav";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Docs — Noxx" },
      {
        name: "description",
        content:
          "Learn how to set up and use every Noxx feature: projects, flows, automations, contacts, surveys, payments and more.",
      },
      { property: "og:title", content: "Docs — Noxx" },
      { property: "og:description", content: "Step-by-step guides for every Noxx feature." },
    ],
  }),
  component: DocsLayout,
});

function DocsLayout() {
  const { pathname } = useLocation();
  const isIndex = pathname === "/docs" || pathname === "/docs/";
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo/noxxlogo.png" alt="Noxx Logo" className="h-8 w-auto object-contain" />
            <span className="text-xs font-medium text-muted-foreground">· Docs</span>
          </Link>
          <div className="flex-1" />
          <Link
            to="/dashboard"
            className="text-sm font-medium text-foreground hover:text-primary transition"
          >
            Open dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12 grid lg:grid-cols-[240px_1fr] gap-10">
        <aside className="hidden lg:block sticky top-24 self-start">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Documentation
          </div>
          <nav className="space-y-0.5 text-sm">
            <Link
              to="/docs"
              activeOptions={{ exact: true }}
              activeProps={{
                className:
                  "block rounded-md px-2.5 py-1.5 bg-accent text-accent-foreground font-medium",
              }}
              inactiveProps={{
                className:
                  "block rounded-md px-2.5 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition",
              }}
            >
              Overview
            </Link>
            {docsNav.map((s) => (
              <Link
                key={s.slug}
                to={s.path}
                activeProps={{
                  className:
                    "block rounded-md px-2.5 py-1.5 bg-accent text-accent-foreground font-medium",
                }}
                inactiveProps={{
                  className:
                    "block rounded-md px-2.5 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition",
                }}
              >
                {s.title}
              </Link>
            ))}
          </nav>
        </aside>

        <article className="min-w-0">{isIndex ? <DocsIndex /> : <Outlet />}</article>
      </div>
    </div>
  );
}

function DocsIndex() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Documentation</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Everything you need to set up Noxx for your business. Pick a topic to get a focused,
          step-by-step guide.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {docsNav.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.slug}
              to={s.path}
              className="group rounded-xl border border-border bg-card p-5 shadow-soft hover:shadow-elevated hover:border-primary/40 transition"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent text-accent-foreground flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{s.title}</div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{s.summary}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition shrink-0 mt-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
