import { formatCurrency, formatDayMonth } from '../../core/format';

export default function MaxChip({ amount, description, date }) {
  return (
    <div className="advisor-chip">
      <span className="advisor-chip-label">Biggest charge</span>
      <span className="advisor-chip-value" title={formatCurrency(amount)}>{formatCurrency(amount)}</span>
      <span className="advisor-chip-detail" title={`${description} · ${date}`}>{description} · {formatDayMonth(date)}</span>
    </div>
  );
}
