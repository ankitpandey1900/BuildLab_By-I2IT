# System Design Document — BuildLab by I2IT

> **Author:** Ankit Pandey (Lead Architect & Product Lead)  
> **Status:** Active Baseline  
> **Target Audience:** Engineering team, database administrators, and technical contributors  
> **Scope:** Data models, state machines, API contracts, connection pooling, and security architecture.

---

## 1. Entity-Relationship Data Model

The database schema is defined in Prisma (`prisma/schema.prisma`) and hosted on PostgreSQL 16.

```mermaid
erDiagram
    User ||--o{ Project : "creates and owns"
    User ||--o{ ProjectMember : "participates in"
    User ||--o{ CollaborationRequest : "submits pitches"
    User ||--o{ VerifiedContribution : "credited with"
    User ||--o{ Notification : "receives"
    User ||--o{ AuditEvent : "initiates actions"

    Project ||--o{ ProjectMember : "roster members"
    Project ||--o{ ProjectTask : "work breakdown tasks"
    Project ||--o{ CollaborationRequest : "receives proposals"
    Project ||--o| SupportApplication : "requests sponsorship"
    Project ||--o{ VerifiedContribution : "verifies commits"

    CollaborationRequest ||--o{ CollaborationActivity : "audits proposal history"

    User {
        string id PK
        string email UK
        string name
        string role
        string prnNumber UK
        string rollNumber
        string academicYear
        string department
        string verificationStatus
        string rejectionReason
        datetime verifiedAt
        datetime createdAt
    }

    Project {
        string id PK
        string ownerId FK
        string name
        string slug UK
        string summary
        string problemStatement
        string status
        string maturity
        string visibility
        string repositoryUrl
        boolean handoverFlagged
        datetime createdAt
    }

    ProjectMember {
        string id PK
        string projectId FK
        string userId FK
        string role
        datetime createdAt
    }

    ProjectTask {
        string id PK
        string projectId FK
        string title
        string difficulty
        string status
        string role
        string suggestedFiles
        datetime createdAt
    }

    CollaborationRequest {
        string id PK
        string projectId FK
        string applicantId FK
        string role
        string issueUrl
        string message
        string status
        datetime createdAt
    }

    CollaborationActivity {
        string id PK
        string requestId FK
        string actorId FK
        string action
        string note
        datetime createdAt
    }

    SupportApplication {
        string id PK
        string projectId FK
        string status
        string requestedSupport
        string targetAudience
        string reviewerNotes
        datetime createdAt
    }

    VerifiedContribution {
        string id PK
        string userId FK
        string projectId FK
        string type
        string title
        string repo
        string sha
        boolean verifiedByGitHub
        datetime createdAt
    }

    Notification {
        string id PK
        string userId FK
        string type
        string title
        string body
        string href
        datetime readAt
        datetime createdAt
    }

    AuditEvent {
        string id PK
        string actorId FK
        string action
        string target
        json metadata
        datetime createdAt
    }
```

---

## 2. Core State Machines & Lifecycles

### 2.1 Campus Identity Verification Lifecycle

Every user record tracks a strict verification lifecycle managed by the campus gate:

```mermaid
stateDiagram-v2
    [*] --> UNVERIFIED : GitHub OAuth First Login

    UNVERIFIED --> PENDING_APPROVAL : Submit PRN / Roll No / Department
    note right of UNVERIFIED
        Can browse projects and roadmaps.
        Cannot create projects or pitch code solutions.
    end note

    PENDING_APPROVAL --> VERIFIED : Admin Approves Campus Record
    PENDING_APPROVAL --> REJECTED : Admin Requests Changes / Flags Mismatch
    note right of PENDING_APPROVAL
        Read-only review queue state.
        Visible in Admin Verification Desk.
    end note

    REJECTED --> PENDING_APPROVAL : Student Updates Details & Resubmits
    note right of REJECTED
        Displays admin's specific rejectionReason.
        Student corrects PRN / Roll No in modal.
    end note

    state VERIFIED {
        [*] --> ActiveCampusMember
        ActiveCampusMember --> CreateProjects
        ActiveCampusMember --> PitchTaskSolutions
        ActiveCampusMember --> MentorConsultation
        ActiveCampusMember --> InstitutionalSponsorship
    }

    VERIFIED --> [*] : Student Graduation / Alum Status
```

- **`UNVERIFIED`:** Default state upon GitHub sign-in. User can browse projects, roadmaps, and public repos. Privileged actions prompt the verification modal.
- **`PENDING_APPROVAL`:** Credentials submitted to the review queue. User details are read-only while under review.
- **`VERIFIED`:** Credentials verified against official campus enrollment records. Full access granted: create projects, claim tasks, pitch solutions, talk 1-on-1 with mentors.
- **`REJECTED`:** Verification could not be verified (e.g., mismatched roll number or invalid checksum). Displays admin's `rejectionReason` with immediate option to correct and re-submit.

---

### 2.2 Project Maturity Lifecycle

Projects transition through discrete maturity stages as their technical foundation and team structure solidify:

```mermaid
stateDiagram-v2
    [*] --> Idea : Problem Statement Defined

    state Idea {
        [*] --> DraftProblemStatement
        DraftProblemStatement --> RecruitCoreTeam : Seek Co-Founders & UI/UX
    }

    Idea --> Prototype : Working MVP & GitHub Repo Linked

    state Prototype {
        [*] --> SetupRepository
        SetupRepository --> HackathonValidation : Deploy Proof-of-Concept
    }

    Prototype --> Active : Publish Roadmaps & Structured Tasks

    state Active {
        [*] --> WeeklySprints
        WeeklySprints --> IngestContributions : Review Pitches & PRs
    }

    Active --> Maintenance : Core Features Completed & Stable
    Active --> HandoverRequired : Senior Lead Graduating Flagged

    HandoverRequired --> Active : Junior Maintainer Assumes Leadership

    Maintenance --> Archived : Project Sunset / Historical Capstone
    Archived --> [*] : Contributor Receipts Permanently Preserved
```

- **`Idea`:** Problem statement defined. Zero code required. Focus is on finding co-founders, research partners, and UI/UX designers.
- **`Prototype`:** Working proof-of-concept or hackathon submission. Repository URL is required. Focus is on recruiting core contributors.
- **`Active`:** Established repository with structured task board, CI checks, and active maintenance.
- **`Maintenance`:** Stable utility or completed BE project. Focus on bug fixes, dependency updates, and minor enhancements.
- **`Archived`:** Read-only historical record. Contributions and receipts remain permanently preserved on contributor profiles.

---

### 2.3 Collaboration Pitch Lifecycle

Collaboration proposals follow a structured review pipeline between verified students and maintainers:

```mermaid
stateDiagram-v2
    [*] --> Pending : Verified Student Submits Pitch

    state Pending {
        [*] --> MaintainerNotification
        MaintainerNotification --> ReviewProposal : Evaluate Skills & Plan
    }

    Pending --> Accepted : Maintainer Approves Pitch
    Pending --> Declined : Maintainer Declines Proposal
    Pending --> ChangesRequested : Feedback Note Sent

    ChangesRequested --> Pending : Contributor Updates Proposal

    state Accepted {
        [*] --> AddToProjectTeam
        AddToProjectTeam --> ClaimBoardTask : Task Moved to Claimed
    }

    Accepted --> [*] : Active Project Contributor
    Declined --> [*] : Proposal Archived with Feedback
```

---

## 3. API Design & Endpoint Contracts

All API endpoints follow RESTful conventions and return standardized JSON payloads:

### 3.1 Verification Endpoints

#### `POST /api/verification/apply`
- **Authentication:** Required (session user)
- **Rate Limit:** 5 requests / 10 minutes per IP
- **Request Body:**
  ```json
  {
    "roleType": "student", // or "faculty"
    "fullName": "Aarav Sharma",
    "department": "Computer Engineering", // Strictly CE, IT, or E&TC
    "prnNumber": "72234012A", // or "employeeCode" for faculty
    "rollNumber": "TE-IT-42", // or "designation" for faculty
    "academicYear": "Third Year (TE)"
  }
  ```
- **Responses:**
  - `200 OK`: Verification submitted successfully.
  - `400 Bad Request`: Validation failure (missing required fields or invalid department).
  - `409 Conflict`: PRN / Employee Code already claimed by another user account.

#### `PATCH /api/admin/verifications/:id`
- **Authentication:** Required (User role must be `admin`, `faculty`, `reviewer`, or `lead`)
- **Request Body:**
  ```json
  {
    "action": "approve", // or "reject"
    "reason": "PRN checksum verified against campus records." // Required if reject
  }
  ```
- **Responses:**
  - `200 OK`: Status updated, audit event logged, and notification dispatched to student.
  - `403 Forbidden`: Caller lacks administrative review permissions.
  - `404 Not Found`: Target user record does not exist.

---

## 4. Database Connection & Scalability Strategy

To handle high concurrency during campus hackathons and project submissions without exhausting PostgreSQL connection limits, the data access layer implements a dual-connection pooler strategy:

```mermaid
flowchart TD
    subgraph AppTier ["BuildLab Next.js 16 Application Engine"]
        RuntimeOps["Runtime Queries<br/>(App Router, Server Actions, Route Handlers)"]
        MigrationOps["Prisma CLI & Schema Engine<br/>(Migrations & DDL Operations)"]
    end

    subgraph PoolerTier ["Supabase Managed Connection Layer"]
        PgBouncer["PgBouncer Transaction Pooler<br/>Port 6543 | Max 50 conns | 10,000ms Timeout"]
        DirectSocket["PostgreSQL Session Socket<br/>Port 5432 | Dedicated Direct Session"]
    end

    subgraph StorageTier ["Database Cluster"]
        PostgresCluster[("PostgreSQL 16 Primary Database<br/>(ACID Transactions / Row Locks)")]
    end

    RuntimeOps -->|DATABASE_URL / Transaction Pooling| PgBouncer
    MigrationOps -->|DIRECT_URL / Direct TCP Connection| DirectSocket

    PgBouncer -->|Multiplexed Queries| PostgresCluster
    DirectSocket -->|DDL Schema Sync| PostgresCluster
```

### Indexing Strategy
- `User(prnNumber)`: B-tree index for instant duplicate PRN checks and admin desk lookups.
- `User(verificationStatus)`: Filter index for queue queries (`WHERE verificationStatus = 'PENDING_APPROVAL'`).
- `Project(visibility, archivedAt)`: Composite index for public directory filtering.
- `ProjectTask(projectId, status)`: Composite index for fast task board retrieval.

---

## 5. Security & Threat Modeling

| Threat Vector | Mitigation Strategy in BuildLab |
|---|---|
| **PRN Impersonation** | Unique database constraints prevent multiple accounts claiming the same PRN. Admin verification against campus records before privileged access is granted. |
| **Privilege Escalation** | All `/api/admin/*` routes verify role permissions on the server using session tokens; client state is never trusted. |
| **SQL Injection** | 100% of database interactions run through Prisma ORM using parameterized queries; zero raw dynamic SQL strings. |
| **Webhook Spoofing** | GitHub webhook listener verifies incoming `X-Hub-Signature-256` HMAC signatures using `GITHUB_WEBHOOK_SECRET` before processing events. |
| **XSS & Content Injection** | Markdown descriptions and README renderings sanitize HTML and disallow inline script executions. |
