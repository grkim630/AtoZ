-- CreateEnum
CREATE TYPE "EvaluationJobStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "SessionEvaluationJob" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "status" "EvaluationJobStatus" NOT NULL DEFAULT 'QUEUED',
    "errorMessage" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionEvaluationJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SessionEvaluationJob_sessionId_createdAt_idx" ON "SessionEvaluationJob"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "SessionEvaluationJob_status_createdAt_idx" ON "SessionEvaluationJob"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "SessionEvaluationJob" ADD CONSTRAINT "SessionEvaluationJob_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ExperienceSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
