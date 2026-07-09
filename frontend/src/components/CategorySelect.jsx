import { useState } from 'react';

const NEW_OPTION = '__new__';

// A real dropdown of existing categories — "+ New category" is always the
// first choice, and picking it swaps the same slot to a text input in place
// (no popup/tooltip). Mount fresh (e.g. via `key`) to reset back to select
// mode after the value it represents changes out from under it.
//
// onChange fires on every keystroke/selection; onCommit (optional) fires when
// a value should be treated as final — immediately on picking an existing
// category, or on blur/Enter while typing a new one.
export default function CategorySelect({ id, value, categories, onChange, onCommit }) {
  const [creating, setCreating] = useState(categories.length === 0);

  function backToSelect() {
    setCreating(false);
    onChange('');
  }

  if (creating) {
    return (
      <span className="category-select-creating">
        <input
          id={id}
          autoFocus
          autoComplete="off"
          placeholder="New category name"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => onCommit?.(value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.target.blur();
            if (e.key === 'Escape') {
              e.stopPropagation();
              backToSelect();
            }
          }}
        />
        {categories.length > 0 && (
          <button
            type="button"
            className="category-select-back"
            title="Choose from existing categories instead"
            onMouseDown={(e) => e.preventDefault()}
            onClick={backToSelect}
          >
            ↩
          </button>
        )}
      </span>
    );
  }

  return (
    <select
      id={id}
      value={value}
      onChange={(e) => {
        if (e.target.value === NEW_OPTION) {
          setCreating(true);
          onChange('');
        } else {
          onChange(e.target.value);
          onCommit?.(e.target.value);
        }
      }}
    >
      <option value="" disabled>Select a category…</option>
      <option value={NEW_OPTION}>+ New category…</option>
      {value && !categories.includes(value) && <option value={value}>{value}</option>}
      {categories.map((c) => (
        <option key={c} value={c}>{c}</option>
      ))}
    </select>
  );
}
