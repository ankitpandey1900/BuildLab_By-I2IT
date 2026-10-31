# ADR-0004: Evidence-Based Contribution Verification via GitHub Commit Signatures

- **Status:** Accepted  
- **Date:** 2026-10-30  
- **Decision Makers:** Ankit Pandey (Lead Architect & Product Lead)  
- **Technical Story:** Verifiable student portfolios and attribution security

---

## Context & Problem Statement

College development portfolios often suffer from attribution fraud:
- Students self-report work they did not write.
- Repositories are copied, renamed, or inflated with meaningless commits to game activity graphs.
- Star-trading rings and vanity metrics dilute genuine engineering merit.

We needed a verifiable, tamper-proof mechanism to guarantee that a student’s public BuildLab portfolio reflects genuine, maintainer-accepted contributions.

---

## Decision

We decided that **contributions are never awarded based on self-reporting alone**. Instead, attribution is anchored to cryptographic evidence from GitHub:

1. **Webhook Ingestion:** BuildLab listens for verified GitHub webhook events (`pull_request.closed` with `merged == true`).
2. **Commit Signature Verification:** Webhook payloads verify GPG/SSH commit signatures and merged pull request metadata directly from the connected college repository.
3. **Identity Binding:** The merged commit’s author is bound to the verified student’s University PRN stored in BuildLab's PostgreSQL database.
4. **Receipt Generation:** A tamper-evident `VerifiedContribution` receipt is minted, storing:
   - PR number and commit SHA.
   - Project ID and repository URL.
   - Maintainer verification signature.
   - Timestamp and verified role category.

---

## Consequences

### Positive
- Indisputable engineering evidence for students applying to internships, jobs, and graduate programs.
- Eliminates resume inflation and fake contribution claims.
- Encourages junior students to write clean code that passes real maintainer code reviews.

### Negative / Trade-offs
- Requires connected repositories to have BuildLab's GitHub App / Webhook installed.
- Work done on private or offline student projects cannot be automatically verified unless imported through an authorized maintainer review.
