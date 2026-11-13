import { useEffect, useMemo, useRef, useState } from 'react';
import { BellOff, Check, ChevronDown, Flag, Loader2, Pause, Play, RotateCcw, SkipForward, X } from 'lucide-react';
import { buildGymSteps, estimateRemainingSec, formatSeconds, isUsableProgress, stepsSignature, summarizeExercises } from './gymTimer';
import { clearProgress, readProgress, writeProgress } from './sessionProgress';
import { submitCheckin } from './api';
import ThemeToggle from './ThemeToggle.jsx';
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

// Rest-over alarm with Web Audio (the context is created on the first tap).
// It repeats until the athlete taps the screen, or for ALARM_MAX_MS at most.
const ALARM_MAX_MS = 60 * 1000;
const ALARM_EVERY_MS = 1400;

function useAlarm() {
  const ctxRef = useRef(null);
  const timerRef = useRef(null);
  const stopAtRef = useRef(0);
  const [ringing, setRinging] = useState(false);

  const unlock = () => {
    try {
      if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    } catch { /* no audio */ }
  };

  // Three loud, sharp beeps (square wave reads louder than a sine at the same level).
  const burst = () => {
    const ctx = ctxRef.current;
    if (ctx) {
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      [0, 0.3, 0.6].forEach((t) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = 1000;
        gain.gain.setValueAtTime(0.0001, ctx.currentTime + t);
        gain.gain.exponentialRampToValueAtTime(0.8, ctx.currentTime + t + 0.01);
        gain.gain.setValueAtTime(0.8, ctx.currentTime + t + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.24);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime + t);
        osc.stop(ctx.currentTime + t + 0.26);
      });
    }
    try { navigator.vibrate?.([300, 120, 300, 120, 300]); } catch { /* no vibration */ }
  };

  const stop = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    try { navigator.vibrate?.(0); } catch { /* no vibration */ }
    setRinging(false);
  };

  const start = () => {
    clearInterval(timerRef.current);
    stopAtRef.current = Date.now() + ALARM_MAX_MS;
    burst();
    timerRef.current = setInterval(() => {
      if (Date.now() >= stopAtRef.current) stop();
      else burst();
    }, ALARM_EVERY_MS);
    setRinging(true);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  // Any tap on the screen silences it.
  useEffect(() => {
    if (!ringing) return undefined;
    const onTap = () => stop();
    document.addEventListener('pointerdown', onTap);
    return () => document.removeEventListener('pointerdown', onTap);
  }, [ringing]);

  return { unlock, start, stop, ringing };
}

export default function GymTimer({ code, date, today, drills, athlete, onExit }) {
  const steps = useMemo(() => buildGymSteps(drills, athlete), [drills, athlete]);
  const signature = useMemo(() => stepsSignature(steps), [steps]);
  const [resumable, setResumable] = useState(() => {
    const saved = readProgress();
    return isUsableProgress(saved, { code, date, signature }) && saved.phase !== 'ready' ? saved : null;
  });
  const [phase, setPhase] = useState('ready'); // ready | work | rest | finish
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState([]); // step indices marked "Done set"
  const [restEndsAt, setRestEndsAt] = useState(0);
  const [pausedLeft, setPausedLeft] = useState(null); // seconds left when paused
  const [startedAt, setStartedAt] = useState(0);
  const [pausedMs, setPausedMs] = useState(0);
  const [pauseStart, setPauseStart] = useState(0);
  const [finishMinutes, setFinishMinutes] = useState(0);
  const [openKey, setOpenKey] = useState(null);
  const [now, setNow] = useState(Date.now());
  const alarm = useAlarm();
  const unlock = alarm.unlock;

  useWakeLock(phase === 'work' || phase === 'rest');

  const running = phase === 'work' || phase === 'rest';
  useEffect(() => {
    if (!running) return undefined;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [running]);

  // Save after every change, so closing the timer or the tab keeps the place.
  useEffect(() => {
    if (phase === 'ready') return;
    writeProgress({ code, date, signature, phase, index, done, restEndsAt, pausedLeft, startedAt, pausedMs, pauseStart, finishMinutes });
  }, [code, date, signature, phase, index, done, restEndsAt, pausedLeft, startedAt, pausedMs, pauseStart, finishMinutes]);

  const restLeft = pausedLeft !== null ? pausedLeft : Math.max(0, Math.ceil((restEndsAt - now) / 1000));
  // Before "Continue", the list already shows where the saved session stopped.
  const doneSetIdx = useMemo(() => new Set(resumable ? resumable.done || [] : done), [resumable, done]);
  const listIndex = resumable ? resumable.index : phase === 'ready' ? -1 : index;
  const exercises = useMemo(() => summarizeExercises(steps, listIndex, doneSetIdx), [steps, listIndex, doneSetIdx]);

  const elapsedMs = () => {
    if (!startedAt) return 0;
    const pausing = pausedLeft !== null && pauseStart ? now - pauseStart : 0;
    return Math.max(0, now - startedAt - pausedMs - pausing);
  };

  const finish = () => {
    setFinishMinutes(Math.max(1, Math.round(elapsedMs() / 60000)));
    setPhase('finish');
  };

  const goNext = () => {
    if (index + 1 >= steps.length) {
      finish();
    } else {
      setIndex(index + 1);
      setPhase('work');
    }
  };

  useEffect(() => {
    if (phase === 'rest' && pausedLeft === null && restLeft === 0) {
      // No alarm when the rest ran out long ago (athlete coming back to the timer).
      if (Date.now() - restEndsAt < 5000) alarm.start();
      goNext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, restLeft, pausedLeft]);

  const start = () => {
    unlock();
    clearProgress();
    setResumable(null);
    setIndex(0);
    setDone([]);
    setPausedLeft(null);
    setPausedMs(0);
    setPauseStart(0);
    setStartedAt(Date.now());
    setNow(Date.now());
    setPhase('work');
  };

  const resume = () => {
    unlock();
    const s = resumable;
    setResumable(null);
    setIndex(Math.min(s.index, steps.length - 1));
    setDone(Array.isArray(s.done) ? s.done : []);
    setRestEndsAt(s.restEndsAt || 0);
    setPausedLeft(s.pausedLeft ?? null);
    setStartedAt(s.startedAt || Date.now());
    setPausedMs(s.pausedMs || 0);
    setPauseStart(s.pauseStart || 0);
    setFinishMinutes(s.finishMinutes || 0);
    setNow(Date.now());
    setPhase(s.phase);
  };

  const doneSet = () => {
    unlock();
    setDone((d) => (d.includes(index) ? d : [...d, index]));
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
      setPauseStart(Date.now());
    } else {
      setRestEndsAt(Date.now() + pausedLeft * 1000);
      setPausedMs((ms) => ms + (Date.now() - pauseStart));
      setPauseStart(0);
      setPausedLeft(null);
      setNow(Date.now());
    }
  };

  const skipRest = () => {
    if (pausedLeft !== null) {
      setPausedMs((ms) => ms + (Date.now() - pauseStart));
      setPauseStart(0);
    }
    setPausedLeft(null);
    goNext();
  };

  if (!steps.length) {
    return (
      <Screen onClose={() => onExit(false)} title="Gym session">
        <p className="text-sm text-slate-600 dark:text-slate-300">This day has no gym exercises.</p>
      </Screen>
    );
  }

  if (phase === 'finish') {
    return (
      <FinishForm
        code={code}
        date={date}
        today={today}
        minutes={finishMinutes}
        onExit={(saved) => {
          if (saved) clearProgress();
          onExit(saved);
        }}
      />
    );
  }

  const list = (
    <ExerciseList exercises={exercises} openKey={openKey} onToggle={(k) => setOpenKey(openKey === k ? null : k)} />
  );

  if (phase === 'ready') {
    return (
      <Screen onClose={() => onExit(false)} title={`${dayName(date)} · ${shortDate(date)}`}>
        {resumable && (
          <div className="rounded-2xl border border-orange-300 dark:border-orange-500/60 bg-orange-50 dark:bg-orange-500/10 p-4 space-y-3">
            <div>
              <p className="text-sm font-semibold">You have a session in progress</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 tabular-nums">
                {resumable.phase === 'finish'
                  ? 'All sets done, not saved yet'
                  : resumable.phase === 'rest'
                    ? `Resting after set ${Math.min(resumable.index, steps.length - 1) + 1} of ${steps.length}`
                    : `Stopped at set ${Math.min(resumable.index, steps.length - 1) + 1} of ${steps.length}`}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={resume} className="py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold flex items-center justify-center gap-1.5">
                <Play className="w-4 h-4" /> Continue
              </button>
              <button
                type="button"
                onClick={() => { if (window.confirm('Start over from the first set?')) start(); }}
                className="py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-semibold flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" /> Start over
              </button>
            </div>
          </div>
        )}
        <p className="text-sm text-slate-600 dark:text-slate-300 tabular-nums">
          {exercises.length} exercises · {steps.length} sets · about {Math.round(estimateRemainingSec(steps, 0) / 60)} min
        </p>
        {list}
        {!resumable && (
          <button type="button" onClick={start} className="w-full py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-base font-semibold flex items-center justify-center gap-2">
            <Play className="w-5 h-5" /> Start session
          </button>
        )}
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The screen stays on while the timer runs. When rest is over an alarm rings until you tap the screen. You can close the timer and come back: your place is kept on this phone.
        </p>
      </Screen>
    );
  }

  const step = steps[index];
  const next = steps[index + 1];
  const setsLeft = steps.length - index - (phase === 'rest' ? 1 : 0);
  const remainingMin = Math.max(1, Math.round(estimateRemainingSec(steps, index, phase, restLeft) / 60));

  return (
    <Screen onClose={() => onExit(false)} closeLabel="Leave timer (progress is kept)" title={`Set ${index + 1} of ${steps.length}`}>
      <div className="space-y-2">
        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div className="h-full bg-orange-500 transition-all" style={{ width: `${((steps.length - setsLeft) / steps.length) * 100}%` }} />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <MiniStat label="Elapsed" value={formatSeconds(elapsedMs() / 1000)} />
          <MiniStat label="Left (est.)" value={`~${remainingMin} min`} />
          <MiniStat label="Sets left" value={`${setsLeft} of ${steps.length}`} />
        </div>
      </div>

      {phase === 'work' ? (
        <div className="space-y-4">
          {alarm.ringing && (
            <button
              type="button"
              onClick={alarm.stop}
              className="w-full py-3 rounded-2xl bg-rose-600 text-white text-sm font-semibold flex items-center justify-center gap-2 animate-pulse"
            >
              <BellOff className="w-5 h-5" /> Rest over: tap to stop the alarm
            </button>
          )}
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

      <div className="space-y-2 pt-1">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Today&apos;s exercises</h3>
        {list}
      </div>

      <button
        type="button"
        onClick={() => { if (window.confirm('Finish the session now and log it?')) finish(); }}
        className="w-full py-2.5 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/40 flex items-center justify-center gap-1.5"
      >
        <Flag className="w-4 h-4" /> Finish session
      </button>
    </Screen>
  );
}

function ExerciseList({ exercises, openKey, onToggle }) {
  return (
    <ol className="space-y-1.5">
      {exercises.map((ex, i) => {
        const open = openKey === ex.key;
        const tone =
          ex.status === 'current'
            ? 'border-orange-400 dark:border-orange-500 bg-orange-50 dark:bg-orange-500/10'
            : ex.status === 'done'
              ? 'border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/50 opacity-60'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900';
        const badge =
          ex.status === 'done'
            ? 'bg-emerald-600 text-white'
            : ex.status === 'current'
              ? 'bg-orange-500 text-white'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300';
        return (
          <li key={ex.key} className={`rounded-xl border ${tone}`}>
            <button type="button" onClick={() => onToggle(ex.key)} aria-expanded={open} className="w-full px-3 py-2.5 flex items-center gap-3 text-left">
              <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold tabular-nums ${badge}`}>
                {ex.status === 'done' ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span dir="auto" className="block text-[14px] font-semibold leading-snug">
                  {ex.superset && <span className="mr-1 text-indigo-600 dark:text-indigo-400">{ex.supersetLabel}.</span>}
                  {ex.title}
                </span>
                <span className="block text-xs text-slate-500 dark:text-slate-400 tabular-nums truncate">
                  {[ex.reps, ex.load].filter(Boolean).join(' · ') || '–'}
                </span>
              </span>
              <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-600 dark:text-slate-300">{ex.setsDone}/{ex.totalSets}</span>
              <ChevronDown className={`shrink-0 w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
              <div className="px-3 pb-3 pl-12 space-y-1 text-[13px] text-slate-600 dark:text-slate-300">
                <p className="tabular-nums">
                  {ex.totalSets} sets{ex.reps ? ` × ${ex.reps}` : ''}{ex.restSec ? ` · rest ${formatSeconds(ex.restSec)}` : ''}
                </p>
                {ex.load && <p className="tabular-nums">Load: {ex.load}</p>}
                {ex.superset && <p className="text-indigo-600 dark:text-indigo-400">Superset: no rest between the linked exercises</p>}
                {ex.notes && <p dir="auto" className="leading-relaxed">{ex.notes}</p>}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1.5">
      <p className="text-[11px] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-sm font-semibold tabular-nums">{value}</p>
    </div>
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

function Screen({ title, onClose, closeLabel = 'Close timer', children }) {
  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans">
      <div className="max-w-md mx-auto px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-8 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-semibold tabular-nums">{title}</h1>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800" aria-label={closeLabel} title={closeLabel}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
