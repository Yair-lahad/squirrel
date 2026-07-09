import { useState } from 'react';
import { fetchIsracard } from '../routes/isracard';
import { fetchMock } from '../routes/mock';

const FIELDS = [
  { key: 'id', label: 'ID', type: 'text' },
  { key: 'card6Digits', label: 'Card last 6 digits', type: 'text' },
  { key: 'password', label: 'Password', type: 'password' },
  { key: 'startDate', label: 'Start date', type: 'date' },
];

export default function FetchForm({ onLoaded }) {
  const [form, setForm] = useState({ id: '', card6Digits: '', password: '', startDate: '' });
  const [status, setStatus] = useState({ message: '', error: false });

  function update(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ message: 'Fetching…', error: false });
    try {
      const data = await fetchIsracard(form);
      onLoaded(data);
      setStatus({ message: `Loaded ${data.length} transactions.`, error: false });
    } catch (err) {
      setStatus({ message: err.message, error: true });
    }
  }

  async function handleMock() {
    setStatus({ message: 'Loading mock data…', error: false });
    const data = await fetchMock();
    onLoaded(data);
    setStatus({ message: `Loaded ${data.length} mock transactions.`, error: false });
  }

  return (
    <section id="fetch-panel">
      <form onSubmit={handleSubmit}>
        <h2>Fetch from Isracard</h2>
        {FIELDS.map((field) => (
          <div className="form-row" key={field.key}>
            <label htmlFor={field.key}>{field.label}</label>
            <input
              id={field.key}
              type={field.type}
              required
              autoComplete="off"
              value={form[field.key]}
              onChange={update(field.key)}
            />
          </div>
        ))}
        <div className="form-actions">
          <button type="submit">Fetch</button>
          <button type="button" onClick={handleMock}>Load mock data</button>
        </div>
        <p className={`status${status.error ? ' error' : ''}`}>{status.message}</p>
      </form>
    </section>
  );
}
