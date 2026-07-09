import { useState } from 'react';
import SpendingChart from '../components/charts/SpendingChart';
import CategoryDetail from '../components/CategoryDetail';
import EmptyState from '../components/layout/EmptyState';

export default function ChartsPage({ transactions }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  if (!transactions.length) return <EmptyState />;

  if (selectedCategory) {
    return (
      <CategoryDetail
        category={selectedCategory}
        transactions={transactions}
        onBack={() => setSelectedCategory(null)}
      />
    );
  }

  return (
    <div className="charts">
      <SpendingChart transactions={transactions} onSelectCategory={setSelectedCategory} />
    </div>
  );
}
