import { Moon, Sun } from 'lucide-react';
import { useTheme } from './theme';

export default function ThemeToggle() {
  const { dark, toggle } = useTheme();
  const label = dark ? 'Switch to light mode' : 'Switch to dark mode';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
    >
      {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
