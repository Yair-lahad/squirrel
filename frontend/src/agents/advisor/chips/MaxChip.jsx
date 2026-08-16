import { formatCurrency, formatDayMonth } from '../../../utils/format';
import AdvisorChip from './AdvisorChip';

export default function MaxChip({ amount, title, date }) {
  return (
    <AdvisorChip
      label="Biggest charge"
      value={formatCurrency(amount)}
      detail={`${title} · ${formatDayMonth(date)}`}
    />
  );
}
