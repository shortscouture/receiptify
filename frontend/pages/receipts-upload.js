import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/Upload.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const CATEGORY_OPTIONS = ['groceries', 'dining', 'shopping', 'transportation', 'utilities', 'entertainment', 'health', 'travel', 'other'];
const STATUS_OPTIONS = ['processed', 'manual_review', 'pending'];

const initialFormState = {
  datetime: '',
  merchant: '',
  category: 'other',
  amount: '',
  currency: 'USD',
  notes: '',
  status: 'processed'
};

const toDateTimeLocalValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const offsetMs = date.getTimezoneOffset() * 60000;
  const localISOTime = new Date(date.getTime() - offsetMs).toISOString();
  return localISOTime.slice(0, 16);
};

export default function ReceiptImageUpload() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [formValues, setFormValues] = useState(initialFormState);
  const [saveStatus, setSaveStatus] = useState(null);
  const [savedReceipt, setSavedReceipt] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);

  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  useEffect(() => {
    if (result?.extracted) {
      const extracted = result.extracted;
      const normalizedCategory = (extracted.category || 'other').toLowerCase();
      const safeCategory = CATEGORY_OPTIONS.includes(normalizedCategory) ? normalizedCategory : 'other';
      setFormValues({
        datetime: toDateTimeLocalValue(extracted.datetime),
        merchant: extracted.merchant || '',
        category: safeCategory,
        amount: extracted.amount !== null && extracted.amount !== undefined ? String(Number(extracted.amount).toFixed(2)) : '',
        currency: extracted.currency ? String(extracted.currency).toUpperCase() : 'USD',
        notes: extracted.notes || '',
        status: extracted.confidence === 'low' ? 'manual_review' : 'processed'
      });
      setSaveStatus(null);
      setSavedReceipt(null);
    }
  }, [result]);

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0];
    setResult(null);
    setSavedReceipt(null);
    setSaveStatus(null);

    if (!selected) {
      setFile(null);
      setFilePreview(null);
      return;
    }

    if (!selected.type.startsWith('image/')) {
      setError('Please choose an image file (jpeg, png, webp, etc).');
      setFile(null);
      setFilePreview(null);
      return;
    }

    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }

    setFile(selected);
    setFilePreview(URL.createObjectURL(selected));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setError('Select a receipt image before uploading.');
      return;
    }

    try {
      setIsUploading(true);
      setError('');
      setResult(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/api/receipts/parse/image`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        const message = data?.details || data?.error || 'Upload failed';
        throw new Error(message);
      }

      setResult(data);
    } catch (uploadError) {
      setError(uploadError.message || 'Unexpected error while uploading.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFieldChange = (field) => (event) => {
    let { value } = event.target;

    if (field === 'currency') {
      value = value.toUpperCase().slice(0, 3);
    }

    setFormValues((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveReceipt = async (event) => {
    event.preventDefault();
    setSaveStatus(null);

    if (!formValues.datetime || !formValues.merchant || !formValues.category || !formValues.amount) {
      setSaveStatus({ type: 'error', message: 'Datetime, merchant, category, and amount are required.' });
      return;
    }

    const datetimeISO = (() => {
      const inputValue = formValues.datetime;
      const date = new Date(inputValue);
      return Number.isNaN(date.getTime()) ? null : date.toISOString();
    })();

    if (!datetimeISO) {
      setSaveStatus({ type: 'error', message: 'Datetime is not valid. Please fix it before saving.' });
      return;
    }

    const amountNumber = Number(formValues.amount);
    if (Number.isNaN(amountNumber) || amountNumber <= 0) {
      setSaveStatus({ type: 'error', message: 'Amount must be a positive number.' });
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        datetime: datetimeISO,
        merchant: formValues.merchant.trim(),
        category: formValues.category,
        amount: amountNumber,
        currency: formValues.currency || 'USD',
        notes: formValues.notes || null,
        status: formValues.status || 'processed'
      };

      const response = await fetch(`${API_URL}/api/receipts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        const message = data?.details || data?.error || 'Failed to save receipt';
        throw new Error(message);
      }

      setSavedReceipt(data.receipt);
      setSaveStatus({ type: 'success', message: 'Receipt saved! You can review it on the Receipts page.' });
    } catch (saveError) {
      setSaveStatus({ type: 'error', message: saveError.message || 'Unexpected error while saving receipt.' });
    } finally {
      setIsSaving(false);
    }
  };

  const extractedJson = useMemo(() => {
    if (!result?.extracted) {
      return null;
    }

    return JSON.stringify(result.extracted, null, 2);
  }, [result]);

  if (loading || !user) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Checking session…</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Head>
        <title>Upload Receipt Image - Receiptify</title>
      </Head>

      <nav className={styles.nav}>
        <div className={styles.navContent}>
          <Link href="/dashboard" className={styles.logo}>
            <span className={styles.logoIcon}>🧾</span>
            <span>Receiptify</span>
          </Link>
          <div className={styles.navLinks}>
            <Link href="/dashboard" className={styles.navLink}>Dashboard</Link>
            <Link href="/receipts" className={styles.navLink}>Receipts</Link>
            <Link href="/receipts-upload" className={`${styles.navLink} ${styles.active}`}>Upload</Link>
          </div>
        </div>
      </nav>

      <main className={styles.main}>
        <section className={styles.card}>
          <header className={styles.cardHeader}>
            <div>
              <h1>Try a Receipt Image</h1>
              <p>Upload a photo or screenshot of a receipt to see the parsed fields from the new Gemini endpoint.</p>
            </div>
            <div className={styles.hintBox}>
              <p className={styles.hintTitle}>Tips</p>
              <ul>
                <li>Use clear images (JPG, PNG, WEBP).</li>
                <li>Maximum size respects <code>RECEIPT_UPLOAD_MAX_BYTES</code> (defaults to 5MB).</li>
                <li>Results appear below with raw JSON for inspection.</li>
              </ul>
            </div>
          </header>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.fileInputLabel}>
              <span>Select a receipt image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>

            {file && (
              <div className={styles.fileMeta}>
                <p><strong>Selected file:</strong> {file.name}</p>
                <p>{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            )}

            {filePreview && (
              <div className={styles.previewWrapper}>
                <p className={styles.previewTitle}>Preview</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={filePreview} alt="Receipt preview" className={styles.previewImage} />
              </div>
            )}

            <button type="submit" className={styles.submitButton} disabled={isUploading}>
              {isUploading ? 'Analyzing…' : 'Upload & Extract'}
            </button>
          </form>

          {error && (
            <div className={styles.errorBox}>
              <p>⚠️ {error}</p>
            </div>
          )}

          {result && (
            <div className={styles.resultCard}>
              <h2>Extracted Values</h2>
              {result.extracted ? (
                <pre className={styles.jsonBlock}>{extractedJson}</pre>
              ) : (
                <p>No structured data returned.</p>
              )}

              {result.source && (
                <div className={styles.sourceMeta}>
                  <p><strong>File name:</strong> {result.source.filename}</p>
                  <p><strong>MIME type:</strong> {result.source.mimetype}</p>
                  <p><strong>Uploaded size:</strong> {(result.source.size / 1024).toFixed(1)} KB</p>
                </div>
              )}

              {result.extracted && (
                <form className={styles.editForm} onSubmit={handleSaveReceipt}>
                  <h3>Edit & Save Receipt</h3>
                  <div className={styles.formGrid}>
                    <label className={styles.formControl}>
                      <span>Date & Time</span>
                      <input
                        type="datetime-local"
                        value={formValues.datetime}
                        onChange={handleFieldChange('datetime')}
                        required
                      />
                    </label>
                    <label className={styles.formControl}>
                      <span>Merchant</span>
                      <input
                        type="text"
                        value={formValues.merchant}
                        onChange={handleFieldChange('merchant')}
                        required
                      />
                    </label>
                    <label className={styles.formControl}>
                      <span>Category</span>
                      <select
                        value={formValues.category}
                        onChange={handleFieldChange('category')}
                        required
                      >
                        {CATEGORY_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className={styles.formControl}>
                      <span>Amount</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formValues.amount}
                        onChange={handleFieldChange('amount')}
                        required
                      />
                    </label>
                    <label className={styles.formControl}>
                      <span>Currency</span>
                      <input
                        type="text"
                        value={formValues.currency}
                        onChange={handleFieldChange('currency')}
                        maxLength={3}
                      />
                    </label>
                    <label className={styles.formControl}>
                      <span>Status</span>
                      <select
                        value={formValues.status}
                        onChange={handleFieldChange('status')}
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option.replace('_', ' ')}
                          </option>
                        ))}
                        <option value="failed">failed</option>
                      </select>
                    </label>
                  </div>
                  <label className={styles.formControlFull}>
                    <span>Notes</span>
                    <textarea
                      value={formValues.notes}
                      onChange={handleFieldChange('notes')}
                      rows={4}
                      placeholder="Optional extra context or items"
                    ></textarea>
                  </label>

                  {saveStatus && (
                    <div className={
                      saveStatus.type === 'success' ? styles.successBox : styles.errorBox
                    }>
                      <p>
                        {saveStatus.type === 'success' ? '✅ ' : '⚠️ '}
                        {saveStatus.message}
                      </p>
                      {saveStatus.type === 'success' && (
                        <Link href="/receipts" className={styles.linkButton}>
                          View in Receipts →
                        </Link>
                      )}
                    </div>
                  )}

                  {savedReceipt && (
                    <div className={styles.savedMeta}>
                      <p><strong>Receipt ID:</strong> {savedReceipt.id}</p>
                      <p><strong>Amount:</strong> {savedReceipt.currency || 'USD'}{Number(savedReceipt.amount).toFixed(2)}</p>
                    </div>
                  )}

                  <div className={styles.actionsRow}>
                    <button type="submit" className={styles.saveButton} disabled={isSaving}>
                      {isSaving ? 'Saving…' : 'Save Receipt'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
