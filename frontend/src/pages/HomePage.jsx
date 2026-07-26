import { useAnalytics } from '../hooks/useAnalytics';
import { fetchTransactions } from '../routes/transactions';
import OverviewPanel from '../components/OverviewPanel';
import EmptyState from '../components/layout/EmptyState';

// Home's overview always covers every upload combined, independent of
// whichever single upload the Charts/Transactions selector currently has
// picked - it's not scoped to that selection.
export default function HomePage() {
  const allTransactions = useAnalytics(() => fetchTransactions({ all: true }), []);

  if (!allTransactions) return null;

  return (
    <div className="home-page">
      <img src="/squirrel.png" alt="Squirrel mascot" className="home-image" />
      <p className="home-description">
        Squirrel helps you understand where your money goes.
        Load real transactions from a vendor or a sample file, then explore them.
      </p>
      {allTransactions.length ? (
        <div className="home-overview">
          <h2 className="home-overview-heading">Overview</h2>
          <OverviewPanel transactions={allTransactions} />
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
