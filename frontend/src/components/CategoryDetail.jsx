import { formatCurrency } from '../core/format';
import CategoryScatterChart from './charts/CategoryScatterChart';

export default function CategoryDetail({ category, transactions, onBack }) {
  const items = transactions.filter((t) => t.category === category);
  const spend = items.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div className="category-detail">
      <button type="button" className="back-link" onClick={onBack}>← Show all transactions</button>
      <h2>{category}</h2>
      <p className="category-detail-summary">
        {formatCurrency(spend)} across {items.length} transaction{items.length === 1 ? '' : 's'}
      </p>
      <div className="chart-card">
        <CategoryScatterChart transactions={items} />
      </div>
    </div>
  );
}
