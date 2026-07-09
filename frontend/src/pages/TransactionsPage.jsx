import TransactionsTable from '../components/TransactionsTable';
import EmptyState from '../components/layout/EmptyState';

export default function TransactionsPage({ transactions }) {
  if (!transactions.length) return <EmptyState />;

  return <TransactionsTable transactions={transactions} />;
}
