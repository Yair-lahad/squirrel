import Select from '../ui/Select';

const VIEWS = [
  { key: 'bar', label: 'Bar' },
  { key: 'pie', label: 'Pie' },
  { key: 'bubble', label: 'Bubble' },
];

export default function ViewToggle({ view, onChange }) {
  return (
    <label className="view-toggle-label">
      View
      <Select className="view-toggle" value={view} onChange={(e) => onChange(e.target.value)}>
        {VIEWS.map((v) => (
          <option key={v.key} value={v.key}>{v.label}</option>
        ))}
      </Select>
    </label>
  );
}
