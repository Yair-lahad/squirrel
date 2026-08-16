import { formatGap } from '../../../utils/format';
import AdvisorChip from './AdvisorChip';

export default function FrequencyChip({ days }) {
  return <AdvisorChip label="Frequency" value={`every ${formatGap(days)}`} />;
}
