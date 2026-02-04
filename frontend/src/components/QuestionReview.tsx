import { QuestionResult, OptionExplanation } from '../api'
import { OptionKey, OPTION_KEYS } from '../types'

interface QuestionReviewProps {
  question: QuestionResult
  questionNumber: number
  totalQuestions: number
}

export function QuestionReview({
  question,
  questionNumber,
  totalQuestions
}: QuestionReviewProps) {
  const {
    stem,
    options,
    correctAnswer,
    selectedAnswer,
    isCorrect,
    flagged,
    explanation,
    explanationMatrix,
    learningPoint,
    subtopic,
    difficulty
  } = question

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Question Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-gray-700">
              Question {questionNumber} of {totalQuestions}
            </span>
            {flagged && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" />
                </svg>
                Flagged
              </span>
            )}
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            isCorrect
              ? 'bg-green-100 text-green-800'
              : selectedAnswer === null
                ? 'bg-gray-100 text-gray-600'
                : 'bg-red-100 text-red-800'
          }`}>
            {isCorrect ? 'Correct' : selectedAnswer === null ? 'Not answered' : 'Incorrect'}
          </div>
        </div>
      </div>

      {/* Question Stem */}
      <div className="px-6 py-5 border-b border-gray-200">
        <p
          className="exam-protected text-gray-800 leading-relaxed whitespace-pre-wrap"
          onContextMenu={(e) => e.preventDefault()}
        >
          {stem}
        </p>
      </div>

      {/* Answer Options */}
      <div className="px-6 py-4 space-y-3">
        {OPTION_KEYS.map((key) => (
          <ReviewOption
            key={key}
            optionKey={key}
            text={options[key]}
            isCorrectAnswer={correctAnswer === key}
            isUserAnswer={selectedAnswer === key}
            userAnsweredCorrectly={isCorrect}
            optionExplanation={explanationMatrix?.[key]}
          />
        ))}
      </div>

      {/* Explanation Section */}
      <div className="px-6 py-5 bg-blue-50 border-t border-blue-100">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-800 mb-2">Explanation</h3>
            <p className="text-blue-900 leading-relaxed whitespace-pre-wrap">{explanation}</p>
          </div>
        </div>
      </div>

      {/* Learning Point (if available) */}
      {learningPoint && (
        <div className="px-6 py-5 bg-amber-50 border-t border-amber-100">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800 mb-2">Learning Point</h3>
              <p className="text-amber-900 leading-relaxed whitespace-pre-wrap">{learningPoint}</p>
            </div>
          </div>
        </div>
      )}

      {/* Metadata Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span>{subtopic}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="capitalize">{difficulty.replace('_', ' ')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ReviewOptionProps {
  optionKey: OptionKey
  text: string
  isCorrectAnswer: boolean
  isUserAnswer: boolean
  userAnsweredCorrectly: boolean
  optionExplanation?: OptionExplanation
}

function ReviewOption({
  optionKey,
  text,
  isCorrectAnswer,
  isUserAnswer,
  userAnsweredCorrectly,
  optionExplanation
}: ReviewOptionProps) {
  // Determine styling based on answer state
  let containerClasses = 'flex items-start gap-3 p-3 rounded-lg border-2 '
  let iconContent = null

  if (isCorrectAnswer) {
    // Always highlight the correct answer in green
    containerClasses += 'bg-green-50 border-green-500'
    iconContent = (
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
    )
  } else if (isUserAnswer && !userAnsweredCorrectly) {
    // User's wrong answer in red
    containerClasses += 'bg-red-50 border-red-400'
    iconContent = (
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    )
  } else {
    // Default unselected styling
    containerClasses += 'bg-white border-gray-200'
    iconContent = (
      <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-gray-300 bg-white" />
    )
  }

  // Get relevant explanation items
  const supports = optionExplanation?.supports?.filter(s => s.trim()) || []
  const whyNotBest = optionExplanation?.why_not_best?.filter(s => s.trim()) || []
  const hasExplanation = supports.length > 0 || whyNotBest.length > 0

  return (
    <div className={`${containerClasses} exam-protected`} onContextMenu={(e) => e.preventDefault()}>
      {iconContent}
      <div className="flex-1">
        <div>
          <span className={`font-medium mr-2 ${
            isCorrectAnswer
              ? 'text-green-700'
              : isUserAnswer && !userAnsweredCorrectly
                ? 'text-red-700'
                : 'text-gray-500'
          }`}>
            {optionKey}.
          </span>
          <span className={
            isCorrectAnswer
              ? 'text-green-800'
              : isUserAnswer && !userAnsweredCorrectly
                ? 'text-red-800'
                : 'text-gray-700'
          }>
            {text}
          </span>
        </div>

        {/* Option-level explanation from matrix */}
        {hasExplanation && (
          <div className={`mt-2 pl-3 border-l-2 ${
            isCorrectAnswer
              ? 'border-green-300'
              : 'border-gray-300'
          }`}>
            {supports.length > 0 && (
              <div className="space-y-1">
                {supports.map((item, idx) => (
                  <p key={idx} className="text-sm text-green-700 leading-relaxed">
                    {item}
                  </p>
                ))}
              </div>
            )}
            {whyNotBest.length > 0 && (
              <div className="space-y-1">
                {whyNotBest.map((item, idx) => (
                  <p key={idx} className="text-sm text-gray-600 leading-relaxed">
                    {item}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Labels */}
      <div className="flex-shrink-0 flex flex-col items-end gap-1">
        {isCorrectAnswer && (
          <span className="text-xs font-medium text-green-700">Correct answer</span>
        )}
        {isUserAnswer && !userAnsweredCorrectly && (
          <span className="text-xs font-medium text-red-700">Your answer</span>
        )}
        {isUserAnswer && userAnsweredCorrectly && (
          <span className="text-xs font-medium text-green-700">Your answer</span>
        )}
      </div>
    </div>
  )
}
