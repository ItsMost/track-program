import { DEFAULT_LONG_JUMP_PROGRAM, DEFAULT_TRIPLE_JUMP_PROGRAM } from './src/data/constants.js';
import fs from 'fs';

const escapeSql = (str) => str.replace(/'/g, "''");

const sql = `
-- ====================================================================
-- TRACK LAB - DRILLS RE-CLASSIFICATION, NEW MOBILITY, AND EXPANDED JUMP BLOCKS
-- ====================================================================

-- 1. RE-CLASSIFY EXISTING SPEED DRILLS
UPDATE public.track_library_drills SET type = 'speed_acceleration' WHERE id IN ('s1', 's2', 's5', 's6', 's11', 's12', 's13', 's14', 's18', 's19', 's47', 's49');
UPDATE public.track_library_drills SET type = 'speed_max_velocity' WHERE id IN ('s3', 's4', 's7', 's8', 's15', 's20', 's46', 's48');
UPDATE public.track_library_drills SET type = 'speed_endurance' WHERE id IN ('s9', 's10', 's16', 's17');

-- 2. RE-CLASSIFY EXISTING MOBILITY DRILLS
UPDATE public.track_library_drills SET type = 'mobility_warmup' WHERE id IN ('is15', 'is17', 'is19', 'is20');
UPDATE public.track_library_drills SET type = 'mobility_recovery' WHERE id IN ('is16', 'is18');

-- 3. INSERT 10 NEW MOBILITY & RECOVERY DRILLS
INSERT INTO public.track_library_drills (id, title, details, type, percentage, sets, reps, distance, rest, unit) VALUES
('mob1', 'RAMP: Dynamic Hip & Ankle Activation', 'Dynamic leg swings (lateral & linear), ankle rocks, and deep squat prys. Prepares joints for high-velocity impacts.', 'mobility_warmup', NULL, '1', '10', NULL, '0s', 'reps'),
('mob2', 'RAMP: Glute & Hamstring Activation', 'Banded glute bridges, single-leg hinges, and dynamic cobras. Activates posterior chain muscles for sprinting.', 'mobility_warmup', NULL, '1', '12', NULL, '0s', 'reps'),
('mob3', 'RAMP: Neural Potentiation Bounding', 'Low-impact pogo jumps, A-skips, and straight-leg bounds. Elevates heart rate and wakes up the central nervous system.', 'mobility_warmup', NULL, '2', '20', NULL, '30s', 'contacts'),
('mob4', 'RAMP: 3D Torso & Core Mobilization', 'Dynamic thoracic spine rotations, walking lunges with torso twists, and lateral lunges. Prepares multi-planar movement.', 'mobility_warmup', NULL, '1', '8', NULL, '0s', 'reps'),
('mob5', 'RAMP: Speed/Jump Transition Accelerations', '3x30m progressive strides (from 50% to 90% velocity) focusing on upright sprinting mechanics. Potentiates final neural state.', 'mobility_warmup', 90, '1', '3', 30, '60s', 'meters'),
('mob6', 'Active Lower-Body Flush Routine', '15 minutes of dynamic calf rolls, foam rolling hamstrings/quads, and active deep breathing to flush lactic acid.', 'mobility_recovery', NULL, '1', '15', NULL, '0s', 'sec'),
('mob7', 'Psoas & Hip Flexor Static Release', '90-second deep kneeling hip flexor stretch with slight torso rotation, held statically to release tightness.', 'mobility_recovery', NULL, '3', '90', NULL, '0s', 'sec'),
('mob8', 'Adductor & Hamstring Banded Stretch', 'Laying on back using a strap to stretch adductors and hamstrings statically in multiple planes.', 'mobility_recovery', NULL, '3', '60', NULL, '0s', 'sec'),
('mob9', 'Thoracic & Lats Decompression Hold', 'Child''s pose with elevated elbows on a box, holding statically to decompress upper back and shoulders.', 'mobility_recovery', NULL, '2', '60', NULL, '0s', 'sec'),
('mob10', 'Contract-Relax Hamstring Stretch (PNF)', 'Partner or band-assisted contract-relax stretching of hamstrings to increase range of motion.', 'mobility_recovery', NULL, '3', '30', NULL, '0s', 'sec')
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

-- 4. INSERT EXPANDED JUMP PROGRAM BLOCKS
INSERT INTO public.track_macro_programs (id, program_name, weeks) VALUES
('default-long-jump-speed-takeoff', 'Long Jump Runway Speed & Takeoff Power (4-Week Block)', '${escapeSql(JSON.stringify(DEFAULT_LONG_JUMP_PROGRAM.weeks))}'),
('default-triple-jump-stiffness-phases', 'Triple Jump Landing Stiffness & Phase Distribution (4-Week Block)', '${escapeSql(JSON.stringify(DEFAULT_TRIPLE_JUMP_PROGRAM.weeks))}')
ON CONFLICT (id) DO UPDATE SET
  program_name = EXCLUDED.program_name,
  weeks = EXCLUDED.weeks;
`;

fs.writeFileSync('seed_jumps_speed_mobility.sql', sql.trim() + '\n');
console.log("SQL file generated successfully.");
