import { fetchTotals } from '../routes/analytics';
import { useAnalytics } from '../hooks/useAnalytics';
import { formatCurrency } from '../core/format';

export default function KpiPanel({ transactions }) {
  const totals = useAnalytics(() => fetchTotals(transactions), [transactions]);
  if (!totals) return null;

  const { income, spend, net } = totals;

  return (
    <div className="kpis">
      <div className="kpi">
        <span className="kpi-label">In</span>
        <span className="kpi-value income">{formatCurrency(income)}</span>
      </div>
      <div className="kpi">
        <span className="kpi-label">Out</span>
        <span className="kpi-value expense">{formatCurrency(Math.abs(spend))}</span>
      </div>
      <div className="kpi">
        <span className="kpi-label">Net</span>
        <span className={`kpi-value ${net >= 0 ? 'income' : 'expense'}`}>{formatCurrency(net)}</span>
      </div>
    </div>
  );
}
