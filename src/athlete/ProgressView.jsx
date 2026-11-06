import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getMyHistory } from './api';
import { addDays } from './cairoDate';
import TestHistory from '../components/Readiness/TestHistory.jsx';

// The athlete's own results over the last 6 months (code-checked RPC only).
export default function ProgressView({ code, today }) {
  const [state, setState] = useState({ loading: true, error: '', checkins: [], profile: {} });

  useEffect(() => {
    let active = true;
    getMyHistory(code, addDays(today, -182))
      .then((d) => active && setState({ loading: false, error: '', checkins: d.checkins || [], profile: d.profile || {} }))
      .catch((e) => active && setState({ loading: false, error: e.message, checkins: [], profile: {} }));
    return () => { active = false; };
  }, [code, today]);

  if (state.loading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-orange-500 animate-spin" aria-label="Loading" /></div>;
  if (state.error) return <p role="alert" className="text-sm text-rose-600 dark:text-rose-400 py-4">{state.error}</p>;
  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold">My progress</h2>
      <TestHistory checkins={state.checkins} profile={state.profile} />
    </div>
  );
}
