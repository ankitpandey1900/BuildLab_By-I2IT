# I2IT Dev Community — Development Plan

## What we are building

I want to build I2IT Dev Community as a real campus space where students can discover projects, find people to work with, contribute to open source, and take their projects from idea stage to something the whole campus can support.

This is not another GitHub replacement. GitHub will remain where code, issues and pull requests live. Our platform should make it easier for students to find the right project, show what they have worked on, ask to collaborate, and get community support when a project becomes serious.

The main rule for us is simple: first make the product real, then make it beautiful. We already have many good UI screens, but now every important action needs to save properly, have permissions, and work after refresh.

## Product direction

The core journey should be:

1. A student signs up with their I2IT email.
2. They build a profile and connect GitHub.
3. They discover a project or publish their own idea.
4. They send a collaboration request for a role, task or GitHub issue.
5. A maintainer reviews the request.
6. Their real GitHub contribution becomes visible on their profile.
7. Serious projects can apply for community support, mentorship or GitHub Organization access.

## Phase 0 — Reset the foundation

**Goal:** Make sure the project is stable before adding more features.

### What we will do

- Keep the existing project explorer, project details, collaboration inbox, profile and support workspace.
- Keep the landing/preview page removed for now. We will rebuild it later from scratch with a proper design direction.
- Clean up the code structure so UI components, server APIs, database code and authentication code are clearly separated.
- Add a local environment setup guide with all required variables.
- Set up PostgreSQL locally and make Prisma migrations work.
- Add seed data so development always has realistic students, projects, roles and requests.
- Make sure the app builds, type-checks and has a basic smoke test before every major phase.

### Done means

- A new developer can clone the project, configure environment variables, run migrations and start the app.
- No screen depends only on hard-coded mock data unless it is clearly labelled demo data.
- We have a safe database migration path before real community data is added.

## Phase 1 — Identity and access

**Goal:** Every person using the platform has a real account and the correct access level.

### What we will build

- Finish Better Auth with a real database connection.
- Sign up, sign in, sign out and persistent sessions.
- I2IT college-email verification flow.
- Student profile editing: name, bio, branch/year, skills, interests and availability.
- User roles: student, project owner, maintainer, reviewer, moderator and admin.
- Protected pages and protected APIs. A user should never be able to edit someone else’s project by changing a URL or request.
- GitHub account connect/disconnect UI, initially with OAuth only.

### Important decisions

- We should support any student project, but college-only features should require a verified I2IT identity.
- Platform roles must stay different from GitHub repository permissions. Accepting someone as a contributor here must not automatically give them GitHub write access.

### Done means

- A signed-in user can edit only their own profile.
- A user can create a project under their account.
- An unverified or signed-out user cannot use protected actions.

## Phase 2 — Real project directory

**Goal:** Turn the current project UI into a real, searchable campus directory.

### What we will build

- Database-backed project creation, editing, viewing and archiving.
- Project fields: summary, problem statement, maturity, tags, skills, team needs, repository link, license, contribution guide and links.
- Support for idea-stage projects without a repository.
- Project visibility: campus-only, public and private draft.
- Project ownership and maintainer management.
- Search, filters and server-side pagination.
- Project status and last-updated information.
- Clear contribution entry points: “join this role”, “pick this issue”, or “contact maintainer”.

### Done means

- A project remains after refresh and is visible only to the intended audience.
- Owners can edit/archive their projects.
- Students can find projects by skill, status, category and project maturity.

## Phase 3 — Collaboration workflow

**Goal:** Make joining a project feel organized and respectful instead of random DMs.

### What we will build

- Persistent collaboration requests linked to a project, role and optional GitHub issue.
- Maintainer inbox with accept, decline and request-changes actions.
- Request history and status timeline.
- Platform project roles: owner, maintainer, contributor, designer, tester and mentor.
- Project task board for platform-managed tasks when a GitHub issue is not available.
- In-app notifications for new requests and decisions.
- Rate limiting and basic anti-spam rules.

### Done means

- A student can apply to a project and see their request status.
- A maintainer can safely manage requests only for their own project.
- Both people receive a clear in-app update when the status changes.

## Phase 4 — GitHub integration and verified contribution evidence

**Goal:** Make the platform trustworthy by showing real work, not only self-reported work.

### What we will build

- Create a GitHub App with only the permissions we actually need.
- GitHub OAuth account linking.
- Secure webhook endpoint with signature verification.
- Store webhook delivery IDs so duplicate events are safe.
- Sync pull requests, merged PRs, commits, code reviews and issue activity as verified contribution records.
- Handle API errors, retries, GitHub rate limits and out-of-order events.
- Show source and verification state clearly on profile contributions.
- Basic GitHub sync health page for admins later in the phase.

### Important rule

We should never mark a contribution as verified just because someone typed it into a form. Verified contribution history must come from GitHub events or a clear approved verification process.

### Done means

- A merged PR on a connected repository can appear as a verified contribution.
- Duplicate webhooks do not create duplicate records.
- A broken GitHub sync does not break the rest of the platform.

## Phase 5 — Community support program

**Goal:** Give promising projects a transparent route to mentorship, support and official community backing.

### What we will build

- Proper support application form with problem, audience, project maturity, team, evidence, requested support, risks, milestones, repository and license.
- Support statuses: submitted, under review, changes requested, approved, declined, withdrawn and deferred.
- Reviewer workspace with review criteria, rationale, timestamps and reviewer records.
- Conflict-of-interest declaration before a review decision.
- Separate workflow for support after approval. Admission to the program should not mean every resource is automatically granted.
- GitHub Organization admission/transfer checklist.
- Mentor assignment and project health check-ins.
- Structured handover request process for paused or stalled projects.

### Done means

- A project owner sees exactly where their application stands.
- Review decisions are auditable and explainable.
- A stalled project is never taken away from an owner automatically.

## Phase 6 — Moderation, safety and operations

**Goal:** Make this safe enough to run for a real campus community.

### What we will build

- Report flows for abuse, impersonation, unsafe content and project disputes.
- Moderator queue with decisions and rationale.
- Audit log for sensitive actions: role changes, project archive, support decisions and moderation actions.
- Admin roles and route/API protection.
- Notification preferences and mute controls.
- Structured logs with sensitive data redacted.
- Production health/readiness checks, backups, restore test and deployment runbook.
- Basic metrics: sign-ups, active projects, applications, search-to-project view rate and GitHub sync failures.

### Done means

- Moderators can investigate a report without needing direct database access.
- We can trace who made important decisions and when.
- We can recover the database and know the app is healthy after deployment.

## Phase 7 — Public landing page and community storytelling

**Goal:** Rebuild the landing page only after the product has real content and a clear story.

### What it should show

- What I2IT Dev Community is and who it is for.
- Active projects, open roles and beginner-friendly contributions.
- Community outcomes: contributions, shipped projects, mentors and teams.
- Space for founders, core team, faculty mentors and community management.
- Project showcase, upcoming events and community partners.
- Strong calls to action: explore projects, create a project, join the community.

### Design direction

- Clean, editorial, high-confidence design instead of a generic dashboard hero.
- Use motion and interactive elements only where they explain the network of people and projects.
- Keep it fast and accessible on student laptops and mobile.
- Build the visual language around the real community, not stock “tech startup” visuals.

## What we should build first

I would start with **Phase 0, then Phase 1, then the first half of Phase 2**.

The first working milestone should be small and real:

1. Student signs up with email and signs in.
2. Student completes a profile.
3. Student creates a project.
4. Another student can see it in the directory.
5. Data remains after refresh.

After that, we should build collaboration requests. That is the most important community action and gives the platform a real reason to exist.

GitHub webhooks, support reviews and the public landing page should come after the basic community loop is working end-to-end.

## Suggested delivery milestones

| Milestone | Outcome |
| --- | --- |
| M1 — Foundation | Database, migrations, environment guide, stable app setup |
| M2 — Accounts | Real sign-up, sign-in, profiles and permissions |
| M3 — Directory | Persistent projects, search, filters, project ownership |
| M4 — Collaboration | Requests, maintainer inbox, notifications |
| M5 — GitHub trust layer | OAuth, webhooks and verified contribution history |
| M6 — Community program | Support applications, reviews, mentors and handovers |
| M7 — Campus launch layer | Moderation, operations, metrics and public landing page |

## Things we should not do too early

- Do not spend more time on the landing page before the core user journey works.
- Do not build a custom Git hosting system, issue tracker or pull-request system.
- Do not add leaderboards before contribution evidence is reliable.
- Do not give automatic GitHub Organization access based only on a platform action.
- Do not collect private GitHub data we do not need.

## Definition of a good first launch

The first real launch is successful if an I2IT student can join, publish a project or discover one, ask to contribute, receive a response, and show a verified contribution — without the community team manually managing everything in DMs or spreadsheets.
