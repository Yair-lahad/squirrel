import { formatCurrency } from '../../../utils/format';
import AdvisorChip from './AdvisorChip';

export default function AvgSpendChip({ amount }) {
  return <AdvisorChip label="Avg charge" value={formatCurrency(amount)} />;
}
