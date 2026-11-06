import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Loader2, Pause, Play, SkipForward, X } from 'lucide-react';
import { buildGymSteps, formatSeconds } from './gymTimer';
import { submitCheckin } from './api';
import { addDays, dayName, shortDate } from './cairoDate';

// Keep the screen on while the timer runs (Wake Lock API; ignored where unsupported).
function useWakeLock(enabled) {
  useEffect(() => {
    if (!enabled || !('wakeLock' in navigator)) return undefined;
    let lock = null;
    let cancelled = false;
    const request = async () => {
      try {
        lock = await navigator.wakeLock.request('screen');
      } catch { /* refused: battery saver or unsupported */ }
    };
    const onVisible = () => {
      if (!cancelled && document.visibilityState === 'visible') request();
    };
    request();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      lock?.release?.().catch(() => {});
    };
  }, [enabled]);
}

// Short beep with Web Audio (the context is created on the first tap).
function useBeep() {
  const ctxRef = useRef(null);
  const unlock = () => {
    try {
      if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    } catch { /* no audio */ }
  };
  const beep = () => {
    const ctx = ctxRef.current;
    if (ctx) {
      [0, 0.25, 0.5].forEach((t) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.25, ctx.currentTime + t);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.18);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime + t);
        osc.stop(ctx.currentTime + t + 0.2);
      });
    }
    try { navigator.vibrate?.([200, 100, 200]); } catch { /* no vibration */ }
  };
  return { unlock, beep };
}

export default function GymTimer({ code, date, today, drills, athlete, onExit }) {
  const steps = useMemo(() => buildGymSteps(drills, athlete), [drills, athlete]);
  const [phase, setPhase] = useState('ready'); // ready | work | rest | finish
  const [index, setIndex] = useState(0);
  const [restEndsAt, setRestEndsAt] = useState(0);
  const [pausedLeft, setPausedLeft] = useState(null); // seconds left when paused
  const [now, setNow] = useState(Date.now());
  const startedAtRef = useRef(0);
  const pausedMsRef = useRef(0);
  const pauseStartRef = useRef(0);
  const { unlock, beep } = useBeep();

  useWakeLock(phase === 'work' || phase === 'rest');

  useEffect(() => {
    if (phase !== 'rest' || pausedLeft !== null) return undefined;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [phase, pausedLeft]);

  const restLeft = pausedLeft !== null ? pausedLeft : Math.max(0, Math.ceil((restEndsAt - now) / 1000));

  const goNext = () => {
    if (index + 1 >= steps.length) {
      setPhase('finish');
    } else {
      setIndex(index + 1);
      setPhase('work');
    }
  };

  useEffect(() => {
    if (phase === 'rest' && pausedLeft === null && restLeft === 0) {
      beep();
      goNext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, restLeft, pausedLeft]);

  const start = () => {
    unlock();
    startedAtRef.current = Date.now();
    setPhase('work');
  };

  const doneSet = () => {
    unlock();
    const rest = steps[index].restAfterSec;
    if (rest > 0 && index + 1 < steps.length) {
      setRestEndsAt(Date.now() + rest * 1000);
      setNow(Date.now());
      setPausedLeft(null);
      setPhase('rest');
    } else {
      goNext();
    }
  };

  const togglePause = () => {
    if (pausedLeft === null) {
      setPausedLeft(restLeft);
      pauseStartRef.current = Date.now();
    } else {
      setRestEndsAt(Date.now() + pausedLeft * 1000);
      pausedMsRef.current += Date.now() - pauseStartRef.current;
      setPausedLeft(null);
      setNow(Date.now());
    }
  };

  const skipRest = () => {
    if (pausedLeft !== null) pausedMsRef.current += Date.now() - pauseStartRef.current;
    setPausedLeft(null);
    goNext();
  };

  const minutesSoFar = () =>
    startedAtRef.current ? Math.max(1, Math.round((Date.now() - startedAtRef.current - pausedMsRef.current) / 60000)) : 0;

  if (!steps.length) {
    return (
      <Screen onClose={() => onExit(false)} title="Gym session">
        <p className="text-sm text-slate-600 dark:text-slate-300">This day has no gym exercises.</p>
      </Screen>
    );
  }

  if (phase === 'finish') {
    return <FinishForm code={code} date={date} today={today} minutes={minutesSoFar()} onExit={onExit} />;
  }

  const step = steps[index];
  const next = steps[index + 1];

  if (phase === 'ready') {
    const exercises = [...new Set(steps.map((s) => s.title))];
    return (
      <Screen onClose={() => onExit(false)} title={`${dayName(date)} · ${shortDate(date)}`}>
        <p className="text-sm text-slate-600 dark:text-slate-300">{exercises.length} exercises, {steps.length} sets.</p>
        <ol className="space-y-1.5 text-[14px]">
          {exercises.map((t, i) => <li key={t} className="tabular-nums" dir="auto">{i + 1}. {t}</li>)}
        </ol>
        <button type="button" onClick={start} className="w-full py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-base font-semibold flex items-center justify-center gap-2">
          <Play className="w-5 h-5" /> Start session
        </button>
        <p className="text-xs text-slate-500 dark:text-slate-400">The screen stays on while the timer runs. A beep and vibration tell you when rest is over.</p>
      </Screen>
    );
  }

  return (
    <Screen onClose={() => { if (window.confirm('End the session now? Your sets so far are not saved until you finish.')) setPhase('finish'); }} title={`Set ${index + 1} of ${steps.length}`}>
      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div className="h-full bg-orange-500 transition-all" style={{ width: `${(index / steps.length) * 100}%` }} />
      </div>

      {phase === 'work' ? (
        <div className="space-y-4">
          <div>
            {step.superset && <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Superset {step.supersetLabel}</p>}
            <h2 dir="auto" className="text-2xl font-semibold leading-tight">{step.title}</h2>
            <p className="mt-1 text-base text-slate-600 dark:text-slate-300 tabular-nums">Set {step.setNumber} of {step.totalSets}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Reps" value={step.reps || '–'} />
            <Stat label="Load" value={step.load || '–'} />
          </div>
          {step.notes && <p dir="auto" className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 border-l-2 border-orange-400 pl-3">{step.notes}</p>}
          <button type="button" onClick={doneSet} className="w-full py-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-semibold flex items-center justify-center gap-2">
            <Check className="w-6 h-6" /> Done set
          </button>
          <button type="button" onClick={goNext} className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium flex items-center justify-center gap-1.5">
            <SkipForward className="w-4 h-4" /> Skip this set
          </button>
        </div>
      ) : (
        <div className="space-y-5 text-center">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{pausedLeft !== null ? 'Paused' : 'Rest'}</p>
          <p className="text-7xl font-semibold tabular-nums" aria-live="polite">{formatSeconds(restLeft)}</p>
          {next && (
            <p className="text-sm text-slate-600 dark:text-slate-300" dir="auto">
              Next: <span className="font-semibold">{next.title}</span> · set {next.setNumber} of {next.totalSets}
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={togglePause} className="py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-semibold flex items-center justify-center gap-1.5">
              {pausedLeft !== null ? <><Play className="w-4 h-4" /> Resume</> : <><Pause className="w-4 h-4" /> Pause</>}
            </button>
            <button type="button" onClick={skipRest} className="py-3.5 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold flex items-center justify-center gap-1.5">
              <SkipForward className="w-4 h-4" /> Skip rest
            </button>
          </div>
        </div>
      )}
    </Screen>
  );
}

function FinishForm({ code, date, today, minutes, onExit }) {
  const [rpe, setRpe] = useState(null);
  const [note, setNote] = useState('');
  const [mins, setMins] = useState(minutes);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  // Check-ins are allowed for today or yesterday only.
  const saveDate = date === today || date === addDays(today, -1) ? date : today;

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      await submitCheckin(code, saveDate, {
        session_rpe: rpe,
        session_minutes: Number(mins) || undefined,
        athlete_note: note.trim() || undefined,
      });
      onExit(true);
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  return (
    <Screen onClose={() => onExit(false)} title="Session done">
      <div className="space-y-2">
        <p className="text-sm font-medium">How hard was the session? (RPE)</p>
        <div className="grid grid-cols-6 gap-1.5" role="radiogroup" aria-label="Session RPE">
          {Array.from({ length: 11 }, (_, v) => (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={rpe === v}
              onClick={() => setRpe(v)}
              className={`py-2.5 rounded-lg border text-sm font-semibold tabular-nums ${rpe === v ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-200 dark:border-slate-700'}`}
            >
              {v}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">0 rest · 5 hard · 10 maximal</p>
      </div>
      <div className="space-y-1.5">
        <label htmlFor="session-mins" className="block text-sm font-medium">Session length (from the timer)</label>
        <div className="flex items-center gap-2">
          <input id="session-mins" type="number" inputMode="numeric" min="1" value={mins} onChange={(e) => setMins(e.target.value)} className="w-28 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm tabular-nums" />
          <span className="text-sm text-slate-500 dark:text-slate-400">min</span>
        </div>
      </div>
      <div className="space-y-1.5">
        <label htmlFor="session-note" className="block text-sm font-medium">How did it feel?</label>
        <textarea id="session-note" dir="auto" rows={3} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm resize-none" />
      </div>
      {saveDate !== date && <p className="text-xs text-slate-500 dark:text-slate-400">Saved under today ({shortDate(today)}); older days can't be changed.</p>}
      {error && <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
      <button type="button" onClick={save} disabled={saving || rpe === null} className="w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2">
        {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save session
      </button>
    </Screen>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-base font-semibold tabular-nums leading-snug">{value}</p>
    </div>
  );
}

function Screen({ title, onClose, children }) {
  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans">
      <div className="max-w-md mx-auto px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-8 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-semibold tabular-nums">{title}</h1>
          <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800" aria-label="Close timer">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
