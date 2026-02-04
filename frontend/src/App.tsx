import { Routes, Route, useNavigate, Link } from 'react-router-dom'
import {
  ExamPage,
  ResultsPage,
  FAQPage,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  PricingPage,
  CheckoutSuccessPage,
  AdminDashboard,
  QuestionManagement,
  UserManagement,
  Analytics
} from './pages'
import { ProtectedRoute } from './components/ProtectedRoute'
import { SubscriptionGate } from './components/SubscriptionGate'
import { useAuth } from './contexts/AuthContext'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/checkout/success" element={<CheckoutSuccessPage />} />

        {/* Exam routes - require subscription */}
        <Route path="/exam/:sessionId" element={
          <SubscriptionGate>
            <ExamPage />
          </SubscriptionGate>
        } />
        <Route path="/results/:sessionId" element={
          <SubscriptionGate>
            <ResultsPage />
          </SubscriptionGate>
        } />

        {/* Admin routes - require admin role */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/questions"
          element={
            <ProtectedRoute requireAdmin>
              <QuestionManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requireAdmin>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute requireAdmin>
              <Analytics />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}

function HomePage() {
  const navigate = useNavigate()
  const { user, logout, isAdmin } = useAuth()

  const startExam = () => {
    navigate(`/exam/new-${Date.now()}`)
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-frcr-teal-700">
              FRCR 2A Exam Platform
            </h1>
            <nav className="flex items-center space-x-4">
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              <Link to="/faq" className="text-gray-600 hover:text-gray-900">
                FAQ
              </Link>
              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="text-frcr-teal-600 hover:text-frcr-teal-700 font-medium"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <span className="text-gray-600">{user.email}</span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-frcr-teal-600 text-white rounded-md hover:bg-frcr-teal-700"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="text-center max-w-2xl">
          <h2 className="text-4xl font-bold text-frcr-teal-700 mb-4">
            FRCR 2A Exam Practice
          </h2>
          <p className="text-gray-600 mb-8">
            Prepare for your FRCR 2A radiology exam with our comprehensive question bank
            featuring 2,499 practice questions across all imaging modalities.
          </p>

          <div className="space-y-4">
            {/* Show subscription status if logged in but not subscribed */}
            {user && user.subscriptionStatus !== 'active' && user.role !== 'admin' && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                Subscribe to unlock full access to all questions
              </div>
            )}

            {/* Show active badge if subscribed */}
            {user && (user.subscriptionStatus === 'active' || user.role === 'admin') && (
              <div className="mb-4 inline-block px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                {user.role === 'admin' ? 'Admin Access' : 'Premium Access'}
              </div>
            )}

            <button
              className="w-full max-w-sm px-6 py-3 bg-frcr-teal-600 text-white rounded-lg hover:bg-frcr-teal-700 transition-colors text-lg font-medium"
              onClick={startExam}
            >
              Start Practice Exam
            </button>
            <p className="text-sm text-gray-500">
              30 questions | 45 minutes | Random selection from question bank
            </p>

            {/* CTA for non-subscribers */}
            {(!user || (user.subscriptionStatus !== 'active' && user.role !== 'admin')) && (
              <Link
                to="/pricing"
                className="inline-block mt-2 text-frcr-teal-600 hover:text-frcr-teal-700 font-medium"
              >
                View pricing plans
              </Link>
            )}
          </div>

          {/* Features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-3xl mb-2">📚</div>
              <h3 className="font-semibold text-gray-900">2,499 Questions</h3>
              <p className="text-sm text-gray-500">
                Comprehensive coverage across all FRCR 2A syllabus topics
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-3xl mb-2">⏱️</div>
              <h3 className="font-semibold text-gray-900">Timed Practice</h3>
              <p className="text-sm text-gray-500">
                Simulate real exam conditions with 90-second per question timer
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-semibold text-gray-900">Detailed Feedback</h3>
              <p className="text-sm text-gray-500">
                Learn from comprehensive explanations for every answer
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
