/* Renders category spend as a bar or pie chart; clicking a category (or an
 "Others" group) opens its detail view via onSelectCategories. */
import { useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { PALETTE } from '../../core/palette';
import { OTHERS_LABEL } from './othersThreshold';
import { useCategoryRows } from '../../hooks/useCategoryRows';
import { useOthersGrouping } from '../../hooks/useOthersGrouping';
import { barOptions, pieOptions } from './spendingChartOptions';
import ViewToggle from './ViewToggle';
import MetricToggle from './MetricToggle';
import OthersThresholdChip from './OthersThresholdChip';

export default function SpendingChart({ transactions, metric, onMetricChange, onSelectCategories }) {
  const [view, setView] = useState('bar');

  const sortedRows = useCategoryRows(transactions, metric);
  const grouping = useOthersGrouping(sortedRows ?? [], metric);

  if (!sortedRows) return null;

  const { rows, groupSmall, toggleGroupSmall, threshold, setThreshold } = grouping;
  const colors = rows.map((r, i) => (r.category === OTHERS_LABEL ? PALETTE.muted : PALETTE.categorical[i % PALETTE.categorical.length]));
  const labels = rows.map((r) => r.category);
  const values = rows.map((r) => r[metric]);

  function handleClick(_event, elements) {
    if (!elements.length) return;
    const row = rows[elements[0].index];
    onSelectCategories(row.categories ?? [row.category]);
  }

  const chart =
    view === 'bar' ? (
      <Bar
        data={{ labels, datasets: [{ data: values, backgroundColor: colors, borderRadius: 4 }] }}
        options={barOptions({ rows, metric, onClick: handleClick })}
      />
    ) : (
      <Pie
        data={{ labels, datasets: [{ data: values, backgroundColor: colors, borderColor: PALETTE.surface, borderWidth: 2 }] }}
        options={pieOptions({ rows, metric, onClick: handleClick })}
      />
    );

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>Spend by category</h3>
        <div className="chart-controls">
          <ViewToggle view={view} onChange={setView} />
          <MetricToggle metric={metric} onChange={onMetricChange} />
          <OthersThresholdChip
            metric={metric}
            threshold={threshold}
            active={groupSmall}
            onToggle={toggleGroupSmall}
            onThresholdChange={setThreshold}
          />
        </div>
      </div>
      <p className="chart-hint">Click a category to see its transactions.</p>
      <div className="chart-canvas">{chart}</div>
    </div>
  );
}
