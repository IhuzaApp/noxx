import { useState } from "react";
import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { Sparkles, Check, Star } from "lucide-react";
import { surveyStore, surveyResponseStore, makeId, type SurveyQuestion } from "@/lib/surveys";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/s/$id")({
  head: () => ({
    meta: [
      { title: "Survey — Noxx" },
      { name: "description", content: "Fill out this survey." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PublicSurveyPage,
});

function PublicSurveyPage() {
  const { id } = useParams({ from: "/s/$id" });
  const surveys = useStore(surveyStore);
  const survey = surveys.find((s) => s.id === id);
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({});
  const [done, setDone] = useState(false);

  if (!survey) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold text-foreground">Survey not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The link may have expired, or the survey was removed.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 transition"
          >
            Go to Noxx
          </Link>
        </div>
      </div>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    surveyResponseStore.add({
      id: makeId("res"),
      surveyId: survey.id,
      submittedAt: new Date().toISOString(),
      answers,
    });
    setDone(true);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-2xl px-6 h-14 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold text-foreground">Noxx</span>
          <span className="text-xs text-muted-foreground">· Powered survey</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12">
        {done ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-elevated">
            <div className="mx-auto h-12 w-12 rounded-full bg-success/15 text-success flex items-center justify-center">
              <Check className="h-6 w-6" />
            </div>
            <h1 className="mt-4 text-xl font-semibold text-foreground">Thank you!</h1>
            <p className="mt-1 text-sm text-muted-foreground">Your response has been recorded.</p>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="rounded-2xl border border-border bg-card p-8 shadow-elevated space-y-6"
          >
            <div>
              <h1 className="text-xl font-semibold text-foreground">{survey.title}</h1>
              {survey.description && (
                <p className="mt-1 text-sm text-muted-foreground">{survey.description}</p>
              )}
            </div>

            {survey.questions.map((q) => (
              <QuestionInput
                key={q.id}
                question={q}
                value={answers[q.id]}
                onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
              />
            ))}

            <button
              type="submit"
              className="w-full rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 transition shadow-soft"
            >
              Submit response
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

function QuestionInput({
  question,
  value,
  onChange,
}: {
  question: SurveyQuestion;
  value: string | string[] | number | undefined;
  onChange: (v: string | string[] | number) => void;
}) {
  const baseInput =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30";
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">
        {question.prompt}
        {question.required && <span className="text-destructive ml-1">*</span>}
      </label>
      {question.type === "short" && (
        <input
          required={question.required}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={baseInput}
        />
      )}
      {question.type === "long" && (
        <textarea
          required={question.required}
          rows={4}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={baseInput}
        />
      )}
      {question.type === "email" && (
        <input
          type="email"
          required={question.required}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={baseInput}
        />
      )}
      {question.type === "single" && (
        <div className="space-y-1.5">
          {(question.options ?? []).map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:bg-muted"
            >
              <input
                type="radio"
                name={question.id}
                checked={value === opt}
                onChange={() => onChange(opt)}
                required={question.required}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      )}
      {question.type === "multi" && (
        <div className="space-y-1.5">
          {(question.options ?? []).map((opt) => {
            const arr = (value as string[]) ?? [];
            const checked = arr.includes(opt);
            return (
              <label
                key={opt}
                className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:bg-muted"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onChange(checked ? arr.filter((x) => x !== opt) : [...arr, opt])}
                />
                <span>{opt}</span>
              </label>
            );
          })}
        </div>
      )}
      {question.type === "rating" && (
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => {
            const active = typeof value === "number" && n <= value;
            return (
              <button
                type="button"
                key={n}
                onClick={() => onChange(n)}
                className={cn(
                  "h-10 w-10 rounded-md border flex items-center justify-center transition",
                  active
                    ? "bg-warning/20 border-warning/40 text-warning-foreground"
                    : "bg-background border-input text-muted-foreground hover:bg-muted",
                )}
                aria-label={`${n} stars`}
              >
                <Star className={cn("h-4 w-4", active && "fill-current")} />
              </button>
            );
          })}
          {question.required && typeof value !== "number" && (
            <input required tabIndex={-1} className="sr-only" onChange={() => undefined} value="" />
          )}
        </div>
      )}
    </div>
  );
}
