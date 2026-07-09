import { fetchCategoryDetail } from '../routes/analytics';
import { useAnalytics } from '../hooks/useAnalytics';
import { formatCurrency, formatMonthYear } from '../core/format';
import CategoryScatterChart from './charts/CategoryScatterChart';
import Advisor from '../advisor/Advisor';

function periodLabel(items) {
  if (!items.length) return '';
  const times = items.map((t) => new Date(t.date).getTime());
  const earliest = formatMonthYear(Math.min(...times));
  const latest = formatMonthYear(Math.max(...times));
  return earliest === latest ? earliest : `${earliest} – ${latest}`;
}

export default function CategoryDetail({ category, transactions, onBack }) {
  const detail = useAnalytics(() => fetchCategoryDetail(transactions, category), [transactions, category]);

  if (!detail) return null;

  const { items, spend, count } = detail;

  return (
    <div className="category-detail">
      <div className="category-detail-title">
        <h2>{category} <span className="category-detail-period">- {periodLabel(items)}</span></h2>
        <span className="category-detail-amount">{formatCurrency(spend)}</span>
        <span className="category-detail-count">
          <strong>{count}</strong> transaction{count === 1 ? '' : 's'}
        </span>
        <button type="button" className="back-link" onClick={onBack}>← Back to charts</button>
      </div>
      <div className="category-detail-layout">
        <CategoryScatterChart transactions={items} />
        <Advisor category={category} transactions={transactions} />
      </div>
    </div>
  );
}
