# ADR-0003: Dual PostgreSQL Connection Poolers (Transaction vs Session Mode)

- **Status:** Accepted  
- **Date:** 2026-10-29  
- **Decision Makers:** Ankit Pandey (Lead Architect)  
- **Technical Story:** Database connection reliability on Supabase PostgreSQL with Prisma ORM

---

## Context & Problem Statement

Prisma Client creates multiple direct connections to PostgreSQL. In serverless and containerized Node.js environments (where Next.js route handlers spin up and handle concurrent requests), direct connections quickly exhaust PostgreSQL's `max_connections` limit, resulting in `FATAL: remaining connection slots are reserved` errors.

However, using a standard connection pooler (like PgBouncer in transaction mode) presents a challenge:
- Transaction mode poolers do not support PostgreSQL session-level features, advisory locks, or DDL migration statements used by `prisma migrate` or `prisma db push`.

---

## Decision

We implemented a **Dual Connection Strategy** configured in `prisma/schema.prisma` and `.env`:

1. **`DATABASE_URL` (Transaction Mode Pooler on Port 6543):**
   - Routes all application runtime queries through PgBouncer in transaction mode with `?pgbouncer=true`.
   - Reuses connections across requests and safely scales up to thousands of concurrent users.
2. **`DIRECT_URL` (Session Mode Pooler on Port 5432):**
   - Bypasses transaction pooling to establish a direct connection to PostgreSQL for Prisma migrations and schema synchronization (`npx prisma db push`).

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

---

## Consequences

### Positive
- Application runtime is immune to connection pool exhaustion during traffic spikes.
- Prisma schema migrations and DDL operations execute reliably without locks or pooler errors.
- Low database memory footprint on Supabase.

### Negative / Trade-offs
- Developers must configure both `DATABASE_URL` and `DIRECT_URL` in their `.env` file (clearly documented in `.env.example` and `README.md`).
- Prisma prepared statements must remain disabled in transaction mode (standard practice with PgBouncer).
