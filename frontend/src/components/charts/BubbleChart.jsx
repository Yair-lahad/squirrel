// Each category as a circle sized by its share of the metric (area-proportional,
// via sqrt) - a more visceral "this one's big" read than a bar's length.
import { formatCurrency } from '../../core/format';
import { categoryVisual } from '../../core/categoryVisuals';

const MIN_DIAMETER = 64;
const MAX_DIAMETER = 200;

// Same simple-emoji-on-a-colored-circle language as the count metric's
// per-category icon, rather than a detailed fixed-palette illustration.
// Below this, a banknote reads as an exaggeration - a coin fits better.
const CASH_THRESHOLD = 100;
const CASH_ICON = '\u{1F4B5}';
const COIN_ICON = '\u{1FA99}';

function diameterFor(value, maxValue) {
  const ratio = maxValue > 0 ? Math.sqrt(value / maxValue) : 0;
  return MIN_DIAMETER + (MAX_DIAMETER - MIN_DIAMETER) * ratio;
}

export default function BubbleChart({ rows, metric, colors, onSelectCategories }) {
  const maxValue = Math.max(...rows.map((r) => r[metric]), 0);

  return (
    <div className="bubble-chart">
      {rows.map((row, i) => {
        const diameter = diameterFor(row[metric], maxValue);
        const valueText = metric === 'amount' ? formatCurrency(row.amount) : row.count;
        const { icon, initial } = categoryVisual(row.category);
        return (
          <button
            key={row.category}
            type="button"
            className="bubble"
            onClick={() => onSelectCategories(row.categories ?? [row.category])}
          >
            <span
              className="bubble-circle"
              style={{
                width: diameter,
                height: diameter,
                '--bubble-color': colors[i],
                fontSize: Math.max(11, diameter * 0.14),
              }}
            >
              <span className="bubble-icon">
                {metric === 'amount' ? (row.amount >= CASH_THRESHOLD ? CASH_ICON : COIN_ICON) : icon || initial}
              </span>
              <span className="bubble-value">{valueText}</span>
            </span>
            <span className="bubble-label">{row.category}</span>
          </button>
        );
      })}
    </div>
  );
}
