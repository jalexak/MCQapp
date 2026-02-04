import { useState, useEffect } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { useAuthFetch } from '../../contexts/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

interface ExamStats {
  totalExams: number
  averageScore: number
  distribution: {
    '0-50': number
    '50-70': number
    '70-85': number
    '85-100': number
  }
  examsPerDay: Record<string, number>
}

interface QuestionStats {
  hardestQuestions: Array<{
    questionId: string
    attempts: number
    correct: number
    successRate: number
  }>
  easiestQuestions: Array<{
    questionId: string
    attempts: number
    correct: number
    successRate: number
  }>
  subtopicPerformance: Array<{
    subtopic: string
    attempts: number
    successRate: number
  }>
}

export function Analytics() {
  const [examStats, setExamStats] = useState<ExamStats | null>(null)
  const [questionStats, setQuestionStats] = useState<QuestionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'exams' | 'questions'>('exams')

  const fetchWithAuth = useAuthFetch()

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const [examRes, questionRes] = await Promise.all([
          fetchWithAuth(`${API_URL}/admin/analytics/exams`),
          fetchWithAuth(`${API_URL}/admin/analytics/questions`)
        ])

        if (!examRes.ok || !questionRes.ok) {
          throw new Error('Failed to fetch analytics')
        }

        const [examData, questionData] = await Promise.all([
          examRes.json(),
          questionRes.json()
        ])

        setExamStats(examData)
        setQuestionStats(questionData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-frcr-teal-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('exams')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'exams'
                  ? 'border-frcr-teal-500 text-frcr-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Exam Analytics
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'questions'
                  ? 'border-frcr-teal-500 text-frcr-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Question Analytics
            </button>
          </nav>
        </div>

        {activeTab === 'exams' && examStats && (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-500">Total Exams</p>
                <p className="text-3xl font-bold text-gray-900">{examStats.totalExams}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-500">Average Score</p>
                <p className="text-3xl font-bold text-gray-900">{examStats.averageScore}%</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-500">Pass Rate (70%+)</p>
                <p className="text-3xl font-bold text-gray-900">
                  {examStats.totalExams > 0
                    ? Math.round(((examStats.distribution['70-85'] + examStats.distribution['85-100']) / examStats.totalExams) * 100)
                    : 0}%
                </p>
              </div>
            </div>

            {/* Score distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Distribution</h3>
              <div className="space-y-4">
                {Object.entries(examStats.distribution).map(([range, count]) => {
                  const percentage = examStats.totalExams > 0 ? (count / examStats.totalExams) * 100 : 0
                  return (
                    <div key={range}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{range}%</span>
                        <span className="text-gray-900 font-medium">{count} exams ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            range === '85-100' ? 'bg-green-500' :
                            range === '70-85' ? 'bg-blue-500' :
                            range === '50-70' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'questions' && questionStats && (
          <div className="space-y-6">
            {/* Hardest questions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hardest Questions (Lowest Success Rate)</h3>
              {questionStats.hardestQuestions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Question ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Attempts</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Correct</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Success Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {questionStats.hardestQuestions.slice(0, 10).map((q) => (
                        <tr key={q.questionId}>
                          <td className="px-4 py-2 text-sm text-gray-900">{q.questionId.slice(0, 20)}...</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{q.attempts}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{q.correct}</td>
                          <td className="px-4 py-2 text-sm">
                            <span className="text-red-600 font-medium">{q.successRate}%</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No data available yet.</p>
              )}
            </div>

            {/* Subtopic performance */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subtopic Performance (Lowest Success Rate First)</h3>
              {questionStats.subtopicPerformance.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subtopic</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Attempts</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Success Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {questionStats.subtopicPerformance.slice(0, 15).map((s) => (
                        <tr key={s.subtopic}>
                          <td className="px-4 py-2 text-sm text-gray-900">{s.subtopic}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{s.attempts}</td>
                          <td className="px-4 py-2 text-sm">
                            <div className="flex items-center">
                              <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    s.successRate >= 70 ? 'bg-green-500' :
                                    s.successRate >= 50 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${s.successRate}%` }}
                                />
                              </div>
                              <span className="text-gray-900">{s.successRate}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No data available yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
