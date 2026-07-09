import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Legend,
  Tooltip,
} from 'chart.js';
import App from './App';
import './styles.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Legend, Tooltip);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
