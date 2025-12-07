import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary, initializeErrorHandling } from './utils/error-handling';

// Suppress Recharts defaultProps warnings (library issue with React 19, harmless)
const originalError = console.error;
console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Support for defaultProps will be removed')
  ) {
    return;
  }
  originalError.call(console, ...args);
};

// Initialize global error handling
initializeErrorHandling();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);