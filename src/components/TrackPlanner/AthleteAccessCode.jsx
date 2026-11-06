import { useEffect, useState } from 'react';
import { Copy, KeyRound, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const portalUrl = () => `${window.location.origin}/athlete/`;
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

// Coach-only: generate / reset the athlete's portal code. The code is shown
// once; only a hash is stored in the database.
export default function AthleteAccessCode({ athleteId, athleteName }) {
  const [status, setStatus] = useState(null);
  const [newCode, setNewCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.rpc('track_athlete_code_status', { p_athlete_id: athleteId }).then(({ data, error: err }) => {
      if (!active) return;
      if (err) setError(/track_athlete_code_status/.test(err.message || '') ? 'The athlete portal is not set up in the database yet.' : err.message);
      else setStatus(data || { has_code: false });
    });
    return () => { active = false; };
  }, [athleteId]);

  const generate = async () => {
    setBusy(true);
    setError('');
    setConfirming(false);
    const { data, error: err } = await supabase.rpc('track_set_athlete_code', { p_athlete_id: athleteId });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setNewCode(data);
    setStatus({ has_code: true, created_at: new Date().toISOString(), last_used_at: null });
  };

  const copy = async () => {
    const text = `Track Lab: open ${portalUrl()} and enter your code ${newCode}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Copy failed. Select the code and copy it by hand.');
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <KeyRound className="w-4 h-4 text-orange-500" />
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Athlete portal access</h4>
      </div>

      {status && !newCode && (
        <p className="text-xs text-slate-600 dark:text-slate-300">
          {status.has_code
            ? `Code set on ${fmtDate(status.created_at)}${status.last_used_at ? `, last used ${fmtDate(status.last_used_at)}` : ', not used yet'}.`
            : `${athleteName || 'This athlete'} has no code yet.`}
        </p>
      )}

      {newCode && (
        <div className="rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 p-3 space-y-2">
          <p className="text-xs text-orange-800 dark:text-orange-200">Give this code to {athleteName || 'the athlete'} now. It is shown only once.</p>
          <p className="text-2xl font-semibold tracking-[0.25em] text-slate-900 dark:text-white select-all tabular-nums">{newCode}</p>
          <p className="text-xs text-slate-600 dark:text-slate-300 select-all">{portalUrl()}</p>
          <button type="button" onClick={copy} className="text-xs font-semibold text-orange-700 dark:text-orange-300 flex items-center gap-1">
            <Copy className="w-3.5 h-3.5" /> {copied ? 'Copied' : 'Copy message with link and code'}
          </button>
        </div>
      )}

      {error && <p role="alert" className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}

      {status && !confirming && (
        <button
          type="button"
          onClick={() => (status.has_code ? setConfirming(true) : generate())}
          disabled={busy}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-60"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : status.has_code ? <RefreshCw className="w-3.5 h-3.5" /> : <KeyRound className="w-3.5 h-3.5" />}
          {status.has_code ? 'Reset code' : 'Generate code'}
        </button>
      )}

      {confirming && (
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs text-slate-600 dark:text-slate-300">The old code stops working on every phone.</p>
          <button type="button" onClick={generate} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold">Reset code</button>
          <button type="button" onClick={() => setConfirming(false)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300">Cancel</button>
        </div>
      )}
    </section>
  );
}
