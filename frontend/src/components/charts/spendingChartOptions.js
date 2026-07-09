// Builds the Chart.js options for the "Spend by category" bar and pie views.
import { formatCurrency } from '../../core/format';
import { PALETTE } from '../../core/palette';

const NAME_VALUE_GAP = '    ';

function tooltipLabel(rows, metric) {
  return (ctx) => {
    const row = rows[ctx.dataIndex];
    const value = metric === 'amount' ? formatCurrency(row.amount) : `${row.count} transaction${row.count === 1 ? '' : 's'}`;
    return row.category + NAME_VALUE_GAP + value;
  };
}

function tooltipOptions(rows, metric) {
  return {
    callbacks: { title: () => '', label: tooltipLabel(rows, metric) },
    boxPadding: 6,
    padding: 8,
  };
}

export function barOptions({ rows, metric, onClick }) {
  return {
    indexAxis: 'y',
    maintainAspectRatio: false,
    onClick,
    onHover: (event, elements) => {
      event.native.target.style.cursor = elements.length ? 'pointer' : 'default';
    },
    plugins: {
      legend: { display: false },
      tooltip: tooltipOptions(rows, metric),
    },
    scales: {
      x: { ticks: { color: PALETTE.muted, precision: metric === 'count' ? 0 : undefined }, grid: { color: PALETTE.grid } },
      y: { ticks: { color: PALETTE.muted }, grid: { display: false } },
    },
  };
}

export function pieOptions({ rows, metric, onClick }) {
  return {
    maintainAspectRatio: false,
    onClick,
    onHover: (event, elements) => {
      event.native.target.style.cursor = elements.length ? 'pointer' : 'default';
    },
    plugins: {
      legend: { position: 'right', labels: { color: PALETTE.textPrimary, boxWidth: 12 } },
      tooltip: tooltipOptions(rows, metric),
    },
  };
}
