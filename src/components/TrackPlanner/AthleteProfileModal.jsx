import React, { useState } from 'react';
import {
  X,
  User,
  Activity,
  Zap,
  Dumbbell,
  TrendingUp,
  Save,
  Trash2
} from 'lucide-react';

export default function AthleteProfileModal({ athlete, onClose, onSave, onDelete }) {
  const [formData, setFormData] = useState({
    id: athlete.id,
    name: athlete.name || '',
    birthYear: athlete.birthYear || '',
    weight: athlete.weight || '',
    height: athlete.height || '',
    bodyFat: athlete.bodyFat || '',
    verticalJump: athlete.verticalJump || '',
    standingLongJump: athlete.standingLongJump || '',
    squatJump: athlete.squatJump || '',
    clean: athlete.clean || '',
    halfSquat: athlete.halfSquat || '',
    quarterSquat: athlete.quarterSquat || '',
    fullSquat: athlete.fullSquat || '',
    bench: athlete.bench || '',
    deadlift: athlete.deadlift || '',
    m100: athlete.m100 || '',
    m150: athlete.m150 || '',
    m200: athlete.m200 || '',
    m300: athlete.m300 || '',
    m400: athlete.m400 || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const initials = formData.name
    ? formData.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 print:hidden animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 dark:border-slate-700 transition-all duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white">
                Athletic Performance Dashboard
              </h3>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                Profile Management &bull; {formData.name || 'New Athlete'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body - Responsive 2 Columns */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[70vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* LEFT COLUMN: IDENTITY & JUMPS */}
            <div className="space-y-5">
              
              {/* Profile Card */}
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-500/20">
                  {initials}
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                      Full Athlete Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-white font-bold text-sm outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Enter full name..."
                      required
                    />
                  </div>
                </div>
              </div>

              {/* General Physical Characteristics */}
              <div className="border border-slate-100 dark:border-slate-700/60 rounded-2xl p-4 space-y-3 bg-white dark:bg-slate-800">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mb-1">
                  <User className="w-3.5 h-3.5 text-orange-500" /> Physical Metrics
                </h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                      Birth Year
                    </label>
                    <input
                      type="number"
                      name="birthYear"
                      value={formData.birthYear}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-semibold text-xs outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g. 1996"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                      Body Fat (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="bodyFat"
                      value={formData.bodyFat}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-semibold text-xs outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g. 7.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-semibold text-xs outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g. 85.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-semibold text-xs outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g. 185"
                    />
                  </div>
                </div>
              </div>

              {/* CNS Jump & Plyo Metrics */}
              <div className="border border-slate-100 dark:border-slate-700/60 rounded-2xl p-4 space-y-3 bg-white dark:bg-slate-800">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mb-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> CNS & Plyometric Capacity
                </h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                      Vertical Jump (cm)
                    </label>
                    <input
                      type="number"
                      name="verticalJump"
                      value={formData.verticalJump}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-semibold text-xs outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g. 95"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                      Squat Jump (cm)
                    </label>
                    <input
                      type="number"
                      name="squatJump"
                      value={formData.squatJump}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-semibold text-xs outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g. 65"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                    Standing Long Jump (meters)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="standingLongJump"
                    value={formData.standingLongJump}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-semibold text-xs outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g. 3.45"
                  />
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: GYM LIFTS & SPEED TIMES */}
            <div className="space-y-5">
              
              {/* Gym Strength 1RMs */}
              <div className="border border-slate-100 dark:border-slate-700/60 rounded-2xl p-4 space-y-3 bg-white dark:bg-slate-800">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mb-1">
                  <Dumbbell className="w-3.5 h-3.5 text-sky-500" /> Gym Strength Records (1RM)
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                      Power Clean (kg)
                    </label>
                    <input
                      type="number"
                      name="clean"
                      value={formData.clean}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-semibold text-xs outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g. 145"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                      Bench Press (kg)
                    </label>
                    <input
                      type="number"
                      name="bench"
                      value={formData.bench}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-semibold text-xs outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g. 130"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                      Deadlift (kg)
                    </label>
                    <input
                      type="number"
                      name="deadlift"
                      value={formData.deadlift}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-semibold text-xs outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g. 240"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                      Full Squat (kg)
                    </label>
                    <input
                      type="number"
                      name="fullSquat"
                      value={formData.fullSquat}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-semibold text-xs outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g. 180"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                      Half Squat (kg)
                    </label>
                    <input
                      type="number"
                      name="halfSquat"
                      value={formData.halfSquat}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-semibold text-xs outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g. 220"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                      Quarter Squat (kg)
                    </label>
                    <input
                      type="number"
                      name="quarterSquat"
                      value={formData.quarterSquat}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-semibold text-xs outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g. 280"
                    />
                  </div>
                </div>
              </div>

              {/* Track Speed Sprint Times */}
              <div className="border border-slate-100 dark:border-slate-700/60 rounded-2xl p-4 space-y-3 bg-white dark:bg-slate-800">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mb-1">
                  <Activity className="w-3.5 h-3.5 text-orange-500" /> Track Speed Personal Bests (s)
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                      100m Dash (s)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="m100"
                      value={formData.m100}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-semibold text-xs outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g. 10.50"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                      150m Dash (s)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="m150"
                      value={formData.m150}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-semibold text-xs outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g. 15.20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                      200m PB (s)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="m200"
                      value={formData.m200}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-semibold text-xs outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g. 21.05"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                      300m PB (s)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="m300"
                      value={formData.m300}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-semibold text-xs outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g. 33.50"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                      400m PB (s)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="m400"
                      value={formData.m400}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-semibold text-xs outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g. 46.20"
                    />
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
            
            {/* Delete Athlete Profile (Far Left) */}
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    `Are you absolutely sure you want to securely delete ${formData.name || 'this athlete'} and ALL their training data? This cannot be undone.`
                  )
                ) {
                  onDelete(athlete.id);
                  onClose();
                }
              }}
              className="px-4 py-2 border border-red-200 dark:border-red-950/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete Profile
            </button>

            {/* Cancel & Save (Far Right) */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-md shadow-orange-500/10 font-bold text-sm flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
            
          </div>
        </form>
      </div>
    </div>
  );
}
