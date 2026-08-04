-- ====================================================================
-- TRACK LAB - ANAEROBIC CAPACITY & ANAEROBIC LACTIC POWER DRILLS SEED
-- ====================================================================

INSERT INTO public.track_library_drills (id, title, details, type, percentage, sets, reps, distance, rest, unit) VALUES
('ac1', '400m Repetitions (6x400m)', '6x400m @ 65-75% intensity with 1:2 active rest ratio. Total volume: 2400m. Focuses on developing lactic tolerance and anaerobic capacity.', 'anaerobic_capacity', 70, '1', '6', '400', '1:2 active', 'meters'),
('ac2', '500m Repetitions (4x500m)', '4x500m @ 65-75% intensity with 1:2 active rest ratio. Total volume: 2000m. Expands anaerobic buffer capacity for 800m runners.', 'anaerobic_capacity', 70, '1', '4', '500', '1:2 active', 'meters'),
('ac3', 'Pyramid 400-500-600m (2700m Vol)', '2 sets of (400m - 500m - 600m) @ 65-75% intensity with 1:2 active rest ratio between reps and sets. Total volume: 2700m.', 'anaerobic_capacity', 70, '2', '3', '1350', '1:2 active', 'meters'),
('ac4', '600m Repetitions (5x600m)', '4-5x600m @ 65-75% intensity with 1:2 active rest ratio. Total volume: 3000m. Develops high-volume anaerobic stamina.', 'anaerobic_capacity', 70, '1', '5', '600', '1:2 active', 'meters'),
('ac5', 'Extended Pyramid 400-500-600m (3000m Vol)', '2 sets of (400m - 500m - 600m) high-volume pyramid @ 65-75% intensity with 1:2 active rest ratio. Total volume: 3000m.', 'anaerobic_capacity', 70, '2', '3', '1500', '1:2 active', 'meters'),
('ac6', 'Combo 500m & 400m (3x500m + 3x400m)', '3x500m followed by 3x400m @ 65-75% intensity with 1:2 active rest ratio. Total volume: 2700m.', 'anaerobic_capacity', 70, '2', '3', '1350', '1:2 active', 'meters'),
('alp1', '100m Lactic Power Sprints (12x100m)', '12x100m @ 75-85% intensity with 1:4 active rest ratio. Total volume: 1200m. Develops neuromuscular anaerobic power and lactate production capacity.', 'anaerobic_lactic_power', 80, '1', '12', '100', '1:4 active', 'meters'),
('alp2', '150m Lactic Power Sprints (10x150m)', '10x150m @ 75-85% intensity with 1:4 active rest ratio. Total volume: 1500m. Builds explosive lactic power and speed maintenance.', 'anaerobic_lactic_power', 80, '1', '10', '150', '1:4 active', 'meters'),
('alp3', '200m Lactic Power Sprints (8x200m)', '8x200m @ 75-85% intensity with 1:4 active rest ratio. Total volume: 1600m. Builds maximum lactic power for 400m/800m athletes.', 'anaerobic_lactic_power', 80, '1', '8', '200', '1:4 active', 'meters'),
('alp4', '250m Lactic Power Sprints (6x250m)', '6x250m @ 75-85% intensity with 1:4 active rest ratio. Total volume: 1500m. Specific anaerobic power training for mid-distance finishing speed.', 'anaerobic_lactic_power', 80, '1', '6', '250', '1:4 active', 'meters'),
('alp5', '300m Lactic Power Sprints (5x300m)', '5x300m @ 75-85% intensity with 1:4 active rest ratio. Total volume: 1500m. Severe anaerobic lactic power stimulus for 400m/800m performance.', 'anaerobic_lactic_power', 80, '1', '5', '300', '1:4 active', 'meters')
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
