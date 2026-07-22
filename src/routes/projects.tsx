import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Workflow, MessageSquare, ArrowUpRight, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Topbar } from "@/components/Topbar";
import { Card } from "@/components/Card";
import { Modal, Field, inputCls } from "@/components/Modal";
import { useProject } from "@/lib/project-context";
import { userProjectStore, makeId, type UserProject } from "@/lib/user-flows";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Noxx" },
      { name: "description", content: "Group flows, keys and env vars by project." },
    ],
  }),
  component: ProjectsPage,
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

function ProjectsPage() {
  const { all, current, setCurrentId } = useProject();
  const userProjects = useStore(userProjectStore);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    env: "development" as UserProject["env"],
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    userProjectStore.add({
      id: makeId("up"),
      name: form.name.trim(),
      slug: slugify(form.name),
      description: form.description.trim() || "No description yet.",
      env: form.env,
      createdAt: new Date().toISOString(),
    });
    setForm({ name: "", description: "", env: "development" });
    setOpen(false);
  };

  return (
    <AppLayout>
      <Topbar
        title="Projects"
        subtitle="Each project has its own flows, API keys and environment variables"
        action={
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90 transition shadow-soft"
          >
            <Plus className="h-4 w-4" />
            New project
          </button>
        }
      />
      <main className="flex-1 p-6 space-y-8">
        {userProjects.length > 0 && (
          <section>
            <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
              Your projects
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userProjects.map((p) => (
                <Card key={p.id} className="p-5 flex flex-col">
                  <div className="flex items-start justify-between">
                    <div className="h-11 w-11 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <span
                      className={cn(
                        "text-[11px] font-medium px-2 py-0.5 rounded-md border capitalize",
                        p.env === "production" && "bg-success/10 text-success border-success/20",
                        p.env === "staging" && "bg-warning/15 text-warning-foreground border-warning/30",
                        p.env === "development" && "bg-muted text-muted-foreground border-border",
                      )}
                    >
                      {p.env}
                    </span>
                  </div>
                  <div className="mt-4 text-base font-semibold text-foreground">{p.name}</div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                  <div className="mt-5 flex items-center gap-2">
                    <Link
                      to="/flows"
                      className="flex-1 inline-flex items-center justify-center gap-1 rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background hover:opacity-90 transition shadow-soft"
                    >
                      Open
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      onClick={() => userProjectStore.remove((x) => x.id === p.id)}
                      className="rounded-md border border-input bg-card px-3 py-2 text-xs font-medium text-muted-foreground hover:text-destructive transition"
                    >
                      Remove
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Demo projects
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {all.map((p) => {
              const Icon = p.icon;
              const active = current.id === p.id;
              return (
                <Card key={p.id} className={cn("p-5 flex flex-col", active && "ring-2 ring-primary/30")}>
                  <div className="flex items-start justify-between">
                    <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center", p.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className={cn(
                        "text-[11px] font-medium px-2 py-0.5 rounded-md border",
                        p.env === "production" && "bg-success/10 text-success border-success/20",
                        p.env === "staging" && "bg-warning/15 text-warning-foreground border-warning/30",
                        p.env === "development" && "bg-muted text-muted-foreground border-border",
                      )}
                    >
                      {p.env}
                    </span>
                  </div>
                  <div className="mt-4 text-base font-semibold text-foreground">{p.name}</div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.description}</p>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-md bg-muted/50 border border-border p-2.5">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Workflow className="h-3.5 w-3.5" />
                        Flows
                      </div>
                      <div className="mt-1 text-base font-semibold text-foreground">{p.flows}</div>
                    </div>
                    <div className="rounded-md bg-muted/50 border border-border p-2.5">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Messages
                      </div>
                      <div className="mt-1 text-base font-semibold text-foreground">
                        {p.messages.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-2">
                    <button
                      onClick={() => setCurrentId(p.id)}
                      className={cn(
                        "flex-1 inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition shadow-soft",
                        active
                          ? "bg-primary/10 text-primary border border-primary/30"
                          : "border border-input bg-card text-foreground hover:bg-muted",
                      )}
                    >
                      {active ? "Active" : "Switch to"}
                    </button>
                    <Link
                      to="/flows"
                      onClick={() => setCurrentId(p.id)}
                      className="inline-flex items-center gap-1 rounded-md border border-input bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition shadow-soft"
                    >
                      Open
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </Card>
              );
            })}

            <button
              onClick={() => setOpen(true)}
              className="rounded-xl border-2 border-dashed border-border bg-card/50 p-5 flex flex-col items-center justify-center text-center hover:border-primary/40 hover:bg-accent/30 transition min-h-[260px]"
            >
              <div className="h-11 w-11 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                <Plus className="h-5 w-5" />
              </div>
              <div className="mt-3 text-sm font-medium text-foreground">Create new project</div>
              <p className="mt-1 text-xs text-muted-foreground max-w-[200px]">
                Start fresh with isolated keys, flows and env vars.
              </p>
            </button>
          </div>
        </section>
      </main>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create a new project"
        description="Projects isolate your flows, API keys and environment variables."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Field label="Project name" hint="e.g. Customer Support, Order Lifecycle">
            <input
              autoFocus
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={inputCls}
              placeholder="My new project"
            />
          </Field>
          <Field label="Description">
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className={inputCls}
              placeholder="What is this project for?"
            />
          </Field>
          <Field label="Environment">
            <select
              value={form.env}
              onChange={(e) => setForm((f) => ({ ...f, env: e.target.value as UserProject["env"] }))}
              className={inputCls}
            >
              <option value="development">Development</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </select>
          </Field>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border border-input bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 transition shadow-soft"
            >
              Create project
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
