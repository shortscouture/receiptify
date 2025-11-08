import Head from "next/head";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/Home.module.css";
import Link from "next/link";

export default function Home() {
  const { user, logout, loginWithGoogle, loading } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Receiptify - Your Smart Email Expense Tracker</title>
        <meta
          name="description"
          content="AI-powered expense tracker that automatically extracts and organizes your digital receipts from email"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navigation */}
      <nav className="w-full px-4 sm:px-6 lg:px-8 py-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-3xl">🧾</span>
            <h1 className="text-2xl font-bold text-gray-800">Receiptify</h1>
          </div>
          <div className="flex items-center space-x-4">
            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : user ? (
              <>
                <div className="flex items-center space-x-3">
                  {user.picture && (
                    <img 
                      src={user.picture} 
                      alt={user.name} 
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-gray-700 font-medium">{user.name || user.email}</span>
                </div>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all duration-200"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-gray-700 font-semibold rounded-lg border-2 border-gray-300 hover:border-red-500 hover:text-red-600 transition-all duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="flex items-center space-x-2 px-6 py-2 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-300 hover:border-blue-500 hover:shadow-md transition-all duration-200"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Sign in with Google</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="w-full">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-800 mb-6 leading-tight">
            Your Smart Email
            <br />
            <span className="text-blue-500">
              Expense Tracker
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Automatically extract and organize your digital receipts — right from your email.
            No more manual logging. Just tag or forward your receipt emails and let AI do the rest.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : user ? (
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
              >
                Go to Dashboard
              </Link>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="flex items-center space-x-3 px-8 py-4 bg-white text-gray-700 font-bold rounded-xl border-2 border-gray-300 hover:border-blue-500 hover:shadow-xl transition-all duration-200 text-lg transform hover:-translate-y-1"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Get Started with Google</span>
              </button>
            )}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-800 text-center mb-16">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-6 mx-auto">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                Email Monitoring
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Tag or forward your receipt emails. Our system continuously monitors your inbox
                and detects receipt emails automatically.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-6 mx-auto">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                AI Extraction
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Our AI-powered system parses receipt content and extracts structured data:
                date, merchant, category, amount, and more.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-6 mx-auto">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                Dashboard & Insights
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                View all your expenses in a centralized dashboard with filters, charts,
                and export options for better budgeting.
              </p>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-800 text-center mb-16">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-5xl mb-4">🧩</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Automated Receipt Detection
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Scans emails with specific tags or labels. Optionally forward to a unique
                address for seamless processing.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-5xl mb-4">🧠</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">AI-Powered Parsing</h3>
              <p className="text-gray-600 leading-relaxed">
                Uses advanced LLM to understand unstructured receipt text from various
                formats (Shopee, Grab, airlines, etc.) and automatically categorizes expenses.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Centralized Dashboard</h3>
              <p className="text-gray-600 leading-relaxed">
                View all processed receipts in a clean table format. Filter by category/date,
                edit entries, and export to CSV or Google Sheets.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Email Confirmation</h3>
              <p className="text-gray-600 leading-relaxed">
                Receive instant confirmation emails when receipts are logged. Get optional
                weekly/monthly spending summaries.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-5xl mb-4">🌐</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Visual Insights</h3>
              <p className="text-gray-600 leading-relaxed">
                Charts showing monthly spending, top categories, and trends over time to
                encourage better budgeting and expense awareness.
              </p>
            </div>
          </div>
        </section>

        {/* Data Flow Visualization */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-800 text-center mb-16">
            Core Logic Flow
          </h2>
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-200 shadow-lg">
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">📧 Email Monitoring</h3>
                  <p className="text-gray-600">
                    System continuously monitors inbox via Gmail API. Detects emails tagged
                    or labeled as "Receipts" to trigger extraction.
                  </p>
                </div>
                <div className="text-4xl text-blue-500">→</div>
                <div className="flex-1 bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">🤖 AI Extraction</h3>
                  <p className="text-gray-600">
                    LLM (Gemini, OpenRouter, or OpenAI) parses email content and extracts
                    structured JSON data: Date, Merchant, Category, Amount, SourceEmail, Notes.
                  </p>
                </div>
                <div className="text-4xl text-blue-500">→</div>
                <div className="flex-1 bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">💾 Data Storage</h3>
                  <p className="text-gray-600">
                    Extracted data stored securely in backend (Supabase/Firebase) and
                    automatically appears in web dashboard.
                  </p>
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-3">📱 Dashboard Interaction</h3>
                <p className="text-gray-600">
                  Users can view, edit, filter, and export expenses. Visualize spending patterns
                  via graphs and summaries for better budgeting.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-white rounded-3xl p-12 border border-gray-200 shadow-lg text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-6">
              Ready to Simplify Your Expense Tracking?
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Join Receiptify today and never manually log a receipt again. Start tracking
              your expenses automatically with AI-powered email parsing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {loading ? (
                <p className="text-gray-600">Loading...</p>
              ) : user ? (
                <Link
                  href="/dashboard"
                  className="px-8 py-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <button
                  onClick={loginWithGoogle}
                  className="flex items-center space-x-3 px-8 py-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Start Free with Google</span>
                </button>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full px-4 sm:px-6 lg:px-8 py-8 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600">
            &copy; 2025 Receiptify. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}