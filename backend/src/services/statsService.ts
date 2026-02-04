import { PrismaClient } from '@prisma/client'
import type { AnswerData } from '../types/index.js'

const prisma = new PrismaClient()

export interface QuestionStats {
  questionId: string
  totalAttempts: number
  correctCount: number
  successRate: number
}

export interface RankingResult {
  relativeScore: number
  percentile: number
  totalCandidates: number
  rank: number
}

/**
 * Calculate success rate for a specific question based on all completed exam sessions
 */
export async function getQuestionStats(questionId: string): Promise<QuestionStats> {
  // Get all completed exam sessions that include this question
  const sessions = await prisma.examSession.findMany({
    where: {
      status: 'completed',
      questionIds: { has: questionId }
    },
    select: {
      answers: true
    }
  })

  let totalAttempts = 0
  let correctCount = 0

  // Get the correct answer for this question
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: { correctAnswer: true }
  })

  if (!question) {
    return {
      questionId,
      totalAttempts: 0,
      correctCount: 0,
      successRate: 0.5 // Default to 50% for questions with no data
    }
  }

  for (const session of sessions) {
    const answers = session.answers as unknown as Record<string, AnswerData>
    const answer = answers[questionId]

    if (answer && answer.selected !== null) {
      totalAttempts++
      if (answer.selected === question.correctAnswer) {
        correctCount++
      }
    }
  }

  // Default to 50% success rate if no attempts (neutral difficulty)
  const successRate = totalAttempts > 0 ? correctCount / totalAttempts : 0.5

  return {
    questionId,
    totalAttempts,
    correctCount,
    successRate
  }
}

/**
 * Get success rates for multiple questions (batch operation for efficiency)
 */
export async function getQuestionStatsMultiple(questionIds: string[]): Promise<Map<string, QuestionStats>> {
  // Get all completed exam sessions that include any of these questions
  const sessions = await prisma.examSession.findMany({
    where: {
      status: 'completed'
    },
    select: {
      questionIds: true,
      answers: true
    }
  })

  // Get correct answers for all questions
  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds } },
    select: { id: true, correctAnswer: true }
  })

  const correctAnswerMap = new Map(questions.map(q => [q.id, q.correctAnswer]))

  // Initialize stats for all questions
  const statsMap = new Map<string, { totalAttempts: number; correctCount: number }>()
  for (const qId of questionIds) {
    statsMap.set(qId, { totalAttempts: 0, correctCount: 0 })
  }

  // Process all sessions
  for (const session of sessions) {
    const answers = session.answers as unknown as Record<string, AnswerData>

    for (const qId of questionIds) {
      if (session.questionIds.includes(qId)) {
        const answer = answers[qId]
        const stats = statsMap.get(qId)!

        if (answer && answer.selected !== null) {
          stats.totalAttempts++
          if (answer.selected === correctAnswerMap.get(qId)) {
            stats.correctCount++
          }
        }
      }
    }
  }

  // Convert to final result format
  const result = new Map<string, QuestionStats>()
  for (const [qId, stats] of statsMap) {
    result.set(qId, {
      questionId: qId,
      totalAttempts: stats.totalAttempts,
      correctCount: stats.correctCount,
      successRate: stats.totalAttempts > 0 ? stats.correctCount / stats.totalAttempts : 0.5
    })
  }

  return result
}

/**
 * Calculate difficulty-weighted relative score for a single exam session
 * Returns the average question score based on the formula:
 * - Correct: +(1 - successRate) — harder questions worth more
 * - Wrong: -(successRate) — easier questions penalise more
 */
export async function calculateRelativeScore(sessionId: string): Promise<number | null> {
  const session = await prisma.examSession.findUnique({
    where: { id: sessionId }
  })

  if (!session || session.status !== 'completed') {
    return null
  }

  const answers = session.answers as unknown as Record<string, AnswerData>
  const questionIds = session.questionIds

  // Get stats for all questions in this exam
  const statsMap = await getQuestionStatsMultiple(questionIds)

  // Get correct answers
  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds } },
    select: { id: true, correctAnswer: true }
  })
  const correctAnswerMap = new Map(questions.map(q => [q.id, q.correctAnswer]))

  let totalScore = 0
  let questionsScored = 0

  for (const qId of questionIds) {
    const answer = answers[qId]
    const stats = statsMap.get(qId)

    if (!stats) continue

    const successRate = stats.successRate
    const isCorrect = answer?.selected === correctAnswerMap.get(qId)

    let questionScore: number
    if (answer?.selected === null || answer?.selected === undefined) {
      // Unanswered questions treated as wrong
      questionScore = -successRate
    } else if (isCorrect) {
      // Correct: +(1 - successRate)
      questionScore = 1 - successRate
    } else {
      // Wrong: -(successRate)
      questionScore = -successRate
    }

    totalScore += questionScore
    questionsScored++
  }

  if (questionsScored === 0) return 0

  return totalScore / questionsScored
}

/**
 * Calculate relative scores for ALL completed exam sessions
 * Used to determine percentile ranking
 */
async function getAllRelativeScores(): Promise<Map<string, number>> {
  const sessions = await prisma.examSession.findMany({
    where: { status: 'completed' },
    select: {
      id: true,
      questionIds: true,
      answers: true
    }
  })

  if (sessions.length === 0) {
    return new Map()
  }

  // Get all unique question IDs
  const allQuestionIds = new Set<string>()
  for (const session of sessions) {
    for (const qId of session.questionIds) {
      allQuestionIds.add(qId)
    }
  }

  // Get stats for all questions
  const statsMap = await getQuestionStatsMultiple(Array.from(allQuestionIds))

  // Get correct answers for all questions
  const questions = await prisma.question.findMany({
    where: { id: { in: Array.from(allQuestionIds) } },
    select: { id: true, correctAnswer: true }
  })
  const correctAnswerMap = new Map(questions.map(q => [q.id, q.correctAnswer]))

  // Calculate score for each session
  const scores = new Map<string, number>()

  for (const session of sessions) {
    const answers = session.answers as unknown as Record<string, AnswerData>
    let totalScore = 0
    let questionsScored = 0

    for (const qId of session.questionIds) {
      const answer = answers[qId]
      const stats = statsMap.get(qId)

      if (!stats) continue

      const successRate = stats.successRate
      const isCorrect = answer?.selected === correctAnswerMap.get(qId)

      let questionScore: number
      if (answer?.selected === null || answer?.selected === undefined) {
        questionScore = -successRate
      } else if (isCorrect) {
        questionScore = 1 - successRate
      } else {
        questionScore = -successRate
      }

      totalScore += questionScore
      questionsScored++
    }

    if (questionsScored > 0) {
      scores.set(session.id, totalScore / questionsScored)
    }
  }

  return scores
}

/**
 * Get ranking information for a specific exam session
 */
export async function getRanking(sessionId: string): Promise<RankingResult | null> {
  const session = await prisma.examSession.findUnique({
    where: { id: sessionId }
  })

  if (!session || session.status !== 'completed') {
    return null
  }

  // Get all relative scores
  const allScores = await getAllRelativeScores()

  const userScore = allScores.get(sessionId)
  if (userScore === undefined) {
    return null
  }

  // Convert to array and sort descending (higher is better)
  const scoreValues = Array.from(allScores.values())
  scoreValues.sort((a, b) => b - a)

  const totalCandidates = scoreValues.length

  // Count how many have a lower score (not lower or equal)
  const countBelow = scoreValues.filter(s => s < userScore).length

  // Percentile: percentage of candidates at or below this score
  // If you beat 80% of people, you're in the 80th percentile
  const percentile = Math.round((countBelow / totalCandidates) * 100)

  // Rank: 1 = best, find position in sorted array
  const rank = scoreValues.findIndex(s => s === userScore) + 1

  return {
    relativeScore: Math.round(userScore * 1000) / 1000, // Round to 3 decimal places
    percentile,
    totalCandidates,
    rank
  }
}
