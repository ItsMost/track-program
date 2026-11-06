// ============================================================================
// Multi-System Sports Science Load Model (Charlie Francis High/Low & Triphasic)
// Upgraded for Sprint, Jump, and VBT High-Performance Optimization
// ============================================================================

export const getRunningLoadProfile = (type = '', intensityPct = 0) => {
  const t = (type || '').toLowerCase();
  // Default CNS split by intensity (used for generic running types)
  const intensitySplit = intensityPct > 85 ? 0.85 : intensityPct > 75 ? 0.60 : 0.15;

  // Tempo — fixed physiological splits
  if (t === 'tempo_extensive') return { multiplier: 0.18, cnsShare: 0.10 };
  if (t === 'tempo_intensive') return { multiplier: 0.50, cnsShare: 0.35 };
  if (t.startsWith('tempo')) return { multiplier: 0.25, cnsShare: 0.15 };

  // Resisted & Assisted Speed
  if (t === 'speed_resisted') return { multiplier: 2.2, cnsShare: 0.90 };
  if (t === 'speed_assisted') return { multiplier: 2.0, cnsShare: 0.95 };

  // Anaerobic
  if (t === 'anaerobic_capacity') return { multiplier: 0.30, cnsShare: intensitySplit };
  if (t === 'anaerobic_lactic_power') return { multiplier: 0.60, cnsShare: intensitySplit };
  if (t.startsWith('anaerobic')) return { multiplier: 0.45, cnsShare: intensitySplit };

  // Endurance
  if (t === 'endurance_easy') return { multiplier: 0.10, cnsShare: intensitySplit };
  if (t === 'endurance_800') return { multiplier: 0.25, cnsShare: intensitySplit };
  if (t === 'endurance_vo2max') return { multiplier: 0.40, cnsShare: intensitySplit };
  if (t === 'endurance_400') return { multiplier: 0.50, cnsShare: intensitySplit };
  if (t.startsWith('endurance')) return { multiplier: 0.30, cnsShare: intensitySplit };

  // Speed
  if (t === 'speed_endurance') return { multiplier: 1.0, cnsShare: intensitySplit };

  // Max velocity / acceleration / generic speed
  return { multiplier: 2.0, cnsShare: intensitySplit };
};

// When a drill has no % entered, assume a typical intensity for its type
// instead of a flat 75% (which inflated tempo and under-rated sprints).
export const getDefaultIntensity = (type = '') => {
  const t = (type || '').toLowerCase();
  const base = t.split('_')[0];
  if (t === 'tempo_extensive') return 65;
  if (t === 'tempo_intensive') return 80;
  if (base === 'tempo') return 70;
  if (t === 'speed_endurance') return 92;
  if (base === 'speed') return 95;
  if (base === 'endurance') return 70;
  if (base === 'anaerobic') return 85;
  if (base === 'strength' || base === 'power' || base === 'isometric') return 70;
  return 75;
};

// Long-jump approach / rhythm runs are runs, not jumps: no takeoff contacts.
export const isApproachRun = (drill) => {
  const t = (drill?.type || '').toLowerCase();
  const title = (drill?.title || '').toLowerCase();
  if (!(t.startsWith('long_jump') || t.startsWith('triple_jump'))) return false;
  return (
    title.includes('no jump') ||
    title.includes('run-through') ||
    title.includes('run through') ||
    title.includes('rhythm run') ||
    title.includes('approach run')
  );
};

export const calculateRunningLoad = (type, totalMeters, intensityPct) => {
  const pct = parseFloat(intensityPct) || 0;
  const meters = parseFloat(totalMeters) || 0;
  if (meters <= 0 || pct <= 0) return 0;
  const { multiplier } = getRunningLoadProfile(type, pct);
  return meters * Math.pow(pct / 100, 2) * multiplier;
};

export const isRunningCategory = (baseCategory) =>
  ['speed', 'tempo', 'endurance', 'anaerobic'].includes(baseCategory);

// ============================================================================
// Number parsing for sets / reps / distance fields.
// Old code stripped every non-digit, so "2x15" became 215 and "8-10" became
// 810. Now "2x15" -> 30 (product), "8-10" -> 8 (first number), "30s" -> 30.
// ============================================================================
export const parseCount = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const parts = String(value).toLowerCase().split(/[x×*]/);
  let product = 1;
  let found = false;
  for (const part of parts) {
    const m = part.match(/\d+(?:\.\d+)?/);
    if (!m) continue;
    product *= parseFloat(m[0]);
    found = true;
  }
  return found ? product : 0;
};

// ============================================================================
// Gym classification
// Main lifts (squat, deadlift / trap bar, cleans, flat bench) that have a % of
// 1RM keep full weight. Everything else in the gym (single-leg, calf, tibialis,
// hip flexor, upper-body accessories, hypertrophy work, or any lift with no %)
// is an accessory and counts at ACCESSORY_WEIGHT.
// ============================================================================
export const GYM_LOAD_FACTOR = 12; // AU per rep at 100% (intensity is squared)
export const POWER_LOAD_FACTOR = 14; // explosive lifts: a little more per rep
// Accessories come in two kinds:
//  - hypertrophy / compound accessories (hip thrust, RDL, split squat, rows,
//    presses, pull-ups): 3x10 hip thrust with no % ~ 48% of 4x4 back squat @75%
//  - small-muscle isolation (tibialis, calf, soleus, hip flexor, ankle work):
//    kept low, 2x15 tibialis < 25% of 3x20 m flys @95%
export const ACCESSORY_WEIGHT = 0.4; // hypertrophy / compound accessory
export const ACCESSORY_REP_CAP = 12; // reps per set beyond 12 add no load
export const ACCESSORY_DEFAULT_PCT = 60; // assumed intensity with no %
export const ISOLATION_WEIGHT = 0.45;
export const ISOLATION_REP_CAP = 8;
export const ISOLATION_DEFAULT_PCT = 50;
const ISOLATION_KEYWORDS = [
  'tibialis', 'tib raise', 'calf', 'soleus', 'hip flexor', 'ankle', 'toe ', 'foot ',
  'adductor', 'abductor', 'band walk', 'monster walk', 'face pull', 'lateral raise',
  'bicep', 'tricep', 'wrist',
];
export const isIsolationAccessory = (drill) => {
  const title = String(drill?.title || drill?.name || '').toLowerCase();
  return ISOLATION_KEYWORDS.some((w) => title.includes(w));
};
export const ISO_LOAD_PER_SEC = 0.2; // isometrics: AU per second of hold at 100%
export const APPROACH_RUN_DEFAULT_M = 35; // LJ/TJ approach run with no distance entered
export const APPROACH_RUN_MULTIPLIER = 1.0; // rhythm runs are sub-maximal, below sprints (2.0)

// The % field is a real % of 1RM only when no BW / x BW unit is set.
const getPercent = (drill) => {
  const unit = drill?.intensityUnit || drill?.unit;
  if (unit === 'BW' || unit === 'x BW') return 0;
  return parseFloat(drill?.percentage) || 0;
};

const MAIN_LIFT_PATTERNS = [
  /\bsquat\b/,
  /deadlift/,
  /trap[\s-]?bar|hex[\s-]?bar/,
  /\bclean\b/,
  /\bbench\b/,
];

const NOT_MAIN_LIFT = [
  'split squat', 'bulgarian', 'lunge', 'step-up', 'step up', 'single-leg', 'single leg',
  'one-leg', '1-leg', 'unilateral', 'pistol', 'goblet', 'squat jump', 'jump squat',
  'overhead squat', 'zercher', 'romanian', 'rdl', 'stiff-leg', 'stiff leg', 'good morning',
  'incline', 'decline', 'dumbbell', 'db ', 'clean pull', 'high pull', 'isometric', 'iso ',
  'hold', 'calf', 'tibialis', 'hip flexor', 'hip thrust', 'nordic',
];

export const isMainLift = (drill) => {
  const title = String(drill?.title || drill?.name || '').toLowerCase();
  if (!title) return false;
  if (getPercent(drill) <= 0) return false;
  if (NOT_MAIN_LIFT.some((w) => title.includes(w))) return false;
  return MAIN_LIFT_PATTERNS.some((re) => re.test(title));
};

const isHoldBased = (drill) => {
  const type = String(drill?.type || '').toLowerCase();
  const unit = String(drill?.unit || '').toLowerCase();
  const reps = String(drill?.reps || '').toLowerCase();
  if (type === 'isometric_switch') return false; // rep-based quasi-iso switches
  return (
    type.startsWith('isometric') ||
    unit === 'sec' || unit === 'secs' || unit === 'seconds' || unit === 's' ||
    /\d\s*(s|sec|secs|seconds)\b/.test(reps)
  );
};

// Load of one gym exercise. Returns { load, cnsShare, kind }.
export const calculateGymDrillLoad = (drill) => {
  const type = String(drill?.type || '').toLowerCase();
  const title = String(drill?.title || '').toLowerCase();
  const baseType = type.split('_')[0];
  const sets = parseCount(drill?.sets) || 1;
  const reps = parseCount(drill?.reps) || 1;
  const pct = getPercent(drill);

  // Isometrics: total hold time x small factor, never seconds-as-reps.
  if (baseType === 'isometric' && isHoldBased(drill)) {
    const seconds = sets * reps;
    const intensity = (pct > 0 ? pct : 60) / 100;
    const overcoming = type === 'isometric_overcoming' || title.includes('overcoming') || title.includes('imtp');
    const factor = overcoming ? ISO_LOAD_PER_SEC * 2.5 : ISO_LOAD_PER_SEC;
    return { load: seconds * factor * intensity, cnsShare: overcoming ? 0.6 : 0.1, kind: 'isometric' };
  }

  if (isMainLift(drill)) {
    const intensitySq = Math.pow(pct / 100, 2);
    if (baseType === 'power' || title.includes('clean') || title.includes('snatch')) {
      return { load: sets * reps * intensitySq * POWER_LOAD_FACTOR, cnsShare: 0.9, kind: 'main' };
    }
    return {
      load: sets * reps * intensitySq * GYM_LOAD_FACTOR,
      cnsShare: pct >= 85 ? 0.8 : 0.5,
      kind: 'main',
    };
  }

  // Accessory (incl. rep-based isometric switches and power drills that are
  // not a main lift, e.g. jump squats, med-ball throws).
  const isolation = isIsolationAccessory(drill);
  const defaultPct = baseType === 'power' ? 60 : isolation ? ISOLATION_DEFAULT_PCT : ACCESSORY_DEFAULT_PCT;
  const accPct = pct > 0 ? pct : defaultPct;
  const effReps = Math.min(reps, isolation ? ISOLATION_REP_CAP : ACCESSORY_REP_CAP);
  const weight = isolation ? ISOLATION_WEIGHT : ACCESSORY_WEIGHT;
  const load = sets * effReps * Math.pow(accPct / 100, 2) * GYM_LOAD_FACTOR * weight;
  return { load, cnsShare: baseType === 'power' ? 0.5 : 0.15, kind: isolation ? 'isolation' : 'accessory' };
};

// ============================================================================
// Core & Low-Impact Accessory Detection Engine
// Identifies Core, Trunk, Pillar, Anti-Rotation/Extension, and Mobility exercises.
// Scientifically, these exercises have ZERO systemic CNS fatigue and minimal mechanical strain.
// ============================================================================
export const isCoreOrAccessory = (exercise) => {
  if (!exercise) return false;

  const type = String(exercise.type || '').toLowerCase();
  const category = String(exercise.category || '').toLowerCase();
  const subCategory = String(exercise.subCategory || '').toLowerCase();
  const title = String(exercise.title || exercise.name || '').toLowerCase();

  // Category & Type keywords
  const categoryKeywords = [
    'core',
    'trunk',
    'abs',
    'abdominal',
    'pillar',
    'anti-rotation',
    'anti_rotation',
    'anti-extension',
    'anti_extension',
    'mobility',
    'warmup',
    'warm-up',
    'activation',
    'recovery'
  ];

  for (const kw of categoryKeywords) {
    if (type.includes(kw) || category.includes(kw) || subCategory.includes(kw)) {
      return true;
    }
  }

  // Name / Title keywords
  const nameKeywords = [
    'plank',
    'deadbug',
    'dead bug',
    'pallof',
    'bird dog',
    'birddog',
    'crunch',
    'sit-up',
    'sit up',
    'russian twist',
    'leg raise',
    'knee raise',
    'hollow',
    'copenhagen',
    'back extension hold',
    'ab wheel',
    'rollout',
    'carry',
    'suitcase',
    'core'
  ];

  for (const kw of nameKeywords) {
    if (title.includes(kw)) {
      return true;
    }
  }

  return false;
};

// ============================================================================
// Sprint Distance Categorization & Session Volume Tracking
// - Acceleration: 10m - 30m (Optimal Session Cap: 300m)
// - Max Velocity / Flys: 31m - 60m (Session Cap: 150m — Haugen et al. 2019: 50–150 m)
// - Speed Endurance: 61m - 300m
// - Tempo: Extensive & Intensive
// ============================================================================
export const classifySprintDistance = (drill) => {
  if (isCoreOrAccessory(drill)) return 'other';

  // Older entries without a distance but with unit "meters" kept the meters in reps.
  const dist =
    parseFloat(drill?.distance) ||
    (drill?.unit === 'meters' ? parseFloat(String(drill?.reps || '').replace(/[^\d.]/g, '')) || 0 : 0);
  const type = (drill?.type || '').toLowerCase();
  const title = (drill?.title || '').toLowerCase();
  const intensity = parseFloat(drill?.percentage) || 0;

  if (type === 'tempo_extensive' || type === 'tempo_intensive' || type.startsWith('tempo') || title.includes('tempo')) {
    return 'tempo';
  }
  if (type === 'speed_acceleration' || (dist >= 5 && dist <= 30 && intensity >= 85) || title.includes('accel') || title.includes('block start')) {
    return 'accel';
  }
  if (type === 'speed_max_velocity' || (dist > 30 && dist <= 60 && intensity >= 90) || title.includes('fly') || title.includes('max vel')) {
    return 'maxVel';
  }
  if (type === 'speed_endurance' || (dist > 60 && dist <= 300 && intensity >= 80) || title.includes('endurance') || title.includes('special')) {
    return 'speedEndurance';
  }
  if (dist > 0) {
    if (dist <= 30) return 'accel';
    if (dist <= 60) return 'maxVel';
    return 'speedEndurance';
  }
  return 'other';
};

// ============================================================================
// Plyometric Ground Contact & SSC Type Classification
// - Fast SSC (<250ms): Hurdle Hops, Drop Jumps, Depth Jumps, Pogos, Bounds
// - Slow SSC (>250ms): Box Jumps, Countermovement Jumps, Broad Jumps, Tuck Jumps
// ============================================================================
export const classifyPlyoContacts = (drill) => {
  if (isCoreOrAccessory(drill)) {
    return {
      contacts: 0,
      isFastSSC: false,
      category: 'Core / Stability (No Impact)'
    };
  }

  const type = (drill?.type || '').toLowerCase();
  const title = (drill?.title || '').toLowerCase();
  const details = (drill?.details || '').toLowerCase();
  const sscType = drill?.sscType || '';

  const s = parseCount(drill?.sets) || 1;
  let r = parseCount(drill?.reps);
  if (r === 0) r = parseCount(drill?.distance) || 1;

  // Unilateral multiplier
  const isUnilateral = title.includes('single') || title.includes('1-leg') || title.includes('unilateral') || details.includes('each leg');
  const contacts = Math.round(s * r * (isUnilateral ? 2 : 1));

  let isFastSSC = false;
  if (sscType.includes('Fast') || type === 'plyo_fast_ssc') {
    isFastSSC = true;
  } else if (
    title.includes('depth') ||
    title.includes('drop jump') ||
    title.includes('hurdle hop') ||
    title.includes('pogo') ||
    title.includes('bound') ||
    title.includes('reactive') ||
    title.includes('continuous') ||
    title.includes('triple jump') ||
    type === 'triple_jump'
  ) {
    isFastSSC = true;
  }

  return {
    contacts,
    isFastSSC,
    category: isFastSSC ? 'Fast-SSC (<250ms)' : 'Slow-SSC (>250ms)'
  };
};
// ============================================================================
// Session evaluation
// Splits the day into TRACK load (sprints, tempo, runs, plyos, jumps) and GYM
// load (strength, power, isometrics, accessories). Core / mobility / warm-up
// stay ~0 (max 2.5 AU per session, counted with gym).
// Also returns CNS / mechanical / metabolic loads, sprint volume by zone and
// plyo contacts.
// ============================================================================

// CNS cost per meter for sprint zones, applied as meters x (intensity/100)^2 x
// cost. Max velocity is the most neurally demanding per meter (highest
// contraction speed); resisted sprints and accelerations are slower and more
// force-dominant. Speed endurance and tempo keep the load x CNS-share split.
export const SPRINT_CNS_PER_METER = {
  maxVel: 2.6, // flys, wickets, assisted / overspeed
  resisted: 1.6, // sleds, hills
  accel: 1.5, // 10-30 m accelerations, block starts
};
export const getSprintCnsPerMeter = (type = '', sprintCategory = '') => {
  const t = String(type || '').toLowerCase();
  if (t === 'speed_max_velocity' || t === 'speed_assisted') return SPRINT_CNS_PER_METER.maxVel;
  if (t === 'speed_resisted') return SPRINT_CNS_PER_METER.resisted;
  if (t === 'speed_acceleration') return SPRINT_CNS_PER_METER.accel;
  if (!t.startsWith('speed') || t === 'speed_endurance') return null;
  if (sprintCategory === 'maxVel') return SPRINT_CNS_PER_METER.maxVel;
  if (sprintCategory === 'accel') return SPRINT_CNS_PER_METER.accel;
  return null;
};

// CNS score (0-100) = summed CNS load of one session / CNS_SCORE_DIVISOR.
// Calibrated so a normal high day (sled + accelerations + plyos + heavy squat)
// lands around 70-85 and 100 needs roughly 1.2x that; only extreme days cap.
export const CNS_SCORE_DIVISOR = 520;
export const CNS_HIGH_SCORE = 50;
export const CNS_MED_SCORE = 25;

const getIntensity = (drill, type) => {
  const unit = drill?.intensityUnit || drill?.unit;
  const pct = unit === 'BW' || unit === 'x BW' ? 0 : parseFloat(drill?.percentage) || 0;
  return pct > 0 ? pct : getDefaultIntensity(type);
};

export const calculateSessionBiometrics = (drills = [], athlete = null) => {
  let accelMeters = 0;
  let maxVelMeters = 0;
  let speedEnduranceMeters = 0;
  let tempoMeters = 0;
  let totalSprintMeters = 0;

  let fastSscContacts = 0;
  let slowSscContacts = 0;
  let totalContacts = 0;

  let cnsLoadSum = 0;
  let mechanicalLoadSum = 0;
  let metabolicLoadSum = 0;
  let trackLoad = 0;
  let gymLoad = 0;
  let mainLiftLoad = 0;
  let accessoryLoad = 0;
  let coreSessionLoad = 0;

  (drills || []).forEach((drill) => {
    if (!drill) return;

    // 0. Core / mobility / warm-up: ~0, capped at 2.5 AU per session.
    if (isCoreOrAccessory(drill)) {
      const s = parseCount(drill.sets) || 1;
      const r = parseCount(drill.reps) || 1;
      coreSessionLoad = Math.min(2.5, coreSessionLoad + Math.min(0.5, s * r * 0.01));
      return;
    }

    const type = (drill.type || 'speed').toLowerCase();
    const intensity = getIntensity(drill, type);
    const s = parseCount(drill.sets) || 1;
    const r = parseCount(drill.reps) || 1;
    const dist = parseCount(drill.distance);

    const baseType = type.split('_')[0];
    const approachRun = isApproachRun(drill);
    const isRunning = isRunningCategory(baseType) || approachRun;
    const isPlyo = !approachRun && (baseType === 'plyometrics' || type.startsWith('plyo') || drill.unit === 'contacts');
    const isJump = !approachRun && (baseType === 'long' || baseType === 'triple' || type.includes('jump'));
    const isGym = baseType === 'strength' || baseType === 'power' || baseType === 'isometric';

    // 1. Running: meters x (intensity/100)^2 x type multiplier
    if (isRunning) {
      // Meters per rep come from the distance field. Older entries saved
      // without a distance but with unit "meters" stored the meters in reps.
      let volumeMeters = 0;
      if (dist > 0) volumeMeters = s * r * dist;
      else if (drill.unit === 'meters') volumeMeters = s * r;
      else if (approachRun) volumeMeters = s * r * APPROACH_RUN_DEFAULT_M;

      const sprintCategory = approachRun ? 'approach' : classifySprintDistance(drill);
      if (sprintCategory === 'accel') {
        accelMeters += volumeMeters;
        totalSprintMeters += volumeMeters;
      } else if (sprintCategory === 'maxVel') {
        maxVelMeters += volumeMeters;
        totalSprintMeters += volumeMeters;
      } else if (sprintCategory === 'speedEndurance') {
        speedEnduranceMeters += volumeMeters;
        totalSprintMeters += volumeMeters;
      } else if (sprintCategory === 'tempo') {
        tempoMeters += volumeMeters;
      }

      const profile = getRunningLoadProfile(type, intensity);
      const multiplier = approachRun ? APPROACH_RUN_MULTIPLIER : profile.multiplier;
      const drillLoad = volumeMeters * Math.pow(intensity / 100, 2) * multiplier;
      trackLoad += drillLoad;

      // Sprint zones carry their own CNS cost per meter (max velocity highest);
      // other running keeps the load x CNS-share split.
      const cnsPerMeter = approachRun ? null : getSprintCnsPerMeter(type, sprintCategory);
      cnsLoadSum += cnsPerMeter !== null
        ? volumeMeters * Math.pow(intensity / 100, 2) * cnsPerMeter
        : drillLoad * profile.cnsShare;
      mechanicalLoadSum += drillLoad * (1 - profile.cnsShare) * 0.7;
      metabolicLoadSum += drillLoad * (1 - profile.cnsShare) * 0.3;
    }
    // 2. Plyometrics & jumps: contacts-based
    else if (isPlyo || isJump) {
      const { contacts, isFastSSC } = classifyPlyoContacts(drill);
      totalContacts += contacts;
      if (isFastSSC) fastSscContacts += contacts;
      else slowSscContacts += contacts;

      const impactFactor = isFastSSC || isJump ? 5.5 : 3.5;
      const plyoLoad = contacts * (intensity / 100) * impactFactor;
      trackLoad += plyoLoad;

      const cnsWeight = isFastSSC || isJump ? 0.8 : 0.5;
      cnsLoadSum += plyoLoad * cnsWeight;
      mechanicalLoadSum += plyoLoad * 0.9;
      metabolicLoadSum += plyoLoad * 0.1;
    }
    // 3. Gym: strength, power, isometrics
    else if (isGym) {
      const { load, cnsShare, kind } = calculateGymDrillLoad(drill);
      gymLoad += load;
      if (kind === 'main') mainLiftLoad += load;
      else accessoryLoad += load;

      cnsLoadSum += load * cnsShare;
      mechanicalLoadSum += load * 0.85;
      metabolicLoadSum += load * 0.3;
    }
    // 4. Anything else ("physical", unknown types): light accessory
    else {
      const load = Math.min(s * r, s * ACCESSORY_REP_CAP) * 0.4 * (intensity / 100) * 2;
      gymLoad += load;
      accessoryLoad += load;
      mechanicalLoadSum += load * 0.2;
      metabolicLoadSum += load * 0.8;
    }
  });

  gymLoad += coreSessionLoad;
  metabolicLoadSum += coreSessionLoad;

  const trackRounded = Math.round(trackLoad);
  const gymRounded = Math.round(gymLoad);
  const totalVolumeScore = trackRounded + gymRounded;

  const cnsScore = Math.min(100, Math.round((cnsLoadSum / CNS_SCORE_DIVISOR) * 100));

  let cnsLevel = 'Rest';
  if (totalVolumeScore > 0 || coreSessionLoad > 0) {
    if (cnsScore >= CNS_HIGH_SCORE || (totalSprintMeters >= 150 && maxVelMeters >= 60)) {
      cnsLevel = 'High';
    } else if (cnsScore >= CNS_MED_SCORE) {
      cnsLevel = 'Med';
    } else {
      cnsLevel = 'Low';
    }
  }

  const accelAlert = accelMeters > 300;
  const maxVelAlert = maxVelMeters > 150;
  const plyoAlert = fastSscContacts > 80 || totalContacts > 100;

  return {
    totalVolumeScore,
    trackLoad: trackRounded,
    gymLoad: gymRounded,
    mainLiftLoad: Math.round(mainLiftLoad),
    accessoryLoad: Math.round(accessoryLoad),
    cnsLoad: Math.round(cnsLoadSum),
    cnsScore,
    cnsLevel,
    mechanicalLoad: Math.round(mechanicalLoadSum),
    metabolicLoad: Math.round(metabolicLoadSum),
    // Sprints
    accelMeters,
    maxVelMeters,
    speedEnduranceMeters,
    tempoMeters,
    totalSprintMeters,
    accelAlert,
    maxVelAlert,
    // Plyometrics
    fastSscContacts,
    slowSscContacts,
    totalContacts,
    plyoAlert
  };
};

// ============================================================================
// Week label relative to the athlete's own history (acute:chronic ratio).
// acute   = this week's total load
// chronic = mean of the previous weeks that have training (up to 4)
// < 0.8 low / deload, 0.8-1.3 normal, 1.3-1.5 high, > 1.5 spike (warning).
// Fewer than 3 weeks of history -> "Building baseline" (no label).
// ============================================================================
export const ACWR_MIN_HISTORY_WEEKS = 3;

export const getWeekLoadStatus = (currentLoad = 0, previousWeekLoads = []) => {
  // null / undefined = a week with no saved exercises (not history).
  const history = (previousWeekLoads || [])
    .slice(-4)
    .filter((v) => v !== null && v !== undefined && v !== '')
    .map((v) => parseFloat(v) || 0)
    .filter((v) => v > 0);
  const weeksOfHistory = history.length;

  if (weeksOfHistory < ACWR_MIN_HISTORY_WEEKS) {
    return {
      status: 'baseline',
      label: 'Building baseline',
      ratio: null,
      chronic: weeksOfHistory > 0 ? Math.round(history.reduce((a, b) => a + b, 0) / weeksOfHistory) : null,
      weeksOfHistory,
      isWarning: false,
    };
  }

  const chronic = history.reduce((a, b) => a + b, 0) / weeksOfHistory;
  const ratio = chronic > 0 ? currentLoad / chronic : 0;
  let status = 'normal';
  let label = 'Normal';
  if (ratio < 0.8) {
    status = 'low';
    label = 'Low / Deload';
  } else if (ratio > 1.5) {
    status = 'spike';
    label = 'Spike';
  } else if (ratio > 1.3) {
    status = 'high';
    label = 'High';
  }

  return {
    status,
    label,
    ratio: Math.round(ratio * 100) / 100,
    chronic: Math.round(chronic),
    weeksOfHistory,
    isWarning: status === 'spike',
  };
};

// Sum a week of { drills } rows (or arrays of drills) into track / gym / total.
export const calculateWeekLoad = (days = [], athlete = null) => {
  let track = 0;
  let gym = 0;
  (days || []).forEach((drills) => {
    const bio = calculateSessionBiometrics(drills || [], athlete);
    track += bio.trackLoad;
    gym += bio.gymLoad;
  });
  return { track, gym, total: track + gym };
};

// ============================================================================
// Charlie Francis High/Low Periodization Pattern Validator
// Checks if two consecutive training days both exceed High-CNS thresholds.
// ============================================================================
export const checkHighLowCNSPattern = (schedule = {}, athlete = null) => {
  const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const dayBiometrics = days.map((day) => {
    const drills = schedule[day] || [];
    const bio = calculateSessionBiometrics(drills, athlete);
    return { day, bio };
  });

  const consecutiveHighDays = [];

  for (let i = 0; i < dayBiometrics.length - 1; i++) {
    const curr = dayBiometrics[i];
    const next = dayBiometrics[i + 1];

    if (curr.bio.cnsLevel === 'High' && next.bio.cnsLevel === 'High') {
      consecutiveHighDays.push({
        dayA: curr.day,
        dayB: next.day,
        scoreA: curr.bio.cnsScore,
        scoreB: next.bio.cnsScore
      });
    }
  }

  const hasConsecutiveHighCNS = consecutiveHighDays.length > 0;
  return {
    hasConsecutiveHighCNS,
    consecutiveHighDays,
    warning: hasConsecutiveHighCNS
      ? `High-CNS Back-to-Back Warning: High neural stress detected on consecutive days (${consecutiveHighDays.map(p => `${p.dayA} & ${p.dayB}`).join(', ')}). Charlie Francis High/Low periodization recommends alternating High-CNS sessions with Low-CNS Tempo / Active Recovery to avoid central nervous system fatigue and hamstring/tendon injury.`
      : null
  };
};

// ============================================================================
// Athlete Neuro-Mechanical Profiling Engine
// Evaluates Force-Velocity Profile, Eccentric Utilization Ratio (EUR = CMJ / SJ),
// Relative Strength (Squat / BW), and Reactive Strength Index (RSI).
// ============================================================================
export const calculateNeuroMechanicalProfile = (athlete) => {
  if (!athlete) return null;

  // The profile form edits "verticalJump"; "cmj" could keep an old value,
  // so the visible field wins.
  const cmj = parseFloat(athlete?.verticalJump || athlete?.cmj) || 0;
  const sj = parseFloat(athlete?.squatJump) || 0;
  const bw = parseFloat(athlete?.weight) || 75;
  const squat = parseFloat(athlete?.fullSquat) || 0;
  const m10 = parseFloat(athlete?.accel10m) || 0;
  const rsi = parseFloat(athlete?.rsi) || 0;

  const eur = sj > 0 && cmj > 0 ? parseFloat((cmj / sj).toFixed(2)) : null;
  const relativeStrength = bw > 0 && squat > 0 ? parseFloat((squat / bw).toFixed(2)) : null;

  let profileType = 'Balanced & Elastic';
  let badgeColor = 'emerald';
  let title = 'Balanced Athlete Profile';
  let diagnosis = 'Optimal balance between concentric power output and stretch-shortening cycle elasticity.';
  let prescription = 'Maintain high-low structure with equal emphasis on maximal force and high-speed reactivity.';

  if (eur !== null && eur < 1.05) {
    profileType = 'Elastic-Deficit';
    badgeColor = 'rose';
    title = 'Elastic / Reactive Deficit (EUR < 1.05)';
    diagnosis = `CMJ (${cmj}cm) is nearly identical or inferior to Squat Jump (${sj}cm), indicating poor stretch-shortening cycle (SSC) elastic energy storage and low tendon stiffness.`;
    prescription = 'Prioritize Fast-SSC plyometrics (<250ms), depth jumps (30-45cm), ankle stiffness isometrics, and sprint bounds.';
  } else if (eur !== null && eur > 1.22) {
    profileType = 'Force-Deficit';
    badgeColor = 'amber';
    title = 'Force / Concentric Deficit (EUR > 1.22)';
    diagnosis = `High elasticity (CMJ/SJ ratio: ${eur}), but low baseline concentric force development. The athlete rebounds well but lacks raw ground force production.`;
    prescription = 'Prioritize Heavy Strength (>85% 1RM), Heavy Sled Sprints (50% Vdec), and Overcoming Isometrics (IMTP).';
  } else if (relativeStrength !== null && relativeStrength < 1.6) {
    profileType = 'Force-Deficit';
    badgeColor = 'amber';
    title = `Force Deficit (Squat/BW: ${relativeStrength}x)`;
    diagnosis = `Relative squat strength is below the elite track sprinter threshold (1.8x - 2.2x bodyweight).`;
    prescription = 'Develop maximal force base with heavy squats, trap bar deadlifts, and hip extension overloads.';
  } else if (relativeStrength !== null && relativeStrength >= 2.0 && m10 > 1.75) {
    profileType = 'Velocity-Deficit';
    badgeColor = 'sky';
    title = 'Velocity / RFD Deficit';
    diagnosis = `Excellent maximal strength (${relativeStrength}x BW), but slow 10m acceleration (${m10}s), meaning force cannot be applied rapidly enough within the 100ms stance phase.`;
    prescription = 'Cease heavy grinding. Emphasize light resisted sprints (10% Vdec), VBT Speed-Strength (1.0-1.3 m/s), and explosive starts.';
  }

  return {
    eur,
    relativeStrength,
    rsi: rsi > 0 ? rsi : null,
    profileType,
    badgeColor,
    title,
    diagnosis,
    prescription
  };
};

// ============================================================================
// Mixed-distance sessions: per-segment intensities so each distance gets its
// own target time. Keyed by drill title (titles persist when a library drill
// is dropped into a week; ids do not).
// ============================================================================
export const PACE_SEGMENTS = {
  'Intensive Tempo Pyramid: 100-150-200-150-100m': [
    { dist: 100, pct: 82 }, { dist: 150, pct: 84 }, { dist: 200, pct: 80 },
  ],
  'Intensive Tempo Ascending Ladder: 100-150-200-250m': [
    { dist: 100, pct: 84 }, { dist: 150, pct: 82 }, { dist: 200, pct: 80 }, { dist: 250, pct: 79 },
  ],
  'Intensive Tempo Double Wave: 2x(100m-150m-150m)': [
    { dist: 100, pct: 84 }, { dist: 150, pct: 82 },
  ],
  'Intensive Tempo Combo: 2x250m + 2x150m': [
    { dist: 250, pct: 80 }, { dist: 150, pct: 84 },
  ],
};

export const SEGMENT_STRUCTURE = {
  'Intensive Tempo Pyramid: 100-150-200-150-100m': '100-150-200-150-100m',
  'Intensive Tempo Ascending Ladder: 100-150-200-250m': '100-150-200-250m',
  'Intensive Tempo Double Wave: 2x(100m-150m-150m)': '2x(100-150-150m)',
  'Intensive Tempo Combo: 2x250m + 2x150m': '2x250m + 2x150m',
};
