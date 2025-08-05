import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { debug } from './lib/debug';

// Register service worker for PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        debug.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        debug.log('SW registration failed: ', registrationError);
      });
  });
}

// Render the app - Capacitor initialization is handled inside App component
createRoot(document.getElementById("root")!).render(<App />);
