-- ====================================================================
-- TRACK LAB - 15 NEW HIP FLEXOR & HIP EXTENSION STRENGTH DRILLS
-- ====================================================================
-- Copy and paste this script directly into the Supabase SQL Editor and run it!

INSERT INTO public.track_library_drills (id, title, details, type, percentage, sets, reps, distance, rest, unit) VALUES
-- === HIP FLEXORS (10 DRILLS) ===
('sts4', 'Lying Banded Psoas March', 'Lying on back with resistance band around feet, pull one knee to chest while holding the other leg straight and stable. Highly specific hip flexor activation.', 'strength_single_leg', 65, '3', '10', NULL, '60s', 'reps'),
('sts5', 'Standing Cable Hip Flexion', 'Ankle strap attached to low cable. Explode knee upward to hip height, then lower under control to build sprinting drive power.', 'strength_single_leg', 75, '3', '8', NULL, '75s', 'reps'),
('sts6', 'Kettlebell Standing Knee Drive', 'Insert foot in kettlebell handle. Standing tall, drive knee aggressively upward to 90 degrees. Mimics high-knee sprint mechanics.', 'strength_single_leg', 70, '3', '8', NULL, '60s', 'reps'),
('sts7', 'Resisted Wall Drill Knee Drives', 'Leaning against a wall at 45-degree angle. Loop band around feet and drive knees explosively in a piston motion.', 'strength_single_leg', 70, '4', '10', NULL, '75s', 'reps'),
('sts8', 'Hanging Weighted Single-Leg Knee Raises', 'Hanging from a pull-up bar, raise one knee to chest with a dumbbell gripped between feet. Overloads hip flexors at full extension.', 'strength_single_leg', 75, '3', '8', NULL, '90s', 'reps'),
('sts9', 'Standing High-Tension Band Hip Flexion', 'Anchor resistance band behind you, loop around ankle. Explode foot forward and knee up into sprinting posture.', 'strength_single_leg', 60, '3', '12', NULL, '60s', 'reps'),
('sts10', 'Seated Kettlebell Hip Flexor Lift', 'Sit tall on box with leg straight. Lift foot carrying a kettlebell over an obstacle. Targets psoas major in deep hip flexion.', 'strength_single_leg', 65, '3', '8', NULL, '60s', 'reps'),
('sts11', 'Plank with Banded Knee-to-Chest Drives', 'Push-up plank position. Pull knee to chest against band resistance, maintaining flat spine and stable hips.', 'strength_single_leg', 60, '3', '10', NULL, '60s', 'reps'),
('std4', 'Cable Reverse Squat (Double Knee Pull)', 'Lie on back facing cable stack, strap ankles, pull both knees aggressively to chest against resistance to strengthen hip flexors.', 'strength_double_leg', 70, '3', '10', NULL, '75s', 'reps'),
('sts12', 'Partner-Resisted A-Skip Knee Drives', 'Perform single-leg A-skip drives while a partner resists knee elevation to develop specific hip flexor power.', 'strength_single_leg', 80, '3', '10', NULL, '60s', 'reps'),

-- === HIP EXTENSION (5 DRILLS) ===
('std5', 'Barbell Hip Thrust (Heavy)', 'Maximum barbell hip thrust. Load glutes and hamstrings at short muscle lengths to build horizontal sprinting power.', 'strength_double_leg', 85, '4', '6', NULL, '2m', 'reps'),
('sts13', 'Single-Leg Hip Thrust (Weighted)', 'Unilateral hip extension. Shoulders on bench, elevate one leg, drive hips upward against a dumbbell/plate for glute power.', 'strength_single_leg', 75, '3', '8', NULL, '90s', 'reps'),
('std6', 'Glute Ham Raise (GHR)', 'Bodyweight kneeling extension from GHD machine. Strengthens hamstrings at both knee and hip joint extensions.', 'strength_double_leg', 80, '3', '6', NULL, '90s', 'reps'),
('std7', 'Kettlebell Swing (Explosive Hinge)', 'Heavy kettlebell swings focusing on snapping hips forward dynamically. Builds ballistic hip extension power.', 'strength_double_leg', 80, '4', '10', NULL, '90s', 'reps'),
('std8', 'Deficit Romanian Deadlift (RDL)', 'Perform RDL standing on an elevated platform for deeper range of motion. Targets deep hamstring/glute extension stretch.', 'strength_double_leg', 75, '4', '8', NULL, '2m', 'reps')

ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  details = EXCLUDED.details,
  type = EXCLUDED.type,
  percentage = EXCLUDED.percentage,
  sets = EXCLUDED.sets,
  reps = EXCLUDED.reps,
  distance = EXCLUDED.distance,
  rest = EXCLUDED.rest,
  unit = EXCLUDED.unit;
