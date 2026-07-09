import { useEffect, useState } from 'react';
import Header from './components/layout/Header';
import Nav from './components/layout/Nav';
import HomePage from './pages/HomePage';
import LoadDataPage from './pages/LoadDataPage';
import ChartsPage from './pages/ChartsPage';
import TransactionsPage from './pages/TransactionsPage';
import { useTransactions } from './hooks/useTransactions';

const PAGES = {
  home: HomePage,
  charts: ChartsPage,
  transactions: TransactionsPage,
  'load-data': LoadDataPage,
};

const DEFAULT_PAGE = 'home';

function currentPage() {
  const path = window.location.pathname.slice(1);
  return path in PAGES ? path : DEFAULT_PAGE;
}

export default function App() {
  const [page, setPage] = useState(currentPage);
  const [transactions, setTransactions] = useTransactions();

  useEffect(() => {
    const onPopState = () => setPage(currentPage());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  function changePage(next) {
    window.history.pushState(null, '', `/${next}`);
    setPage(next);
  }

  const Page = PAGES[page];

  return (
    <>
      <header className="site-header">
        <Nav page={page} onChange={changePage} />
        <Header />
      </header>
      <Page transactions={transactions} onLoaded={setTransactions} />
    </>
  );
}
