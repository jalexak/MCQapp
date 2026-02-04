import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import * as api from '../api'
import { QuestionReview } from '../components'

type ReviewFilter = 'all' | 'incorrect' | 'flagged'

export function ResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()

  const [results, setResults] = useState<api.ExamResults | null>(null)
  const [ranking, setRanking] = useState<api.RankingResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Review mode state
  const [isReviewMode, setIsReviewMode] = useState(false)
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('all')
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)

  useEffect(() => {
    async function loadResults() {
      if (!sessionId) return

      setIsLoading(true)
      setError(null)

      // Fetch results and ranking in parallel
      const [resultsResponse, rankingResponse] = await Promise.all([
        api.getExamResults(sessionId),
        api.getRanking(sessionId)
      ])

      if (resultsResponse.error) {
        setError(resultsResponse.error)
        setIsLoading(false)
        return
      }

      if (resultsResponse.data) {
        setResults(resultsResponse.data.results)
      }

      if (rankingResponse.data) {
        setRanking(rankingResponse.data)
      }

      setIsLoading(false)
    }

    loadResults()
  }, [sessionId])

  // Compute filtered questions for review mode
  const filteredQuestions = useMemo(() => {
    if (!results) return []

    switch (reviewFilter) {
      case 'incorrect':
        return results.questions.filter(q => !q.isCorrect)
      case 'flagged':
        return results.questions.filter(q => q.flagged)
      default:
        return results.questions
    }
  }, [results, reviewFilter])

  // Reset index when filter changes
  useEffect(() => {
    setCurrentReviewIndex(0)
  }, [reviewFilter])

  // Content protection - block copy/paste shortcuts during review
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

  // Count helpers for filter buttons
  const incorrectCount = results?.questions.filter(q => !q.isCorrect).length ?? 0
  const flaggedCount = results?.questions.filter(q => q.flagged).length ?? 0

  const currentQuestion = filteredQuestions[currentReviewIndex]

  const handlePreviousQuestion = () => {
    if (currentReviewIndex > 0) {
      setCurrentReviewIndex(prev => prev - 1)
    }
  }

  const handleNextQuestion = () => {
    if (currentReviewIndex < filteredQuestions.length - 1) {
      setCurrentReviewIndex(prev => prev + 1)
    }
  }

  const handleFilterChange = (filter: ReviewFilter) => {
    setReviewFilter(filter)
  }

  const handleBackToSummary = () => {
    setIsReviewMode(false)
    setReviewFilter('all')
    setCurrentReviewIndex(0)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-frcr-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    )
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Results not found'}</p>
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

  const passed = results.percentage >= 70 // Typical FRCR pass mark

  // Review Mode View
  if (isReviewMode) {
    return (
      <div className="min-h-screen bg-gray-100 py-6">
        <div className="max-w-4xl mx-auto px-4">
          {/* Review Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBackToSummary}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">Back to Summary</span>
            </button>
            <div className="text-gray-600 font-medium">
              Question {currentReviewIndex + 1} of {filteredQuestions.length}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                reviewFilter === 'all'
                  ? 'bg-frcr-teal-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              All ({results.questions.length})
            </button>
            <button
              onClick={() => handleFilterChange('incorrect')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                reviewFilter === 'incorrect'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Incorrect ({incorrectCount})
            </button>
            <button
              onClick={() => handleFilterChange('flagged')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                reviewFilter === 'flagged'
                  ? 'bg-amber-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Flagged ({flaggedCount})
            </button>
          </div>

          {/* Question Review Content */}
          {filteredQuestions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No questions to display</h3>
              <p className="text-gray-500">
                {reviewFilter === 'incorrect'
                  ? "Great job! You didn't get any questions wrong."
                  : "You didn't flag any questions during this exam."}
              </p>
            </div>
          ) : currentQuestion ? (
            <QuestionReview
              question={currentQuestion}
              questionNumber={currentReviewIndex + 1}
              totalQuestions={filteredQuestions.length}
            />
          ) : null}

          {/* Navigation Footer */}
          {filteredQuestions.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentReviewIndex === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  currentReviewIndex === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              {/* Quick Jump */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Jump to:</span>
                <select
                  value={currentReviewIndex}
                  onChange={(e) => setCurrentReviewIndex(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-frcr-teal-500 focus:border-transparent"
                >
                  {filteredQuestions.map((_, idx) => (
                    <option key={idx} value={idx}>
                      Q{idx + 1}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleNextQuestion}
                disabled={currentReviewIndex === filteredQuestions.length - 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  currentReviewIndex === filteredQuestions.length - 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Next
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Summary View (default)
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-frcr-teal-700 mb-2">
            Exam Complete
          </h1>
          <p className="text-gray-600">
            Here are your results and performance analysis
          </p>
        </div>

        {/* Main Score Card */}
        <div className={`bg-white rounded-lg shadow-lg p-8 mb-6 border-t-4 ${passed ? 'border-green-500' : 'border-red-500'}`}>
          <div className="text-center">
            <div className={`text-6xl font-bold mb-2 ${passed ? 'text-green-600' : 'text-red-600'}`}>
              {results.percentage}%
            </div>
            <div className="text-xl text-gray-600 mb-4">
              {results.score} / {results.totalQuestions} correct
            </div>
            <div className={`inline-block px-4 py-2 rounded-full text-white font-medium ${passed ? 'bg-green-500' : 'bg-red-500'}`}>
              {passed ? 'PASS' : 'NEEDS IMPROVEMENT'}
            </div>
          </div>
        </div>

        {/* Review Questions Button */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">
                Review Your Answers
              </h2>
              <p className="text-gray-600 text-sm">
                Go through each question to see explanations and learn from mistakes
              </p>
            </div>
            <button
              onClick={() => setIsReviewMode(true)}
              className="flex items-center gap-2 px-6 py-3 bg-frcr-teal-600 text-white rounded-lg hover:bg-frcr-teal-700 transition-colors font-medium whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Review Questions
            </button>
          </div>
        </div>

        {/* Ranking Card */}
        {ranking && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Relative Performance
              </h2>
              <Link
                to="/faq"
                className="text-frcr-teal-600 hover:text-frcr-teal-700 text-sm underline"
              >
                How is this calculated?
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Percentile */}
              <div className="bg-frcr-teal-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-frcr-teal-700">
                  {ranking.percentile}
                  <span className="text-lg">th</span>
                </div>
                <div className="text-sm text-gray-600">Percentile</div>
              </div>

              {/* Rank */}
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-gray-700">
                  #{ranking.rank}
                </div>
                <div className="text-sm text-gray-600">
                  of {ranking.totalCandidates}
                </div>
              </div>

              {/* Relative Score */}
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-gray-700">
                  {ranking.relativeScore > 0 ? '+' : ''}{ranking.relativeScore.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Relative Score</div>
              </div>

              {/* Total Candidates */}
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-gray-700">
                  {ranking.totalCandidates}
                </div>
                <div className="text-sm text-gray-600">Total Candidates</div>
              </div>
            </div>

            {/* Explanation */}
            <p className="text-sm text-gray-500 mt-4">
              Your performance is compared to other candidates based on question difficulty.
              Harder questions (those most candidates got wrong) earn more credit when answered correctly.
            </p>
          </div>
        )}

        {/* Time Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Time Analysis</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-gray-700">
                {formatTime(results.timeTaken)}
              </div>
              <div className="text-sm text-gray-600">Time Taken</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-700">
                {formatTime(results.timeLimit)}
              </div>
              <div className="text-sm text-gray-600">Time Allowed</div>
            </div>
          </div>
        </div>

        {/* Difficulty Breakdown */}
        {results.difficultyPerformance.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Performance by Difficulty</h2>
            <div className="space-y-3">
              {results.difficultyPerformance.map((diff) => (
                <div key={diff.difficulty} className="flex items-center">
                  <div className="w-24 text-sm text-gray-600 capitalize">
                    {diff.difficulty.replace('_', ' ')}
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getPercentageColor(diff.percentage)}`}
                        style={{ width: `${diff.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-20 text-right text-sm">
                    {diff.correct}/{diff.total} ({diff.percentage}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subtopic Breakdown */}
        {results.subtopicPerformance.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Performance by Subtopic</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.subtopicPerformance
                .sort((a, b) => a.percentage - b.percentage)
                .map((sub) => (
                  <div key={sub.subtopic} className="flex items-center">
                    <div className="w-48 text-sm text-gray-600 truncate" title={sub.subtopic}>
                      {sub.subtopic}
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getPercentageColor(sub.percentage)}`}
                          style={{ width: `${sub.percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-20 text-right text-sm">
                      {sub.correct}/{sub.total} ({sub.percentage}%)
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-frcr-teal-600 text-white rounded-lg hover:bg-frcr-teal-700 transition-colors"
          >
            Start New Exam
          </button>
          <Link
            to="/faq"
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-center"
          >
            View FAQ
          </Link>
        </div>
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function getPercentageColor(percentage: number): string {
  if (percentage >= 80) return 'bg-green-500'
  if (percentage >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}
