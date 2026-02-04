import { useState } from 'react'

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

interface QuestionEditorProps {
  question: Question | null
  isCreating: boolean
  onSave: (question: Partial<Question>) => Promise<void>
  onClose: () => void
}

export function QuestionEditor({ question, isCreating, onSave, onClose }: QuestionEditorProps) {
  const [formData, setFormData] = useState({
    stem: question?.stem || '',
    optionA: question?.optionA || '',
    optionB: question?.optionB || '',
    optionC: question?.optionC || '',
    optionD: question?.optionD || '',
    optionE: question?.optionE || '',
    correctAnswer: question?.correctAnswer || 'A',
    explanation: question?.explanation || '',
    subtopic: question?.subtopic || '',
    difficulty: question?.difficulty || 'medium',
    modality: question?.modality || '',
    learningPoint: question?.learningPoint || '',
    // V5 New Fields
    module: question?.module || '',
    system: question?.system || '',
    ageGroup: question?.ageGroup || '',
    clinicalContext: question?.clinicalContext || '',
    questionType: question?.questionType || '',
    imagingPhase: question?.imagingPhase || '',
    task: question?.task || '',
    discriminatorUsed: question?.discriminatorUsed || ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await onSave({
        ...formData,
        modality: formData.modality || null,
        learningPoint: formData.learningPoint || null,
        // V5 New Fields
        module: formData.module || null,
        system: formData.system || null,
        ageGroup: formData.ageGroup || null,
        clinicalContext: formData.clinicalContext || null,
        questionType: formData.questionType || null,
        imagingPhase: formData.imagingPhase || null,
        task: formData.task || null,
        discriminatorUsed: formData.discriminatorUsed || null
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save question')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {isCreating ? 'Create Question' : 'Edit Question'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Stem *
            </label>
            <textarea
              name="stem"
              value={formData.stem}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-frcr-teal-500 focus:border-frcr-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['A', 'B', 'C', 'D', 'E'].map((letter) => (
              <div key={letter}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Option {letter} *
                </label>
                <textarea
                  name={`option${letter}`}
                  value={formData[`option${letter}` as keyof typeof formData]}
                  onChange={handleChange}
                  required
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-frcr-teal-500 focus:border-frcr-teal-500"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correct Answer *
              </label>
              <select
                name="correctAnswer"
                value={formData.correctAnswer}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-frcr-teal-500 focus:border-frcr-teal-500"
              >
                {['A', 'B', 'C', 'D', 'E'].map((letter) => (
                  <option key={letter} value={letter}>{letter}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty *
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-frcr-teal-500 focus:border-frcr-teal-500"
              >
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="very_hard">Very Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modality
              </label>
              <input
                type="text"
                name="modality"
                value={formData.modality}
                onChange={handleChange}
                placeholder="e.g., CT, MRI, X-ray"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-frcr-teal-500 focus:border-frcr-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subtopic *
            </label>
            <input
              type="text"
              name="subtopic"
              value={formData.subtopic}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-frcr-teal-500 focus:border-frcr-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Explanation *
            </label>
            <textarea
              name="explanation"
              value={formData.explanation}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-frcr-teal-500 focus:border-frcr-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Learning Point
            </label>
            <textarea
              name="learningPoint"
              value={formData.learningPoint}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-frcr-teal-500 focus:border-frcr-teal-500"
            />
          </div>

          {/* V5 Metadata Fields */}
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">V5 Metadata</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Module
                </label>
                <select
                  name="module"
                  value={formData.module}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-frcr-teal-500 focus:border-frcr-teal-500"
                >
                  <option value="">Select Module</option>
                  <option value="CARDIOTHORACIC">Cardiothoracic</option>
                  <option value="MSK">MSK</option>
                  <option value="GI">GI</option>
                  <option value="GU">GU</option>
                  <option value="PAEDIATRIC">Paediatric</option>
                  <option value="CNS">CNS</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  System
                </label>
                <input
                  type="text"
                  name="system"
                  value={formData.system}
                  onChange={handleChange}
                  placeholder="e.g., cardiovascular_thoracic"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-frcr-teal-500 focus:border-frcr-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age Group
                </label>
                <select
                  name="ageGroup"
                  value={formData.ageGroup}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-frcr-teal-500 focus:border-frcr-teal-500"
                >
                  <option value="">Select Age Group</option>
                  <option value="adult">Adult</option>
                  <option value="paediatric">Paediatric</option>
                  <option value="neonatal">Neonatal</option>
                  <option value="elderly">Elderly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clinical Context
                </label>
                <select
                  name="clinicalContext"
                  value={formData.clinicalContext}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-frcr-teal-500 focus:border-frcr-teal-500"
                >
                  <option value="">Select Context</option>
                  <option value="emergency">Emergency</option>
                  <option value="diagnostic">Diagnostic</option>
                  <option value="staging">Staging</option>
                  <option value="screening">Screening</option>
                  <option value="intervention">Intervention</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Type
                </label>
                <select
                  name="questionType"
                  value={formData.questionType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-frcr-teal-500 focus:border-frcr-teal-500"
                >
                  <option value="">Select Type</option>
                  <option value="anatomy">Anatomy</option>
                  <option value="diagnosis">Diagnosis</option>
                  <option value="differential">Differential</option>
                  <option value="pattern_recognition">Pattern Recognition</option>
                  <option value="complication">Complication</option>
                  <option value="next_step">Next Step</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imaging Phase
                </label>
                <input
                  type="text"
                  name="imagingPhase"
                  value={formData.imagingPhase}
                  onChange={handleChange}
                  placeholder="e.g., arterial, portal_venous"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-frcr-teal-500 focus:border-frcr-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task
                </label>
                <input
                  type="text"
                  name="task"
                  value={formData.task}
                  onChange={handleChange}
                  placeholder="e.g., diagnosis, finding_interpretation"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-frcr-teal-500 focus:border-frcr-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discriminator Used
                </label>
                <input
                  type="text"
                  name="discriminatorUsed"
                  value={formData.discriminatorUsed}
                  onChange={handleChange}
                  placeholder="Key differentiating feature"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-frcr-teal-500 focus:border-frcr-teal-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-frcr-teal-600 text-white rounded-md hover:bg-frcr-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
