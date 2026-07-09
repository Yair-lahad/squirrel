import { categoryVisual } from '../core/categoryVisuals';

export default function CategoryGrid({ categories }) {
  if (!categories.length) return null;

  return (
    <section className="category-grid-section">
      <h2>Existing categories</h2>
      <div className="category-grid">
        {categories.map((category) => {
          const { icon, initial, color } = categoryVisual(category);
          return (
            <div className="category-chip" key={category}>
              <span className="category-chip-icon" style={{ backgroundColor: color }}>
                {icon || initial}
              </span>
              <span className="category-chip-label">{category}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
