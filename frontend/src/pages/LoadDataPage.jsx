import FetchForm from '../utils/FetchForm';
import FileLoader from '../utils/FileLoader';
import FileUpload from '../utils/FileUpload';

export default function LoadDataPage({ onLoaded }) {
  return (
    <div className="load-data-page">
      <FetchForm onLoaded={onLoaded} />
      <h2 className="load-data-heading">Sample file</h2>
      <FileLoader onLoaded={onLoaded} />
      <h2 className="load-data-heading">Upload a file</h2>
      <FileUpload onLoaded={onLoaded} />
    </div>
  );
}
