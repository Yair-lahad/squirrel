import TransactionsTable from '../components/TransactionsTable';
import CategoryDetail from '../components/CategoryDetail';
import EmptyState from '../components/layout/EmptyState';

export default function TransactionsPage({ transactions, selectedCategory, onClearCategory }) {
  if (!transactions.length) return <EmptyState />;

  if (selectedCategory) {
    return <CategoryDetail category={selectedCategory} transactions={transactions} onBack={onClearCategory} />;
  }

  return <TransactionsTable transactions={transactions} />;
}
