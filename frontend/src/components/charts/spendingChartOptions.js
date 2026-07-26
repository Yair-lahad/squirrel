// Builds the Chart.js options for the "Spend by category" bar and pie views.
import { formatCurrency } from '../../core/format';
import { PALETTE } from '../../core/palette';

const NAME_VALUE_GAP = '    ';

// Mutually exclusive: values at/above the cutoff print directly on the
// shape; values below it are too small to hold the label legibly, so they
// fall back to a tooltip instead.
const SMALL_SECTION_THRESHOLD = { amount: 500, count: 3 };

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
    filter: (item) => rows[item.dataIndex][metric] < SMALL_SECTION_THRESHOLD[metric],
    boxPadding: 6,
    padding: 8,
  };
}

function datalabelsOptions(rows, metric) {
  return {
    display: (ctx) => rows[ctx.dataIndex][metric] >= SMALL_SECTION_THRESHOLD[metric],
    color: '#fff',
    font: { weight: '700', size: 11 },
    formatter: (_value, ctx) => {
      const row = rows[ctx.dataIndex];
      return metric === 'amount' ? formatCurrency(row.amount) : row.count;
    },
  };
}

export function barOptions({ rows, metric, onClick }) {
  return {
    indexAxis: 'y',
    maintainAspectRatio: false,
    // Switching metric changes the x-axis tick text width, which Chart.js
    // snaps to instantly - animating bar values against a plot area that
    // already jumped looks broken, so skip the animation instead.
    animation: false,
    onClick,
    onHover: (event, elements) => {
      event.native.target.style.cursor = elements.length ? 'pointer' : 'default';
    },
    plugins: {
      legend: { display: false },
      tooltip: tooltipOptions(rows, metric),
      datalabels: datalabelsOptions(rows, metric),
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
      datalabels: datalabelsOptions(rows, metric),
    },
  };
}
