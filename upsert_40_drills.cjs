const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://koakdlbwsjekmtiunfhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvYWtkbGJ3c2pla210aXVuZmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNDEyNDUsImV4cCI6MjA4OTcxNzI0NX0.ZTXsET8hhtIebRmXiv1fHELmReGjVJlrq7HdlO9uWMI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const new40Drills = [
  // === CORE ROTATION (5 DRILLS) ===
  { id: 'cor4', title: 'Landmine Rotational Twists', details: 'Rotate barbell arc from hip to hip with athletic pivot. Trains explosive torso rotational velocity.', type: 'core_rotation', percentage: 80, sets: '3', reps: '10', distance: null, rest: '60s', unit: 'reps' },
  { id: 'cor5', title: 'Standing Banded Torso Rotations', details: 'High-speed torso rotations against resistance band. Develops rapid elastic recoil of obliques.', type: 'core_rotation', percentage: 70, sets: '3', reps: '15', distance: null, rest: '45s', unit: 'reps' },
  { id: 'cor6', title: 'Kneeling Med Ball Lateral Wall Slams', details: 'Kneeling tall, rotate and slam 4kg med ball sideways into wall with maximum force.', type: 'core_rotation', percentage: 90, sets: '3', reps: '8', distance: null, rest: '60s', unit: 'reps' },
  { id: 'cor7', title: 'Hanging Windshield Wipers', details: 'Hang from pull-up bar, raise toes to bar and rotate legs side to side in arc motion.', type: 'core_rotation', percentage: 85, sets: '3', reps: '8', distance: null, rest: '90s', unit: 'reps' },
  { id: 'cor8', title: 'Cable Low-to-High Diagonal Chops', details: 'Pull cable diagonally from ankle to opposite shoulder. Trains upward rotational force transfer.', type: 'core_rotation', percentage: 75, sets: '3', reps: '10', distance: null, rest: '60s', unit: 'reps' },

  // === CORE ANTI ROTATION (5 DRILLS) ===
  { id: 'coa4', title: 'Suitcase Deadlift (Single Dumbbell)', details: 'Deadlift holding weight on one side only. Heavy anti-lateral flexion and anti-rotational core brace.', type: 'core_anti_rotation', percentage: 80, sets: '3', reps: '6', distance: null, rest: '90s', unit: 'reps' },
  { id: 'coa5', title: 'Anti-Rotation Cable Hold (Pallof Iso)', details: 'Hold cable extended at arm length statically for 30s. Resists heavy rotational torque.', type: 'core_anti_rotation', percentage: 75, sets: '3', reps: '30', distance: null, rest: '60s', unit: 'sec' },
  { id: 'coa6', title: 'Overhead Single-Arm Dumbbell Carry (20m)', details: 'Walk tall holding dumbbell locked out overhead in one arm. Overloads lateral trunk stability.', type: 'core_anti_rotation', percentage: 75, sets: '3', reps: '2', distance: '20', rest: '60s', unit: 'meters' },
  { id: 'coa7', title: 'Renegade Rows (Push-up Plank)', details: 'In push-up plank, row dumbbell to hip without allowing hips or torso to tilt.', type: 'core_anti_rotation', percentage: 75, sets: '3', reps: '8', distance: null, rest: '60s', unit: 'reps' },
  { id: 'coa8', title: 'Birddog Cable Drag (Anti-Rotation)', details: 'Quadruped stance, reach arm under torso to drag cable weight across without moving hips.', type: 'core_anti_rotation', percentage: 65, sets: '3', reps: '10', distance: null, rest: '60s', unit: 'reps' },

  // === CORE EXTENSION (5 DRILLS) ===
  { id: 'coe4', title: 'Barbell Good Mornings', details: 'Barbell on shoulders, hinge hips back with flat back until torso is parallel to floor. Posterior chain extension.', type: 'core_extension', percentage: 70, sets: '3', reps: '8', distance: null, rest: '90s', unit: 'reps' },
  { id: 'coe5', title: 'Reverse Hyperextensions', details: 'Lying face down on bench, raise legs backward using glutes and spinal erectors. Decompresses lower back.', type: 'core_extension', percentage: 75, sets: '3', reps: '12', distance: null, rest: '60s', unit: 'reps' },
  { id: 'coe6', title: 'Weighted Hyperextensions on Bench', details: 'Hold 10kg plate at chest, flex and extend spine over 45-degree back extension bench.', type: 'core_extension', percentage: 75, sets: '3', reps: '10', distance: null, rest: '60s', unit: 'reps' },
  { id: 'coe7', title: 'Prone Cobra Hold with Y-Lifts', details: 'Lie on stomach, lift chest and extend shoulders into Y-shape. Strengthens upper spinal erectors.', type: 'core_extension', percentage: 50, sets: '3', reps: '40', distance: null, rest: '45s', unit: 'sec' },
  { id: 'coe8', title: 'Jefferson Curl (Light Mobility Extension)', details: 'Segmental spinal flexion and extension with light dumbbell. Builds spinal resilience and hamstring length.', type: 'core_extension', percentage: 40, sets: '3', reps: '8', distance: null, rest: '60s', unit: 'reps' },

  // === CORE ANTI EXTENSION (5 DRILLS) ===
  { id: 'can4', title: 'RKC Plank (Max Effort Tension Plank)', details: 'Forearm plank flexing quads, glutes, and abs as hard as possible for 20s. Extreme anti-extension stiffness.', type: 'core_anti_extension', percentage: 85, sets: '3', reps: '20', distance: null, rest: '45s', unit: 'sec' },
  { id: 'can5', title: 'Barbell Ab Rollouts from Knees', details: 'Roll barbell forward with plates, maintaining hollow body posture. Intense lat and core anti-extension.', type: 'core_anti_extension', percentage: 80, sets: '3', reps: '8', distance: null, rest: '60s', unit: 'reps' },
  { id: 'can6', title: 'Hanging Leg Raises to Bar', details: 'Hang from pull-up bar, raise straight legs to touch bar without swinging body.', type: 'core_anti_extension', percentage: 80, sets: '3', reps: '8', distance: null, rest: '60s', unit: 'reps' },
  { id: 'can7', title: 'Physio Ball Stir-the-Pot Plank', details: 'Forearms on stability ball in plank, rotate elbows in circular motion while keeping spine perfectly still.', type: 'core_anti_extension', percentage: 70, sets: '3', reps: '10', distance: null, rest: '60s', unit: 'reps' },
  { id: 'can8', title: 'TRX Body Saw Rollouts', details: 'Feet in TRX suspension straps, forearm plank, slide body backward and forward without dipping hips.', type: 'core_anti_extension', percentage: 75, sets: '3', reps: '10', distance: null, rest: '60s', unit: 'reps' },

  // === STRENGTH SINGLE LEG (7 DRILLS) ===
  { id: 'sts14', title: 'Single-Leg Barbell Front Squat', details: 'Pistol squat or foot-elevated single-leg squat with barbell in front rack position. Builds intense quad & balance power for sprinting.', type: 'strength_single_leg', percentage: 75, sets: '3', reps: '6', distance: null, rest: '90s', unit: 'reps' },
  { id: 'sts15', title: 'Single-Leg Landmine Romanian Deadlift', details: 'Hinge on one leg holding landmine bar. Develops rotational hip stability, hamstrings, and glute max strength.', type: 'strength_single_leg', percentage: 75, sets: '3', reps: '8', distance: null, rest: '75s', unit: 'reps' },
  { id: 'sts16', title: 'Weighted Skater Squats', details: 'Unilateral squat bringing rear knee to tap ground without letting rear foot touch. Deep glute and knee stability.', type: 'strength_single_leg', percentage: 70, sets: '3', reps: '6', distance: null, rest: '90s', unit: 'reps' },
  { id: 'sts17', title: 'Single-Leg Calf Raises on Block (Heavy)', details: 'Standing single-leg calf raise on a raised step holding a dumbbell. Increases Achilles tendon stiffness for sprinting.', type: 'strength_single_leg', percentage: 80, sets: '4', reps: '10', distance: null, rest: '60s', unit: 'reps' },
  { id: 'sts18', title: 'Single-Leg Leg Press (Heavy)', details: 'Unilateral leg press driving through heel. Builds raw single-leg quad and glute concentric strength.', type: 'strength_single_leg', percentage: 85, sets: '4', reps: '6', distance: null, rest: '90s', unit: 'reps' },
  { id: 'sts19', title: 'Single-Leg Hamstring Slider Curls', details: 'Hips elevated, pull slider under one foot to curl hamstring. High eccentric hamstring loading to prevent strains.', type: 'strength_single_leg', percentage: 70, sets: '3', reps: '8', distance: null, rest: '75s', unit: 'reps' },
  { id: 'sts20', title: 'Single-Leg Lateral Step-Downs', details: 'Stand on box, lower foot laterally to tap heel to floor. Develops VMO, patellar tendon durability, and hip control.', type: 'strength_single_leg', percentage: 65, sets: '3', reps: '10', distance: null, rest: '60s', unit: 'reps' },

  // === STRENGTH DOUBLE LEG (7 DRILLS) ===
  { id: 'std9', title: 'Front Squat (Heavy Barbell)', details: 'Barbell front squat with upright torso. Maximizes quad strength, thoracic extension, and core bracing.', type: 'strength_double_leg', percentage: 85, sets: '4', reps: '4', distance: null, rest: '3m', unit: 'reps' },
  { id: 'std10', title: 'Zercher Squats', details: 'Barbell held in crook of elbows. Overloads anterior chain, upper back, and mid-section for sprint impact absorption.', type: 'strength_double_leg', percentage: 80, sets: '4', reps: '5', distance: null, rest: '3m', unit: 'reps' },
  { id: 'std11', title: 'Heavy Sumo Deadlift', details: 'Wide stance deadlift. Heavy adductor and glute activation for lateral/horizontal sprinting drive.', type: 'strength_double_leg', percentage: 85, sets: '4', reps: '4', distance: null, rest: '3m', unit: 'reps' },
  { id: 'std12', title: 'Safety Squat Bar Box Squats', details: 'Sit back onto box with SSB bar, pause briefly, then explode up. Builds rate of force development (RFD).', type: 'strength_double_leg', percentage: 80, sets: '4', reps: '3', distance: null, rest: '3m', unit: 'reps' },
  { id: 'std13', title: 'Nordic Hamstring Curls (Band-Assisted)', details: 'Kneeling, lower torso under control using hamstrings. Gold-standard eccentric strength for hamstring health.', type: 'strength_double_leg', percentage: 85, sets: '3', reps: '5', distance: null, rest: '2m', unit: 'reps' },
  { id: 'std14', title: 'Heavy Barbell Shrugs & Power Pulls', details: 'Heavy shrug pull from high thigh. Strengthens upper traps, shoulders, and spinal stabilization.', type: 'strength_double_leg', percentage: 90, sets: '4', reps: '6', distance: null, rest: '2m', unit: 'reps' },
  { id: 'std15', title: 'Seated Heavy Soleus Calf Raises', details: 'Seated machine calf raises loaded heavy. Targets soleus muscle to support 6-8x bodyweight ground impact forces.', type: 'strength_double_leg', percentage: 80, sets: '4', reps: '12', distance: null, rest: '60s', unit: 'reps' },

  // === STRENGTH UPPER BODY (6 DRILLS) ===
  { id: 'stu4', title: 'Incline Dumbbell Press', details: '30-degree incline dumbbell press. Builds upper chest and shoulder drive for aggressive arm mechanics.', type: 'strength_upper', percentage: 80, sets: '4', reps: '6', distance: null, rest: '2m', unit: 'reps' },
  { id: 'stu5', title: 'Pendlay Barbell Rows (Strict Floor Pull)', details: 'Torso parallel to floor, explosive pull from floor to lower chest. Builds upper back thickness and posture.', type: 'strength_upper', percentage: 80, sets: '4', reps: '6', distance: null, rest: '2m', unit: 'reps' },
  { id: 'stu6', title: 'Weighted Dips', details: 'Parallel bar dips with added weight belt. Excellent pressing strength for anterior shoulder & chest.', type: 'strength_upper', percentage: 80, sets: '3', reps: '6', distance: null, rest: '2m', unit: 'reps' },
  { id: 'stu7', title: 'Single-Arm Dumbbell Rows (Heavy)', details: 'Unilateral heavy dumbbell row. Develops lat strength and anti-rotational core stability.', type: 'strength_upper', percentage: 85, sets: '4', reps: '8', distance: null, rest: '90s', unit: 'reps' },
  { id: 'stu8', title: 'Landmine Single-Arm Press', details: 'Standing diagonal single-arm press with landmine. Transfers directly to sprinting arm-drive mechanics.', type: 'strength_upper', percentage: 75, sets: '3', reps: '8', distance: null, rest: '75s', unit: 'reps' },
  { id: 'stu9', title: 'Face Pulls with Cable & Rope', details: 'Pull rope to forehead with external shoulder rotation. Prevents rounded shoulders and optimizes posture.', type: 'strength_upper', percentage: 65, sets: '3', reps: '15', distance: null, rest: '60s', unit: 'reps' }
];

async function seed() {
  console.log('Seeding 40 new Strength & Core drills to Supabase...');
  const { data, error } = await supabase
    .from('track_library_drills')
    .upsert(new40Drills, { onConflict: 'id' });

  if (error) {
    console.error('Error seeding 40 drills to Supabase:', error);
  } else {
    console.log('Successfully seeded all 40 Strength & Core drills to Supabase!');
  }
}

seed();
