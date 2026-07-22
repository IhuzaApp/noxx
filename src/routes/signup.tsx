import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account: Noxx" },
      { name: "description", content: "Create a free Noxx account and set up your AI receptionist in minutes." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-soft mb-8">
        <Sparkles className="h-7 w-7 text-primary-foreground" />
      </div>
      <h1 className="text-4xl font-medium tracking-tight mb-4 text-foreground">
        We are currently working with founding partners.
      </h1>
      <p className="text-muted-foreground text-xl max-w-lg mx-auto mb-10 font-light leading-relaxed">
        We are launching to the public soon. Thank you for your interest in Noxx. Check back later to hire your first AI employee.
      </p>
      <div className="flex flex-col items-center gap-4 w-full max-w-sm">
        <a 
          href="https://forms.gle/UyeKpFATDeFJMvjn7"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-8 py-4 text-base font-medium text-background hover:bg-foreground/90 transition-all shadow-xl"
        >
          Apply to Become a Founding Partner
        </a>
        <Link 
          to="/" 
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-8 py-4 text-base font-medium hover:bg-muted/50 transition-all shadow-sm text-muted-foreground hover:text-foreground"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
