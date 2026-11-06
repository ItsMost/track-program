import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-400.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-600.css';
import '../index.css';
import AthleteApp from './AthleteApp.jsx';

// Follow the phone's light / dark setting.
const media = window.matchMedia?.('(prefers-color-scheme: dark)');
const applyTheme = () => document.documentElement.classList.toggle('dark', !!media?.matches);
applyTheme();
media?.addEventListener?.('change', applyTheme);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AthleteApp />
  </StrictMode>,
);
