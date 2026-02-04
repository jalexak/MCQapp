import { Link } from 'react-router-dom'

export function FAQPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="text-frcr-teal-600 hover:text-frcr-teal-700 mb-4 inline-block"
          >
            &larr; Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-frcr-teal-700">
            Frequently Asked Questions
          </h1>
        </div>

        {/* FAQ Content */}
        <div className="space-y-6">
          {/* Ranking FAQ */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              How is my ranking calculated?
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 mb-4">
                Your ranking compares your performance to other candidates <strong>on the same questions you attempted</strong>. Since each exam contains a random selection of questions, we use a difficulty-weighted scoring system to ensure fair comparison.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">How it works:</h3>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">
                    1. Question difficulty is determined entirely by real candidate data
                  </h4>
                  <p className="text-gray-600 text-sm">
                    We do not use arbitrary difficulty labels. Each question's difficulty is calculated from how all candidates actually performed on it. If only 30% of candidates answer a question correctly, it's hard. If 90% get it right, it's easy. This updates continuously as more candidates complete exams.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">
                    2. Your score accounts for difficulty
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Getting a hard question correct earns more credit than getting an easy question correct. Conversely, missing an easy question (one most people get right) has a larger impact than missing a hard question.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">
                    3. Fair comparison across different exams
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Because we evaluate each question individually based on its actual difficulty, your ranking is comparable to other candidates even though you answered different questions.
                  </p>
                </div>
              </div>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">Scoring formula:</h3>
              <div className="bg-frcr-teal-50 p-4 rounded-lg font-mono text-sm">
                <p className="text-gray-700">
                  <strong>Correct answer:</strong> +(1 - success rate) &mdash; Hard questions worth more
                </p>
                <p className="text-gray-700 mt-1">
                  <strong>Incorrect answer:</strong> -(success rate) &mdash; Easy questions penalise more
                </p>
              </div>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">Example:</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left border-b">Question</th>
                      <th className="px-4 py-2 text-left border-b">Success Rate</th>
                      <th className="px-4 py-2 text-left border-b">Your Answer</th>
                      <th className="px-4 py-2 text-left border-b">Your Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 border-b">Q1</td>
                      <td className="px-4 py-2 border-b">30% (hard)</td>
                      <td className="px-4 py-2 border-b text-green-600">&#10003; Correct</td>
                      <td className="px-4 py-2 border-b font-medium text-green-600">+0.70</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-b">Q2</td>
                      <td className="px-4 py-2 border-b">90% (easy)</td>
                      <td className="px-4 py-2 border-b text-green-600">&#10003; Correct</td>
                      <td className="px-4 py-2 border-b font-medium text-green-600">+0.10</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-b">Q3</td>
                      <td className="px-4 py-2 border-b">60% (medium)</td>
                      <td className="px-4 py-2 border-b text-red-600">&#10007; Wrong</td>
                      <td className="px-4 py-2 border-b font-medium text-red-600">-0.60</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-gray-600 mt-4">
                Your final percentile shows how you compare to all other candidates who have completed exams on this platform.
              </p>
            </div>
          </div>

          {/* Other FAQs */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              What is the FRCR 2A Exam?
            </h2>
            <p className="text-gray-600">
              The FRCR (Fellowship of the Royal College of Radiologists) Part 2A is a written examination for radiology trainees. It tests knowledge across all areas of clinical radiology through multiple choice questions (MCQs).
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              How many questions are in each exam?
            </h2>
            <p className="text-gray-600">
              Practice exams on this platform contain 30 questions with 90 seconds per question (45 minutes total). This allows for focused practice sessions while maintaining the time pressure of the actual exam.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              What is the pass mark?
            </h2>
            <p className="text-gray-600">
              While the official FRCR 2A pass mark varies, we use 70% as a guideline for practice exams. Focus on understanding the explanations for incorrect answers to improve your knowledge.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              How are questions selected?
            </h2>
            <p className="text-gray-600">
              Questions are randomly selected from our bank of 2,499 questions covering 175 subtopics. Each exam provides a different selection, ensuring comprehensive coverage over multiple practice sessions.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Can I review my answers after the exam?
            </h2>
            <p className="text-gray-600">
              Yes! After completing an exam, you can review each question with the correct answer and detailed explanation. Use this to identify weak areas and reinforce your learning.
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="px-6 py-3 bg-frcr-teal-600 text-white rounded-lg hover:bg-frcr-teal-700 transition-colors inline-block"
          >
            Start Practice Exam
          </Link>
        </div>
      </div>
    </div>
  )
}
