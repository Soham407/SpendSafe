
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Add global window type for confetti since it's loaded via CDN
declare global {
  interface Window {
    confetti: any;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
