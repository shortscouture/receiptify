import Head from "next/head";
import Link from "next/link";

export default function Home() {
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
            <Link
              href="/login"
              className="px-4 py-2 text-gray-700 font-semibold rounded-lg border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all duration-200"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Register
            </Link>
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
            <Link
              href="/register"
              className="px-8 py-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-transparent text-gray-700 font-bold rounded-xl border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all duration-200 text-lg"
            >
              Sign In
            </Link>
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
              <Link
                href="/register"
                className="px-8 py-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
              >
                Start Free Trial
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-transparent text-gray-700 font-bold rounded-xl border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all duration-200 text-lg"
              >
                Already have an account?
              </Link>
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