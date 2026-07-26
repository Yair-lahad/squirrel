import { useLayoutEffect, useRef, useState } from 'react';
import Pagination from './Pagination';

// Shared table shell for the transactions list and the rules list — both are
// a "#"-numbered grid of columns with an optional sortable header and an
// optional pagination footer. Each column owns its own cell rendering
// (`render`), so the caller keeps full control over inline editing, custom
// formatting, and action buttons without this component knowing about any
// of that.
export default function Table({
  columns,
  rows,
  rowKey,
  rowStart = 0,
  sortKey,
  sortAsc,
  onSort,
  emptyMessage,
  pagination,
}) {
  const columnCount = columns.length + 1;

  // Locks the card to the tallest height it's ever needed — search/filtering
  // down to a handful of rows (or one) then shrinks the box instead of the
  // page jumping underneath it. Only ever grows, so a bigger dataset (or
  // clearing the search) still fits. Measured on the inner wrapper (not the
  // card itself) so the reading reflects the rows actually rendered, not the
  // min-height the card is currently holding.
  //
  // Picking a new "rows per page" is the one case that should shrink instead
  // of staying locked — it's a deliberate resize, not a filter — so the lock
  // resets whenever pageSize changes.
  const contentRef = useRef(null);
  const [minHeight, setMinHeight] = useState(0);
  const prevPageSizeRef = useRef(pagination?.pageSize);

  useLayoutEffect(() => {
    if (!contentRef.current) return;
    const height = contentRef.current.scrollHeight;
    const pageSizeChanged = pagination?.pageSize !== prevPageSizeRef.current;
    prevPageSizeRef.current = pagination?.pageSize;
    setMinHeight((prev) => (pageSizeChanged ? height : Math.max(prev, height)));
  }, [rows, pagination?.pageSize]);

  return (
    <div className="table-card" style={{ minHeight: minHeight || undefined }}>
      <div ref={contentRef}>
        <table>
          <thead>
            <tr>
              <th className="row-number-header">#</th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={col.sortable ? () => onSort(col.key) : undefined}
                  className={col.sortable ? 'sortable-header' : undefined}
                >
                  {col.label}
                  {col.sortable && (
                    <span className="sort-arrow">
                      {sortKey === col.key ? (sortAsc ? ' ▲' : ' ▼') : ''}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row, localI) => {
                const i = rowStart + localI;
                return (
                  <tr key={rowKey ? rowKey(row, i) : i}>
                    <td className="row-number">{i + 1}</td>
                    {columns.map((col) => (
                      <td key={col.key} className={col.cellClassName?.(row)} {...col.cellProps?.(row, i)}>
                        {col.render ? col.render(row, i) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columnCount}>{emptyMessage}</td>
              </tr>
            )}
          </tbody>
        </table>
        {pagination && <Pagination {...pagination} />}
      </div>
    </div>
  );
}
