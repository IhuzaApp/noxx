import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Plus,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  ClipboardList,
  GripVertical,
  Send,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Topbar } from "@/components/Topbar";
import { Card } from "@/components/Card";
import { Modal, Field, inputCls } from "@/components/Modal";
import {
  surveyStore,
  surveyResponseStore,
  makeId,
  type Survey,
  type SurveyQuestion,
  type SurveyQuestionType,
} from "@/lib/surveys";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/surveys")({
  head: () => ({
    meta: [
      { title: "Surveys — Noxx" },
      {
        name: "description",
        content:
          "Build and send surveys to your customers. Get a shareable link, collect responses, export results.",
      },
      { property: "og:title", content: "Surveys — Noxx" },
      {
        property: "og:description",
        content: "Create surveys, share a link, collect answers — no code required.",
      },
    ],
  }),
  component: SurveysPage,
});

const typeOptions: Array<{ value: SurveyQuestionType; label: string }> = [
  { value: "short", label: "Short text" },
  { value: "long", label: "Long text" },
  { value: "single", label: "Single choice" },
  { value: "multi", label: "Multiple choice" },
  { value: "rating", label: "1–5 rating" },
  { value: "email", label: "Email" },
];

function SurveysPage() {
  const surveys = useStore(surveyStore);
  const responses = useStore(surveyResponseStore);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/s/${id}`;
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <AppLayout>
      <Topbar
        title="Surveys"
        subtitle={`${surveys.length} surveys · ${responses.length} responses collected`}
        action={
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90 transition shadow-soft"
          >
            <Plus className="h-4 w-4" />
            New survey
          </button>
        }
      />
      <main className="flex-1 p-6 space-y-4">
        <Card className="p-4 flex items-start gap-3 bg-primary/5 border-primary/20">
          <div className="h-8 w-8 rounded-md bg-primary/15 text-primary flex items-center justify-center shrink-0">
            <ClipboardList className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-foreground">Build, share, collect</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Each survey gets a public link you can share by email, SMS, WhatsApp or anywhere else.
              Responses appear here in real time.
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {surveys.map((s) => {
            const count = responses.filter((r) => r.surveyId === s.id).length;
            return (
              <Card key={s.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
                      <span
                        className={cn(
                          "text-[10px] font-medium px-1.5 py-0.5 rounded border capitalize",
                          s.status === "live"
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-muted text-muted-foreground border-border",
                        )}
                      >
                        {s.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{s.description}</p>
                    <div className="mt-2 text-[11px] text-muted-foreground">
                      {s.questions.length} question{s.questions.length === 1 ? "" : "s"} ·{" "}
                      <span className="font-semibold text-foreground">{count}</span> responses
                    </div>
                  </div>
                  <button
                    onClick={() => surveyStore.remove((x) => x.id === s.id)}
                    className="rounded-md p-1.5 text-muted-foreground hover:text-destructive transition"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => copyLink(s.id)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border border-input bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition"
                  >
                    {copied === s.id ? (
                      <Check className="h-3.5 w-3.5 text-success" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copied === s.id ? "Copied!" : "Copy share link"}
                  </button>
                  <Link
                    to="/s/$id"
                    params={{ id: s.id }}
                    target="_blank"
                    className="inline-flex items-center gap-1 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90 transition"
                  >
                    Open <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>

                <SurveyResponses surveyId={s.id} questions={s.questions} />
              </Card>
            );
          })}
          {surveys.length === 0 && (
            <Card className="p-10 text-center col-span-full">
              <div className="text-sm text-muted-foreground">
                No surveys yet — create your first one.
              </div>
            </Card>
          )}
        </div>
      </main>

      <NewSurveyModal open={open} onClose={() => setOpen(false)} />
    </AppLayout>
  );
}

function SurveyResponses({
  surveyId,
  questions,
}: {
  surveyId: string;
  questions: SurveyQuestion[];
}) {
  const responses = useStore(surveyResponseStore).filter((r) => r.surveyId === surveyId);
  if (responses.length === 0) return null;
  const recent = responses.slice(0, 3);
  return (
    <details className="mt-3 group">
      <summary className="cursor-pointer text-[11px] font-semibold text-primary hover:underline">
        View {responses.length} response{responses.length === 1 ? "" : "s"}
      </summary>
      <div className="mt-2 space-y-2 max-h-60 overflow-auto">
        {recent.map((r) => (
          <div
            key={r.id}
            className="rounded-md border border-border bg-muted/30 p-2.5 text-[11px] space-y-1"
          >
            <div className="text-muted-foreground">{new Date(r.submittedAt).toLocaleString()}</div>
            {questions.map((q) => {
              const a = r.answers[q.id];
              if (a === undefined || a === "" || (Array.isArray(a) && a.length === 0)) return null;
              return (
                <div key={q.id}>
                  <span className="font-medium text-foreground">{q.prompt}: </span>
                  <span className="text-muted-foreground">
                    {Array.isArray(a) ? a.join(", ") : String(a)}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </details>
  );
}

function NewSurveyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<SurveyQuestion[]>([
    { id: makeId("q"), type: "short", prompt: "", required: true },
  ]);

  const reset = () => {
    setTitle("");
    setDescription("");
    setQuestions([{ id: makeId("q"), type: "short", prompt: "", required: true }]);
  };

  const updateQ = (id: string, patch: Partial<SurveyQuestion>) =>
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  const removeQ = (id: string) => setQuestions((qs) => qs.filter((q) => q.id !== id));
  const addQ = () =>
    setQuestions((qs) => [...qs, { id: makeId("q"), type: "short", prompt: "", required: false }]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || questions.some((q) => !q.prompt.trim())) return;
    const survey: Survey = {
      id: makeId("srv"),
      title: title.trim(),
      description: description.trim(),
      questions: questions.map((q) => ({
        ...q,
        prompt: q.prompt.trim(),
        options:
          (q.type === "single" || q.type === "multi") && q.options
            ? q.options.map((o) => o.trim()).filter(Boolean)
            : undefined,
      })),
      status: "live",
      createdAt: new Date().toISOString(),
    };
    surveyStore.add(survey);
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Create a survey"
      description="Add as many questions as you want. You'll get a shareable link when you save."
      size="xl"
    >
      <form onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Survey title">
            <input
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputCls}
              placeholder="Post-purchase feedback"
            />
          </Field>
          <Field label="Short description">
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputCls}
              placeholder="Help us improve — takes a minute"
            />
          </Field>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-foreground">Questions</div>
            <button
              type="button"
              onClick={addQ}
              className="inline-flex items-center gap-1 rounded-md border border-input bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition"
            >
              <Plus className="h-3 w-3" /> Add question
            </button>
          </div>

          {questions.map((q, i) => (
            <div key={q.id} className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
              <div className="flex items-start gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground mt-2.5 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-muted-foreground w-6">
                      Q{i + 1}
                    </span>
                    <input
                      required
                      value={q.prompt}
                      onChange={(e) => updateQ(q.id, { prompt: e.target.value })}
                      placeholder="Question prompt"
                      className={cn(inputCls, "flex-1")}
                    />
                    <select
                      value={q.type}
                      onChange={(e) =>
                        updateQ(q.id, { type: e.target.value as SurveyQuestionType })
                      }
                      className={cn(inputCls, "w-40")}
                    >
                      {typeOptions.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {(q.type === "single" || q.type === "multi") && (
                    <textarea
                      rows={2}
                      value={(q.options ?? []).join("\n")}
                      onChange={(e) => updateQ(q.id, { options: e.target.value.split("\n") })}
                      placeholder={"One option per line\nGood\nGreat\nAmazing"}
                      className={cn(inputCls, "font-mono text-xs")}
                    />
                  )}
                  <label className="inline-flex items-center gap-2 text-[11px] text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={q.required}
                      onChange={(e) => updateQ(q.id, { required: e.target.checked })}
                    />
                    Required
                  </label>
                </div>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQ(q.id)}
                    className="rounded-md p-1 text-muted-foreground hover:text-destructive transition mt-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => {
              reset();
              onClose();
            }}
            className="rounded-md border border-input bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 transition shadow-soft"
          >
            <Send className="h-3.5 w-3.5" />
            Publish survey
          </button>
        </div>
      </form>
    </Modal>
  );
}
