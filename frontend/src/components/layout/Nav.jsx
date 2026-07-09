const PAGES = [
  { id: 'isracard', label: 'Fetch from Isracard' },
  { id: 'file', label: 'Sample file' },
];

export default function Nav({ page, onChange }) {
  return (
    <nav className="top-nav">
      {PAGES.map((p) => (
        <a
          key={p.id}
          href={`#${p.id}`}
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
