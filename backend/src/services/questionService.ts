import { PrismaClient } from '@prisma/client'
import type { QuestionResponse, SubtopicInfo } from '../types/index.js'

const prisma = new PrismaClient()

export interface QuestionSelectionOptions {
  count: number
  subtopics?: string[]
  difficulties?: ('medium' | 'hard' | 'very_hard')[]
}

/**
 * Select random questions based on criteria
 */
export async function selectQuestions(options: QuestionSelectionOptions): Promise<string[]> {
  const { count, subtopics, difficulties } = options

  // Build where clause
  const where: Record<string, unknown> = {}

  if (subtopics && subtopics.length > 0) {
    where.subtopic = { in: subtopics }
  }

  if (difficulties && difficulties.length > 0) {
    where.difficulty = { in: difficulties }
  }

  // Get total count of matching questions
  const totalMatching = await prisma.question.count({ where })

  if (totalMatching < count) {
    throw new Error(`Not enough questions matching criteria. Found ${totalMatching}, need ${count}`)
  }

  // Get random questions using a random offset approach
  // For better randomness, we fetch all IDs and shuffle
  const allIds = await prisma.question.findMany({
    where,
    select: { id: true }
  })

  // Fisher-Yates shuffle
  const shuffled = [...allIds]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled.slice(0, count).map(q => q.id)
}

/**
 * Get questions by IDs (for exam display)
 */
export async function getQuestionsForExam(questionIds: string[]): Promise<QuestionResponse[]> {
  const questions = await prisma.question.findMany({
    where: {
      id: { in: questionIds }
    },
    select: {
      id: true,
      stem: true,
      optionA: true,
      optionB: true,
      optionC: true,
      optionD: true,
      optionE: true,
      subtopic: true,
      difficulty: true,
      modality: true,
      // V5 New Fields
      module: true,
      system: true,
      ageGroup: true,
      clinicalContext: true,
      questionType: true,
      imagingPhase: true,
      task: true
      // Note: We don't include correctAnswer or explanation during exam
    }
  })

  // Maintain the order of questionIds
  const questionMap = new Map(questions.map(q => [q.id, q]))
  return questionIds.map(id => questionMap.get(id)!).filter(Boolean)
}

/**
 * Get full question data (for results)
 */
export async function getQuestionsWithAnswers(questionIds: string[]) {
  const questions = await prisma.question.findMany({
    where: {
      id: { in: questionIds }
    }
  })

  // Maintain the order of questionIds
  const questionMap = new Map(questions.map(q => [q.id, q]))
  return questionIds.map(id => questionMap.get(id)!).filter(Boolean)
}

/**
 * Get all subtopics with question counts
 */
export async function getSubtopics(): Promise<SubtopicInfo[]> {
  const subtopics = await prisma.subtopic.findMany({
    orderBy: { name: 'asc' }
  })

  return subtopics.map(s => ({
    name: s.name,
    questionCount: s.questionCount,
    category: s.category
  }))
}

/**
 * Get question count by criteria
 */
export async function getQuestionCount(
  subtopics?: string[],
  difficulties?: string[]
): Promise<number> {
  const where: Record<string, unknown> = {}

  if (subtopics && subtopics.length > 0) {
    where.subtopic = { in: subtopics }
  }

  if (difficulties && difficulties.length > 0) {
    where.difficulty = { in: difficulties }
  }

  return prisma.question.count({ where })
}
