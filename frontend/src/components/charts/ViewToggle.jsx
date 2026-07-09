const VIEWS = [
  { key: 'bar', label: 'Bar' },
  { key: 'pie', label: 'Pie' },
];

export default function ViewToggle({ view, onChange }) {
  return (
    <div className="toggle-group view-toggle">
      {VIEWS.map((v) => (
        <button key={v.key} type="button" className={v.key === view ? 'active' : ''} onClick={() => onChange(v.key)}>
          {v.label}
        </button>
      ))}
    </div>
  );
}
