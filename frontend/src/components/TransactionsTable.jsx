import { useEffect, useState } from 'react';
import { fetchSortedTransactions } from '../routes/analytics';
import { createRule, applyCategoryRules, fetchCategories } from '../routes/categories';
import { useAnalytics } from '../hooks/useAnalytics';
import { usePagination } from '../hooks/usePagination';
import { useInlineEdit } from '../hooks/useInlineEdit';
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
  const categoryEdit = useInlineEdit();
  const titleEdit = useInlineEdit();
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

  async function saveEdit(t, category) {
    const trimmed = category.trim();
    categoryEdit.cancel();
    if (!trimmed || trimmed === t.category) return;
    await createRule(ruleForEdit('category', categoryEdit.scope, t, trimmed));
    onTransactionsChange?.(await applyCategoryRules(transactions));
  }

  async function saveTitleEdit(t) {
    const trimmed = titleEdit.value.trim();
    titleEdit.cancel();
    if (!trimmed || trimmed === t.title) return;
    await createRule(ruleForEdit('title', titleEdit.scope, t, trimmed));
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
          if (titleEdit.row === i && e.key === 'Escape') titleEdit.cancel();
        },
      }),
      render: (t, i) =>
        titleEdit.row === i ? (
          <span className="cell-editing">
            <input
              autoFocus
              autoComplete="off"
              value={titleEdit.value}
              onChange={(e) => titleEdit.setValue(e.target.value)}
              onBlur={(e) => {
                if (e.relatedTarget?.closest('.scope-toggle')) return;
                saveTitleEdit(t);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.target.blur();
              }}
            />
            <ScopeToggle scope={titleEdit.scope} onChange={titleEdit.setScope} />
          </span>
        ) : (
          <span onClick={() => titleEdit.start(i, t.title)} title="Click to edit title">
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
          if (categoryEdit.row === i && e.key === 'Escape') categoryEdit.cancel();
        },
      }),
      render: (t, i) =>
        categoryEdit.row === i ? (
          <span className="cell-editing">
            <CategorySelect
              value={categoryEdit.value}
              categories={existingCategories}
              onChange={categoryEdit.setValue}
              onCommit={(category) => saveEdit(t, category)}
            />
            <ScopeToggle scope={categoryEdit.scope} onChange={categoryEdit.setScope} />
          </span>
        ) : (
          <span onClick={() => categoryEdit.start(i, t.category)} title="Click to assign a category">
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
