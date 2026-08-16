import { useEffect, useState } from 'react';
import { fetchSortedTransactions } from '../routes/analytics';
import { createRule, applyCategoryRules, fetchCategories } from '../routes/categories';
import { useAnalytics } from '../hooks/useAnalytics';
import { usePagination } from '../hooks/usePagination';
import { formatCurrency, formatDate } from '../utils/format';
import CategorySelect from './CategorySelect';
import Table from './Table';

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

// t.date is stored as ISO ('YYYY-MM-DD') and displayed day-first, but a
// search typed by hand could be either style - matching against both means
// either one finds the row.
function matchesSearch(t, query) {
  if (!query) return true;
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    t.title?.toLowerCase().includes(q) ||
    t.description?.toLowerCase().includes(q) ||
    t.category?.toLowerCase().includes(q) ||
    t.date?.includes(q) ||
    formatDate(t.date).includes(q)
  );
}

export default function TransactionsTable({ transactions, search = '', onTransactionsChange }) {
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

  const filtered = sorted?.filter((t) => matchesSearch(t, search)) ?? null;

  const { pageSize, setPageSize, page: currentPage, setPage, pageCount, pageStart, paginated } = usePagination(filtered);

  const existingCategorySet = new Set(transactions.map((t) => t.category));
  catalogCategories.forEach((name) => existingCategorySet.add(name));
  const existingCategories = [...existingCategorySet].sort();

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

  async function saveTitleEdit(t) {
    const trimmed = titleEditValue.trim();
    setEditingTitleRow(null);
    if (!trimmed || trimmed === t.title) return;
    await createRule(ruleForEdit('title', titleEditScope, t, trimmed));
    onTransactionsChange?.(await applyCategoryRules(transactions));
  }

  if (!sorted) return null;

  const columns = [
    { key: 'date', label: 'Date', sortable: true, render: (t) => formatDate(t.date) },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      cellClassName: () => 'title-cell',
      cellProps: (t, i) => ({
        onKeyDown: (e) => {
          if (editingTitleRow === i && e.key === 'Escape') setEditingTitleRow(null);
        },
      }),
      render: (t, i) =>
        editingTitleRow === i ? (
          <span className="cell-editing">
            <input
              autoFocus
              autoComplete="off"
              value={titleEditValue}
              onChange={(e) => setTitleEditValue(e.target.value)}
              onBlur={(e) => {
                if (e.relatedTarget?.closest('.scope-toggle')) return;
                saveTitleEdit(t);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.target.blur();
              }}
            />
            <ScopeToggle scope={titleEditScope} onChange={setTitleEditScope} />
          </span>
        ) : (
          <span onClick={() => startEditTitle(t, i)} title="Click to edit title">
            {t.title}
          </span>
        ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      cellClassName: () => 'category-cell',
      cellProps: (t, i) => ({
        onKeyDown: (e) => {
          if (editingRow === i && e.key === 'Escape') setEditingRow(null);
        },
      }),
      render: (t, i) =>
        editingRow === i ? (
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
        ),
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      cellClassName: (t) => (t.amount > 0 ? 'amount-income' : 'amount-expense'),
      render: (t) => `${t.amount > 0 ? '+' : ''}${formatCurrency(Math.abs(t.amount))}`,
    },
    { key: 'description', label: 'Description', sortable: true, render: (t) => t.description },
  ];

  return (
    <Table
      columns={columns}
      rows={paginated}
      rowStart={pageStart}
      sortKey={sortKey}
      sortAsc={sortAsc}
      onSort={handleSort}
      pagination={{ pageSize, onPageSizeChange: setPageSize, page: currentPage, onPageChange: setPage, pageCount }}
    />
  );
}
