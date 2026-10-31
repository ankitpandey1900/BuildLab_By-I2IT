# BuildLab by I2IT

BuildLab is the official open-source campus engineering and developer collaboration platform for Hope Foundation's International Institute of Information Technology (I2IT), Pune.

Students and faculty discover repositories, pitch solutions to maintainer problems, request institutional sponsorship, collaborate with 1-on-1 mentor guidance, and earn verified engineering contribution records anchored to college PRNs.

GitHub remains the source of truth for repositories, issues, pull requests, and commits. BuildLab is the campus-wide community layer connecting students, maintainers, and faculty.

## Current development phase

We are in **Phase 1 — identity and access**. Accounts, sessions, verified I2IT enrollment and protected profile/project APIs are now being built underneath the existing explorer.

The delivery plan is in [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md).

## Prerequisites

- Node.js 20 or later
- PostgreSQL 16 or later
- npm 10 or later

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and set the values. Never commit this file.

3. Create the local PostgreSQL database named `college_dev` (or change `DATABASE_URL`).

4. Generate the database client and apply migrations:

   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

5. Start the app:

   ```bash
   npm run dev
   ```

   Open `http://localhost:3000`.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run typecheck` | Run TypeScript checks without emitting files |
| `npm run build` | Create the production build |
| `npm run db:generate` | Generate Prisma client code |
| `npm run db:migrate` | Create/apply a local database migration |
| `npm run db:seed` | Seed local demo records only |
| `npm run db:studio` | Open Prisma Studio for local inspection |

## Environment variables

| Variable | Required locally | Why it exists |
| --- | --- | --- |
| `BETTER_AUTH_SECRET` | Yes | Encrypts/signs authentication state. Use at least 32 random characters. |
| `BETTER_AUTH_URL` | Yes | Application origin, normally `http://localhost:3000`. |
| `DATABASE_URL` | Yes | PostgreSQL connection string. |
| `DIRECT_URL` | Yes for migrations | Direct/session-mode database URL. With Supabase, use the session pooler on port 5432; use the transaction pooler on port 6543 for `DATABASE_URL`. |
| `COLLEGE_EMAIL_DOMAIN` | Yes | The permitted college email domain, for example `i2it.ac.in`. |
| `GITHUB_CLIENT_ID` | Later | Required when GitHub OAuth is enabled. |
| `GITHUB_CLIENT_SECRET` | Later | Required when GitHub OAuth is enabled. |
| `GITHUB_WEBHOOK_SECRET` | Later | Required before accepting GitHub webhook events. |
| `RESEND_API_KEY` | Production | Sends I2IT verification emails through Resend. Without it, development logs the verification URL server-side. |
| `EMAIL_FROM` | Production | Verified sender address used for verification emails. |

## Safety rules

- `.env.local` must never be committed.
- Do not use production credentials locally.
- Database seeds are only for a local machine; no development script should write to a production database.
- Before Phase 1 is complete, the directory UI still uses demo data. This is intentional and avoids mixing temporary data with real accounts.

## Demo account

After migrations, create the opt-in development account with:

```powershell
$env:ALLOW_DEMO_SEED='true'; npm run db:seed
```

Then sign in with `aarav.sharma@<COLLEGE_EMAIL_DOMAIN>` and password `I2ITDemo!2026`. Do not run this against a shared production database.

## Project checks

Run these before opening a pull request or moving to the next phase:

```bash
npm run typecheck
npm run build
```

The application also exposes:

- `/api/health` — process health only
- `/api/ready` — configuration readiness without revealing secrets

