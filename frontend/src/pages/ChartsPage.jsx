// shows the category chart until a category (or "Others" group) is selected, then swaps to its detail view in place.
import { useState } from 'react';
import SpendingChart from '../components/charts/SpendingChart';
import CategoryDetail from '../components/CategoryDetail';
import EmptyState from '../components/layout/EmptyState';

export default function ChartsPage({ transactions }) {
  const [selectedCategories, setSelectedCategories] = useState(null);
  const [metric, setMetric] = useState('amount');

  if (!transactions.length) return <EmptyState />;

  if (selectedCategories) {
    return (
      <CategoryDetail
        categories={selectedCategories}
        transactions={transactions}
        onBack={() => setSelectedCategories(null)}
      />
    );
  }

  return (
    <div className="charts">
      <SpendingChart
        transactions={transactions}
        metric={metric}
        onMetricChange={setMetric}
        onSelectCategories={setSelectedCategories}
      />
    </div>
  );
}
