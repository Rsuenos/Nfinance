// client/src/main.js

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // Global CSS dosyanız
import App from './App.jsx'; // Ana React bileşeniniz

// Uygulamanızı başlatma
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);