import { useRef, useState } from 'react';
import { uploadTransactions, uploadDocFile } from '../routes/upload';
import Button from '../components/ui/Button';

export default function FileUpload({ onLoaded }) {
  const inputRef = useRef(null);
  const [status, setStatus] = useState({ message: '', error: false });

  async function handleChange(e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;

    const isJson = file.name.toLowerCase().endsWith('.json');
    setStatus({ message: 'Processing file…', error: false });
    try {
      const stored = isJson ? await uploadJsonFile(file) : await uploadDocFile(file);
      await onLoaded();
      setStatus({ message: `Loaded ${stored.length} transactions from ${file.name}.`, error: false });
    } catch (err) {
      setStatus({ message: err.message, error: true });
    }
  }

  async function uploadJsonFile(file) {
    const transactions = JSON.parse(await file.text());
    if (!Array.isArray(transactions)) {
      throw new Error('File must contain a JSON array of transactions');
    }
    return uploadTransactions(transactions, file.name);
  }

  return (
    <div className="inline-loader">
      <Button type="button" variant="ghost" onClick={() => inputRef.current?.click()}>
        Upload a transactions file
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json,.docx"
        onChange={handleChange}
        className="visually-hidden"
      />
      <span className={`status${status.error ? ' error' : ''}`}>{status.message}</span>
    </div>
  );
}
