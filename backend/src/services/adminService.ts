import { PrismaClient, UserRole } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Validation schemas
export const UpdateQuestionSchema = z.object({
  stem: z.string().optional(),
  optionA: z.string().optional(),
  optionB: z.string().optional(),
  optionC: z.string().optional(),
  optionD: z.string().optional(),
  optionE: z.string().optional(),
  correctAnswer: z.enum(['A', 'B', 'C', 'D', 'E']).optional(),
  explanation: z.string().optional(),
  explanationMatrix: z.record(z.any()).optional(),
  subtopic: z.string().optional(),
  difficulty: z.enum(['medium', 'hard', 'very_hard']).optional(),
  modality: z.string().nullable().optional(),
  learningPoint: z.string().nullable().optional(),
  // V5 New Fields
  module: z.string().nullable().optional(),
  system: z.string().nullable().optional(),
  ageGroup: z.string().nullable().optional(),
  clinicalContext: z.string().nullable().optional(),
  questionType: z.string().nullable().optional(),
  imagingPhase: z.string().nullable().optional(),
  task: z.string().nullable().optional(),
  discriminatorUsed: z.string().nullable().optional()
})

export const CreateQuestionSchema = z.object({
  id: z.string().optional(),
  stem: z.string(),
  optionA: z.string(),
  optionB: z.string(),
  optionC: z.string(),
  optionD: z.string(),
  optionE: z.string(),
  correctAnswer: z.enum(['A', 'B', 'C', 'D', 'E']),
  explanation: z.string(),
  explanationMatrix: z.record(z.any()).default({}),
  subtopic: z.string(),
  difficulty: z.enum(['medium', 'hard', 'very_hard']),
  modality: z.string().nullable().optional(),
  learningPoint: z.string().nullable().optional(),
  // V5 New Fields
  module: z.string().nullable().optional(),
  system: z.string().nullable().optional(),
  ageGroup: z.string().nullable().optional(),
  clinicalContext: z.string().nullable().optional(),
  questionType: z.string().nullable().optional(),
  imagingPhase: z.string().nullable().optional(),
  task: z.string().nullable().optional(),
  discriminatorUsed: z.string().nullable().optional()
})

export const UpdateUserSchema = z.object({
  name: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  subscriptionStatus: z.enum(['inactive', 'active', 'cancelled']).optional(),
  subscriptionEnd: z.string().datetime().nullable().optional()
})

export type UpdateQuestionInput = z.infer<typeof UpdateQuestionSchema>
export type CreateQuestionInput = z.infer<typeof CreateQuestionSchema>
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>

// Question Management
export async function getQuestions(options: {
  page?: number
  limit?: number
  subtopic?: string
  difficulty?: string
  search?: string
}) {
  const { page = 1, limit = 20, subtopic, difficulty, search } = options

  const where: Record<string, unknown> = {}

  if (subtopic) {
    where.subtopic = subtopic
  }

  if (difficulty) {
    where.difficulty = difficulty
  }

  if (search) {
    where.OR = [
      { stem: { contains: search, mode: 'insensitive' } },
      { id: { contains: search, mode: 'insensitive' } }
    ]
  }

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.question.count({ where })
  ])

  return {
    questions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}

export async function getQuestion(id: string) {
  return prisma.question.findUnique({ where: { id } })
}

export async function updateQuestion(id: string, data: UpdateQuestionInput) {
  return prisma.question.update({
    where: { id },
    data
  })
}

export async function deleteQuestion(id: string) {
  return prisma.question.delete({ where: { id } })
}

export async function createQuestion(data: CreateQuestionInput) {
  const id = data.id || `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  return prisma.question.create({
    data: {
      id,
      stem: data.stem,
      optionA: data.optionA,
      optionB: data.optionB,
      optionC: data.optionC,
      optionD: data.optionD,
      optionE: data.optionE,
      correctAnswer: data.correctAnswer,
      explanation: data.explanation,
      explanationMatrix: data.explanationMatrix,
      subtopic: data.subtopic,
      difficulty: data.difficulty,
      modality: data.modality,
      learningPoint: data.learningPoint,
      // V5 New Fields
      module: data.module,
      system: data.system,
      ageGroup: data.ageGroup,
      clinicalContext: data.clinicalContext,
      questionType: data.questionType,
      imagingPhase: data.imagingPhase,
      task: data.task,
      discriminatorUsed: data.discriminatorUsed
    }
  })
}

export async function importQuestions(questions: CreateQuestionInput[]) {
  const results = {
    created: 0,
    errors: [] as { id: string; error: string }[]
  }

  for (const q of questions) {
    try {
      await createQuestion(q)
      results.created++
    } catch (error) {
      results.errors.push({
        id: q.id || 'unknown',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  return results
}

// User Management
export async function getUsers(options: {
  page?: number
  limit?: number
  role?: UserRole
  search?: string
}) {
  const { page = 1, limit = 20, role, search } = options

  const where: Record<string, unknown> = {}

  if (role) {
    where.role = role
  }

  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } }
    ]
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscriptionStatus: true,
        subscriptionEnd: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { examSessions: true }
        }
      }
    }),
    prisma.user.count({ where })
  ])

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}

export async function getUser(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      subscriptionStatus: true,
      subscriptionEnd: true,
      createdAt: true,
      updatedAt: true,
      examSessions: {
        orderBy: { startedAt: 'desc' },
        take: 10,
        select: {
          id: true,
          totalQuestions: true,
          score: true,
          percentage: true,
          status: true,
          startedAt: true,
          completedAt: true
        }
      },
      _count: {
        select: { examSessions: true }
      }
    }
  })
}

export async function updateUser(id: string, data: UpdateUserInput) {
  const updateData: Record<string, unknown> = {}

  if (data.name !== undefined) updateData.name = data.name
  if (data.role !== undefined) updateData.role = data.role
  if (data.subscriptionStatus !== undefined) updateData.subscriptionStatus = data.subscriptionStatus
  if (data.subscriptionEnd !== undefined) {
    updateData.subscriptionEnd = data.subscriptionEnd ? new Date(data.subscriptionEnd) : null
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      subscriptionStatus: true,
      subscriptionEnd: true,
      createdAt: true,
      updatedAt: true
    }
  })
}

export async function deleteUser(id: string) {
  return prisma.user.delete({ where: { id } })
}

// Analytics
export async function getOverviewStats() {
  const [
    totalUsers,
    activeUsers,
    totalQuestions,
    totalExams,
    completedExams,
    recentExams
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { subscriptionStatus: 'active' } }),
    prisma.question.count(),
    prisma.examSession.count(),
    prisma.examSession.count({ where: { status: 'completed' } }),
    prisma.examSession.findMany({
      where: { status: 'completed' },
      orderBy: { completedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        score: true,
        percentage: true,
        totalQuestions: true,
        completedAt: true
      }
    })
  ])

  const averageScore = recentExams.length > 0
    ? recentExams.reduce((sum, e) => sum + (e.percentage || 0), 0) / recentExams.length
    : 0

  return {
    users: {
      total: totalUsers,
      active: activeUsers
    },
    questions: {
      total: totalQuestions
    },
    exams: {
      total: totalExams,
      completed: completedExams,
      averageScore: Math.round(averageScore * 10) / 10
    },
    recentExams
  }
}

export async function getExamStats(options: {
  startDate?: Date
  endDate?: Date
}) {
  const { startDate, endDate } = options

  const where: Record<string, unknown> = {
    status: 'completed'
  }

  if (startDate || endDate) {
    where.completedAt = {}
    if (startDate) (where.completedAt as Record<string, Date>).gte = startDate
    if (endDate) (where.completedAt as Record<string, Date>).lte = endDate
  }

  const exams = await prisma.examSession.findMany({
    where,
    select: {
      id: true,
      score: true,
      percentage: true,
      totalQuestions: true,
      completedAt: true,
      subtopicFilter: true,
      difficultyFilter: true
    }
  })

  // Calculate statistics
  const scores = exams.map(e => e.percentage || 0)
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

  // Distribution by score range
  const distribution = {
    '0-50': scores.filter(s => s < 50).length,
    '50-70': scores.filter(s => s >= 50 && s < 70).length,
    '70-85': scores.filter(s => s >= 70 && s < 85).length,
    '85-100': scores.filter(s => s >= 85).length
  }

  return {
    totalExams: exams.length,
    averageScore: Math.round(avgScore * 10) / 10,
    distribution,
    examsPerDay: await getExamsPerDay(startDate, endDate)
  }
}

async function getExamsPerDay(startDate?: Date, endDate?: Date) {
  const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
  const end = endDate || new Date()

  const exams = await prisma.examSession.groupBy({
    by: ['completedAt'],
    where: {
      status: 'completed',
      completedAt: {
        gte: start,
        lte: end
      }
    },
    _count: true
  })

  // Group by date string
  const byDate: Record<string, number> = {}
  for (const exam of exams) {
    if (exam.completedAt) {
      const dateStr = exam.completedAt.toISOString().split('T')[0]
      byDate[dateStr] = (byDate[dateStr] || 0) + exam._count
    }
  }

  return byDate
}

export async function getQuestionStats() {
  // Get questions with most incorrect answers
  const sessions = await prisma.examSession.findMany({
    where: { status: 'completed' },
    select: {
      answers: true,
      questionIds: true
    }
  })

  const questionStats: Record<string, { attempts: number; correct: number }> = {}

  for (const session of sessions) {
    for (const qId of session.questionIds) {
      if (!questionStats[qId]) {
        questionStats[qId] = { attempts: 0, correct: 0 }
      }
      questionStats[qId].attempts++
    }
  }

  // Get questions with correct answers to compare
  const questions = await prisma.question.findMany({
    select: { id: true, correctAnswer: true, subtopic: true, difficulty: true }
  })

  const questionMap = new Map(questions.map(q => [q.id, q]))

  for (const session of sessions) {
    const answers = session.answers as Record<string, { selected: string }>

    for (const [qId, answer] of Object.entries(answers)) {
      const question = questionMap.get(qId)
      if (question && answer.selected === question.correctAnswer) {
        if (questionStats[qId]) {
          questionStats[qId].correct++
        }
      }
    }
  }

  // Calculate success rates and find hardest questions
  const statsWithRates = Object.entries(questionStats)
    .filter(([_, stats]) => stats.attempts >= 5) // Minimum 5 attempts
    .map(([qId, stats]) => ({
      questionId: qId,
      attempts: stats.attempts,
      correct: stats.correct,
      successRate: Math.round((stats.correct / stats.attempts) * 100)
    }))
    .sort((a, b) => a.successRate - b.successRate)

  // Subtopic performance
  const subtopicStats: Record<string, { attempts: number; correct: number }> = {}

  for (const [qId, stats] of Object.entries(questionStats)) {
    const question = questionMap.get(qId)
    if (question) {
      if (!subtopicStats[question.subtopic]) {
        subtopicStats[question.subtopic] = { attempts: 0, correct: 0 }
      }
      subtopicStats[question.subtopic].attempts += stats.attempts
      subtopicStats[question.subtopic].correct += stats.correct
    }
  }

  const subtopicRates = Object.entries(subtopicStats)
    .map(([subtopic, stats]) => ({
      subtopic,
      attempts: stats.attempts,
      successRate: stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0
    }))
    .sort((a, b) => a.successRate - b.successRate)

  return {
    hardestQuestions: statsWithRates.slice(0, 20),
    easiestQuestions: statsWithRates.slice(-20).reverse(),
    subtopicPerformance: subtopicRates
  }
}
