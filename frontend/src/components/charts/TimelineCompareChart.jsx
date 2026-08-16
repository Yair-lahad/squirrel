// Compares total (or one category's) spend per file/upload. Takes the full
// (every-upload) transaction set as a prop - the caller owns fetching it, so
// it's kept across this component unmounting when a click drills into detail.
import { Line } from 'react-chartjs-2';
import { formatCurrency, formatMonthYear } from '../../utils/format';
import { PALETTE } from '../../utils/palette';
import MiniCategoryPicker from './MiniCategoryPicker';
import Advisor from '../../agents/advisor/Advisor';
import SummaryHeader from '../SummaryHeader';

export const TOTAL = '__total__';

export default function TimelineCompareChart({ uploads, transactions, onSelectFileCategory, selected, onSelectedChange }) {
  const spend = transactions.filter((t) => t.amount < 0);

  const totalByCategory = new Map();
  for (const t of spend) {
    totalByCategory.set(t.category, (totalByCategory.get(t.category) ?? 0) + Math.abs(t.amount));
  }
  const categories = [...totalByCategory.keys()].sort((a, b) => totalByCategory.get(b) - totalByCategory.get(a));

  const files = uploads
    .filter((u) => spend.some((t) => t.upload_id === u.id))
    .sort((a, b) => new Date(a.end_date) - new Date(b.end_date));

  if (!categories.length) return null;

  const inScope = selected === TOTAL ? spend : spend.filter((t) => t.category === selected);
  const totalsByFile = files.map((f) =>
    inScope.filter((t) => t.upload_id === f.id).reduce((s, t) => s + Math.abs(t.amount), 0)
  );
  const label = selected === TOTAL ? 'Total spend' : selected;

  const data = {
    labels: files.map((f) => formatMonthYear(new Date(f.end_date))),
    datasets: [
      {
        label,
        data: totalsByFile,
        borderColor: PALETTE.categorical[0],
        backgroundColor: PALETTE.categorical[0],
        borderWidth: 3,
        pointRadius: 4,
        tension: 0.35,
      },
    ],
  };

  // Clicking a point only makes sense for a single category, not Total.
  const options = {
    maintainAspectRatio: false,
    animation: false,
    onClick: (evt, elements) => {
      if (!elements.length || selected === TOTAL) return;
      const file = files[elements[0].index];
      if (file) onSelectFileCategory?.(file.id, selected);
    },
    onHover: (evt, elements) => {
      evt.native.target.style.cursor = elements.length && selected !== TOTAL ? 'pointer' : 'default';
    },
    plugins: {
      legend: { display: false },
      datalabels: { display: false },
      tooltip: {
        displayColors: false,
        bodyAlign: 'center',
        callbacks: { label: (ctx) => formatCurrency(ctx.parsed.y) },
      },
    },
    scales: {
      x: { ticks: { color: PALETTE.muted }, grid: { display: false } },
      y: { beginAtZero: true, ticks: { color: PALETTE.muted }, grid: { color: PALETTE.grid } },
    },
  };

  return (
    <div className="category-detail">
      <div className="category-detail-header">
        <SummaryHeader title={selected === TOTAL ? 'Timeline Compare' : selected} transactions={inScope} period="" />
      </div>
      <div className="category-detail-layout">
        <MiniCategoryPicker
          transactions={transactions}
          metric="amount"
          activeCategories={selected === TOTAL ? [] : [selected]}
          onSelectCategories={(cats) => onSelectedChange(cats[0])}
          allLabel="Total"
          onSelectAll={() => onSelectedChange(TOTAL)}
        />
        <div className="chart-card">
          <div className="chart-canvas">
            <Line data={data} options={options} />
          </div>
        </div>
        {selected !== TOTAL && <Advisor categories={[selected]} transactions={transactions} />}
      </div>
    </div>
  );
}
