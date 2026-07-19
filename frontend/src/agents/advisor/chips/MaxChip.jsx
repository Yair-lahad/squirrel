import { formatCurrency, formatDayMonth } from '../../../core/format';

export default function MaxChip({ amount, title, date }) {
  return (
    <div className="advisor-chip">
      <span className="advisor-chip-label">Biggest charge</span>
      <span className="advisor-chip-value" title={formatCurrency(amount)}>{formatCurrency(amount)}</span>
      <span className="advisor-chip-detail" title={`${title} · ${date}`}>{title} · {formatDayMonth(date)}</span>
    </div>
  );
}
