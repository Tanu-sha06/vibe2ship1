import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent and suppress benign, expected Vite HMR websocket proxy connection failures
// in container environments where standard HMR WebSocket channels are disabled.
if (typeof window !== 'undefined') {
  const isViteWebsocketError = (msg: string): boolean => {
    return (
      msg.includes('WebSocket') ||
      msg.includes('websocket') ||
      msg.includes('WebSocket closed') ||
      msg.includes('closed without opened') ||
      msg.includes('failed to connect to websocket')
    );
  };

  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const reasonStr = event.reason?.message || String(event.reason || '');
    if (isViteWebsocketError(reasonStr)) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener('error', (event: ErrorEvent) => {
    const errorStr = event.message || '';
    if (isViteWebsocketError(errorStr)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
