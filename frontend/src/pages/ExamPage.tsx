import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ExamHeader, QuestionSidebar, QuestionDisplay, NavigationBar } from '../components'
import { useExamTimer, useExamState } from '../hooks'
import * as api from '../api'
import type { Question, OptionKey } from '../types'

export function ExamPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()

  const [questions, setQuestions] = useState<Question[]>([])
  const [session, setSession] = useState<api.ExamSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Convert API question format to internal format
  const convertQuestion = (q: api.Question): Question => ({
    id: q.id,
    stem: q.stem,
    optionA: q.optionA,
    optionB: q.optionB,
    optionC: q.optionC,
    optionD: q.optionD,
    optionE: q.optionE,
    correctAnswer: 'A', // Not available during exam
    explanation: '',
    explanationMatrix: {},
    subtopic: q.subtopic,
    difficulty: q.difficulty as 'medium' | 'hard' | 'very_hard',
    modality: q.modality,
    learningPoint: null
  })

  // Convert API answer format to internal format
  const convertAnswers = (apiAnswers: Record<string, api.AnswerData>) => {
    const result: Record<string, { selected: OptionKey | null; flagged: boolean; timeSpent: number }> = {}
    for (const [key, value] of Object.entries(apiAnswers)) {
      result[key] = {
        selected: value.selected as OptionKey | null,
        flagged: value.flagged,
        timeSpent: value.timeSpent
      }
    }
    return result
  }

  const examState = useExamState({
    questions,
    initialAnswers: session ? convertAnswers(session.answers) : {}
  })

  const handleTimeUp = useCallback(async () => {
    if (!sessionId) return
    alert('Time is up! Your exam will be submitted.')
    const response = await api.completeExam(sessionId, 0)
    if (response.data) {
      navigate(`/results/${sessionId}`)
    }
  }, [navigate, sessionId])

  const handleTimeWarning = useCallback((secondsRemaining: number) => {
    const minutes = Math.floor(secondsRemaining / 60)
    alert(`Warning: ${minutes > 0 ? `${minutes} minute(s)` : `${secondsRemaining} seconds`} remaining!`)
  }, [])

  const timer = useExamTimer({
    initialSeconds: session?.timeRemaining ?? 0,
    onTimeUp: handleTimeUp,
    onWarning: handleTimeWarning
  })

  // Load exam session
  useEffect(() => {
    async function loadExam() {
      if (!sessionId) return

      // Check if this is a new exam request (sessionId starts with "new-")
      if (sessionId.startsWith('new-')) {
        // Start a new exam
        const response = await api.startExam({
          questionCount: 30,
          timePerQuestion: 90
        })

        if (response.error) {
          setError(response.error)
          setIsLoading(false)
          return
        }

        if (response.data) {
          // Redirect to the actual session ID
          navigate(`/exam/${response.data.session.id}`, { replace: true })
          return
        }
      }

      // Load existing session
      const response = await api.getExamSession(sessionId)

      if (response.error) {
        setError(response.error)
        setIsLoading(false)
        return
      }

      if (response.data) {
        setSession(response.data.session)
        setQuestions(response.data.questions.map(convertQuestion))
        setIsLoading(false)
      }
    }

    loadExam()
  }, [sessionId, navigate])

  // Update timer when session loads
  useEffect(() => {
    if (session) {
      timer.reset(session.timeRemaining)
    }
  }, [session]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync answers to backend
  const handleSelectAnswer = useCallback(async (key: OptionKey) => {
    examState.selectAnswer(key)

    if (!sessionId || !examState.currentQuestion) return

    await api.submitAnswer(
      sessionId,
      examState.currentQuestion.id,
      key
    )
  }, [sessionId, examState])

  const handleToggleFlag = useCallback(async () => {
    const currentAnswer = examState.getCurrentAnswer()
    const newFlaggedState = !(currentAnswer?.flagged ?? false)

    examState.toggleFlag()

    if (!sessionId || !examState.currentQuestion) return

    await api.toggleFlag(
      sessionId,
      examState.currentQuestion.id,
      newFlaggedState
    )
  }, [sessionId, examState])

  const handleEndExam = useCallback(async () => {
    if (!sessionId) return

    timer.pause()
    const { answered, total } = examState.getProgress()
    const unanswered = total - answered

    if (unanswered > 0) {
      const confirm = window.confirm(
        `You have ${unanswered} unanswered question(s). Are you sure you want to submit?`
      )
      if (!confirm) {
        timer.resume()
        return
      }
    }

    const response = await api.completeExam(sessionId, timer.timeRemaining)
    if (response.data) {
      navigate(`/results/${sessionId}`)
    } else {
      alert('Failed to submit exam. Please try again.')
      timer.resume()
    }
  }, [timer, examState, navigate, sessionId])

  const handleSubmit = useCallback(() => {
    handleEndExam()
  }, [handleEndExam])

  // Periodically save time remaining
  useEffect(() => {
    if (!sessionId || timer.isPaused) return

    const interval = setInterval(async () => {
      await api.updateTime(sessionId, timer.timeRemaining)
    }, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [sessionId, timer.timeRemaining, timer.isPaused])

  // Content protection - block copy/paste shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+C (copy), Ctrl+U (view source), Ctrl+P (print), Ctrl+S (save)
      if (e.ctrlKey && ['c', 'u', 'p', 's'].includes(e.key.toLowerCase())) {
        e.preventDefault()
      }
      // Also block Cmd key on Mac
      if (e.metaKey && ['c', 'u', 'p', 's'].includes(e.key.toLowerCase())) {
        e.preventDefault()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-frcr-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-frcr-teal-600 text-white rounded-lg hover:bg-frcr-teal-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  const currentAnswer = examState.getCurrentAnswer()

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header with timer */}
      <ExamHeader
        timeRemaining={timer.timeRemaining}
        isPaused={timer.isPaused}
        onPauseToggle={timer.toggle}
        onEndExam={handleEndExam}
      />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <QuestionSidebar
          totalQuestions={questions.length}
          currentIndex={examState.currentIndex}
          answers={examState.answers}
          questionIds={questions.map(q => q.id)}
          onNavigate={examState.goToQuestion}
        />

        {/* Question content */}
        <main className="flex-1 flex flex-col bg-white">
          {examState.currentQuestion && (
            <QuestionDisplay
              question={examState.currentQuestion}
              questionNumber={examState.currentIndex + 1}
              totalQuestions={questions.length}
              selectedAnswer={currentAnswer?.selected ?? null}
              isFlagged={currentAnswer?.flagged ?? false}
              onSelectAnswer={handleSelectAnswer}
              onToggleFlag={handleToggleFlag}
            />
          )}

          {/* Navigation */}
          <NavigationBar
            currentIndex={examState.currentIndex}
            totalQuestions={questions.length}
            onPrevious={examState.goToPrevious}
            onNext={examState.goToNext}
            onSubmit={handleSubmit}
          />
        </main>
      </div>

      {/* Pause overlay */}
      {timer.isPaused && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Exam Paused</h2>
            <p className="text-gray-600 mb-6">
              The timer has been paused. Click resume to continue your exam.
            </p>
            <button
              onClick={timer.resume}
              className="px-6 py-3 bg-frcr-teal-600 text-white rounded-lg hover:bg-frcr-teal-700 transition-colors"
            >
              Resume Exam
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
