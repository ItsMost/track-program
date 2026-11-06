import { describe, it, expect } from 'vitest';
import { parseDuration, parseRest, buildGymSteps, dayHasGym, formatSeconds, groupSupersets } from './gymTimer.js';

describe('parseDuration / parseRest', () => {
  it('reads common rest formats', () => {
    expect(parseDuration('90s')).toBe(90);
    expect(parseDuration('2m')).toBe(120);
    expect(parseDuration('2.5m')).toBe(150);
    expect(parseDuration('1:30')).toBe(90);
    expect(parseDuration('45 sec')).toBe(45);
    expect(parseDuration('3 min')).toBe(180);
    expect(parseDuration('90')).toBe(90);
    expect(parseDuration('3')).toBe(180);
    expect(parseDuration('')).toBeNull();
  });

  it('splits rep rest / set rest', () => {
    expect(parseRest('2.5m / 3m')).toEqual({ repRestSec: 150, setRestSec: 180 });
    expect(parseRest('90s')).toEqual({ repRestSec: null, setRestSec: 90 });
    expect(parseRest('')).toEqual({ repRestSec: null, setRestSec: null });
  });

  it('formats seconds as m:ss', () => {
    expect(formatSeconds(90)).toBe('1:30');
    expect(formatSeconds(5)).toBe('0:05');
  });
});

const athlete = { fullSquat: 150, clean: 100, weight: 80 };

describe('buildGymSteps', () => {
  it('skips running, plyos and mobility; keeps gym and core', () => {
    const steps = buildGymSteps([
      { title: '30m Accel', type: 'speed_acceleration', sets: 3, reps: 1, distance: 30 },
      { title: 'Pogos', type: 'plyometrics', sets: 2, reps: 10 },
      { title: 'Leg swings', type: 'mobility_warmup', sets: 1, reps: 10 },
      { title: 'Barbell Back Squat', type: 'strength_double_leg', sets: 2, reps: 4, percentage: 75, rest: '3m' },
      { title: 'Plank Hold', type: 'core_anti_extension', sets: 1, reps: 40, unit: 'sec', rest: '60s' },
    ], athlete);
    expect(steps.map((s) => s.title)).toEqual(['Barbell Back Squat', 'Barbell Back Squat', 'Plank Hold']);
    expect(steps[0]).toMatchObject({ setNumber: 1, totalSets: 2, reps: '4 reps', restAfterSec: 180 });
    expect(steps[0].load).toContain('112.5 kg');
    expect(steps[2].reps).toBe('40 s hold');
    expect(steps[steps.length - 1].restAfterSec).toBe(0);
  });

  it('runs supersets back to back with rest only after each round', () => {
    const steps = buildGymSteps([
      { title: 'RDL', type: 'strength_hamstrings_hip', sets: 3, reps: 6, rest: '2m', superSetNext: true },
      { title: 'Hip Flexor', type: 'strength_single_leg', sets: 2, reps: 8, rest: '90s' },
      { title: 'Calf Raise', type: 'strength_single_leg', sets: 1, reps: 12, rest: '60s' },
    ], athlete);
    expect(steps.map((s) => `${s.supersetLabel || '-'}${s.title} ${s.setNumber}/${s.totalSets} rest ${s.restAfterSec}`)).toEqual([
      'ARDL 1/3 rest 0',
      'BHip Flexor 1/2 rest 90',
      'ARDL 2/3 rest 0',
      'BHip Flexor 2/2 rest 90',
      'ARDL 3/3 rest 120',
      '-Calf Raise 1/1 rest 0',
    ]);
  });

  it('uses 90 s when the rest field is empty and handles old string fields', () => {
    const steps = buildGymSteps([
      { title: 'DB Row', type: 'strength_upper', sets: '2', reps: '10', rest: '' },
      { title: 'Pull-ups', type: 'strength_upper', sets: '1', reps: '6', intensityUnit: 'BW' },
    ]);
    expect(steps[0].restAfterSec).toBe(90);
    expect(steps[2].load).toBe('Bodyweight');
  });

  it('detects days with gym work', () => {
    expect(dayHasGym([{ type: 'tempo_extensive' }])).toBe(false);
    expect(dayHasGym([{ type: 'power', title: 'Hang Clean' }])).toBe(true);
    expect(groupSupersets([{ superSetNext: true }, {}, {}]).map((g) => g.length)).toEqual([2, 1]);
  });
});
