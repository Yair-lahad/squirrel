import { formatGap } from '../../../core/format';

export default function FrequencyChip({ days }) {
  return (
    <div className="advisor-chip">
      <span className="advisor-chip-label">Frequency</span>
      <span className="advisor-chip-value">every {formatGap(days)}</span>
    </div>
  );
}
