import { totals } from '../core/aggregations';
import { formatCurrency } from '../core/format';

export default function KpiPanel({ transactions }) {
  const { income, spend, net } = totals(transactions);
  return (
    <div className="kpis">
      <div className="kpi">
        <span className="kpi-label">In</span>
        <span className="kpi-value">{formatCurrency(income)}</span>
      </div>
      <div className="kpi">
        <span className="kpi-label">Out</span>
        <span className="kpi-value">{formatCurrency(Math.abs(spend))}</span>
      </div>
      <div className="kpi">
        <span className="kpi-label">Net</span>
        <span className="kpi-value">{formatCurrency(net)}</span>
      </div>
    </div>
  );
}
