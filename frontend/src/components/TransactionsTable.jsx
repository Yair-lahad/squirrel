import { useEffect, useMemo, useState } from 'react';
import { fetchSortedTransactions } from '../routes/analytics';
import { createRule, applyCategoryRules, setTitleOverride, fetchCategories } from '../routes/categories';
import { useAnalytics } from '../hooks/useAnalytics';
import { formatCurrency } from '../core/format';
import CategorySelect from './CategorySelect';

const COLUMNS = [
  { key: 'date', label: 'Date' },
  { key: 'title', label: 'Title' },
  { key: 'description', label: 'Description' },
  { key: 'category', label: 'Category' },
  { key: 'amount', label: 'Amount' },
];

export default function TransactionsTable({ transactions, onTransactionsChange }) {
  const [sortKey, setSortKey] = useState('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editingTitleRow, setEditingTitleRow] = useState(null);
  const [titleEditValue, setTitleEditValue] = useState('');
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

  const existingCategories = useMemo(() => {
    const set = new Set(transactions.map((t) => t.category));
    catalogCategories.forEach((name) => set.add(name));
    return [...set].sort();
  }, [transactions, catalogCategories]);

  function startEdit(t, i) {
    setEditingRow(i);
    setEditValue(t.category);
  }

  async function saveEdit(t, category) {
    const trimmed = category.trim();
    setEditingRow(null);
    if (!trimmed || trimmed === t.category) return;
    await createRule({ pattern: t.description, matchType: 'exact', category: trimmed });
    onTransactionsChange?.(await applyCategoryRules(transactions));
  }

  function startEditTitle(t, i) {
    setEditingTitleRow(i);
    setTitleEditValue(t.title);
  }

  async function saveTitleEdit(t) {
    const trimmed = titleEditValue.trim();
    setEditingTitleRow(null);
    if (!trimmed || trimmed === t.title) return;
    await setTitleOverride(t.description, trimmed);
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
          {sorted.map((t, i) => {
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
                    <input
                      autoFocus
                      autoComplete="off"
                      value={titleEditValue}
                      onChange={(e) => setTitleEditValue(e.target.value)}
                      onBlur={() => saveTitleEdit(t)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') e.target.blur();
                      }}
                    />
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
                    <CategorySelect
                      value={editValue}
                      categories={existingCategories}
                      onChange={setEditValue}
                      onCommit={(category) => saveEdit(t, category)}
                    />
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
    </div>
  );
}
