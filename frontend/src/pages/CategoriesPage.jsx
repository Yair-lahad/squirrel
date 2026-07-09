import { useEffect, useMemo, useState } from 'react';
import { fetchRules, createRule, deleteRule, applyCategoryRules } from '../routes/categories';
import CategorySelect from '../components/CategorySelect';
import CategoryGrid from '../components/CategoryGrid';

const MATCH_TYPES = [
  { value: 'contains', label: 'Contains (auto - any matching transaction, including future ones)' },
  { value: 'exact', label: 'Exact (manual - this one description only)' },
  { value: 'category', label: 'Category (merge every transaction currently in this category)' },
];

export default function CategoriesPage({ transactions, onLoaded }) {
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState({ pattern: '', matchType: 'contains', category: '' });
  const [status, setStatus] = useState({ message: '', error: false });
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    fetchRules().then(async (latestRules) => {
      setRules(latestRules);
      // Rules may have been created in a previous visit/session, after the
      // currently cached transactions were fetched — resync on every visit,
      // not just right after creating a rule, so stale categories don't linger.
      if (transactions.length) onLoaded?.(await applyCategoryRules(transactions));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const existingCategories = useMemo(() => {
    const set = new Set(transactions.map((t) => t.category));
    rules.forEach((r) => set.add(r.category));
    return [...set].sort();
  }, [transactions, rules]);

  function update(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.pattern.trim()) {
      setStatus({ message: form.matchType === 'category' ? 'Source category is required' : 'Match text is required', error: true });
      return;
    }
    if (!form.category.trim()) {
      setStatus({ message: 'Category is required', error: true });
      return;
    }
    try {
      await createRule(form);
      setForm({ pattern: '', matchType: 'contains', category: '' });
      setFormKey((k) => k + 1);
      setStatus({ message: '', error: false });
      setRules(await fetchRules());
      if (transactions.length) onLoaded?.(await applyCategoryRules(transactions));
    } catch (err) {
      setStatus({ message: err.message, error: true });
    }
  }

  async function handleDelete(id) {
    await deleteRule(id);
    setRules(await fetchRules());
  }

  return (
    <div className="categories-page">
      <section id="rule-form-panel">
        <form onSubmit={handleSubmit}>
          <h2>Add a category rule</h2>
          <div className="form-row">
            <label htmlFor="matchType">Match type</label>
            <select
              id="matchType"
              value={form.matchType}
              onChange={(e) => setForm((f) => ({ ...f, matchType: e.target.value, pattern: '' }))}
            >
              {MATCH_TYPES.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label htmlFor="pattern">{form.matchType === 'category' ? 'Merge from category' : 'Match text'}</label>
            {form.matchType === 'category' ? (
              <CategorySelect
                key={`pattern-${formKey}`}
                id="pattern"
                value={form.pattern}
                categories={existingCategories}
                onChange={(pattern) => setForm((f) => ({ ...f, pattern }))}
              />
            ) : (
              <input
                id="pattern"
                required
                autoComplete="off"
                value={form.pattern}
                onChange={update('pattern')}
                placeholder="e.g. Netflix"
              />
            )}
          </div>
          <div className="form-row">
            <label htmlFor="category">Category</label>
            <CategorySelect
              key={formKey}
              id="category"
              value={form.category}
              categories={existingCategories}
              onChange={(category) => setForm((f) => ({ ...f, category }))}
            />
          </div>
          <div className="form-actions">
            <button type="submit">Add rule</button>
          </div>
          {status.message && <p className={`status${status.error ? ' error' : ''}`}>{status.message}</p>}
        </form>
      </section>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Match text</th>
              <th>Type</th>
              <th>Category</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id}>
                <td>{r.pattern}</td>
                <td>{r.matchType}</td>
                <td>{r.category}</td>
                <td>
                  <button type="button" onClick={() => handleDelete(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {!rules.length && (
              <tr>
                <td colSpan={4}>No rules yet — transactions keep their source category until you add one.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CategoryGrid categories={existingCategories} />
    </div>
  );
}
