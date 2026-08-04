const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://koakdlbwsjekmtiunfhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvYWtkbGJ3c2pla210aXVuZmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNDEyNDUsImV4cCI6MjA4OTcxNzI0NX0.ZTXsET8hhtIebRmXiv1fHELmReGjVJlrq7HdlO9uWMI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const newDrills = [
  { id: 'ac1', title: '400m Repetitions (6x400m)', details: '6x400m @ 65-75% intensity with 1:2 active rest ratio. Total volume: 2400m. Focuses on developing lactic tolerance and anaerobic capacity.', type: 'anaerobic_capacity', percentage: 70, sets: '1', reps: '6', distance: '400', rest: '1:2 active', unit: 'meters' },
  { id: 'ac2', title: '500m Repetitions (4x500m)', details: '4x500m @ 65-75% intensity with 1:2 active rest ratio. Total volume: 2000m. Expands anaerobic buffer capacity for 800m runners.', type: 'anaerobic_capacity', percentage: 70, sets: '1', reps: '4', distance: '500', rest: '1:2 active', unit: 'meters' },
  { id: 'ac3', title: 'Pyramid 400-500-600m (2700m Vol)', details: '2 sets of (400m - 500m - 600m) @ 65-75% intensity with 1:2 active rest ratio between reps and sets. Total volume: 2700m.', type: 'anaerobic_capacity', percentage: 70, sets: '2', reps: '3', distance: '1350', rest: '1:2 active', unit: 'meters' },
  { id: 'ac4', title: '600m Repetitions (5x600m)', details: '4-5x600m @ 65-75% intensity with 1:2 active rest ratio. Total volume: 3000m. Develops high-volume anaerobic stamina.', type: 'anaerobic_capacity', percentage: 70, sets: '1', reps: '5', distance: '600', rest: '1:2 active', unit: 'meters' },
  { id: 'ac5', title: 'Extended Pyramid 400-500-600m (3000m Vol)', details: '2 sets of (400m - 500m - 600m) high-volume pyramid @ 65-75% intensity with 1:2 active rest ratio. Total volume: 3000m.', type: 'anaerobic_capacity', percentage: 70, sets: '2', reps: '3', distance: '1500', rest: '1:2 active', unit: 'meters' },
  { id: 'ac6', title: 'Combo 500m & 400m (3x500m + 3x400m)', details: '3x500m followed by 3x400m @ 65-75% intensity with 1:2 active rest ratio. Total volume: 2700m.', type: 'anaerobic_capacity', percentage: 70, sets: '2', reps: '3', distance: '1350', rest: '1:2 active', unit: 'meters' },
  { id: 'alp1', title: '100m Lactic Power Sprints (12x100m)', details: '12x100m @ 75-85% intensity with 1:4 active rest ratio. Total volume: 1200m. Develops neuromuscular anaerobic power and lactate production capacity.', type: 'anaerobic_lactic_power', percentage: 80, sets: '1', reps: '12', distance: '100', rest: '1:4 active', unit: 'meters' },
  { id: 'alp2', title: '150m Lactic Power Sprints (10x150m)', details: '10x150m @ 75-85% intensity with 1:4 active rest ratio. Total volume: 1500m. Builds explosive lactic power and speed maintenance.', type: 'anaerobic_lactic_power', percentage: 80, sets: '1', reps: '10', distance: '150', rest: '1:4 active', unit: 'meters' },
  { id: 'alp3', title: '200m Lactic Power Sprints (8x200m)', details: '8x200m @ 75-85% intensity with 1:4 active rest ratio. Total volume: 1600m. Builds maximum lactic power for 400m/800m athletes.', type: 'anaerobic_lactic_power', percentage: 80, sets: '1', reps: '8', distance: '200', rest: '1:4 active', unit: 'meters' },
  { id: 'alp4', title: '250m Lactic Power Sprints (6x250m)', details: '6x250m @ 75-85% intensity with 1:4 active rest ratio. Total volume: 1500m. Specific anaerobic power training for mid-distance finishing speed.', type: 'anaerobic_lactic_power', percentage: 80, sets: '1', reps: '6', distance: '250', rest: '1:4 active', unit: 'meters' },
  { id: 'alp5', title: '300m Lactic Power Sprints (5x300m)', details: '5x300m @ 75-85% intensity with 1:4 active rest ratio. Total volume: 1500m. Severe anaerobic lactic power stimulus for 400m/800m performance.', type: 'anaerobic_lactic_power', percentage: 80, sets: '1', reps: '5', distance: '300', rest: '1:4 active', unit: 'meters' }
];

async function seed() {
  console.log('Seeding anaerobic drills to Supabase...');
  const { data, error } = await supabase
    .from('track_library_drills')
    .upsert(newDrills, { onConflict: 'id' });

  if (error) {
    console.error('Error seeding to Supabase:', error);
  } else {
    console.log('Successfully seeded 11 anaerobic drills to Supabase!');
  }
}

seed();
