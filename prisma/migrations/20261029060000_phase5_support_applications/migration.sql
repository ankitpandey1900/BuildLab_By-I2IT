-- AlterTable
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "handoverFlagged" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "readme" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "SupportApplication" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "problem" TEXT NOT NULL DEFAULT '',
    "targetAudience" TEXT NOT NULL DEFAULT '',
    "requestedSupport" TEXT NOT NULL DEFAULT '[]',
    "risksAndMitigations" TEXT NOT NULL DEFAULT '',
    "nextMilestone" TEXT NOT NULL DEFAULT '',
    "reviewerNotes" TEXT,
    "reviewedBy" TEXT,
    "decisionDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "SupportApplication_projectId_key" ON "SupportApplication"("projectId");

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'SupportApplication_projectId_fkey'
    ) THEN
        ALTER TABLE "SupportApplication" ADD CONSTRAINT "SupportApplication_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
