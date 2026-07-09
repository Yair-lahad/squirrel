import { Bar } from 'react-chartjs-2';
import { byCategory } from '../../core/aggregations';
import { PALETTE } from '../../core/palette';

export default function CategoryChart({ transactions }) {
  const rows = byCategory(transactions);

  const data = {
    labels: rows.map((r) => r.category),
    datasets: [
      {
        label: 'Spend',
        data: rows.map((r) => r.amount),
        backgroundColor: rows.map((_, i) => PALETTE.categorical[i % PALETTE.categorical.length]),
        borderRadius: 4,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: PALETTE.muted }, grid: { color: PALETTE.grid } },
      y: { ticks: { color: PALETTE.muted }, grid: { display: false } },
    },
  };

  return (
    <div className="chart-card">
      <h3>Spend by category</h3>
      <Bar data={data} options={options} />
    </div>
  );
}
