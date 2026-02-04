import { useState } from 'react'
import { Answer } from '../types'

interface QuestionSidebarProps {
  totalQuestions: number
  currentIndex: number
  answers: Record<string, Answer>
  questionIds: string[]
  onNavigate: (index: number) => void
}

type QuestionStatus = 'current' | 'answered' | 'flagged' | 'unanswered'
type FilterType = 'all' | 'unanswered' | 'flagged'

function getQuestionStatus(
  index: number,
  currentIndex: number,
  questionId: string,
  answers: Record<string, Answer>
): QuestionStatus {
  if (index === currentIndex) return 'current'
  const answer = answers[questionId]
  if (answer?.flagged) return 'flagged'
  if (answer?.selected) return 'answered'
  return 'unanswered'
}

function getStatusStyles(status: QuestionStatus): string {
  const base = 'w-10 h-10 flex items-center justify-center rounded cursor-pointer transition-all font-medium text-sm'

  switch (status) {
    case 'current':
      return `${base} bg-frcr-teal-600 text-white shadow-md`
    case 'answered':
      return `${base} bg-frcr-teal-100 text-frcr-teal-700 hover:bg-frcr-teal-200`
    case 'flagged':
      return `${base} bg-orange-100 text-orange-700 hover:bg-orange-200 ring-2 ring-orange-400`
    case 'unanswered':
    default:
      return `${base} bg-gray-100 text-gray-600 hover:bg-gray-200`
  }
}

export function QuestionSidebar({
  totalQuestions,
  currentIndex,
  answers,
  questionIds,
  onNavigate
}: QuestionSidebarProps) {
  const [filter, setFilter] = useState<FilterType>('all')

  // Build list of questions with their statuses
  const questionsWithStatus = Array.from({ length: totalQuestions }, (_, index) => {
    const questionId = questionIds[index]
    const status = getQuestionStatus(index, currentIndex, questionId, answers)
    return { index, questionId, status, questionNumber: index + 1 }
  })

  // Filter questions based on active filter
  const filteredQuestions = questionsWithStatus.filter(q => {
    if (filter === 'all') return true
    if (filter === 'unanswered') return q.status === 'unanswered' || q.status === 'current'
    if (filter === 'flagged') return q.status === 'flagged'
    return true
  })

  return (
    <aside className="w-24 bg-white border-r border-gray-200 flex flex-col">
      {/* Question list */}
      <div className="flex-1 overflow-y-auto py-2">
        <div className="flex flex-col items-center gap-1">
          {filteredQuestions.map(({ index, questionId, status, questionNumber }) => (
            <button
              key={questionId || index}
              onClick={() => onNavigate(index)}
              className={getStatusStyles(status)}
              title={`Question ${questionNumber}${status === 'flagged' ? ' (flagged)' : status === 'answered' ? ' (answered)' : ''}`}
            >
              {questionNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Legend with clickable filters */}
      <div className="p-2 border-t border-gray-200 text-xs space-y-1">
        <button
          onClick={() => setFilter('all')}
          className={`flex items-center gap-1 w-full px-1 py-0.5 rounded transition-colors ${
            filter === 'all' ? 'bg-gray-100 text-gray-800 font-medium' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <span className="w-3 h-3 bg-gray-200 rounded"></span>
          <span>All</span>
        </button>
        <button
          onClick={() => setFilter('unanswered')}
          className={`flex items-center gap-1 w-full px-1 py-0.5 rounded transition-colors ${
            filter === 'unanswered' ? 'bg-gray-100 text-gray-700 font-medium' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <span className="w-3 h-3 bg-gray-200 rounded"></span>
          <span>Unanswered</span>
        </button>
        <button
          onClick={() => setFilter('flagged')}
          className={`flex items-center gap-1 w-full px-1 py-0.5 rounded transition-colors ${
            filter === 'flagged' ? 'bg-orange-50 text-orange-700 font-medium' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <span className="w-3 h-3 bg-orange-100 ring-1 ring-orange-400 rounded"></span>
          <span>Flagged</span>
        </button>
      </div>
    </aside>
  )
}
