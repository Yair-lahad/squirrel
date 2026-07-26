// Each category as a circle sized by its share of the metric (area-proportional,
// via sqrt) — a more visceral "this one's big" read than a bar's length.
import { formatCurrency } from '../../core/format';
import CashStackIcon from '../icons/CashStackIcon';
import CoinsIcon from '../icons/CoinsIcon';

const MIN_DIAMETER = 64;
const MAX_DIAMETER = 200;

// Below this, a fanned stack of bills reads as an exaggeration — coins fit better.
const CASH_STACK_THRESHOLD = 100;

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
              {metric === 'amount' ? (
                row.amount >= CASH_STACK_THRESHOLD ? (
                  <CashStackIcon className="bubble-icon" size="1em" />
                ) : (
                  <CoinsIcon className="bubble-icon" size="1em" />
                )
              ) : (
                <span className="bubble-icon">{'\u{1F9FE}'}</span>
              )}
              <span className="bubble-value">{valueText}</span>
            </span>
            <span className="bubble-label">{row.category}</span>
          </button>
        );
      })}
    </div>
  );
}
