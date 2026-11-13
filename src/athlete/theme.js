// Light / dark for the athlete portal. With no saved choice it follows the phone.
import { useEffect, useState } from 'react';

const KEY = 'tracklab_athlete_theme'; // 'dark' | 'light'
const media = typeof window !== 'undefined' ? window.matchMedia?.('(prefers-color-scheme: dark)') : null;

const readChoice = () => {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'dark' || v === 'light' ? v : null;
  } catch {
    return null;
  }
};

const resolveDark = () => {
  const choice = readChoice();
  return choice ? choice === 'dark' : !!media?.matches;
};

export const applyTheme = () => {
  const dark = resolveDark();
  document.documentElement.classList.toggle('dark', dark);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#020617' : '#f97316');
  return dark;
};

export const initTheme = () => {
  applyTheme();
  media?.addEventListener?.('change', () => {
    if (!readChoice()) window.dispatchEvent(new Event('tracklab-theme'));
  });
};

export function useTheme() {
  const [dark, setDark] = useState(resolveDark);
  useEffect(() => {
    const onChange = () => setDark(applyTheme());
    window.addEventListener('tracklab-theme', onChange);
    return () => window.removeEventListener('tracklab-theme', onChange);
  }, []);
  const toggle = () => {
    try { localStorage.setItem(KEY, dark ? 'light' : 'dark'); } catch { /* storage blocked */ }
    window.dispatchEvent(new Event('tracklab-theme'));
  };
  return { dark, toggle };
}
