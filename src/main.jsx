import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { PWAProvider } from './components/PWAContext';


const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <PWAProvider>
        <App />
      </PWAProvider>
    </React.StrictMode>
  );
}
