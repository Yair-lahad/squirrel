import TransactionsTable from '../components/TransactionsTable';
import SummaryHeader from '../components/SummaryHeader';
import EmptyState from '../components/layout/EmptyState';

export default function TransactionsPage({ transactions, onLoaded }) {
  if (!transactions.length) return <EmptyState />;

  return (
    <>
      <SummaryHeader title="Transactions" transactions={transactions} />
      <TransactionsTable transactions={transactions} onTransactionsChange={onLoaded} />
    </>
  );
}
