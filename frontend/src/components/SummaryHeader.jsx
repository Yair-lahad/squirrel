import { fetchTotals } from '../routes/analytics';
import { useAnalytics } from '../hooks/useAnalytics';
import { formatCurrency, formatPeriod } from '../core/format';

// Shared "N transactions, over <period>, net total" header — the same net
// figure Overview shows (via the same /api/analytics/totals endpoint), reused
// wherever a set of transactions needs a header instead of being recomputed
// per page (CategoryDetail, Transactions, …).
export default function SummaryHeader({ title, transactions, actions }) {
  const totals = useAnalytics(() => fetchTotals(transactions), [transactions]);

  if (!transactions.length || !totals) return null;

  const count = transactions.length;
  const { net } = totals;

  return (
    <div className="summary-header">
      <h2>
        {title} <span className="summary-header-period">{formatPeriod(transactions)}</span>
      </h2>
      <span className={`summary-header-amount ${net >= 0 ? 'income' : ''}`}>
        {formatCurrency(Math.abs(net))}
      </span>
      <span className="summary-header-count">
        <strong>{count}</strong> transaction{count === 1 ? '' : 's'}
      </span>
      {actions}
    </div>
  );
}
