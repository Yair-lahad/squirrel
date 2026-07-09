import { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { byCategory, topWithOther } from '../../core/aggregations';
import { formatCurrency } from '../../core/format';
import { PALETTE } from '../../core/palette';

const METRICS = [
  { key: 'amount', label: 'Amount' },
  { key: 'count', label: 'Number of transactions' },
];

export default function PieChart({ transactions }) {
  const [metric, setMetric] = useState('amount');
  const rows = topWithOther(byCategory(transactions), metric);

  const data = {
    labels: rows.map((r) => r.category),
    datasets: [
      {
        data: rows.map((r) => r[metric]),
        backgroundColor: rows.map((_, i) => PALETTE.categorical[i % PALETTE.categorical.length]),
        borderColor: '#fcfcfb',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    plugins: {
      legend: { position: 'right', labels: { color: '#0b0b0b', boxWidth: 12 } },
      tooltip: {
        callbacks: {
          label(ctx) {
            const row = rows[ctx.dataIndex];
            const value = metric === 'amount' ? formatCurrency(row.amount) : `${row.count} transaction${row.count === 1 ? '' : 's'}`;
            return `${row.category}: ${value}`;
          },
        },
      },
    },
  };

  return (
    <div className="chart-card">
      <h3>Category breakdown</h3>
      <div className="metric-toggle">
        {METRICS.map((m) => (
          <button
            key={m.key}
            type="button"
            className={m.key === metric ? 'active' : ''}
            onClick={() => setMetric(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>
      <Pie data={data} options={options} />
    </div>
  );
}
