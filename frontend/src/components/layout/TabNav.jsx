// Shared look for any row of nav-style tabs - the top-level page Nav and any
// in-page sub-nav (e.g. Charts' "By category" / "Timeline compare") render
// through this so they stay visually identical.
export default function TabNav({ items, value, onChange, className = 'top-nav' }) {
  return (
    <nav className={className}>
      {items.map((item) => (
        <a
          key={item.id}
          href={item.href ?? '#'}
          className={item.id === value ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            onChange(item.id);
          }}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
