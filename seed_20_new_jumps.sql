-- ====================================================================
-- TRACK LAB - 20 NEW ELITE LONG JUMP & TRIPLE JUMP DRILLS
-- ====================================================================
-- Copy and paste this script directly into the Supabase SQL Editor and run it!

INSERT INTO public.track_library_drills (id, title, details, type, percentage, sets, reps, distance, rest, unit) VALUES
-- === LONG JUMP (10 NEW DRILLS) ===
('lj11', 'Pop-Up Takeoff from 2-4 Strides', 'Focus on rapid penultimate-to-ultimate contact. Jump high into the pit landing on the takeoff leg or butt.', 'long_jump', 85, '4', '5', NULL, '2m', 'contacts'),
('lj12', 'Hitch-Kick Technique on Springboard', 'Use a low springboard or trampoline to gain air time. Practice cycling the legs (hitch-kick) in the air.', 'long_jump', 90, '3', '5', NULL, '3m', 'contacts'),
('lj13', 'Standing Triple Broad Jump (Continuous)', 'Three consecutive standing broad jumps focusing on horizontal energy conservation and low takeoff angles.', 'long_jump', 95, '3', '4', NULL, '2.5m', 'contacts'),
('lj14', 'Running Penultimate Drop Walkthroughs', '4-6 strides walk/jog-throughs focusing on dropping the hips on the penultimate step and rolling onto the takeoff foot.', 'long_jump', 75, '4', '6', NULL, '1.5m', 'contacts'),
('lj15', 'Band-Resisted runway takeoff strides', 'Runway sprints with band resistance for 10-15m, focusing on high hip projection and strong knee drive at takeoff.', 'long_jump', 90, '4', '3', NULL, '3m', 'contacts'),
('lj16', 'Takeoff over High Foam Barrier', 'Take off from runway and jump over a 50-70cm soft foam barrier placed at the board to force vertical lift.', 'long_jump', 95, '3', '4', NULL, '3m', 'contacts'),
('lj17', 'Hang Technique Suspension Drill', 'Jump from short approach. Stretch body long in the air (hang position) with hips forward, then sweep legs.', 'long_jump', 85, '4', '4', NULL, '2m', 'contacts'),
('lj18', 'Velocity-Maintenance Runway Runs', 'Speed checks on runway. Run full approach with takeoff mechanics but do not jump, just step off.', 'long_jump', 98, '4', '1', '40', '4m', 'meters'),
('lj19', 'Single-Leg Box Drops to Takeoff', 'Step off a 20cm box with the takeoff leg, immediately react and explode into a vertical pop-up.', 'long_jump', 90, '3', '5', NULL, '2m', 'contacts'),
('lj20', 'Long Jump Landing Sweep Drill', 'Standing or short approach jump focusing purely on sweeping the arms forward and extending legs fully into sand.', 'long_jump', 80, '4', '5', NULL, '2m', 'contacts'),

-- === TRIPLE JUMP (10 NEW DRILLS) ===
('tj11', 'Continuous Step-Phase Bounding', 'Perform consecutive step-phase bounds on the same leg. Promotes knee drive suspension and hip strength.', 'triple_jump', 90, '3', '6', NULL, '3m', 'contacts'),
('tj12', 'Speed-Bound Rhythm Drill', 'Alternating continuous Triple Jump sequences on grass for 30 meters. Focus on rhythm and posture.', 'triple_jump', 85, '4', '4', NULL, '3m', 'contacts'),
('tj13', 'Box-to-Box Step Phase (30cm boxes)', 'Take off from a box, land on the same leg on the ground, then drive onto a second box. Teaches shock absorption.', 'triple_jump', 92, '4', '4', NULL, '3m', 'contacts'),
('tj14', 'Standing Hop-Step-Jump into Pit', 'Triple jump from a standing position. Focuses on producing horizontal power from zero velocity.', 'triple_jump', 85, '4', '4', NULL, '2m', 'contacts'),
('tj15', 'Cone-Spaced Hop-Step-Jump', 'Place markers on the runway at set distances to enforce equal-length phases. Focuses on flat, fast phases.', 'triple_jump', 90, '4', '3', NULL, '3m', 'contacts'),
('tj16', 'Elevated Hop Landing Box-Drop', 'Perform Hop phase from runway landing onto a 15cm elevated soft mat/box. Reduces impact and teaches early foot recovery.', 'triple_jump', 90, '3', '4', NULL, '3m', 'contacts'),
('tj17', 'Step-Phase Knee Lock Isometric Holds', 'Jump-bounds with an exaggerated knee-drive hold (90 degrees) in mid-air during the step phase.', 'triple_jump', 80, '4', '6', NULL, '2m', 'contacts'),
('tj18', 'Speed Bounds with Weighted Belt (2kg)', 'Continuous alternative leg bounding on grass with a light weight belt. Focus on flat foot clawing action.', 'triple_jump', 90, '3', '8', NULL, '2.5m', 'contacts'),
('tj19', 'Runup Triple Jump with Shortened Board', 'Runway jump with shortened board (e.g. 9m/11m) to focus on maximum velocity transfer without board-anxiety.', 'triple_jump', 98, '3', '2', NULL, '4m', 'contacts'),
('tj20', 'Double-Arm Swing Coordination Bounds', 'Bounding drills focusing exclusively on the double-arm punch technique at the takeoff of each phase.', 'triple_jump', 85, '4', '6', NULL, '2m', 'contacts')

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
