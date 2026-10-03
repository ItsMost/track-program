// ============================================================================
// Shared running workload model
// Load (AU) = totalMeters * (intensity/100)^2 * multiplier
// cnsShare = fraction of the load attributed to CNS fatigue (rest = structural)
// ============================================================================

export const getRunningLoadProfile = (type = '', intensityPct = 0) => {
  const t = (type || '').toLowerCase();
  // Default CNS split by intensity (used for every non-tempo running type)
  const intensitySplit = intensityPct > 85 ? 0.85 : intensityPct > 75 ? 0.60 : 0.15;

  // Tempo — fixed physiological splits
  if (t === 'tempo_extensive') return { multiplier: 0.18, cnsShare: 0.10 };
  if (t === 'tempo_intensive') return { multiplier: 0.50, cnsShare: 0.35 };
  if (t.startsWith('tempo')) return { multiplier: 0.25, cnsShare: 0.15 };

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
