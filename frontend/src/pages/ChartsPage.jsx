import SpendingChart from '../components/charts/SpendingChart';
import EmptyState from '../components/layout/EmptyState';

export default function ChartsPage({ transactions, onSelectCategory }) {
  if (!transactions.length) return <EmptyState />;

  return (
    <div className="charts">
      <SpendingChart transactions={transactions} onSelectCategory={onSelectCategory} />
    </div>
  );
}
