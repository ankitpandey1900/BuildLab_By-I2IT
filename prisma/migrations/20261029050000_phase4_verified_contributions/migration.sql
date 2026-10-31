-- AlterTable
ALTER TABLE "WebhookDelivery" ADD COLUMN IF NOT EXISTS "error" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "VerifiedContribution" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "repo" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'github_webhook',
    "verifiedByGitHub" BOOLEAN NOT NULL DEFAULT true,
    "externalUrl" TEXT,
    "sha" TEXT,
    "deliveryId" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerifiedContribution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "VerifiedContribution_userId_createdAt_idx" ON "VerifiedContribution"("userId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "VerifiedContribution_projectId_idx" ON "VerifiedContribution"("projectId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "VerifiedContribution_repo_idx" ON "VerifiedContribution"("repo");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "VerifiedContribution_deliveryId_idx" ON "VerifiedContribution"("deliveryId");

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'VerifiedContribution_userId_fkey'
    ) THEN
        ALTER TABLE "VerifiedContribution" ADD CONSTRAINT "VerifiedContribution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'VerifiedContribution_projectId_fkey'
    ) THEN
        ALTER TABLE "VerifiedContribution" ADD CONSTRAINT "VerifiedContribution_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

