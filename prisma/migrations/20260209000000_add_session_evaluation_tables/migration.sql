-- CreateEnum
CREATE TYPE "SessionChannel" AS ENUM ('CHAT', 'CALL');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "MessageSpeaker" AS ENUM ('USER', 'AGENT');

-- CreateEnum
CREATE TYPE "ActionEventType" AS ENUM ('CHOICE', 'INPUT', 'HANGUP', 'REPORT');

-- CreateEnum
CREATE TYPE "CategoryCode" AS ENUM ('DETECT_SIGNAL', 'REFUSE_REQUEST', 'VERIFY_IDENTITY', 'REPORTING');

-- CreateEnum
CREATE TYPE "ScoreLabel" AS ENUM ('A', 'B', 'C', 'D', 'E');

-- CreateEnum
CREATE TYPE "FeedbackQualityFlag" AS ENUM ('HIGH_CONFIDENCE', 'NEEDS_REVIEW');

-- CreateTable
CREATE TABLE "ExperienceSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scriptId" TEXT NOT NULL,
    "channel" "SessionChannel" NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "scriptVersion" INTEGER,
    "llmModelVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExperienceSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionMessageLog" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "turnIndex" INTEGER NOT NULL,
    "speaker" "MessageSpeaker" NOT NULL,
    "text" TEXT NOT NULL,
    "maskedText" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionMessageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionActionEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "eventType" "ActionEventType" NOT NULL,
    "actionCode" TEXT NOT NULL,
    "riskWeight" DOUBLE PRECISION NOT NULL,
    "stepNo" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionActionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LlmBehaviorEvaluation" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "outputJson" JSONB NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LlmBehaviorEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyResponse" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "answersJson" JSONB NOT NULL,
    "isSkipped" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SurveyResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionCategoryScore" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "categoryCode" "CategoryCode" NOT NULL,
    "behaviorScore" INTEGER NOT NULL,
    "llmScore" INTEGER NOT NULL,
    "surveyScore" INTEGER,
    "finalScore" INTEGER NOT NULL,
    "label" "ScoreLabel" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionCategoryScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LlmFeedbackDataset" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "inputFeaturesJson" JSONB NOT NULL,
    "targetLabelJson" JSONB NOT NULL,
    "qualityFlag" "FeedbackQualityFlag" NOT NULL,
    "reviewerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LlmFeedbackDataset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExperienceSession_userId_createdAt_idx" ON "ExperienceSession"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ExperienceSession_scriptId_createdAt_idx" ON "ExperienceSession"("scriptId", "createdAt");

-- CreateIndex
CREATE INDEX "ExperienceSession_status_createdAt_idx" ON "ExperienceSession"("status", "createdAt");

-- CreateIndex
CREATE INDEX "SessionMessageLog_sessionId_turnIndex_idx" ON "SessionMessageLog"("sessionId", "turnIndex");

-- CreateIndex
CREATE INDEX "SessionMessageLog_sessionId_timestamp_idx" ON "SessionMessageLog"("sessionId", "timestamp");

-- CreateIndex
CREATE INDEX "SessionActionEvent_sessionId_timestamp_idx" ON "SessionActionEvent"("sessionId", "timestamp");

-- CreateIndex
CREATE INDEX "SessionActionEvent_sessionId_eventType_idx" ON "SessionActionEvent"("sessionId", "eventType");

-- CreateIndex
CREATE INDEX "SessionActionEvent_actionCode_createdAt_idx" ON "SessionActionEvent"("actionCode", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LlmBehaviorEvaluation_sessionId_key" ON "LlmBehaviorEvaluation"("sessionId");

-- CreateIndex
CREATE INDEX "LlmBehaviorEvaluation_createdAt_idx" ON "LlmBehaviorEvaluation"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyResponse_sessionId_key" ON "SurveyResponse"("sessionId");

-- CreateIndex
CREATE INDEX "SurveyResponse_submittedAt_idx" ON "SurveyResponse"("submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SessionCategoryScore_sessionId_categoryCode_key" ON "SessionCategoryScore"("sessionId", "categoryCode");

-- CreateIndex
CREATE INDEX "SessionCategoryScore_categoryCode_finalScore_idx" ON "SessionCategoryScore"("categoryCode", "finalScore");

-- CreateIndex
CREATE INDEX "LlmFeedbackDataset_sessionId_createdAt_idx" ON "LlmFeedbackDataset"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "LlmFeedbackDataset_qualityFlag_createdAt_idx" ON "LlmFeedbackDataset"("qualityFlag", "createdAt");

-- AddForeignKey
ALTER TABLE "ExperienceSession" ADD CONSTRAINT "ExperienceSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperienceSession" ADD CONSTRAINT "ExperienceSession_scriptId_fkey" FOREIGN KEY ("scriptId") REFERENCES "ExperienceScript"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionMessageLog" ADD CONSTRAINT "SessionMessageLog_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ExperienceSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionActionEvent" ADD CONSTRAINT "SessionActionEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ExperienceSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LlmBehaviorEvaluation" ADD CONSTRAINT "LlmBehaviorEvaluation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ExperienceSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ExperienceSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionCategoryScore" ADD CONSTRAINT "SessionCategoryScore_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ExperienceSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LlmFeedbackDataset" ADD CONSTRAINT "LlmFeedbackDataset_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ExperienceSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
