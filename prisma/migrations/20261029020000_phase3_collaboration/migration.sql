CREATE TABLE "CollaborationRequest" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "issueUrl" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CollaborationRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CollaborationActivity" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CollaborationActivity_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CollaborationRequest_projectId_status_createdAt_idx" ON "CollaborationRequest"("projectId", "status", "createdAt");
CREATE INDEX "CollaborationRequest_applicantId_createdAt_idx" ON "CollaborationRequest"("applicantId", "createdAt");
CREATE INDEX "CollaborationActivity_requestId_createdAt_idx" ON "CollaborationActivity"("requestId", "createdAt");
ALTER TABLE "CollaborationRequest" ADD CONSTRAINT "CollaborationRequest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CollaborationRequest" ADD CONSTRAINT "CollaborationRequest_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CollaborationActivity" ADD CONSTRAINT "CollaborationActivity_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "CollaborationRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CollaborationActivity" ADD CONSTRAINT "CollaborationActivity_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
