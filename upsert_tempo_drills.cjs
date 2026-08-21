const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://koakdlbwsjekmtiunfhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvYWtkbGJ3c2pla210aXVuZmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNDEyNDUsImV4cCI6MjA4OTcxNzI0NX0.ZTXsET8hhtIebRmXiv1fHELmReGjVJlrq7HdlO9uWMI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const tempoDrills = [
  // Reclassified existing drills
  { id: 's10', title: '300m Tempo Runs', details: 'Rhythmic striding for aerobic capacity. Focus on clean running mechanics.', type: 'tempo_extensive', percentage: 70, sets: '4', reps: '1', distance: '300', rest: '4m', unit: 'meters' },
  { id: 's17', title: '200m Tempo Strides', details: 'Aerobic restoration strides. 70% effort. Focus on posture and breathing.', type: 'tempo_extensive', percentage: 70, sets: '6', reps: '1', distance: '200', rest: '3m', unit: 'meters' },
  { id: 'end401', title: 'Extensive Tempo Intervals (6x200m)', details: 'Run 200m repetitions at 70% intensity. Focus on running relaxed with clean stride mechanics.', type: 'tempo_extensive', percentage: 70, sets: '1', reps: '6', distance: '200', rest: '2m', unit: 'meters' },
  { id: 'end402', title: 'Intensive Tempo Intervals (4x300m)', details: 'Run 300m repetitions at 80-85% intensity. Builds lactic capacity and metabolic efficiency.', type: 'tempo_intensive', percentage: 82, sets: '1', reps: '4', distance: '300', rest: '4m', unit: 'meters' },

  // New Extensive Tempo Drills
  { id: 'tmp_ext1', title: 'Extensive Tempo 10x100m (Grass/Track)', details: '10x100m @ 65-70% on grass or track with 45s walk recovery. Total: 1000m. Focuses on relaxed posture, rhythm, and aerobic recovery.', type: 'tempo_extensive', percentage: 70, sets: '1', reps: '10', distance: '100', rest: '45s', unit: 'meters' },
  { id: 'tmp_ext2', title: 'Extensive Tempo 8x200m', details: '8x200m @ 70% with 60-90s easy walk/jog recovery. Total: 1600m. Classic aerobic flushing and capillary density workout.', type: 'tempo_extensive', percentage: 70, sets: '1', reps: '8', distance: '200', rest: '75s', unit: 'meters' },
  { id: 'tmp_ext3', title: 'Extensive Tempo 6x300m', details: '6x300m @ 70% with 90s walk recovery. Total: 1800m. Smooth striding mechanics and aerobic endurance support.', type: 'tempo_extensive', percentage: 70, sets: '1', reps: '6', distance: '300', rest: '90s', unit: 'meters' },
  { id: 'tmp_ext4', title: 'Tempo Ladder (100-200-300-300-200-100m)', details: 'Progressive pyramid tempo @ 65-75% intensity with 60-90s walk recovery. Total: 1200m. Excellent for rhythm variation.', type: 'tempo_extensive', percentage: 70, sets: '1', reps: '6', distance: '1200', rest: '60s', unit: 'meters' },
  { id: 'tmp_ext5', title: 'Big Circuit Tempo (2x 100-100-200-200m)', details: '2 sets of (2x100m + 2x200m) @ 70% with 45s between reps and 2m between sets. Total: 1200m. Active recovery day.', type: 'tempo_extensive', percentage: 70, sets: '2', reps: '4', distance: '600', rest: '2m', unit: 'meters' },
  { id: 'tmp_ext6', title: 'Extensive Tempo 5x400m Cruise', details: '5x400m @ 65-70% with 2m active jog recovery. Total: 2000m. Builds cardiovascular capillary bed and running economy.', type: 'tempo_extensive', percentage: 68, sets: '1', reps: '5', distance: '400', rest: '2m', unit: 'meters' },

  // New Intensive Tempo Drills
  { id: 'tmp_int1', title: 'Intensive Tempo 6x150m (Turn & Straight)', details: '6x150m @ 80-85% intensity with 2-3m walking recovery. Total: 900m. Bridges aerobic tempo to lactic power.', type: 'tempo_intensive', percentage: 80, sets: '1', reps: '6', distance: '150', rest: '2.5m', unit: 'meters' },
  { id: 'tmp_int2', title: 'Intensive Tempo 5x200m', details: '5x200m @ 80-85% with 2.5m walk recovery. Total: 1000m. Teaches speed maintenance under mild lactic accumulation.', type: 'tempo_intensive', percentage: 82, sets: '1', reps: '5', distance: '200', rest: '2.5m', unit: 'meters' },
  { id: 'tmp_int3', title: 'Intensive Tempo 4x300m', details: '4x300m @ 80-85% with 3-4m rest. Total: 1200m. Specific lactic tolerance and race-rhythm conditioning for 400m/800m.', type: 'tempo_intensive', percentage: 82, sets: '1', reps: '4', distance: '300', rest: '3.5m', unit: 'meters' },
  { id: 'tmp_int4', title: 'Intensive Tempo 3x400m Split Pace', details: '3x400m @ 80% intensity with 4m recovery. Total: 1200m. Develops sustained middle-distance anaerobic pacing.', type: 'tempo_intensive', percentage: 80, sets: '1', reps: '3', distance: '400', rest: '4m', unit: 'meters' },
  { id: 'tmp_int5', title: 'Intensive Tempo Broken 500m (300m + 200m)', details: '2 sets of (300m @ 82% + 45s rest + 200m @ 82%), 5m rest between sets. High-quality intensive tempo stimulus.', type: 'tempo_intensive', percentage: 82, sets: '2', reps: '2', distance: '500', rest: '5m', unit: 'meters' }
];

async function seed() {
  console.log('Seeding Tempo drills to Supabase...');
  const { data, error } = await supabase
    .from('track_library_drills')
    .upsert(tempoDrills, { onConflict: 'id' });

  if (error) {
    console.error('Error seeding tempo drills to Supabase:', error);
  } else {
    console.log('Successfully seeded all Tempo drills to Supabase!');
  }
}

seed();
