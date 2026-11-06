// Sample general-prep week from the coach brief. Used by the load model
// tests and by scripts/print-sample-week-loads.mjs.
export const SAMPLE_WEEK = {
  Saturday: [
    { title: 'Sled Sprints', type: 'speed_resisted', sets: '2', reps: '2', distance: '15', percentage: 100, unit: 'meters' },
    { title: '20m Acceleration Sprints', type: 'speed_acceleration', sets: '1', reps: '2', distance: '20', percentage: 100, unit: 'meters' },
    { title: '30m Acceleration Sprints', type: 'speed_acceleration', sets: '1', reps: '2', distance: '30', percentage: 100, unit: 'meters' },
    { title: 'Ankle Pogo Hops', type: 'plyometrics', sets: '2', reps: '10', unit: 'contacts' },
    { title: 'Broad Jump', type: 'plyometrics', sets: '3', reps: '3', unit: 'contacts' },
    { title: 'Barbell Back Squat', type: 'strength_double_leg', sets: '4', reps: '4', percentage: 75, unit: 'reps' },
    { title: 'Romanian Deadlift (RDL)', type: 'strength_hamstrings_hip', sets: '3', reps: '6', unit: 'reps' },
    { title: 'Barbell Hip Thrust', type: 'strength_double_leg', sets: '3', reps: '10', unit: 'reps' },
    { title: 'Seated Soleus Calf Raise', type: 'strength_single_leg', sets: '3', reps: '12', unit: 'reps' },
    { title: 'Copenhagen Side Plank', type: 'isometric', sets: '2', reps: '20', unit: 'sec', intensityUnit: 'BW' },
  ],
  Sunday: [
    { title: 'Extensive Tempo 100m', type: 'tempo_extensive', sets: '2', reps: '7', distance: '100', percentage: 70, unit: 'meters' },
  ],
  Monday: [
    { title: 'Flying Sprints 20m', type: 'speed_max_velocity', sets: '3', reps: '1', distance: '20', percentage: 95, unit: 'meters' },
    { title: 'Long Jump Pop-ups', type: 'long_jump_takeoff', sets: '1', reps: '6', unit: 'contacts' },
    { title: 'Short-Approach Long Jump', type: 'long_jump', sets: '1', reps: '4', percentage: 95, unit: 'contacts' },
    { title: 'Hurdle Hops', type: 'plyo_fast_ssc', sets: '3', reps: '4', unit: 'contacts' },
    { title: 'Alternate Leg Bounding', type: 'plyometrics', sets: '3', reps: '6', unit: 'contacts' },
    { title: 'Hang Clean', type: 'power', sets: '4', reps: '3', percentage: 75, unit: 'reps' },
    { title: 'Nordic Hamstring Curls', type: 'strength_hamstrings_knee', sets: '3', reps: '4', unit: 'reps' },
  ],
  Tuesday: [
    { title: 'Extensive Tempo 150m', type: 'tempo_extensive', sets: '1', reps: '6', distance: '150', percentage: 70, unit: 'meters' },
    { title: 'Incline DB Press', type: 'strength_upper', sets: '3', reps: '8', unit: 'reps' },
    { title: 'DB Row', type: 'strength_upper', sets: '3', reps: '10', unit: 'reps' },
    { title: 'Pull-ups', type: 'strength_upper', sets: '3', reps: '6', unit: 'reps', intensityUnit: 'BW' },
  ],
  Wednesday: [
    { title: 'Hill Sprints 20m', type: 'speed_resisted', sets: '1', reps: '5', distance: '20', percentage: 100, unit: 'meters' },
    { title: 'Curve Sprints 30m', type: 'speed_max_velocity', sets: '1', reps: '2', distance: '30', percentage: 92, unit: 'meters' },
    { title: 'Approach Rhythm Runs (no jump)', type: 'long_jump_approach', sets: '1', reps: '4', unit: 'contacts' },
  ],
  Thursday: [
    { title: 'Ankle Pogo Hops', type: 'plyometrics', sets: '2', reps: '10', unit: 'contacts' },
    { title: 'Bulgarian Split Squat', type: 'strength_single_leg', sets: '3', reps: '8', unit: 'reps' },
    { title: 'Single-Leg RDL', type: 'strength_single_leg', sets: '3', reps: '8', unit: 'reps' },
    { title: 'Single-Leg Calf Raise', type: 'strength_single_leg', sets: '3', reps: '12', unit: 'reps' },
    { title: 'Soleus Isometric Hold', type: 'isometric', sets: '3', reps: '30', unit: 'sec' },
    { title: 'Tibialis Raises', type: 'strength_single_leg', sets: '2', reps: '15', unit: 'reps' },
    { title: 'Copenhagen Side Plank', type: 'isometric', sets: '2', reps: '20', unit: 'sec', intensityUnit: 'BW' },
    { title: 'Incline Bench Press', type: 'strength_upper', sets: '3', reps: '8', unit: 'reps' },
  ],
  Friday: [],
};
