const PAGES = [
  { id: 'home', label: 'Home' },
  { id: 'charts', label: 'Charts' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'categories', label: 'Categories' },
  { id: 'load-data', label: 'Load data' },
];

export default function Nav({ page, onChange }) {
  return (
    <nav className="top-nav">
      {PAGES.map((p) => (
        <a
          key={p.id}
          href={`/${p.id}`}
          className={p.id === page ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            onChange(p.id);
          }}
        >
          {p.label}
        </a>
      ))}
    </nav>
  );
}
