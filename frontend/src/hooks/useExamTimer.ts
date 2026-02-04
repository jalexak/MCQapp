import { useState, useEffect, useCallback, useRef } from 'react'

interface UseExamTimerOptions {
  initialSeconds: number
  onTimeUp: () => void
  onWarning?: (secondsRemaining: number) => void
}

interface UseExamTimerReturn {
  timeRemaining: number
  isPaused: boolean
  pause: () => void
  resume: () => void
  toggle: () => void
  reset: (newSeconds?: number) => void
}

export function useExamTimer({
  initialSeconds,
  onTimeUp,
  onWarning
}: UseExamTimerOptions): UseExamTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState(initialSeconds)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<number | null>(null)
  const hasWarnedRef = useRef<Set<number>>(new Set())

  // Warning thresholds in seconds
  const WARNING_THRESHOLDS = [300, 60] // 5 minutes, 1 minute

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    clearTimer()
    intervalRef.current = window.setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearTimer()
          onTimeUp()
          return 0
        }

        const newTime = prev - 1

        // Check for warnings
        if (onWarning) {
          for (const threshold of WARNING_THRESHOLDS) {
            if (newTime === threshold && !hasWarnedRef.current.has(threshold)) {
              hasWarnedRef.current.add(threshold)
              onWarning(threshold)
            }
          }
        }

        return newTime
      })
    }, 1000)
  }, [clearTimer, onTimeUp, onWarning])

  const pause = useCallback(() => {
    setIsPaused(true)
    clearTimer()
  }, [clearTimer])

  const resume = useCallback(() => {
    setIsPaused(false)
    startTimer()
  }, [startTimer])

  const toggle = useCallback(() => {
    if (isPaused) {
      resume()
    } else {
      pause()
    }
  }, [isPaused, pause, resume])

  const reset = useCallback((newSeconds?: number) => {
    clearTimer()
    setTimeRemaining(newSeconds ?? initialSeconds)
    hasWarnedRef.current.clear()
    setIsPaused(false)
    startTimer()
  }, [clearTimer, initialSeconds, startTimer])

  // Start timer on mount
  useEffect(() => {
    startTimer()
    return clearTimer
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update timer if initialSeconds changes
  useEffect(() => {
    setTimeRemaining(initialSeconds)
  }, [initialSeconds])

  return {
    timeRemaining,
    isPaused,
    pause,
    resume,
    toggle,
    reset
  }
}
