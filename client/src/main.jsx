// client/src/main.js
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx'; // BURASI KESİNLİKLE 'import App from' OLMALI!
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://8a44713e47506af61bb120f7ff1c8bc9@o4509404987588608.ingest.de.sentry.io/4509404994469968",
  integrations: [
    Sentry.reactRouterV6BrowserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<p>Uygulamada bir hata oluştu ve Sentry'ye raporlandı.</p>}>
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
);