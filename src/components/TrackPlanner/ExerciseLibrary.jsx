import React, { useState } from 'react';
import {
  X,
  Search,
  FileText,
  Calendar,
  Trash2,
  Edit2,
  GripVertical,
  Layers,
  ChevronRight,
  Filter,
  Plus
} from 'lucide-react';

const CATEGORY_TAGS = {
  speed: 'Speed',
  tempo: 'Tempo',
  long_jump: 'Long Jump',
  triple_jump: 'Triple Jump',
  endurance: 'Endurance',
  anaerobic: 'Anaerobic',
  plyometrics: 'Plyo',
  power: 'Power',
  strength: 'Strength',
  isometric: 'Iso',
  mobility: 'Mobility',
  core: 'Core',
  physical: 'Physical'
};

const SUBCATEGORIES = {
  speed: {
    all: 'All',
    speed_acceleration: 'Acceleration',
    speed_max_velocity: 'Max Velocity',
    speed_endurance: 'Speed Endurance',
    tempo_extensive: 'Extensive Tempo',
    tempo_intensive: 'Intensive Tempo'
  },
  tempo: {
    all: 'All',
    tempo_extensive: 'Extensive Tempo',
    tempo_intensive: 'Intensive Tempo'
  },
  endurance: {
    all: 'All',
    endurance_400: '400m',
    endurance_800: '800m',
    endurance_easy: 'Easy Run',
    endurance_vo2max: 'VO2 Max',
    tempo_extensive: 'Extensive Tempo',
    tempo_intensive: 'Intensive Tempo',
    anaerobic_capacity: 'Anaerobic Capacity',
    anaerobic_lactic_power: 'Lactic Power'
  },
  anaerobic: {
    all: 'All',
    anaerobic_capacity: 'Anaerobic Capacity',
    anaerobic_lactic_power: 'Lactic Power'
  },
  power: {
    all: 'All',
    power_speed_strength: 'Speed-Strength (1.0 - 1.3 m/s)',
    power_strength_speed: 'Strength-Speed (0.75 - 1.0 m/s)',
    power_starting_strength: 'Starting Strength (> 1.3 m/s)',
    power_olympic: 'Olympic Lifts'
  },
  core: {
    all: 'All',
    core_rotation: 'Rotation',
    core_anti_rotation: 'Anti-Rotation',
    core_extension: 'Extension',
    core_anti_extension: 'Anti-Extension'
  },
  strength: {
    all: 'All',
    strength_accelerative: 'Accelerative Strength (0.5 - 0.75 m/s)',
    strength_maximal: 'Maximal Strength (< 0.5 m/s)',
    strength_single_leg: 'Single Leg',
    strength_double_leg: 'Double Leg',
    strength_upper: 'Upper Body'
  },
  mobility: {
    all: 'All',
    mobility_warmup: 'RAMP Warm-up',
    mobility_recovery: 'Recovery & Flexibility'
  }
};

const getBaseCategory = (type) => {
  if (!type) return 'speed';
  const lower = type.toLowerCase();
  if (lower.startsWith('speed')) return 'speed';
  if (lower.startsWith('tempo')) return 'tempo';
  if (lower.startsWith('endurance')) return 'endurance';
  if (lower.startsWith('anaerobic')) return 'anaerobic';
  if (lower.startsWith('power')) return 'power';
  if (lower.startsWith('strength')) return 'strength';
  if (lower.startsWith('core')) return 'core';
  if (lower.startsWith('mobility')) return 'mobility';
  if (lower.startsWith('long_jump')) return 'long_jump';
  if (lower.startsWith('triple_jump')) return 'triple_jump';
  return lower;
};

const getCategoryDisplayName = (type) => {
  const base = getBaseCategory(type);
  const baseLabel = CATEGORY_TAGS[base] || base;
  if (SUBCATEGORIES[base] && type !== base) {
    const subLabel = SUBCATEGORIES[base][type];
    if (subLabel) {
      return `${baseLabel} (${subLabel})`;
    }
  }
  return baseLabel;
};

export default function ExerciseLibrary({
  library,
  onDragStart,
  onDeleteDrill,
  onEditDrill,
  onDeleteTemplate,
  onApplyTemplate,
  onApplyProgram,
  onDeleteProgram,
  programs,
  onClose,
  onAddDrill,
  onLibraryDrop
}) {
  const [activeTab, setActiveTab] = useState('drills');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [activeSubcategoryFilter, setActiveSubcategoryFilter] = useState('all');

  // Handle Search & Category Filtering
  const filteredDrills = (library.drills || []).filter((d) => {
    const type = (d.type || '').toLowerCase();
    const baseCategory = getBaseCategory(type);
    
    // Category Filter
    if (activeCategoryFilter !== 'all' && baseCategory !== activeCategoryFilter) {
      const isSubcategoryMatch = SUBCATEGORIES[activeCategoryFilter] && SUBCATEGORIES[activeCategoryFilter][type];
      if (!isSubcategoryMatch) {
        return false;
      }
    }

    // Subcategory Filter
    if (
      activeCategoryFilter !== 'all' &&
      SUBCATEGORIES[activeCategoryFilter] &&
      activeSubcategoryFilter !== 'all' &&
      type !== activeSubcategoryFilter
    ) {
      return false;
    }

    // Text Search
    const title = (d.title || '').toLowerCase();
    const details = (d.details || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return title.includes(query) || details.includes(query) || type.includes(query);
  });

  const filteredTemplates = (library.templates || []).filter((t) => {
    const title = (t.title || '').toLowerCase();
    return title.includes(searchQuery.toLowerCase());
  });

  const filteredPrograms = (programs || []).filter((p) => {
    const name = (p.program_name || '').toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  return (
    <aside className="w-80 h-full bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-[80] shrink-0 md:relative absolute right-0 top-0 transition-all duration-300 print:hidden animate-[slideIn_0.25s_ease-out]">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-orange-500" />
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-50">
            Exercise & Plans Library
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-full transition-colors"
        >
          <X className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Search Box */}
      <div className="p-3 border-b border-slate-100 dark:border-slate-700">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-orange-500 transition-all"
          />
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400" />
        </div>

        {/* Quick Category Filter Pills inside Drills Tab */}
        {activeTab === 'drills' && (
          <div className="flex flex-col gap-1.5 mt-2">
            <div className="flex gap-1.5 overflow-x-auto pb-1.5 select-none scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
              <button
                onClick={() => {
                  setActiveCategoryFilter('all');
                  setActiveSubcategoryFilter('all');
                }}
                className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border shrink-0 ${
                  activeCategoryFilter === 'all'
                    ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400'
                }`}
              >
                All
              </button>
              {Object.entries(CATEGORY_TAGS).map(([key, label]) => (
                <button
                  key={`filter-pill-${key}`}
                  onClick={() => {
                    setActiveCategoryFilter(key);
                    setActiveSubcategoryFilter('all');
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border shrink-0 ${
                    activeCategoryFilter === key
                      ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Subcategory Pills Row */}
            {activeCategoryFilter !== 'all' && SUBCATEGORIES[activeCategoryFilter] && (
              <div className="flex gap-1.5 overflow-x-auto pb-1 select-none scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 border-t border-slate-100 dark:border-slate-800/60 pt-1.5 animate-[fadeIn_0.2s_ease-out]">
                {Object.entries(SUBCATEGORIES[activeCategoryFilter]).map(([key, label]) => (
                  <button
                    key={`subcategory-pill-${key}`}
                    onClick={() => setActiveSubcategoryFilter(key)}
                    className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all border shrink-0 ${
                      activeSubcategoryFilter === key
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-700 bg-slate-50/20 p-1 gap-1">
        <button
          onClick={() => {
            setActiveTab('drills');
            setSearchQuery('');
            setActiveCategoryFilter('all');
          }}
          className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
            activeTab === 'drills'
              ? 'bg-white dark:bg-slate-700 text-orange-500 shadow-sm border border-slate-200/50'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'
          }`}
        >
          Drills
        </button>
        <button
          onClick={() => {
            setActiveTab('templates');
            setSearchQuery('');
          }}
          className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
            activeTab === 'templates'
              ? 'bg-white dark:bg-slate-700 text-orange-500 shadow-sm border border-slate-200/50'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'
          }`}
        >
          Templates
        </button>
        <button
          onClick={() => {
            setActiveTab('programs');
            setSearchQuery('');
          }}
          className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
            activeTab === 'programs'
              ? 'bg-white dark:bg-slate-700 text-orange-500 shadow-sm border border-slate-200/50'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'
          }`}
        >
          Blocks
        </button>
      </div>

      {/* List Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {/* Drills List */}
        {activeTab === 'drills' && (
          <>
            {/* Create New Exercise Button */}
            <button
              onClick={onAddDrill}
              className="w-full mb-3 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/10 transition-all hover:scale-[1.01]"
            >
              <Plus className="w-3.5 h-3.5" /> Create New Exercise
            </button>

            {/* Premium Dashed Dropzone for Drag-and-Drop back to Library */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={onLibraryDrop}
              className="mb-4 p-4 bg-orange-500/5 dark:bg-orange-500/10 border-2 border-dashed border-orange-500/20 dark:border-orange-500/30 rounded-2xl flex flex-col items-center justify-center gap-1.5 hover:bg-orange-500/10 dark:hover:bg-orange-500/20 hover:border-orange-500/40 transition-all cursor-pointer group"
            >
              <Plus className="w-4.5 h-4.5 text-orange-500 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider text-center">
                Drag Workout Here to Save
              </span>
              <span className="text-[8px] font-medium text-slate-400 text-center leading-normal">
                Drag any workout drill from calendar and drop here to archive in your library
              </span>
            </div>

            {filteredDrills.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No drills found matching filters.
              </div>
            ) : (
              filteredDrills.map((drill) => (
                <div
                  key={drill.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, drill, false)}
                  className="group relative flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-orange-500/30 cursor-grab active:cursor-grabbing hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <GripVertical className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {drill.title}
                      </h4>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                        {getCategoryDisplayName(drill.type)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditDrill(drill)}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 rounded-md"
                      title="Edit"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDeleteDrill(drill.id)}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-md"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* Templates List */}
        {activeTab === 'templates' && (
          <>
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No templates found. Save workouts to create templates!
              </div>
            ) : (
              filteredTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, tpl, true)}
                  className="group relative flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-orange-500/30 cursor-grab active:cursor-grabbing hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <GripVertical className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {tpl.title}
                      </h4>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase flex items-center gap-0.5">
                        <FileText className="w-2.5 h-2.5 text-slate-400" />
                        {tpl.type === 'week' ? 'Weekly' : 'Daily'} Template
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onApplyTemplate(tpl);
                      }}
                      className="px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-black text-[9px] uppercase tracking-wider shadow-sm transition-all hover:scale-105 active:scale-95 shrink-0"
                    >
                      Apply
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onDeleteTemplate(tpl.id);
                      }}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-md shrink-0"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* Programs List */}
        {activeTab === 'programs' && (
          <>
            {filteredPrograms.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No macro program blocks found. Save your current block to list plans!
              </div>
            ) : (
              filteredPrograms.map((prog) => (
                <div
                  key={prog.id}
                  className="group relative p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between min-w-0 mb-2">
                    <div className="min-w-0">
                      <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 leading-tight truncate">
                        {prog.program_name}
                      </h4>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase flex items-center gap-0.5 mt-0.5">
                        <Calendar className="w-2.5 h-2.5 text-slate-400" />
                        {(prog.weeks || []).length} Weeks Duration
                      </span>
                    </div>
                    <button
                      onClick={() => onDeleteProgram(prog.id)}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      title="Delete Block"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Deploy Button */}
                  <button
                    onClick={() => onApplyProgram(prog)}
                    className="w-full py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm transition-colors"
                  >
                    Deploy to Timeline <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </aside>
  );
}
