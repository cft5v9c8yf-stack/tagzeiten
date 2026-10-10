import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/literata/latin-400.css';
import '@fontsource/literata/latin-400-italic.css';
import '@fontsource/literata/latin-600.css';
import '@fontsource/source-sans-3/latin-400.css';
import '@fontsource/source-sans-3/latin-600.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/today.css';
import './styles/pages.css';
import './styles/fold.css';
import { App } from './app/App';

const root = document.getElementById('root');
if (!root) throw new Error('#root missing');

// German, also where the page is served in a frame without it: hyphenation of long words depends on it.
document.documentElement.lang = 'de';

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
