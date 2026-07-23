import { formatMonthYear } from '../../core/format';

export default function UploadSelector({ uploads, value, onChange }) {
  if (!uploads.length) return null;

  return (
    <label className="upload-selector-label">
      Transactions
      <select
        className="upload-selector"
        value={value ?? 'all'}
        onChange={(e) => onChange(e.target.value === 'all' ? null : Number(e.target.value))}
      >
        {uploads.map(({ id, end_date: end }) => (
          <option key={id} value={id}>
            {formatMonthYear(new Date(end))}
          </option>
        ))}
        <option value="all">All uploads</option>
      </select>
    </label>
  );
}
