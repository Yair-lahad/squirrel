import KpiPanel from '../components/KpiPanel';
import EmptyState from '../components/layout/EmptyState';

export default function OverviewPage({ transactions }) {
  if (!transactions.length) return <EmptyState />;

  return <KpiPanel transactions={transactions} />;
}
