import { useEffect, useState } from 'react';
import Header from './components/layout/Header';
import Nav from './components/layout/Nav';
import IsracardPage from './pages/IsracardPage';
import FilePage from './pages/FilePage';
import { usePageTransactions } from './hooks/usePageTransactions';

const PAGES = {
  isracard: IsracardPage,
  file: FilePage,
};

function currentPage() {
  const hash = window.location.hash.slice(1);
  return hash in PAGES ? hash : 'isracard';
}

export default function App() {
  const [page, setPage] = useState(currentPage);
  const [transactions, setTransactions] = usePageTransactions(page);

  useEffect(() => {
    const onPopState = () => setPage(currentPage());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  function changePage(next) {
    window.history.pushState(null, '', `#${next}`);
    setPage(next);
  }

  const Page = PAGES[page];

  return (
    <>
      <Header />
      <Nav page={page} onChange={changePage} />
      <Page transactions={transactions} onLoaded={setTransactions} />
    </>
  );
}
