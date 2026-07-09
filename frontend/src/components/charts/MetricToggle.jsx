const METRICS = [
  { key: 'amount', label: 'Amount' },
  { key: 'count', label: 'Number of transactions' },
];

export default function MetricToggle({ metric, onChange }) {
  return (
    <div className="toggle-group metric-toggle">
      {METRICS.map((m) => (
        <button key={m.key} type="button" className={m.key === metric ? 'active' : ''} onClick={() => onChange(m.key)}>
          {m.label}
        </button>
      ))}
    </div>
  );
}
