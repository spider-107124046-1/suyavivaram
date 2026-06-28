import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { PWAProvider } from './components/PWAContext';

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker registered:', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}

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
