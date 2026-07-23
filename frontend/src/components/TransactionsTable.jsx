import { useEffect, useMemo, useState } from 'react';
import { fetchSortedTransactions } from '../routes/analytics';
import { createRule, applyCategoryRules, fetchCategories } from '../routes/categories';
import { useAnalytics } from '../hooks/useAnalytics';
import { usePagination } from '../hooks/usePagination';
import { formatCurrency } from '../core/format';
import CategorySelect from './CategorySelect';
import Pagination from './Pagination';

const COLUMNS = [
  { key: 'date', label: 'Date' },
  { key: 'title', label: 'Title' },
  { key: 'description', label: 'Description' },
  { key: 'category', label: 'Category' },
  { key: 'amount', label: 'Amount' },
];

// Once = a single-use rule tied to this one transaction's real id (never
// reoccurs, since a future fetch's transactions have different ids). Always
// = today's recurring rule, matched by description.
function ScopeToggle({ scope, onChange }) {
  return (
    <span className="scope-toggle">
      <button
        type="button"
        className={scope === 'once' ? 'active' : ''}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onChange('once')}
      >
        Once
      </button>
      <button
        type="button"
        className={scope === 'always' ? 'active' : ''}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onChange('always')}
      >
        Always
      </button>
    </span>
  );
}

function ruleForEdit(attribute, scope, t, value) {
  return scope === 'always'
    ? { attribute, matchType: 'exact', pattern: t.description, value }
    : { attribute, matchType: 'transaction', transactionId: t.id, value };
}

export default function TransactionsTable({ transactions, onTransactionsChange }) {
  const [sortKey, setSortKey] = useState('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [categoryEditScope, setCategoryEditScope] = useState('always');
  const [editingTitleRow, setEditingTitleRow] = useState(null);
  const [titleEditValue, setTitleEditValue] = useState('');
  const [titleEditScope, setTitleEditScope] = useState('always');
  const [catalogCategories, setCatalogCategories] = useState([]);

  useEffect(() => {
    fetchCategories().then((cats) => setCatalogCategories(cats.map((c) => c.name)));
  }, []);

  function handleSort(key) {
    if (key === sortKey) setSortAsc((asc) => !asc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  const sorted = useAnalytics(
    () => fetchSortedTransactions(transactions, sortKey, sortAsc),
    [transactions, sortKey, sortAsc]
  );

  const { pageSize, setPageSize, page: currentPage, setPage, pageCount, pageStart, paginated } = usePagination(sorted);

  const existingCategories = useMemo(() => {
    const set = new Set(transactions.map((t) => t.category));
    catalogCategories.forEach((name) => set.add(name));
    return [...set].sort();
  }, [transactions, catalogCategories]);

  function startEdit(t, i) {
    setEditingRow(i);
    setEditValue(t.category);
    setCategoryEditScope('always');
  }

  async function saveEdit(t, category) {
    const trimmed = category.trim();
    setEditingRow(null);
    if (!trimmed || trimmed === t.category) return;
    await createRule(ruleForEdit('category', categoryEditScope, t, trimmed));
    onTransactionsChange?.(await applyCategoryRules(transactions));
  }

  function startEditTitle(t, i) {
    setEditingTitleRow(i);
    setTitleEditValue(t.title);
    setTitleEditScope('always');
  }

  // Scope is passed explicitly rather than read from titleEditScope state —
  // this fires directly from the toggle's onClick, so it must use the scope
  // being clicked right now, not whatever state happens to have committed by
  // the time this runs (that race is what caused stale/duplicate rules).
  async function saveTitleEdit(t, scope) {
    const trimmed = titleEditValue.trim();
    setEditingTitleRow(null);
    if (!trimmed || trimmed === t.title) return;
    await createRule(ruleForEdit('title', scope, t, trimmed));
    onTransactionsChange?.(await applyCategoryRules(transactions));
  }

  if (!sorted) return null;

  return (
    <div className="table-card">
      <table>
        <thead>
          <tr>
            <th className="row-number-header">#</th>
            {COLUMNS.map((col) => (
              <th key={col.key} onClick={() => handleSort(col.key)} className="sortable-header">
                {col.label}
                <span className="sort-arrow">
                  {sortKey === col.key ? (sortAsc ? ' ▲' : ' ▼') : ''}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginated.map((t, localI) => {
            const i = pageStart + localI;
            const isIncome = t.amount > 0;
            const editing = editingRow === i;
            const editingTitle = editingTitleRow === i;
            return (
              <tr key={i}>
                <td className="row-number">{i + 1}</td>
                <td>{t.date}</td>
                <td
                  className="title-cell"
                  onKeyDown={(e) => {
                    if (editingTitle && e.key === 'Escape') setEditingTitleRow(null);
                  }}
                >
                  {editingTitle ? (
                    <span className="cell-editing">
                      <input
                        autoFocus
                        autoComplete="off"
                        value={titleEditValue}
                        onChange={(e) => setTitleEditValue(e.target.value)}
                        onBlur={(e) => {
                          if (e.relatedTarget?.closest('.scope-toggle')) return;
                          saveTitleEdit(t, titleEditScope);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') e.target.blur();
                        }}
                      />
                      <ScopeToggle
                        scope={titleEditScope}
                        onChange={(scope) => {
                          setTitleEditScope(scope);
                          saveTitleEdit(t, scope);
                        }}
                      />
                    </span>
                  ) : (
                    <span onClick={() => startEditTitle(t, i)} title="Click to edit title">
                      {t.title}
                    </span>
                  )}
                </td>
                <td>{t.description}</td>
                <td
                  className="category-cell"
                  onKeyDown={(e) => {
                    if (editing && e.key === 'Escape') setEditingRow(null);
                  }}
                >
                  {editing ? (
                    <span className="cell-editing">
                      <CategorySelect
                        value={editValue}
                        categories={existingCategories}
                        onChange={setEditValue}
                        onCommit={(category) => saveEdit(t, category)}
                      />
                      <ScopeToggle scope={categoryEditScope} onChange={setCategoryEditScope} />
                    </span>
                  ) : (
                    <span onClick={() => startEdit(t, i)} title="Click to assign a category">
                      {t.category}
                    </span>
                  )}
                </td>
                <td className={isIncome ? 'amount-income' : 'amount-expense'}>
                  {isIncome ? '+' : ''}
                  {formatCurrency(Math.abs(t.amount))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Pagination
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        page={currentPage}
        onPageChange={setPage}
        pageCount={pageCount}
      />
    </div>
  );
}
