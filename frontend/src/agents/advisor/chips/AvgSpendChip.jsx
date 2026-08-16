import { formatCurrency } from '../../../utils/format';

export default function AvgSpendChip({ amount }) {
  return (
    <div className="advisor-chip">
      <span className="advisor-chip-label">Avg charge</span>
      <span className="advisor-chip-value">{formatCurrency(amount)}</span>
    </div>
  );
}
