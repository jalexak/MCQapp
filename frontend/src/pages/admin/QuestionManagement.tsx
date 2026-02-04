import { useState, useEffect } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { QuestionEditor } from '../../components/admin/QuestionEditor'
import { useAuthFetch } from '../../contexts/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

interface Question {
  id: string
  stem: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  optionE: string
  correctAnswer: string
  explanation: string
  explanationMatrix: Record<string, unknown>
  subtopic: string
  difficulty: string
  modality: string | null
  learningPoint: string | null
  createdAt: string
  // V5 New Fields
  module: string | null
  system: string | null
  ageGroup: string | null
  clinicalContext: string | null
  questionType: string | null
  imagingPhase: string | null
  task: string | null
  discriminatorUsed: string | null
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function QuestionManagement() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [subtopic, setSubtopic] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const fetchWithAuth = useAuthFetch()

  const fetchQuestions = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20'
      })
      if (search) params.set('search', search)
      if (subtopic) params.set('subtopic', subtopic)
      if (difficulty) params.set('difficulty', difficulty)

      const response = await fetchWithAuth(`${API_URL}/admin/questions?${params}`)
      if (!response.ok) throw new Error('Failed to fetch questions')

      const data = await response.json()
      setQuestions(data.questions)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load questions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [subtopic, difficulty])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchQuestions(1)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return

    try {
      const response = await fetchWithAuth(`${API_URL}/admin/questions/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete question')
      fetchQuestions(pagination.page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete question')
    }
  }

  const handleEdit = (question: Question) => {
    setSelectedQuestion(question)
    setIsCreating(false)
    setShowEditor(true)
  }

  const handleCreate = () => {
    setSelectedQuestion(null)
    setIsCreating(true)
    setShowEditor(true)
  }

  const handleSave = async (question: Partial<Question>) => {
    try {
      const url = isCreating
        ? `${API_URL}/admin/questions`
        : `${API_URL}/admin/questions/${selectedQuestion?.id}`

      const response = await fetchWithAuth(url, {
        method: isCreating ? 'POST' : 'PUT',
        body: JSON.stringify(question)
      })

      if (!response.ok) throw new Error('Failed to save question')

      setShowEditor(false)
      fetchQuestions(pagination.page)
    } catch (err) {
      throw err
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Question Management</h1>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-frcr-teal-600 text-white rounded-md hover:bg-frcr-teal-700"
          >
            Add Question
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-md focus:ring-frcr-teal-500 focus:border-frcr-teal-500"
            />
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-frcr-teal-500 focus:border-frcr-teal-500"
            >
              <option value="">All Difficulties</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="very_hard">Very Hard</option>
            </select>
            <input
              type="text"
              placeholder="Subtopic..."
              value={subtopic}
              onChange={(e) => setSubtopic(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-frcr-teal-500 focus:border-frcr-teal-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-frcr-teal-600 text-white rounded-md hover:bg-frcr-teal-700"
            >
              Search
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>
        )}

        {/* Questions table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-frcr-teal-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Question
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Subtopic
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Difficulty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {questions.map((q) => (
                      <tr key={q.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {q.id.slice(0, 12)}...
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                          {q.stem.slice(0, 100)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {q.subtopic}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            q.difficulty === 'medium' ? 'bg-green-100 text-green-800' :
                            q.difficulty === 'hard' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {q.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <button
                            onClick={() => handleEdit(q)}
                            className="text-frcr-teal-600 hover:text-frcr-teal-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(q.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} questions
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => fetchQuestions(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchQuestions(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Editor modal */}
        {showEditor && (
          <QuestionEditor
            question={selectedQuestion}
            isCreating={isCreating}
            onSave={handleSave}
            onClose={() => setShowEditor(false)}
          />
        )}
      </div>
    </AdminLayout>
  )
}
