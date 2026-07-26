import { useState } from 'react';
import { categoryVisual } from '../core/categoryVisuals';
import TrashIcon from './icons/TrashIcon';
import SectionHeading from './ui/SectionHeading';

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
      <div className="category-chip-icon-wrap">
        {category.id != null && (
          <button
            type="button"
            className="category-chip-edit"
            title="Rename category"
            onClick={() => {
              setDraft(category.name);
              setEditing(true);
            }}
          >
            ✎
          </button>
        )}
        <span className="category-chip-icon" style={{ backgroundColor: color }}>
          {icon || initial}
        </span>
        {category.id != null && (
          <button
            type="button"
            className="category-chip-delete"
            title="Delete category"
            onClick={() => {
              if (window.confirm(`Delete category "${category.name}"?`)) onDelete(category);
            }}
          >
            <TrashIcon size={15} />
          </button>
        )}
      </div>
      <span className="category-chip-label">{category.name}</span>
    </div>
  );
}

export default function CategoryGrid({
  categories,
  onRename,
  onDelete,
  addingCategory,
  newCategoryName,
  onNewCategoryNameChange,
  onAddClick,
  onAddSubmit,
  onAddCancel,
}) {
  return (
    <section className="category-grid-section">
      <div className="category-grid-header">
        <SectionHeading>Categories</SectionHeading>
        {addingCategory ? (
          <form onSubmit={onAddSubmit} className="category-add-form">
            <input
              autoFocus
              autoComplete="off"
              value={newCategoryName}
              onChange={(e) => onNewCategoryNameChange(e.target.value)}
              placeholder="New category name"
              onKeyDown={(e) => {
                if (e.key === 'Escape') onAddCancel();
              }}
            />
            <button type="submit">Add</button>
            <button type="button" onClick={onAddCancel}>Cancel</button>
          </form>
        ) : (
          <button type="button" className="category-add-button" onClick={onAddClick}>
            + New category
          </button>
        )}
      </div>
      {categories.length > 0 && (
        <div className="category-grid">
          {categories.map((category) => (
            <CategoryChip key={category.name} category={category} onRename={onRename} onDelete={onDelete} />
          ))}
        </div>
      )}
    </section>
  );
}
