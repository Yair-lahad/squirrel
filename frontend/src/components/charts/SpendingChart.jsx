import { useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { fetchByCategory } from '../../routes/analytics';
import { useAnalytics } from '../../hooks/useAnalytics';
import { formatCurrency } from '../../core/format';
import { PALETTE } from '../../core/palette';

const VIEWS = [
  { key: 'bar', label: 'Bar' },
  { key: 'pie', label: 'Pie' },
];

const METRICS = [
  { key: 'amount', label: 'Amount' },
  { key: 'count', label: 'Number of transactions' },
];

function tooltipLabelFor(rows, metric) {
  return (ctx) => {
    const row = rows[ctx.dataIndex];
    const value = metric === 'amount' ? formatCurrency(row.amount) : `${row.count} transaction${row.count === 1 ? '' : 's'}`;
    return `${row.category}: ${value}`;
  };
}

export default function SpendingChart({ transactions, onSelectCategory }) {
  const [view, setView] = useState('bar');
  const [metric, setMetric] = useState('amount');

  const rows = useAnalytics(
    () => fetchByCategory(transactions).then((byCategory) => [...byCategory].sort((a, b) => b[metric] - a[metric])),
    [transactions, metric]
  );

  if (!rows) return null;

  const colors = rows.map((_, i) => PALETTE.categorical[i % PALETTE.categorical.length]);
  const labels = rows.map((r) => r.category);
  const values = rows.map((r) => r[metric]);

  function handleClick(_event, elements) {
    if (!elements.length) return;
    const row = rows[elements[0].index];
    onSelectCategory(row.category);
  }

  let chart;
  if (view === 'bar') {
    chart = (
      <Bar
        data={{ labels, datasets: [{ data: values, backgroundColor: colors, borderRadius: 4 }] }}
        options={{
          indexAxis: 'y',
          maintainAspectRatio: false,
          onClick: handleClick,
          onHover: (event, elements) => {
            event.native.target.style.cursor = elements.length ? 'pointer' : 'default';
          },
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: tooltipLabelFor(rows, metric) } } },
          scales: {
            x: { ticks: { color: PALETTE.muted, precision: metric === 'count' ? 0 : undefined }, grid: { color: PALETTE.grid } },
            y: { ticks: { color: PALETTE.muted }, grid: { display: false } },
          },
        }}
      />
    );
  } else {
    chart = (
      <Pie
        data={{ labels, datasets: [{ data: values, backgroundColor: colors, borderColor: PALETTE.surface, borderWidth: 2 }] }}
        options={{
          maintainAspectRatio: false,
          onClick: handleClick,
          onHover: (event, elements) => {
            event.native.target.style.cursor = elements.length ? 'pointer' : 'default';
          },
          plugins: {
            legend: { position: 'right', labels: { color: PALETTE.textPrimary, boxWidth: 12 } },
            tooltip: { callbacks: { label: tooltipLabelFor(rows, metric) } },
          },
        }}
      />
    );
  }

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>Spend by category</h3>
        <div className="chart-controls">
          <div className="toggle-group view-toggle">
            {VIEWS.map((v) => (
              <button key={v.key} type="button" className={v.key === view ? 'active' : ''} onClick={() => setView(v.key)}>
                {v.label}
              </button>
            ))}
          </div>
          <div className="toggle-group metric-toggle">
            {METRICS.map((m) => (
              <button key={m.key} type="button" className={m.key === metric ? 'active' : ''} onClick={() => setMetric(m.key)}>
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="chart-hint">Click a category to see its transactions.</p>
      <div className="chart-canvas">{chart}</div>
    </div>
  );
}
