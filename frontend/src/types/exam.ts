/**
 * Type definitions for the FRCR 2A Exam interface
 */

export interface Question {
  id: string
  stem: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  optionE: string
  correctAnswer: 'A' | 'B' | 'C' | 'D' | 'E'
  explanation: string
  explanationMatrix: ExplanationMatrix
  subtopic: string
  difficulty: 'medium' | 'hard' | 'very_hard'
  modality: string | null
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

export interface ExplanationMatrix {
  [key: string]: {
    supports: string[]
    excludes: string[]
    why_not_best: string[]
  }
}

export interface Answer {
  selected: 'A' | 'B' | 'C' | 'D' | 'E' | null
  flagged: boolean
  timeSpent: number
}

export interface ExamSession {
  id: string
  questionIds: string[]
  totalQuestions: number
  timeLimit: number
  timeRemaining: number
  answers: Record<string, Answer>
  status: 'in_progress' | 'completed' | 'abandoned'
  startedAt: string
  completedAt: string | null
}

export interface ExamState {
  session: ExamSession | null
  questions: Question[]
  currentIndex: number
  isLoading: boolean
  error: string | null
}

export type OptionKey = 'A' | 'B' | 'C' | 'D' | 'E'

export const OPTION_KEYS: OptionKey[] = ['A', 'B', 'C', 'D', 'E']
