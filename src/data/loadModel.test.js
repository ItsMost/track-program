import { describe, it, expect } from 'vitest';
import {
  calculateSessionBiometrics,
  calculateGymDrillLoad,
  getWeekLoadStatus,
  calculateWeekLoad,
  parseCount,
  isMainLift,
} from './loadModel.js';

const load = (drills) => calculateSessionBiometrics(drills).totalVolumeScore;

// ---------------------------------------------------------------------------
// Sample general-prep week (from the coach's brief)
// ---------------------------------------------------------------------------
const SAMPLE_WEEK = {
  Saturday: [
    { title: 'Sled Sprints', type: 'speed_resisted', sets: '2', reps: '2', distance: '15', percentage: 100, unit: 'meters' },
    { title: '20m Acceleration Sprints', type: 'speed_acceleration', sets: '1', reps: '2', distance: '20', percentage: 100, unit: 'meters' },
    { title: '30m Acceleration Sprints', type: 'speed_acceleration', sets: '1', reps: '2', distance: '30', percentage: 100, unit: 'meters' },
    { title: 'Ankle Pogo Hops', type: 'plyometrics', sets: '2', reps: '10', unit: 'contacts' },
    { title: 'Broad Jump', type: 'plyometrics', sets: '3', reps: '3', unit: 'contacts' },
    { title: 'Barbell Back Squat', type: 'strength_double_leg', sets: '4', reps: '4', percentage: 75, unit: 'reps' },
    { title: 'Romanian Deadlift (RDL)', type: 'strength_hamstrings_hip', sets: '3', reps: '6', unit: 'reps' },
    { title: 'Barbell Hip Thrust', type: 'strength_double_leg', sets: '3', reps: '10', unit: 'reps' },
    { title: 'Seated Soleus Calf Raise', type: 'strength_single_leg', sets: '3', reps: '12', unit: 'reps' },
    { title: 'Copenhagen Side Plank', type: 'isometric', sets: '2', reps: '20', unit: 'sec', intensityUnit: 'BW' },
  ],
  Sunday: [
    { title: 'Extensive Tempo 100m', type: 'tempo_extensive', sets: '2', reps: '7', distance: '100', percentage: 70, unit: 'meters' },
  ],
  Monday: [
    { title: 'Flying Sprints 20m', type: 'speed_max_velocity', sets: '3', reps: '1', distance: '20', percentage: 95, unit: 'meters' },
    { title: 'Long Jump Pop-ups', type: 'long_jump_takeoff', sets: '1', reps: '6', unit: 'contacts' },
    { title: 'Short-Approach Long Jump', type: 'long_jump', sets: '1', reps: '4', percentage: 95, unit: 'contacts' },
    { title: 'Hurdle Hops', type: 'plyo_fast_ssc', sets: '3', reps: '4', unit: 'contacts' },
    { title: 'Alternate Leg Bounding', type: 'plyometrics', sets: '3', reps: '6', unit: 'contacts' },
    { title: 'Hang Clean', type: 'power', sets: '4', reps: '3', percentage: 75, unit: 'reps' },
    { title: 'Nordic Hamstring Curls', type: 'strength_hamstrings_knee', sets: '3', reps: '4', unit: 'reps' },
  ],
  Tuesday: [
    { title: 'Extensive Tempo 150m', type: 'tempo_extensive', sets: '1', reps: '6', distance: '150', percentage: 70, unit: 'meters' },
    { title: 'Incline DB Press', type: 'strength_upper', sets: '3', reps: '8', unit: 'reps' },
    { title: 'DB Row', type: 'strength_upper', sets: '3', reps: '10', unit: 'reps' },
    { title: 'Pull-ups', type: 'strength_upper', sets: '3', reps: '6', unit: 'reps', intensityUnit: 'BW' },
  ],
  Wednesday: [
    { title: 'Hill Sprints 20m', type: 'speed_resisted', sets: '1', reps: '5', distance: '20', percentage: 100, unit: 'meters' },
    { title: 'Curve Sprints 30m', type: 'speed_max_velocity', sets: '1', reps: '2', distance: '30', percentage: 92, unit: 'meters' },
    { title: 'Approach Rhythm Runs (no jump)', type: 'long_jump_approach', sets: '1', reps: '4', unit: 'contacts' },
  ],
  Thursday: [
    { title: 'Ankle Pogo Hops', type: 'plyometrics', sets: '2', reps: '10', unit: 'contacts' },
    { title: 'Bulgarian Split Squat', type: 'strength_single_leg', sets: '3', reps: '8', unit: 'reps' },
    { title: 'Single-Leg RDL', type: 'strength_single_leg', sets: '3', reps: '8', unit: 'reps' },
    { title: 'Single-Leg Calf Raise', type: 'strength_single_leg', sets: '3', reps: '12', unit: 'reps' },
    { title: 'Soleus Isometric Hold', type: 'isometric', sets: '3', reps: '30', unit: 'sec' },
    { title: 'Tibialis Raises', type: 'strength_single_leg', sets: '2', reps: '15', unit: 'reps' },
    { title: 'Copenhagen Side Plank', type: 'isometric', sets: '2', reps: '20', unit: 'sec', intensityUnit: 'BW' },
    { title: 'Incline Bench Press', type: 'strength_upper', sets: '3', reps: '8', unit: 'reps' },
  ],
  Friday: [],
};

const FLYS = { title: 'Flying Sprints 20m', type: 'speed_max_velocity', sets: '3', reps: '1', distance: '20', percentage: 95, unit: 'meters' };
const SQUAT = { title: 'Barbell Back Squat', type: 'strength_double_leg', sets: '4', reps: '4', percentage: 75, unit: 'reps' };
const TIBIALIS = { title: 'Tibialis Raises', type: 'strength_single_leg', sets: '2', reps: '15', unit: 'reps' };
const SOLEUS_ISO = { title: 'Soleus Isometric Hold', type: 'isometric', sets: '3', reps: '30', unit: 'sec', percentage: 60 };

describe('parseCount', () => {
  it('reads plain, multiplied and ranged values', () => {
    expect(parseCount('4')).toBe(4);
    expect(parseCount('2x15')).toBe(30);
    expect(parseCount('8-10')).toBe(8);
    expect(parseCount('30s')).toBe(30);
    expect(parseCount('')).toBe(0);
    expect(parseCount(null)).toBe(0);
    expect(parseCount(12)).toBe(12);
  });
});

describe('sanity targets', () => {
  it('3x20 m flys @95% is in the same range as 4x4 back squat @75%', () => {
    const flys = load([FLYS]);
    const squat = load([SQUAT]);
    expect(flys).toBeGreaterThan(0);
    const ratio = squat / flys;
    expect(ratio).toBeGreaterThanOrEqual(0.67);
    expect(ratio).toBeLessThanOrEqual(1.5);
  });

  it('2x15 tibialis raises are < 25% of the flys', () => {
    expect(load([TIBIALIS])).toBeLessThan(0.25 * load([FLYS]));
  });

  it('isometric holds use hold time, not seconds-as-reps', () => {
    const iso = load([SOLEUS_ISO]);
    expect(iso).toBeLessThan(0.25 * load([FLYS]));
    expect(calculateGymDrillLoad(SOLEUS_ISO).kind).toBe('isometric');
  });

  it('core / mobility stay ~0', () => {
    const core = calculateSessionBiometrics([
      { title: 'Plank Hold on Ball', type: 'core_anti_extension', sets: '3', reps: '60', unit: 'sec' },
      { title: 'Deadbugs', type: 'core_anti_extension', sets: '3', reps: '12' },
      { title: 'Leg Swings', type: 'mobility_warmup', sets: '2', reps: '10' },
    ]);
    expect(core.totalVolumeScore).toBeLessThanOrEqual(3);
    expect(core.trackLoad).toBe(0);
  });

  it('a high sprint/jump day scores a higher CNS level than a gym-accessory-only day', () => {
    const rank = { Rest: 0, Low: 1, Med: 2, High: 3 };
    const monday = calculateSessionBiometrics(SAMPLE_WEEK.Monday);
    const accessoryDay = calculateSessionBiometrics(
      SAMPLE_WEEK.Thursday.filter((d) => !d.type.startsWith('plyo'))
    );
    expect(rank[monday.cnsLevel]).toBeGreaterThan(rank[accessoryDay.cnsLevel]);
    expect(monday.cnsScore).toBeGreaterThan(accessoryDay.cnsScore);
  });

  it('an upper-body accessory day scores below a high-CNS sprint day', () => {
    const upper = load(SAMPLE_WEEK.Tuesday.filter((d) => d.type === 'strength_upper'));
    expect(upper).toBeLessThan(load(SAMPLE_WEEK.Wednesday));
  });
});

describe('track / gym split', () => {
  it('puts runs, plyos and jumps in track and lifts in gym', () => {
    const sat = calculateSessionBiometrics(SAMPLE_WEEK.Saturday);
    expect(sat.trackLoad).toBeGreaterThan(0);
    expect(sat.gymLoad).toBeGreaterThan(0);
    expect(sat.trackLoad + sat.gymLoad).toBe(sat.totalVolumeScore);
  });

  it('in the sample week, track load is larger than gym load', () => {
    const week = calculateWeekLoad(Object.values(SAMPLE_WEEK));
    expect(week.track).toBeGreaterThan(week.gym);
    expect(week.total).toBe(week.track + week.gym);
  });

  it('approach / rhythm runs without takeoff are runs, not contacts', () => {
    const run = calculateSessionBiometrics([SAMPLE_WEEK.Wednesday[2]]);
    expect(run.totalContacts).toBe(0);
    expect(run.trackLoad).toBeGreaterThan(0);
  });

  it('only main lifts with a % count at full weight', () => {
    expect(isMainLift(SQUAT)).toBe(true);
    expect(isMainLift({ ...SQUAT, percentage: '' })).toBe(false);
    expect(isMainLift({ title: 'Bulgarian Split Squat', percentage: 75 })).toBe(false);
    expect(isMainLift({ title: 'Romanian Deadlift (RDL)', percentage: 70 })).toBe(false);
    expect(isMainLift({ title: 'Incline Bench Press', percentage: 70 })).toBe(false);
    expect(isMainLift({ title: 'Trap Bar Deadlift (High Force)', percentage: 80 })).toBe(true);
    expect(isMainLift({ title: 'Hang Clean', percentage: 75 })).toBe(true);
    expect(isMainLift({ title: 'Bench Press', percentage: 75 })).toBe(true);
  });
});

describe('old saved data', () => {
  it('reads meters stored in reps when unit is "meters" and there is no distance', () => {
    const bio = calculateSessionBiometrics([
      { title: '60m Max Velocity Sprints', type: 'speed', sets: '2', reps: '60', unit: 'meters', percentage: 100 },
    ]);
    expect(bio.totalSprintMeters).toBe(120);
    expect(bio.trackLoad).toBeGreaterThan(0);
  });

  it('handles missing percentages without crashing', () => {
    const bio = calculateSessionBiometrics([
      { title: 'Sprint', type: 'speed', sets: '3', reps: '1', distance: '30' },
      { title: 'Squat', type: 'strength', sets: '3', reps: '5' },
      { title: 'Unknown', type: 'physical', sets: '1', reps: '1' },
      null,
    ]);
    expect(Number.isFinite(bio.totalVolumeScore)).toBe(true);
    expect(bio.totalVolumeScore).toBeGreaterThan(0);
  });
});

describe('week label (acute:chronic)', () => {
  const sampleTotal = calculateWeekLoad(Object.values(SAMPLE_WEEK)).total;

  it('the sample week is NOT labelled peak / spike, with or without history', () => {
    expect(getWeekLoadStatus(sampleTotal, []).status).toBe('baseline');
    const s = getWeekLoadStatus(sampleTotal, [sampleTotal, sampleTotal * 0.95, sampleTotal * 1.05, sampleTotal]);
    expect(s.status).toBe('normal');
  });

  it('shows "Building baseline" with fewer than 3 weeks of history', () => {
    const s = getWeekLoadStatus(2000, [1800, 0, 0, 1900]);
    expect(s.status).toBe('baseline');
    expect(s.label).toBe('Building baseline');
    expect(s.ratio).toBeNull();
  });

  it('applies the ratio bands', () => {
    const hist = [1000, 1000, 1000, 1000];
    expect(getWeekLoadStatus(700, hist).status).toBe('low');
    expect(getWeekLoadStatus(1000, hist).status).toBe('normal');
    expect(getWeekLoadStatus(1300, hist).status).toBe('normal');
    expect(getWeekLoadStatus(1400, hist).status).toBe('high');
    expect(getWeekLoadStatus(1600, hist).status).toBe('spike');
    expect(getWeekLoadStatus(1600, hist).isWarning).toBe(true);
  });
});
