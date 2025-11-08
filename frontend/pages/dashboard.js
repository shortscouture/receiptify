import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Dashboard.module.css';

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Dashboard - Receiptify</title>
      </Head>

      <nav className={styles.nav}>
        <h1>Receiptify</h1>
        <div className={styles.userSection}>
          {user.picture && (
            <img 
              src={user.picture} 
              alt={user.name} 
              className={styles.avatar}
            />
          )}
          <button onClick={logout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.welcomeSection}>
          <h2>Welcome, {user.name || user.email}!</h2>
          {user.picture && (
            <img 
              src={user.picture} 
              alt={user.name} 
              className={styles.profilePicture}
            />
          )}
        </div>
        
        <div className={styles.userInfo}>
          <h3>Your Profile</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <strong>Name:</strong> {user.name}
            </div>
            <div className={styles.infoItem}>
              <strong>Email:</strong> {user.email}
            </div>
            {user.givenName && (
              <div className={styles.infoItem}>
                <strong>First Name:</strong> {user.givenName}
              </div>
            )}
            {user.familyName && (
              <div className={styles.infoItem}>
                <strong>Last Name:</strong> {user.familyName}
              </div>
            )}
            <div className={styles.infoItem}>
              <strong>User ID:</strong> {user.id}
            </div>
          </div>
        </div>

        <div className={styles.content}>
          <h3>Getting Started with Receiptify</h3>
          <p>You're now logged in via Google OAuth! This is your protected dashboard.</p>
          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>📧</span>
              <h4>Sync Gmail Receipts</h4>
              <p>Automatically import receipts from your email</p>
              <Link href="/receipts" className={styles.featureButton}>
                View Receipts →
              </Link>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>📊</span>
              <h4>Track Expenses</h4>
              <p>Monitor your spending across categories</p>
              <Link href="/receipts" className={styles.featureButton}>
                Get Started →
              </Link>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🔍</span>
              <h4>Search & Filter</h4>
              <p>Find receipts quickly with powerful search</p>
              <Link href="/receipts" className={styles.featureButton}>
                Explore →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
