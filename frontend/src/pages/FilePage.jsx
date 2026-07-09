import FileLoader from '../utils/FileLoader';
import Dashboard from '../components/Dashboard';

export default function FilePage({ transactions, onLoaded }) {
  return (
    <>
      <div className="toolbar">
        <FileLoader onLoaded={onLoaded} />
      </div>
      <Dashboard transactions={transactions} />
    </>
  );
}
