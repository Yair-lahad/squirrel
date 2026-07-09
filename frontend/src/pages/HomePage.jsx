import OverviewPanel from '../components/OverviewPanel';
import EmptyState from '../components/layout/EmptyState';

export default function HomePage({ transactions }) {
  return (
    <div className="home-page">
      <img src="/squirrel.png" alt="Squirrel mascot" className="home-image" />
      <p className="home-description">
        Squirrel helps you understand where your money goes. 
        Load real transactions from a vendor or a sample file, then explore them.
      </p>
      {transactions.length ? (
        <div className="home-overview">
          <h2 className="home-overview-heading">Overview</h2>
          <OverviewPanel transactions={transactions} />
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
