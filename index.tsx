
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("[SISTEMA]: Iniciando Despertar...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Falha ao localizar terminal de comando (root element)");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
