// The full picker chart shows until a category is chosen; once one is,
// it's replaced entirely by the drawer, whose side column carries a lean
// MiniCategoryPicker (under Advisor) so switching categories never needs
// scrolling back up to a chart that isn't there anymore.
import { useRef, useState } from 'react';
import SpendingChart from '../components/charts/SpendingChart';
import CategoryDetail from '../components/CategoryDetail';
import EmptyState from '../components/layout/EmptyState';

export default function ChartsPage({ transactions }) {
  const [selectedCategories, setSelectedCategories] = useState(null);
  const [metric, setMetric] = useState('amount');
  const detailRef = useRef(null);

  if (!transactions.length) return <EmptyState />;

  function scrollToDetail() {
    detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (selectedCategories) {
    return (
      <div ref={detailRef}>
        <CategoryDetail
          categories={selectedCategories}
          transactions={transactions}
          metric={metric}
          onBack={() => setSelectedCategories(null)}
          onSelectCategories={setSelectedCategories}
          onReady={scrollToDetail}
        />
      </div>
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
