import { useMemo, useState } from 'react';
import { fetchSortedTransactions } from '../routes/analytics';
import { createRule, applyCategoryRules } from '../routes/categories';
import { useAnalytics } from '../hooks/useAnalytics';
import { formatCurrency } from '../core/format';
import CategorySelect from './CategorySelect';

const COLUMNS = [
  { key: 'date', label: 'Date' },
  { key: 'description', label: 'Description' },
  { key: 'category', label: 'Category' },
  { key: 'amount', label: 'Amount' },
];

export default function TransactionsTable({ transactions, onTransactionsChange }) {
  const [sortKey, setSortKey] = useState('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [editValue, setEditValue] = useState('');

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

  const existingCategories = useMemo(
    () => [...new Set(transactions.map((t) => t.category))].sort(),
    [transactions]
  );

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
            return (
              <tr key={i}>
                <td className="row-number">{i + 1}</td>
                <td>{t.date}</td>
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
