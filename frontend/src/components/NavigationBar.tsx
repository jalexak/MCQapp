interface NavigationBarProps {
  currentIndex: number
  totalQuestions: number
  onPrevious: () => void
  onNext: () => void
  onSubmit: () => void
}

export function NavigationBar({
  currentIndex,
  totalQuestions,
  onPrevious,
  onNext,
  onSubmit
}: NavigationBarProps) {
  const isFirst = currentIndex === 0
  const isLast = currentIndex === totalQuestions - 1

  return (
    <footer className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-center">
      {/* Navigation buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPrevious}
          disabled={isFirst}
          className={`flex items-center gap-1 px-4 py-2 rounded border transition-colors ${
            isFirst
              ? 'border-gray-200 text-gray-300 cursor-not-allowed'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {isLast ? (
          <button
            onClick={onSubmit}
            className="flex items-center gap-1 px-4 py-2 rounded bg-frcr-teal-600 text-white hover:bg-frcr-teal-700 transition-colors"
          >
            Submit Exam
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        ) : (
          <button
            onClick={onNext}
            className="flex items-center gap-1 px-4 py-2 rounded bg-frcr-teal-600 text-white hover:bg-frcr-teal-700 transition-colors"
          >
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </footer>
  )
}
