import { fetchCategoryDetail } from '../routes/analytics';
import { useAnalytics } from '../hooks/useAnalytics';
import { formatCurrency } from '../core/format';
import CategoryScatterChart from './charts/CategoryScatterChart';
import Advisor from '../advisor/Advisor';

export default function CategoryDetail({ category, transactions, onBack }) {
  const detail = useAnalytics(() => fetchCategoryDetail(transactions, category), [transactions, category]);

  if (!detail) return null;

  const { items, spend, count } = detail;

  return (
    <div className="category-detail">
      <div className="category-detail-title">
        <div className="category-detail-heading">
          <h2>{category}</h2>
          <span className="category-detail-amount">{formatCurrency(spend)}</span>
          <span className="category-detail-count">
            <strong>{count}</strong> transaction{count === 1 ? '' : 's'}
          </span>
        </div>
        <button type="button" className="back-link" onClick={onBack}>← Back to charts</button>
      </div>
      <div className="category-detail-layout">
        <div className="category-detail-graph chart-card">
          <CategoryScatterChart transactions={items} />
        </div>
        <div className="category-detail-advisor">
          <Advisor category={category} transactions={transactions} />
        </div>
      </div>
    </div>
  );
}
