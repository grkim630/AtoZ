/*
  Warnings:

  - A unique constraint covering the columns `[summaryId,type]` on the table `ExperienceScript` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ExperienceScript_summaryId_key";

-- CreateIndex
CREATE UNIQUE INDEX "ExperienceScript_summaryId_type_key" ON "ExperienceScript"("summaryId", "type");
