import { useState } from 'react';
import { categoryVisual } from '../core/categoryVisuals';

function CategoryChip({ category, onRename, onDelete }) {
  const { icon, initial, color } = categoryVisual(category.name);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(category.name);

  function commit() {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== category.name) onRename(category.id, trimmed);
    else setDraft(category.name);
  }

  if (editing) {
    return (
      <span className="category-chip category-chip-editing">
        <span className="category-chip-icon" style={{ backgroundColor: color }}>
          {icon || initial}
        </span>
        <input
          autoFocus
          autoComplete="off"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.target.blur();
            if (e.key === 'Escape') {
              setDraft(category.name);
              setEditing(false);
            }
          }}
        />
      </span>
    );
  }

  return (
    <div className="category-chip">
      <span className="category-chip-icon" style={{ backgroundColor: color }}>
        {icon || initial}
      </span>
      <span className="category-chip-label">{category.name}</span>
      {category.id != null && (
        <span className="category-chip-actions">
          <button
            type="button"
            title="Rename category"
            onClick={() => {
              setDraft(category.name);
              setEditing(true);
            }}
          >
            ✎
          </button>
          <button
            type="button"
            title="Delete category"
            onClick={() => {
              if (window.confirm(`Delete category "${category.name}"?`)) onDelete(category.id);
            }}
          >
            🗑
          </button>
        </span>
      )}
    </div>
  );
}

export default function CategoryGrid({ categories, onRename, onDelete }) {
  if (!categories.length) return null;

  return (
    <section className="category-grid-section">
      <h2>Existing categories</h2>
      <div className="category-grid">
        {categories.map((category) => (
          <CategoryChip key={category.name} category={category} onRename={onRename} onDelete={onDelete} />
        ))}
      </div>
    </section>
  );
}
