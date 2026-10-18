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
// Sprint Distance Categorization & Session Volume Tracking
// - Acceleration: 10m - 30m (Optimal Session Cap: 300m)
// - Max Velocity / Flys: 31m - 60m (Optimal Session Cap: 250m)
// - Speed Endurance: 61m - 300m
// - Tempo: Extensive & Intensive
// ============================================================================
export const classifySprintDistance = (drill) => {
  const dist = parseFloat(drill?.distance) || 0;
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
  const type = (drill?.type || '').toLowerCase();
  const title = (drill?.title || '').toLowerCase();
  const details = (drill?.details || '').toLowerCase();
  const sscType = drill?.sscType || '';

  let s = parseFloat(String(drill?.sets || '').replace(/[^\d.]/g, '')) || 1;
  let r = parseFloat(String(drill?.reps || '').replace(/[^\d.]/g, '')) || 0;
  if (r === 0) r = parseFloat(String(drill?.distance || '').replace(/[^\d.]/g, '')) || 1;

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
// Multi-System Sports Science Session Evaluation
// Calculates CNS / Neural Load, Mechanical / Tendon Load, Metabolic Strain,
// Sprint Volume Breakdown, and Plyo Contacts.
// ============================================================================
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
  let totalVolumeScore = 0;

  drills.forEach((drill) => {
    const type = (drill.type || 'speed').toLowerCase();
    const title = (drill.title || '').toLowerCase();
    const intensity = parseFloat(drill.percentage) || 75;

    let s = parseFloat(String(drill.sets || '').replace(/[^\d.]/g, '')) || 1;
    let r = parseFloat(String(drill.reps || '').replace(/[^\d.]/g, '')) || 1;
    let dist = parseFloat(String(drill.distance || '').replace(/[^\d.]/g, '')) || 0;

    const baseType = type.split('_')[0];
    const isRunning = isRunningCategory(baseType);
    const isPlyo = baseType === 'plyometrics' || type.startsWith('plyo') || drill.unit === 'contacts';
    const isJump = baseType === 'long' || baseType === 'triple' || type.includes('jump');

    // 1. Running classification
    if (isRunning) {
      const volumeMeters = s * r * (dist > 0 ? dist : 10);
      const sprintCategory = classifySprintDistance(drill);

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

      const { multiplier, cnsShare } = getRunningLoadProfile(type, intensity);
      const drillLoad = volumeMeters * Math.pow(intensity / 100, 2) * multiplier;
      totalVolumeScore += drillLoad;

      cnsLoadSum += drillLoad * cnsShare;
      mechanicalLoadSum += drillLoad * (1 - cnsShare) * 0.7;
      metabolicLoadSum += drillLoad * (1 - cnsShare) * 0.3;
    }
    // 2. Plyometrics & Jumps
    else if (isPlyo || isJump) {
      const { contacts, isFastSSC } = classifyPlyoContacts(drill);
      totalContacts += contacts;
      if (isFastSSC) {
        fastSscContacts += contacts;
      } else {
        slowSscContacts += contacts;
      }

      // Fast SSC and horizontal jump takeoffs place enormous neural and tendon impact
      const impactFactor = isFastSSC || isJump ? 5.5 : 3.5;
      const intensityFactor = intensity / 100;
      const plyoLoad = contacts * intensityFactor * impactFactor;
      totalVolumeScore += plyoLoad;

      const cnsWeight = isFastSSC || isJump ? 0.80 : 0.50;
      cnsLoadSum += plyoLoad * cnsWeight;
      mechanicalLoadSum += plyoLoad * 0.90; // High tendon/mechanical strain
      metabolicLoadSum += plyoLoad * 0.10;
    }
    // 3. Power (Gym - Olympic lifts, Jump Squats, VBT)
    else if (baseType === 'power') {
      const repsTotal = s * r;
      const intensityFactor = intensity / 100;
      const powerLoad = repsTotal * 2.2 * intensityFactor * 10;
      totalVolumeScore += powerLoad;

      cnsLoadSum += powerLoad * 0.95; // 95% CNS neural recruitment
      mechanicalLoadSum += powerLoad * 0.45;
      metabolicLoadSum += powerLoad * 0.15;
    }
    // 4. Strength (Gym) & Isometrics
    else if (baseType === 'strength' || baseType === 'isometric') {
      const repsTotal = s * r;
      const intensityFactor = intensity / 100;
      const isHeavy = intensity >= 85 || title.includes('overcoming') || title.includes('imtp');
      const strengthLoad = repsTotal * 1.6 * intensityFactor * 10;
      totalVolumeScore += strengthLoad;

      cnsLoadSum += isHeavy ? strengthLoad * 0.85 : strengthLoad * 0.35;
      mechanicalLoadSum += strengthLoad * 0.85;
      metabolicLoadSum += strengthLoad * 0.40;
    }
    // 5. Core & Mobility
    else {
      const repsTotal = s * r;
      const load = repsTotal * 0.8 * (intensity / 100) * 5;
      totalVolumeScore += load;
      mechanicalLoadSum += load * 0.5;
      metabolicLoadSum += load * 0.5;
    }
  });

  // Calculate normalized CNS Score (0-100)
  // 100 represents max Olympic/sprint neural capacity
  const cnsScore = Math.min(100, Math.round((cnsLoadSum / 1800) * 100));

  let cnsLevel = 'Rest';
  if (totalVolumeScore > 0) {
    if (cnsScore >= 70 || (totalSprintMeters >= 150 && maxVelMeters >= 60)) {
      cnsLevel = 'High';
    } else if (cnsScore >= 35) {
      cnsLevel = 'Med';
    } else {
      cnsLevel = 'Low';
    }
  }

  // Volume Session Alert Flags
  const accelAlert = accelMeters > 300;
  const maxVelAlert = maxVelMeters > 250;
  const plyoAlert = fastSscContacts > 80 || totalContacts > 100;

  return {
    totalVolumeScore: Math.round(totalVolumeScore),
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

  const cmj = parseFloat(athlete?.cmj || athlete?.verticalJump) || 0;
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
