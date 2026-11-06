import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getMyCheckins, submitCheckin } from './api';
import { addDays, shortDate } from './cairoDate';

const EMPTY = {
  sleep: null, soreness: null, ankle_pain: null, hamstring_pain: null,
  cmj_cm: '', broad_jump_m: '', sprint_test: '', sprint_time_s: '', session_rpe: null, session_minutes: '', athlete_note: '',
};

export default function CheckInForm({ code, today, onSaved }) {
  const yesterday = addDays(today, -1);
  const [date, setDate] = useState(today);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Prefill with what was already saved for this date.
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getMyCheckins(code, date, date)
      .then((data) => {
        if (!active) return;
        const row = (data.checkins || [])[0];
        setForm(row ? Object.fromEntries(Object.keys(EMPTY).map((k) => [k, row[k] ?? EMPTY[k]])) : EMPTY);
      })
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [code, date]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const num = (v) => (v === '' || v === null || v === undefined ? undefined : Number(v));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await submitCheckin(code, date, {
        sleep: form.sleep,
        soreness: form.soreness,
        ankle_pain: form.ankle_pain,
        hamstring_pain: form.hamstring_pain,
        cmj_cm: num(form.cmj_cm),
        broad_jump_m: num(form.broad_jump_m),
        sprint_test: form.sprint_test || undefined,
        sprint_time_s: form.sprint_test ? num(form.sprint_time_s) : undefined,
        session_rpe: form.session_rpe,
        session_minutes: num(form.session_minutes),
        athlete_note: form.athlete_note?.trim() || undefined,
      });
      onSaved?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-2" role="group" aria-label="Day">
        {[today, yesterday].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDate(d)}
            aria-pressed={date === d}
            className={`py-2.5 rounded-xl border text-sm font-semibold tabular-nums ${date === d ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}`}
          >
            {d === today ? 'Today' : 'Yesterday'} · {shortDate(d)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-orange-500 animate-spin" aria-label="Loading" /></div>
      ) : (
        <>
          <Card title="Morning">
            <Scale label="Sleep quality" hint="1 bad · 5 great" min={1} max={5} value={form.sleep} onChange={(v) => set('sleep', v)} />
            <Scale label="Muscle soreness" hint="1 none · 5 very sore" min={1} max={5} value={form.soreness} onChange={(v) => set('soreness', v)} />
            <Scale label="Ankle pain" hint="0 none · 10 worst" min={0} max={10} value={form.ankle_pain} onChange={(v) => set('ankle_pain', v)} />
            <Scale label="Hamstring pain" hint="0 none · 10 worst" min={0} max={10} value={form.hamstring_pain} onChange={(v) => set('hamstring_pain', v)} />
          </Card>

          <Card title="Tests (if you did them)">
            <NumberField id="cmj" label="CMJ" unit="cm" step="0.1" value={form.cmj_cm} onChange={(v) => set('cmj_cm', v)} />
            <NumberField id="broad" label="Broad jump" unit="m" step="0.01" value={form.broad_jump_m} onChange={(v) => set('broad_jump_m', v)} />
            <div className="space-y-1.5">
              <label htmlFor="sprint-test" className="block text-sm font-medium">Sprint test</label>
              <select
                id="sprint-test"
                value={form.sprint_test || ''}
                onChange={(e) => set('sprint_test', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
              >
                <option value="">None</option>
                <option value="10m">10 m</option>
                <option value="fly20">Flying 20 m</option>
                <option value="fly30">Flying 30 m</option>
                <option value="other">Other</option>
              </select>
            </div>
            {form.sprint_test && (
              <NumberField id="sprint-time" label="Time" unit="s" step="0.01" value={form.sprint_time_s} onChange={(v) => set('sprint_time_s', v)} />
            )}
          </Card>

          <Card title="After the session">
            <Scale label="Session RPE" hint="0 rest · 10 maximal" min={0} max={10} value={form.session_rpe} onChange={(v) => set('session_rpe', v)} />
            <NumberField id="minutes" label="Session length" unit="min" step="1" value={form.session_minutes} onChange={(v) => set('session_minutes', v)} />
            <div className="space-y-1.5">
              <label htmlFor="note" className="block text-sm font-medium">How did it feel?</label>
              <textarea
                id="note"
                dir="auto"
                rows={3}
                maxLength={1000}
                value={form.athlete_note || ''}
                onChange={(e) => set('athlete_note', e.target.value)}
                placeholder="Optional. Anything your coach should know."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm resize-none"
              />
            </div>
          </Card>

          {error && <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save check-in
          </button>
        </>
      )}
    </form>
  );
}

function Card({ title, children }) {
  return (
    <fieldset className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4">
      <legend className="px-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{title}</legend>
      {children}
    </fieldset>
  );
}

function Scale({ label, hint, min, max, value, onChange }) {
  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">{hint}</span>
      </div>
      <div className="flex gap-1" role="radiogroup" aria-label={label}>
        {values.map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={value === v}
            onClick={() => onChange(value === v ? null : v)}
            className={`flex-1 min-w-0 py-2 rounded-lg border text-sm font-semibold tabular-nums ${value === v ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950'}`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

function NumberField({ id, label, unit, step, value, onChange }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium">{label}</label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          step={step}
          min="0"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm tabular-nums"
        />
        <span className="text-sm text-slate-500 dark:text-slate-400 w-8">{unit}</span>
      </div>
    </div>
  );
}
