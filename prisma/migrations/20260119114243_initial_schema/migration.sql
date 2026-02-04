-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'inactive',
    "subscriptionEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "stem" TEXT NOT NULL,
    "optionA" TEXT NOT NULL,
    "optionB" TEXT NOT NULL,
    "optionC" TEXT NOT NULL,
    "optionD" TEXT NOT NULL,
    "optionE" TEXT NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "explanationMatrix" JSONB NOT NULL,
    "subtopic" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "modality" TEXT,
    "learningPoint" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "questionIds" TEXT[],
    "totalQuestions" INTEGER NOT NULL,
    "timeLimit" INTEGER NOT NULL,
    "timeRemaining" INTEGER,
    "answers" JSONB NOT NULL DEFAULT '{}',
    "score" INTEGER,
    "percentage" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "subtopicFilter" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficultyFilter" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "ExamSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subtopic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "questionCount" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT,

    CONSTRAINT "Subtopic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_subscriptionStatus_idx" ON "User"("subscriptionStatus");

-- CreateIndex
CREATE INDEX "Question_subtopic_idx" ON "Question"("subtopic");

-- CreateIndex
CREATE INDEX "Question_difficulty_idx" ON "Question"("difficulty");

-- CreateIndex
CREATE INDEX "Question_modality_idx" ON "Question"("modality");

-- CreateIndex
CREATE INDEX "Question_subtopic_difficulty_idx" ON "Question"("subtopic", "difficulty");

-- CreateIndex
CREATE INDEX "ExamSession_userId_idx" ON "ExamSession"("userId");

-- CreateIndex
CREATE INDEX "ExamSession_status_idx" ON "ExamSession"("status");

-- CreateIndex
CREATE INDEX "ExamSession_startedAt_idx" ON "ExamSession"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Subtopic_name_key" ON "Subtopic"("name");

-- CreateIndex
CREATE INDEX "Subtopic_name_idx" ON "Subtopic"("name");

-- CreateIndex
CREATE INDEX "Subtopic_category_idx" ON "Subtopic"("category");

-- AddForeignKey
ALTER TABLE "ExamSession" ADD CONSTRAINT "ExamSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
