import { describe, it, expect } from 'vitest';
import { evaluateReadiness, baselineOf, sessionLoad, READINESS_RULES } from './readinessRules.js';

const hist = [
  { date: '2026-11-01', cmj_cm: 40, sprint_test: '10m', sprint_time_s: 1.80, soreness: 2 },
  { date: '2026-11-02', cmj_cm: 40, sprint_test: '10m', sprint_time_s: 1.80, soreness: 2 },
  { date: '2026-11-03', cmj_cm: 40, sprint_test: '10m', sprint_time_s: 1.80, soreness: 2 },
  { date: '2026-11-04', cmj_cm: 40, sprint_test: '10m', sprint_time_s: 1.80, soreness: 2 },
];
const today = (over) => ({ date: '2026-11-05', soreness: 2, ankle_pain: 0, hamstring_pain: 0, ...over });

describe('readiness colours', () => {
  it('green when CMJ and sprint are at baseline or better, soreness <= 3, pain < 3', () => {
    const r = evaluateReadiness(today({ cmj_cm: 41, sprint_test: '10m', sprint_time_s: 1.79, soreness: 3, ankle_pain: 2 }), hist);
    expect(r.color).toBe('green');
  });

  it('yellow when CMJ is down 5-10%', () => {
    const r = evaluateReadiness(today({ cmj_cm: 36.8 }), hist); // -8%
    expect(r.color).toBe('yellow');
    expect(r.reasons[0]).toBe('CMJ -8.0%');
  });

  it('yellow when sprint is 2-3% slower or soreness is 4-5', () => {
    expect(evaluateReadiness(today({ sprint_test: '10m', sprint_time_s: 1.845 }), hist).color).toBe('yellow'); // +2.5%
    expect(evaluateReadiness(today({ soreness: 4 }), hist).color).toBe('yellow');
  });

  it('red when CMJ is down more than 10%, pain >= 3 or sprint more than 3% slower', () => {
    expect(evaluateReadiness(today({ cmj_cm: 35 }), hist).color).toBe('red'); // -12.5%
    expect(evaluateReadiness(today({ ankle_pain: 3 }), hist).color).toBe('red');
    expect(evaluateReadiness(today({ hamstring_pain: 5 }), hist).reasons).toContain('Hamstring pain 5');
    expect(evaluateReadiness(today({ sprint_test: '10m', sprint_time_s: 1.86 }), hist).color).toBe('red'); // +3.3%
  });

  it('red wins over yellow and both reasons are listed', () => {
    const r = evaluateReadiness(today({ cmj_cm: 37, soreness: 5, ankle_pain: 4 }), hist);
    expect(r.color).toBe('red');
    expect(r.reasons).toEqual(['Ankle pain 4', 'Soreness 5', 'CMJ -7.5%']);
  });

  it('shows "baseline" (grey) with fewer than 3 previous entries, but keeps the reasons', () => {
    const r = evaluateReadiness(today({ ankle_pain: 6 }), hist.slice(0, 2));
    expect(r.color).toBe('baseline');
    expect(r.reasons).toContain('Ankle pain 6');
  });

  it('compares sprints only with the same test', () => {
    const mixed = [...hist, { date: '2026-11-04', sprint_test: 'fly20', sprint_time_s: 2.1 }];
    const r = evaluateReadiness(today({ sprint_test: 'fly20', sprint_time_s: 2.3 }), mixed);
    expect(r.color).toBe('red'); // one fly20 entry = baseline 2.10, +9.5%
  });

  it('uses only the last 4 values for the baseline and ignores later dates', () => {
    const longer = [{ date: '2026-10-01', cmj_cm: 80 }, ...hist, { date: '2026-11-09', cmj_cm: 10 }];
    expect(baselineOf(longer.filter((h) => h.date < '2026-11-05'), (h) => h.cmj_cm)).toBe(40);
    expect(evaluateReadiness(today({ cmj_cm: 40 }), longer).color).toBe('green');
  });

  it('no check-in -> none; sRPE = RPE x minutes', () => {
    expect(evaluateReadiness(null, hist).color).toBe('none');
    expect(sessionLoad({ session_rpe: 7, session_minutes: 60 })).toBe(420);
    expect(sessionLoad({ session_rpe: 7 })).toBe(0);
    expect(READINESS_RULES.MIN_HISTORY).toBe(3);
  });
});
