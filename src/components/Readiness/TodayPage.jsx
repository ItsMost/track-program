import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, LineChart, Loader2, MessageSquare, X } from 'lucide-react';
import { READINESS_COLORS } from '../../data/readinessRules.js';
import {
  cairoToday, isoAdd, weekStartOf, fetchReadiness, fetchOverrides, saveOverride, clearOverride,
  markCommentSeen, readinessFor, weeklySrpe,
} from './coachReadiness.js';
import TestHistory from './TestHistory.jsx';

const ORDER = { red: 0, yellow: 1, baseline: 2, green: 3, none: 4 };
const fmtDay = (iso) => new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));
const v = (x, suffix = '') => (x === null || x === undefined || x === '' ? '–' : `${x}${suffix}`);
const SPRINT = { '10m': '10 m', fly20: 'Fly 20', fly30: 'Fly 30', other: 'Sprint' };

export function ColorChip({ color, title }) {
  const c = READINESS_COLORS[color] || READINESS_COLORS.none;
  return (
    <span title={title} className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[12px] font-semibold ${c.chip}`}>
      <span className={`w-2 h-2 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

export default function TodayPage({ athletes = [], onClose }) {
  const [date, setDate] = useState(cairoToday());
  const [rows, setRows] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);
  const [editing, setEditing] = useState(null); // { athleteId, color, note }

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [r, o] = await Promise.all([
        fetchReadiness({ from: isoAdd(date, -182), to: date }),
        fetchOverrides({ from: date, to: date }),
      ]);
      setRows(r);
      setOverrides(o);
    } catch (e) {
      setError(/track_readiness/.test(e.message || '') ? 'Readiness is not set up in the database yet.' : e.message);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { load(); }, [load]);

  const list = useMemo(() => {
    const ws = weekStartOf(date);
    return athletes
      .map((a) => ({ athlete: a, ...readinessFor(rows, overrides, a.id, date), srpeWeek: weeklySrpe(rows, a.id, ws) }))
      .sort((x, y) => ORDER[x.color] - ORDER[y.color] || String(x.athlete.name).localeCompare(String(y.athlete.name)));
  }, [athletes, rows, overrides, date]);

  const counts = list.reduce((acc, r) => ({ ...acc, [r.color]: (acc[r.color] || 0) + 1 }), {});

  const onSaveOverride = async () => {
    try {
      if (editing.color === 'auto') await clearOverride(editing.athleteId, date);
      else await saveOverride(editing.athleteId, date, editing.color, editing.note);
      setEditing(null);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const onSeen = async (rowId) => {
    try {
      await markCommentSeen(rowId);
      setRows((rs) => rs.map((r) => (r.id === rowId ? { ...r, coach_seen_at: new Date().toISOString() } : r)));
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[210] bg-slate-50 dark:bg-slate-950 overflow-y-auto font-sans print:hidden">
      <div className="max-w-5xl mx-auto px-4 py-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Today</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 tabular-nums">{fmtDay(date)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setDate(isoAdd(date, -1))} className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" aria-label="Previous day"><ChevronLeft className="w-4 h-4" /></button>
            <button type="button" onClick={() => setDate(cairoToday())} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium">Today</button>
            <button type="button" onClick={() => setDate(isoAdd(date, 1))} disabled={date >= cairoToday()} className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-30" aria-label="Next day"><ChevronRight className="w-4 h-4" /></button>
            <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800" aria-label="Close Today"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          {['red', 'yellow', 'green', 'baseline', 'none'].map((c) => (
            <span key={c} className="inline-flex items-center gap-1.5 tabular-nums text-slate-600 dark:text-slate-300">
              <ColorChip color={c} /> {counts[c] || 0}
            </span>
          ))}
        </div>

        {error && <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-orange-500 animate-spin" aria-label="Loading" /></div>
        ) : (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
            {list.map((r) => {
              const e = r.entry;
              const srpeToday = e?.session_rpe != null && e?.session_minutes != null ? e.session_rpe * e.session_minutes : null;
              const open = openId === r.athlete.id;
              const isEditing = editing?.athleteId === r.athlete.id;
              return (
                <div key={r.athlete.id} className="p-4 space-y-2.5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[15px] font-semibold text-slate-900 dark:text-slate-50">{r.athlete.name}</p>
                        <ColorChip color={r.color} title={r.override ? `Set by coach. Auto colour: ${READINESS_COLORS[r.auto.color].label}` : undefined} />
                        {r.override && <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">overridden</span>}
                        {r.hasNewComment && <span className="px-1.5 rounded-md bg-orange-500 text-white text-[11px] font-semibold leading-[1.6]">New comment</span>}
                      </div>
                      {r.reasons.length > 0 && <p className="text-[13px] text-slate-600 dark:text-slate-300">{r.reasons.join(' · ')}</p>}
                    </div>
                    <div className="text-right tabular-nums text-[13px] text-slate-600 dark:text-slate-300">
                      <p>sRPE today <span className="font-semibold text-slate-900 dark:text-slate-50">{srpeToday ?? '–'}</span></p>
                      <p>This week <span className="font-semibold text-slate-900 dark:text-slate-50">{Math.round(r.srpeWeek)}</span> AU</p>
                    </div>
                  </div>

                  {e ? (
                    <p className="text-[13px] text-slate-700 dark:text-slate-200 tabular-nums">
                      Sleep {v(e.sleep)} · Soreness {v(e.soreness)} · Ankle {v(e.ankle_pain)} · Hamstring {v(e.hamstring_pain)} · CMJ {v(e.cmj_cm, ' cm')}
                      {e.sprint_test ? ` · ${SPRINT[e.sprint_test] || 'Sprint'} ${v(e.sprint_time_s, ' s')}` : ''}
                      {e.broad_jump_m ? ` · Broad ${e.broad_jump_m} m` : ''}
                      {e.session_rpe != null ? ` · RPE ${e.session_rpe}${e.session_minutes ? ` × ${e.session_minutes} min` : ''}` : ''}
                    </p>
                  ) : (
                    <p className="text-[13px] text-slate-500 dark:text-slate-400">No check-in yet.</p>
                  )}

                  {e?.athlete_note && (
                    <div className="flex items-start gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5">
                      <MessageSquare className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                      <p dir="auto" className="flex-1 text-[13px] text-slate-700 dark:text-slate-200">{e.athlete_note}</p>
                      {r.hasNewComment && (
                        <button type="button" onClick={() => onSeen(e.id)} className="shrink-0 text-xs font-semibold text-orange-600 dark:text-orange-400">Mark read</button>
                      )}
                    </div>
                  )}

                  {isEditing ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        aria-label="Override colour"
                        value={editing.color}
                        onChange={(ev) => setEditing({ ...editing, color: ev.target.value })}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                      >
                        <option value="auto">Auto (no override)</option>
                        <option value="green">Green</option>
                        <option value="yellow">Yellow</option>
                        <option value="red">Red</option>
                      </select>
                      <input
                        aria-label="Override note"
                        dir="auto"
                        value={editing.note}
                        maxLength={500}
                        onChange={(ev) => setEditing({ ...editing, note: ev.target.value })}
                        placeholder="Why? (e.g. travelled late, felt fine in warm-up)"
                        className="flex-1 min-w-[12rem] px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                      />
                      <button type="button" onClick={onSaveOverride} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-sm font-semibold">Save colour</button>
                      <button type="button" onClick={() => setEditing(null)} className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setEditing({ athleteId: r.athlete.id, color: r.override?.color || 'auto', note: r.override?.note || '' })}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
                      >
                        {r.override ? 'Change colour' : 'Override colour'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setOpenId(open ? null : r.athlete.id)}
                        aria-expanded={open}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1"
                      >
                        <LineChart className="w-3.5 h-3.5" /> {open ? 'Hide test history' : 'Test history'}
                      </button>
                    </div>
                  )}

                  {open && (
                    <TestHistory
                      checkins={rows.filter((x) => x.athlete_id === r.athlete.id).sort((a, b) => (a.date < b.date ? -1 : 1))}
                      profile={{
                        cmj: r.athlete.cmj || r.athlete.verticalJump || r.athlete.vertical_jump,
                        accel_10m: r.athlete.accel10m || r.athlete.accel_10m,
                        fly_30m: r.athlete.fly30m || r.athlete.fly_30m,
                        broad_jump: r.athlete.broadJump || r.athlete.broad_jump || r.athlete.standingLongJump || r.athlete.standing_long_jump,
                      }}
                    />
                  )}
                </div>
              );
            })}
            {list.length === 0 && <p className="p-4 text-sm text-slate-500 dark:text-slate-400">No athletes yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
