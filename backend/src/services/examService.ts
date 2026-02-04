import { PrismaClient, Prisma } from '@prisma/client'
import * as questionService from './questionService.js'
import type {
  StartExamRequest,
  ExamSessionResponse,
  ExamResultsResponse,
  AnswerData,
  QuestionResult,
  SubtopicPerformance,
  DifficultyPerformance
} from '../types/index.js'

const prisma = new PrismaClient()

/**
 * Start a new exam session
 */
export async function startExam(request: StartExamRequest): Promise<ExamSessionResponse> {
  const { questionCount, subtopics, difficulties, timePerQuestion } = request

  // Select random questions based on criteria
  const questionIds = await questionService.selectQuestions({
    count: questionCount,
    subtopics,
    difficulties
  })

  const timeLimit = questionCount * timePerQuestion

  // Create exam session in database
  const session = await prisma.examSession.create({
    data: {
      questionIds,
      totalQuestions: questionCount,
      timeLimit,
      timeRemaining: timeLimit,
      answers: {},
      status: 'in_progress',
      subtopicFilter: subtopics || [],
      difficultyFilter: difficulties || []
    }
  })

  return {
    id: session.id,
    questionIds: session.questionIds,
    totalQuestions: session.totalQuestions,
    timeLimit: session.timeLimit,
    timeRemaining: session.timeRemaining || session.timeLimit,
    answers: (session.answers as unknown) as Record<string, AnswerData>,
    status: session.status as 'in_progress' | 'completed' | 'abandoned',
    startedAt: session.startedAt.toISOString(),
    completedAt: session.completedAt?.toISOString() || null
  }
}

/**
 * Get exam session by ID
 */
export async function getExamSession(sessionId: string): Promise<ExamSessionResponse | null> {
  const session = await prisma.examSession.findUnique({
    where: { id: sessionId }
  })

  if (!session) return null

  return {
    id: session.id,
    questionIds: session.questionIds,
    totalQuestions: session.totalQuestions,
    timeLimit: session.timeLimit,
    timeRemaining: session.timeRemaining || session.timeLimit,
    answers: (session.answers as unknown) as Record<string, AnswerData>,
    status: session.status as 'in_progress' | 'completed' | 'abandoned',
    startedAt: session.startedAt.toISOString(),
    completedAt: session.completedAt?.toISOString() || null
  }
}

/**
 * Submit an answer for a question
 */
export async function submitAnswer(
  sessionId: string,
  questionId: string,
  selected: 'A' | 'B' | 'C' | 'D' | 'E' | null,
  timeSpent?: number
): Promise<ExamSessionResponse | null> {
  const session = await prisma.examSession.findUnique({
    where: { id: sessionId }
  })

  if (!session || session.status !== 'in_progress') return null

  // Update answers
  const answers = (session.answers as unknown) as Record<string, AnswerData>
  const existing = answers[questionId] || { selected: null, flagged: false, timeSpent: 0 }

  answers[questionId] = {
    ...existing,
    selected,
    timeSpent: timeSpent ?? existing.timeSpent
  }

  const updated = await prisma.examSession.update({
    where: { id: sessionId },
    data: { answers: answers as unknown as Prisma.InputJsonValue }
  })

  return {
    id: updated.id,
    questionIds: updated.questionIds,
    totalQuestions: updated.totalQuestions,
    timeLimit: updated.timeLimit,
    timeRemaining: updated.timeRemaining || updated.timeLimit,
    answers: (updated.answers as unknown) as Record<string, AnswerData>,
    status: updated.status as 'in_progress' | 'completed' | 'abandoned',
    startedAt: updated.startedAt.toISOString(),
    completedAt: updated.completedAt?.toISOString() || null
  }
}

/**
 * Toggle flag for a question
 */
export async function toggleFlag(
  sessionId: string,
  questionId: string,
  flagged: boolean
): Promise<ExamSessionResponse | null> {
  const session = await prisma.examSession.findUnique({
    where: { id: sessionId }
  })

  if (!session || session.status !== 'in_progress') return null

  const answers = (session.answers as unknown) as Record<string, AnswerData>
  const existing = answers[questionId] || { selected: null, flagged: false, timeSpent: 0 }

  answers[questionId] = {
    ...existing,
    flagged
  }

  const updated = await prisma.examSession.update({
    where: { id: sessionId },
    data: { answers: answers as unknown as Prisma.InputJsonValue }
  })

  return {
    id: updated.id,
    questionIds: updated.questionIds,
    totalQuestions: updated.totalQuestions,
    timeLimit: updated.timeLimit,
    timeRemaining: updated.timeRemaining || updated.timeLimit,
    answers: (updated.answers as unknown) as Record<string, AnswerData>,
    status: updated.status as 'in_progress' | 'completed' | 'abandoned',
    startedAt: updated.startedAt.toISOString(),
    completedAt: updated.completedAt?.toISOString() || null
  }
}

/**
 * Update remaining time
 */
export async function updateTimeRemaining(
  sessionId: string,
  timeRemaining: number
): Promise<void> {
  await prisma.examSession.update({
    where: { id: sessionId },
    data: { timeRemaining }
  })
}

/**
 * Complete an exam and calculate results
 */
export async function completeExam(
  sessionId: string,
  timeRemaining?: number
): Promise<ExamResultsResponse | null> {
  const session = await prisma.examSession.findUnique({
    where: { id: sessionId }
  })

  if (!session) return null

  // Get all questions with answers
  const questions = await questionService.getQuestionsWithAnswers(session.questionIds)
  const answers = (session.answers as unknown) as Record<string, AnswerData>

  // Calculate score
  let score = 0
  const questionResults: QuestionResult[] = []
  const subtopicStats: Record<string, { correct: number; total: number }> = {}
  const difficultyStats: Record<string, { correct: number; total: number }> = {}

  for (const question of questions) {
    const answer = answers[question.id]
    const isCorrect = answer?.selected === question.correctAnswer

    if (isCorrect) score++

    // Track subtopic performance
    if (!subtopicStats[question.subtopic]) {
      subtopicStats[question.subtopic] = { correct: 0, total: 0 }
    }
    subtopicStats[question.subtopic].total++
    if (isCorrect) subtopicStats[question.subtopic].correct++

    // Track difficulty performance
    if (!difficultyStats[question.difficulty]) {
      difficultyStats[question.difficulty] = { correct: 0, total: 0 }
    }
    difficultyStats[question.difficulty].total++
    if (isCorrect) difficultyStats[question.difficulty].correct++

    questionResults.push({
      id: question.id,
      stem: question.stem,
      options: {
        A: question.optionA,
        B: question.optionB,
        C: question.optionC,
        D: question.optionD,
        E: question.optionE
      },
      correctAnswer: question.correctAnswer as 'A' | 'B' | 'C' | 'D' | 'E',
      selectedAnswer: answer?.selected || null,
      isCorrect,
      flagged: answer?.flagged || false,
      explanation: question.explanation,
      explanationMatrix: question.explanationMatrix as Record<string, unknown>,
      subtopic: question.subtopic,
      difficulty: question.difficulty,
      learningPoint: question.learningPoint
    })
  }

  const percentage = Math.round((score / session.totalQuestions) * 100)
  const timeTaken = session.timeLimit - (timeRemaining ?? 0)

  // Update session as completed
  await prisma.examSession.update({
    where: { id: sessionId },
    data: {
      status: 'completed',
      score,
      percentage,
      timeRemaining: timeRemaining ?? 0,
      completedAt: new Date()
    }
  })

  // Build performance arrays
  const subtopicPerformance: SubtopicPerformance[] = Object.entries(subtopicStats)
    .map(([subtopic, stats]) => ({
      subtopic,
      correct: stats.correct,
      total: stats.total,
      percentage: Math.round((stats.correct / stats.total) * 100)
    }))
    .sort((a, b) => a.subtopic.localeCompare(b.subtopic))

  const difficultyPerformance: DifficultyPerformance[] = Object.entries(difficultyStats)
    .map(([difficulty, stats]) => ({
      difficulty,
      correct: stats.correct,
      total: stats.total,
      percentage: Math.round((stats.correct / stats.total) * 100)
    }))
    .sort((a, b) => {
      const order = { medium: 0, hard: 1, very_hard: 2 }
      return (order[a.difficulty as keyof typeof order] || 0) - (order[b.difficulty as keyof typeof order] || 0)
    })

  return {
    sessionId: session.id,
    score,
    totalQuestions: session.totalQuestions,
    percentage,
    timeTaken,
    timeLimit: session.timeLimit,
    questions: questionResults,
    subtopicPerformance,
    difficultyPerformance
  }
}

/**
 * Get results for a completed exam
 */
export async function getExamResults(sessionId: string): Promise<ExamResultsResponse | null> {
  const session = await prisma.examSession.findUnique({
    where: { id: sessionId }
  })

  if (!session || session.status !== 'completed') return null

  // Get all questions with answers
  const questions = await questionService.getQuestionsWithAnswers(session.questionIds)
  const answers = (session.answers as unknown) as Record<string, AnswerData>

  const questionResults: QuestionResult[] = []
  const subtopicStats: Record<string, { correct: number; total: number }> = {}
  const difficultyStats: Record<string, { correct: number; total: number }> = {}

  for (const question of questions) {
    const answer = answers[question.id]
    const isCorrect = answer?.selected === question.correctAnswer

    // Track subtopic performance
    if (!subtopicStats[question.subtopic]) {
      subtopicStats[question.subtopic] = { correct: 0, total: 0 }
    }
    subtopicStats[question.subtopic].total++
    if (isCorrect) subtopicStats[question.subtopic].correct++

    // Track difficulty performance
    if (!difficultyStats[question.difficulty]) {
      difficultyStats[question.difficulty] = { correct: 0, total: 0 }
    }
    difficultyStats[question.difficulty].total++
    if (isCorrect) difficultyStats[question.difficulty].correct++

    questionResults.push({
      id: question.id,
      stem: question.stem,
      options: {
        A: question.optionA,
        B: question.optionB,
        C: question.optionC,
        D: question.optionD,
        E: question.optionE
      },
      correctAnswer: question.correctAnswer as 'A' | 'B' | 'C' | 'D' | 'E',
      selectedAnswer: answer?.selected || null,
      isCorrect,
      flagged: answer?.flagged || false,
      explanation: question.explanation,
      explanationMatrix: question.explanationMatrix as Record<string, unknown>,
      subtopic: question.subtopic,
      difficulty: question.difficulty,
      learningPoint: question.learningPoint
    })
  }

  const subtopicPerformance: SubtopicPerformance[] = Object.entries(subtopicStats)
    .map(([subtopic, stats]) => ({
      subtopic,
      correct: stats.correct,
      total: stats.total,
      percentage: Math.round((stats.correct / stats.total) * 100)
    }))
    .sort((a, b) => a.subtopic.localeCompare(b.subtopic))

  const difficultyPerformance: DifficultyPerformance[] = Object.entries(difficultyStats)
    .map(([difficulty, stats]) => ({
      difficulty,
      correct: stats.correct,
      total: stats.total,
      percentage: Math.round((stats.correct / stats.total) * 100)
    }))

  return {
    sessionId: session.id,
    score: session.score || 0,
    totalQuestions: session.totalQuestions,
    percentage: session.percentage || 0,
    timeTaken: session.timeLimit - (session.timeRemaining || 0),
    timeLimit: session.timeLimit,
    questions: questionResults,
    subtopicPerformance,
    difficultyPerformance
  }
}
