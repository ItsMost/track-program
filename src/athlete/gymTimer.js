// Gym timer logic: rest parsing and set-by-set steps (pure, unit-tested).
import { resolveLiftMax } from '../data/liftMapping.js';
import { parseCount, isCoreOrAccessory } from '../data/loadModel.js';

export const DEFAULT_REST_SEC = 90;

// One duration: "90s", "90", "2m", "2.5m", "1:30", "2 min", "45 sec" -> seconds
export const parseDuration = (text) => {
  const s = String(text ?? '').trim().toLowerCase();
  if (!s) return null;
  const mmss = s.match(/^(\d+):(\d{1,2})$/);
  if (mmss) return parseInt(mmss[1], 10) * 60 + parseInt(mmss[2], 10);
  const m = s.match(/(\d+(?:[.,]\d+)?)\s*(h|hr|hrs|hours?|m|min|mins|minutes?|'|s|sec|secs|seconds?|")?/);
  if (!m) return null;
  const n = parseFloat(m[1].replace(',', '.'));
  const unit = m[2] || '';
  if (/^h/.test(unit)) return Math.round(n * 3600);
  if (/^m/.test(unit) || unit === "'") return Math.round(n * 60);
  if (/^s/.test(unit) || unit === '"') return Math.round(n);
  // bare number: up to 10 means minutes ("3"), more means seconds ("90")
  return Math.round(n <= 10 ? n * 60 : n);
};

// Rest field -> { repRestSec, setRestSec }.
// "2.5m / 3m" = rep rest / set rest. A single value is the rest between sets.
export const parseRest = (text) => {
  const s = String(text ?? '').trim();
  if (!s) return { repRestSec: null, setRestSec: null };
  const parts = s.split('/').map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return { repRestSec: parseDuration(parts[0]), setRestSec: parseDuration(parts[1]) };
  }
  return { repRestSec: null, setRestSec: parseDuration(parts[0]) };
};

export const formatSeconds = (sec) => {
  const v = Math.max(0, Math.round(sec || 0));
  const m = Math.floor(v / 60);
  const r = v % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
};

const GYM_BASES = ['strength', 'power', 'isometric', 'core'];
export const isGymDrill = (drill) => {
  const base = String(drill?.type || '').toLowerCase().split('_')[0];
  if (GYM_BASES.includes(base)) return true;
  // core-like drills stored under other types (planks, pallof, copenhagen)
  return isCoreOrAccessory(drill) && !String(drill?.type || '').toLowerCase().startsWith('mobility');
};

export const dayHasGym = (drills = []) => (drills || []).some(isGymDrill);

const repsLabel = (drill) => {
  const reps = String(drill?.reps ?? '').trim();
  const unit = String(drill?.unit || '').toLowerCase();
  if (!reps) return '';
  if (unit === 'sec' || unit === 'secs' || unit === 'seconds') return `${reps} s hold`;
  if (/[a-z]/i.test(reps)) return reps;
  return `${reps} reps`;
};

const loadLabel = (drill, athlete) => {
  const unit = drill?.intensityUnit || drill?.unit;
  if (unit === 'BW') return 'Bodyweight';
  const pct = parseFloat(drill?.percentage);
  if (unit === 'x BW' && pct > 0) {
    const bw = parseFloat(athlete?.weight);
    return bw > 0 ? `${pct}x BW · ${(pct * bw).toFixed(1)} kg` : `${pct}x BW`;
  }
  if (!(pct > 0)) return '';
  const { liftMax, liftName } = resolveLiftMax(drill?.title, athlete);
  const max = parseFloat(liftMax);
  if (max > 0) return `${pct}% · ${(Math.round((max * pct) / 100 / 2.5) * 2.5).toFixed(1)} kg (${liftName})`;
  return `${pct}%`;
};

// Group drills into superset blocks: a drill with superSetNext links to the next one.
export const groupSupersets = (drills = []) => {
  const groups = [];
  let current = [];
  drills.forEach((d, i) => {
    current.push({ drill: d, index: i });
    if (!d?.superSetNext || i === drills.length - 1) {
      groups.push(current);
      current = [];
    }
  });
  if (current.length) groups.push(current);
  return groups;
};

// Steps for the timer: one step per set. Inside a superset there is no rest
// between linked exercises; the rest comes after the last exercise of each round.
export const buildGymSteps = (dayDrills = [], athlete = null) => {
  const gym = (dayDrills || []).filter(isGymDrill);
  const groups = groupSupersets(gym);
  const steps = [];
  groups.forEach((group, gIdx) => {
    const rounds = Math.max(...group.map(({ drill }) => Math.max(1, Math.round(parseCount(drill.sets) || 1))));
    for (let round = 1; round <= rounds; round++) {
      const inRound = group.filter(({ drill }) => round <= Math.max(1, Math.round(parseCount(drill.sets) || 1)));
      inRound.forEach(({ drill }, pos) => {
        const totalSets = Math.max(1, Math.round(parseCount(drill.sets) || 1));
        const isLastInRound = pos === inRound.length - 1;
        const { setRestSec } = parseRest(drill.rest);
        steps.push({
          id: `${gIdx}-${round}-${pos}`,
          title: drill.title || 'Exercise',
          setNumber: round,
          totalSets,
          reps: repsLabel(drill),
          load: loadLabel(drill, athlete),
          notes: drill.details || '',
          superset: group.length > 1,
          supersetLabel: group.length > 1 ? String.fromCharCode(65 + pos) : '',
          restAfterSec: isLastInRound ? setRestSec ?? DEFAULT_REST_SEC : 0,
        });
      });
    }
  });
  if (steps.length) steps[steps.length - 1].restAfterSec = 0;
  return steps;
};
