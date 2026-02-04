import { useState, useCallback, useEffect } from 'react'
import { Question, Answer, OptionKey } from '../types'

interface UseExamStateOptions {
  questions: Question[]
  initialAnswers?: Record<string, Answer>
}

interface UseExamStateReturn {
  currentIndex: number
  currentQuestion: Question | null
  answers: Record<string, Answer>
  goToQuestion: (index: number) => void
  goToNext: () => void
  goToPrevious: () => void
  selectAnswer: (key: OptionKey) => void
  toggleFlag: () => void
  getCurrentAnswer: () => Answer | null
  getProgress: () => { answered: number; flagged: number; total: number }
}

function createEmptyAnswer(): Answer {
  return {
    selected: null,
    flagged: false,
    timeSpent: 0
  }
}

export function useExamState({
  questions,
  initialAnswers = {}
}: UseExamStateOptions): UseExamStateReturn {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Answer>>(initialAnswers)
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now())

  const currentQuestion = questions[currentIndex] ?? null

  // Track time spent on current question
  const recordTimeSpent = useCallback(() => {
    if (!currentQuestion) return

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)
    setAnswers((prev) => {
      const existing = prev[currentQuestion.id] || createEmptyAnswer()
      return {
        ...prev,
        [currentQuestion.id]: {
          ...existing,
          timeSpent: existing.timeSpent + timeSpent
        }
      }
    })
  }, [currentQuestion, questionStartTime])

  const goToQuestion = useCallback((index: number) => {
    if (index < 0 || index >= questions.length) return
    recordTimeSpent()
    setCurrentIndex(index)
    setQuestionStartTime(Date.now())
  }, [questions.length, recordTimeSpent])

  const goToNext = useCallback(() => {
    goToQuestion(currentIndex + 1)
  }, [currentIndex, goToQuestion])

  const goToPrevious = useCallback(() => {
    goToQuestion(currentIndex - 1)
  }, [currentIndex, goToQuestion])

  const selectAnswer = useCallback((key: OptionKey) => {
    if (!currentQuestion) return

    setAnswers((prev) => {
      const existing = prev[currentQuestion.id] || createEmptyAnswer()
      return {
        ...prev,
        [currentQuestion.id]: {
          ...existing,
          selected: key
        }
      }
    })
  }, [currentQuestion])

  const toggleFlag = useCallback(() => {
    if (!currentQuestion) return

    setAnswers((prev) => {
      const existing = prev[currentQuestion.id] || createEmptyAnswer()
      return {
        ...prev,
        [currentQuestion.id]: {
          ...existing,
          flagged: !existing.flagged
        }
      }
    })
  }, [currentQuestion])

  const getCurrentAnswer = useCallback((): Answer | null => {
    if (!currentQuestion) return null
    return answers[currentQuestion.id] || null
  }, [currentQuestion, answers])

  const getProgress = useCallback(() => {
    let answered = 0
    let flagged = 0

    for (const questionId of Object.keys(answers)) {
      const answer = answers[questionId]
      if (answer.selected) answered++
      if (answer.flagged) flagged++
    }

    return { answered, flagged, total: questions.length }
  }, [answers, questions.length])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case '1':
          selectAnswer('A')
          break
        case '2':
          selectAnswer('B')
          break
        case '3':
          selectAnswer('C')
          break
        case '4':
          selectAnswer('D')
          break
        case '5':
          selectAnswer('E')
          break
        case 'ArrowLeft':
          goToPrevious()
          break
        case 'ArrowRight':
          goToNext()
          break
        case 'f':
        case 'F':
          toggleFlag()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectAnswer, goToPrevious, goToNext, toggleFlag])

  return {
    currentIndex,
    currentQuestion,
    answers,
    goToQuestion,
    goToNext,
    goToPrevious,
    selectAnswer,
    toggleFlag,
    getCurrentAnswer,
    getProgress
  }
}
