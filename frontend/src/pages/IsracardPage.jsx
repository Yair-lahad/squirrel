import FetchForm from '../utils/FetchForm';
import Dashboard from '../components/Dashboard';

export default function IsracardPage({ transactions, onLoaded }) {
  return (
    <>
      <FetchForm onLoaded={onLoaded} />
      <Dashboard transactions={transactions} />
    </>
  );
}
