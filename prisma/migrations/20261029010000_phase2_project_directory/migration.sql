ALTER TABLE "Project"
  ADD COLUMN "problemStatement" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "maturity" TEXT NOT NULL DEFAULT 'idea',
  ADD COLUMN "tags" TEXT NOT NULL DEFAULT '[]',
  ADD COLUMN "skills" TEXT NOT NULL DEFAULT '[]',
  ADD COLUMN "teamNeeds" TEXT NOT NULL DEFAULT '[]',
  ADD COLUMN "license" TEXT,
  ADD COLUMN "contributionGuide" TEXT,
  ADD COLUMN "links" TEXT NOT NULL DEFAULT '[]',
  ADD COLUMN "archivedAt" TIMESTAMP(3);

CREATE TABLE "ProjectMember" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'contributor',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProjectMember_projectId_userId_key" ON "ProjectMember"("projectId", "userId");
CREATE INDEX "ProjectMember_userId_role_idx" ON "ProjectMember"("userId", "role");
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
