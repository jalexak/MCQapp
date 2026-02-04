import { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface SubscriptionGateProps {
  children: ReactNode
}

/**
 * Component that gates content behind subscription requirement.
 * Shows upgrade prompt if user is not subscribed.
 */
export function SubscriptionGate({ children }: SubscriptionGateProps) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  // Not logged in - redirect to login
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-frcr-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-frcr-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Sign in Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please sign in to access the exam platform.
          </p>
          <div className="space-y-3">
            <Link
              to="/login"
              className="block w-full py-3 px-6 bg-frcr-teal-600 text-white rounded-lg font-semibold hover:bg-frcr-teal-700 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="block w-full py-3 px-6 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Check for active subscription (also allow admins full access)
  const hasAccess = user.subscriptionStatus === 'active' || user.role === 'admin'

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Subscription Required
          </h2>
          <p className="text-gray-600 mb-6">
            Unlock access to 2,499 practice questions and detailed explanations with a premium subscription.
          </p>

          {user.subscriptionStatus === 'past_due' && (
            <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
              Your payment is past due. Please update your payment method to restore access.
            </div>
          )}

          {user.subscriptionStatus === 'cancelled' && user.subscriptionEnd && (
            <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 text-sm">
              Your subscription ended on {new Date(user.subscriptionEnd).toLocaleDateString('en-GB')}.
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => navigate('/pricing')}
              className="w-full py-3 px-6 bg-frcr-teal-600 text-white rounded-lg font-semibold hover:bg-frcr-teal-700 transition-colors"
            >
              View Pricing
            </button>
            <Link
              to="/"
              className="block w-full py-3 px-6 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Return to Home
            </Link>
          </div>

          {/* Feature preview */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-left">
            <h3 className="font-medium text-gray-900 mb-3">What you'll get:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                2,499 practice questions
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Detailed explanations
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Performance tracking
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Unlimited exam attempts
              </li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // User has access - render children
  return <>{children}</>
}
