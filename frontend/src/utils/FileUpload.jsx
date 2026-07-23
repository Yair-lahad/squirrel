import { useState } from 'react';
import { uploadTransactions } from '../routes/upload';

export default function FileUpload({ onLoaded }) {
  const [status, setStatus] = useState({ message: '', error: false });

  async function handleChange(e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;

    setStatus({ message: 'Uploading…', error: false });
    try {
      const transactions = JSON.parse(await file.text());
      if (!Array.isArray(transactions)) {
        throw new Error('File must contain a JSON array of transactions');
      }
      await uploadTransactions(transactions, file.name);
      await onLoaded();
      setStatus({ message: `Loaded ${transactions.length} transactions from ${file.name}.`, error: false });
    } catch (err) {
      setStatus({ message: err.message, error: true });
    }
  }

  return (
    <div className="inline-loader">
      <label className="file-upload-label">
        Upload a transactions file
        <input type="file" accept="application/json,.json" onChange={handleChange} />
      </label>
      <span className={`status${status.error ? ' error' : ''}`}>{status.message}</span>
    </div>
  );
}
