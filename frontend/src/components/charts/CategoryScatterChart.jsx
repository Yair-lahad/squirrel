import { useState } from 'react';
import { Scatter } from 'react-chartjs-2';
import { formatCurrency, formatDayMonth } from '../../utils/format';
import { PALETTE } from '../../utils/palette';
import { createRule } from '../../routes/categories';
import Select from '../ui/Select';

const ALL = '__all__';

// Groups transactions by resolved title so one recurring merchant can be
// picked out and highlighted on its own.
function entityRows(transactions) {
  const byTitle = {};
  for (const t of transactions) {
    const entry = byTitle[t.title] || { title: t.title, count: 0, amount: 0 };
    entry.count += 1;
    entry.amount += Math.abs(t.amount);
    byTitle[t.title] = entry;
  }
  return Object.values(byTitle).sort((a, b) => b.amount - a.amount);
}

export default function CategoryScatterChart({ transactions, onTransactionsChange }) {
  const [selectedTitle, setSelectedTitle] = useState(ALL);
  // Optimistic rename overlay, applied locally until the parent refetches.
  const [titleOverrides, setTitleOverrides] = useState({});
  const [editing, setEditing] = useState(null); // { id, value, x, y }
  const [tooltip, setTooltip] = useState(null); // { x, y, title, amount, date }
  const [axisLeft, setAxisLeft] = useState(0);

  const resolved = transactions.map((t) => (titleOverrides[t.id] ? { ...t, title: titleOverrides[t.id] } : t));

  const entities = entityRows(resolved);
  const colorFor = (title) => {
    const i = entities.findIndex((r) => r.title === title);
    return PALETTE.categorical[i % PALETTE.categorical.length];
  };

  if (!transactions.length) {
    return (
      <div className="chart-card">
        <div className="chart-canvas chart-canvas-empty">
          <p className="empty-state">No transactions in this category for the selected upload.</p>
        </div>
      </div>
    );
  }

  // Same date + title + amount already overlap on the same pixel - merge them
  // into one point so hovering doesn't repeat the same row per duplicate.
  const points = [];
  const pointByKey = new Map();
  for (const t of resolved) {
    const key = `${t.date}|${t.title}|${t.amount}`;
    const existing = pointByKey.get(key);
    if (existing) {
      existing.ids.push(t.id);
      existing.count += 1;
    } else {
      const point = {
        ids: [t.id],
        count: 1,
        x: new Date(t.date).getTime(),
        y: Math.abs(t.amount),
        date: t.date,
        title: t.title,
        amount: t.amount,
      };
      pointByKey.set(key, point);
      points.push(point);
    }
  }

  const isDimmed = (p) => selectedTitle !== ALL && p.title !== selectedTitle;

  async function saveEdit() {
    if (!editing) return;
    const { ids, value } = editing;
    const trimmed = value.trim();
    const original = points.find((p) => p.ids === ids);
    setEditing(null);
    if (!trimmed || trimmed === original.title) return;
    setTitleOverrides((prev) => {
      const next = { ...prev };
      ids.forEach((id) => (next[id] = trimmed));
      return next;
    });
    await Promise.all(
      ids.map((id) => createRule({ attribute: 'title', matchType: 'transaction', transactionId: id, value: trimmed }))
    );
    await onTransactionsChange?.();
  }

  const data = {
    datasets: [
      {
        label: 'Transactions',
        data: points,
        backgroundColor: points.map((p) => `${isDimmed(p) ? PALETTE.muted : colorFor(p.title)}${isDimmed(p) ? '40' : 'cc'}`),
        borderColor: points.map((p) => (isDimmed(p) ? PALETTE.muted : colorFor(p.title))),
        borderWidth: 1,
        pointRadius: points.map((p) => (selectedTitle !== ALL ? (isDimmed(p) ? 5 : 9) : 7)),
        pointHoverRadius: 9,
      },
    ],
  };

  const measureAxis = {
    id: 'measureAxis',
    afterLayout: (chart) => setAxisLeft((prev) => (prev === chart.chartArea.left ? prev : chart.chartArea.left)),
  };

  const options = {
    maintainAspectRatio: false,
    onClick: (evt, elements) => {
      if (!elements.length) return;
      const { index, element } = elements[0];
      const p = points[index];
      setEditing({ ids: p.ids, value: p.title, x: element.x, y: element.y });
    },
    plugins: {
      legend: { display: false },
      datalabels: { display: false },
      tooltip: {
        enabled: false,
        external: (context) => {
          const tt = context.tooltip;
          if (!tt || tt.opacity === 0) {
            setTooltip(null);
            return;
          }
          const p = tt.dataPoints[0].raw;
          setTooltip({
            x: context.chart.canvas.offsetLeft + tt.caretX,
            y: context.chart.canvas.offsetTop + tt.caretY,
            title: p.count > 1 ? `${p.title} (×${p.count})` : p.title,
            amount: formatCurrency(Math.abs(p.amount)),
            date: formatDayMonth(p.date),
          });
        },
      },
    },
    scales: {
      x: {
        type: 'linear',
        ticks: {
          color: PALETTE.muted,
          // Just the day number, except when the month changes from the
          // previous tick (including the very first tick) - then prefix it
          // with the month name so the axis stays readable without
          // repeating "Jul" on every single label.
          callback: (value, index, ticks) => {
            const d = new Date(value);
            const day = d.getDate();
            const month = d.toLocaleDateString('en-GB', { month: 'short' });
            const prevMonth = index > 0 ? new Date(ticks[index - 1].value).getMonth() : null;
            return prevMonth === null || prevMonth !== d.getMonth() ? `${month} ${day}` : `${day}`;
          },
        },
        grid: { color: PALETTE.grid },
      },
      y: {
        beginAtZero: true,
        ticks: { color: PALETTE.muted },
        grid: { color: PALETTE.grid },
        title: { display: true, text: 'Amount', color: PALETTE.muted },
      },
    },
  };

  return (
    <div className="chart-card">
      {/* Always rendered, even with a single item - conditionally hiding this
          row made single-entity categories a bit shorter than others, which
          showed up as a layout shift when switching between them. */}
      <div className="chart-header">
        <label className="entity-select-label" style={{ marginLeft: axisLeft }}>
          Highlight item
          <Select value={selectedTitle} onChange={(e) => setSelectedTitle(e.target.value)}>
            <option value={ALL}>All items</option>
            {entities.map((row) => (
              <option key={row.title} value={row.title}>
                {row.title}{row.count > 1 ? ` ×${row.count}` : ''}
              </option>
            ))}
          </Select>
        </label>
      </div>
      <div className="chart-canvas">
        <Scatter data={data} options={options} plugins={[measureAxis]} />
        {editing && (
          <input
            autoFocus
            autoComplete="off"
            className="scatter-point-edit"
            style={{ left: editing.x, top: editing.y }}
            value={editing.value}
            onChange={(e) => setEditing((prev) => ({ ...prev, value: e.target.value }))}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.target.blur();
              if (e.key === 'Escape') setEditing(null);
            }}
          />
        )}
        {tooltip && (
          <div className="scatter-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
            <div>{tooltip.title}</div>
            <div>
              <span className="scatter-tooltip-amount">{tooltip.amount}</span>
              <span className="scatter-tooltip-date">{tooltip.date}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
