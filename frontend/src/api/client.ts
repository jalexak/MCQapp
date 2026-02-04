/**
 * API client for FRCR Exam Platform
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

interface ApiResponse<T> {
  data?: T
  error?: string
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.error || 'Request failed' }
    }

    return { data }
  } catch (error) {
    console.error('API request error:', error)
    return { error: 'Network error. Please try again.' }
  }
}

// Types for API responses
export interface Question {
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

export interface ExamSession {
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

export interface SubtopicInfo {
  name: string
  questionCount: number
  category: string | null
}

export interface ExamResults {
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

export interface OptionExplanation {
  supports: string[]
  excludes: string[]
  why_not_best: string[]
}

export interface ExplanationMatrix {
  A?: OptionExplanation
  B?: OptionExplanation
  C?: OptionExplanation
  D?: OptionExplanation
  E?: OptionExplanation
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
  explanationMatrix: ExplanationMatrix
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

// API functions

export async function getSubtopics(): Promise<ApiResponse<{ subtopics: SubtopicInfo[] }>> {
  return request('/questions/subtopics')
}

export async function getQuestionCount(
  subtopics?: string[],
  difficulties?: string[]
): Promise<ApiResponse<{ count: number }>> {
  const params = new URLSearchParams()
  if (subtopics?.length) params.set('subtopics', subtopics.join(','))
  if (difficulties?.length) params.set('difficulties', difficulties.join(','))
  return request(`/questions/count?${params}`)
}

export interface StartExamParams {
  questionCount?: number
  subtopics?: string[]
  difficulties?: ('medium' | 'hard' | 'very_hard')[]
  timePerQuestion?: number
}

export async function startExam(
  params: StartExamParams = {}
): Promise<ApiResponse<{ session: ExamSession; questions: Question[] }>> {
  return request('/exam/start', {
    method: 'POST',
    body: JSON.stringify(params)
  })
}

export async function getExamSession(
  sessionId: string
): Promise<ApiResponse<{ session: ExamSession; questions: Question[] }>> {
  return request(`/exam/${sessionId}`)
}

export async function submitAnswer(
  sessionId: string,
  questionId: string,
  selected: 'A' | 'B' | 'C' | 'D' | 'E' | null,
  timeSpent?: number
): Promise<ApiResponse<{ session: ExamSession }>> {
  return request(`/exam/${sessionId}/answer`, {
    method: 'POST',
    body: JSON.stringify({ questionId, selected, timeSpent })
  })
}

export async function toggleFlag(
  sessionId: string,
  questionId: string,
  flagged: boolean
): Promise<ApiResponse<{ session: ExamSession }>> {
  return request(`/exam/${sessionId}/flag`, {
    method: 'POST',
    body: JSON.stringify({ questionId, flagged })
  })
}

export async function updateTime(
  sessionId: string,
  timeRemaining: number
): Promise<ApiResponse<{ success: boolean }>> {
  return request(`/exam/${sessionId}/time`, {
    method: 'POST',
    body: JSON.stringify({ timeRemaining })
  })
}

export async function completeExam(
  sessionId: string,
  timeRemaining?: number
): Promise<ApiResponse<{ results: ExamResults }>> {
  return request(`/exam/${sessionId}/complete`, {
    method: 'POST',
    body: JSON.stringify({ timeRemaining })
  })
}

export async function getExamResults(
  sessionId: string
): Promise<ApiResponse<{ results: ExamResults }>> {
  return request(`/exam/${sessionId}/results`)
}

// Stats API types
export interface QuestionStatsResponse {
  questionId: string
  totalAttempts: number
  correctCount: number
  difficultyRate: number
}

export interface RankingResponse {
  relativeScore: number
  percentile: number
  totalCandidates: number
  rank: number
}

// Stats API functions

export async function getQuestionStats(
  questionId: string
): Promise<ApiResponse<QuestionStatsResponse>> {
  return request(`/stats/question/${questionId}`)
}

export async function getRanking(
  sessionId: string
): Promise<ApiResponse<RankingResponse>> {
  return request(`/stats/ranking/${sessionId}`)
}
