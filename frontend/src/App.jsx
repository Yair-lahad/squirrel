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

// Which pages the upload selector is relevant to - Categories/Load Data/Home
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
  const [chartsTab, setChartsTab] = useState('category');
  const { transactions, allTransactions, uploads, selectedUploadId, changeUpload, refresh } = useUploads();

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
  // The timeline tab compares across every upload on its own, so the
  // month/upload selector has nothing to do there - hide it rather than
  // leave a control that looks live but is quietly ignored.
  const showUploadSelector = Page.showUploadSelector && !(page === 'charts' && chartsTab === 'timeline');

  return (
    <>
      <header className="site-header">
        <Header />
        <Nav page={page} onChange={changePage} />
        <div className="site-header-right">
          {showUploadSelector && (
            <UploadSelector uploads={uploads} value={selectedUploadId} onChange={changeUpload} />
          )}
        </div>
      </header>
      {Object.entries(PAGES).map(([key, PageComponent]) => (
        <div key={key} style={{ display: page === key ? 'contents' : 'none' }}>
          <PageComponent
            transactions={transactions}
            allTransactions={allTransactions}
            uploads={uploads}
            chartsTab={chartsTab}
            onChartsTabChange={setChartsTab}
            onLoaded={() => refresh()}
            onChangeUpload={changeUpload}
          />
        </div>
      ))}
    </>
  );
}
