# Relay — Unified Communication & Commerce Platform

Relay is an all-in-one platform that lets businesses send messages across every channel, automate their workflows, accept payments, manage domains, and run AI-powered support — all from one unified API and dashboard.

> Built with **TanStack Start v1**, **React 19**, **Vite 7**, **Tailwind CSS v4**, and **shadcn/ui**.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Features](#features)
  - [1. Multi-Channel Messaging](#1-multi-channel-messaging)
  - [2. Visual Flow Builder](#2-visual-flow-builder)
  - [3. AI Agents & Playground](#3-ai-agents--playground)
  - [4. Voice (PSTN + Realtime)](#4-voice-pstn--realtime)
  - [5. Support Tickets](#5-support-tickets)
  - [6. Automations](#6-automations)
  - [7. Campaigns](#7-campaigns)
  - [8. Payments Gateway](#8-payments-gateway)
  - [9. Domain Management](#9-domain-management)
  - [10. Integrations Marketplace](#10-integrations-marketplace)
  - [11. Templates Library](#11-templates-library)
  - [12. Projects & Environments](#12-projects--environments)
  - [13. Developer API & Keys](#13-developer-api--keys)
  - [14. Admin Console](#14-admin-console)
- [Routing](#routing)
- [Design System](#design-system)
- [Contributing](#contributing)

---

## Overview

Relay unifies the tools businesses normally stitch together from a dozen vendors:

- Twilio / MessageBird for SMS
- SendGrid / Mailgun for email
- Meta WhatsApp / Instagram for messaging
- Zendesk / Intercom for support
- Zapier / n8n for automation
- Stripe for payments
- GoDaddy / Cloudflare for domains
- OpenAI / Anthropic for AI

…into a single API surface and dashboard.

---

## Tech Stack

| Layer | Technology |
|------|-----------|
| Framework | TanStack Start v1 (SSR, file-based routing) |
| UI | React 19 + shadcn/ui + Radix primitives |
| Styling | Tailwind CSS v4 (semantic tokens in `src/styles.css`) |
| Build | Vite 7 |
| Charts | Recharts |
| Flow Builder | Custom canvas with `FlowNode` components |
| Icons | lucide-react |
| Routing | TanStack Router (auto-generated `routeTree.gen.ts`) |

---

## Getting Started

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Build for production
bun run build
```

The app runs at `http://localhost:5173`.

---

## Project Structure

```
src/
├── components/
│   ├── AdminLayout.tsx       # Standalone admin shell (red-accent)
│   ├── AppLayout.tsx         # Main app shell with sidebar + topbar
│   ├── AppSidebar.tsx        # User navigation
│   ├── Topbar.tsx            # Project switcher + env toggle
│   ├── Card.tsx              # Stat / content card primitive
│   ├── flow/FlowNode.tsx     # Draggable node for flow canvas
│   └── ui/                   # shadcn components (50+)
├── lib/
│   ├── admin.ts              # Admin mock data (users, services, flags, audit)
│   ├── automations.ts        # Workflow automation definitions
│   ├── campaigns.ts          # Bulk campaign data
│   ├── conversations.ts      # Inbox / chat history
│   ├── domains.ts            # Domain & DNS records
│   ├── integrations.ts       # 3rd-party connector catalog
│   ├── tickets.ts            # Support ticket data + statuses
│   ├── projects.ts           # Multi-project workspace state
│   ├── project-context.tsx   # React context for current project
│   ├── mock-data.ts          # Shared mock fixtures
│   └── utils.ts              # cn() + helpers
├── routes/                   # File-based routes (see Routing section)
└── styles.css                # Design tokens + Tailwind v4 theme
```

---

## Features

### 1. Multi-Channel Messaging
**Route:** `/messages`

A unified inbox spanning **SMS, Email, WhatsApp, Instagram DMs, and AI chat**. One thread per customer regardless of which channel they used last. Filter by channel, status, or assignee.

- Mock conversations live in `src/lib/conversations.ts`
- Channel pills color-coded via design tokens
- Reply box auto-detects the active channel

### 2. Visual Flow Builder
**Route:** `/flows`

Drag-and-drop canvas for designing message automations. Nodes can be triggers (incoming SMS, form submit, schedule), actions (send email, call API, branch), or AI steps (classify intent, generate reply).

- `src/components/flow/FlowNode.tsx` renders draggable nodes
- Connections are SVG paths between node handles
- Save/load via project context

### 3. AI Agents & Playground
**Route:** `/playground`

Test AI agents with **mock replies** before deploying them into a flow. Configure system prompt, model, temperature, and tools. The chat UI streams a simulated response so you can iterate on prompts without burning tokens.

- AI replies are mocked client-side (no API key required)
- Used inside flows via the "AI Agent" node type

### 4. Voice (PSTN + Realtime)
**Route:** `/voice`

Programmable voice — buy phone numbers, route inbound calls into flows, and stream realtime transcripts. Supports IVR menus and AI voice agents.

- Phone number inventory + call log
- Beta gated by the `voice_realtime` feature flag

### 5. Support Tickets
**Route:** `/tickets`

The support hub (formerly "Messages"). Every customer issue becomes a **ticket** with status (`open`, `pending`, `solved`, `closed`), priority, assignee, and a full conversation thread you can open inline.

- Ticket list with filters + bulk actions
- Click a ticket → see the full conversation history
- Linked to the customer's other channels in the unified inbox
- Data: `src/lib/tickets.ts`

### 6. Automations
**Route:** `/automations`

Pre-built, business-ready automations that simplify common workflows. Pick from a library:

- **Auto-reply after hours** — send a templated SMS when a message arrives outside business hours
- **Abandoned cart recovery** — email + SMS sequence triggered by Shopify webhook
- **New lead routing** — assign incoming tickets round-robin to your team
- **Payment-failed dunning** — retry a Stripe charge and notify the customer
- **Renewal reminders** — schedule outreach 30/14/7 days before subscription renewal

Each automation is a configurable template that wires triggers → conditions → actions. Defined in `src/lib/automations.ts`.

### 7. Campaigns
**Route:** `/campaigns`

Send broadcast messages (SMS, email, WhatsApp) to segmented audiences. Schedule, A/B test, and track delivery + open rates.

### 8. Payments Gateway
**Route:** `/payments`

Relay's own payment gateway — businesses can:

- **Generate payment links** to share over any channel
- **Drop in a checkout script** on their existing website (`<script src="relay.js">`)
- **Accept subscriptions** (gated by the `payments_subs` flag)
- **Pay for Relay services** like domain registration directly from wallet balance

Integrates with the Tickets and Automations modules so a paid invoice can auto-close a support ticket or trigger a fulfillment flow.

### 9. Domain Management
**Route:** `/domains`

Buy, transfer, and manage domains without leaving Relay. **No cPanel** — only domain-level controls:

- Domain registration & renewal
- DNS records (A, AAAA, CNAME, MX, TXT, SRV)
- Custom nameservers (NS) management
- SSL certificate provisioning (auto)
- WHOIS privacy toggle

Data: `src/lib/domains.ts`. Powered by the `domains_registrar` feature flag.

### 10. Integrations Marketplace
**Route:** `/integrations`

One-click connectors to Shopify, Stripe, HubSpot, Salesforce, Slack, Google Calendar, Zapier, etc. Each integration exposes triggers and actions to the flow builder.

### 11. Templates Library
**Route:** `/templates`

Reusable **message templates** (with variable interpolation) and **flow templates** (importable starter automations).

### 12. Projects & Environments
**Routes:** `/projects`, `/env`

Multi-project workspace — each project has its own messages, flows, keys, and billing. Switch between **production** and **sandbox** environments via the topbar.

- Project state lives in `src/lib/project-context.tsx`
- Env toggle is global and affects which API keys + webhooks are active

### 13. Developer API & Keys
**Routes:** `/dev-api`, `/api-keys`

REST + webhook reference plus key management. Generate scoped keys (read-only, send-only, full access), rotate them, and view request logs.

### 14. Admin Console
**Route:** `/admin` *(separate dashboard — not part of the user shell)*

A **standalone super-admin** dashboard with its own layout (`AdminLayout.tsx`), red-accented sidebar, and "Back to app" link. Only accessible to platform operators. Tabs:

| Tab | Purpose |
|-----|---------|
| **Overview** | Platform-wide MRR, active users, message volume, error rate, revenue trend chart |
| **Users** | All accounts across all orgs — role, plan, status, MRR, last active |
| **System** | Live status of every service (API gateway, SMS, email, WhatsApp bridge, AI inference, payments, voice, webhooks) with uptime + latency |
| **Billing** | MRR breakdown by plan, top accounts |
| **Flags** | Feature flag rollout controls (toggle + % rollout slider) |
| **Audit** | Security-relevant events with severity (info / warning / critical) |

Data: `src/lib/admin.ts`. The admin shell is intentionally visually distinct (red accents, "Super-admin" warning badge) so operators always know they're in privileged context.

---

## Routing

Relay uses **TanStack Router** with file-based routing. Each file in `src/routes/` becomes a route:

| File | Path | Description |
|------|------|-------------|
| `index.tsx` | `/` | Marketing landing page |
| `login.tsx` | `/login` | Sign in |
| `signup.tsx` | `/signup` | Sign up |
| `dashboard.tsx` | `/dashboard` | User home (stats overview) |
| `messages.tsx` | `/messages` | Unified inbox |
| `tickets.tsx` | `/tickets` | Support tickets |
| `automations.tsx` | `/automations` | Workflow automations |
| `flows.tsx` | `/flows` | Visual flow builder |
| `campaigns.tsx` | `/campaigns` | Broadcast campaigns |
| `voice.tsx` | `/voice` | Programmable voice |
| `playground.tsx` | `/playground` | AI agent playground |
| `payments.tsx` | `/payments` | Payment gateway |
| `domains.tsx` | `/domains` | Domain management |
| `integrations.tsx` | `/integrations` | Integration marketplace |
| `templates.tsx` | `/templates` | Template library |
| `projects.tsx` | `/projects` | Project switcher |
| `env.tsx` | `/env` | Environment settings |
| `dev-api.tsx` | `/dev-api` | API reference |
| `api-keys.tsx` | `/api-keys` | API key management |
| `settings.tsx` | `/settings` | Account settings |
| `admin.tsx` | `/admin` | **Standalone admin console** |

`routeTree.gen.ts` is auto-generated — do not edit it.

---

## Design System

All colors, gradients, and shadows are defined as **semantic tokens** in `src/styles.css` using `oklch()`. Components reference them via Tailwind utilities (`bg-primary`, `text-muted-foreground`, etc.) — never raw colors.

Core tokens:
- `--background` / `--foreground`
- `--primary` / `--primary-foreground`
- `--secondary`, `--muted`, `--accent`, `--destructive`
- `--border`, `--ring`, `--card`, `--popover`
- Sidebar-specific tokens for the user shell
- Destructive-tinted variants used by `AdminLayout`

Both light and dark modes are supported with the same token names.

---

## Contributing

This is currently a **frontend-only** project running on mock data. To wire it up to a real backend, enable **Lovable Cloud** from the editor — it provisions Postgres, auth, storage, and serverless functions automatically. Then replace the mock modules in `src/lib/` with real queries.

---

**Built with [Lovable](https://lovable.dev).**
