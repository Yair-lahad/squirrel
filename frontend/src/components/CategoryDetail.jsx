/**
 * `categories` is always an array: one entry for a normal category click,
 * several when an "Others" group (see othersThreshold.js) was clicked.
 */
import { fetchCategoryDetail } from '../routes/analytics';
import { useAnalytics } from '../hooks/useAnalytics';
import SummaryHeader from './SummaryHeader';
import CategoryScatterChart from './charts/CategoryScatterChart';
import { OTHERS_LABEL } from './charts/othersThreshold';
import Advisor from '../agents/advisor/Advisor';

export default function CategoryDetail({ categories, transactions, onBack }) {
  const detail = useAnalytics(() => fetchCategoryDetail(transactions, categories), [transactions, categories]);

  if (!detail) return null;

  const { items } = detail;
  const isGroup = categories.length > 1;
  const title = isGroup ? OTHERS_LABEL : categories[0];

  return (
    <div className="category-detail">
      <SummaryHeader
        title={title}
        transactions={items}
        actions={<button type="button" className="back-link" onClick={onBack}>← Back to charts</button>}
      />
      {isGroup && <p className="category-detail-subtitle">{categories.join(', ')}</p>}
      <div className="category-detail-layout">
        <CategoryScatterChart transactions={items} />
        <Advisor categories={categories} transactions={transactions} />
      </div>
    </div>
  );
}
