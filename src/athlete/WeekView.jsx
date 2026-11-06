import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Play } from 'lucide-react';
import { getMyWeek } from './api';
import { addDays, dayName, shortDate, weekDays } from './cairoDate';
import { dayHasGym, parseRest } from './gymTimer';

const prescription = (d) => {
  const sets = String(d.sets ?? '').trim();
  const reps = String(d.reps ?? '').trim();
  const dist = String(d.distance ?? '').trim();
  const unit = String(d.unit || '').toLowerCase();
  const parts = [];
  if (sets) parts.push(sets);
  if (reps) parts.push(unit === 'sec' ? `${reps} s` : reps);
  let text = parts.join(' × ');
  if (dist) text += `${text ? ' × ' : ''}${dist} m`;
  else if (unit === 'meters' && reps && !dist) text += ' m';
  return text;
};

const intensity = (d) => {
  const unit = d.intensityUnit || d.unit;
  if (unit === 'BW') return 'Bodyweight';
  const pct = parseFloat(d.percentage);
  if (!(pct > 0)) return '';
  if (unit === 'x BW') return `${pct}x BW`;
  const base = String(d.type || '').split('_')[0];
  return ['speed', 'tempo', 'endurance', 'anaerobic'].includes(base) ? `${pct}% speed` : `${pct}%`;
};

const restLabel = (d) => {
  if (!d.rest) return '';
  const { repRestSec, setRestSec } = parseRest(d.rest);
  return repRestSec || setRestSec ? `Rest ${d.rest}` : '';
};

export default function WeekView({ code, today, currentWeekStart, onStartSession }) {
  const [weekStart, setWeekStart] = useState(currentWeekStart);
  const [state, setState] = useState({ loading: true, error: '', workouts: [] });

  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: '' }));
    getMyWeek(code, weekStart)
      .then((data) => active && setState({ loading: false, error: '', workouts: data.workouts || [] }))
      .catch((e) => active && setState({ loading: false, error: e.message, workouts: [] }));
    return () => { active = false; };
  }, [code, weekStart]);

  const isCurrent = weekStart >= currentWeekStart;
  const byDate = Object.fromEntries(state.workouts.map((w) => [w.workout_date, w]));
  const days = weekDays(weekStart);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setWeekStart(addDays(weekStart, -7))}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
          aria-label="Previous week"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold tabular-nums">{shortDate(days[0])} – {shortDate(days[6])}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{isCurrent ? 'This week' : 'Past week'}</p>
        </div>
        <button
          type="button"
          onClick={() => setWeekStart(addDays(weekStart, 7))}
          disabled={isCurrent}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-30"
          aria-label="Next week"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {state.loading && (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-orange-500 animate-spin" aria-label="Loading" /></div>
      )}
      {state.error && <p role="alert" className="text-sm text-rose-600 dark:text-rose-400 py-4">{state.error}</p>}

      {!state.loading && !state.error && days.map((iso) => {
        const w = byDate[iso];
        const drills = w?.drills || [];
        const isToday = iso === today;
        return (
          <section
            key={iso}
            className={`rounded-2xl border bg-white dark:bg-slate-900 ${isToday ? 'border-orange-400 dark:border-orange-500' : 'border-slate-200 dark:border-slate-800'}`}
          >
            <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-2">
              <div className="min-w-0">
                <h2 className="text-[15px] font-semibold leading-tight">
                  {dayName(iso)} {isToday && <span className="ml-1 text-xs font-semibold text-orange-600 dark:text-orange-400">Today</span>}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">{shortDate(iso)}{w?.workout_title ? ` · ${w.workout_title}` : ''}</p>
              </div>
              {dayHasGym(drills) && (
                <button
                  type="button"
                  onClick={() => onStartSession(iso, drills)}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold"
                >
                  <Play className="w-3.5 h-3.5" /> Start session
                </button>
              )}
            </div>
            {drills.length === 0 ? (
              <p className="px-4 pb-3 text-sm text-slate-500 dark:text-slate-400">Rest day</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {drills.map((d, i) => (
                  <li key={d.id || i} className="px-4 py-2.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <p dir="auto" className="text-[14px] font-semibold leading-snug">{d.title}</p>
                      {intensity(d) && <span className="shrink-0 text-xs font-semibold text-rose-600 dark:text-rose-400 tabular-nums">{intensity(d)}</span>}
                    </div>
                    <p className="text-[13px] text-slate-700 dark:text-slate-200 tabular-nums">
                      {prescription(d)}
                      {restLabel(d) && <span className="text-slate-500 dark:text-slate-400"> · {restLabel(d)}</span>}
                      {d.superSetNext && <span className="ml-1.5 px-1.5 rounded-md bg-indigo-500 text-white text-[11px] font-semibold">Superset</span>}
                    </p>
                    {d.details && <p dir="auto" className="mt-1 text-[12.5px] leading-relaxed text-slate-500 dark:text-slate-400">{d.details}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
