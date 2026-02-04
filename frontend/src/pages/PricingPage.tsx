import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, useAuthFetch } from '../contexts/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

export function PricingPage() {
  const { user } = useAuth()
  const fetchWithAuth = useAuthFetch()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/register?redirect=/pricing')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetchWithAuth(`${API_URL}/stripe/create-checkout-session`, {
        method: 'POST',
        body: JSON.stringify({
          successUrl: `${window.location.origin}/checkout/success`,
          cancelUrl: `${window.location.origin}/pricing`
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create checkout session')
      }

      const { url } = await response.json()

      // Redirect to Stripe Checkout
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetchWithAuth(`${API_URL}/stripe/create-portal-session`, {
        method: 'POST',
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/pricing`
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create portal session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  const isSubscribed = user?.subscriptionStatus === 'active'

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-frcr-teal-700">
              FRCR 2A Exam Platform
            </Link>
            <nav className="flex items-center space-x-4">
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
              {user ? (
                <span className="text-gray-600">{user.email}</span>
              ) : (
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Sign in
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600">
            Get unlimited access to all 2,499 FRCR 2A practice questions
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
            {error}
          </div>
        )}

        {/* Pricing Card */}
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-frcr-teal-600 px-8 py-6 text-white text-center">
              <h2 className="text-2xl font-bold">Premium Access</h2>
              <p className="text-frcr-teal-100 mt-1">Full question bank access</p>
            </div>

            <div className="px-8 py-8">
              <div className="text-center mb-6">
                <span className="text-5xl font-bold text-gray-900">£29</span>
                <span className="text-gray-500">/month</span>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">
                    <strong>2,499 practice questions</strong> across all FRCR 2A topics
                  </span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">
                    <strong>Timed practice exams</strong> simulating real exam conditions
                  </span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">
                    <strong>Detailed explanations</strong> for every answer option
                  </span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">
                    <strong>Performance analytics</strong> to track your progress
                  </span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">
                    <strong>Cancel anytime</strong> - no long-term commitment
                  </span>
                </li>
              </ul>

              {isSubscribed ? (
                <div className="space-y-3">
                  <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                    You have an active subscription
                  </div>
                  <button
                    onClick={handleManageSubscription}
                    disabled={loading}
                    className="w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'Manage Subscription'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="w-full py-4 px-6 bg-frcr-teal-600 text-white rounded-lg font-semibold text-lg hover:bg-frcr-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : user ? 'Subscribe Now' : 'Sign Up to Subscribe'}
                </button>
              )}
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Secure payment powered by Stripe</p>
            <p className="mt-2">Questions written by UK radiology consultants</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I cancel my subscription?
              </h3>
              <p className="text-gray-600">
                Yes, you can cancel anytime from your account settings. You'll retain access until the end of your billing period.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit and debit cards through our secure payment partner, Stripe.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="font-semibold text-gray-900 mb-2">
                How are the questions created?
              </h3>
              <p className="text-gray-600">
                All questions are written and reviewed by UK radiology consultants with experience in FRCR examination preparation.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
