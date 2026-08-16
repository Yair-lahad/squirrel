// The tab nav stays mounted across the drill-in into CategoryDetail so that
// transition doesn't reflow the page above the chart.
import { useEffect, useRef, useState } from 'react';
import SpendingChart from '../components/charts/SpendingChart';
import TimelineCompareChart, { TOTAL } from '../components/charts/TimelineCompareChart';
import CategoryDetail from '../components/CategoryDetail';
import EmptyState from '../components/layout/EmptyState';
import TabNav from '../components/layout/TabNav';
import { fetchTransactions } from '../routes/transactions';
import { fetchCategoryDetail } from '../routes/analytics';

const TABS = [
  { id: 'category', label: 'By Category' },
  { id: 'timeline', label: 'Timeline Compare' },
];

export default function ChartsPage({ transactions, uploads, chartsTab, onChartsTabChange, onLoaded, onChangeUpload }) {
  // `detail` is only ever set when pre-fetched (see goToFileCategory) -
  // seeding CategoryDetail with it up front avoids the loading flash.
  const [drill, setDrill] = useState(null); // { categories, detail }
  const [metric, setMetric] = useState('amount');
  // Lifted out of TimelineCompareChart so "back" from a drill-in remembers it.
  const [timelineCategory, setTimelineCategory] = useState(TOTAL);
  // Fetched once and kept for the life of this page - ChartsPage itself
  // doesn't unmount when toggling into/out of CategoryDetail, so this
  // survives "back" instead of Timeline Compare re-fetching every time.
  const [allTransactions, setAllTransactions] = useState(null);
  const detailRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (chartsTab === 'timeline' && allTransactions === null) {
      fetchTransactions({ all: true }).then(setAllTransactions);
    }
  }, [chartsTab, allTransactions]);

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

  // Instant, not smooth - this transition already swaps the whole view
  // (Timeline for a differently-shaped detail page), so animating the
  // scroll on top of that content swap is what reads as a "bump". A jump
  // has no motion to perceive.
  function scrollToDetail() {
    detailRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' });
  }

  function closeDrill() {
    setDrill(null);
  }

  // Fetches the target upload's transactions and its category detail before
  // switching views, so CategoryDetail mounts already-loaded instead of
  // showing a loading placeholder then popping in a moment later.
  async function goToFileCategory(uploadId, category) {
    const [fileTransactions] = await Promise.all([fetchTransactions({ uploadId }), onChangeUpload(uploadId)]);
    const detail = await fetchCategoryDetail(fileTransactions, [category]);
    onChartsTabChange('category');
    setDrill({ categories: [category], detail });
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
              initialDetail={drill.detail}
              onBack={closeDrill}
              onSelectCategories={(categories) => setDrill({ categories, detail: null })}
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
            onSelectCategories={(categories) => setDrill({ categories, detail: null })}
          />
        )}
      </div>
    </div>
  );
}
