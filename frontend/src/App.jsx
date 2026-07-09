import { useEffect, useState } from 'react';
import Header from './components/layout/Header';
import Nav from './components/layout/Nav';
import HomePage from './pages/HomePage';
import LoadDataPage from './pages/LoadDataPage';
import ChartsPage from './pages/ChartsPage';
import TransactionsPage from './pages/TransactionsPage';
import OverviewPage from './pages/OverviewPage';
import { useTransactions } from './hooks/useTransactions';

const PAGES = {
  home: HomePage,
  charts: ChartsPage,
  transactions: TransactionsPage,
  overview: OverviewPage,
  'load-data': LoadDataPage,
};

// TODO: default back to 'home' once it's ready to be the landing page.
const DEFAULT_PAGE = 'charts';

function currentPage() {
  const path = window.location.pathname.slice(1);
  return path in PAGES ? path : DEFAULT_PAGE;
}

export default function App() {
  const [page, setPage] = useState(currentPage);
  const [transactions, setTransactions] = useTransactions();
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const onPopState = () => setPage(currentPage());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  function changePage(next) {
    window.history.pushState(null, '', `/${next}`);
    setPage(next);
    setSelectedCategory(null);
  }

  function handleSelectCategory(category) {
    window.history.pushState(null, '', '/transactions');
    setPage('transactions');
    setSelectedCategory(category);
  }

  const Page = PAGES[page];

  return (
    <>
      <Header />
      <Nav page={page} onChange={changePage} />
      <Page
        transactions={transactions}
        onLoaded={setTransactions}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        onClearCategory={() => setSelectedCategory(null)}
      />
    </>
  );
}
