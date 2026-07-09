import { useState } from 'react';
import SpendingChart from '../components/charts/SpendingChart';
import CategoryDetail from '../components/CategoryDetail';
import EmptyState from '../components/layout/EmptyState';

export default function ChartsPage({ transactions }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [metric, setMetric] = useState('amount');

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
      <SpendingChart
        transactions={transactions}
        metric={metric}
        onMetricChange={setMetric}
        onSelectCategory={setSelectedCategory}
      />
    </div>
  );
}
