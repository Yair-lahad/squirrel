import { useEffect, useState } from 'react';
import Header from './components/layout/Header';
import Nav from './components/layout/Nav';
import UploadSelector from './components/layout/UploadSelector';
import HomePage from './pages/HomePage';
import LoadDataPage from './pages/LoadDataPage';
import ChartsPage from './pages/ChartsPage';
import TransactionsPage from './pages/TransactionsPage';
import CategoriesPage from './pages/CategoriesPage';
import { useUploads } from './hooks/useUploads';

const PAGES = {
  home: HomePage,
  charts: ChartsPage,
  transactions: TransactionsPage,
  categories: CategoriesPage,
  'load-data': LoadDataPage,
};

// Which pages the upload selector is relevant to — Categories/Load Data/Home
// don't filter by upload, so showing it there would just be noise.
ChartsPage.showUploadSelector = true;
TransactionsPage.showUploadSelector = true;

const DEFAULT_PAGE = 'home';

function currentPage() {
  const path = window.location.pathname.slice(1);
  return path in PAGES ? path : DEFAULT_PAGE;
}

export default function App() {
  const [page, setPage] = useState(currentPage);
  const { transactions, uploads, selectedUploadId, changeUpload, refresh } = useUploads();

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
        {Page.showUploadSelector && (
          <UploadSelector uploads={uploads} value={selectedUploadId} onChange={changeUpload} />
        )}
        <Header />
      </header>
      <Page transactions={transactions} onLoaded={() => refresh()} />
    </>
  );
}
