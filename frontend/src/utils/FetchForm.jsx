import { useState } from 'react';
import { fetchVendor } from '../routes/vendor';
import { fetchMock } from '../routes/mock';
import { useAsyncStatus } from '../hooks/useAsyncStatus';
import Button from '../components/ui/Button';

const FIELDS = [
  { key: 'id', label: 'ID', type: 'text' },
  { key: 'card6Digits', label: 'Card last 6 digits', type: 'text' },
  { key: 'password', label: 'Password', type: 'password' },
  { key: 'startDate', label: 'Start date', type: 'date' },
];

export default function FetchForm({ onLoaded }) {
  const [form, setForm] = useState({ id: '', card6Digits: '', password: '', startDate: '' });
  const { status, run } = useAsyncStatus();

  function update(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await run('Fetching…', () => fetchVendor(form), async (data) => {
      await onLoaded(data);
      return `Loaded ${data.length} transactions.`;
    });
  }

  async function handleMock() {
    await run('Loading mock data…', fetchMock, async (data) => {
      await onLoaded(data);
      return `Loaded ${data.length} mock transactions.`;
    });
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
          <Button type="submit">Fetch</Button>
          <Button type="button" variant="ghost" onClick={handleMock}>Load mock data</Button>
        </div>
        <p className={`status${status.error ? ' error' : ''}`}>{status.message}</p>
      </form>
    </section>
  );
}
