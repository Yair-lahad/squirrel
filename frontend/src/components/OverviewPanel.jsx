import { fetchTotals } from '../routes/analytics';
import { useAnalytics } from '../hooks/useAnalytics';
import { formatCurrency, formatPeriod } from '../core/format';

export default function OverviewPanel({ transactions }) {
  const totals = useAnalytics(() => fetchTotals(transactions), [transactions]);
  if (!totals) return null;

  const { income, spend, net } = totals;
  const rows = [
    { key: 'income', label: 'In', value: income, sign: 'income' },
    { key: 'spend', label: 'Out', value: Math.abs(spend), sign: 'expense' },
    { key: 'net', label: 'Net', value: Math.abs(net), sign: net >= 0 ? 'income' : 'expense' },
  ];

  return (
    <div className="overview-panel">
      <p className="overview-period">{formatPeriod(transactions)}</p>
      <dl className="overview-figures">
        {rows.map(({ key, label, value, sign }) => (
          <div key={key} className="overview-figure">
            <dt>{label}</dt>
            <dd className={sign}>{formatCurrency(value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
