import { useCallback, useEffect, useState } from 'react';
import { Activity, CalendarDays, ClipboardCheck, LineChart, Loader2, LogOut } from 'lucide-react';
import { getMyProfile, PortalError } from './api';
import WeekView from './WeekView.jsx';
import CheckInForm from './CheckInForm.jsx';
import GymTimer from './GymTimer.jsx';
import ProgressView from './ProgressView.jsx';
import ThemeToggle from './ThemeToggle.jsx';

const CODE_KEY = 'tracklab_athlete_code';
const readSavedCode = () => {
  try { return localStorage.getItem(CODE_KEY) || ''; } catch { return ''; }
};
const saveCode = (code) => {
  try { code ? localStorage.setItem(CODE_KEY, code) : localStorage.removeItem(CODE_KEY); } catch { /* storage blocked */ }
};

export default function AthleteApp() {
  const [code, setCode] = useState(readSavedCode);
  const [profile, setProfile] = useState(null);
  const [checking, setChecking] = useState(!!readSavedCode());
  const [loginError, setLoginError] = useState('');
  const [tab, setTab] = useState('week');
  const [session, setSession] = useState(null); // { date, drills } for the gym timer
  const [toast, setToast] = useState('');

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }, []);

  const signIn = useCallback(async (candidate) => {
    setChecking(true);
    setLoginError('');
    try {
      const data = await getMyProfile(candidate);
      setProfile(data);
      setCode(candidate);
      saveCode(candidate);
    } catch (e) {
      setProfile(null);
      if (e instanceof PortalError && e.code === 'invalid_code') saveCode('');
      setLoginError(e.message);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    const saved = readSavedCode();
    if (saved) signIn(saved);
  }, [signIn]);

  const signOut = () => {
    saveCode('');
    setCode('');
    setProfile(null);
    setSession(null);
  };

  if (!profile) {
    return <CodeLogin busy={checking} error={loginError} onSubmit={signIn} initial={code} />;
  }

  if (session) {
    return (
      <GymTimer
        code={code}
        date={session.date}
        today={profile.today}
        drills={session.drills}
        athlete={profile.athlete}
        onExit={(saved) => {
          setSession(null);
          if (saved) showToast('Session saved');
        }}
      />
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans">
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shrink-0">
              <Activity className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold leading-tight truncate">{profile.athlete.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Track Lab</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <ThemeToggle />
            <button
              type="button"
              onClick={signOut}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 py-1.5 rounded-lg"
            >
              <LogOut className="w-4 h-4" /> Change code
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 pb-28">
        {tab === 'week' ? (
          <WeekView
            code={code}
            today={profile.today}
            currentWeekStart={profile.current_week_start}
            onStartSession={(date, drills) => setSession({ date, drills })}
          />
        ) : tab === 'checkin' ? (
          <CheckInForm code={code} today={profile.today} onSaved={() => showToast('Check-in saved')} />
        ) : (
          <ProgressView code={code} today={profile.today} />
        )}
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-md mx-auto grid grid-cols-3">
          <TabButton active={tab === 'week'} onClick={() => setTab('week')} icon={CalendarDays} label="Program" />
          <TabButton active={tab === 'checkin'} onClick={() => setTab('checkin')} icon={ClipboardCheck} label="Check-in" />
          <TabButton active={tab === 'progress'} onClick={() => setTab('progress')} icon={LineChart} label="Progress" />
        </div>
      </nav>

      {toast && (
        <div role="status" className="fixed bottom-20 inset-x-0 flex justify-center z-30 pointer-events-none">
          <span className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-sm font-medium shadow-lg">{toast}</span>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex flex-col items-center gap-0.5 py-2.5 text-xs font-semibold ${active ? 'text-orange-600 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400'}`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );
}

function CodeLogin({ busy, error, onSubmit, initial }) {
  const [value, setValue] = useState(initial || '');
  const clean = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8);
  return (
    <div className="relative min-h-[100dvh] flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-950 font-sans">
      <div className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3">
        <ThemeToggle />
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); if (clean.length === 8) onSubmit(clean); }}
        className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight text-slate-900 dark:text-slate-50">Track Lab</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Athlete sign-in</p>
          </div>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="athlete-code" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Your access code</label>
          <input
            id="athlete-code"
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck="false"
            value={clean}
            onChange={(e) => setValue(e.target.value)}
            placeholder="8 characters"
            className="w-full px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 text-xl tracking-[0.3em] font-semibold text-center outline-none focus:ring-2 focus:ring-orange-500"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">Your coach gives you this code. This phone remembers it.</p>
        </div>
        {error && <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
        <button
          type="submit"
          disabled={busy || clean.length !== 8}
          className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2"
        >
          {busy && <Loader2 className="w-4 h-4 animate-spin" />}
          Open my program
        </button>
      </form>
    </div>
  );
}
