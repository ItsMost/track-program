// ============================================================================
// Map an exercise title to the athlete's matching 1RM.
//
// Previously any title containing "squat" used the back-squat 1RM (so a
// Bulgarian split squat at 75% was prescribed 78 kg), any "deadlift" used the
// conventional deadlift 1RM (Romanian deadlift), and any "bench" used the flat
// bench 1RM (incline / dumbbell bench). Variations that do not share the
// same 1RM now return no match, so the card shows the % only and the coach
// prescribes the load (or RPE) in the notes.
// ============================================================================

const has = (s, words) => words.some((w) => s.includes(w));

// Variations whose load cannot be derived from the main lift's 1RM.
const NON_TRANSFERABLE = [
  'split squat',
  'bulgarian',
  'lunge',
  'step-up',
  'step up',
  'single-leg',
  'single leg',
  'one-leg',
  '1-leg',
  'unilateral',
  'pistol',
  'goblet',
  'squat jump',
  'jump squat',
  'overhead squat',
  'front squat',
  'zercher',
  'romanian',
  'rdl',
  'stiff-leg',
  'stiff leg',
  'good morning',
  'incline',
  'decline',
  'close grip',
  'close-grip',
  'dumbbell',
  'db ',
  'clean pull',
  'high pull',
  'isometric',
  'iso ',
];

export function resolveLiftMax(title, athlete) {
  const t = String(title || '').toLowerCase();
  const none = { liftMax: null, liftName: '' };
  if (!t) return none;

  if (has(t, NON_TRANSFERABLE)) return none;

  if (t.includes('bench')) {
    return { liftMax: athlete?.bench, liftName: 'Bench' };
  }
  if (t.includes('clean')) {
    return { liftMax: athlete?.clean, liftName: 'Clean' };
  }
  if (t.includes('trap bar') || t.includes('hex bar') || (t.includes('deadlift') && t.includes('trap'))) {
    return {
      liftMax: athlete?.trapBarDeadlift || athlete?.trap_bar_deadlift || athlete?.deadlift,
      liftName: 'Trap Bar DL',
    };
  }
  if (t.includes('deadlift')) {
    return { liftMax: athlete?.deadlift, liftName: 'Deadlift' };
  }
  if (t.includes('squat')) {
    if (t.includes('half')) return { liftMax: athlete?.halfSquat, liftName: 'Half Squat' };
    if (t.includes('quarter') || t.includes('1/4')) {
      return { liftMax: athlete?.quarterSquat, liftName: 'Quarter Squat' };
    }
    return { liftMax: athlete?.fullSquat, liftName: 'Squat' };
  }
  return none;
}
