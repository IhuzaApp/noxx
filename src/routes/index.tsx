import { createFileRoute, Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  Check,
  Building2,
  Mail,
  MessageSquare,
  Phone,
  Users,
  CalendarCheck,
  Ticket,
  Workflow,
  BarChart,
  Code2,
  Globe,
  Headset,
  BoxSelect,
  ArrowDown,
  LayoutDashboard,
  Settings,
  Search,
  Bell,
  MoreVertical,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Noxx: Your Digital Front Office" },
      {
        name: "description",
        content:
          "Noxx is an AI employee that operates as the digital front office of your business.",
      },
    ],
  }),
  component: LandingPage,
});

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden font-sans text-foreground selection:bg-primary/20">
      <SiteHeader />
      <Hero />
      <BuiltForModern />
      <TheProblem />
      <DigitalFrontOfficeTabs />
      <NoxxInAction />
      <RealInbox />
      <WorkflowBuilderSaaS />
      <AnalyticsDashboard />
      <Integrations />
      <Sandbox />
      <FinalCTA />
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="fixed top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/40">
      <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between px-6 lg:px-10">
        <Link to="/" className="flex items-center">
          <img src="/logo/noxxlogo.png" alt="Noxx Logo" className="h-9 w-auto object-contain" />
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#product" className="hover:text-foreground transition-colors">
            Product
          </a>
          <a href="#scenarios" className="hover:text-foreground transition-colors">
            Scenarios
          </a>
          <a href="#platform" className="hover:text-foreground transition-colors">
            Platform
          </a>
          <a href="#integrations" className="hover:text-foreground transition-colors">
            Integrations
          </a>
        </nav>
        <div className="flex items-center gap-5">
          <ThemeToggle />
          <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">
            Sign in
          </Link>
          <Link
            to="/signup"
            className="hidden sm:inline-flex items-center justify-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90 transition-all shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32">
      <div className="mx-auto max-w-[90rem] px-6 lg:px-10 grid lg:grid-cols-[1fr_1.1fr] gap-16 lg:gap-24 items-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-2xl"
        >
          <motion.h1
            variants={fadeInUp}
            className="text-5xl sm:text-6xl lg:text-[4.5rem] font-medium tracking-tight leading-[1.05]"
          >
            Your Digital Front Office, Powered by AI.
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="mt-8 text-xl text-muted-foreground leading-relaxed font-light"
          >
            Noxx welcomes customers, answers questions, captures leads, organizes support requests,
            and connects your team only when human attention is needed.
          </motion.p>
          <motion.div variants={fadeInUp} className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
            >
              Start Building Your Noxx Agent
            </Link>
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 py-3.5 text-base font-medium hover:bg-muted/50 transition-all shadow-sm"
            >
              Contact Sales
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] as const }}
          className="relative w-full"
        >
          {/* SaaS UI Mockup */}
          <div className="rounded-2xl bg-card border border-border shadow-elevated overflow-hidden flex flex-col text-sm">
            <div className="h-12 border-b border-border bg-muted/30 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-border/80" />
                <div className="h-3 w-3 rounded-full bg-border/80" />
                <div className="h-3 w-3 rounded-full bg-border/80" />
              </div>
              <div className="mx-auto flex items-center gap-2 text-xs font-medium text-muted-foreground bg-background border border-border px-3 py-1 rounded-md">
                <Globe className="h-3 w-3" /> Business Workflow
              </div>
            </div>
            <div className="p-6 sm:p-8 bg-muted/10">
              <div className="space-y-6 max-w-lg mx-auto">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                      Customer Inquiry
                    </div>
                    <div className="bg-background border border-border p-3 rounded-xl shadow-sm inline-block">
                      "Hi, I want pricing information"
                    </div>
                  </div>
                </div>

                <div className="pl-4 border-l border-border/60 ml-4 py-2 space-y-6">
                  {/* Step 2 */}
                  <div className="flex gap-4 relative -left-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="text-xs font-semibold text-primary uppercase tracking-widest">
                        Noxx AI Receptionist
                      </div>
                      <div className="bg-primary/5 border border-primary/10 p-3 rounded-xl shadow-sm inline-block">
                        "Welcome Sarah. I can help with that.
                        <br />
                        Can I ask a few questions?"
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4 relative -left-4">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border">
                      <BoxSelect className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                        Customer Information
                      </div>
                      <div className="bg-background border border-border p-4 rounded-xl shadow-sm grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-success" /> Name
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-success" /> Company
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-success" /> Budget
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-success" /> Email
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex gap-4 relative -left-4">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border">
                      <Workflow className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                        AI Understanding
                      </div>
                      <div className="bg-background border border-border p-4 rounded-xl shadow-sm flex items-center justify-between">
                        <div>
                          <div className="text-xs text-muted-foreground">Intent</div>
                          <div className="font-medium">Sales Inquiry</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Confidence</div>
                          <div className="font-medium text-success">96%</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="flex gap-4 relative -left-4">
                    <div className="h-8 w-8 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0 border border-success/20">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="text-xs font-semibold text-success uppercase tracking-widest">
                        Business Action
                      </div>
                      <div className="flex gap-3">
                        <div className="bg-success/5 border border-success/20 p-3 rounded-lg text-success font-medium flex-1 text-center">
                          Lead Created
                        </div>
                        <div className="bg-success/5 border border-success/20 p-3 rounded-lg text-success font-medium flex-1 text-center">
                          Sales Notified
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function BuiltForModern() {
  return (
    <section className="py-16 border-y border-border/50 bg-muted/10">
      <div className="mx-auto max-w-[90rem] px-6 lg:px-10 text-center">
        <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-muted-foreground">
          Built for Modern Businesses. Works Where Your Customers Already Are.
        </h2>
      </div>
    </section>
  );
}

function TheProblem() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-[90rem] px-6 lg:px-10">
        <div className="max-w-3xl">
          <h2 className="text-3xl sm:text-4xl font-medium tracking-tight">
            Customers Are Already Knocking.
          </h2>
          <p className="mt-6 text-xl text-muted-foreground font-light leading-relaxed">
            Businesses lose opportunities every single day because:
          </p>
          <ul className="mt-8 space-y-4 text-lg text-foreground/80 font-light">
            <li className="flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-destructive/60" /> Emails sit unanswered
            </li>
            <li className="flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-destructive/60" /> Website inquiries
              disappear
            </li>
            <li className="flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-destructive/60" /> Social messages are
              missed
            </li>
            <li className="flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-destructive/60" /> Support requests arrive
              incomplete
            </li>
            <li className="flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-destructive/60" /> Employees spend hours
              answering repetitive questions
            </li>
          </ul>
          <div className="mt-12 bg-primary/5 border border-primary/20 rounded-2xl p-8">
            <h3 className="text-2xl font-medium text-foreground">
              Noxx makes sure every customer gets a response.
            </h3>
          </div>
        </div>
      </div>
    </section>
  );
}

function DigitalFrontOfficeTabs() {
  const [activeTab, setActiveTab] = useState("Reception");

  const tabs = [
    {
      id: "Reception",
      tasks: ["Greeting visitors", "Answering FAQs", "Collecting details", "Booking appointments"],
    },
    {
      id: "Sales",
      tasks: ["Qualifying leads", "Understanding needs", "Scheduling meetings", "Updating CRM"],
    },
    {
      id: "Support",
      tasks: [
        "Collecting issue details",
        "Creating tickets",
        "Suggesting solutions",
        "Escalating problems",
      ],
    },
    {
      id: "Operations",
      tasks: [
        "Routing conversations",
        "Notifying employees",
        "Logging transcripts",
        "Managing workflows",
      ],
    },
  ];

  return (
    <section id="product" className="py-24 lg:py-32 bg-muted/20 border-y border-border/50">
      <div className="mx-auto max-w-[90rem] px-6 lg:px-10">
        <h2 className="text-3xl sm:text-4xl font-medium tracking-tight mb-16 text-center">
          Meet Your Digital Front Office.
        </h2>

        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 lg:gap-16">
          <div className="flex md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 w-full md:w-48 shrink-0 border-b md:border-b-0 md:border-r border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-3 text-left text-sm font-medium rounded-lg md:rounded-r-none md:rounded-l-lg transition-all whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-card text-primary shadow-sm border border-border md:border-r-0 md:-mr-px"
                    : "text-muted-foreground hover:bg-muted/50",
                )}
              >
                {tab.id}
              </button>
            ))}
          </div>

          <div className="flex-1 bg-card border border-border rounded-2xl p-8 sm:p-12 shadow-card min-h-[300px]">
            <h3 className="text-2xl font-medium mb-8 text-foreground">{activeTab} Department</h3>
            <div className="space-y-6">
              {tabs
                .find((t) => t.id === activeTab)
                ?.tasks.map((task, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={task}
                    className="flex items-center gap-4 text-lg font-light"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    {task}
                  </motion.div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function NoxxInAction() {
  const scenarios = [
    {
      title: "Sales Inquiry",
      customer: "How much does your enterprise plan cost?",
      noxx: "Collects company size, requirements, and budget.",
      result: "Qualified Lead Created.",
      icon: Users,
      color: "text-success",
      bg: "bg-success/10",
      border: "border-success/20",
    },
    {
      title: "Support Request",
      customer: "My account isn't working.",
      noxx: "Collects account information and exact issue details.",
      result: "Ticket created with summary.",
      icon: Ticket,
      color: "text-warning",
      bg: "bg-warning/10",
      border: "border-warning/20",
    },
    {
      title: "Appointment Booking",
      customer: "I want a demo.",
      noxx: "Checks team availability and timezone.",
      result: "Meeting scheduled.",
      icon: CalendarCheck,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
    },
  ];

  return (
    <section id="scenarios" className="py-24 lg:py-32">
      <div className="mx-auto max-w-[90rem] px-6 lg:px-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-medium tracking-tight">Meet Noxx in Action.</h2>
          <p className="mt-4 text-xl text-muted-foreground font-light">
            Three real scenarios. Zero human effort required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {scenarios.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-8 shadow-sm flex flex-col"
            >
              <div className="flex items-center gap-3 mb-8">
                <div
                  className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 border",
                    s.bg,
                    s.color,
                    s.border,
                  )}
                >
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-medium">{s.title}</h3>
              </div>

              <div className="space-y-6 flex-1">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                    Customer
                  </div>
                  <div className="bg-muted p-4 rounded-xl text-sm italic">"{s.customer}"</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">
                    Noxx
                  </div>
                  <div className="text-sm font-medium">{s.noxx}</div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border/50">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                  Result
                </div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Check className={cn("h-4 w-4", s.color)} /> {s.result}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RealInbox() {
  const conversations = [
    { name: "Sarah", type: "Sales Inquiry", status: "Qualified", time: "2m ago", active: true },
    { name: "John", type: "Support Request", status: "Escalated", time: "15m ago", active: false },
    {
      name: "Michael",
      type: "Booking Request",
      status: "Scheduled",
      time: "1h ago",
      active: false,
    },
    { name: "Anna", type: "Billing Question", status: "Resolved", time: "3h ago", active: false },
  ];

  return (
    <section className="py-24 lg:py-32 bg-muted/10 border-y border-border/50">
      <div className="mx-auto max-w-[90rem] px-6 lg:px-10">
        <div className="max-w-3xl mb-16">
          <h2 className="text-3xl sm:text-4xl font-medium tracking-tight">
            One Inbox For Every Conversation.
          </h2>
          <p className="mt-4 text-xl text-muted-foreground font-light">
            A digital receptionist works from an inbox. Manage emails, chats, and messages in one
            place.
          </p>
        </div>

        {/* UI Mockup of Inbox */}
        <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden flex flex-col md:flex-row h-[600px] text-sm">
          {/* Sidebar */}
          <div className="w-full md:w-80 border-r border-border flex flex-col bg-muted/10 shrink-0">
            <div className="h-14 border-b border-border flex items-center px-4 justify-between bg-background">
              <span className="font-medium">Inbox</span>
              <button className="h-8 w-8 rounded flex items-center justify-center hover:bg-muted">
                <Search className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {conversations.map((c, i) => (
                <div
                  key={i}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-colors",
                    c.active
                      ? "bg-background border-border shadow-sm"
                      : "border-transparent hover:bg-muted/50",
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-foreground">{c.name}</span>
                    <span className="text-xs text-muted-foreground">{c.time}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{c.type}</div>
                  <div className="mt-2 text-xs font-medium px-2 py-1 bg-muted rounded-md w-fit">
                    {c.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col bg-background min-w-0">
            <div className="h-14 border-b border-border flex items-center px-6 justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-medium text-base">Sarah</span>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  Sales Inquiry
                </span>
              </div>
              <div className="flex gap-2">
                <button className="text-xs font-medium border border-border bg-card px-3 py-1.5 rounded-md hover:bg-muted">
                  Assign
                </button>
                <button className="text-xs font-medium bg-foreground text-background px-3 py-1.5 rounded-md hover:bg-foreground/90">
                  Resolve
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* AI Summary Block */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                    AI Summary
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block text-xs">Intent</span>
                    <span className="font-medium">Enterprise Plan Upgrade</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Assigned To</span>
                    <span className="font-medium text-success">Sales Team</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground block text-xs">Summary</span>
                    <span className="font-light">
                      Sarah is looking to upgrade her 50-person team to the Enterprise plan next
                      quarter. Budget is approved.
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat bubbles */}
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs">
                  S
                </div>
                <div className="bg-muted/50 p-4 rounded-2xl rounded-tl-none border border-border">
                  Hi, we are currently on the Pro plan but looking to upgrade our entire team of 50
                  people. How does enterprise pricing work?
                </div>
              </div>

              <div className="flex gap-4 flex-row-reverse">
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="bg-background border border-border p-4 rounded-2xl rounded-tr-none shadow-sm">
                  Hello Sarah! I can absolutely help with that. For teams of 50, we offer custom
                  volume discounts on the Enterprise plan. I've created a lead for our sales team
                  and an Account Executive will email you shortly with a personalized quote. Is
                  there a specific timeline you are aiming for?
                </div>
              </div>
            </div>

            {/* Input area */}
            <div className="p-4 border-t border-border shrink-0 bg-background">
              <div className="border border-border rounded-xl p-3 bg-muted/10 flex items-center justify-between">
                <span className="text-muted-foreground text-sm font-light">
                  Type a message or internal note...
                </span>
                <button className="h-8 w-8 rounded-md bg-foreground text-background flex items-center justify-center">
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkflowBuilderSaaS() {
  return (
    <section id="platform" className="py-24 lg:py-32">
      <div className="mx-auto max-w-[90rem] px-6 lg:px-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-medium tracking-tight">
            Design Your Own Logic.
          </h2>
          <p className="mt-4 text-xl text-muted-foreground font-light">
            Noxx follows your business rules. Build exact workflows in a visual canvas.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-elevated h-[500px] overflow-hidden relative font-sans text-sm">
          {/* Topbar */}
          <div className="absolute top-0 left-0 right-0 h-14 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-6 z-20">
            <div className="font-medium flex items-center gap-2">
              <Workflow className="h-4 w-4" /> Inbound Routing Flow
            </div>
            <button className="bg-foreground text-background px-4 py-1.5 rounded-md text-xs font-medium">
              Publish Flow
            </button>
          </div>

          {/* Canvas grid background */}
          <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-[size:20px_20px]" />

          {/* Nodes */}
          <div className="absolute inset-0 flex items-center justify-center pt-10">
            <div className="relative w-full max-w-3xl h-[400px]">
              {/* Trigger */}
              <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-background border border-border rounded-lg shadow-sm p-3 w-48 z-10 flex items-center gap-3">
                <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center text-primary">
                  <MessageSquare className="h-3 w-3" />
                </div>
                <div className="font-medium text-xs">New Website Message</div>
              </div>

              {/* Edge */}
              <div className="absolute left-1/2 -translate-x-1/2 top-12 w-px h-10 bg-border" />

              {/* Action 1 */}
              <div className="absolute left-1/2 -translate-x-1/2 top-[88px] bg-background border border-border rounded-lg shadow-sm p-3 w-48 z-10 flex items-center gap-3">
                <div className="h-6 w-6 rounded bg-muted flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-muted-foreground" />
                </div>
                <div className="font-medium text-xs">AI Understand Intent</div>
              </div>

              {/* Branching Edges */}
              <svg className="absolute left-1/2 -translate-x-[150px] top-[140px] w-[300px] h-10 overflow-visible">
                <path
                  d="M150 0 L150 10 L0 10 L0 40"
                  fill="none"
                  className="stroke-border"
                  strokeWidth="1.5"
                />
                <path
                  d="M150 0 L150 10 L300 10 L300 40"
                  fill="none"
                  className="stroke-border"
                  strokeWidth="1.5"
                />
              </svg>

              {/* Branch 1: Sales */}
              <div className="absolute left-[calc(50%-150px)] -translate-x-1/2 top-[180px] bg-background border border-border rounded-lg shadow-sm p-3 w-40 z-10">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">
                  If Sales
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-4 bg-success/10 rounded flex items-center justify-center">
                    <Check className="h-2 w-2 text-success" />
                  </div>{" "}
                  <span className="text-xs font-medium">Create Lead</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-muted rounded flex items-center justify-center">
                    <Bell className="h-2 w-2" />
                  </div>{" "}
                  <span className="text-xs font-medium">Notify Sales</span>
                </div>
              </div>

              {/* Branch 2: Support */}
              <div className="absolute left-[calc(50%+150px)] -translate-x-1/2 top-[180px] bg-background border border-border rounded-lg shadow-sm p-3 w-40 z-10">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">
                  If Support
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-4 bg-warning/10 rounded flex items-center justify-center">
                    <Ticket className="h-2 w-2 text-warning" />
                  </div>{" "}
                  <span className="text-xs font-medium">Create Ticket</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-muted rounded flex items-center justify-center">
                    <Users className="h-2 w-2" />
                  </div>{" "}
                  <span className="text-xs font-medium">Assign Agent</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AnalyticsDashboard() {
  return (
    <section className="py-24 lg:py-32 bg-muted/10 border-y border-border/50">
      <div className="mx-auto max-w-[90rem] px-6 lg:px-10">
        <div className="mb-12">
          <h2 className="text-3xl font-medium tracking-tight">Real-Time Business Metrics.</h2>
          <p className="mt-2 text-muted-foreground font-light">
            Quantify the value of your AI front office.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: "Customer Conversations", value: "12,483", trend: "+12%" },
            { label: "AI Resolved", value: "78%", trend: "+4%" },
            { label: "Leads Created", value: "436", trend: "+18%" },
            { label: "Average Response", value: "4 seconds", trend: "-1s" },
            { label: "Human Escalations", value: "12%", trend: "-2%" },
            { label: "Customer Satisfaction", value: "9.2/10", trend: "+0.4" },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between h-32"
            >
              <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-medium tracking-tight">{stat.value}</div>
                <div className="text-sm font-medium text-success bg-success/10 px-2 py-0.5 rounded">
                  {stat.trend}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Integrations() {
  const categories = [
    { name: "Communication", apps: ["Gmail", "Outlook", "WhatsApp", "Slack"] },
    { name: "CRM", apps: ["HubSpot", "Salesforce", "Zoho"] },
    { name: "Commerce", apps: ["Shopify", "WooCommerce", "Stripe"] },
    { name: "Automation", apps: ["Zapier", "REST API", "Webhooks"] },
  ];

  return (
    <section id="integrations" className="py-24 lg:py-32">
      <div className="mx-auto max-w-[90rem] px-6 lg:px-10">
        <div className="mb-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-medium tracking-tight">Connected Apps.</h2>
          <p className="mt-4 text-xl text-muted-foreground font-light">
            Noxx lives where your business operates.
          </p>
        </div>

        <div className="max-w-5xl mx-auto bg-card border border-border rounded-2xl shadow-card p-8 lg:p-12 text-sm">
          <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
            <h3 className="text-lg font-medium">Active Integrations</h3>
            <button className="flex items-center gap-2 bg-foreground text-background px-3 py-1.5 rounded-md font-medium text-xs">
              <Plus className="h-4 w-4" /> Add Integration
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {categories.map((cat) => (
              <div key={cat.name}>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                  {cat.name}
                </div>
                <div className="space-y-3">
                  {cat.apps.map((app) => (
                    <div key={app} className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                        <Check className="h-2.5 w-2.5 text-success" />
                      </div>
                      <span className="font-medium text-foreground">{app}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Sandbox() {
  return (
    <section className="py-24 bg-muted/10 border-y border-border/50">
      <div className="mx-auto max-w-[90rem] px-6 lg:px-10 text-center">
        <Code2 className="h-8 w-8 mx-auto text-muted-foreground mb-6" />
        <h2 className="text-2xl font-medium tracking-tight">Test Everything Before Going Live.</h2>
        <p className="mt-4 text-lg text-muted-foreground font-light max-w-2xl mx-auto">
          Every workspace includes a secure sandbox to build and refine workflows without affecting
          real customers.
        </p>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-32 lg:py-48 relative overflow-hidden bg-background">
      <div className="mx-auto max-w-4xl px-6 lg:px-10 text-center">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.05]">
          Hire Your First <br /> AI Employee.
        </h2>
        <p className="mt-8 text-xl text-muted-foreground font-light max-w-2xl mx-auto">
          Your business deserves a better front office. Ensure every customer is greeted, every lead
          is captured, and your team focuses on what matters.
        </p>
        <div className="mt-12 flex items-center justify-center gap-4">
          <Link
            to="/signup"
            className="inline-flex items-center justify-center rounded-lg bg-foreground px-8 py-4 text-base font-medium text-background hover:bg-foreground/90 transition-all shadow-xl"
          >
            Start Building Your Noxx Agent
          </Link>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-[90rem] px-6 lg:px-10 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-foreground shadow-sm">
            <Sparkles className="h-3 w-3 text-background" />
          </div>
          <span className="text-base font-medium tracking-tight">Noxx</span>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            Terms
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            Contact
          </a>
        </div>
        <p className="text-sm text-muted-foreground font-light">
          © 2025 - {new Date().getFullYear()} Noxx Inc.
        </p>
      </div>
    </footer>
  );
}
