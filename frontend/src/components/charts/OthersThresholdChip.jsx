export default function OthersThresholdChip({ metric, threshold, active, onToggle, onThresholdChange }) {
  return (
    <div className="toggle-group others-toggle">
      <label className={`others-chip ${active ? 'active' : ''}`}>
        <span onClick={onToggle}>Group &lt;</span>
        <input
          type="number"
          min="0"
          step={metric === 'amount' ? 10 : 1}
          value={threshold}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onThresholdChange(Number(e.target.value))}
        />
        <span onClick={onToggle}>{metric === 'amount' ? '₪' : 'tx'}</span>
      </label>
    </div>
  );
}
