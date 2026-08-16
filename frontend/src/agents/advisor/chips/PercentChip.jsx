import AdvisorChip from './AdvisorChip';

export default function PercentChip({ percent }) {
  return <AdvisorChip label="Share of spend" value={`${percent.toFixed(0)}%`} />;
}
