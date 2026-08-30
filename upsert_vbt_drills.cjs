const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://koakdlbwsjekmtiunfhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvYWtkbGJ3c2pla210aXVuZmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNDEyNDUsImV4cCI6MjA4OTcxNzI0NX0.ZTXsET8hhtIebRmXiv1fHELmReGjVJlrq7HdlO9uWMI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const vbtDrills = [
  // 1. Starting Strength / Speed (> 1.30 m/s)
  { id: 'vbt1', title: 'Ballistic Landmine Push-Press (Speed)', details: 'Explosive unilateral landmine press @ 35-40% 1RM. Target Mean: >1.35 m/s, Peak: >2.05 m/s. 10% velocity loss cutoff. Maximizes initial rate of force development (RFD).', type: 'power_starting_strength', percentage: 40, sets: '3', reps: '4', distance: null, rest: '2m', unit: 'reps' },
  { id: 'vbt2', title: 'Medicine Ball Overhead Backward Toss (VBT Track)', details: 'Explosive triple extension launching 4kg ball backwards. Target Peak: >2.40 m/s. Focus on hip snap for sprint acceleration.', type: 'power_starting_strength', percentage: 30, sets: '4', reps: '3', distance: null, rest: '90s', unit: 'reps' },

  // 2. Speed-Strength (1.00 - 1.30 m/s)
  { id: 'vbt3', title: 'Barbell Jump Squat (Speed-Strength)', details: 'Loaded jump squat with barbell @ 30-35% 1RM. Target Mean: 1.15-1.30 m/s, Peak: >2.10 m/s. 10% velocity loss cutoff to protect CNS.', type: 'power_speed_strength', percentage: 35, sets: '4', reps: '4', distance: null, rest: '2.5m', unit: 'reps' },
  { id: 'vbt4', title: 'Trap Bar Explosive High Jumps', details: 'Vertical jumps from neutral grip trap bar @ 30-35% 1RM. Target Mean: 1.25 m/s, Peak: 2.20 m/s. 10% velocity loss cutoff.', type: 'power_speed_strength', percentage: 35, sets: '4', reps: '3', distance: null, rest: '3m', unit: 'reps' },
  { id: 'vbt5', title: 'Hang Power Snatch from Mid-Thigh', details: 'Olympic snatch from power position @ 65-70% 1RM. Target Mean: 1.25 m/s, Peak: >1.85 m/s. 10% velocity loss cutoff.', type: 'power_speed_strength', percentage: 70, sets: '4', reps: '2', distance: null, rest: '3m', unit: 'reps' },
  { id: 'vbt6', title: 'Dynamic Effort Bench Press with Bands', details: 'Bench press @ 50-55% 1RM + accommodating band tension. Target Mean: 1.05 m/s, Peak: 1.35 m/s. 10% cutoff for rapid upper limb velocity.', type: 'power_speed_strength', percentage: 55, sets: '5', reps: '3', distance: null, rest: '90s', unit: 'reps' },

  // 3. Strength-Speed (0.75 - 1.00 m/s)
  { id: 'vbt7', title: 'Hang Power Clean (Strength-Speed)', details: 'Olympic clean from knees @ 75-80% 1RM. Target Mean: 1.10 m/s, Peak: 1.65 m/s. 10% velocity loss cutoff. Maximizes power output.', type: 'power_strength_speed', percentage: 78, sets: '4', reps: '3', distance: null, rest: '3m', unit: 'reps' },
  { id: 'vbt8', title: 'Power Clean from Floor (Peak Power)', details: 'Full power clean from floor @ 80% 1RM. Target Mean: 1.05 m/s, Peak: 1.55 m/s. 10% cutoff rule for maximal CNS recruitment.', type: 'power_strength_speed', percentage: 80, sets: '4', reps: '2', distance: null, rest: '3m', unit: 'reps' },
  { id: 'vbt9', title: 'Clean High Pull from Blocks', details: 'Explosive shrug and high pull from knee-level blocks @ 85% 1RM clean. Target Mean: 1.15 m/s, Peak: 1.70 m/s. 10% cutoff.', type: 'power_strength_speed', percentage: 85, sets: '4', reps: '3', distance: null, rest: '2.5m', unit: 'reps' },
  { id: 'vbt10', title: 'Dynamic Effort Box Squats with Bands', details: 'Box squat @ 60% bar weight + 20% accommodating band tension. Target Mean: 0.85-0.95 m/s. 10% cutoff for sprint acceleration RFD.', type: 'power_strength_speed', percentage: 60, sets: '6', reps: '2', distance: null, rest: '75s', unit: 'reps' },
  { id: 'vbt11', title: 'Push Press / Jerk Drive (Peak Velocity)', details: 'Explosive dip and drive overhead @ 75% 1RM. Target Mean: 1.15 m/s, Peak: 1.70 m/s. 10% cutoff rule.', type: 'power_strength_speed', percentage: 75, sets: '4', reps: '3', distance: null, rest: '2m', unit: 'reps' },

  // 4. Accelerative Strength (0.50 - 0.75 m/s)
  { id: 'vbt12', title: 'Heavy Half-Squat (Accelerative Strength)', details: 'Half-squat @ 75-80% 1RM. Target Mean: 0.60-0.70 m/s. 15% velocity loss cutoff. High force production with sprint specific knee angles.', type: 'strength_accelerative', percentage: 78, sets: '4', reps: '4', distance: null, rest: '3m', unit: 'reps' },
  { id: 'vbt13', title: 'Heavy Full Back Squat (Accelerative Strength)', details: 'Full squat @ 80% 1RM. Target Mean: 0.55 m/s, Peak: 0.85 m/s. 15% velocity loss cutoff.', type: 'strength_accelerative', percentage: 80, sets: '4', reps: '4', distance: null, rest: '3m', unit: 'reps' },
  { id: 'vbt14', title: 'Heavy Trap Bar Deadlift (High Force)', details: 'Trap bar deadlift @ 80% 1RM. Target Mean: 0.55-0.65 m/s. 15% cutoff. Overloads posterior chain extension.', type: 'strength_accelerative', percentage: 80, sets: '4', reps: '3', distance: null, rest: '3m', unit: 'reps' },

  // 5. Maximal / Absolute Strength (< 0.50 m/s)
  { id: 'vbt15', title: 'Maximal Strength Squat (Heavy Grind)', details: 'Full squat @ 90% 1RM. Target Mean: 0.38-0.42 m/s. 20% velocity loss cutoff to maintain motor unit synchronization.', type: 'strength_maximal', percentage: 90, sets: '3', reps: '2', distance: null, rest: '4m', unit: 'reps' },
  { id: 'vbt16', title: 'Maximal Strength Bench Press (Heavy Grind)', details: 'Bench press @ 90% 1RM. Target Mean: 0.32-0.36 m/s. 20% velocity loss cutoff.', type: 'strength_maximal', percentage: 90, sets: '3', reps: '2', distance: null, rest: '3.5m', unit: 'reps' }
];

async function seed() {
  console.log('Seeding 16 VBT Force-Velocity drills to Supabase...');
  const { data, error } = await supabase
    .from('track_library_drills')
    .upsert(vbtDrills, { onConflict: 'id' });

  if (error) {
    console.error('Error seeding VBT drills to Supabase:', error);
  } else {
    console.log('Successfully seeded all 16 VBT Force-Velocity drills to Supabase!');
  }
}

seed();
