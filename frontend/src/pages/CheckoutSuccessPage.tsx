import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function CheckoutSuccessPage() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [refreshing, setRefreshing] = useState(true)

  useEffect(() => {
    // Refresh user data to get updated subscription status
    const refresh = async () => {
      await refreshUser()
      setRefreshing(false)
    }
    refresh()
  }, [refreshUser])

  const startExam = () => {
    navigate(`/exam/new-${Date.now()}`)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-8">
          Thank you for subscribing. You now have full access to all 2,499 FRCR 2A practice questions.
        </p>

        {refreshing ? (
          <div className="text-gray-500">
            Updating your account...
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={startExam}
              className="w-full py-3 px-6 bg-frcr-teal-600 text-white rounded-lg font-semibold hover:bg-frcr-teal-700 transition-colors"
            >
              Start Practice Exam
            </button>

            <Link
              to="/"
              className="block w-full py-3 px-6 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        )}

        {/* Subscription Status */}
        {user && !refreshing && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Subscription status:{' '}
              <span className={`font-medium ${user.subscriptionStatus === 'active' ? 'text-green-600' : 'text-yellow-600'}`}>
                {user.subscriptionStatus === 'active' ? 'Active' : 'Processing...'}
              </span>
            </p>
            {user.subscriptionStatus !== 'active' && (
              <p className="text-xs text-gray-400 mt-1">
                Your subscription may take a moment to activate. Please refresh if needed.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
