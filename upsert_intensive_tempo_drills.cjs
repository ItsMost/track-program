const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://koakdlbwsjekmtiunfhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvYWtkbGJ3c2pla210aXVuZmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNDEyNDUsImV4cCI6MjA4OTcxNzI0NX0.ZTXsET8hhtIebRmXiv1fHELmReGjVJlrq7HdlO9uWMI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const intensiveTempoDrills = [
  // Category A: Turn & Straight Specifics (Turn & Straight Transition)
  {
    id: 'itmp1',
    title: 'Intensive Tempo: 2x(3x150m) Turn & Straight',
    details: '[A · Turn & Straight] 2 sets of 3x150m @ 80-82% Vmax. Target 20.5-21.5s. Rest 2.5 min between reps, 6 min between sets. Total 900m. Cues: enter curve at 80%, smooth transition into straightaway, relaxed shoulder posture.',
    type: 'tempo_intensive',
    percentage: 81,
    sets: '2',
    reps: '3',
    distance: '150',
    rest: '2.5m / 6m',
    unit: 'meters'
  },
  {
    id: 'itmp2',
    title: 'Intensive Tempo: 5x150m (70m Curve + 80m Straight)',
    details: '[A · Turn & Straight] 5x150m @ 82-84% Vmax. Target 20.0-21.0s. Rest 3 min active walk. Total 750m. Cues: controlled acceleration through curve, maintain tall upright posture on the straight.',
    type: 'tempo_intensive',
    percentage: 83,
    sets: '1',
    reps: '5',
    distance: '150',
    rest: '3m walk',
    unit: 'meters'
  },
  {
    id: 'itmp3',
    title: 'Intensive Tempo: 4x200m Rhythm',
    details: '[A · Turn & Straight] 4x200m @ 80% Vmax. Target 28.0-29.0s. Rest 3.5 min full walk. Total 800m. Cues: maintain consistent stride length, stay relaxed under accumulating fatigue.',
    type: 'tempo_intensive',
    percentage: 80,
    sets: '1',
    reps: '4',
    distance: '200',
    rest: '3.5m walk',
    unit: 'meters'
  },

  // Category B: Pyramid & Step Models (Volume & Rhythm Control)
  {
    id: 'itmp4',
    title: 'Intensive Tempo Pyramid: 100-150-200-150-100m',
    details: '[B · Pyramid] 100m @ 82%, 150m @ 84%, 200m @ 80%, 150m @ 84%, 100m @ 82%. Rest 2 min after 100m, 3 min after 150m, 4 min after 200m. Total 700m. Cues: adjust cadence dynamically; ensure full recovery between escalating distances.',
    type: 'tempo_intensive',
    percentage: 82,
    sets: '1',
    reps: '1',
    distance: '700',
    rest: '2m / 3m / 4m',
    unit: 'meters'
  },
  {
    id: 'itmp5',
    title: 'Intensive Tempo Ascending Ladder: 100-150-200-250m',
    details: '[B · Ladder] 100m @ 84% graduating down to 78-80% on 250m. Rest 2 min after 100m, 3 min after 150m, 4 min after 200m. Total 700m. Cues: start fast and smooth, focus on breathing and a low-tension finish on the 250m.',
    type: 'tempo_intensive',
    percentage: 81,
    sets: '1',
    reps: '1',
    distance: '700',
    rest: '2m / 3m / 4m',
    unit: 'meters'
  },
  {
    id: 'itmp6',
    title: 'Intensive Tempo Double Wave: 2x(100m-150m-150m)',
    details: '[B · Double Wave] 2 sets of (1x100m + 2x150m) @ 82-84% Vmax. Rest 2 min between reps, 5 min between sets. Total 800m. Cues: maintain vertical stiffness and rhythm across both waves.',
    type: 'tempo_intensive',
    percentage: 83,
    sets: '1',
    reps: '1',
    distance: '800',
    rest: '2m / 5m',
    unit: 'meters'
  },

  // Category C: Cluster Sets (High Cadence / Neural Retention)
  {
    id: 'itmp7',
    title: 'Intensive Tempo Clusters: 2x(3x100m)',
    details: '[C · Clusters] 2 sets of 3x100m @ 83-85% Vmax. Target 13.0-13.5s. Rest 90s incomplete between reps, 5 min between sets. Total 600m. Cues: high-frequency turnover, short contact time, clean arm action.',
    type: 'tempo_intensive',
    percentage: 84,
    sets: '2',
    reps: '3',
    distance: '100',
    rest: '90s / 5m',
    unit: 'meters'
  },
  {
    id: 'itmp8',
    title: 'Intensive Tempo Clusters: 2x(4x100m)',
    details: '[C · Clusters] 2 sets of 4x100m @ 82-84% Vmax. Rest 2 min between reps, 5 min between sets. Total 800m. Cues: upright torso, relaxed jaw and facial muscles, linear mechanics.',
    type: 'tempo_intensive',
    percentage: 83,
    sets: '2',
    reps: '4',
    distance: '100',
    rest: '2m / 5m',
    unit: 'meters'
  },
  {
    id: 'itmp9',
    title: 'Intensive Tempo Micro-Clusters: 3x(2x100m)',
    details: '[C · Micro-Clusters] 3 sets of 2x100m @ 85% Vmax. Rest 60s intra-set, 4 min between sets. Total 600m. Cues: fast cadence, minimal ground deceleration, crisp mechanics.',
    type: 'tempo_intensive',
    percentage: 85,
    sets: '3',
    reps: '2',
    distance: '100',
    rest: '60s / 4m',
    unit: 'meters'
  },

  // Category D: Rhythm & Capacity Work (200m Specific Capacity)
  {
    id: 'itmp10',
    title: 'Intensive Tempo: 3x250m Extended Rhythm',
    details: '[D · 200m Capacity] 3x250m @ 78-80% Vmax. Rest 4 min active walking recovery. Total 750m. Cues: pacing management, avoid pressing in the final 50m, smooth mechanics.',
    type: 'tempo_intensive',
    percentage: 79,
    sets: '1',
    reps: '3',
    distance: '250',
    rest: '4m walk',
    unit: 'meters'
  },
  {
    id: 'itmp11',
    title: 'Intensive Tempo: 2x(2x200m)',
    details: '[D · 200m Capacity] 2 sets of 2x200m @ 80-82% Vmax. Target 27.5-28.5s. Rest 2.5 min between reps, 5 min between sets. Total 800m. Cues: race rhythm simulation without metabolic crash.',
    type: 'tempo_intensive',
    percentage: 81,
    sets: '2',
    reps: '2',
    distance: '200',
    rest: '2.5m / 5m',
    unit: 'meters'
  },
  {
    id: 'itmp12',
    title: 'Intensive Tempo Combo: 2x250m + 2x150m',
    details: '[D · 200m Capacity] 2x250m @ 80% then 2x150m @ 84%. Rest 4 min after each 250m, 2.5 min between 150m reps. Total 800m. Cues: shift gears from aerobic-anaerobic endurance to fast rhythm turnover.',
    type: 'tempo_intensive',
    percentage: 82,
    sets: '1',
    reps: '1',
    distance: '800',
    rest: '4m / 2.5m',
    unit: 'meters'
  }
];

async function seed() {
  console.log('Seeding 12 Sprinter Intensive Tempo workouts to Supabase...');
  const { data, error } = await supabase
    .from('track_library_drills')
    .upsert(intensiveTempoDrills, { onConflict: 'id' });

  if (error) {
    console.error('Error seeding Intensive Tempo drills to Supabase:', error);
  } else {
    console.log('Successfully seeded all 12 Intensive Tempo workouts to Supabase!');
  }
}

seed();
