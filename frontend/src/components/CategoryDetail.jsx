/**
 * `categories` is always an array: one entry for a normal category click,
 * several when an "Others" group (see othersThreshold.js) was clicked.
 */
import { useEffect, useRef } from 'react';
import { fetchCategoryDetail } from '../routes/analytics';
import { useAnalytics } from '../hooks/useAnalytics';
import { formatPeriod } from '../utils/format';
import SummaryHeader from './SummaryHeader';
import CategoryScatterChart from './charts/CategoryScatterChart';
import MiniCategoryPicker from './charts/MiniCategoryPicker';
import { OTHERS_LABEL } from './charts/othersThreshold';
import Advisor from '../agents/advisor/Advisor';
import Button from './ui/Button';

export default function CategoryDetail({ categories, transactions, metric, onBack, onSelectCategories, onReady, onTransactionsChange, initialDetail }) {
  const detail = useAnalytics(() => fetchCategoryDetail(transactions, categories), [transactions, categories], initialDetail);

  // Only scroll on the initial open, not on every category switch within an
  // already-open detail view (which re-fetches `detail` too).
  const hasScrolledRef = useRef(false);
  useEffect(() => {
    if (detail && !hasScrolledRef.current) {
      hasScrolledRef.current = true;
      onReady?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail]);

  // Reserves space while loading instead of collapsing to nothing, which
  // made navigating here feel like a jarring shift.
  if (!detail) return <div className="chart-loading-placeholder" />;

  const { items } = detail;
  const isGroup = categories.length > 1;
  const title = isGroup ? OTHERS_LABEL : categories[0];

  return (
    <div className="category-detail">
      <div className="category-detail-header">
        <SummaryHeader title={title} transactions={items} period={formatPeriod(transactions)} />
        <div className="category-detail-actions">
          <Button type="button" className="btn-pill" onClick={onBack}>← Back to charts</Button>
        </div>
      </div>
      {isGroup && <p className="category-detail-subtitle">{categories.join(', ')}</p>}
      <div className="category-detail-layout">
        <MiniCategoryPicker
          transactions={transactions}
          metric={metric}
          activeCategories={categories}
          onSelectCategories={onSelectCategories}
        />
        <CategoryScatterChart transactions={items} onTransactionsChange={onTransactionsChange} />
        <Advisor categories={categories} transactions={transactions} />
      </div>
    </div>
  );
}
