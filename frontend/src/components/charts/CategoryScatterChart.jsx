import { Scatter } from 'react-chartjs-2';
import { formatCurrency, formatDayMonth } from '../../core/format';
import { PALETTE } from '../../core/palette';

export default function CategoryScatterChart({ transactions }) {
  const points = transactions.map((t) => ({
    x: new Date(t.date).getTime(),
    y: Math.abs(t.amount),
    date: t.date,
    title: t.title,
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
          title(items) {
            return items[0].raw.title;
          },
          label(ctx) {
            const p = ctx.raw;
            return [formatCurrency(Math.abs(p.amount)), formatDayMonth(p.date)];
          },
        },
        backgroundColor: 'rgba(40, 40, 40, 0.85)',
        titleColor: '#fff',
        bodyColor: '#f0f0f0',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
        displayColors: false,
        titleFont: { weight: '600', size: 13 },
        bodyFont: { size: 12 },
        bodySpacing: 3,
        bodyAlign: 'center',
      },
    },
    scales: {
      x: {
        type: 'linear',
        ticks: {
          color: PALETTE.muted,
          callback: (value) => formatDayMonth(value),
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
    <div className="chart-card">
      <div className="chart-canvas">
        <Scatter data={data} options={options} />
      </div>
    </div>
  );
}
