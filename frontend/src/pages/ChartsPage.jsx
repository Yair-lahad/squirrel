// The tab nav stays mounted across the drill-in into CategoryDetail so that
// transition doesn't reflow the page above the chart.
import { useEffect, useRef, useState } from 'react';
import SpendingChart from '../components/charts/SpendingChart';
import TimelineCompareChart, { TOTAL } from '../components/charts/TimelineCompareChart';
import CategoryDetail from '../components/CategoryDetail';
import EmptyState from '../components/layout/EmptyState';
import TabNav from '../components/layout/TabNav';

const TABS = [
  { id: 'category', label: 'By Category' },
  { id: 'timeline', label: 'Timeline Compare' },
];

export default function ChartsPage({ transactions, allTransactions, uploads, chartsTab, onChartsTabChange, onLoaded, onChangeUpload }) {
  const [drill, setDrill] = useState(null); // { categories }
  const [metric, setMetric] = useState('amount');
  // Lifted out of TimelineCompareChart so "back" from a drill-in remembers it.
  const [timelineCategory, setTimelineCategory] = useState(TOTAL);
  const detailRef = useRef(null);
  const contentRef = useRef(null);

  // Only centers the plain tab view (Timeline <-> By Category / closing a
  // drill) - entering a drill is handled separately by scrollToDetail, once
  // its data is actually ready.
  const viewKey = drill ? 'detail' : chartsTab;
  const prevViewKeyRef = useRef(viewKey);
  useEffect(() => {
    if (viewKey !== prevViewKeyRef.current) {
      prevViewKeyRef.current = viewKey;
      if (viewKey !== 'detail') {
        // Double-rAF waits for the new view's layout to settle before
        // measuring where to scroll - skipping this is what made it "bump":
        // the target was computed against the old (pre-swap) layout.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          });
        });
      }
    }
  }, [viewKey]);

  if (!transactions.length) return <EmptyState />;

   function scrollToDetail() {
    detailRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' });
  }

  function closeDrill() {
    setDrill(null);
  }

  // Resolves against data already in memory - no fetch, no load flash.
  function goToFileCategory(uploadId, category) {
    onChangeUpload(uploadId);
    onChartsTabChange('category');
    setDrill({ categories: [category] });
  }

  return (
    <div className="charts">
      <TabNav
        className="top-nav sub-nav"
        items={TABS}
        value={chartsTab}
        onChange={(tab) => {
          closeDrill();
          onChartsTabChange(tab);
        }}
      />
      <div ref={contentRef}>
        {drill ? (
          <div ref={detailRef}>
            <CategoryDetail
              categories={drill.categories}
              transactions={transactions}
              metric={metric}
              onBack={closeDrill}
              onSelectCategories={(categories) => setDrill({ categories })}
              onReady={scrollToDetail}
              onTransactionsChange={onLoaded}
            />
          </div>
        ) : chartsTab === 'timeline' ? (
          <TimelineCompareChart
            uploads={uploads}
            transactions={allTransactions}
            onSelectFileCategory={goToFileCategory}
            selected={timelineCategory}
            onSelectedChange={setTimelineCategory}
          />
        ) : (
          <SpendingChart
            transactions={transactions}
            metric={metric}
            onMetricChange={setMetric}
            onSelectCategories={(categories) => setDrill({ categories })}
          />
        )}
      </div>
    </div>
  );
}
