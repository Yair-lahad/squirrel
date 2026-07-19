import { useEffect, useMemo, useState } from 'react';
import {
  fetchRules,
  createRule,
  deleteRule,
  applyCategoryRules,
  fetchCategories,
  createCategory,
  renameCategory,
  deleteCategory,
} from '../routes/categories';
import CategorySelect from '../components/CategorySelect';
import CategoryGrid from '../components/CategoryGrid';

const MATCH_TYPES = [
  { value: 'contains', label: 'Contains (auto - any matching transaction, including future ones)' },
  { value: 'exact', label: 'Exact (manual - this one description only)' },
  { value: 'category', label: 'Category (merge every transaction currently in this category)' },
];

export default function CategoriesPage({ transactions, onLoaded }) {
  const [rules, setRules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ pattern: '', matchType: 'contains', category: '' });
  const [status, setStatus] = useState({ message: '', error: false });
  const [gridStatus, setGridStatus] = useState({ message: '', error: false });
  const [formKey, setFormKey] = useState(0);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    fetchRules().then(async (latestRules) => {
      setRules(latestRules);
      // Rules may have been created in a previous visit/session, after the
      // currently cached transactions were fetched — resync on every visit,
      // not just right after creating a rule, so stale categories don't linger.
      // Applying rules also registers every category seen into the DB catalog,
      // so fetch the catalog again afterward to pick up anything just added.
      if (transactions.length) onLoaded?.(await applyCategoryRules(transactions));
      setCategories(await fetchCategories());
    });
    if (!transactions.length) fetchCategories().then(setCategories);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A category only gets a DB row (and therefore an id/rename/delete controls)
  // once it's been used in a rule — transaction-only or rule-only names still
  // need to show up so they stay pickable in CategorySelect.
  const categoryEntries = useMemo(() => {
    const byName = new Map();
    transactions.forEach((t) => t.category && byName.set(t.category, { name: t.category, id: null }));
    rules.forEach((r) => !byName.has(r.category) && byName.set(r.category, { name: r.category, id: null }));
    categories.forEach((c) => byName.set(c.name, { name: c.name, id: c.id }));
    return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [transactions, rules, categories]);

  const existingCategories = useMemo(() => categoryEntries.map((c) => c.name), [categoryEntries]);

  async function refreshAfterCategoryChange() {
    setRules(await fetchRules());
    setCategories(await fetchCategories());
    if (transactions.length) onLoaded?.(await applyCategoryRules(transactions));
  }

  async function handleRenameCategory(id, name) {
    try {
      await renameCategory(id, name);
      setGridStatus({ message: '', error: false });
      await refreshAfterCategoryChange();
    } catch (err) {
      setGridStatus({ message: err.message, error: true });
    }
  }

  async function handleDeleteCategory(category) {
    // The backend can only see rule usage — it has no idea whether currently
    // loaded transactions still carry this category (they're never persisted
    // server-side). Deleting one of those would "succeed" but get silently
    // re-created the next time rules are applied to those same transactions,
    // so check client-side first and never call the API for that case —
    // otherwise the buttons flash away and come back on refresh.
    const usedByLoadedTransactions = transactions.filter((t) => t.category === category.name).length;
    if (usedByLoadedTransactions > 0) {
      setGridStatus({
        message: `"${category.name}" is used by ${usedByLoadedTransactions} loaded transaction(s) — it can't be deleted while they're loaded.`,
        error: true,
      });
      return;
    }
    try {
      await deleteCategory(category.id);
      setGridStatus({ message: '', error: false });
      await refreshAfterCategoryChange();
    } catch (err) {
      setGridStatus({ message: err.message, error: true });
    }
  }

  function cancelAddCategory() {
    setAddingCategory(false);
    setNewCategoryName('');
  }

  async function handleCreateCategory(e) {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    try {
      await createCategory(trimmed);
      cancelAddCategory();
      setGridStatus({ message: '', error: false });
      await refreshAfterCategoryChange();
    } catch (err) {
      setGridStatus({ message: err.message, error: true });
    }
  }

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
      setCategories(await fetchCategories());
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
      <div className="category-add">
        {addingCategory ? (
          <form onSubmit={handleCreateCategory} className="category-add-form">
            <input
              autoFocus
              autoComplete="off"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name"
              onKeyDown={(e) => {
                if (e.key === 'Escape') cancelAddCategory();
              }}
            />
            <button type="submit">Add</button>
            <button type="button" onClick={cancelAddCategory}>Cancel</button>
          </form>
        ) : (
          <button type="button" className="category-add-button" onClick={() => setAddingCategory(true)}>
            + New category
          </button>
        )}
      </div>

      <CategoryGrid
        categories={categoryEntries}
        onRename={handleRenameCategory}
        onDelete={handleDeleteCategory}
      />
      {gridStatus.message && <p className={`status${gridStatus.error ? ' error' : ''}`}>{gridStatus.message}</p>}

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
    </div>
  );
}
