import React from 'react';
import ReactDOM from 'react-dom/client';
import { loader } from '@monaco-editor/react';
import App from './App';
import './styles.css';

// Serve Monaco's AMD bundle locally: avoids a CDN dependency and keeps the main app bundle lean.
loader.config({ paths: { vs: `${import.meta.env.BASE_URL}monaco/vs` } });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
