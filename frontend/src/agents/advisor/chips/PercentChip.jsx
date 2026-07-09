export default function PercentChip({ percent }) {
  return (
    <div className="advisor-chip">
      <span className="advisor-chip-label">Share of spend</span>
      <span className="advisor-chip-value">{percent.toFixed(0)}%</span>
    </div>
  );
}
