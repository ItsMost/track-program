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
    { id: 'is14', title: 'Hanging Leg Raises', details: 'Legs fully straight. Lift to touch bar. Focus on lower abs compression.', type: 'core', percentage: 55, sets: '3', reps: '10', rest: '1m', unit: 'reps' },
    { id: 'is15', title: "World's Greatest Stretch", details: 'Step into deep lunge, rotate torso, extend hamstring.', type: 'mobility', percentage: null, sets: '3', reps: '5', rest: '1m', unit: 'reps' },
    { id: 'is16', title: '90/90 Hip Switches', details: 'Rhythmic internal/external hip rotation while seated.', type: 'mobility', percentage: null, sets: '2', reps: '10', rest: '45s', unit: 'reps' },
    { id: 'is17', title: 'Thoracic Rotations', details: 'Quadruped position, hand behind head, rotate elbow upward.', type: 'mobility', percentage: null, sets: '3', reps: '8', rest: '45s', unit: 'reps' },
    { id: 'is18', title: 'Deep Squat Prys', details: 'Sit in deep squat, use elbows to pry knees outward.', type: 'mobility', percentage: null, sets: '3', reps: '45', rest: '1m', unit: 'sec' },
    { id: 'is19', title: 'Adductor Rock-Backs', details: 'Quadruped with one leg extended laterally. Rock hips backward.', type: 'mobility', percentage: null, sets: '3', reps: '10', rest: '45s', unit: 'reps' },
    { id: 'is20', title: 'Ankle Dorsiflexion Mobilization', details: 'Use band or wall to drive knee forward over toe while keeping heel glued.', type: 'mobility', percentage: null, sets: '3', reps: '12', rest: '1m', unit: 'reps' }
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
