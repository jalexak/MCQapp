import { useCallback } from 'react'

interface ExamHeaderProps {
  timeRemaining: number // in seconds
  isPaused: boolean
  onPauseToggle: () => void
  onEndExam: () => void
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function getTimerClassName(seconds: number): string {
  if (seconds <= 60) return 'text-red-300 animate-pulse' // Critical: 1 min
  if (seconds <= 300) return 'text-yellow-300' // Warning: 5 min
  return 'text-white'
}

export function ExamHeader({
  timeRemaining,
  isPaused,
  onPauseToggle,
  onEndExam
}: ExamHeaderProps) {
  const handleEndExam = useCallback(() => {
    if (window.confirm('Are you sure you want to end this exam? You cannot return to unanswered questions.')) {
      onEndExam()
    }
  }, [onEndExam])

  return (
    <header className="bg-frcr-teal-700 text-white px-4 py-3 flex items-center justify-between shadow-md">
      {/* Left: Timer */}
      <div className="flex items-center gap-4">
        <div className={`font-mono text-lg ${getTimerClassName(timeRemaining)}`}>
          Time Remaining: {formatTime(timeRemaining)}
        </div>

        {/* Pause Button */}
        <button
          onClick={onPauseToggle}
          className="p-2 rounded hover:bg-frcr-teal-600 transition-colors"
          title={isPaused ? 'Resume exam' : 'Pause exam'}
        >
          {isPaused ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleEndExam}
          className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition-colors"
        >
          End Exam
        </button>
      </div>
    </header>
  )
}
