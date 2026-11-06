// Prints a per-exercise load table (track / gym) for the sample week.
// Pure calculation, no database. Run:  npm run loads:sample
import { calculateSessionBiometrics, calculateGymDrillLoad, isCoreOrAccessory } from '../src/data/loadModel.js';
import { SAMPLE_WEEK } from '../src/data/__fixtures__/sampleWeek.js';

const kindOf = (drill, bio) => {
  if (isCoreOrAccessory(drill)) return 'core';
  const base = String(drill.type || '').split('_')[0];
  if (['strength', 'power', 'isometric'].includes(base)) return calculateGymDrillLoad(drill).kind;
  if (bio.totalContacts > 0) return 'contacts';
  return 'run';
};

const rx = (d) => {
  const parts = [d.sets, d.reps].filter(Boolean).join('x');
  const dist = d.distance ? `x${d.distance} m` : d.unit === 'sec' ? ' s' : '';
  const pct = d.percentage ? ` @${d.percentage}%` : '';
  return `${parts}${dist}${pct}`;
};

const rows = [];
let weekTrack = 0;
let weekGym = 0;
for (const [day, drills] of Object.entries(SAMPLE_WEEK)) {
  if (!drills.length) {
    rows.push(`| ${day} | Rest | | | | | |`);
    continue;
  }
  for (const d of drills) {
    const bio = calculateSessionBiometrics([d]);
    rows.push(`| ${day} | ${d.title} | ${rx(d)} | ${kindOf(d, bio)} | ${bio.trackLoad || ''} | ${bio.gymLoad || ''} | ${bio.cnsLoad} |`);
  }
  const dayBio = calculateSessionBiometrics(drills);
  weekTrack += dayBio.trackLoad;
  weekGym += dayBio.gymLoad;
  rows.push(`| **${day} total** | | | | **${dayBio.trackLoad}** | **${dayBio.gymLoad}** | CNS ${dayBio.cnsLevel} ${dayBio.cnsScore} |`);
}
const total = weekTrack + weekGym;
console.log('| Day | Exercise | Prescription | Counted as | Track AU | Gym AU | CNS-AU |');
console.log('|---|---|---|---|---|---|---|');
rows.forEach((r) => console.log(r));
console.log(`\nWeek: track ${weekTrack}, gym ${weekGym}, total ${total} (gym ${Math.round((weekGym / total) * 100)}%)`);
