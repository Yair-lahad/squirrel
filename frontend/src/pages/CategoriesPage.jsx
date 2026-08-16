import { useEffect, useState } from 'react';
import {
  fetchRules,
  createRule,
  deleteRule,
  applyCategoryRulesAndCategories,
  fetchCategories,
  createCategory,
  renameCategory,
  deleteCategory,
} from '../routes/categories';
import CategorySelect from '../components/CategorySelect';
import CategoryGrid from '../components/CategoryGrid';
import Table from '../components/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TrashIcon from '../components/icons/TrashIcon';
import SectionHeading from '../components/ui/SectionHeading';
import { usePagination } from '../hooks/usePagination';

// These rules are always "Always" scope (they match by description, so they
// keep applying to future transactions too) - a rule scoped to just one
// transaction ("Once") is only created via the inline edit in the
// transactions table, not from this form.
const MATCH_TYPES_BY_ATTRIBUTE = {
  category: [
    { value: 'contains', label: 'Description contains this text' },
    { value: 'exact', label: 'Description matches exactly' },
    { value: 'category', label: 'Merge - move every transaction from one category into another' },
  ],
  title: [
    { value: 'contains', label: 'Description contains this text' },
    { value: 'exact', label: 'Description matches exactly' },
  ],
};

// Toggling scope (Once <-> Always) directly from this list is disabled for
// now - Once -> Always is well-defined, but Always -> Once isn't (an always
// rule matches by description alone, so there's no single transaction id to
// pin a "once" rule to). Until that's resolved, the Scope column is a plain
// label rather than an interactive toggle.
function ruleMatchText(rule) {
  return rule.matchType === 'transaction'
    ? (rule.transactionDescription ?? `transaction #${rule.transactionId} (no longer in the data)`)
    : rule.pattern;
}

function matchesRuleSearch(rule, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return ruleMatchText(rule)?.toLowerCase().includes(q) || rule.value?.toLowerCase().includes(q);
}

function RuleScopeCell({ rule }) {
  if (rule.matchType === 'category') return <span className="rule-scope-label">Merge</span>;
  if (rule.matchType === 'transaction') return <span className="rule-scope-label">Once</span>;
  return (
    <span className="rule-scope-label">
      Always <span className="rule-match-kind">({rule.matchType})</span>
    </span>
  );
}

export default function CategoriesPage({ transactions, onLoaded }) {
  const [rules, setRules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesReady, setCategoriesReady] = useState(false);
  const [form, setForm] = useState({ attribute: 'title', matchType: 'contains', pattern: '', value: '' });
  const [status, setStatus] = useState({ message: '', error: false });
  const [gridStatus, setGridStatus] = useState({ message: '', error: false });
  const [formKey, setFormKey] = useState(0);
  const [ruleSearch, setRuleSearch] = useState('');

  useEffect(() => {
    (async () => {
      const rulesPromise = fetchRules();
      // Rules may have been created in a previous visit/session, after the
      // currently cached transactions were fetched - resync on every visit,
      // not just right after creating a rule, so stale categories don't linger.
      let categoriesPromise = fetchCategories();
      if (transactions.length) {
        categoriesPromise = applyCategoryRulesAndCategories(transactions).then(({ transactions: applied, categories: cats }) => {
          onLoaded?.(applied);
          return cats;
        });
      }
      const [latestRules, latestCategories] = await Promise.all([rulesPromise, categoriesPromise]);
      setRules(latestRules);
      setCategories(latestCategories);
      setCategoriesReady(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A category only gets a DB row (and therefore an id/rename/delete controls)
  // once it's been used in a rule - transaction-only or rule-only names still
  // need to show up so they stay pickable in CategorySelect. Only category
  // rules contribute here - a title rule's value is a title, not a category.
  const categoryEntriesByName = new Map();
  transactions.forEach((t) => t.category && categoryEntriesByName.set(t.category, { name: t.category, id: null }));
  rules
    .filter((r) => r.attribute === 'category')
    .forEach((r) => !categoryEntriesByName.has(r.value) && categoryEntriesByName.set(r.value, { name: r.value, id: null }));
  categories.forEach((c) => categoryEntriesByName.set(c.name, { name: c.name, id: c.id }));
  const categoryEntries = [...categoryEntriesByName.values()].sort((a, b) => a.name.localeCompare(b.name));

  const existingCategories = categoryEntries.map((c) => c.name);

  const filteredRules = rules.filter((r) => matchesRuleSearch(r, ruleSearch)).sort((a, b) => b.id - a.id);

  const {
    pageSize: rulesPageSize,
    setPageSize: setRulesPageSize,
    page: rulesPage,
    setPage: setRulesPage,
    pageCount: rulesPageCount,
    pageStart: rulesPageStart,
    paginated: paginatedRules,
  } = usePagination(filteredRules);

  async function refreshAfterCategoryChange() {
    const rulesPromise = fetchRules();
    let categoriesPromise = fetchCategories();
    if (transactions.length) {
      categoriesPromise = applyCategoryRulesAndCategories(transactions).then(({ transactions: applied, categories: cats }) => {
        onLoaded?.(applied);
        return cats;
      });
    }
    const [latestRules, latestCategories] = await Promise.all([rulesPromise, categoriesPromise]);
    setRules(latestRules);
    setCategories(latestCategories);
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
    // The backend can only see rule usage - it has no idea whether currently
    // loaded transactions still carry this category (they're never persisted
    // server-side). Deleting one of those would "succeed" but get silently
    // re-created the next time rules are applied to those same transactions,
    // so check client-side first and never call the API for that case -
    // otherwise the buttons flash away and come back on refresh.
    const usedByLoadedTransactions = transactions.filter((t) => t.category === category.name).length;
    if (usedByLoadedTransactions > 0) {
      setGridStatus({
        message: `"${category.name}" is used by ${usedByLoadedTransactions} loaded transaction(s) - it can't be deleted while they're loaded.`,
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

  async function handleCreateCategory(name) {
    try {
      await createCategory(name);
      setGridStatus({ message: '', error: false });
      await refreshAfterCategoryChange();
      return true;
    } catch (err) {
      setGridStatus({ message: err.message, error: true });
      return false;
    }
  }

  function update(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function updateAttribute(e) {
    const attribute = e.target.value;
    setForm({ attribute, matchType: 'contains', pattern: '', value: '' });
    setFormKey((k) => k + 1);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.pattern.trim()) {
      setStatus({ message: form.matchType === 'category' ? 'Source category is required' : 'Match text is required', error: true });
      return;
    }
    if (!form.value.trim()) {
      setStatus({ message: form.attribute === 'category' ? 'Category is required' : 'Title is required', error: true });
      return;
    }
    try {
      await createRule(form);
      setForm({ attribute: form.attribute, matchType: 'contains', pattern: '', value: '' });
      setFormKey((k) => k + 1);
      setStatus({ message: '', error: false });
      await refreshAfterCategoryChange();
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
      {categoriesReady ? (
        <CategoryGrid
          categories={categoryEntries}
          onRename={handleRenameCategory}
          onDelete={handleDeleteCategory}
          onCreate={handleCreateCategory}
        />
      ) : (
        <div className="category-grid-loading" />
      )}
      {gridStatus.message && <p className={`status${gridStatus.error ? ' error' : ''}`}>{gridStatus.message}</p>}

      <section id="rule-form-panel" className="rule-form-panel">
        <SectionHeading>Add a rule</SectionHeading>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="attribute">Sets</label>
            <Select id="attribute" value={form.attribute} onChange={updateAttribute}>
              <option value="category">Category</option>
              <option value="title">Title</option>
            </Select>
          </div>
          <div className="form-row">
            <label htmlFor="matchType">Match type</label>
            <Select
              id="matchType"
              value={form.matchType}
              onChange={(e) => setForm((f) => ({ ...f, matchType: e.target.value, pattern: '' }))}
            >
              {MATCH_TYPES_BY_ATTRIBUTE[form.attribute].map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </Select>
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
              <Input
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
            <label htmlFor="value">{form.attribute === 'category' ? 'Category' : 'Title'}</label>
            {form.attribute === 'category' ? (
              <CategorySelect
                key={formKey}
                id="value"
                value={form.value}
                categories={existingCategories}
                onChange={(value) => setForm((f) => ({ ...f, value }))}
              />
            ) : (
              <Input
                id="value"
                required
                autoComplete="off"
                value={form.value}
                onChange={update('value')}
                placeholder="e.g. Netflix subscription"
              />
            )}
          </div>
          <div className="form-actions">
            <Button type="submit">Add rule</Button>
          </div>
          {status.message && <p className={`status${status.error ? ' error' : ''}`}>{status.message}</p>}
        </form>
      </section>

      <div className="table-toolbar rule-search-toolbar">
        <SectionHeading className="rule-list-heading">Rules</SectionHeading>
        <Input
          type="text"
          className="table-search"
          autoComplete="off"
          placeholder="Search match text or value…"
          value={ruleSearch}
          onChange={(e) => setRuleSearch(e.target.value)}
        />
      </div>
      <Table
        columns={[
          { key: 'attribute', label: 'Sets', render: (r) => r.attribute },
          { key: 'match', label: 'Match text', render: (r) => ruleMatchText(r) },
          { key: 'value', label: 'Value', render: (r) => r.value },
          { key: 'scope', label: 'Scope', render: (r) => <RuleScopeCell rule={r} /> },
          {
            key: 'actions',
            label: '',
            render: (r) => (
              <Button type="button" variant="danger" className="btn-icon" title="Delete rule" onClick={() => handleDelete(r.id)}>
                <TrashIcon size={15} />
              </Button>
            ),
          },
        ]}
        rows={paginatedRules}
        rowStart={rulesPageStart}
        rowKey={(r) => r.id}
        emptyMessage={rules.length ? 'No rules match your search.' : 'No rules yet - transactions keep their source category until you add one.'}
        pagination={{
          pageSize: rulesPageSize,
          onPageSizeChange: setRulesPageSize,
          page: rulesPage,
          onPageChange: setRulesPage,
          pageCount: rulesPageCount,
        }}
      />
    </div>
  );
}
