import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure window.fetch has both getter and setter for third-party browser extensions
try {
  const origFetch = window.fetch;
  let activeFetch = origFetch ? origFetch.bind(window) : undefined;
  Object.defineProperty(window, 'fetch', {
    get: () => activeFetch,
    set: (v) => {
      activeFetch = v;
    },
    configurable: true,
    enumerable: true,
  });
} catch (_) {}

createRoot(document.getElementById('root')!).render(<App />);
