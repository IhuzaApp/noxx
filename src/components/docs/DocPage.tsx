import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, type LucideIcon } from "lucide-react";
import { docsNav } from "@/lib/docs-nav";

type Props = {
  slug: string;
  icon: LucideIcon;
  title: string;
  intro: string;
  children: ReactNode;
  cta?: { label: string; to: string };
};

export function DocPage({ slug, icon: Icon, title, intro, children, cta }: Props) {
  const idx = docsNav.findIndex((d) => d.slug === slug);
  const prev = idx > 0 ? docsNav[idx - 1] : null;
  const next = idx >= 0 && idx < docsNav.length - 1 ? docsNav[idx + 1] : null;
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/docs" className="hover:text-foreground transition">Docs</Link>
        <span>/</span>
        <span className="text-foreground">{title}</span>
      </div>

      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-accent text-accent-foreground flex items-center justify-center shrink-0">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">{intro}</p>
        </div>
      </div>

      <div className="prose-doc space-y-6 text-sm text-foreground leading-relaxed">
        {children}
      </div>

      {cta && (
        <Link
          to={cta.to}
          className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3.5 py-2 text-xs font-medium text-background hover:opacity-90 transition shadow-soft"
        >
          {cta.label}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}

      <div className="grid sm:grid-cols-2 gap-3 pt-6 border-t border-border">
        {prev ? (
          <Link to={prev.path} className="group rounded-lg border border-border bg-card p-4 hover:border-primary/40 transition">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><ArrowLeft className="h-3 w-3" /> Previous</div>
            <div className="mt-1 text-sm font-semibold text-foreground group-hover:text-primary transition">{prev.title}</div>
          </Link>
        ) : <div />}
        {next ? (
          <Link to={next.path} className="group rounded-lg border border-border bg-card p-4 hover:border-primary/40 transition text-right">
            <div className="flex items-center justify-end gap-1.5 text-[11px] text-muted-foreground">Next <ArrowRight className="h-3 w-3" /></div>
            <div className="mt-1 text-sm font-semibold text-foreground group-hover:text-primary transition">{next.title}</div>
          </Link>
        ) : <div />}
      </div>
    </div>
  );
}

export function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2.5">
        <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center shrink-0">{n}</div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="mt-2.5 pl-8.5 text-sm text-muted-foreground space-y-2">{children}</div>
    </div>
  );
}

export function Callout({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "warn" }) {
  const tones = {
    info: "bg-info/5 border-info/20 text-foreground",
    warn: "bg-warning/5 border-warning/30 text-foreground",
  };
  return <div className={`rounded-md border px-3.5 py-2.5 text-xs ${tones[tone]}`}>{children}</div>;
}
