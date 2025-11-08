import Head from "next/head";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/Home.module.css";

export default function Home() {
  const { user, logout, loginWithGoogle, loading } = useAuth();

  return (
    <div className={styles.container}>
      <Head>
        <title>Receiptify - Digital Receipt Manager</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <span className={styles.brand}>Receiptify</span>
        </h1>

        <p className={styles.description}>
          Your smart digital receipt management solution
        </p>

        <div className={styles.authSection}>
          {loading ? (
            <p>Loading...</p>
          ) : user ? (
            <>
              <div className={styles.userWelcome}>
                {user.picture && (
                  <img src={user.picture} alt={user.name} className={styles.userAvatar} />
                )}
                <p className={styles.welcomeText}>
                  Welcome back, {user.name || user.email}!
                </p>
              </div>
              <div className={styles.buttonGroup}>
                <a href="/dashboard" className={styles.button}>
                  Go to Dashboard
                </a>
                <button onClick={logout} className={styles.buttonSecondary}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className={styles.buttonGroup}>
              <button onClick={loginWithGoogle} className={styles.googleButton}>
                <svg className={styles.googleIcon} viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </button>
            </div>
          )}
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>🔐 Secure Google OAuth</h3>
            <p>Sign in securely with your Google account</p>
          </div>

          <div className={styles.card}>
            <h3>📱 Easy to Use</h3>
            <p>Simple and intuitive interface for managing receipts</p>
          </div>

          <div className={styles.card}>
            <h3>☁️ Cloud Storage</h3>
            <p>Access your receipts from anywhere, anytime</p>
          </div>

          <div className={styles.card}>
            <h3>📊 Analytics</h3>
            <p>Track your spending and generate reports</p>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Built with Next.js, Express, and Google OAuth</p>
      </footer>
    </div>
  );
}
