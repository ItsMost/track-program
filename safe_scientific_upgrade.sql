-- ============================================================================
-- Research-Grade Sports Science Engine & Exercise Library Upgrade
-- Safe, Non-Destructive Migration & Upsert Script
-- Target: Supabase Track & Field Database
-- ============================================================================

-- 1. Ensure columns exist on track_athletes
ALTER TABLE track_athletes ADD COLUMN IF NOT EXISTS accel_10m NUMERIC;
ALTER TABLE track_athletes ADD COLUMN IF NOT EXISTS fly_30m NUMERIC;
ALTER TABLE track_athletes ADD COLUMN IF NOT EXISTS max_velocity NUMERIC;
ALTER TABLE track_athletes ADD COLUMN IF NOT EXISTS cmj NUMERIC;
ALTER TABLE track_athletes ADD COLUMN IF NOT EXISTS rsi NUMERIC;
ALTER TABLE track_athletes ADD COLUMN IF NOT EXISTS broad_jump NUMERIC;
ALTER TABLE track_athletes ADD COLUMN IF NOT EXISTS trap_bar_deadlift NUMERIC;

-- 2. Ensure columns exist on track_library_drills
ALTER TABLE track_library_drills ADD COLUMN IF NOT EXISTS force_vector TEXT;
ALTER TABLE track_library_drills ADD COLUMN IF NOT EXISTS ssc_type TEXT;
ALTER TABLE track_library_drills ADD COLUMN IF NOT EXISTS cns_demand TEXT;
ALTER TABLE track_library_drills ADD COLUMN IF NOT EXISTS vbt_zone TEXT;
ALTER TABLE track_library_drills ADD COLUMN IF NOT EXISTS velocity_loss_cutoff TEXT;
ALTER TABLE track_library_drills ADD COLUMN IF NOT EXISTS target_velocity TEXT;
ALTER TABLE track_library_drills ADD COLUMN IF NOT EXISTS peak_velocity TEXT;
ALTER TABLE track_library_drills ADD COLUMN IF NOT EXISTS velocity_loss TEXT;

-- 3. Non-Destructive Upsert of 23 Scientific Exercises
INSERT INTO track_library_drills (
    id, title, details, type, percentage, sets, reps, distance, rest, unit,
    force_vector, ssc_type, cns_demand, vbt_zone, velocity_loss_cutoff
) VALUES
-- Yielding Isometrics
('iso_y1', 'Yielding Isometric Split Squat (Rear Foot Elevated)', 'Hold bottom position (knee 1 inch above turf) under load. Maintain upright torso and maximum glute/quad isometric tension.', 'isometric_yielding', 75, '3', '30', '', '90s', 'sec', 'Vertical', 'Isometric', 'Medium', 'Yielding Isometric', 'N/A'),
('iso_y2', 'Yielding Isometric Romanian Deadlift (Mid-Shin)', 'Hold barbell statically at mid-shin with neutral spine and maximum hamstring pre-stretch. Resists spinal flexion.', 'isometric_yielding', 80, '3', '20', '', '90s', 'sec', 'Horizontal', 'Isometric', 'Medium', 'Yielding Isometric', 'N/A'),
('iso_y3', 'Yielding Isometric Soleus Wall Sit', 'Wall sit with knees flexed at 90 deg and heels raised high to overload soleus and Achilles tendon under continuous tension.', 'isometric_yielding', 0, '4', '45', '', '60s', 'sec', 'Vertical', 'Isometric', 'Low', 'Yielding Isometric', 'N/A'),
('iso_y4', 'Yielding Isometric 90/90 Hamstring Bridge', 'Single leg supine heel dig on 30cm box with 90 deg knee angle. Overloads biceps femoris long head isometrically.', 'isometric_yielding', 0, '3', '25', '', '60s', 'sec', 'Horizontal', 'Isometric', 'Low', 'Yielding Isometric', 'N/A'),

-- Overcoming Isometrics
('iso_o1', 'Isometric Mid-Thigh Pull (IMTP)', 'Maximum voluntary isometric contraction against unmovable pins at mid-thigh power position. Peak RFD test & stimulus.', 'isometric_overcoming', 100, '4', '5', '', '3 min', 'sec', 'Vertical', 'Isometric', 'High', 'Overcoming Isometric', 'N/A'),
('iso_o2', 'Overcoming Isometric Hip Extension Against Pins', 'Prone hip extension or barbell hip thrust locked under pins. Drive upward with 100% maximal intent for 4-6 seconds.', 'isometric_overcoming', 100, '3', '5', '', '2.5 min', 'sec', 'Horizontal', 'Isometric', 'High', 'Overcoming Isometric', 'N/A'),
('iso_o3', 'Overcoming Isometric Single-Leg Plantarflexion', 'Maximal plantarflexion push against fixed immoveable bar in Smith machine. Stimulates high Achilles tendon stiffness.', 'isometric_overcoming', 100, '3', '5', '', '2 min', 'sec', 'Vertical', 'Isometric', 'Medium', 'Overcoming Isometric', 'N/A'),

-- Quasi-Isometric Switches
('iso_s1', 'Quasi-Isometric A-Position Sprint Switch', 'Hold high A-position knee drive, then perform rapid ballistic switch on coach cue and freeze instantly in opposite A-shape.', 'isometric_switch', 0, '3', '6', '', '90s', 'reps', 'Vertical', 'Fast-SSC (<250ms)', 'High', 'Starting Strength (>1.3 m/s)', '5-10%'),
('iso_s2', 'Quasi-Isometric Drop & Freeze Split Switch', 'Drop from 20cm box and instantly switch legs in mid-air, absorbing landing in deep lunge with zero rebound.', 'isometric_switch', 0, '3', '5', '', '90s', 'reps', 'Vertical', 'Fast-SSC (<250ms)', 'High', 'Speed-Strength (1.0-1.3 m/s)', '5-10%'),
('iso_s3', 'Wall Accelerative Punch-Switch (Rapid Recoil)', 'Lean against wall at 45 deg acceleration angle. Explosively cycle and punch thigh forward, locking stance hip in full extension.', 'isometric_switch', 0, '4', '8', '', '60s', 'reps', 'Horizontal', 'Fast-SSC (<250ms)', 'Medium', 'Starting Strength (>1.3 m/s)', '5-10%'),

-- Hamstrings Hip-Extension
('ham_h1', 'Romanian Deadlift (Barbell / Dumbbell)', 'Hip hinge targeting hamstring lengthening and eccentric strength. Push hips back, slight knee bend, flat back.', 'strength_hamstrings_hip', 75, '4', '6', '', '2.5 min', 'reps', 'Horizontal', 'Slow-SSC (>250ms)', 'Medium', 'Accelerative Strength (0.50-0.75 m/s)', '15%'),
('ham_h2', 'Single-Leg Romanian Deadlift (Contralateral Load)', 'Dumbbell in opposite hand of working leg. Develops pelvic stability, hamstring eccentric control, and foot-ground tripod.', 'strength_hamstrings_hip', 65, '3', '6', '', '90s', 'reps', 'Horizontal', 'Slow-SSC (>250ms)', 'Medium', 'Accelerative Strength (0.50-0.75 m/s)', '15%'),
('ham_h3', 'Barbell Good Mornings', 'Bar placed across upper traps. Hinge forward at hips with soft knees until torso is near parallel with floor. High glute/hamstring tension.', 'strength_hamstrings_hip', 60, '3', '8', '', '2 min', 'reps', 'Horizontal', 'Non-SSC / Concentric', 'Medium', 'Accelerative Strength (0.50-0.75 m/s)', '15%'),

-- Hamstrings Knee-Flexion
('ham_k1', 'Nordic Hamstring Curl', 'Gold-standard eccentric knee flexion for hamstring strain prevention and fascicle length increase. Control fall as long as possible.', 'strength_hamstrings_knee', 0, '3', '5', '', '2.5 min', 'reps', 'Horizontal', 'Non-SSC / Concentric', 'High', 'Absolute Strength (0.15-0.35 m/s)', '10%'),
('ham_k2', 'Razor Curl (Knee-Flexion Overload)', 'Similar to Nordic curl but with 90 deg hip flexion maintained. Dramatically targets semitendinosus and biceps femoris.', 'strength_hamstrings_knee', 0, '3', '5', '', '2 min', 'reps', 'Horizontal', 'Non-SSC / Concentric', 'Medium', 'Absolute Strength (0.15-0.35 m/s)', '10%'),
('ham_k3', 'Swiss Ball Hamstring Curl', 'Supine on floor, heels on stability ball. Elevate hips into bridge and curl heels towards glutes while keeping hips extended.', 'strength_hamstrings_knee', 0, '3', '10', '', '60s', 'reps', 'Horizontal', 'Slow-SSC (>250ms)', 'Low', 'Strength-Speed (0.75-1.0 m/s)', '15%'),
('ham_k4', 'Prone Leg Curl (Eccentric Overload 2-Up, 1-Down)', 'Curl weight with both legs, then lower slowly with one leg over 4 seconds. Maximizes eccentric hypertrophy and tendon thickness.', 'strength_hamstrings_knee', 70, '3', '6', '', '90s', 'reps', 'Horizontal', 'Slow-SSC (>250ms)', 'Medium', 'Accelerative Strength (0.50-0.75 m/s)', '15%'),

-- Resisted Sprints
('res_s1', 'Heavy Sled Sprint: 10-20m (50% Vdec)', 'Heavy sled resistance calibrated to reduce maximum sprint velocity by 50%. Maximizes horizontal propulsive ground force (F0).', 'speed_resisted', 100, '4', '1', '20', '4 min', 'meters', 'Horizontal', 'Fast-SSC (<250ms)', 'High', 'Starting Strength (>1.3 m/s)', '5-10%'),
('res_s2', 'Moderate Sled Sprint: 20-30m (25% Vdec)', 'Moderate load (25% velocity decrement). Bridges maximal horizontal force into transitional acceleration mechanics.', 'speed_resisted', 100, '4', '1', '30', '4 min', 'meters', 'Horizontal', 'Fast-SSC (<250ms)', 'High', 'Starting Strength (>1.3 m/s)', '5-10%'),
('res_s3', 'Light Sled Sprint: 30-40m (10% Vdec)', 'Light load sled sprint (10% velocity decrement). High velocity horizontal force development with minimal technical degradation.', 'speed_resisted', 100, '3', '1', '40', '4 min', 'meters', 'Horizontal', 'Fast-SSC (<250ms)', 'High', 'Speed (>1.3 m/s)', '5%'),
('res_s4', 'Contrast Sled Sprint: 20m Sled + 20m Unresisted', 'Heavy 50% Vdec sled sprint immediately unclipped into a 20m unresisted acceleration sprint to leverage Post-Activation Potentiation (PAP).', 'speed_resisted', 100, '3', '1', '40', '5 min', 'meters', 'Horizontal', 'Fast-SSC (<250ms)', 'High', 'Starting Strength (>1.3 m/s)', '5-10%'),

-- Assisted / Wickets
('res_s5', 'Wicket Drill: Max Velocity Spacing (1.8m - 2.1m)', 'Runs over mini hurdles spaced to force vertical force application, front-side mechanics, and prevent excessive backside kick.', 'speed_assisted', 95, '5', '1', '40', '3.5 min', 'meters', 'Vertical', 'Fast-SSC (<250ms)', 'High', 'Speed (>1.3 m/s)', '5%'),
('res_s6', 'Over-Speed Tow / Slight Downhill Sprint: 30-40m (102% Vmax)', 'Assisted sprint on 1.5% decline or gentle pulley assistance to induce supra-maximal neuromuscular firing and shorter contact times.', 'speed_assisted', 102, '3', '1', '40', '5 min', 'meters', 'Horizontal', 'Fast-SSC (<250ms)', 'High', 'Speed (>1.3 m/s)', '5%')

ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    details = EXCLUDED.details,
    type = EXCLUDED.type,
    percentage = EXCLUDED.percentage,
    sets = EXCLUDED.sets,
    reps = EXCLUDED.reps,
    distance = EXCLUDED.distance,
    rest = EXCLUDED.rest,
    unit = EXCLUDED.unit,
    force_vector = EXCLUDED.force_vector,
    ssc_type = EXCLUDED.ssc_type,
    cns_demand = EXCLUDED.cns_demand,
    vbt_zone = EXCLUDED.vbt_zone,
    velocity_loss_cutoff = EXCLUDED.velocity_loss_cutoff;
