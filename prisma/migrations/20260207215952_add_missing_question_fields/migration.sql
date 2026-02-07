-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "ageGroup" TEXT,
ADD COLUMN     "clinicalContext" TEXT,
ADD COLUMN     "discriminatorUsed" TEXT,
ADD COLUMN     "imagingPhase" TEXT,
ADD COLUMN     "module" TEXT,
ADD COLUMN     "questionType" TEXT,
ADD COLUMN     "system" TEXT,
ADD COLUMN     "task" TEXT;

-- CreateIndex
CREATE INDEX "Question_module_idx" ON "Question"("module");

-- CreateIndex
CREATE INDEX "Question_system_idx" ON "Question"("system");

-- CreateIndex
CREATE INDEX "Question_ageGroup_idx" ON "Question"("ageGroup");

-- CreateIndex
CREATE INDEX "Question_questionType_idx" ON "Question"("questionType");
