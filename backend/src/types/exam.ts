import { z } from 'zod'

// Zod schemas for request validation
export const StartExamSchema = z.object({
  questionCount: z.number().min(1).max(120).default(30),
  subtopics: z.array(z.string()).optional(),
  difficulties: z.array(z.enum(['medium', 'hard', 'very_hard'])).optional(),
  timePerQuestion: z.number().min(30).max(180).default(90) // seconds
})

export const AnswerSchema = z.object({
  questionId: z.string(),
  selected: z.enum(['A', 'B', 'C', 'D', 'E']).nullable()
})

export const FlagSchema = z.object({
  questionId: z.string(),
  flagged: z.boolean()
})

// TypeScript types
export type StartExamRequest = z.infer<typeof StartExamSchema>
export type AnswerRequest = z.infer<typeof AnswerSchema>
export type FlagRequest = z.infer<typeof FlagSchema>

export interface QuestionResponse {
  id: string
  stem: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  optionE: string
  subtopic: string
  difficulty: string
  modality: string | null
  // V5 New Fields
  module: string | null
  system: string | null
  ageGroup: string | null
  clinicalContext: string | null
  questionType: string | null
  imagingPhase: string | null
  task: string | null
}

export interface ExamSessionResponse {
  id: string
  questionIds: string[]
  totalQuestions: number
  timeLimit: number
  timeRemaining: number
  answers: Record<string, AnswerData>
  status: 'in_progress' | 'completed' | 'abandoned'
  startedAt: string
  completedAt: string | null
}

export interface AnswerData {
  selected: 'A' | 'B' | 'C' | 'D' | 'E' | null
  flagged: boolean
  timeSpent: number
}

export interface ExamResultsResponse {
  sessionId: string
  score: number
  totalQuestions: number
  percentage: number
  timeTaken: number
  timeLimit: number
  questions: QuestionResult[]
  subtopicPerformance: SubtopicPerformance[]
  difficultyPerformance: DifficultyPerformance[]
}

export interface QuestionResult {
  id: string
  stem: string
  options: {
    A: string
    B: string
    C: string
    D: string
    E: string
  }
  correctAnswer: 'A' | 'B' | 'C' | 'D' | 'E'
  selectedAnswer: 'A' | 'B' | 'C' | 'D' | 'E' | null
  isCorrect: boolean
  flagged: boolean
  explanation: string
  explanationMatrix: Record<string, unknown>
  subtopic: string
  difficulty: string
  learningPoint: string | null
  // V5 New Fields
  module: string | null
  system: string | null
  ageGroup: string | null
  clinicalContext: string | null
  questionType: string | null
  imagingPhase: string | null
  task: string | null
  discriminatorUsed: string | null
}

export interface SubtopicPerformance {
  subtopic: string
  correct: number
  total: number
  percentage: number
}

export interface DifficultyPerformance {
  difficulty: string
  correct: number
  total: number
  percentage: number
}

export interface SubtopicInfo {
  name: string
  questionCount: number
  category: string | null
}
