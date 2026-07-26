/**
 * `categories` is always an array: one entry for a normal category click,
 * several when an "Others" group (see othersThreshold.js) was clicked.
 */
import { useEffect } from 'react';
import { fetchCategoryDetail } from '../routes/analytics';
import { useAnalytics } from '../hooks/useAnalytics';
import { formatPeriod } from '../core/format';
import SummaryHeader from './SummaryHeader';
import CategoryScatterChart from './charts/CategoryScatterChart';
import MiniCategoryPicker from './charts/MiniCategoryPicker';
import { OTHERS_LABEL } from './charts/othersThreshold';
import Advisor from '../agents/advisor/Advisor';
import Button from './ui/Button';

export default function CategoryDetail({ categories, transactions, metric, onBack, onSelectCategories, onReady }) {
  const detail = useAnalytics(() => fetchCategoryDetail(transactions, categories), [transactions, categories]);

  useEffect(() => {
    if (detail) onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail]);

  if (!detail) return null;

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
        <CategoryScatterChart transactions={items} />
        <MiniCategoryPicker
          transactions={transactions}
          metric={metric}
          activeCategories={categories}
          onSelectCategories={onSelectCategories}
        />
        <Advisor categories={categories} transactions={transactions} />
      </div>
    </div>
  );
}
