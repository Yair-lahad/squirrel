import { Scatter } from 'react-chartjs-2';
import { formatCurrency } from '../../core/format';
import { PALETTE } from '../../core/palette';

export default function CategoryScatterChart({ transactions }) {
  const points = transactions.map((t) => ({
    x: new Date(t.date).getTime(),
    y: Math.abs(t.amount),
    date: t.date,
    description: t.description,
    amount: t.amount,
  }));

  const data = {
    datasets: [
      {
        label: 'Transactions',
        data: points,
        backgroundColor: `${PALETTE.categorical[0]}cc`,
        borderColor: PALETTE.categorical[0],
        borderWidth: 1,
        pointRadius: 7,
        pointHoverRadius: 9,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: () => '',
          label(ctx) {
            const p = ctx.raw;
            return `${p.date} — ${p.description}: ${formatCurrency(p.amount)}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'linear',
        ticks: {
          color: PALETTE.muted,
          callback: (value) => new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        },
        grid: { color: PALETTE.grid },
      },
      y: {
        ticks: { color: PALETTE.muted },
        grid: { color: PALETTE.grid },
        title: { display: true, text: 'Amount', color: PALETTE.muted },
      },
    },
  };

  return (
    <div className="chart-canvas">
      <Scatter data={data} options={options} />
    </div>
  );
}
