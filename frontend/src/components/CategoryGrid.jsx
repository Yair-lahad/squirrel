import { useState } from 'react';
import { categoryVisual } from '../utils/categoryVisuals';
import TrashIcon from './icons/TrashIcon';
import SectionHeading from './ui/SectionHeading';
import Button from './ui/Button';

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

export default function CategoryGrid({ categories, onRename, onDelete, onCreate }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  function cancelAdd() {
    setAdding(false);
    setDraft('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (await onCreate(trimmed)) cancelAdd();
  }

  return (
    <section className="category-grid-section">
      <div className="category-grid-header">
        <SectionHeading>Categories</SectionHeading>
        {adding ? (
          <form onSubmit={handleSubmit} className="category-add-form">
            <input
              autoFocus
              autoComplete="off"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="New category name"
              onKeyDown={(e) => {
                if (e.key === 'Escape') cancelAdd();
              }}
            />
            <Button type="submit" className="btn-pill">Add</Button>
            <Button type="button" variant="ghost" className="btn-pill" onClick={cancelAdd}>Cancel</Button>
          </form>
        ) : (
          <Button type="button" className="btn-pill" onClick={() => setAdding(true)}>
            + New category
          </Button>
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
