// Compact stand-in for the main picker chart while a category's drawer is
// open: a pie-legend-style list (swatch + name) sized by rank so it never
// grows taller than the scatter chart beside it - no edit/delete chips, no
// icons/value text, just enough to jump to a different category.
import { useCategoryRows } from '../../hooks/useCategoryRows';
import { PALETTE } from '../../core/palette';
import { OTHERS_LABEL } from './othersThreshold';

const MIN_SWATCH = 9;
const MAX_SWATCH = 16;

function swatchFor(value, maxValue) {
  const ratio = maxValue > 0 ? Math.sqrt(value / maxValue) : 0;
  return MIN_SWATCH + (MAX_SWATCH - MIN_SWATCH) * ratio;
}

export default function MiniCategoryPicker({ transactions, metric, activeCategories, onSelectCategories }) {
  const rows = useCategoryRows(transactions, metric);

  if (!rows) return null;

  const maxValue = Math.max(...rows.map((r) => r[metric]), 0);

  return (
    <div className="mini-legend-panel">
      <h4 className="mini-legend-title">Categories</h4>
      <ul className="mini-legend">
        {rows.map((row, i) => {
          const size = swatchFor(row[metric], maxValue);
          const color = row.category === OTHERS_LABEL ? PALETTE.muted : PALETTE.categorical[i % PALETTE.categorical.length];
          const isActive = activeCategories.length === 1 && activeCategories[0] === row.category;
          return (
            <li key={row.category} style={{ '--legend-delay': `${i * 25}ms` }}>
              <button
                type="button"
                className={`mini-legend-item${isActive ? ' active' : ''}`}
                onClick={() => onSelectCategories(row.categories ?? [row.category])}
              >
                <span className="mini-legend-swatch" style={{ width: size, height: size, background: color }} />
                <span className="mini-legend-label">{row.category}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
