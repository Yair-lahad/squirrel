export default function AdvisorChip({ label, value, detail }) {
  return (
    <div className="advisor-chip">
      <span className="advisor-chip-label">{label}</span>
      <span className="advisor-chip-value" title={value}>{value}</span>
      {detail && (
        <span className="advisor-chip-detail" title={detail}>
          {detail}
        </span>
      )}
    </div>
  );
}
