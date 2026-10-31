# ADR-0005: Admin Campus Verification Desk & Immutable Audit Logging Pattern

- **Status:** Accepted  
- **Date:** 2026-10-31  
- **Decision Makers:** Ankit Pandey (Lead Architect & Product Lead)  
- **Technical Story:** Administrative review workflow, security controls, and governance

---

## Context & Problem Statement

To uphold the integrity of the Campus Verification Gate, designated community leads and faculty administrators must review submitted PRNs, roll numbers, and employee codes.

However, giving moderators ad-hoc database access or relying on spreadsheets creates severe security risks:
- Lack of accountability: impossible to trace who approved or rejected an applicant.
- No structured feedback loop: students whose submissions had minor typos (like missing a final letter on their PRN) had no clear way to understand why they were rejected or how to correct their details.
- Accidental privilege escalation or privacy leaks.

---

## Decision

We designed a dedicated, role-protected **Admin Verification Desk** paired with an immutable **`AuditEvent`** logging system:

1. **Role-Based API Protection:** Only authenticated users with roles `admin`, `faculty`, `reviewer`, or `lead` can access `/api/admin/verifications` and `/api/admin/verifications/:id`.
2. **One-Click State Mutations:**
   - **Approve Student / Faculty:** Switches `verificationStatus` to `VERIFIED`, sets `verifiedAt` timestamp, and records `verifiedById`.
   - **Request Changes:** Sets status to `REJECTED` and requires a mandatory `rejectionReason` note sent directly to the student's notification center.
3. **Immutable Audit Trails:** Every administrative decision automatically writes a record to the `AuditEvent` table capturing:
   - `actorId` (the reviewing admin).
   - `action` (`VERIFICATION_APPROVED` or `VERIFICATION_REJECTED`).
   - `target` (`user:<userId>`).
   - `metadata` (student name, PRN, branch, reviewer name, timestamp, and decision reason).

---

## Consequences

### Positive
- Zero direct database manipulation required by administrators.
- Complete accountability and transparency: every verification decision is logged with an immutable audit trail.
- Clear feedback for students: rejected applicants receive actionable revision instructions directly in the UI.

### Negative / Trade-offs
- Review leads must periodically check the queue to prevent verification bottlenecks (mitigated by real-time queue badges in the navbar).
