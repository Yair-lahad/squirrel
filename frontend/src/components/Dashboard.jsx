import CollapsiblePanel from './layout/CollapsiblePanel';
import KpiPanel from './KpiPanel';
import CategoryChart from './charts/CategoryChart';
import PieChart from './charts/PieChart';
import TransactionsTable from './TransactionsTable';

export default function Dashboard({ transactions }) {
  if (!transactions.length) return null;

  return (
    <main>
      <CollapsiblePanel title="Charts">
        <div className="charts">
          <CategoryChart transactions={transactions} />
          <PieChart transactions={transactions} />
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="Transactions">
        <TransactionsTable transactions={transactions} />
      </CollapsiblePanel>

      <CollapsiblePanel title="Overview" defaultOpen={false}>
        <KpiPanel transactions={transactions} />
      </CollapsiblePanel>
    </main>
  );
}
