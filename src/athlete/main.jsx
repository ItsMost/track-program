import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-400.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-600.css';
import '../index.css';
import AthleteApp from './AthleteApp.jsx';
import { initTheme } from './theme';

// Light / dark: the athlete's saved choice, else the phone's setting.
initTheme();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AthleteApp />
  </StrictMode>,
);
