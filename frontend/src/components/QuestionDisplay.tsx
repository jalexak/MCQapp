import { Question, OptionKey, OPTION_KEYS } from '../types'
import { AnswerOption } from './AnswerOption'

interface QuestionDisplayProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  selectedAnswer: OptionKey | null
  isFlagged: boolean
  onSelectAnswer: (key: OptionKey) => void
  onToggleFlag: () => void
}

function getOptionText(question: Question, key: OptionKey): string {
  const optionMap: Record<OptionKey, keyof Question> = {
    A: 'optionA',
    B: 'optionB',
    C: 'optionC',
    D: 'optionD',
    E: 'optionE'
  }
  return question[optionMap[key]] as string
}

export function QuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  isFlagged,
  onSelectAnswer,
  onToggleFlag
}: QuestionDisplayProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Question header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">
            Question {questionNumber} of {totalQuestions}
          </h2>

          {/* Flag button */}
          <button
            onClick={onToggleFlag}
            className={`p-1.5 rounded transition-colors ${
              isFlagged
                ? 'text-orange-500 bg-orange-100 hover:bg-orange-200'
                : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'
            }`}
            title={isFlagged ? 'Remove flag' : 'Flag for review'}
          >
            <svg className="w-5 h-5" fill={isFlagged ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
            </svg>
          </button>
        </div>
      </div>

      {/* Question stem */}
      <div className="mb-6">
        <p
          className="exam-protected text-gray-800 leading-relaxed whitespace-pre-wrap"
          onContextMenu={(e) => e.preventDefault()}
        >
          {question.stem}
        </p>
      </div>

      {/* Answer options */}
      <div className="space-y-3">
        {OPTION_KEYS.map((key) => (
          <AnswerOption
            key={key}
            optionKey={key}
            text={getOptionText(question, key)}
            isSelected={selectedAnswer === key}
            onSelect={onSelectAnswer}
          />
        ))}
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="mt-6 text-xs text-gray-400">
        Tip: Press 1-5 to select an option, or use arrow keys to navigate questions
      </div>
    </div>
  )
}
