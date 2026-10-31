# ADR-0001: Next.js Modular Monolith vs Distributed Microservices

- **Status:** Accepted  
- **Date:** 2026-10-28  
- **Decision Makers:** Ankit Pandey (Lead Architect)  
- **Technical Story:** Architecture baseline selection for BuildLab by I2IT

---

## Context & Problem Statement

When designing BuildLab by I2IT, we needed to decide on the high-level system topology. The platform serves a campus community of 500 to 2,000 active engineering students and faculty at I2IT Pune. The platform handles project exploration, campus verification, collaboration proposals, 1-on-1 mentor messaging, and GitHub webhook event ingestion.

Options considered:
1. **Distributed Microservices:** Separate services for Auth, Catalog, Collaboration, and Webhooks deployed on Docker/Kubernetes.
2. **Modular Monolith (Next.js App Router):** A single unified repository with shared TypeScript types, server components, API route handlers, and Prisma ORM.

---

## Decision

We decided to build BuildLab as a **Modular Monolith using Next.js 16 (App Router + Turbopack)** running on Node.js with PostgreSQL via Prisma ORM.

---

## Rationale

1. **Team Size & Operational Complexity:** A student engineering team cannot justify the operational tax of multi-service CI/CD pipelines, service meshes, distributed tracing, and network latency debugging.
2. **End-to-End Type Safety:** A unified TypeScript codebase allows database models, API contracts, and UI components to share the exact same types (`types/index.ts` and Prisma client) without maintaining duplicate protobuf/gRPC schemas.
3. **Campus Traffic Profile:** A single well-optimized Node.js server backed by connection-pooled PostgreSQL easily handles our target campus throughput (sub-350ms response times for several thousand daily visits).
4. **Clean Domain Modularity:** Internal features are organized into isolated modules (`src/components/`, `src/app/api/admin/`, `src/app/api/verification/`, `src/lib/`), making it simple to split into microservices in the future *only if* demonstrated scaling bottlenecks emerge.

---

## Consequences

### Positive
- Zero network latency between internal service boundaries.
- Single command build (`npm run build`) and test suite (`npm run typecheck`).
- Simple deployment on a single campus Linux server (via systemd/PM2) or serverless cloud container.
- Rapid developer onboarding for new student contributors.

### Negative / Trade-offs
- Deployment updates require deploying the entire monolithic container rather than individual micro-endpoints.
- High-CPU tasks (such as future heavy background git diff parsing) must be handled carefully to avoid blocking the Node.js event loop (mitigated by offloading to async background workers when needed).
