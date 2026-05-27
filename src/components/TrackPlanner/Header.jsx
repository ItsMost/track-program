import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  User,
  Plus,
  Moon,
  Sun,
  Library,
  Monitor,
  Smartphone,
  Calendar,
  Save,
  Activity,
  BarChart3,
  Dumbbell,
  Trash2,
  ShieldCheck
} from 'lucide-react';

export default function Header({
  currentDate,
  setCurrentDate,
  currentWeekStart,
  setShowMonthCalendar,
  selectedAthlete,
  setSelectedAthleteId,
  athletes,
  isAthleteDropdownOpen,
  setIsAthleteDropdownOpen,
  setShowAddAthleteModal,
  setShowProfileModal,
  isMobileView,
  setIsMobileView,
  isDarkMode,
  setIsDarkMode,
  showLibrary,
  setShowLibrary,
  handleToast,
  setSaveWeekTemplateModal,
  setSaveBlockRangeModal,
  setShowRulebookModal,
  weeklyStats,
  onDeleteAthlete
}) {
  const handlePrevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const handleNextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const formatDateRange = () => {
    const start = new Date(currentWeekStart);
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 6);

    const startMonth = start.toLocaleString('en-US', { month: 'short' });
    const startDay = start.getDate();
    const startYear = start.getFullYear();

    const endMonth = end.toLocaleString('en-US', { month: 'short' });
    const endDay = end.getDate();
    const endYear = end.getFullYear();

    if (startYear !== endYear) {
      return `${startMonth} ${startDay}, ${startYear} – ${endMonth} ${endDay}, ${endYear}`;
    }
    if (startMonth !== endMonth) {
      return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${startYear}`;
    }
    return `${startMonth} ${startDay} – ${endDay}, ${startYear}`;
  };

  return (
    <header className="sticky top-0 z-[100] h-16 w-full flex items-center justify-between px-4 md:px-6 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200 print:hidden">
      {/* Branding */}
      <div className="hidden md:flex items-center gap-3">
        <div className="p-2 bg-gradient-to-tr from-orange-500 to-amber-400 rounded-xl shadow-md shadow-orange-500/20">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-50 leading-none">
            Track & Field Lab
          </h1>
          <span className="text-[10px] font-bold text-orange-500 tracking-wider uppercase">
            Performance Core
          </span>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="hidden md:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
        <button
          onClick={handlePrevWeek}
          className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
          title="Previous Week"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={handleToday}
          className="px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
        >
          Today
        </button>
        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 px-2 min-w-[120px] text-center select-none">
          {formatDateRange()}
        </span>
        <button
          onClick={handleNextWeek}
          className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
          title="Next Week"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowMonthCalendar(true)}
          className="p-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 transition-colors"
          title="Open Month Calendar Overview"
        >
          <Calendar className="w-4 h-4" />
        </button>
      </div>

      {/* Top Header Workload Summary Widget */}
      {weeklyStats && (
        <div className="hidden lg:flex items-center gap-3.5 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-all duration-200">
          {/* Total Load */}
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-orange-500" />
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Total Load:
            </span>
            <span className="text-xs font-black text-slate-900 dark:text-slate-100">
              {weeklyStats.load} AU
            </span>
          </div>

          <div className="w-px h-4 bg-slate-200 dark:bg-slate-800"></div>

          {/* Load Status Badge */}
          {(() => {
            let label = 'Medium (Base)';
            let badgeClass = 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
            const load = weeklyStats.load;
            if (load < 1500) {
              label = 'Deload (Low)';
              badgeClass = 'text-green-600 bg-green-50 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20';
            } else if (load > 4000) {
              label = 'High (Peak Week)';
              badgeClass = 'text-red-600 bg-red-50 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20';
            }
            return (
              <span className={`px-2.5 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-wider transition-colors ${badgeClass}`}>
                {label}
              </span>
            );
          })()}

          <div className="w-px h-4 bg-slate-200 dark:bg-slate-800"></div>

          {/* Weekly Intensity */}
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Avg Intensity:
            </span>
            <span className="text-xs font-black text-slate-900 dark:text-slate-100">
              {weeklyStats.intensity}%
            </span>
          </div>

          <div className="w-px h-4 bg-slate-200 dark:bg-slate-800"></div>

          {/* CNS vs Structural Stress */}
          <div className="flex items-center gap-1.5 select-none">
            <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-lg border border-red-100 dark:border-red-900/30">
              <span className="text-[8px] font-black text-red-500 dark:text-red-400">CNS:</span>
              <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200">
                {weeklyStats.cnsPercentage}%
              </span>
            </div>
            <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded-lg border border-blue-100 dark:border-blue-900/30">
              <span className="text-[8px] font-black text-blue-500 dark:text-blue-400">STRUCT:</span>
              <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200">
                {weeklyStats.structuralPercentage}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Athlete Swapper & Settings Controls */}
      <div className="flex items-center justify-between md:justify-end gap-2 md:gap-3 w-full md:w-auto">
        {/* Simple Brand/Title Logo on Mobile ONLY */}
        <div className="flex md:hidden items-center gap-2">
          <div className="p-1.5 bg-gradient-to-tr from-orange-500 to-amber-400 rounded-lg shadow-sm">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-black text-slate-900 dark:text-slate-50 uppercase tracking-tight">
            Track Lab
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Athlete Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsAthleteDropdownOpen(!isAthleteDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200/50 dark:border-slate-700/50 font-bold text-xs shadow-sm transition-colors"
            >
              <User className="w-3.5 h-3.5 text-orange-500" />
              <span className="max-w-[70px] sm:max-w-[120px] truncate">
                {selectedAthlete ? selectedAthlete.name : 'Select'}
              </span>
            </button>

            {isAthleteDropdownOpen && (
              <div className="absolute left-0 md:left-auto md:right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-[200] overflow-hidden animate-[fadeIn_0.15s_ease-out]">
                <div className="p-2 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1.5">
                    Roster
                  </span>
                  <button
                    onClick={() => {
                      setShowAddAthleteModal(true);
                      setIsAthleteDropdownOpen(false);
                    }}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-orange-500 rounded-lg transition-colors"
                    title="Add Athlete"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
                  {athletes.map((ath) => (
                    <button
                      key={ath.id}
                      onClick={() => {
                        setSelectedAthleteId(ath.id);
                        setIsAthleteDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs md:text-sm font-medium flex justify-between items-center transition-all ${
                        selectedAthlete?.id === ath.id
                          ? 'bg-orange-500 text-white shadow-md'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className="truncate">{ath.name}</span>
                      <span className="text-[10px] opacity-70">
                        {ath.birthYear ? `'${String(ath.birthYear).slice(-2)}` : ''}
                      </span>
                    </button>
                  ))}
                </div>
                {selectedAthlete && (
                  <div className="p-1.5 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between gap-1">
                    <button
                      onClick={() => {
                        setShowProfileModal(true);
                        setIsAthleteDropdownOpen(false);
                      }}
                      className="flex-1 text-center py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors"
                    >
                      View Athletic Metrics
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Are you absolutely sure you want to securely delete ${selectedAthlete.name} and ALL their training data? This cannot be undone.`)) {
                          onDeleteAthlete(selectedAthlete.id);
                          setIsAthleteDropdownOpen(false);
                        }
                      }}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors shrink-0"
                      title="Securely Delete Athlete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Controls */}
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <button
              onClick={() => setSaveWeekTemplateModal({ isOpen: true, name: '' })}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors hidden md:block"
              title="Save Week as Template / حفظ الأسبوع كقالب"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSaveBlockRangeModal({ isOpen: true, name: '', startWeek: 1, endWeek: 4 })}
              className="p-1.5 text-slate-500 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors hidden md:block"
              title="Save Block Range (Multi-Week) / تكرار وحفظ مدى الأسابيع الكبرى"
            >
              <Calendar className="w-4 h-4 text-orange-500" />
            </button>
            <button
              onClick={() => setShowLibrary(!showLibrary)}
              className={`p-1.5 rounded-xl transition-all ${
                showLibrary
                  ? 'bg-orange-500/10 text-orange-500 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Toggle Exercise Library / مكتبة التمارين"
            >
              <Library className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowRulebookModal(true)}
              className="p-1.5 text-slate-500 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title="Coach's Rulebook & Protocols / دليل وقوانين المدرب"
            >
              <ShieldCheck className="w-4.5 h-4.5 text-orange-500" />
            </button>
            <button
              onClick={() => setIsMobileView(!isMobileView)}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors hidden md:block"
              title={isMobileView ? 'Desktop Layout' : 'Mobile Preview'}
            >
              {isMobileView ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
