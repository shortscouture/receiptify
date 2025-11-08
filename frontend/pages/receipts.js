import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Receipts.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function Receipts() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [receipts, setReceipts] = useState([]);
  const [loadingReceipts, setLoadingReceipts] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [filter, setFilter] = useState({
    category: 'all',
    dateFrom: '',
    dateTo: '',
    search: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    receiptCount: 0
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    } else if (user) {
      checkGmailStatus();
      fetchReceipts();
    }
  }, [user, loading, router]);

  const checkGmailStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/gmail/status`, {
        credentials: 'include'
      });
      const data = await response.json();
      setGmailConnected(data.connected);
    } catch (error) {
      console.error('Error checking Gmail status:', error);
    }
  };

  const fetchReceipts = async () => {
    try {
      setLoadingReceipts(true);
      const response = await fetch(`${API_URL}/api/receipts`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setReceipts(data.receipts || []);
        calculateStats(data.receipts || []);
      }
    } catch (error) {
      console.error('Error fetching receipts:', error);
    } finally {
      setLoadingReceipts(false);
    }
  };

  const calculateStats = (receiptsData) => {
    const total = receiptsData.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const thisMonthReceipts = receiptsData.filter(r => 
      new Date(r.datetime) >= firstDayOfMonth
    );
    const thisMonth = thisMonthReceipts.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
    
    setStats({
      total: total.toFixed(2),
      thisMonth: thisMonth.toFixed(2),
      receiptCount: receiptsData.length
    });
  };

  const handleSync = async (daysBack = 7) => {
    try {
      setSyncing(true);
      setSyncStatus(null);
      
      const response = await fetch(`${API_URL}/api/gmail/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ daysBack })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSyncStatus({
          type: 'success',
          message: `✅ Synced ${data.success} receipts! (${data.failed} failed)`
        });
        fetchReceipts(); // Refresh the list
      } else {
        setSyncStatus({
          type: 'error',
          message: `❌ Error: ${data.error || 'Failed to sync'}`
        });
      }
    } catch (error) {
      setSyncStatus({
        type: 'error',
        message: `❌ Error: ${error.message}`
      });
    } finally {
      setSyncing(false);
    }
  };

  const filteredReceipts = receipts.filter(receipt => {
    if (filter.category !== 'all' && receipt.category !== filter.category) {
      return false;
    }
    if (filter.search && !receipt.merchant.toLowerCase().includes(filter.search.toLowerCase())) {
      return false;
    }
    if (filter.dateFrom && new Date(receipt.datetime) < new Date(filter.dateFrom)) {
      return false;
    }
    if (filter.dateTo && new Date(receipt.datetime) > new Date(filter.dateTo)) {
      return false;
    }
    return true;
  });

  const categories = ['all', 'groceries', 'dining', 'shopping', 'transportation', 'utilities', 'entertainment', 'health', 'travel', 'other'];

  if (loading || !user) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>My Receipts - Receiptify</title>
      </Head>

      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navContent}>
          <Link href="/dashboard" className={styles.logo}>
            <span className={styles.logoIcon}>🧾</span>
            <span>Receiptify</span>
          </Link>
          <div className={styles.navLinks}>
            <Link href="/dashboard" className={styles.navLink}>Dashboard</Link>
            <Link href="/receipts" className={`${styles.navLink} ${styles.active}`}>Receipts</Link>
            <Link href="/receipts-upload" className={styles.navLink}>Upload</Link>
          </div>
          <div className={styles.userSection}>
            {user.picture && (
              <img src={user.picture} alt={user.name} className={styles.avatar} />
            )}
            <span className={styles.userName}>{user.name}</span>
          </div>
        </div>
      </nav>

      <main className={styles.main}>
        {/* Header Section */}
        <div className={styles.header}>
          <div>
            <h1>My Receipts</h1>
            <p className={styles.subtitle}>Track and manage your expenses</p>
          </div>
          
          {/* Gmail Sync Section */}
          <div className={styles.syncSection}>
            {!gmailConnected ? (
              <div className={styles.gmailWarning}>
                <p>⚠️ Gmail not connected</p>
                <p className={styles.smallText}>Re-authenticate to enable email sync</p>
              </div>
            ) : (
              <div className={styles.syncButtons}>
                <button 
                  onClick={() => handleSync(7)} 
                  disabled={syncing}
                  className={styles.syncButton}
                >
                  {syncing ? '⏳ Syncing...' : '🔄 Sync Last 7 Days'}
                </button>
                <button 
                  onClick={() => handleSync(30)} 
                  disabled={syncing}
                  className={styles.syncButtonSecondary}
                >
                  {syncing ? '⏳ Syncing...' : '📧 Sync Last 30 Days'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sync Status Message */}
        {syncStatus && (
          <div className={`${styles.alert} ${styles[syncStatus.type]}`}>
            {syncStatus.message}
          </div>
        )}

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>💰</div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Total Spending</p>
              <p className={styles.statValue}>${stats.total}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📅</div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>This Month</p>
              <p className={styles.statValue}>${stats.thisMonth}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🧾</div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Total Receipts</p>
              <p className={styles.statValue}>{stats.receiptCount}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          <select 
            value={filter.category} 
            onChange={(e) => setFilter({...filter, category: e.target.value})}
            className={styles.filterSelect}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
          
          <input
            type="text"
            placeholder="Search merchant..."
            value={filter.search}
            onChange={(e) => setFilter({...filter, search: e.target.value})}
            className={styles.filterInput}
          />
          
          <input
            type="date"
            value={filter.dateFrom}
            onChange={(e) => setFilter({...filter, dateFrom: e.target.value})}
            className={styles.filterDate}
            placeholder="From"
          />
          
          <input
            type="date"
            value={filter.dateTo}
            onChange={(e) => setFilter({...filter, dateTo: e.target.value})}
            className={styles.filterDate}
            placeholder="To"
          />

          {(filter.category !== 'all' || filter.search || filter.dateFrom || filter.dateTo) && (
            <button 
              onClick={() => setFilter({ category: 'all', dateFrom: '', dateTo: '', search: '' })}
              className={styles.clearFilters}
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Receipts Table */}
        <div className={styles.tableContainer}>
          {loadingReceipts ? (
            <div className={styles.loadingReceipts}>
              <div className={styles.spinner}></div>
              <p>Loading receipts...</p>
            </div>
          ) : filteredReceipts.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📭</span>
              <h3>No receipts found</h3>
              <p>
                {receipts.length === 0 
                  ? "Click 'Sync' to import receipts from your Gmail" 
                  : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Merchant</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Source</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredReceipts.map((receipt) => (
                  <tr key={receipt.id}>
                    <td>{new Date(receipt.datetime).toLocaleDateString()}</td>
                    <td className={styles.merchant}>{receipt.merchant}</td>
                    <td>
                      <span className={`${styles.categoryBadge} ${styles[receipt.category]}`}>
                        {receipt.category}
                      </span>
                    </td>
                    <td className={styles.amount}>
                      {receipt.currency || '$'}{parseFloat(receipt.amount).toFixed(2)}
                    </td>
                    <td className={styles.source}>
                      {receipt.sourceEmail ? (
                        <span title={receipt.sourceEmail}>📧 Email</span>
                      ) : (
                        <span>➕ Manual</span>
                      )}
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[receipt.status || 'processed']}`}>
                        {receipt.status || 'processed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Results Count */}
        {!loadingReceipts && filteredReceipts.length > 0 && (
          <div className={styles.resultsCount}>
            Showing {filteredReceipts.length} of {receipts.length} receipts
          </div>
        )}
      </main>
    </div>
  );
}
