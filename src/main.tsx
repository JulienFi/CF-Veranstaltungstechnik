import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './styles/tokens.css';
import './styles/globals.css';
import './styles/legacy-utilities.css';
import './index.css';
import './styles/template.css';
import './lib/navigation';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
