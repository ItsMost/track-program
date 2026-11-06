import { describe, it, expect } from 'vitest';
import {
  calculateSessionBiometrics,
  calculateGymDrillLoad,
  getWeekLoadStatus,
  calculateWeekLoad,
  parseCount,
  isMainLift,
} from './loadModel.js';
import { SAMPLE_WEEK } from './__fixtures__/sampleWeek.js';

const load = (drills) => calculateSessionBiometrics(drills).totalVolumeScore;


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

describe('follow-up calibration', () => {
  const HIP_THRUST = { title: 'Barbell Hip Thrust', type: 'strength_double_leg', sets: '3', reps: '10', unit: 'reps' };

  it('3x10 hip thrust (no %) is 40-50% of 4x4 back squat @75%', () => {
    const ratio = load([HIP_THRUST]) / load([SQUAT]);
    expect(ratio).toBeGreaterThanOrEqual(0.4);
    expect(ratio).toBeLessThanOrEqual(0.5);
  });

  it('isolation work stays low (tibialis, calf) and isometrics/core stay low', () => {
    expect(load([TIBIALIS])).toBeLessThan(0.25 * load([FLYS]));
    expect(load([SOLEUS_ISO])).toBeLessThan(0.25 * load([FLYS]));
  });

  it("a normal high day (Saturday) scores 70-85 CNS, not the 100 cap", () => {
    const sat = calculateSessionBiometrics(SAMPLE_WEEK.Saturday);
    expect(sat.cnsScore).toBeGreaterThanOrEqual(70);
    expect(sat.cnsScore).toBeLessThanOrEqual(85);
    expect(sat.cnsLevel).toBe('High');
  });

  it('100 is reserved for an extreme day (double Saturday)', () => {
    const extreme = calculateSessionBiometrics([...SAMPLE_WEEK.Saturday, ...SAMPLE_WEEK.Saturday]);
    expect(extreme.cnsScore).toBe(100);
  });

  it('weeks without saved exercises (null) do not count as history', () => {
    const s = getWeekLoadStatus(2000, [null, 1900, null, 2100]);
    expect(s.status).toBe('baseline');
    expect(s.ratio).toBeNull();
    expect(s.weeksOfHistory).toBe(2);
    expect(getWeekLoadStatus(2000, [null, null, null, null]).label).toBe('Building baseline');
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
