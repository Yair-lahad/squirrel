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

  return (
    <div className="table-card">
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
  );
}
