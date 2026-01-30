-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "UploadType" AS ENUM ('VOICE', 'IMAGE', 'TEXT');

-- CreateEnum
CREATE TYPE "ScriptType" AS ENUM ('CHAT', 'CALL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UploadedFile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "UploadType" NOT NULL,
    "originalName" TEXT NOT NULL,
    "storedPath" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UploadedFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtractedText" (
    "id" TEXT NOT NULL,
    "uploadedFileId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "cleanText" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "keywords" JSONB NOT NULL,
    "signals" JSONB NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExtractedText_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Summary" (
    "id" TEXT NOT NULL,
    "extractedTextId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "keywords" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Summary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperienceScript" (
    "id" TEXT NOT NULL,
    "summaryId" TEXT NOT NULL,
    "type" "ScriptType" NOT NULL,
    "script" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExperienceScript_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TtsFile" (
    "id" TEXT NOT NULL,
    "scriptId" TEXT NOT NULL,
    "storedPath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TtsFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperienceLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scriptId" TEXT NOT NULL,
    "ttsFileId" TEXT,
    "log" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExperienceLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ExtractedText_uploadedFileId_key" ON "ExtractedText"("uploadedFileId");

-- CreateIndex
CREATE UNIQUE INDEX "Summary_extractedTextId_key" ON "Summary"("extractedTextId");

-- CreateIndex
CREATE UNIQUE INDEX "ExperienceScript_summaryId_key" ON "ExperienceScript"("summaryId");

-- CreateIndex
CREATE UNIQUE INDEX "TtsFile_scriptId_key" ON "TtsFile"("scriptId");

-- AddForeignKey
ALTER TABLE "UploadedFile" ADD CONSTRAINT "UploadedFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtractedText" ADD CONSTRAINT "ExtractedText_uploadedFileId_fkey" FOREIGN KEY ("uploadedFileId") REFERENCES "UploadedFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Summary" ADD CONSTRAINT "Summary_extractedTextId_fkey" FOREIGN KEY ("extractedTextId") REFERENCES "ExtractedText"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperienceScript" ADD CONSTRAINT "ExperienceScript_summaryId_fkey" FOREIGN KEY ("summaryId") REFERENCES "Summary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TtsFile" ADD CONSTRAINT "TtsFile_scriptId_fkey" FOREIGN KEY ("scriptId") REFERENCES "ExperienceScript"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperienceLog" ADD CONSTRAINT "ExperienceLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperienceLog" ADD CONSTRAINT "ExperienceLog_scriptId_fkey" FOREIGN KEY ("scriptId") REFERENCES "ExperienceScript"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperienceLog" ADD CONSTRAINT "ExperienceLog_ttsFileId_fkey" FOREIGN KEY ("ttsFileId") REFERENCES "TtsFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
