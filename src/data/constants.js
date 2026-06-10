export const INITIAL_ATHLETES = [
  {
    id: 'bolt-id-123',
    name: 'Usain Bolt',
    birthYear: 1986,
    weight: 94,
    height: 195,
    bodyFat: 7.5,
    verticalJump: 102,
    standingLongJump: 3.45,
    squatJump: 68,
    clean: 145,
    halfSquat: 220,
    quarterSquat: 280,
    fullSquat: 180,
    bench: 130,
    deadlift: 240,
    m100: 9.58,
    m150: 14.35,
    m200: 19.19,
    m300: 30.97,
    m400: 45.28,
  },
  {
    id: 'coleman-id-456',
    name: 'Christian Coleman',
    birthYear: 1996,
    weight: 75,
    height: 175,
    bodyFat: 6.2,
    verticalJump: 114,
    standingLongJump: 3.61,
    squatJump: 78,
    clean: 155,
    halfSquat: 240,
    quarterSquat: 300,
    fullSquat: 200,
    bench: 140,
    deadlift: 260,
    m100: 9.76,
    m150: 14.65,
    m200: 19.85,
    m300: 32.12,
    m400: 47.95,
  },
  {
    id: 'lyles-id-789',
    name: 'Noah Lyles',
    birthYear: 1997,
    weight: 70,
    height: 180,
    bodyFat: 6.5,
    verticalJump: 108,
    standingLongJump: 3.52,
    squatJump: 72,
    clean: 150,
    halfSquat: 230,
    quarterSquat: 290,
    fullSquat: 190,
    bench: 135,
    deadlift: 250,
    m100: 9.83,
    m150: 14.48,
    m200: 19.31,
    m300: 31.85,
    m400: 47.24,
  }
];

export const DAYS_OF_WEEK = [
  'Saturday',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday'
];

export const INITIAL_LIBRARY = {
  drills: [
    // === SPEED/SPRINTING (TRACK) - 20 DRILLS ===
    { id: 's1', title: '10m Acceleration Sprints', details: 'Focus on low torso angles and dynamic horizontal projection.', type: 'speed', percentage: 100, sets: '5', reps: '1', distance: '10', rest: '2m', unit: 'meters' },
    { id: 's2', title: '20m Acceleration Sprints', details: 'Maintain powerful piston-like leg drive and aggressive arm action.', type: 'speed', percentage: 100, sets: '4', reps: '1', distance: '20', rest: '3m', unit: 'meters' },
    { id: 's3', title: '30m Fly Sprints', details: '20m build up zone, 30m maximum speed zone. Stay tall and vertical.', type: 'speed', percentage: 100, sets: '3', reps: '1', distance: '30', rest: '5m', unit: 'meters' },
    { id: 's4', title: '60m Max Velocity Sprints', details: 'Full sprint focusing on relaxed shoulders, upright posture, and rapid recovery.', type: 'speed', percentage: 100, sets: '4', reps: '1', distance: '60', rest: '6m', unit: 'meters' },
    { id: 's5', title: 'Block Starts Practice', details: 'React to gunshot cue. Explode from blocks, triple extension.', type: 'speed', percentage: 100, sets: '6', reps: '1', distance: '20', rest: '3m', unit: 'meters' },
    { id: 's6', title: 'Resisted Sled Sprints', details: 'Use sled equal to 10% body weight. Maintain powerful knee drive.', type: 'speed', percentage: 95, sets: '4', reps: '1', distance: '20', rest: '3m', unit: 'meters' },
    { id: 's7', title: 'Assisted Over-Speed Runs', details: 'Downhill or bungee assistance. Focus on rapid stride turnover.', type: 'speed', percentage: 102, sets: '3', reps: '1', distance: '30', rest: '4m', unit: 'meters' },
    { id: 's8', title: 'Curved Sprinting Drills', details: 'Sprint around curves focusing on lateral stability and arm swing.', type: 'speed', percentage: 95, sets: '4', reps: '1', distance: '40', rest: '3m', unit: 'meters' },
    { id: 's9', title: '150m Speed Endurance', details: 'High-intensity sprints maintaining technical integrity over distance.', type: 'speed', percentage: 95, sets: '3', reps: '1', distance: '150', rest: '8m', unit: 'meters' },
    { id: 's10', title: '300m Tempo Runs', details: 'Rhythmic striding for aerobic capacity. Focus on clean running mechanics.', type: 'speed', percentage: 80, sets: '4', reps: '1', distance: '300', rest: '4m', unit: 'meters' },
    { id: 's11', title: 'Transition Phase Runs', details: 'Focus on transitioning from acceleration drive block to upright max velocity.', type: 'speed', percentage: 100, sets: '4', reps: '1', distance: '40', rest: '4m', unit: 'meters' },
    { id: 's12', title: '20m Acceleration Block Starts', details: 'Low exit angle from block. Low heel recovery for first 5 steps.', type: 'speed', percentage: 100, sets: '5', reps: '1', distance: '20', rest: '3m', unit: 'meters' },
    { id: 's13', title: '30m Block Starts', details: 'Transition smooth acceleration into vertical projection.', type: 'speed', percentage: 100, sets: '4', reps: '1', distance: '30', rest: '4m', unit: 'meters' },
    { id: 's14', title: '40m Block Starts', details: 'Full drive phase up to 30m. Head down, relax upper body.', type: 'speed', percentage: 100, sets: '4', reps: '1', distance: '40', rest: '4m', unit: 'meters' },
    { id: 's15', title: '60m Sprints (Stands)', details: 'Upright max velocity mechanics. Front side mechanics focus.', type: 'speed', percentage: 98, sets: '3', reps: '1', distance: '60', rest: '5m', unit: 'meters' },
    { id: 's16', title: '120m Speed Endurance', details: 'High quality speed maintenance. Keep hips high at the finish line.', type: 'speed', percentage: 95, sets: '3', reps: '1', distance: '120', rest: '6m', unit: 'meters' },
    { id: 's17', title: '200m Tempo Strides', details: 'Aerobic restoration strides. 75% effort. Focus on posture and breathing.', type: 'speed', percentage: 75, sets: '6', reps: '1', distance: '200', rest: '3m', unit: 'meters' },
    { id: 's18', title: 'Hill Sprints', details: 'Explosive short uphill sprints. Overloads posterior chain.', type: 'speed', percentage: 100, sets: '6', reps: '1', distance: '30', rest: '3m', unit: 'meters' },
    { id: 's19', title: 'Bungee Resisted Sprints', details: 'Accelerate against bungee tension to build starting horizontal force.', type: 'speed', percentage: 95, sets: '4', reps: '1', distance: '15', rest: '3m', unit: 'meters' },
    { id: 's20', title: 'Over-Speed Towing Sprints', details: 'Bungee assisted max velocity. Focus on stride frequency.', type: 'speed', percentage: 103, sets: '3', reps: '1', distance: '40', rest: '4m', unit: 'meters' },

    // === PLYOMETRICS/JUMPS - 20 DRILLS ===
    { id: 'p1', title: 'Depth Jumps (40cm)', details: 'Step off box and instantly explode vertically. Minimize ground contact time.', type: 'plyometrics', percentage: 95, sets: '4', reps: '5', rest: '2m', unit: 'contacts' },
    { id: 'p2', title: 'Depth Jumps (60cm)', details: 'Elite reactive strength training. High box drop to vertical jump.', type: 'plyometrics', percentage: 98, sets: '4', reps: '4', rest: '3m', unit: 'contacts' },
    { id: 'p3', title: 'Hurdle Hops (Continuous)', details: 'Jump over 5 high hurdles continuously using double-leg rebound action.', type: 'plyometrics', percentage: 90, sets: '4', reps: '6', rest: '2.5m', unit: 'contacts' },
    { id: 'p4', title: 'Alternate Leg Bounding', details: 'Claw ground aggressively. Project hips high and forward.', type: 'plyometrics', percentage: 85, sets: '3', reps: '10', rest: '2m', unit: 'contacts' },
    { id: 'p5', title: 'Single-Leg Vertical Hops', details: 'Reactive vertical hopping on a single leg. Keep ankle locked.', type: 'plyometrics', percentage: 80, sets: '3', reps: '8', rest: '2m', unit: 'contacts' },
    { id: 'p6', title: 'Drop Jumps to Box', details: 'Drop from 30cm and immediately jump up onto a 60cm plyo box.', type: 'plyometrics', percentage: 90, sets: '4', reps: '5', rest: '2m', unit: 'contacts' },
    { id: 'p7', title: 'Standing Long Jump', details: 'Explode horizontally from a two-foot stance. Land softly with knees bent.', type: 'plyometrics', percentage: 95, sets: '4', reps: '3', rest: '2m', unit: 'contacts' },
    { id: 'p8', title: 'Triple Jump Bounds', details: 'Hop-Step-Jump bounding drills to build single-leg mechanical power.', type: 'plyometrics', percentage: 90, sets: '3', reps: '6', rest: '2m', unit: 'contacts' },
    { id: 'p9', title: 'Lateral Box Shuffles', details: 'Lateral plyometric transitions across a low box to build side-to-side force.', type: 'plyometrics', percentage: 75, sets: '3', reps: '12', rest: '1.5m', unit: 'contacts' },
    { id: 'p10', title: 'Tuck Jumps', details: 'Pull knees rapidly to chest at top of vertical leap. Land elastically.', type: 'plyometrics', percentage: 80, sets: '3', reps: '8', rest: '1.5m', unit: 'contacts' },
    { id: 'p11', title: 'Medicine Ball Overhead Throw', details: 'Triple extension backward throw of 4kg medicine ball for maximum distance.', type: 'plyometrics', percentage: 95, sets: '4', reps: '5', rest: '2m', unit: 'contacts' },
    { id: 'p12', title: 'Broad Jumps (Continuous)', details: '3 consecutive double-leg broad jumps for maximum distance. Focus on rapid rebound.', type: 'plyometrics', percentage: 95, sets: '3', reps: '3', rest: '2m', unit: 'contacts' },
    { id: 'p13', title: 'Single-Leg Hurdle Hops', details: 'Hop over 4 low hurdles on single leg. Maintain stable knee alignment.', type: 'plyometrics', percentage: 85, sets: '3', reps: '4', rest: '2m', unit: 'contacts' },
    { id: 'p14', title: 'Assisted Pogo Jumps', details: 'Hold high band for body weight assistance. Rapid elastic ankle hops.', type: 'plyometrics', percentage: 80, sets: '3', reps: '20', rest: '1m', unit: 'contacts' },
    { id: 'p15', title: 'Med Ball Slams to Jump', details: 'Slam a 5kg med ball explosively then transition into a max vertical jump.', type: 'plyometrics', percentage: 90, sets: '3', reps: '5', rest: '2m', unit: 'contacts' },
    { id: 'p16', title: 'Depth Drop to Broad Jump', details: 'Drop from 30cm box and rebound horizontally into a max distance broad jump.', type: 'plyometrics', percentage: 95, sets: '3', reps: '5', rest: '2m', unit: 'contacts' },
    { id: 'p17', title: 'Ankle Pogo Hops', details: 'Keep knees stiff, react solely through the ankle joint.', type: 'plyometrics', percentage: 85, sets: '3', reps: '15', rest: '1m', unit: 'contacts' },
    { id: 'p18', title: 'Lateral Barrier Hops', details: 'Rebound side-to-side over a 30cm foam barrier as rapidly as possible.', type: 'plyometrics', percentage: 80, sets: '3', reps: '10', rest: '1.5m', unit: 'contacts' },
    { id: 'p19', title: 'Loaded Squat Jumps', details: 'Hold light dumbbells (10% bodyweight). Jump explosively from half squat.', type: 'plyometrics', percentage: 70, sets: '4', reps: '6', rest: '2m', unit: 'contacts' },
    { id: 'p20', title: 'Staggered Stance Box Jumps', details: 'One foot on step. Drive upward onto a 50cm box, land in split stance.', type: 'plyometrics', percentage: 80, sets: '3', reps: '6', rest: '2m', unit: 'contacts' },

    // === WEIGHTROOM POWER (GYM) - 20 DRILLS ===
    { id: 'pw1', title: 'Power Clean from Hang', details: 'Explosive triple extension from above-knee position. Quick elbow catch.', type: 'power', percentage: 80, sets: '5', reps: '3', rest: '3m', unit: 'reps' },
    { id: 'pw2', title: 'Dumbbell Snatch', details: 'Single-arm power snatch from hang directly into overhead catch. Fast hips.', type: 'power', percentage: 75, sets: '4', reps: '4', rest: '2m', unit: 'reps' },
    { id: 'pw3', title: 'Push Jerk', details: 'Dip and drive under barbell. Catch with straight arms and locked knees.', type: 'power', percentage: 85, sets: '4', reps: '3', rest: '3m', unit: 'reps' },
    { id: 'pw4', title: 'Loaded Trap Bar Jumps', details: 'Squat and jump vertically with trap bar loaded to 20% of 1RM squat.', type: 'power', percentage: 60, sets: '4', reps: '5', rest: '2.5m', unit: 'reps' },
    { id: 'pw5', title: 'Medicine Ball Chest Slams', details: 'Slam ball to floor using full power of core and arms. Recoil instantly.', type: 'power', percentage: 90, sets: '3', reps: '8', rest: '1.5m', unit: 'reps' },
    { id: 'pw6', title: 'Kettlebell Swings (Heavy)', details: 'Hinge hips back. Explode forward. Drive kettlebell to eye level.', type: 'power', percentage: 80, sets: '4', reps: '10', rest: '2m', unit: 'reps' },
    { id: 'pw7', title: 'Barbell High Pulls', details: 'Explosive triple extension shrug pulling barbell to chest. Keep bar close.', type: 'power', percentage: 85, sets: '4', reps: '3', rest: '2.5m', unit: 'reps' },
    { id: 'pw8', title: 'Dumbbell Thrusters', details: 'Full front squat directly transitioning into explosive overhead press.', type: 'power', percentage: 70, sets: '3', reps: '6', rest: '2m', unit: 'reps' },
    { id: 'pw9', title: 'Power Clean from Floor', details: 'Full power clean pulling from floor. Keep spine neutral throughout.', type: 'power', percentage: 85, sets: '5', reps: '2', rest: '3m', unit: 'reps' },
    { id: 'pw10', title: 'Split Jerk', details: 'Dip and slide legs out into split stance while catching bar overhead.', type: 'power', percentage: 85, sets: '4', reps: '2', rest: '3m', unit: 'reps' },
    { id: 'pw11', title: 'Dumbbell Jump Squats', details: 'Hold light dumbbells. Squat and jump explosively. Land elastically.', type: 'power', percentage: 60, sets: '4', reps: '6', rest: '2m', unit: 'reps' },
    { id: 'pw12', title: 'Hang Snatch (Barbell)', details: 'Explosive barbell snatch starting from high hang.', type: 'power', percentage: 75, sets: '4', reps: '3', rest: '3m', unit: 'reps' },
    { id: 'pw13', title: 'Med Ball Underhand Scoop Throw', details: 'Throw 5kg medicine ball forward using full lower-body hip extension.', type: 'power', percentage: 90, sets: '3', reps: '6', rest: '1.5m', unit: 'reps' },
    { id: 'pw14', title: 'Kettlebell Clean and Press', details: 'Clean heavy kettlebell and press overhead in one smooth action.', type: 'power', percentage: 75, sets: '3', reps: '5', rest: '2m', unit: 'reps' },
    { id: 'pw15', title: 'Push Press (Barbell)', details: 'Barbell press from rack using quick lower body leg dip and explosive drive.', type: 'power', percentage: 80, sets: '4', reps: '4', rest: '2.5m', unit: 'reps' },
    { id: 'pw16', title: 'Hang Power Clean', details: 'Clean starting from hang above knees. Focus on aggressive second pull.', type: 'power', percentage: 80, sets: '5', reps: '3', rest: '2.5m', unit: 'reps' },
    { id: 'pw17', title: 'Snatch High Pull', details: 'Wide grip high pull from hang. Overloads upper back traps.', type: 'power', percentage: 80, sets: '4', reps: '4', rest: '2.5m', unit: 'reps' },
    { id: 'pw18', title: 'DB Push Press', details: 'Single-arm dynamic push press using legs to drive weight.', type: 'power', percentage: 75, sets: '3', reps: '6', rest: '1.5m', unit: 'reps' },
    { id: 'pw19', title: 'Kettlebell Snatch', details: 'Snatch kettlebell from hang in single continuous overhead motion.', type: 'power', percentage: 70, sets: '3', reps: '8', rest: '2m', unit: 'reps' },
    { id: 'pw20', title: 'Dumbbell Clean and Jerk', details: 'Clean dumbbells to shoulders, then jerk overhead explosively.', type: 'power', percentage: 75, sets: '4', reps: '5', rest: '2.5m', unit: 'reps' },

    // === MAXIMUM STRENGTH (GYM) - 20 DRILLS ===
    { id: 'st1', title: 'Barbell Back Squat', details: 'Deep squat below parallel. Maintain tight thoracic brace. Drive upright.', type: 'strength', percentage: 85, sets: '4', reps: '5', rest: '3m', unit: 'reps' },
    { id: 'st2', title: 'Romanian Deadlift (RDL)', details: 'Load glutes and hamstrings. Keep knees slightly bent. Hinge hips back.', type: 'strength', percentage: 75, sets: '4', reps: '6', rest: '2.5m', unit: 'reps' },
    { id: 'st3', title: 'Bulgarian Split Squat', details: 'Single leg strength. Rear foot elevated. Drive through front heel.', type: 'strength', percentage: 80, sets: '3', reps: '6', rest: '2m', unit: 'reps' },
    { id: 'st4', title: 'Bench Press', details: 'Lower bar to mid chest, flare elbows at 45 degrees. Explosive press.', type: 'strength', percentage: 85, sets: '4', reps: '5', rest: '3m', unit: 'reps' },
    { id: 'st5', title: 'Weighted Pull-ups', details: 'Full dead hang to chin above bar. Maintain core stability.', type: 'strength', percentage: 80, sets: '3', reps: '5', rest: '2m', unit: 'reps' },
    { id: 'st6', title: 'Front Squat', details: 'Upright torso, high elbows rack position. Keep knees aligned with toes.', type: 'strength', percentage: 80, sets: '4', reps: '4', rest: '3m', unit: 'reps' },
    { id: 'st7', title: 'Barbell Hip Thrusts', details: 'Squeeze glutes at top hold for 1s. Drive upper back into bench.', type: 'strength', percentage: 85, sets: '3', reps: '8', rest: '2m', unit: 'reps' },
    { id: 'st8', title: 'Heavy Dumbbell Rows', details: 'Support torso on bench. Pull dumbbell to hip. Focus on lat squeeze.', type: 'strength', percentage: 75, sets: '3', reps: '8', rest: '1.5m', unit: 'reps' },
    { id: 'st9', title: 'Overhead Press', details: 'Press barbell overhead in vertical line. Lock arms, push head through.', type: 'strength', percentage: 80, sets: '4', reps: '5', rest: '2.5m', unit: 'reps' },
    { id: 'st10', title: 'Overhead Lunges', details: 'Hold barbell overhead. Step forward into lunge. Maintain shoulder lock.', type: 'strength', percentage: 65, sets: '3', reps: '10', rest: '2m', unit: 'reps' },
    { id: 'st11', title: 'Dumbbell Bulgarian Split Squat (Heavy)', details: 'Elevate rear foot. Squat deep focusing on quad/glute strength.', type: 'strength', percentage: 80, sets: '3', reps: '8', rest: '2m', unit: 'reps' },
    { id: 'st12', title: 'Trap Bar Deadlift', details: 'Neutral grip deadlift. Pull with high hips and braced core.', type: 'strength', percentage: 80, sets: '4', reps: '5', rest: '3m', unit: 'reps' },
    { id: 'st13', title: 'Weighted Step-Ups', details: 'Step onto 50cm box holding dumbbells. Complete extension of hip.', type: 'strength', percentage: 70, sets: '3', reps: '8', rest: '1.5m', unit: 'reps' },
    { id: 'st14', title: 'Incline Bench Press', details: 'Press barbell from 30-degree incline. Upper chest focus.', type: 'strength', percentage: 80, sets: '4', reps: '6', rest: '2.5m', unit: 'reps' },
    { id: 'st15', title: 'Good Mornings (Barbell)', details: 'Barbell on back. Hinge hips back with soft knees, straight back.', type: 'strength', percentage: 70, sets: '3', reps: '8', rest: '2m', unit: 'reps' },
    { id: 'st16', title: 'Split Squat Drives', details: 'Hold dumbbells. Walk out into split, drive lead heel aggressively up.', type: 'strength', percentage: 75, sets: '3', reps: '6', rest: '2m', unit: 'reps' },
    { id: 'st17', title: 'Barbell Glute Bridge', details: 'Floor press glute extension with barbell on hips. Peak squeeze.', type: 'strength', percentage: 80, sets: '3', reps: '8', rest: '2m', unit: 'reps' },
    { id: 'st18', title: 'Chest Supported Row', details: 'Lie face down on incline bench. Pull dumbbells up for deep upper back load.', type: 'strength', percentage: 75, sets: '3', reps: '10', rest: '1.5m', unit: 'reps' },
    { id: 'st19', title: 'Heavy DB Split Squat', details: 'Hold two heavy dumbbells in split stance, lower knee to floor.', type: 'strength', percentage: 80, sets: '3', reps: '6', rest: '2m', unit: 'reps' },
    { id: 'st20', title: 'Military Press', details: 'Strict overhead standing press with barbell from shoulders. No leg assist.', type: 'strength', percentage: 80, sets: '4', reps: '5', rest: '2.5m', unit: 'reps' },

    // === ISOMETRICS, CORE & MOBILITY - 20 DRILLS ===
    { id: 'is1', title: 'Wall Sit Hold', details: '90 degree knee and hip angle. Push back flat against wall.', type: 'isometric', percentage: 50, sets: '3', reps: '45', rest: '1m', unit: 'sec' },
    { id: 'is2', title: 'Split Squat Isometric Hold', details: 'Hover back knee 2cm off floor. Maintain active core brace.', type: 'isometric', percentage: 60, sets: '3', reps: '30', rest: '1m', unit: 'sec' },
    { id: 'is3', title: 'Copenhagen Side Plank', details: 'Elevate top leg on bench. Keep bottom leg suspended. Tight adductor brace.', type: 'isometric', percentage: 65, sets: '3', reps: '20', rest: '1m', unit: 'sec' },
    { id: 'is4', title: 'Hamstring Bridge Hold', details: 'Heels dug into ground, knees bent at 45 degrees. Hold hip extension.', type: 'isometric', percentage: 50, sets: '3', reps: '30', rest: '1m', unit: 'sec' },
    { id: 'is5', title: 'Plank Shoulder Taps', details: 'Maintain perfect plank structure. Tap alternate shoulders.', type: 'isometric', percentage: 40, sets: '3', reps: '45', rest: '1m', unit: 'sec' },
    { id: 'is6', title: 'Soleus Calf Wall Sit Hold', details: 'Wall sit with heels fully elevated. Focuses on deep calf soleus loading.', type: 'isometric', percentage: 60, sets: '3', reps: '40', rest: '1m', unit: 'sec' },
    { id: 'is7', title: 'L-Sit Hold', details: 'Support body weight on parallel bars or floor. Hold legs straight horizontally.', type: 'isometric', percentage: 65, sets: '3', reps: '15', rest: '1m', unit: 'sec' },
    { id: 'is8', title: 'Plank Hold (Weighted)', details: 'Standard forearm plank with 15kg plate on back. Maintain neutral spine.', type: 'isometric', percentage: 60, sets: '3', reps: '60', rest: '1.5m', unit: 'sec' },
    { id: 'is9', title: 'Hollow Body Rock', details: 'Lower back glued to floor. Suspend feet and shoulders. Slow rock action.', type: 'core', percentage: 50, sets: '3', reps: '30', rest: '1m', unit: 'sec' },
    { id: 'is10', title: 'Pallof Press', details: 'Press cable/band forward. Resist rotational pull. Stay braced.', type: 'core', percentage: 50, sets: '3', reps: '30', rest: '1m', unit: 'sec' },
    { id: 'is11', title: 'Hanging Knee Raises', details: 'Focus on posterior pelvic tilt and pulling with lower abs.', type: 'core', percentage: 50, sets: '3', reps: '12', rest: '1m', unit: 'reps' },
    { id: 'is12', title: 'Russian Twists', details: 'Rotational core strength. Keep feet elevated and move under control.', type: 'core', percentage: 45, sets: '3', reps: '20', rest: '1m', unit: 'reps' },
    { id: 'is13', title: 'Ab Wheel Rollouts', details: 'Core extension strength. Do not arch lower back at extension.', type: 'core', percentage: 60, sets: '3', reps: '10', rest: '1.5m', unit: 'reps' },
    { id: 'is15', title: "World's Greatest Stretch", details: 'Step into deep lunge, rotate torso, extend hamstring.', type: 'mobility', percentage: null, sets: '3', reps: '5', rest: '1m', unit: 'reps' },
    { id: 'is16', title: '90/90 Hip Switches', details: 'Rhythmic internal/external hip rotation while seated.', type: 'mobility', percentage: null, sets: '2', reps: '10', rest: '45s', unit: 'reps' },
    { id: 'is17', title: 'Thoracic Rotations', details: 'Quadruped position, hand behind head, rotate elbow upward.', type: 'mobility', percentage: null, sets: '3', reps: '8', rest: '45s', unit: 'reps' },
    { id: 'is18', title: 'Deep Squat Prys', details: 'Sit in deep squat, use elbows to pry knees outward.', type: 'mobility', percentage: null, sets: '3', reps: '45', rest: '1m', unit: 'sec' },
    { id: 'is19', title: 'Adductor Rock-Backs', details: 'Quadruped with one leg extended laterally. Rock hips backward.', type: 'mobility', percentage: null, sets: '3', reps: '10', rest: '45s', unit: 'reps' },
    { id: 'is20', title: 'Ankle Dorsiflexion Mobilization', details: 'Use band or wall to drive knee forward over toe while keeping heel glued.', type: 'mobility', percentage: null, sets: '3', reps: '12', rest: '1m', unit: 'reps' },
    { id: 's46', title: 'Wickets Sprinting (Cones Run)', details: 'Speed drill running over 10-15 mini hurdles/cones spaced to optimize vertical posture, front-side mechanics, and stride frequency.', type: 'speed', percentage: 100, sets: '5', reps: '1', distance: '40', rest: '4m', unit: 'meters' },
    { id: 's47', title: 'Resisted Sled Release Sprints (20m+20m)', details: 'Sprint 20m resisted by sled, release sled and sprint 20m free to maximize neural acceleration.', type: 'speed', percentage: 100, sets: '3', reps: '2', distance: '40', rest: '5m', unit: 'meters' },
    { id: 's48', title: 'Assisted Bungee Overspeed Sprinting', details: 'Bungee pull-assistance to run 3-5% faster than maximum speed. Focus on stride frequency.', type: 'speed', percentage: 103, sets: '3', reps: '1', distance: '30', rest: '4m', unit: 'meters' },
    { id: 's49', title: '3-Point Acceleration Sprints (30m)', details: 'Sprint 30m from a 3-point track stance. Focus on piston-like drive and projection.', type: 'speed', percentage: 100, sets: '5', reps: '1', distance: '30', rest: '3m', unit: 'meters' },
    { id: 'lj1', title: 'Short-Approach Long Jump (6-8 Strides)', details: 'Runway approach of 6-8 strides. Focus on penultimate drop and explosive takeoff.', type: 'long_jump', percentage: 95, sets: '4', reps: '3', distance: null, rest: '3m', unit: 'contacts' },
    { id: 'lj2', title: 'Full-Approach Long Jump', details: 'Complete runway approach. Focus on maintaining max speed into takeoff board.', type: 'long_jump', percentage: 100, sets: '3', reps: '2', distance: null, rest: '5m', unit: 'contacts' },
    { id: 'lj3', title: 'Long Jump Takeoff from Box (15cm)', details: 'Low box takeoff. Enhances vertical lift and flight posture (hang or hitch-kick).', type: 'long_jump', percentage: 90, sets: '4', reps: '4', distance: null, rest: '2m', unit: 'contacts' },
    { id: 'lj4', title: 'Penultimate Step Takeoff sequence', details: 'Repeated short approach step-takeoff sequence. Lower center of gravity on last two steps.', type: 'long_jump', percentage: 80, sets: '5', reps: '5', distance: null, rest: '2m', unit: 'contacts' },
    { id: 'lj5', title: 'Depth Drop to Long Jump Takeoff', details: 'Step off a 30cm box, land, and immediately perform a horizontal long jump takeoff.', type: 'long_jump', percentage: 95, sets: '3', reps: '4', distance: null, rest: '3m', unit: 'contacts' },
    { id: 'lj6', title: 'Single-Leg Speed Hops to Pit', details: 'Reactively hop on takeoff leg over 5 low hurdles into pit.', type: 'long_jump', percentage: 85, sets: '3', reps: '5', distance: null, rest: '3m', unit: 'contacts' },
    { id: 'lj7', title: 'Weighted Vest Long Jump Approaches', details: 'Execute 6-stride jumps wearing a 5kg weighted vest to build specific takeoff power.', type: 'long_jump', percentage: 90, sets: '3', reps: '3', distance: null, rest: '3m', unit: 'contacts' },
    { id: 'lj8', title: 'Double-Leg Broad Jump to Sand Pit', details: 'Horizontal explosive power from standing two-foot position.', type: 'long_jump', percentage: 90, sets: '4', reps: '5', distance: null, rest: '2m', unit: 'contacts' },
    { id: 'lj9', title: 'Hurdle Hops to Long Jump Takeoff', details: 'Elastic reactive takeoff immediately after landing over a hurdle.', type: 'long_jump', percentage: 90, sets: '4', reps: '4', distance: null, rest: '3m', unit: 'contacts' },
    { id: 'lj10', title: 'Runway Acceleration Strides (30-40m)', details: 'Sprinting on runway with takeoff simulation. Maintain tall and relaxed posture.', type: 'long_jump', percentage: 95, sets: '5', reps: '1', distance: '40', rest: '3m', unit: 'meters' },
    { id: 'lj11', title: 'Pop-Up Takeoff from 2-4 Strides', details: 'Focus on rapid penultimate-to-ultimate contact. Jump high into the pit landing on the takeoff leg or butt.', type: 'long_jump', percentage: 85, sets: '4', reps: '5', distance: null, rest: '2m', unit: 'contacts' },
    { id: 'lj12', title: 'Hitch-Kick Technique on Springboard', details: 'Use a low springboard or trampoline to gain air time. Practice cycling the legs (hitch-kick) in the air.', type: 'long_jump', percentage: 90, sets: '3', reps: '5', distance: null, rest: '3m', unit: 'contacts' },
    { id: 'lj13', title: 'Standing Triple Broad Jump (Continuous)', details: 'Three consecutive standing broad jumps focusing on horizontal energy conservation and low takeoff angles.', type: 'long_jump', percentage: 95, sets: '3', reps: '4', distance: null, rest: '2.5m', unit: 'contacts' },
    { id: 'lj14', title: 'Running Penultimate Drop Walkthroughs', details: '4-6 strides walk/jog-throughs focusing on dropping the hips on the penultimate step and rolling onto the takeoff foot.', type: 'long_jump', percentage: 75, sets: '4', reps: '6', distance: null, rest: '1.5m', unit: 'contacts' },
    { id: 'lj15', title: 'Band-Resisted runway takeoff strides', details: 'Runway sprints with band resistance for 10-15m, focusing on high hip projection and strong knee drive at takeoff.', type: 'long_jump', percentage: 90, sets: '4', reps: '3', distance: null, rest: '3m', unit: 'contacts' },
    { id: 'lj16', title: 'Takeoff over High Foam Barrier', details: 'Take off from runway and jump over a 50-70cm soft foam barrier placed at the board to force vertical lift.', type: 'long_jump', percentage: 95, sets: '3', reps: '4', distance: null, rest: '3m', unit: 'contacts' },
    { id: 'lj17', title: 'Hang Technique Suspension Drill', details: 'Jump from short approach. Stretch body long in the air (hang position) with hips forward, then sweep legs.', type: 'long_jump', percentage: 85, sets: '4', reps: '4', distance: null, rest: '2m', unit: 'contacts' },
    { id: 'lj18', title: 'Velocity-Maintenance Runway Runs', details: 'Speed checks on runway. Run full approach with takeoff mechanics but do not jump, just step off.', type: 'long_jump', percentage: 98, sets: '4', reps: '1', distance: '40', rest: '4m', unit: 'meters' },
    { id: 'lj19', title: 'Single-Leg Box Drops to Takeoff', details: 'Step off a 20cm box with the takeoff leg, immediately react and explode into a vertical pop-up.', type: 'long_jump', percentage: 90, sets: '3', reps: '5', distance: null, rest: '2m', unit: 'contacts' },
    { id: 'lj20', title: 'Long Jump Landing Sweep Drill', details: 'Standing or short approach jump focusing purely on sweeping the arms forward and extending legs fully into sand.', type: 'long_jump', percentage: 80, sets: '4', reps: '5', distance: null, rest: '2m', unit: 'contacts' },
    { id: 'tj1', title: 'Triple Jump - Short Approach (6-8 Strides)', details: 'Short runup focusing on landing phase coordination and Hop-Step-Jump rhythm.', type: 'triple_jump', percentage: 95, sets: '4', reps: '3', distance: null, rest: '4m', unit: 'contacts' },
    { id: 'tj2', title: 'Full-Approach Triple Jump', details: 'Full runway speed. Focus on even phase distribution (33% Hop, 30% Step, 37% Jump).', type: 'triple_jump', percentage: 100, sets: '3', reps: '2', distance: null, rest: '6m', unit: 'contacts' },
    { id: 'tj3', title: 'Continuous Hop Phase Bounds (RRR / LLL)', details: 'Repetitive single-leg hops to develop specific landing stiffness.', type: 'triple_jump', percentage: 85, sets: '3', reps: '6', distance: null, rest: '3m', unit: 'contacts' },
    { id: 'tj4', title: 'Hop-to-Step Phase transition', details: 'Focus on jumping from landing leg and driving opposite knee up for the Step phase.', type: 'triple_jump', percentage: 90, sets: '4', reps: '4', distance: null, rest: '3m', unit: 'contacts' },
    { id: 'tj5', title: 'Step-to-Jump Phase transition', details: 'Elevated step phase bounding into the sand pit. Develops hip strength.', type: 'triple_jump', percentage: 90, sets: '4', reps: '4', distance: null, rest: '3m', unit: 'contacts' },
    { id: 'tj6', title: 'Alternate Leg Bounding to Pit (RLRL)', details: 'Maximal horizontal projection bounds focusing on active clawing motion.', type: 'triple_jump', percentage: 90, sets: '3', reps: '10', distance: null, rest: '3m', unit: 'contacts' },
    { id: 'tj7', title: 'Depth Drop to Triple Jump Takeoff', details: 'Step off a 30cm box, land, and immediately perform a triple jump Hop phase.', type: 'triple_jump', percentage: 95, sets: '3', reps: '4', distance: null, rest: '3m', unit: 'contacts' },
    { id: 'tj8', title: 'Single-Leg Speed Hops over Foam Obstacles', details: 'Reactively hop on takeoff leg over 5 low hurdles into pit.', type: 'triple_jump', percentage: 85, sets: '3', reps: '5', distance: null, rest: '3m', unit: 'contacts' },
    { id: 'tj9', title: 'Medicine Ball Hop-Step Throws', details: 'Perform Hop-Step sequence while launching a 4kg med ball forward.', type: 'triple_jump', percentage: 90, sets: '4', reps: '5', distance: null, rest: '2m', unit: 'contacts' },
    { id: 'tj10', title: 'Weighted Vest Triple Jump Approaches', details: 'Execute 6-stride triple jumps wearing a 5kg weighted vest.', type: 'triple_jump', percentage: 90, sets: '3', reps: '3', distance: null, rest: '3m', unit: 'contacts' },
    { id: 'tj11', title: 'Continuous Step-Phase Bounding', details: 'Perform consecutive step-phase bounds on the same leg. Promotes knee drive suspension and hip strength.', type: 'triple_jump', percentage: 90, sets: '3', reps: '6', distance: null, rest: '3m', unit: 'contacts' },
    { id: 'tj12', title: 'Speed-Bound Rhythm Drill', details: 'Alternating continuous Triple Jump sequences on grass for 30 meters. Focus on rhythm and posture.', type: 'triple_jump', percentage: 85, sets: '4', reps: '4', distance: null, rest: '3m', unit: 'contacts' },
    { id: 'tj13', title: 'Box-to-Box Step Phase (30cm boxes)', details: 'Take off from a box, land on the same leg on the ground, then drive onto a second box. Teaches shock absorption.', type: 'triple_jump', percentage: 92, sets: '4', reps: '4', distance: null, rest: '3m', unit: 'contacts' },
    { id: 'tj14', title: 'Standing Hop-Step-Jump into Pit', details: 'Triple jump from a standing position. Focuses on producing horizontal power from zero velocity.', type: 'triple_jump', percentage: 85, sets: '4', reps: '4', distance: null, rest: '2m', unit: 'contacts' },
    { id: 'tj15', title: 'Cone-Spaced Hop-Step-Jump', details: 'Place markers on the runway at set distances to enforce equal-length phases. Focuses on flat, fast phases.', type: 'triple_jump', percentage: 90, sets: '4', reps: '3', distance: null, rest: '3m', unit: 'contacts' },
    { id: 'tj16', title: 'Elevated Hop Landing Box-Drop', details: 'Perform Hop phase from runway landing onto a 15cm elevated soft mat/box. Reduces impact and teaches early foot recovery.', type: 'triple_jump', percentage: 90, sets: '3', reps: '4', distance: null, rest: '3m', unit: 'contacts' },
    { id: 'tj17', title: 'Step-Phase Knee Lock Isometric Holds', details: 'Jump-bounds with an exaggerated knee-drive hold (90 degrees) in mid-air during the step phase.', type: 'triple_jump', percentage: 80, sets: '4', reps: '6', distance: null, rest: '2m', unit: 'contacts' },
    { id: 'tj18', title: 'Speed Bounds with Weighted Belt (2kg)', details: 'Continuous alternative leg bounding on grass with a light weight belt. Focus on flat foot clawing action.', type: 'triple_jump', percentage: 90, sets: '3', reps: '8', distance: null, rest: '2.5m', unit: 'contacts' },
    { id: 'tj19', title: 'Runup Triple Jump with Shortened Board', details: 'Runway jump with shortened board (e.g. 9m/11m) to focus on maximum velocity transfer without board-anxiety.', type: 'triple_jump', percentage: 98, sets: '3', reps: '2', distance: null, rest: '4m', unit: 'contacts' },
    { id: 'tj20', title: 'Double-Arm Swing Coordination Bounds', details: 'Bounding drills focusing exclusively on the double-arm punch technique at the takeoff of each phase.', type: 'triple_jump', percentage: 85, sets: '4', reps: '6', distance: null, rest: '2m', unit: 'contacts' },
    { id: 'end401', title: 'Extensive Tempo Intervals (6x200m)', details: 'Run 200m repetitions at 70-75% intensity. Focus on running relaxed with clean stride mechanics.', type: 'endurance_400', percentage: 75, sets: '1', reps: '6', distance: '200', rest: '2m', unit: 'meters' },
    { id: 'end402', title: 'Intensive Tempo Intervals (4x300m)', details: 'Run 300m repetitions at 80-85% intensity. Builds lactic capacity and metabolic efficiency.', type: 'endurance_400', percentage: 85, sets: '1', reps: '4', distance: '300', rest: '4m', unit: 'meters' },
    { id: 'end403', title: 'Special Endurance I (3x300m)', details: 'Sprints at 95% intensity. High recovery to ensure near-maximal speed endurance development.', type: 'endurance_400', percentage: 95, sets: '1', reps: '3', distance: '300', rest: '10m', unit: 'meters' },
    { id: 'end404', title: 'Special Endurance II (2x500m)', details: 'Overdistance runs at 90% intensity to build the late-race cardiovascular and lactic capacity.', type: 'endurance_400', percentage: 90, sets: '1', reps: '2', distance: '500', rest: '12m', unit: 'meters' },
    { id: 'end405', title: 'Speed Reserve Strides (8x100m)', details: 'Short, fast strides at 90% intensity with complete recovery. Develops relaxed sprint mechanics.', type: 'endurance_400', percentage: 90, sets: '1', reps: '8', distance: '100', rest: '2m', unit: 'meters' },
    { id: 'end406', title: 'Critical Velocity Intervals (5x400m)', details: 'Standard 400m runs at 80% intensity to build specific pacing and aerobic support.', type: 'endurance_400', percentage: 80, sets: '1', reps: '5', distance: '400', rest: '3m', unit: 'meters' },
    { id: 'end407', title: 'Lactic Acid Split Run (300m + 100m)', details: 'Run 300m max effort, rest 45 seconds, then run 100m max effort. Simulates late race fatigue.', type: 'endurance_400', percentage: 98, sets: '3', reps: '1', distance: '400', rest: '15m', unit: 'meters' },
    { id: 'end408', title: 'Anaerobic Capacity Event Run (350m)', details: 'Single near-maximum effort run of 350m. Builds primary race-pace endurance.', type: 'endurance_400', percentage: 100, sets: '1', reps: '1', distance: '350', rest: '15m', unit: 'meters' },
    { id: 'end409', title: 'Floating Pace Reps (3x400m Float/Sprint)', details: 'Run 400m alternating 50m stride / 50m float (relaxed sprint) to build neural efficiency.', type: 'endurance_400', percentage: 85, sets: '1', reps: '3', distance: '400', rest: '6m', unit: 'meters' },
    { id: 'end410', title: 'Segment Acceleration Runs (4x250m)', details: 'Accelerate progressively every 50m. Teaches pacing control and sprint posture.', type: 'endurance_400', percentage: 88, sets: '1', reps: '4', distance: '250', rest: '4m', unit: 'meters' },
    { id: 'end801', title: 'Aerobic Power Intervals (6x800m)', details: 'Run 800m intervals at 85% VO2 Max. High aerobic development for mid-distance runners.', type: 'endurance_800', percentage: 85, sets: '1', reps: '6', distance: '800', rest: '3m', unit: 'meters' },
    { id: 'end802', title: 'Lactic Capacity Runs (3x600m)', details: 'Run 600m at 90% target 800m pace. Heavy lactic acid accumulation training.', type: 'endurance_800', percentage: 90, sets: '1', reps: '3', distance: '600', rest: '8m', unit: 'meters' },
    { id: 'end803', title: 'Speed Endurance Repetitions (8x200m)', details: 'Fast 200m runs at 90% intensity with short recoveries. Sharpens speed under fatigue.', type: 'endurance_800', percentage: 90, sets: '1', reps: '8', distance: '200', rest: '90s', unit: 'meters' },
    { id: 'end804', title: 'Critical Velocity Runs (8x400m)', details: '400m intervals at 10k pace (approx. 80% intensity). Builds aerobic threshold capacity.', type: 'endurance_800', percentage: 80, sets: '1', reps: '8', distance: '400', rest: '75s', unit: 'meters' },
    { id: 'end805', title: 'Hill Resistance Intervals (10x150m Uphill)', details: 'Uphill running at 90% effort. Builds power, stride length, and cardiovascular capacity.', type: 'endurance_800', percentage: 90, sets: '1', reps: '10', distance: '150', rest: '2m', unit: 'meters' },
    { id: 'end806', title: 'Aerobic Threshold Continuous Run (25 min)', details: '25-minute continuous run at aerobic threshold (approx 75-80% HRmax) for base conditioning.', type: 'endurance_800', percentage: 75, sets: '1', reps: '1', distance: '6000', rest: '0m', unit: 'meters' },
    { id: 'end807', title: 'Anaerobic Capacity Intervals (4x400m)', details: '400m runs at 95% target 800m pace. Focus on high stride frequency and power.', type: 'endurance_800', percentage: 95, sets: '1', reps: '4', distance: '400', rest: '5m', unit: 'meters' },
    { id: 'end808', title: 'Sprint-to-Float-to-Sprint (3x400m)', details: 'Run 400m: 100m sprint, 200m float, 100m sprint. Simulates tactical race situations.', type: 'endurance_800', percentage: 90, sets: '1', reps: '3', distance: '400', rest: '5m', unit: 'meters' },
    { id: 'end809', title: 'Kick Simulation Run (4x400m Cruise/Kick)', details: 'Run 300m cruising pace, then kick hard for final 100m. Simulates end-of-race sprint.', type: 'endurance_800', percentage: 92, sets: '1', reps: '4', distance: '400', rest: '6m', unit: 'meters' },
    { id: 'end810', title: 'Overdistance Aerobic Intervals (4x1000m)', details: '1000m runs at 90% VO2 Max. Develops aerobic engine and threshold pacing.', type: 'endurance_800', percentage: 85, sets: '1', reps: '4', distance: '1000', rest: '4m', unit: 'meters' },
    { id: 'endeas1', title: 'Recovery Jog (30 min)', details: 'Continuous slow recovery jog at 60-65% intensity. Promotes circulation and muscle regeneration.', type: 'endurance_easy', percentage: 65, sets: '1', reps: '1', distance: '4000', rest: '0m', unit: 'meters' },
    { id: 'endeas2', title: 'Aerobic Regeneration Run (45 min)', details: 'Flat continuous easy run at 65-70% intensity to build capillary density and aerobic base.', type: 'endurance_easy', percentage: 70, sets: '1', reps: '1', distance: '6000', rest: '0m', unit: 'meters' },
    { id: 'endeas3', title: 'Easy Run with Speed Strides', details: '30 minutes easy run followed by 5 relaxed 80m stride-ups at 85% intensity on grass.', type: 'endurance_easy', percentage: 70, sets: '1', reps: '1', distance: '4000', rest: '0m', unit: 'meters' },
    { id: 'endeas4', title: 'Conversational Pace Run (50 min)', details: '50 minutes continuous running at conversational pace. Ideal for base conditioning.', type: 'endurance_easy', percentage: 68, sets: '1', reps: '1', distance: '7500', rest: '0m', unit: 'meters' },
    { id: 'endeas5', title: 'Active Post-Race Flush Jog (20 min)', details: 'Short, very slow active recovery jog to flush metabolic waste and reduce soreness.', type: 'endurance_easy', percentage: 60, sets: '1', reps: '1', distance: '2500', rest: '0m', unit: 'meters' },
    { id: 'endeas6', title: 'Aerobic Fartlek Easy Run (40 min)', details: 'Easy jog incorporating occasional playful 30-second strides at 75% intensity every 5 minutes.', type: 'endurance_easy', percentage: 72, sets: '1', reps: '1', distance: '5500', rest: '0m', unit: 'meters' },
    { id: 'endeas7', title: 'Easy Trail / Grass Run (45 min)', details: 'Off-track running on soft surfaces to strengthen foot stabilizers and decrease joint impact.', type: 'endurance_easy', percentage: 68, sets: '1', reps: '1', distance: '6000', rest: '0m', unit: 'meters' },
    { id: 'endeas8', title: 'Base Endurance Long Run (60 min)', details: '60 minutes slow-and-steady aerobic base run. Builds aerobic capacity and fat oxidation.', type: 'endurance_easy', percentage: 65, sets: '1', reps: '1', distance: '9000', rest: '0m', unit: 'meters' },
    { id: 'endeas9', title: 'Split Double Recovery Jog (2x15 min)', details: 'Two short 15-minute recovery jogs separated by 6-8 hours. Ideal for high mileage days.', type: 'endurance_easy', percentage: 60, sets: '2', reps: '1', distance: '2000', rest: '6h', unit: 'meters' },
    { id: 'endeas10', title: 'Pre-Competition Shakeout Run (15 min)', details: 'Very light 15-minute jog followed by light mobility. Prepares neural pathways for race day.', type: 'endurance_easy', percentage: 62, sets: '1', reps: '1', distance: '2000', rest: '0m', unit: 'meters' },
    { id: 'endvo1', title: 'VO2 Max Intervals (4x1000m)', details: '1000m repetitions at 95% intensity (3k pace) with 3 minutes active jogging recovery.', type: 'endurance_vo2max', percentage: 95, sets: '1', reps: '4', distance: '1000', rest: '3m', unit: 'meters' },
    { id: 'endvo2', title: 'Billat 30-30s Aerobic Power (2x10 min)', details: 'Alternating 30 seconds at 100% VO2 Max velocity with 30 seconds easy recovery jogging.', type: 'endurance_vo2max', percentage: 100, sets: '2', reps: '10', distance: '3000', rest: '3m', unit: 'meters' },
    { id: 'endvo3', title: 'Aerobic Power Repeats (5x800m)', details: '800m runs at 92-95% intensity. Focus on maintaining high oxygen uptake and stride cadence.', type: 'endurance_vo2max', percentage: 92, sets: '1', reps: '5', distance: '800', rest: '3m', unit: 'meters' },
    { id: 'endvo4', title: 'VO2 Max Capacity Intervals (3x1200m)', details: '1200m repetitions at 90-95% intensity. Builds mental toughness and anaerobic buffer.', type: 'endurance_vo2max', percentage: 93, sets: '1', reps: '3', distance: '1200', rest: '4m', unit: 'meters' },
    { id: 'endvo5', title: 'Uphill VO2 Max Power Repeats (6x3 min)', details: '3-minute hard uphill runs at 90% effort. Walk down recovery. Excellent cardiac output booster.', type: 'endurance_vo2max', percentage: 90, sets: '1', reps: '6', distance: '600', rest: '3m', unit: 'meters' },
    { id: 'endvo6', title: 'Variable VO2 Max Ladder (800-1000-1200-1000-800m)', details: 'Ladder run at 92% intensity to challenge pacing and oxygen delivery under fatigue.', type: 'endurance_vo2max', percentage: 92, sets: '1', reps: '5', distance: '1000', rest: '3m', unit: 'meters' },
    { id: 'endvo7', title: 'Active Recovery VO2 Max Session (5x3 min)', details: '3-minute runs at 95% intensity, with strict active jogging recovery (2m 30s).', type: 'endurance_vo2max', percentage: 95, sets: '1', reps: '5', distance: '900', rest: '150s', unit: 'meters' },
    { id: 'endvo8', title: 'Short VO2 Max Boosters (10x400m)', details: '400m runs at 95% intensity with short 60s jogging recoveries to keep heart rate elevated.', type: 'endurance_vo2max', percentage: 95, sets: '1', reps: '10', distance: '400', rest: '60s', unit: 'meters' },
    { id: 'endvo9', title: 'VO2 Max Fartlek Run (15 min continuous)', details: 'Alternate 3 minutes hard (95% effort) and 1 minute easy jog for 15 minutes continuous.', type: 'endurance_vo2max', percentage: 92, sets: '1', reps: '1', distance: '4500', rest: '0m', unit: 'meters' },
    { id: 'endvo10', title: 'VO2 Max Event Finishers (2x1600m)', details: '1600m runs at 90% intensity to build high aerobic speed, lung capacity, and stride economy.', type: 'endurance_vo2max', percentage: 90, sets: '1', reps: '2', distance: '1600', rest: '4m', unit: 'meters' },
    { id: 'cor1', title: 'Russian Twists (Weighted)', details: 'Sitting on floor, lean back slightly, rotate torso side-to-side holding a 5kg medicine ball.', type: 'core_rotation', percentage: 80, sets: '3', reps: '20', distance: null, rest: '60s', unit: 'reps' },
    { id: 'cor2', title: 'Cable Woodchops', details: 'High-to-low cable pulls across body. Trains rotational power and core stability.', type: 'core_rotation', percentage: 75, sets: '3', reps: '10', distance: null, rest: '60s', unit: 'reps' },
    { id: 'cor3', title: 'Medicine Ball Rotational Throws', details: 'Stand sideways to wall, explode torso rotation, and throw a 4kg medicine ball.', type: 'core_rotation', percentage: 90, sets: '3', reps: '8', distance: null, rest: '90s', unit: 'reps' },
    { id: 'coa1', title: 'Pallof Press (Cable/Band)', details: 'Press band outward from chest, resisting rotation from cable tension.', type: 'core_anti_rotation', percentage: 70, sets: '3', reps: '12', distance: null, rest: '60s', unit: 'reps' },
    { id: 'coa2', title: 'Single-Arm Farmer Carries (20m)', details: 'Walk tall while holding a heavy kettlebell in one hand only. Prevents lateral core flexion.', type: 'core_anti_rotation', percentage: 80, sets: '3', reps: '2', distance: '20', rest: '60s', unit: 'meters' },
    { id: 'coa3', title: 'Plank with Shoulder Taps', details: 'High plank position, slowly tap opposite shoulder without allowing hips to tilt or rotate.', type: 'core_anti_rotation', percentage: 65, sets: '3', reps: '16', distance: null, rest: '45s', unit: 'reps' },
    { id: 'coe1', title: 'Superman Isometric Hold', details: 'Lie prone on floor, lift arms and legs simultaneously. Focus on glute and lower back activation.', type: 'core_extension', percentage: 50, sets: '3', reps: '30', distance: null, rest: '45s', unit: 'sec' },
    { id: 'coe2', title: 'GHD Back Extensions', details: 'Decline bench spine extension. Strengthens erector spinae, hamstrings, and glutes.', type: 'core_extension', percentage: 75, sets: '3', reps: '12', distance: null, rest: '60s', unit: 'reps' },
    { id: 'coe3', title: 'Bird Dog isometric holds', details: 'Opposite arm/leg extensions from quadruped stance. Trains lower back stability.', type: 'core_extension', percentage: 50, sets: '3', reps: '8', distance: null, rest: '45s', unit: 'reps' },
    { id: 'can1', title: 'Deadbugs (Slow & Controlled)', details: 'Prone opposite arm/leg drop. Press lower back flat into the ground to resist extension.', type: 'core_anti_extension', percentage: 60, sets: '3', reps: '12', distance: null, rest: '45s', unit: 'reps' },
    { id: 'can2', title: 'Hollow Body Isometric Hold', details: 'Banana-like body posture, raising feet and shoulders slightly off ground with lower back glued down.', type: 'core_anti_extension', percentage: 65, sets: '3', reps: '30', distance: null, rest: '45s', unit: 'sec' },
    { id: 'can3', title: 'Ab Wheel Rollouts (Anti-Extension)', details: 'Roll wheel forward while keeping spine neutral; pull back without arching or dipping lower back.', type: 'core_anti_extension', percentage: 80, sets: '3', reps: '8', distance: null, rest: '60s', unit: 'reps' },
    { id: 'sts1', title: 'Bulgarian Split Squats (Dumbbell)', details: 'Rear-foot elevated split squats. Increases single-leg hip stability and quad/glute strength.', type: 'strength_single_leg', percentage: 75, sets: '4', reps: '8', distance: null, rest: '90s', unit: 'reps' },
    { id: 'sts2', title: 'Single-Leg Romanian Deadlift (SL RDL)', details: 'Dumbbell single-leg deadlift. Builds powerful hamstrings and glutes while enhancing balance.', type: 'strength_single_leg', percentage: 70, sets: '3', reps: '8', distance: null, rest: '90s', unit: 'reps' },
    { id: 'sts3', title: 'Weighted Step-ups to Box (50cm)', details: 'Step up onto box holding dumbbells. Focuses on explosive glute drive and knee tracking.', type: 'strength_single_leg', percentage: 75, sets: '3', reps: '10', distance: null, rest: '75s', unit: 'reps' },
    { id: 'std1', title: 'Barbell Back Squat', details: 'Full back squats to develop maximum leg strength and power.', type: 'strength_double_leg', percentage: 85, sets: '4', reps: '5', distance: null, rest: '3m', unit: 'reps' },
    { id: 'std2', title: 'Trap Bar Deadlift', details: 'Deadlift using hex-bar to reduce spinal shear. Develops maximum posterior chain drive.', type: 'strength_double_leg', percentage: 85, sets: '4', reps: '5', distance: null, rest: '3m', unit: 'reps' },
    { id: 'std3', title: 'Barbell Clean Pulls', details: 'Barbell pull from floor to sternum with triple extension. Power-focused lift.', type: 'strength_double_leg', percentage: 90, sets: '4', reps: '3', distance: null, rest: '3m', unit: 'reps' },
    { id: 'stu1', title: 'Barbell Bench Press', details: 'Develops chest, shoulders, and triceps pressing power.', type: 'strength_upper', percentage: 80, sets: '4', reps: '6', distance: null, rest: '2m', unit: 'reps' },
    { id: 'stu2', title: 'Weighted Pull-ups', details: 'Overhand pull-ups with weight plates attached to dip belt. Develops lat and upper back strength.', type: 'strength_upper', percentage: 75, sets: '3', reps: '6', distance: null, rest: '2m', unit: 'reps' },
    { id: 'stu3', title: 'Standing Overhead Barbell Press (OHP)', details: 'Strict barbell pressing. Builds shoulder strength and vertical core stabilization.', type: 'strength_upper', percentage: 80, sets: '3', reps: '6', distance: null, rest: '2m', unit: 'reps' }
  ],
  templates: [
    {
      id: 'tpl1',
      title: 'Neural Speed Acceleration Day',
      type: 'day',
      drills: [
        { id: 'lib-t1-1', title: 'Block Starts Practice', details: 'React to gunshot cue. Triple extension.', type: 'speed', percentage: 100, sets: 5, reps: 1, distance: 20, rest: '3m', unit: 'meters' },
        { id: 'lib-t1-2', title: 'Power Clean from Floor', details: 'Aggressive hip extension pull.', type: 'power', percentage: 85, sets: 5, reps: 2, rest: '3m', unit: 'reps' }
      ]
    },
    {
      id: 'tpl2',
      title: 'Gym Strength & Core Stability',
      type: 'day',
      drills: [
        { id: 'lib-t2-1', title: 'Barbell Back Squat', details: 'Parallel depth squats.', type: 'strength', percentage: 85, sets: 4, reps: 5, rest: '3m', unit: 'reps' },
        { id: 'lib-t2-2', title: 'Copenhagen Side Plank', details: 'Adductor and lateral oblique brace.', type: 'isometric', percentage: 65, sets: 3, reps: 20, rest: '1m', unit: 'sec' }
      ]
    }
  ]
};

export const DEFAULT_800M_PROGRAM = {
  id: 'default-800m-endurance-vo2max',
  program_name: '800m General Endurance & VO2 Max (4-Week Block)',
  weeks: [
    {
      title: 'Week 1 - Aerobic Base & Recovery Foundation',
      drills: {
        Saturday: [
          { title: 'Aerobic Regeneration Run (30 min)', details: 'Easy run at 65-70% intensity to build capillary density and aerobic base. Keep it strictly conversational.', type: 'endurance_easy', percentage: 70, sets: '1', reps: '1', distance: '4000', rest: '0m', unit: 'meters' },
          { title: 'Core Anti-Extension (Plank)', details: 'Standard plank holding flat posture without lower back arching.', type: 'core_anti_extension', percentage: 0, sets: '3', reps: '30', rest: '45s', unit: 'sec' }
        ],
        Sunday: [],
        Monday: [
          { title: 'VO2 Max Intro (6x400m)', details: 'Run 400m at VO2 Max pace (approx. 90% effort). Focus on lung capacity and rhythm.', type: 'endurance_vo2max', percentage: 90, sets: '1', reps: '6', distance: '400', rest: '3m', unit: 'meters' },
          { title: 'Core Rotation (Russian Twists)', details: 'Rotate torso side-to-side holding a light ball.', type: 'core_rotation', percentage: 0, sets: '3', reps: '15', rest: '60s', unit: 'reps' }
        ],
        Tuesday: [
          { title: 'Barbell Back Squat', details: 'Double leg strength to build muscle density and joint stability.', type: 'strength_double_leg', percentage: 70, sets: '3', reps: '8', rest: '2m', unit: 'reps' },
          { title: 'Deadbugs', details: 'Anti-extension core drill. Press lower back flat into floor.', type: 'core_anti_extension', percentage: 0, sets: '3', reps: '12', rest: '45s', unit: 'reps' }
        ],
        Wednesday: [
          { title: 'Tempo Endurance Intervals (6x200m)', details: 'Run 200m at 75-80% intensity. Focus on relaxed arms and tall posture.', type: 'endurance_400', percentage: 75, sets: '1', reps: '6', distance: '200', rest: '90s', unit: 'meters' }
        ],
        Thursday: [
          { title: 'Mobility & Hip Flexor Stretch', details: 'Perform dynamic mobility drills to stretch active hips and reduce soreness.', type: 'mobility', percentage: 0, sets: '1', reps: '15', rest: '0m', unit: 'sec' }
        ],
        Friday: []
      }
    },
    {
      title: 'Week 2 - Aerobic Capacity & VO2 Max Loading',
      drills: {
        Saturday: [
          { title: 'Base Endurance Run (45 min)', details: 'Longer flat continuous run at 65-70% intensity to improve aerobic threshold.', type: 'endurance_easy', percentage: 70, sets: '1', reps: '1', distance: '6000', rest: '0m', unit: 'meters' }
        ],
        Sunday: [],
        Monday: [
          { title: 'VO2 Max Capacity Intervals (4x800m)', details: '800m runs at 92% intensity. Builds cardiac output and specific VO2 Max power.', type: 'endurance_vo2max', percentage: 92, sets: '1', reps: '4', distance: '800', rest: '3m', unit: 'meters' },
          { title: 'Deadbugs', details: 'Slow opposite arm/leg drop to protect the spine and stabilize the trunk.', type: 'core_anti_extension', percentage: 0, sets: '3', reps: '12', rest: '45s', unit: 'reps' }
        ],
        Tuesday: [
          { title: 'Bulgarian Split Squat (Dumbbell)', details: 'Single-leg strength focus to correct imbalance and increase hip stability.', type: 'strength_single_leg', percentage: 75, sets: '3', reps: '8', rest: '90s', unit: 'reps' },
          { title: 'Core Rotation (Cable Woodchops)', details: 'Rotational torso pull to build functional core strength for running rotations.', type: 'core_rotation', percentage: 70, sets: '3', reps: '10', rest: '60s', unit: 'reps' }
        ],
        Wednesday: [
          { title: 'Hill Resistance Intervals (8x150m Uphill)', details: 'Run uphill at 90% effort. Focus on powerful knee drive and walk-down recoveries.', type: 'endurance_800', percentage: 90, sets: '1', reps: '8', distance: '150', rest: '2m', unit: 'meters' }
        ],
        Thursday: [
          { title: 'Deep Active Mobility Stretches', details: 'Dynamic leg swings, hip circles, and calf stretches.', type: 'mobility', percentage: 0, sets: '1', reps: '15', rest: '0m', unit: 'sec' }
        ],
        Friday: []
      }
    },
    {
      title: 'Week 3 - Peak VO2 Max & Lactic Threshold',
      drills: {
        Saturday: [
          { title: 'Aerobic Recovery Jog (30 min)', details: 'Slow regenerative run at 60-65% intensity on grass.', type: 'endurance_easy', percentage: 65, sets: '1', reps: '1', distance: '4000', rest: '0m', unit: 'meters' }
        ],
        Sunday: [],
        Monday: [
          { title: 'Peak VO2 Max Intervals (4x1000m)', details: 'Hard 1000m runs at 95% intensity (3k pace). Highest aerobic workload of the block.', type: 'endurance_vo2max', percentage: 95, sets: '1', reps: '4', distance: '1000', rest: '3m', unit: 'meters' },
          { title: 'Ab Wheel Rollouts', details: 'Anti-extension core drill. Roll forward, keeping spine neutral.', type: 'core_anti_extension', percentage: 0, sets: '3', reps: '8', rest: '60s', unit: 'reps' }
        ],
        Tuesday: [
          { title: 'Trap Bar Deadlift', details: 'Develops posterior chain drive and power.', type: 'strength_double_leg', percentage: 80, sets: '3', reps: '5', rest: '2m', unit: 'reps' },
          { title: 'Core Anti-Rotation (Pallof Press)', details: 'Resist rotational pull using cable or band tension.', type: 'core_anti_rotation', percentage: 0, sets: '3', reps: '12', rest: '60s', unit: 'reps' }
        ],
        Wednesday: [
          { title: 'Lactic Capacity Runs (3x600m)', details: 'Run 600m at 90% intensity. Focus on lactic tolerance and maintaining speed under heavy fatigue.', type: 'endurance_800', percentage: 90, sets: '1', reps: '3', distance: '600', rest: '8m', unit: 'meters' }
        ],
        Thursday: [
          { title: 'Lower Body Mobility Session', details: 'Focused calf, ankle, hamstring, and hip mobility work.', type: 'mobility', percentage: 0, sets: '1', reps: '20', rest: '0m', unit: 'sec' }
        ],
        Friday: []
      }
    },
    {
      title: 'Week 4 - Taper & Specific Sharpener',
      drills: {
        Saturday: [
          { title: 'Pre-Competition Shakeout (20 min)', details: 'Very light jog on grass followed by dynamic stretching.', type: 'endurance_easy', percentage: 60, sets: '1', reps: '1', distance: '2500', rest: '0m', unit: 'meters' }
        ],
        Sunday: [],
        Monday: [
          { title: 'Sharp VO2 Max Boosters (6x400m)', details: 'Run 400m at 95% intensity, but with complete recovery to sharpen aerobic velocity without residual fatigue.', type: 'endurance_vo2max', percentage: 95, sets: '1', reps: '6', distance: '400', rest: '4m', unit: 'meters' }
        ],
        Tuesday: [
          { title: 'Bodyweight Squats & Core', details: 'Very light strength maintenance session.', type: 'strength_double_leg', percentage: 50, sets: '2', reps: '10', rest: '60s', unit: 'reps' }
        ],
        Wednesday: [
          { title: 'Event Pacing Simulation (1x600m + 1x300m)', details: 'Run 600m at target 800m race pace, rest 10 minutes, then run 300m fast. Sharpens pacing feel.', type: 'endurance_800', percentage: 95, sets: '1', reps: '1', distance: '600', rest: '10m', unit: 'meters' }
        ],
        Thursday: [
          { title: 'Light Active Stretch', details: 'Gentle full body mobility.', type: 'mobility', percentage: 0, sets: '1', reps: '15', rest: '0m', unit: 'sec' }
        ],
        Friday: []
      }
    }
  ]
};

export const DEFAULT_6WEEK_800M_PROGRAM = {
  id: 'default-6week-800m-vo2max',
  program_name: '800m VO2 Max & General Endurance (6-Week Block)',
  weeks: [
    {
      title: 'Week 1 - Base Acclimatization',
      drills: {
        Saturday: [
          { title: 'Easy Endurance Run (40 min)', details: 'Aerobic run at 65-70% intensity on flat grass or trail. Focus on steady breathing.', type: 'endurance_easy', percentage: 68, sets: '1', reps: '1', distance: '5500', rest: '0m', unit: 'meters' }
        ],
        Sunday: [],
        Monday: [
          { title: 'VO2 Max Intro Intervals (5x600m)', details: 'Run 600m at VO2 Max velocity (approx. 90% intensity). Builds cardiac stroke volume.', type: 'endurance_vo2max', percentage: 90, sets: '1', reps: '5', distance: '600', rest: '3m', unit: 'meters' }
        ],
        Tuesday: [],
        Wednesday: [
          { title: 'Extensive Tempo (8x200m)', details: 'Rhythmic 200m running at 75-80% intensity. Focus on upright posture.', type: 'endurance_400', percentage: 75, sets: '1', reps: '8', distance: '200', rest: '90s', unit: 'meters' }
        ],
        Thursday: [],
        Friday: []
      }
    },
    {
      title: 'Week 2 - Cardiovascular Capacity & Hill Loading',
      drills: {
        Saturday: [
          { title: 'Aerobic Base Run (45 min)', details: 'Continuous easy run at 68% intensity to expand capillary network.', type: 'endurance_easy', percentage: 68, sets: '1', reps: '1', distance: '6000', rest: '0m', unit: 'meters' }
        ],
        Sunday: [],
        Monday: [
          { title: 'Uphill VO2 Max Power Repeats (8x2 min)', details: 'Run uphill at 90% effort. Focus on knee drive. Walk down slowly for recovery.', type: 'endurance_vo2max', percentage: 90, sets: '1', reps: '8', distance: '400', rest: '2.5m', unit: 'meters' }
        ],
        Tuesday: [],
        Wednesday: [
          { title: 'Critical Velocity Aerobic Power (5x800m)', details: '800m repetitions at 80% intensity. Builds high aerobic efficiency.', type: 'endurance_800', percentage: 80, sets: '1', reps: '5', distance: '800', rest: '75s', unit: 'meters' }
        ],
        Thursday: [],
        Friday: []
      }
    },
    {
      title: 'Week 3 - Peak Aerobic Volume (Peak Loading)',
      drills: {
        Saturday: [
          { title: 'Long Aerobic Base Run (50 min)', details: 'Steady continuous running at 65-70% intensity. Builds primary endurance.', type: 'endurance_easy', percentage: 70, sets: '1', reps: '1', distance: '7000', rest: '0m', unit: 'meters' }
        ],
        Sunday: [],
        Monday: [
          { title: 'Classic VO2 Max Intervals (5x1000m)', details: '1000m reps at 95% intensity (3k pace). Highest oxygen intake load of the block.', type: 'endurance_vo2max', percentage: 95, sets: '1', reps: '5', distance: '1000', rest: '3m', unit: 'meters' }
        ],
        Tuesday: [],
        Wednesday: [
          { title: 'Intensive Tempo Lactic Intervals (5x400m)', details: '400m reps at 85% intensity. Focus on relaxed shoulders and rhythm.', type: 'endurance_400', percentage: 85, sets: '1', reps: '5', distance: '400', rest: '150s', unit: 'meters' }
        ],
        Thursday: [],
        Friday: []
      }
    },
    {
      title: 'Week 4 - Active Recovery & Regeneration',
      drills: {
        Saturday: [
          { title: 'Recovery Run (30 min)', details: 'Very light active recovery jog at 60-65% intensity on grass.', type: 'endurance_easy', percentage: 62, sets: '1', reps: '1', distance: '4000', rest: '0m', unit: 'meters' }
        ],
        Sunday: [],
        Monday: [
          { title: 'Billat 30-30s VO2 Max (15 reps)', details: 'Alternating 30 seconds at 100% VO2 Max with 30 seconds easy jogging recovery.', type: 'endurance_vo2max', percentage: 100, sets: '1', reps: '15', distance: '150', rest: '30s', unit: 'meters' }
        ],
        Tuesday: [],
        Wednesday: [
          { title: 'Relaxed Speed Strides (6x150m)', details: 'Relaxed run-throughs at 80% intensity with complete rest to keep legs fresh.', type: 'endurance_easy', percentage: 80, sets: '1', reps: '6', distance: '150', rest: '2m', unit: 'meters' }
        ],
        Thursday: [],
        Friday: []
      }
    },
    {
      title: 'Week 5 - Specific VO2 Max Peak Capacity',
      drills: {
        Saturday: [
          { title: 'Aerobic Base Run (45 min)', details: 'Steady continuous run at 68% intensity.', type: 'endurance_easy', percentage: 68, sets: '1', reps: '1', distance: '6000', rest: '0m', unit: 'meters' }
        ],
        Sunday: [],
        Monday: [
          { title: 'High-Volume VO2 Max (4x1200m)', details: '1200m reps at 92% intensity. Builds late race pace durability.', type: 'endurance_vo2max', percentage: 92, sets: '1', reps: '4', distance: '1200', rest: '4m', unit: 'meters' }
        ],
        Tuesday: [],
        Wednesday: [
          { title: 'VO2 Max Continuous Fartlek (20 min)', details: 'Run continuous 20 min alternating 3 min hard (92% effort) and 2 min easy jog.', type: 'endurance_vo2max', percentage: 90, sets: '1', reps: '1', distance: '3500', rest: '0m', unit: 'meters' }
        ],
        Thursday: [],
        Friday: []
      }
    },
    {
      title: 'Week 6 - Taper & Test Preparation',
      drills: {
        Saturday: [
          { title: 'Light Shakeout Run (30 min)', details: 'Easy recovery run to prepare muscles for final testing.', type: 'endurance_easy', percentage: 65, sets: '1', reps: '1', distance: '4000', rest: '0m', unit: 'meters' }
        ],
        Sunday: [],
        Monday: [
          { title: 'Sharp VO2 Max Stimulus (5x400m)', details: '400m runs at 95% intensity, but with complete 4m rest. Prepares lungs and heart without fatigue.', type: 'endurance_vo2max', percentage: 95, sets: '1', reps: '5', distance: '400', rest: '4m', unit: 'meters' }
        ],
        Tuesday: [],
        Wednesday: [
          { title: 'Active Warm-up & Strides (4x100m)', details: '15 min warm-up jog followed by 4x100m progressive strides. Leg speed activation.', type: 'endurance_easy', percentage: 85, sets: '1', reps: '4', distance: '100', rest: '2m', unit: 'meters' }
        ],
        Thursday: [],
        Friday: []
      }
    }
  ]
};
