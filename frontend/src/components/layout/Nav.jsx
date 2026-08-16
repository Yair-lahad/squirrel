import TabNav from './TabNav';

const PAGES = [
  { id: 'home', label: 'Home' },
  { id: 'charts', label: 'Charts' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'categories', label: 'Categories' },
  { id: 'load-data', label: 'Load data' },
];

export default function Nav({ page, onChange }) {
  const items = PAGES.map((p) => ({ id: p.id, label: p.label, href: `/${p.id}` }));
  return <TabNav items={items} value={page} onChange={onChange} />;
}
