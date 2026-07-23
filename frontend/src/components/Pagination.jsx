import { PAGE_SIZE_OPTIONS } from '../hooks/usePagination';

// Rows-per-page and Prev/Next live together in one control, meant to sit
// below a table — pairing the pair up here keeps every table's pagination
// looking and behaving the same.
export default function Pagination({ pageSize, onPageSizeChange, page, onPageChange, pageCount }) {
  return (
    <div className="table-toolbar table-toolbar-bottom">
      <label>
        Rows per page:{' '}
        <select value={pageSize} onChange={(e) => onPageSizeChange(e.target.value === 'All' ? 'All' : Number(e.target.value))}>
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </label>
      {pageSize !== 'All' && (
        <span className="table-pagination">
          <button type="button" disabled={page === 0} onClick={() => onPageChange(page - 1)}>‹ Prev</button>
          Page {page + 1} of {pageCount}
          <button type="button" disabled={page >= pageCount - 1} onClick={() => onPageChange(page + 1)}>Next ›</button>
        </span>
      )}
    </div>
  );
}
