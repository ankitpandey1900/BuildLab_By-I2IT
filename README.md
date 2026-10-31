# BuildLab by I2IT

BuildLab is the official open-source campus engineering and developer collaboration platform for **Hope Foundation's International Institute of Information Technology (I2IT), Pune**.

Students and faculty discover repositories, pitch solutions to maintainer problems, request institutional sponsorship, collaborate with 1-on-1 mentor guidance, and earn verified engineering contribution records anchored to college PRNs.

GitHub remains the source of truth for repositories, issues, pull requests, and commits. BuildLab is the campus-wide community layer connecting students, maintainers, and faculty.

---

## What We Have Built

1. **Campus-Wide Project Catalog:** Search and filter active projects across the 3 engineering departments (*Computer Engineering*, *Information Technology*, and *Electronics & Telecommunication*).
2. **Campus Identity Verification Gate:** Dual accreditation system verifying students by University PRN + Roll Number, and faculty by College Employee Code + Academic Designation.
3. **Admin Verification Desk:** Dedicated queue for community leads to review, approve, or request revisions on campus credentials.
4. **Structured Collaboration Pitching:** Direct role and task proposals sent to project maintainers without chaotic WhatsApp or LinkedIn DMs.
5. **1-on-1 Mentor Consultation Chat:** Topic-focused technical advice from project leads and faculty mentors.
6. **Community Support Workspace:** Formal sponsorship and review workflow for projects seeking college GitHub Organization placement.

---

## Tech Stack

- **Framework:** Next.js 16.4 (App Router, Turbopack, React 19)
- **Database:** PostgreSQL 16 on Supabase
- **ORM:** Prisma 6.19 Client
- **Type Safety:** TypeScript 5.7 (strict mode)
- **Styling:** Tailwind CSS 3.4 with custom Linear-inspired design tokens
- **Auth:** Better Auth with GitHub OAuth and local dev bypass

```mermaid
flowchart LR
    Browser["Student / Faculty Browser"] -->|HTTPS / TLS 1.3| NextApp["BuildLab Engine (Next.js 16)<br/>App Router & Route Handlers"]
    NextApp -->|PgBouncer Pooler (Port 6543)| SupabaseDB[("PostgreSQL 16 Cluster<br/>Users, PRNs, Projects, Tasks")]
    NextApp <-->|OAuth 2.0 & HMAC Webhooks| GitHubAPI["GitHub Platform<br/>Repos, PRs, Commits"]
```

---

## Local Setup

### 1. Prerequisites
- Node.js 20 or later
- npm 10 or later
- PostgreSQL 16 (local instance or Supabase database)

### 2. Clone & Install
```bash
git clone https://github.com/ankitpandey1900/OpenSource_Dev_I2it.git
cd OpenSource_Dev_I2it
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update your `DATABASE_URL` with your PostgreSQL connection string.

### 4. Database Setup
Generate the Prisma client and push the schema:
```bash
npx prisma generate
npx prisma db push
```

Optional: Seed demo records for local development:
```bash
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Pre-PR Verification Checks

Before submitting any code changes or opening a pull request, ensure both checks pass:

```bash
# TypeScript strict check (must pass with 0 errors)
npm run typecheck

# Production build check (must exit with code 0)
npm run build
```

---

## Engineering Documentation

We maintain production-grade engineering documentation following industry standards:

- **[System Architecture Document](./docs/architecture/SYSTEM_ARCHITECTURE.md):** High-level topology, component decomposition, network boundaries, and Mermaid sequence flows.
- **[System Design Document](./docs/design/SYSTEM_DESIGN.md):** Entity-Relationship model, state machines, API contracts, connection pooling, and threat modeling.
- **[Architecture Decision Records (ADRs)](./docs/adr/README.md):** Michael Nygard-standard ADRs covering monolith topology, PRN gate pivot, connection pooling, and verification logging.
- **[Product Requirements Document (PRD)](./college_developer_platform_PRD.md):** Founder vision, user personas, problem statements, and feature specifications.
- **[Development Plan & Roadmap](./DEVELOPMENT_PLAN.md):** Milestone tracking and backlog of ready-to-build tasks for contributors.

---

## Contributing & Backlog

See [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) for the active milestones and backlog tasks ready for collaborators to pick up.
