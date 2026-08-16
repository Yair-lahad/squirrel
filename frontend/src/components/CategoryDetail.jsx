/**
 * `categories` is always an array: one entry for a normal category click,
 * several when an "Others" group (see othersThreshold.js) was clicked.
 */
import { useEffect, useRef } from 'react';
import { categoryDetail } from '../utils/analytics';
import { formatPeriod } from '../utils/format';
import SummaryHeader from './SummaryHeader';
import CategoryScatterChart from './charts/CategoryScatterChart';
import MiniCategoryPicker from './charts/MiniCategoryPicker';
import { OTHERS_LABEL } from './charts/othersThreshold';
import Advisor from '../agents/advisor/Advisor';
import Button from './ui/Button';

export default function CategoryDetail({ categories, transactions, metric, onBack, onSelectCategories, onReady, onTransactionsChange }) {
  const detail = categoryDetail(transactions, categories);

  // Only scroll on the initial open, not on every category switch within an
  // already-open detail view.
  const hasScrolledRef = useRef(false);
  useEffect(() => {
    if (!hasScrolledRef.current) {
      hasScrolledRef.current = true;
      onReady?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
