import { READINESS_RULES, sessionLoad } from '../../data/readinessRules.js';

// Test history charts: CMJ, 10 m, flying 30 m (and flying 20 m if used),
// broad jump, weekly sRPE. The shaded band is the athlete's own baseline
// (mean +/- 1 SD of the last 4 values). A dashed line marks the profile test.

const DAY = 86400000;
const toTime = (iso) => Date.parse(`${iso}T00:00:00Z`);
const shortDate = (iso) =>
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(toTime(iso)));

const weekStartOf = (iso) => {
  const t = toTime(iso);
  const dow = new Date(t).getUTCDay();
  return new Date(t - ((dow + 1) % 7) * DAY).toISOString().slice(0, 10);
};

const bandOf = (values) => {
  const last = values.slice(-READINESS_RULES.BASELINE_ENTRIES);
  if (last.length < 2) return null;
  const mean = last.reduce((a, b) => a + b, 0) / last.length;
  const sd = Math.sqrt(last.reduce((a, b) => a + (b - mean) ** 2, 0) / last.length);
  const half = Math.max(sd, Math.abs(mean) * 0.01);
  return { mean, low: mean - half, high: mean + half };
};

export const buildSeries = (checkins = [], profile = {}) => {
  const pick = (filter, key) =>
    checkins
      .filter((c) => filter(c) && c[key] !== null && c[key] !== undefined && Number(c[key]) > 0)
      .map((c) => ({ date: c.date, value: Number(c[key]) }));
  const weekly = {};
  checkins.forEach((c) => {
    const load = sessionLoad(c);
    if (load > 0) {
      const w = weekStartOf(c.date);
      weekly[w] = (weekly[w] || 0) + load;
    }
  });
  const series = [
    { key: 'cmj', title: 'CMJ', unit: 'cm', points: pick(() => true, 'cmj_cm'), profile: Number(profile?.cmj) || null, higherIsBetter: true, decimals: 1 },
    { key: '10m', title: '10 m sprint', unit: 's', points: pick((c) => c.sprint_test === '10m', 'sprint_time_s'), profile: Number(profile?.accel_10m) || null, higherIsBetter: false, decimals: 2 },
    { key: 'fly30', title: 'Flying 30 m', unit: 's', points: pick((c) => c.sprint_test === 'fly30', 'sprint_time_s'), profile: Number(profile?.fly_30m) || null, higherIsBetter: false, decimals: 2 },
    { key: 'fly20', title: 'Flying 20 m', unit: 's', points: pick((c) => c.sprint_test === 'fly20', 'sprint_time_s'), profile: null, higherIsBetter: false, decimals: 2, optional: true },
    { key: 'broad', title: 'Broad jump', unit: 'm', points: pick(() => true, 'broad_jump_m'), profile: Number(profile?.broad_jump) > 10 ? Number(profile.broad_jump) / 100 : Number(profile?.broad_jump) || null, higherIsBetter: true, decimals: 2 },
  ].filter((s) => !s.optional || s.points.length > 0);
  const srpe = Object.entries(weekly).sort(([a], [b]) => (a < b ? -1 : 1)).map(([date, value]) => ({ date, value }));
  return { series, srpe };
};

const W = 320;
const H = 132;
const PAD = { l: 34, r: 10, t: 12, b: 22 };

function LineChart({ s }) {
  const pts = s.points;
  const values = pts.map((p) => p.value);
  const band = bandOf(values);
  const all = [...values, ...(s.profile ? [s.profile] : []), ...(band ? [band.low, band.high] : [])];
  if (!all.length) return <Empty title={s.title} />;
  let min = Math.min(...all);
  let max = Math.max(...all);
  const span = max - min || Math.abs(max) * 0.1 || 1;
  min -= span * 0.15;
  max += span * 0.15;
  const t0 = pts.length ? toTime(pts[0].date) : 0;
  const t1 = pts.length ? toTime(pts[pts.length - 1].date) : 1;
  const x = (iso) => (pts.length <= 1 ? (PAD.l + W - PAD.r) / 2 : PAD.l + ((toTime(iso) - t0) / (t1 - t0 || 1)) * (W - PAD.l - PAD.r));
  const y = (v) => PAD.t + (1 - (v - min) / (max - min)) * (H - PAD.t - PAD.b);
  const last = pts[pts.length - 1];
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.date).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const ticks = [max - span * 0.15, (min + max) / 2, min + span * 0.15];

  return (
    <figure className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
      <figcaption className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{s.title} <span className="text-xs font-medium text-slate-500 dark:text-slate-400">({s.unit}, {s.higherIsBetter ? 'higher' : 'lower'} is better)</span></span>
        {last && <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-50">{last.value.toFixed(s.decimals)}</span>}
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto mt-1 text-slate-400 dark:text-slate-500" role="img" aria-label={`${s.title} over time`}>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke="currentColor" strokeOpacity="0.18" />
            <text x={PAD.l - 4} y={y(v) + 3} textAnchor="end" fontSize="9" fill="currentColor" className="tabular-nums">{v.toFixed(s.decimals)}</text>
          </g>
        ))}
        {band && (
          <rect x={PAD.l} width={W - PAD.l - PAD.r} y={y(band.high)} height={Math.max(1, y(band.low) - y(band.high))} className="fill-orange-500/15" />
        )}
        {s.profile && (
          <g>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(s.profile)} y2={y(s.profile)} stroke="currentColor" strokeDasharray="4 3" strokeOpacity="0.7" />
            <text x={W - PAD.r} y={y(s.profile) - 3} textAnchor="end" fontSize="9" fill="currentColor">Profile {s.profile.toFixed(s.decimals)}</text>
          </g>
        )}
        {pts.length > 1 && <path d={path} fill="none" className="stroke-orange-500" strokeWidth="2" strokeLinejoin="round" />}
        {pts.map((p) => (
          <circle key={p.date} cx={x(p.date)} cy={y(p.value)} r={p === last ? 3.5 : 2.5} className={p === last ? 'fill-orange-600' : 'fill-orange-400'}>
            <title>{`${shortDate(p.date)}: ${p.value.toFixed(s.decimals)} ${s.unit}`}</title>
          </circle>
        ))}
        {pts.length > 0 && (
          <>
            <text x={PAD.l} y={H - 6} fontSize="9" fill="currentColor">{shortDate(pts[0].date)}</text>
            {pts.length > 1 && <text x={W - PAD.r} y={H - 6} fontSize="9" textAnchor="end" fill="currentColor">{shortDate(last.date)}</text>}
          </>
        )}
      </svg>
      {!pts.length && <p className="text-xs text-slate-500 dark:text-slate-400">No check-in results yet.</p>}
    </figure>
  );
}

function SrpeChart({ weeks }) {
  if (!weeks.length) return <Empty title="Weekly sRPE" />;
  const max = Math.max(...weeks.map((w) => w.value)) * 1.15;
  const bw = (W - PAD.l - PAD.r) / weeks.length;
  const y = (v) => PAD.t + (1 - v / max) * (H - PAD.t - PAD.b);
  const band = bandOf(weeks.map((w) => w.value));
  return (
    <figure className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
      <figcaption className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Weekly sRPE <span className="text-xs font-medium text-slate-500 dark:text-slate-400">(RPE × minutes, AU)</span></span>
        <span className="text-sm font-semibold tabular-nums">{Math.round(weeks[weeks.length - 1].value)}</span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto mt-1 text-slate-400 dark:text-slate-500" role="img" aria-label="Weekly sRPE">
        {band && <rect x={PAD.l} width={W - PAD.l - PAD.r} y={y(band.high)} height={Math.max(1, y(band.low) - y(band.high))} className="fill-orange-500/15" />}
        <line x1={PAD.l} x2={W - PAD.r} y1={y(0)} y2={y(0)} stroke="currentColor" strokeOpacity="0.3" />
        <text x={PAD.l - 4} y={y(max / 1.15) + 3} textAnchor="end" fontSize="9" fill="currentColor" className="tabular-nums">{Math.round(max / 1.15)}</text>
        {weeks.map((w, i) => (
          <g key={w.date}>
            <rect x={PAD.l + i * bw + (bw - Math.min(bw * 0.7, 28)) / 2} width={Math.min(bw * 0.7, 28)} y={y(w.value)} height={y(0) - y(w.value)} rx="2" className={i === weeks.length - 1 ? 'fill-orange-600' : 'fill-orange-400'}>
              <title>{`Week of ${shortDate(w.date)}: ${Math.round(w.value)} AU`}</title>
            </rect>
            {(weeks.length <= 8 || i % 2 === 0) && (
              <text x={PAD.l + i * bw + bw / 2} y={H - 6} fontSize="9" textAnchor="middle" fill="currentColor">{shortDate(w.date)}</text>
            )}
          </g>
        ))}
      </svg>
    </figure>
  );
}

function Empty({ title }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-3">
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">No data yet.</p>
    </div>
  );
}

export default function TestHistory({ checkins, profile }) {
  const { series, srpe } = buildSeries(checkins || [], profile || {});
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 dark:text-slate-400">Shaded band: own baseline (last {READINESS_RULES.BASELINE_ENTRIES} results). Dashed line: profile test.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {series.map((s) => <LineChart key={s.key} s={s} />)}
        <SrpeChart weeks={srpe} />
      </div>
    </div>
  );
}
