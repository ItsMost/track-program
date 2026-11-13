// Gym session progress kept on this phone, so leaving the timer does not reset it.
// One session at a time: starting another day replaces it.
const KEY = 'tracklab_gym_progress';

export const readProgress = () => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const writeProgress = (data) => {
  try { localStorage.setItem(KEY, JSON.stringify({ ...data, savedAt: Date.now() })); } catch { /* storage blocked */ }
};

export const clearProgress = () => {
  try { localStorage.removeItem(KEY); } catch { /* storage blocked */ }
};
