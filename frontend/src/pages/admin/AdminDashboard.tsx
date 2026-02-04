import { useState, useEffect } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { useAuthFetch } from '../../contexts/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

interface OverviewStats {
  users: {
    total: number
    active: number
  }
  questions: {
    total: number
  }
  exams: {
    total: number
    completed: number
    averageScore: number
  }
  recentExams: Array<{
    id: string
    score: number | null
    percentage: number | null
    totalQuestions: number
    completedAt: string | null
  }>
}

export function AdminDashboard() {
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const fetchWithAuth = useAuthFetch()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetchWithAuth(`${API_URL}/admin/analytics/overview`)
        if (!response.ok) {
          throw new Error('Failed to fetch stats')
        }
        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats')
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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats?.users.total ?? 0}
            subtitle={`${stats?.users.active ?? 0} active`}
            icon="👥"
          />
          <StatCard
            title="Total Questions"
            value={stats?.questions.total ?? 0}
            subtitle="in question bank"
            icon="❓"
          />
          <StatCard
            title="Exams Completed"
            value={stats?.exams.completed ?? 0}
            subtitle={`${stats?.exams.total ?? 0} total started`}
            icon="📝"
          />
          <StatCard
            title="Average Score"
            value={`${stats?.exams.averageScore ?? 0}%`}
            subtitle="across all exams"
            icon="📊"
          />
        </div>

        {/* Recent exams */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Exams</h2>
          {stats?.recentExams && stats.recentExams.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Exam ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Questions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Completed
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentExams.map((exam) => (
                    <tr key={exam.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {exam.id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {exam.totalQuestions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`font-medium ${
                          (exam.percentage ?? 0) >= 70 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {exam.score}/{exam.totalQuestions} ({exam.percentage?.toFixed(1)}%)
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {exam.completedAt
                          ? new Date(exam.completedAt).toLocaleDateString()
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No exams completed yet.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  icon
}: {
  title: string
  value: number | string
  subtitle: string
  icon: string
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <span className="text-3xl mr-4">{icon}</span>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}
