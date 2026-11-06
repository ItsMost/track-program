import { useEffect, useState } from 'react';
import { Activity, Loader2, LogIn } from 'lucide-react';
import { supabase, isRealSupabase } from '../../supabaseClient';

// Coach-only gate. With a real Supabase project the planner renders only for a
// signed-in coach (email + password, Supabase Auth). With the local mock (no
// .env) there is no auth and the planner renders directly.
export default function CoachGate({ children }) {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(isRealSupabase);
  const [isCoach, setIsCoach] = useState(null);

  useEffect(() => {
    if (!isRealSupabase) return undefined;
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setIsCoach(null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Ask the database whether this account is the registered coach.
  useEffect(() => {
    if (!isRealSupabase || !session) return;
    let active = true;
    supabase.rpc('track_is_coach').then(({ data, error }) => {
      if (!active) return;
      // Before the RLS migration runs the function does not exist yet; the
      // tables are still open then, so a signed-in user can use the planner.
      if (error && (error.code === 'PGRST202' || /track_is_coach/.test(error.message || ''))) {
        setIsCoach(true);
      } else {
        setIsCoach(!error && data === true);
      }
    });
    return () => {
      active = false;
    };
  }, [session]);

  if (!isRealSupabase) return children;

  if (checking || (session && isCoach === null)) {
    return (
      <Screen>
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" aria-label="Checking sign-in" />
      </Screen>
    );
  }

  if (!session) return <CoachLogin />;

  if (!isCoach) {
    return (
      <Screen>
        <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 text-center">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">This account is not the coach</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {session.user?.email} is signed in, but only the coach account can open the planner.
          </p>
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold"
          >
            Sign out
          </button>
        </div>
      </Screen>
    );
  }

  return children;
}

function Screen({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-950 font-sans">
      {children}
    </div>
  );
}

function CoachLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    let err = null;
    try {
      ({ error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password }));
    } catch (e) {
      err = e;
    }
    setBusy(false);
    if (err) {
      const msg = String(err.message || '');
      if (msg === 'Invalid login credentials') setError('Wrong email or password.');
      else if (/fetch|network|load failed/i.test(msg) || err.name === 'AuthRetryableFetchError') {
        setError("Can't reach the server. Check your internet connection and try again.");
      } else setError(msg);
    }
  };

  return (
    <Screen>
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50 leading-tight">Track Lab</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Coach sign-in</p>
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="coach-email" className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Email</label>
          <input
            id="coach-email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 text-sm outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="coach-password" className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Password</label>
          <input
            id="coach-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 text-sm outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold flex items-center justify-center gap-2"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
          Sign in
        </button>
      </form>
    </Screen>
  );
}
