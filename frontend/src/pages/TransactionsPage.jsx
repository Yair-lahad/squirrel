import { useState } from 'react';
import TransactionsTable from '../components/TransactionsTable';
import SummaryHeader from '../components/SummaryHeader';
import EmptyState from '../components/layout/EmptyState';
import Input from '../components/ui/Input';

export default function TransactionsPage({ transactions, onLoaded }) {
  const [search, setSearch] = useState('');

  if (!transactions.length) return <EmptyState />;

  return (
    <>
      <SummaryHeader
        title="Transactions"
        transactions={transactions}
        actions={
          <Input
            type="text"
            className="table-search"
            autoComplete="off"
            placeholder="Search title, description, category, or date (e.g. 06.07.2026)…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        }
      />
      <TransactionsTable transactions={transactions} search={search} onTransactionsChange={onLoaded} />
    </>
  );
}
