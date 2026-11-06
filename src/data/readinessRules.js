// ============================================================================
// Readiness colour rules. Tune the numbers here; everything else reads them.
//
// Baseline = average of the athlete's last BASELINE_ENTRIES values before the
// day being judged. With fewer than MIN_HISTORY previous check-ins the colour
// is "baseline" (grey) instead of green / yellow / red.
// ============================================================================
export const READINESS_RULES = {
  BASELINE_ENTRIES: 4,
  MIN_HISTORY: 3,

  cmj: {
    // CMJ change vs baseline, in %. Down 0-5% still counts as "at baseline".
    greenMinPct: -5,
    yellowMinPct: -10, // -5% to -10% -> yellow; below -10% -> red
  },
  sprint: {
    // Sprint time vs baseline of the same test, in % slower.
    greenMaxPct: 2, // up to 2% slower -> green
    yellowMaxPct: 3, // 2-3% slower -> yellow; over 3% -> red
  },
  soreness: {
    greenMax: 3, // 1-3 green, 4-5 yellow
  },
  pain: {
    redMin: 3, // ankle or hamstring pain >= 3 -> red
  },
};

export const READINESS_COLORS = {
  green: { label: 'Green', chip: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40', dot: 'bg-emerald-500' },
  yellow: { label: 'Yellow', chip: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40', dot: 'bg-amber-500' },
  red: { label: 'Red', chip: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40', dot: 'bg-rose-500' },
  baseline: { label: 'Baseline', chip: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-400/40', dot: 'bg-slate-400' },
  none: { label: 'No check-in', chip: 'bg-transparent text-slate-400 dark:text-slate-500 border-slate-300/50 dark:border-slate-700', dot: 'bg-slate-300 dark:bg-slate-700' },
};

const num = (v) => (v === null || v === undefined || v === '' ? null : Number(v));
const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const pct = (v, base) => ((v - base) / base) * 100;
const fmtPct = (p) => `${p > 0 ? '+' : ''}${p.toFixed(1)}%`;

// Average of the last n non-empty values of `pick(entry)` among previous entries.
export const baselineOf = (previous, pick, n = READINESS_RULES.BASELINE_ENTRIES) => {
  const values = previous.map(pick).map(num).filter((v) => v !== null && Number.isFinite(v) && v > 0);
  return values.length ? avg(values.slice(-n)) : null;
};

/**
 * Colour for one day.
 * @param entry    today's check-in (track_readiness row) or null
 * @param history  the athlete's earlier check-ins (any order; only dates before entry.date are used)
 * @param rules    READINESS_RULES (override for tests / tuning)
 * @returns { color, reasons: string[], cmjPct, sprintPct }
 */
export const evaluateReadiness = (entry, history = [], rules = READINESS_RULES) => {
  if (!entry) return { color: 'none', reasons: [], cmjPct: null, sprintPct: null };
  const previous = (history || [])
    .filter((h) => h && h.date < entry.date)
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  const reasons = [];
  const red = [];
  const yellow = [];

  // Pain and soreness need no baseline.
  const ankle = num(entry.ankle_pain);
  const ham = num(entry.hamstring_pain);
  if (ankle !== null && ankle >= rules.pain.redMin) red.push(`Ankle pain ${ankle}`);
  if (ham !== null && ham >= rules.pain.redMin) red.push(`Hamstring pain ${ham}`);
  const sore = num(entry.soreness);
  if (sore !== null && sore > rules.soreness.greenMax) yellow.push(`Soreness ${sore}`);

  // CMJ vs baseline
  let cmjPct = null;
  const cmj = num(entry.cmj_cm);
  const cmjBase = baselineOf(previous, (h) => h.cmj_cm, rules.BASELINE_ENTRIES);
  if (cmj !== null && cmjBase) {
    cmjPct = pct(cmj, cmjBase);
    if (cmjPct < rules.cmj.yellowMinPct) red.push(`CMJ ${fmtPct(cmjPct)}`);
    else if (cmjPct < rules.cmj.greenMinPct) yellow.push(`CMJ ${fmtPct(cmjPct)}`);
  }

  // Sprint vs baseline of the same test
  let sprintPct = null;
  const time = num(entry.sprint_time_s);
  if (time !== null && entry.sprint_test) {
    const sameTest = previous.filter((h) => h.sprint_test === entry.sprint_test);
    const base = baselineOf(sameTest, (h) => h.sprint_time_s, rules.BASELINE_ENTRIES);
    if (base) {
      sprintPct = pct(time, base);
      const label = entry.sprint_test === '10m' ? '10 m' : entry.sprint_test === 'fly20' ? 'Fly 20' : entry.sprint_test === 'fly30' ? 'Fly 30' : 'Sprint';
      if (sprintPct > rules.sprint.yellowMaxPct) red.push(`${label} ${fmtPct(sprintPct)} slower`);
      else if (sprintPct > rules.sprint.greenMaxPct) yellow.push(`${label} ${fmtPct(sprintPct)} slower`);
    }
  }

  reasons.push(...red, ...yellow);

  if (previous.length < rules.MIN_HISTORY) {
    return { color: 'baseline', reasons, cmjPct, sprintPct };
  }
  if (red.length) return { color: 'red', reasons, cmjPct, sprintPct };
  if (yellow.length) return { color: 'yellow', reasons, cmjPct, sprintPct };
  return { color: 'green', reasons: reasons.length ? reasons : ['All markers at baseline'], cmjPct, sprintPct };
};

// Session load (sRPE) = RPE x minutes, in AU.
export const sessionLoad = (entry) => {
  const rpe = num(entry?.session_rpe);
  const min = num(entry?.session_minutes);
  return rpe !== null && min !== null ? rpe * min : 0;
};
