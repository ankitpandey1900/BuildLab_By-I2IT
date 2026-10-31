# ADR-0002: Pivot from College Domain Email OTP to GitHub OAuth + Campus PRN Gate

- **Status:** Accepted (Supersedes initial email-only proposal)  
- **Date:** 2026-10-31  
- **Decision Makers:** Ankit Pandey (Lead Architect & Product Lead)  
- **Technical Story:** Campus authentication and identity verification architecture

---

## Context & Problem Statement

Initial specifications proposed restricting platform login strictly to official college domain emails (`@isquareit.edu.in` or `@i2it.ac.in`) with one-time magic links sent via email.

During early testing and feedback from student developers, severe problems emerged:
1. **Institutional Email Friction:** Many students do not actively monitor their college webmail inboxes. Institutional mail servers frequently hit deliverability blocks or route verification emails to spam, causing significant signup drop-off.
2. **Breaks Developer Workflow:** Open-source developers live on GitHub. Forcing users to register separate email/password credentials or switch to college mail client tabs disconnected the developer workflow.
3. **Faculty & Mentor Incompatibilities:** Faculty and visiting industry mentors frequently use varying subdomains or aliases, making rigid email regex matching problematic.

---

## Decision

We decided to **completely remove forced college-email logins** and adopt a two-tier identity architecture:

1. **Authentication Layer:** GitHub OAuth as the sole identity provider. Anyone can authenticate in one click, immediately importing their GitHub handle, avatar, and public repository metadata.
2. **Public Discovery Layer:** Unverified visitors and signed-in students can freely browse projects, read roadmaps, and inspect tasks without hitting a wall.
3. **Campus Verification Gate:** To engage in privileged campus activities (claiming issues, pitching collaboration, posting projects, or consulting mentors), users must complete verification:
   - **Students:** Full Name, University PRN (Permanent Registration Number), Class Roll Number, Academic Year (FE, SE, TE, BE), and Department (CE, IT, E&TC).
   - **Faculty:** Full Name, College Employee Code (e.g. `I2IT-FAC-102`), Academic Designation, and Department.
   - **Admin Verification Desk:** Applications are queued for verification by community leads against official college enrollment rosters.

---

## Consequences

### Positive
- Onboarding friction drops to near zero: developers sign in instantly with GitHub.
- 100% spam-free campus collaboration: users cannot execute privileged actions without verified university credentials.
- Faculty and mentors are natively accommodated using their official employee codes.
- Zero dependency on institutional email server deliverability or Resend API quota limits.

### Negative / Trade-offs
- Verification requires human administrative review against campus records (mitigated by the one-click Admin Verification Desk).
- Users who do not yet have a GitHub account must create one first (acceptable, as GitHub is the core medium of collaboration for this platform).
