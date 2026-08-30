import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as htmlToImage from 'html-to-image';
import {
  Check,
  AlertTriangle,
  BookmarkPlus,
  Plus,
  Sparkles,
  Trash,
  Trash2,
  Percent,
  UserPlus,
  X,
  Calendar as CalendarIcon,
  Loader2,
  Copy,
  ClipboardPaste,
  Undo2,
  Redo2,
  Save,
  Edit2,
  BarChart3,
  Activity,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  User,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Library,
  Search,
  Zap,
  Gauge,
  Dumbbell,
  ShieldCheck,
  Sliders,
  Printer,
  Layout,
  FileText,
} from 'lucide-react';

import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import TimelineCard from './TimelineCard.jsx';
import ExerciseLibrary from './ExerciseLibrary.jsx';
import AthleteProfileModal from './AthleteProfileModal.jsx';
import { INITIAL_ATHLETES, INITIAL_LIBRARY, DEFAULT_800M_PROGRAM, DEFAULT_6WEEK_800M_PROGRAM, DEFAULT_LONG_JUMP_PROGRAM, DEFAULT_TRIPLE_JUMP_PROGRAM } from '../../data/constants.js';
import { supabase, isRealSupabase } from '../../supabaseClient.js';

// 1. Updated Track & Field Specific Categories
const EXERCISE_CATEGORIES = {
  speed: 'Speed (Track)',
  tempo: 'Tempo Running',
  long_jump: 'Long Jump',
  triple_jump: 'Triple Jump',
  endurance: 'Endurance',
  anaerobic: 'Anaerobic Training',
  plyometrics: 'Plyometrics',
  power: 'Power (Gym)',
  strength: 'Strength (Gym)',
  isometric: 'Isometric (Stability)',
  mobility: 'Mobility',
  core: 'Core',
  physical: 'Physical',
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
    tempo_extensive: 'Extensive Tempo (65-75%)',
    tempo_intensive: 'Intensive Tempo (75-85%)'
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

const DAYS_OF_WEEK = [
  'Saturday',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];
const JS_DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export default function TrackFieldPlanner() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [athletes, setAthletes] = useState([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState(
    () => localStorage.getItem('lastSelectedAthlete') || null
  );
  const selectedAthlete =
    athletes?.find((a) => a.id === selectedAthleteId) || athletes?.[0] || null;

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [newAthleteData, setNewAthleteData] = useState({
    name: '',
    birthYear: '',
    weight: '',
  });
  const [isAthleteDropdownOpen, setIsAthleteDropdownOpen] = useState(false);
  const [athleteSearch, setAthleteSearch] = useState('');

  const [currentDate, setCurrentDate] = useState(new Date());

  const [schedule, setSchedule] = useState(() => {
    const init = {};
    DAYS_OF_WEEK.forEach((d) => (init[d] = []));
    return init;
  });

  const [dayTitles, setDayTitles] = useState({});
  const [library, setLibrary] = useState({ drills: [], templates: [] });
  const [programs, setPrograms] = useState([]);
  const [monthWorkouts, setMonthWorkouts] = useState({});

  const [clipboard, setClipboard] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [toastMessage, setToastMessage] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showAddAthleteModal, setShowAddAthleteModal] = useState(false);
  const [showMonthCalendar, setShowMonthCalendar] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    type: null,
    targetDay: null,
  });
  const [saveTemplateModal, setSaveTemplateModal] = useState({
    isOpen: false,
    day: null,
    name: '',
  });
  const [saveWeekTemplateModal, setSaveWeekTemplateModal] = useState({
    isOpen: false,
    name: '',
  });
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showMobileTools, setShowMobileTools] = useState(false);
  const [saveBlockRangeModal, setSaveBlockRangeModal] = useState({
    isOpen: false,
    name: '',
    startWeek: 1,
    endWeek: 4,
  });

  const [draggedItem, setDraggedItem] = useState(null);
  const [createProgramModal, setCreateProgramModal] = useState({
    isOpen: false,
    name: '',
    tags: '',
    weeksChain: [''],
  });

  // Add Exercise state updated with 'distance' and VBT metrics
  const [addExerciseModal, setAddExerciseModal] = useState({
    isOpen: false,
    id: null,
    title: '',
    details: '',
    type: 'speed',
    percentage: '',
    sets: '',
    reps: '',
    distance: '',
    rest: '',
    unit: 'meters',
    targetVelocity: '',
    peakVelocity: '',
    velocityLoss: '10%',
  });
  const [dayDrillModal, setDayDrillModal] = useState({
    isOpen: false,
    day: null,
    drill: null,
    isNew: false,
  });
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [activeMobileDay, setActiveMobileDay] = useState('Saturday');
  const [printTheme, setPrintTheme] = useState('classic-crimson');
  const [printOrientation, setPrintOrientation] = useState('landscape');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [fourWeekData, setFourWeekData] = useState([]);
  const [is4WeekLoading, setIs4WeekLoading] = useState(false);

  const handleToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobileView(true);
      } else {
        setIsMobileView(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getDbDateStr = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(date.getDate()).padStart(2, '0')}`;
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const dayOffset = (d.getDay() + 1) % 7;
    d.setDate(d.getDate() - dayOffset);
    return d;
  };

  const currentWeekStart = getStartOfWeek(currentDate);
  const monthYearString = currentWeekStart.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  const weekStartDateStr = getDbDateStr(currentWeekStart);

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

  const getDatesForWeek = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  };
  const weekDatesFull = getDatesForWeek();
  const weekDates = weekDatesFull.map((d) => d.getDate());

  const pushToHistory = (newSchedule, newTitles) => {
    const newState = {
      schedule: JSON.parse(JSON.stringify(newSchedule)),
      titles: JSON.parse(JSON.stringify(newTitles)),
    };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  useEffect(() => {
    const fetchAthletes = async () => {
      try {
        const { data, error } = await supabase
          .from('track_athletes')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;

        if (data && data.length > 0) {
          const formattedData = data.map((a) => ({
            ...a,
            birthYear: a.birth_year,
            bodyFat: a.body_fat,
            verticalJump: a.vertical_jump,
            standingLongJump: a.standing_long_jump,
            squatJump: a.squat_jump,
            halfSquat: a.half_squat,
            quarterSquat: a.quarter_squat,
            fullSquat: a.full_squat,
            deadlift: a.deadlift,
          }));
          setAthletes(formattedData);
          const savedId = localStorage.getItem('lastSelectedAthlete');
          if (savedId && formattedData.some((a) => a.id === savedId))
            setSelectedAthleteId(savedId);
          else setSelectedAthleteId(formattedData[0].id);
        } else {
          // Real database is empty, seed it with INITIAL_ATHLETES to prevent FK constraint violations!
          const initialAthletesFormatted = INITIAL_ATHLETES.map(a => ({
            id: a.id,
            name: a.name,
            birth_year: a.birthYear || null,
            weight: a.weight || null,
            height: a.height || null,
            body_fat: a.bodyFat || null,
            vertical_jump: a.verticalJump || null,
            standing_long_jump: a.standingLongJump || null,
            squat_jump: a.squatJump || null,
            clean: a.clean || null,
            half_squat: a.halfSquat || null,
            quarter_squat: a.quarterSquat || null,
            full_squat: a.fullSquat || null,
            bench: a.bench || null,
            deadlift: a.deadlift || null,
            m100: a.m100 || null,
            m150: a.m150 || null,
            m200: a.m200 || null,
            m300: a.m300 || null,
            m400: a.m400 || null,
          }));
          
          let { data: seededAthletes, error: seedError } = await supabase
            .from('track_athletes')
            .insert(initialAthletesFormatted)
            .select();
            
          if (seedError) {
            console.warn("Failed to seed initial athletes with speed columns, retrying without speed columns:", seedError);
            
            // Fallback: Retrying insert WITHOUT the speed columns!
            const fallbackAthletes = INITIAL_ATHLETES.map(a => ({
              id: a.id,
              name: a.name,
              birth_year: a.birthYear || null,
              weight: a.weight || null,
              height: a.height || null,
              body_fat: a.bodyFat || null,
              vertical_jump: a.verticalJump || null,
              standing_long_jump: a.standingLongJump || null,
              squat_jump: a.squatJump || null,
              clean: a.clean || null,
              half_squat: a.halfSquat || null,
              quarter_squat: a.quarterSquat || null,
              full_squat: a.fullSquat || null,
              bench: a.bench || null,
              deadlift: a.deadlift || null,
            }));
            
            const { data: fallbackSeeded, error: fallbackError } = await supabase
              .from('track_athletes')
              .insert(fallbackAthletes)
              .select();
              
            if (fallbackError) {
              console.error("Fallback seeding failed:", fallbackError);
              handleToast(`Seeding Athletes Error: ${fallbackError.message}`);
            } else {
              seededAthletes = fallbackSeeded;
            }
          }
          
          if (seededAthletes && seededAthletes.length > 0) {
            const formattedData = seededAthletes.map((a) => ({
              ...a,
              birthYear: a.birth_year,
              bodyFat: a.body_fat,
              verticalJump: a.vertical_jump,
              standingLongJump: a.standing_long_jump,
              squatJump: a.squat_jump,
              halfSquat: a.half_squat,
              quarterSquat: a.quarter_squat,
              fullSquat: a.full_squat,
              deadlift: a.deadlift,
            }));
            setAthletes(formattedData);
            setSelectedAthleteId(formattedData[0].id);
            handleToast("☁️ Seeded initial athlete profiles to cloud");
          }
        }
      } catch (err) {
        console.error("Error in fetchAthletes:", err);
        handleToast(`Athletes Error: ${err.message || err}`);
        setIsLoading(false);
      }
    };
    fetchAthletes();
  }, []);

  useEffect(() => {
    if (selectedAthleteId)
      localStorage.setItem('lastSelectedAthlete', selectedAthleteId);
  }, [selectedAthleteId]);

  const fetchLibraryData = async () => {
    let { data: drillsData, error: drillsError } = await supabase
      .from('track_library_drills')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (drillsError) {
      console.error("Supabase drills fetch error:", drillsError);
      handleToast(`Drills Error: ${drillsError.message}`);
    }
    
    // Auto-seed drills if database is empty or outdated (less than 100 drills)
    if (!drillsError && (!drillsData || drillsData.length < 100)) {
      const initialDrillsFormatted = INITIAL_LIBRARY.drills.map(d => ({
        id: d.id,
        title: d.title,
        details: d.details,
        type: d.type,
        percentage: d.percentage,
        sets: d.sets,
        reps: d.reps,
        distance: d.distance,
        rest: d.rest,
        unit: d.unit
      }));
      const { data: seeded, error: seedError } = await supabase
        .from('track_library_drills')
        .upsert(initialDrillsFormatted, { onConflict: 'id' })
        .select();
      if (seedError) {
        console.error("Supabase drills seeding error:", seedError);
        handleToast(`Seeding Error: ${seedError.message}`);
      } else if (seeded) {
        drillsData = seeded;
      }
    }

    let { data: templatesData, error: templatesError } = await supabase
      .from('track_week_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (templatesError) {
      console.error("Supabase templates fetch error:", templatesError);
    }

    // Auto-seed templates if database is empty
    if (!templatesError && (!templatesData || templatesData.length === 0)) {
      const initialTemplatesFormatted = INITIAL_LIBRARY.templates.map(t => ({
        template_name: t.title,
        template_type: t.type,
        drills: t.drills
      }));
      const { data: seededTpl, error: seedTplError } = await supabase
        .from('track_week_templates')
        .insert(initialTemplatesFormatted)
        .select();
      if (seedTplError) {
        console.error("Supabase templates seeding error:", seedTplError);
      } else if (seededTpl) {
        templatesData = seededTpl;
      }
    }

    const formattedTemplates = (templatesData || []).map((t) => ({
      id: t.id,
      title: t.template_name,
      type: t.template_type,
      drills: t.drills,
    }));
    setLibrary({ drills: drillsData || [], templates: formattedTemplates });
    const { data: progData, error: progError } = await supabase
      .from('track_macro_programs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (progError) {
      console.error("Supabase programs fetch error:", progError);
    }
    const fetchedPrograms = progData || [];
    let merged = [...fetchedPrograms];
    const hasDefault1 = merged.some(p => p.program_name === DEFAULT_800M_PROGRAM.program_name);
    if (!hasDefault1) {
      merged = [DEFAULT_800M_PROGRAM, ...merged];
    }
    const hasDefault2 = merged.some(p => p.program_name === DEFAULT_6WEEK_800M_PROGRAM.program_name);
    if (!hasDefault2) {
      merged = [DEFAULT_6WEEK_800M_PROGRAM, ...merged];
    }
    const hasDefault3 = merged.some(p => p.program_name === DEFAULT_LONG_JUMP_PROGRAM.program_name);
    if (!hasDefault3) {
      merged = [DEFAULT_LONG_JUMP_PROGRAM, ...merged];
    }
    const hasDefault4 = merged.some(p => p.program_name === DEFAULT_TRIPLE_JUMP_PROGRAM.program_name);
    if (!hasDefault4) {
      merged = [DEFAULT_TRIPLE_JUMP_PROGRAM, ...merged];
    }
    setPrograms(merged);
  };
  useEffect(() => {
    fetchLibraryData();
    if (isRealSupabase) {
      handleToast("☁️ Live Sync Active (Supabase Cloud Connected)");
    } else {
      handleToast("💾 Local Offline Mode (LocalStorage Mock)");
    }
  }, []);

  // Listen to PWA custom install prompt events
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent browser default mini-prompt
      e.preventDefault();
      // Store event
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      handleToast('🎉 Track Lab installed successfully!');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA install user choice outcome: ${outcome}`);
    setDeferredPrompt(null);
  };

  useEffect(() => {
    const fetchWeekData = async () => {
      if (!selectedAthleteId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const endStr = getDbDateStr(weekDatesFull[6]);
        const { data } = await supabase
          .from('track_athlete_workouts')
          .select('*')
          .eq('athlete_id', selectedAthleteId)
          .gte('workout_date', weekStartDateStr)
          .lte('workout_date', endStr);
        const newSchedule = {};
        const newTitles = {};
        DAYS_OF_WEEK.forEach((day) => {
          newSchedule[day] = [];
          newTitles[day] = '';
        });
        if (data) {
          data.forEach((record) => {
            const recordDate = new Date(record.workout_date);
            const dayName = JS_DAYS[recordDate.getDay()];
            if (dayName && DAYS_OF_WEEK.includes(dayName)) {
              newSchedule[dayName] = record.drills || [];
              newTitles[dayName] = record.workout_title || '';
            }
          });
        }
        setSchedule(newSchedule);
        setDayTitles(newTitles);
        setHistory([
          {
            schedule: JSON.parse(JSON.stringify(newSchedule)),
            titles: JSON.parse(JSON.stringify(newTitles)),
          },
        ]);
        setHistoryIndex(0);
      } catch (err) {
        console.error("Error in fetchWeekData:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWeekData();
  }, [selectedAthleteId, weekStartDateStr]);

  useEffect(() => {
    const fetchMonthData = async () => {
      if (!selectedAthleteId) return;
      const startStr = getDbDateStr(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      );
      const endStr = getDbDateStr(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      );
      const { data } = await supabase
        .from('track_athlete_workouts')
        .select('workout_date, workout_title, drills')
        .eq('athlete_id', selectedAthleteId)
        .gte('workout_date', startStr)
        .lte('workout_date', endStr);
      if (data) {
        const mWorkouts = {};
        data.forEach((record) => {
          mWorkouts[record.workout_date] = {
            title: record.workout_title,
            hasDrills: record.drills && record.drills.length > 0,
          };
        });
        setMonthWorkouts(mWorkouts);
      }
    };
    if (showMonthCalendar) fetchMonthData();
  }, [
    selectedAthleteId,
    currentDate.getMonth(),
    currentDate.getFullYear(),
    showMonthCalendar,
  ]);

  useEffect(() => {
    const fetch4WeekData = async () => {
      if (!selectedAthleteId || !showStatsModal) return;
      setIs4WeekLoading(true);
      try {
        const startDate = new Date(currentWeekStart);
        const endDate = new Date(startDate.getTime() + 28 * 24 * 60 * 60 * 1000 - 24 * 60 * 60 * 1000);
        
        const startStr = getDbDateStr(startDate);
        const endStr = getDbDateStr(endDate);
        
        const { data, error } = await supabase
          .from('track_athlete_workouts')
          .select('workout_date, drills')
          .eq('athlete_id', selectedAthleteId)
          .gte('workout_date', startStr)
          .lte('workout_date', endStr);
          
        if (error) throw error;
        
        const weeks = [];
        for (let w = 0; w < 4; w++) {
          const wStart = new Date(startDate.getTime() + w * 7 * 24 * 60 * 60 * 1000);
          const wEnd = new Date(wStart.getTime() + 6 * 24 * 60 * 60 * 1000);
          
          const wStartStr = getDbDateStr(wStart);
          const wEndStr = getDbDateStr(wEnd);
          
          const wWorkouts = (data || []).filter(row => {
            return row.workout_date >= wStartStr && row.workout_date <= wEndStr;
          });
          
          let wLoad = 0;
          let wMeters = 0;
          let wContacts = 0;
          const wDaily = [];
          
          for (let d = 0; d < 7; d++) {
            const dDate = new Date(wStart.getTime() + d * 24 * 60 * 60 * 1000);
            const dStr = getDbDateStr(dDate);
            const dayRecord = wWorkouts.find(row => row.workout_date === dStr);
            const drills = dayRecord ? (dayRecord.drills || []) : [];
            
            const stats = calculateDayVolume(drills);
            wLoad += stats.totalVolumeScore;
            wMeters += stats.totalMeters;
            wContacts += stats.totalContacts;
            wDaily.push({
              dateStr: dStr,
              dayName: DAYS_OF_WEEK[d],
              load: stats.totalVolumeScore
            });
          }
          
          weeks.push({
            weekIndex: w + 1,
            startStr: wStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
            load: wLoad,
            meters: wMeters,
            contacts: wContacts,
            daily: wDaily
          });
        }
        
        setFourWeekData(weeks);
      } catch (err) {
        console.error("Error fetching 4-week data:", err);
      } finally {
        setIs4WeekLoading(false);
      }
    };
    
    fetch4WeekData();
  }, [selectedAthleteId, weekStartDateStr, showStatsModal]);

  const autoSaveDay = useCallback(async (day, drillsToSave, titleToSave) => {
    if (!selectedAthleteId) return;
    const dateStr = getDbDateStr(weekDatesFull[DAYS_OF_WEEK.indexOf(day)]);
    const finalTitle =
      titleToSave !== undefined ? titleToSave : dayTitles[day] || '';
    const finalDrills =
      drillsToSave !== undefined ? drillsToSave : schedule[day] || [];
    const { error } = await supabase.from('track_athlete_workouts').upsert(
      {
        athlete_id: selectedAthleteId,
        workout_date: dateStr,
        workout_title: finalTitle,
        drills: finalDrills,
      },
      { onConflict: 'athlete_id,workout_date' }
    );
    if (error) {
      console.error("Supabase auto-save error:", error);
      handleToast(`Database save failed: ${error.message}`);
    }
  }, [selectedAthleteId, weekDatesFull, dayTitles, schedule]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const prevState = history[newIndex];
      setSchedule(prevState.schedule);
      setDayTitles(prevState.titles);
      setHistoryIndex(newIndex);
      DAYS_OF_WEEK.forEach((day) =>
        autoSaveDay(day, prevState.schedule[day], prevState.titles[day])
      );
      handleToast('Undo successful');
    }
  };
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      setSchedule(nextState.schedule);
      setDayTitles(nextState.titles);
      setHistoryIndex(newIndex);
      DAYS_OF_WEEK.forEach((day) =>
        autoSaveDay(day, nextState.schedule[day], nextState.titles[day])
      );
      handleToast('Redo successful');
    }
  };
  const handleCopyExercise = (drill) => {
    setClipboard({ type: 'exercise', data: drill });
    handleToast('Exercise copied');
  };
  const handleCopyDay = (day) => {
    if (schedule[day].length === 0) {
      handleToast('No exercises to copy');
      return;
    }
    setClipboard({ type: 'day', data: schedule[day] });
    handleToast(`${day} workouts copied`);
  };
  const handleCopyWeek = () => {
    setClipboard({ type: 'week', data: { schedule, dayTitles } });
    handleToast('Full week copied');
  };

  const handlePasteIntoDay = (targetDay) => {
    if (!clipboard) {
      handleToast('Clipboard is empty');
      return;
    }
    let newDrills = [];
    if (clipboard.type === 'exercise')
      newDrills = [
        { ...clipboard.data, id: `w-${Date.now()}-${Math.random()}` },
      ];
    else if (clipboard.type === 'day')
      newDrills = clipboard.data.map((d, i) => ({
        ...d,
        id: `w-${Date.now()}-${i}`,
      }));
    else {
      handleToast('Use side menu to paste a week');
      return;
    }
    const updatedDrills = [...(schedule[targetDay] || []), ...newDrills];
    const newSchedule = { ...schedule, [targetDay]: updatedDrills };
    setSchedule(newSchedule);
    pushToHistory(newSchedule, dayTitles);
    autoSaveDay(targetDay, updatedDrills, dayTitles[targetDay]);
    handleToast('Pasted successfully');
  };

  const handlePasteWeek = () => {
    if (!clipboard || clipboard.type !== 'week') return;
    const newSchedule = {};
    const newTitles = { ...clipboard.data.dayTitles };
    DAYS_OF_WEEK.forEach((day) => {
      newSchedule[day] = (clipboard.data.schedule[day] || []).map((d, i) => ({
        ...d,
        id: `w-${Date.now()}-${day}-${i}`,
      }));
    });
    setSchedule(newSchedule);
    setDayTitles(newTitles);
    pushToHistory(newSchedule, newTitles);
    DAYS_OF_WEEK.forEach((day) =>
      autoSaveDay(day, newSchedule[day], newTitles[day])
    );
    handleToast('Full week pasted');
  };

  // ============================================================================
  // 🧠 TRACK & FIELD WORKLOAD ENGINE: CNS vs STRUCTURAL + DISTANCE/CONTACTS
  // ============================================================================
  const calculateDayVolume = useCallback((dayDrills) => {
    let totalExercises = dayDrills.length;
    let totalVolumeScore = 0;
    let cnsLoad = 0;
    let structuralLoad = 0;
    let validIntensityCount = 0;
    let sumIntensity = 0;
    let totalMeters = 0;
    let totalContacts = 0;

    dayDrills.forEach((drill) => {
      const type = (drill.type || '').toLowerCase();
      const baseType = getBaseCategory(type);
      if (baseType === 'isometric' || baseType === 'core' || baseType === 'mobility') {
        return; // Exclude completely from day and week load metrics
      }
      const intensity = parseFloat(drill.percentage) || 0;
      const intensityUnit = drill.intensityUnit || (drill.unit === 'x BW' ? 'x BW' : '%');

      let s = parseFloat(String(drill.sets).replace(/[^\d.]/g, '')) || 0;
      let r = parseFloat(String(drill.reps).replace(/[^\d.]/g, '')) || 0;
      let dist = parseFloat(String(drill.distance).replace(/[^\d.]/g, '')) || 0;

      if (s > 0 && r === 0 && baseType !== 'speed' && baseType !== 'endurance') r = 1;
      if (r > 0 && s === 0 && baseType !== 'speed' && baseType !== 'endurance') s = 1;
      if (s > 0 && dist === 0 && (baseType === 'speed' || baseType === 'endurance')) dist = 10; 
      if (dist > 0 && s === 0 && (baseType === 'speed' || baseType === 'endurance')) s = 1;

      let drillLoad = 0;

      const isRunning = baseType === 'speed' || baseType === 'tempo' || baseType === 'endurance' || baseType === 'anaerobic' || drill.unit === 'meters';
      const isPlyo = baseType === 'plyometrics' || baseType === 'plyos' || drill.unit === 'contacts';

      // Determine intensity factor (0.0 to 1.0+) and convert to relative % 1RM
      let intensityFactor = 1;
      let actualPct = intensity;
      
      if (intensity > 0) {
        if (intensityUnit === 'x BW' && selectedAthlete && selectedAthlete.weight) {
          const athWeight = parseFloat(selectedAthlete.weight) || 70;
          const targetWeight = intensity * athWeight;
          
          // Find matching lift 1RM
          const titleLower = (drill.title || '').toLowerCase();
          let liftMax = 0;
          
          if (titleLower.includes('bench')) {
            liftMax = parseFloat(selectedAthlete.bench) || 0;
          } else if (titleLower.includes('clean')) {
            liftMax = parseFloat(selectedAthlete.clean) || 0;
          } else if (titleLower.includes('deadlift')) {
            liftMax = parseFloat(selectedAthlete.deadlift) || 0;
          } else if (titleLower.includes('squat')) {
            if (titleLower.includes('half')) {
              liftMax = parseFloat(selectedAthlete.halfSquat) || 0;
            } else if (titleLower.includes('quarter')) {
              liftMax = parseFloat(selectedAthlete.quarterSquat) || 0;
            } else {
              liftMax = parseFloat(selectedAthlete.fullSquat) || 0;
            }
          }
          
          if (liftMax > 0) {
            intensityFactor = targetWeight / liftMax;
          } else {
            // Fallback: estimate 1RM as 2.0x bodyweight for squats/lifts, or bench 1.2x etc.
            let bwMultiplier = 2.0;
            if (titleLower.includes('bench') || titleLower.includes('clean')) bwMultiplier = 1.2;
            intensityFactor = targetWeight / (athWeight * bwMultiplier);
          }
          actualPct = Math.round(intensityFactor * 100);
        } else {
          intensityFactor = intensity / 100;
        }
      }

      // 1. SPEED (TRACK) / TEMPO / ENDURANCE / ANAEROBIC
      if (isRunning) {
        if (s > 0 && dist === 0) dist = 10; 
        if (dist > 0 && s === 0) s = 1;
        // Sprint Volume includes sets * reps * distance (e.g. 2x3x300m = 1800m)
        const sprintVolume = s * (r > 0 ? r : 1) * dist;
        totalMeters += sprintVolume;
        if (intensity > 0) {
          validIntensityCount++;
          sumIntensity += actualPct;
        }

        // Determine multiplier calibrated for physiological zones
        let speedMultiplier = 2.0;
        if (baseType === 'tempo' || type.startsWith('tempo')) {
          if (type === 'tempo_extensive') {
            speedMultiplier = 0.18; // Extensive tempo (65-75%): low CNS, aerobic flush, high volume
          } else if (type === 'tempo_intensive') {
            speedMultiplier = 0.40; // Intensive tempo (75-85%): moderate lactic load
          } else {
            speedMultiplier = 0.25; // General tempo default
          }
        } else if (baseType === 'anaerobic' || type.startsWith('anaerobic')) {
          if (type === 'anaerobic_capacity') {
            speedMultiplier = 0.30; // Anaerobic capacity (65-75%)
          } else if (type === 'anaerobic_lactic_power') {
            speedMultiplier = 0.60; // Anaerobic lactic power (75-85%)
          } else {
            speedMultiplier = 0.45;
          }
        } else if (baseType === 'endurance' || type.startsWith('endurance')) {
          if (type === 'endurance_easy') {
            speedMultiplier = 0.10;
          } else if (type === 'endurance_800') {
            speedMultiplier = 0.25;
          } else if (type === 'endurance_vo2max') {
            speedMultiplier = 0.40;
          } else if (type === 'endurance_400') {
            speedMultiplier = 0.50;
          } else {
            speedMultiplier = 0.30; // Default endurance
          }
        } else if (baseType === 'speed' || type.startsWith('speed')) {
          if (type === 'speed_endurance') {
            speedMultiplier = 1.0; // Speed endurance (longer sprints with high recovery)
          } else {
            speedMultiplier = 2.0; // Max velocity & acceleration (high CNS)
          }
        }

        // Load = (Volume * (intensity / 100)^2) * speedMultiplier
        drillLoad = (sprintVolume * Math.pow(intensityFactor, 2)) * speedMultiplier;
        
        // Dynamically split fatigue load based on category & intensity
        if (baseType === 'tempo' || type === 'tempo_extensive') {
          cnsLoad += drillLoad * 0.10; // 10% CNS
          structuralLoad += drillLoad * 0.90; // 90% Structural
        } else if (type === 'tempo_intensive') {
          cnsLoad += drillLoad * 0.35; // 35% CNS
          structuralLoad += drillLoad * 0.65; // 65% Structural
        } else if (actualPct > 85) {
          cnsLoad += drillLoad * 0.85; // 85% CNS
          structuralLoad += drillLoad * 0.15; // 15% Structural
        } else if (actualPct > 75) {
          cnsLoad += drillLoad * 0.60; // 60% CNS
          structuralLoad += drillLoad * 0.40; // 40% Structural
        } else {
          cnsLoad += drillLoad * 0.15; // 15% CNS
          structuralLoad += drillLoad * 0.85; // 85% Structural
        }
      }
      // 2. PLYOMETRICS
      else if (isPlyo) {
        if (s > 0 && r === 0) r = 1;
        if (r > 0 && s === 0) s = 1;
        const plyoVolume = s * r;
        totalContacts += plyoVolume;
        if (intensity > 0) {
          validIntensityCount++;
          sumIntensity += actualPct;
        }
        // Load = Volume * (intensity / 100) * 4.0
        drillLoad = plyoVolume * intensityFactor * 4.0;
        cnsLoad += drillLoad * 0.5; // 50% CNS
        structuralLoad += drillLoad * 0.5; // 50% Structural
      }
      // 2.5 JUMPS (LONG & TRIPLE JUMP) - Elite CNS & Reactive Landing Forces
      else if (baseType === 'long_jump' || baseType === 'triple_jump') {
        if (s > 0 && r === 0) r = 1;
        if (r > 0 && s === 0) s = 1;
        const jumpsVolume = s * r;
        totalContacts += jumpsVolume;
        if (intensity > 0) {
          validIntensityCount++;
          sumIntensity += actualPct;
        }
        // Load = Volume * (intensity / 100) * 5.0 (Extreme landing forces / impact multiplier)
        drillLoad = jumpsVolume * intensityFactor * 5.0;
        cnsLoad += drillLoad * 0.7; // 70% CNS (High velocity approach + explosive takeoff)
        structuralLoad += drillLoad * 0.3; // 30% Structural (Extreme landing deceleration impact)
      }
      // 3. POWER (GYM)
      else if (baseType === 'power') {
        if (s > 0 && r === 0) r = 1;
        if (r > 0 && s === 0) s = 1;
        if (intensity > 0) {
          validIntensityCount++;
          sumIntensity += actualPct;
        }
        // Load = (sets * reps * 2.0 * intensityFactor) * 10
        drillLoad = (s * r * 2.0 * intensityFactor) * 10;
        cnsLoad += drillLoad; // 100% CNS
      }
      // 4. STRENGTH (GYM)
      else if (baseType === 'strength') {
        if (s > 0 && r === 0) r = 1;
        if (r > 0 && s === 0) s = 1;
        if (intensity > 0) {
          validIntensityCount++;
          sumIntensity += actualPct;
        }
        // Load = (sets * reps * 1.5 * intensityFactor) * 10
        drillLoad = (s * r * 1.5 * intensityFactor) * 10;
        structuralLoad += drillLoad; // 100% Structural
      }

      totalVolumeScore += drillLoad;
    });

    return {
      totalExercises,
      totalVolumeScore: Math.round(totalVolumeScore),
      avgIntensity:
        validIntensityCount > 0
          ? Math.round(sumIntensity / validIntensityCount)
          : 0,
      totalMeters,
      totalContacts,
      cnsLoad: Math.round(cnsLoad),
      structuralLoad: Math.round(structuralLoad),
    };
  }, [selectedAthlete]);

  const weeklyStats = useMemo(() => {
    let totalLoad = 0;
    let totalCns = 0;
    let totalStruct = 0;
    let sumIntensities = 0;
    let countIntDays = 0;
    let weekMeters = 0;
    let weekContacts = 0;
    const dailyData = [];

    DAYS_OF_WEEK.forEach((day) => {
      const stats = calculateDayVolume(schedule[day] || []);
      totalLoad += stats.totalVolumeScore;
      totalCns += stats.cnsLoad;
      totalStruct += stats.structuralLoad;
      weekMeters += stats.totalMeters;
      weekContacts += stats.totalContacts;

      if (stats.avgIntensity > 0) {
        sumIntensities += stats.avgIntensity;
        countIntDays++;
      }
      dailyData.push({
        day,
        load: stats.totalVolumeScore,
        intensity: stats.avgIntensity,
      });
    });

    const avgIntensity =
      countIntDays > 0 ? Math.round(sumIntensities / countIntDays) : 0;
    const combinedLoad = totalCns + totalStruct;
    const cnsPercentage =
      combinedLoad > 0 ? Math.round((totalCns / combinedLoad) * 100) : 0;
    const structuralPercentage =
      combinedLoad > 0 ? Math.round((totalStruct / combinedLoad) * 100) : 0;

    // Track & Field specific Status Evaluation
    let loadLabel = 'Balanced Base';
    let loadColor = 'text-green-600 bg-green-50 border-green-200';
    if (totalLoad < 1000) {
      loadLabel = 'Recovery/Deload';
      loadColor = 'text-blue-600 bg-blue-50 border-blue-200';
    } else if (cnsPercentage >= 70 && totalLoad > 3000) {
      loadLabel = 'Neural Peak Week';
      loadColor = 'text-red-600 bg-red-50 border-red-200';
    } else if (structuralPercentage >= 65 && totalLoad > 4000) {
      loadLabel = 'Structural Accumulation';
      loadColor = 'text-orange-600 bg-orange-50 border-orange-200';
    }

    return {
      load: totalLoad,
      intensity: avgIntensity,
      loadLabel,
      loadColor,
      dailyData,
      weekMeters,
      weekContacts,
      cnsPercentage,
      structuralPercentage,
    };
  }, [schedule]);

  const dayStatsMap = useMemo(() => {
    const map = {};
    DAYS_OF_WEEK.forEach((day) => {
      const dayDrills = schedule[day] || [];
      const stats = calculateDayVolume(dayDrills);
      const dayTotalCombined = stats.cnsLoad + stats.structuralLoad;
      const dayCnsPct =
        dayTotalCombined > 0
          ? Math.round((stats.cnsLoad / dayTotalCombined) * 100)
          : 0;
      map[day] = {
        stats,
        dayTotalCombined,
        dayCnsPct,
      };
    });
    return map;
  }, [schedule, calculateDayVolume]);

  const handleSaveProgramBlock = async () => {
    if (!createProgramModal.name.trim()) return;
    const compiledWeeks = createProgramModal.weeksChain
      .map((tplId) => {
        const found = library?.templates?.find(
          (t) => t.id === parseInt(tplId) || t.id === tplId
        );
        return found ? { title: found.title, drills: found.drills } : null;
      })
      .filter(Boolean);
    if (compiledWeeks.length === 0) return;
    const payload = {
      program_name: createProgramModal.name,
      weeks: compiledWeeks.map((w) => ({
        ...w,
        blockTags: createProgramModal.tags,
      })),
    };
    const { error } = await supabase
      .from('track_macro_programs')
      .insert([payload]);
    if (error) {
      console.error("Supabase insert program error:", error);
      handleToast(`Failed to save program: ${error.message}`);
    } else {
      setCreateProgramModal({
        isOpen: false,
        name: '',
        tags: '',
        weeksChain: [''],
      });
      fetchLibraryData();
      handleToast('Multi-week block saved!');
    }
  };

  const handleApplyProgramBlock = async (program) => {
    if (!selectedAthleteId || !program.weeks || program.weeks.length === 0)
      return;
    setIsLoading(true);
    for (let i = 0; i < program.weeks.length; i++) {
      const futureWeekStart = new Date(currentWeekStart);
      futureWeekStart.setDate(futureWeekStart.getDate() + i * 7);
      const weekTemplateObject = program.weeks[i].drills || {};
      const targetBlockTitle = program.weeks[i].title || 'Block Workout';
      for (let j = 0; j < DAYS_OF_WEEK.length; j++) {
        const dayDate = new Date(futureWeekStart);
        dayDate.setDate(dayDate.getDate() + j);
        const clonedDrills = (weekTemplateObject[DAYS_OF_WEEK[j]] || []).map(
          (drill, idx) => ({
            ...drill,
            id: `block-${Date.now()}-${i}-${j}-${idx}`,
          })
        );
        await supabase.from('track_athlete_workouts').upsert(
          {
            athlete_id: selectedAthleteId,
            workout_date: getDbDateStr(dayDate),
            workout_title: targetBlockTitle,
            drills: clonedDrills,
          },
          { onConflict: 'athlete_id,workout_date' }
        );
      }
    }
    const { data } = await supabase
      .from('track_athlete_workouts')
      .select('*')
      .eq('athlete_id', selectedAthleteId)
      .gte('workout_date', weekStartDateStr)
      .lte('workout_date', getDbDateStr(weekDatesFull[6]));
    const newSchedule = {};
    const newTitles = {};
    DAYS_OF_WEEK.forEach((day) => {
      newSchedule[day] = [];
      newTitles[day] = '';
    });
    if (data)
      data.forEach((record) => {
        const dayName = JS_DAYS[new Date(record.workout_date).getDay()];
        if (dayName) {
          newSchedule[dayName] = record.drills || [];
          newTitles[dayName] = record.workout_title || '';
        }
      });
    setSchedule(newSchedule);
    setDayTitles(newTitles);
    setIsLoading(false);
    handleToast('Block deployed successfully!');
  };

  const handleDeleteProgramBlock = async (id) => {
    const { error } = await supabase
      .from('track_macro_programs')
      .delete()
      .eq('id', id);
    if (error) {
      console.error("Supabase delete program error:", error);
      handleToast(`Failed to delete program: ${error.message}`);
    } else {
      setPrograms((prev) => prev.filter((p) => p.id !== id));
      handleToast('Block removed');
    }
  };

  const handleDragStartWrapper = (e, day, drill, index) => {
    setDraggedItem({ source: 'timeline', day, drill, index });
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleLibraryDragStart = (e, item, isTemplate = false) => {
    setDraggedItem({ source: 'library', item, isTemplate });
    e.dataTransfer.effectAllowed = 'copy';
  };
  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e, targetDay, targetIndex = null) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedItem) return;
    setSchedule((prev) => {
      const newSchedule = { ...prev };
      if (draggedItem.source === 'timeline') {
        const { day: sourceDay, drill, index: sourceIndex } = draggedItem;
        if (sourceDay === targetDay) {
          if (sourceIndex === targetIndex) return prev;
          const updatedDrills = Array.from(newSchedule[sourceDay]);
          updatedDrills.splice(sourceIndex, 1);
          let finalTargetIndex =
            targetIndex !== null ? targetIndex : updatedDrills.length;
          if (targetIndex !== null && sourceIndex < targetIndex)
            finalTargetIndex -= 1;
          updatedDrills.splice(finalTargetIndex, 0, drill);
          newSchedule[sourceDay] = updatedDrills;
          pushToHistory(newSchedule, dayTitles);
          autoSaveDay(sourceDay, updatedDrills, dayTitles[sourceDay]);
        } else {
          const sourceDrills = Array.from(newSchedule[sourceDay]);
          sourceDrills.splice(sourceIndex, 1);
          newSchedule[sourceDay] = sourceDrills;
          const targetDrills = Array.from(newSchedule[targetDay]);
          if (targetIndex !== null) targetDrills.splice(targetIndex, 0, drill);
          else targetDrills.push(drill);
          newSchedule[targetDay] = targetDrills;
          pushToHistory(newSchedule, dayTitles);
          autoSaveDay(sourceDay, sourceDrills, dayTitles[sourceDay]);
          autoSaveDay(targetDay, targetDrills, dayTitles[targetDay]);
        }
      } else if (draggedItem.source === 'library') {
        const { item, isTemplate } = draggedItem;
        newSchedule[targetDay] = [...newSchedule[targetDay]];
        if (isTemplate) {
          const newDrills = (item?.drills || []).map((d, i) => ({
            ...d,
            id: `lib-tpl-${Date.now()}-${i}`,
          }));
          if (targetIndex !== null)
            newSchedule[targetDay].splice(targetIndex, 0, ...newDrills);
          else newSchedule[targetDay].push(...newDrills);
        } else {
          const newDrill = { ...item, id: `lib-drill-${Date.now()}` };
          if (targetIndex !== null)
            newSchedule[targetDay].splice(targetIndex, 0, newDrill);
          else newSchedule[targetDay].push(newDrill);
        }
        pushToHistory(newSchedule, dayTitles);
        autoSaveDay(targetDay, newSchedule[targetDay], dayTitles[targetDay]);
      }
      return newSchedule;
    });
    setDraggedItem(null);
  };

  const handleLibraryDropzone = async (e) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.source !== 'timeline') return;
    const { drill } = draggedItem;
    const drillData = {
      id: `drill-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      title: drill.title || '',
      details: drill.details || '',
      type: drill.type || 'speed',
      percentage: drill.percentage && !isNaN(parseFloat(drill.percentage)) ? parseFloat(drill.percentage) : null,
      sets: drill.sets || '',
      reps: drill.reps || '',
      distance: drill.distance || '',
      rest: drill.rest || '',
      unit: drill.unit || 'meters',
    };
    const { data, error } = await supabase
      .from('track_library_drills')
      .insert([drillData])
      .select();
    if (error) {
      console.error("Supabase insert library drill error:", error);
      handleToast(`Failed to save drill: ${error.message}`);
    } else if (data) {
      setLibrary((prev) => ({ ...prev, drills: [data[0], ...(prev?.drills || [])] }));
      handleToast('Saved to library archive!');
    }
    setDraggedItem(null);
  };

  const moveDrillUp = (day, index) => {
    if (index === 0) return;
    setSchedule((prev) => {
      const newSchedule = { ...prev };
      const drills = [...newSchedule[day]];
      [drills[index - 1], drills[index]] = [drills[index], drills[index - 1]];
      newSchedule[day] = drills;
      pushToHistory(newSchedule, dayTitles);
      autoSaveDay(day, drills, dayTitles[day]);
      return newSchedule;
    });
  };
  const moveDrillDown = (day, index) => {
    if (index === schedule[day].length - 1) return;
    setSchedule((prev) => {
      const newSchedule = { ...prev };
      const drills = [...newSchedule[day]];
      [drills[index + 1], drills[index]] = [drills[index], drills[index + 1]];
      newSchedule[day] = drills;
      pushToHistory(newSchedule, dayTitles);
      autoSaveDay(day, drills, dayTitles[day]);
      return newSchedule;
    });
  };

  const handleAddExerciseBtn = (day) => {
    setDayDrillModal({
      isOpen: true,
      day: day,
      drill: {
        id: `w-${Date.now()}`,
        type: 'speed',
        title: '',
        details: '',
        percentage: '',
        sets: '',
        reps: '',
        distance: '',
        rest: '',
        unit: 'meters',
        superSetNext: false,
      },
      isNew: true,
    });
  };
  const handleEditExerciseBtn = (day, drill) => {
    setDayDrillModal({
      isOpen: true,
      day: day,
      drill: { ...drill, unit: drill.unit || 'meters' },
      isNew: false,
    });
  };

  const handleSaveDayDrillModal = () => {
    const { day, drill, isNew } = dayDrillModal;
    if (!drill.title || !drill.title.trim()) {
      handleToast('Please write an exercise title first!');
      return;
    }
    let updatedDrills;
    if (isNew) {
      updatedDrills = [...(schedule[day] || []), drill];
    } else {
      updatedDrills = schedule[day].map((w) => (w.id === drill.id ? drill : w));
    }
    const newSchedule = { ...schedule, [day]: updatedDrills };
    setSchedule(newSchedule);
    pushToHistory(newSchedule, dayTitles);
    autoSaveDay(day, updatedDrills, dayTitles[day]);
    setDayDrillModal({ isOpen: false, day: null, drill: null, isNew: false });
  };

  const handleDeleteExercise = useCallback((day, id) => {
    setSchedule((prev) => {
      const updatedDrills = (prev[day] || []).filter((w) => w.id !== id);
      const newSchedule = { ...prev, [day]: updatedDrills };
      pushToHistory(newSchedule, dayTitles);
      autoSaveDay(day, updatedDrills, dayTitles[day]);
      return newSchedule;
    });
  }, [dayTitles, pushToHistory, autoSaveDay]);

  const handleDayTitleChange = useCallback((day, newTitle) => {
    setDayTitles((prev) => {
      const newTitles = { ...prev, [day]: newTitle };
      pushToHistory(schedule, newTitles);
      autoSaveDay(day, schedule[day], newTitle);
      return newTitles;
    });
  }, [schedule, pushToHistory, autoSaveDay]);

  const handleSaveDayTitleFromMonth = useCallback(async (dateKeyStr, newTitle) => {
    if (!selectedAthleteId) return;

    // Update local monthWorkouts state
    setMonthWorkouts((prev) => ({
      ...prev,
      [dateKeyStr]: {
        ...(prev[dateKeyStr] || { hasDrills: false }),
        title: newTitle,
      },
    }));

    // If the modified date falls in the currently active week, let's update dayTitles!
    const dayIndex = weekDatesFull.map(d => getDbDateStr(d)).indexOf(dateKeyStr);
    if (dayIndex !== -1) {
      const dayName = DAYS_OF_WEEK[dayIndex];
      setDayTitles(prev => ({
        ...prev,
        [dayName]: newTitle
      }));
    }

    try {
      // Fetch existing drills first to prevent overwriting them with empty
      const { data: existing } = await supabase
        .from('track_athlete_workouts')
        .select('drills')
        .eq('athlete_id', selectedAthleteId)
        .eq('workout_date', dateKeyStr)
        .maybeSingle();

      const existingDrills = existing?.drills || [];

      // Now upsert
      const { error } = await supabase.from('track_athlete_workouts').upsert(
        {
          athlete_id: selectedAthleteId,
          workout_date: dateKeyStr,
          workout_title: newTitle,
          drills: existingDrills,
        },
        { onConflict: 'athlete_id,workout_date' }
      );

      if (error) {
        console.error("Error saving day title from month calendar:", error);
      }
    } catch (err) {
      console.error("Exception saving day title from month calendar:", err);
    }
  }, [selectedAthleteId, weekDatesFull, supabase]);

  const confirmDelete = useCallback(async () => {
    if (deleteConfirmation.type === 'week') {
      const emptySchedule = DAYS_OF_WEEK.reduce(
        (acc, day) => ({ ...acc, [day]: [] }),
        {}
      );
      setSchedule(emptySchedule);
      setDayTitles({});
      pushToHistory(emptySchedule, {});
      
      if (selectedAthleteId) {
        for (const day of DAYS_OF_WEEK) {
          const dateStr = getDbDateStr(weekDatesFull[DAYS_OF_WEEK.indexOf(day)]);
          await supabase
            .from('track_athlete_workouts')
            .delete()
            .eq('athlete_id', selectedAthleteId)
            .eq('workout_date', dateStr);
        }
      }
      handleToast('Week cleared');
    } else if (
      deleteConfirmation.type === 'day' &&
      deleteConfirmation.targetDay
    ) {
      const tDay = deleteConfirmation.targetDay;
      const newSchedule = { ...schedule, [tDay]: [] };
      const newTitles = { ...dayTitles, [tDay]: '' };
      setSchedule(newSchedule);
      setDayTitles(newTitles);
      pushToHistory(newSchedule, newTitles);
      
      if (selectedAthleteId) {
        const dateStr = getDbDateStr(weekDatesFull[DAYS_OF_WEEK.indexOf(tDay)]);
        const { error } = await supabase
          .from('track_athlete_workouts')
          .delete()
          .eq('athlete_id', selectedAthleteId)
          .eq('workout_date', dateStr);
        if (error) {
          console.error("Supabase day delete error:", error);
          handleToast(`Failed to delete day from cloud: ${error.message}`);
        } else {
          handleToast(`${tDay} cleared from database and state`);
        }
      } else {
        handleToast(`${tDay} cleared`);
      }
    }
    setDeleteConfirmation({ isOpen: false, type: null, targetDay: null });
  }, [deleteConfirmation, schedule, dayTitles, selectedAthleteId, weekDatesFull, pushToHistory]);
  const handleSaveTemplate = async () => {
    if (!saveTemplateModal.name.trim()) return;
    const drillsToSave = schedule[saveTemplateModal.day].map((d) => ({ ...d }));
    const newTemplate = {
      template_name: saveTemplateModal.name,
      template_type: 'day',
      drills: drillsToSave,
    };
    const { data, error } = await supabase
      .from('track_week_templates')
      .insert([newTemplate])
      .select();
    if (error) {
      console.error("Supabase save template error:", error);
      handleToast(`Failed to save template: ${error.message}`);
    } else if (data) {
      const formatted = {
        id: data[0].id,
        title: data[0].template_name,
        type: data[0].template_type,
        drills: data[0].drills,
      };
      setLibrary((prev) => ({
        ...prev,
        templates: [formatted, ...prev.templates],
      }));
      setSaveTemplateModal({ isOpen: false, day: null, name: '' });
      handleToast(`Saved Template`);
    }
  };
  const handleSaveWeekTemplate = async () => {
    if (!saveWeekTemplateModal.name.trim()) return;
    const weekDrills = {};
    let hasDrills = false;
    DAYS_OF_WEEK.forEach((day) => {
      weekDrills[day] = (schedule[day] || []).map((drill) => ({ ...drill }));
      if (weekDrills[day].length > 0) hasDrills = true;
    });
    if (!hasDrills) {
      handleToast('Cannot save an empty template!');
      return;
    }
    const newTemplate = {
      template_name: saveWeekTemplateModal.name,
      template_type: 'week',
      drills: weekDrills,
    };
    const { error, data } = await supabase
      .from('track_week_templates')
      .insert([newTemplate])
      .select();
    if (error) {
      console.error("Supabase save week template error:", error);
      handleToast(`Failed to save week template: ${error.message}`);
    } else if (data) {
      const formatted = {
        id: data[0].id,
        title: data[0].template_name,
        type: data[0].template_type,
        drills: data[0].drills,
      };
      setLibrary((prev) => ({
        ...prev,
        templates: [formatted, ...prev.templates],
      }));
      setSaveWeekTemplateModal({ isOpen: false, name: '' });
      handleToast(`Saved Week Template`);
    }
  };

  const handleApplyTemplate = async (tpl) => {
    if (!selectedAthleteId) {
      handleToast("Please select an athlete first!");
      return;
    }
    setIsLoading(true);
    try {
      const drillsObj = tpl.drills || {};
      const newSchedule = { ...schedule };
      const newTitles = { ...dayTitles };
      const upserts = [];

      for (let i = 0; i < DAYS_OF_WEEK.length; i++) {
        const day = DAYS_OF_WEEK[i];
        const dayDate = new Date(currentWeekStart);
        dayDate.setDate(dayDate.getDate() + i);
        const dateStr = getDbDateStr(dayDate);

        let dayDrills = [];
        if (tpl.type === 'day' || tpl.template_type === 'day') {
          const targetDay = activeMobileDay || 'Saturday';
          if (day === targetDay) {
            dayDrills = (Array.isArray(drillsObj) ? drillsObj : []).map((d, idx) => ({
              ...d,
              id: `tpl-${Date.now()}-${day}-${idx}`,
            }));
            newSchedule[day] = dayDrills;
            newTitles[day] = tpl.title || 'Template Workout';
            upserts.push({
              athlete_id: selectedAthleteId,
              workout_date: dateStr,
              workout_title: tpl.title || 'Template Workout',
              drills: dayDrills,
            });
          }
        } else {
          if (Array.isArray(drillsObj)) {
            dayDrills = i === 0 ? drillsObj.map((d, idx) => ({ ...d, id: `tpl-${Date.now()}-${idx}` })) : [];
          } else {
            dayDrills = (drillsObj[day] || []).map((d, idx) => ({
              ...d,
              id: `tpl-${Date.now()}-${day}-${idx}`,
            }));
          }
          newSchedule[day] = dayDrills;
          newTitles[day] = tpl.title || 'Template Workout';
          upserts.push({
            athlete_id: selectedAthleteId,
            workout_date: dateStr,
            workout_title: tpl.title || 'Template Workout',
            drills: dayDrills,
          });
        }
      }

      if (upserts.length > 0) {
        const { error } = await supabase
          .from('track_athlete_workouts')
          .upsert(upserts, { onConflict: 'athlete_id,workout_date' });
        if (error) throw error;
      }

      setSchedule(newSchedule);
      setDayTitles(newTitles);
      pushToHistory(newSchedule, newTitles);
      handleToast(`Successfully applied template: ${tpl.title}`);
    } catch (err) {
      console.error("Error applying template:", err);
      handleToast(`Error applying template: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSaveBlockRange = async () => {
    if (!selectedAthleteId) {
      handleToast("Please select an athlete first!");
      return;
    }
    const { name, startWeek, endWeek } = saveBlockRangeModal;
    if (!name.trim()) {
      handleToast("Please enter a block name!");
      return;
    }
    if (endWeek < startWeek) {
      handleToast("End week must be greater than or equal to start week!");
      return;
    }

    setIsLoading(true);
    try {
      const upserts = [];
      const compiledWeeks = [];

      for (let w = startWeek; w <= endWeek; w++) {
        const weekShift = w - startWeek;
        const shiftDays = weekShift * 7;
        const weekDrillsObj = {};

        for (let j = 0; j < DAYS_OF_WEEK.length; j++) {
          const day = DAYS_OF_WEEK[j];
          const targetDate = new Date(currentWeekStart);
          targetDate.setDate(targetDate.getDate() + j + shiftDays);
          const dateStr = getDbDateStr(targetDate);

          const dayDrillsCloned = (schedule[day] || []).map((drill, idx) => ({
            ...drill,
            id: `block-${Date.now()}-${w}-${j}-${idx}-${Math.floor(Math.random() * 1000)}`,
          }));

          weekDrillsObj[day] = dayDrillsCloned;

          upserts.push({
            athlete_id: selectedAthleteId,
            workout_date: dateStr,
            workout_title: name,
            drills: dayDrillsCloned,
          });
        }

        compiledWeeks.push({
          title: `Week ${w}`,
          drills: weekDrillsObj,
          blockTags: `Replicated Week ${w}`,
        });
      }

      const { error: upsertError } = await supabase
        .from('track_athlete_workouts')
        .upsert(upserts, { onConflict: 'athlete_id,workout_date' });

      if (upsertError) throw upsertError;

      const macroPayload = {
        program_name: name,
        weeks: compiledWeeks,
      };

      const { error: macroError } = await supabase
        .from('track_macro_programs')
        .insert([macroPayload]);

      if (macroError) throw macroError;

      setSaveBlockRangeModal({
        isOpen: false,
        name: '',
        startWeek: 1,
        endWeek: 4,
      });

      await fetchLibraryData();

      // Trigger calendar refetch instantly
      const endStr = getDbDateStr(weekDatesFull[6]);
      const { data: refetchedWorkouts } = await supabase
        .from('track_athlete_workouts')
        .select('*')
        .eq('athlete_id', selectedAthleteId)
        .gte('workout_date', weekStartDateStr)
        .lte('workout_date', endStr);

      const newSchedule = {};
      const newTitles = {};
      DAYS_OF_WEEK.forEach((day) => {
        newSchedule[day] = [];
        newTitles[day] = '';
      });
      if (refetchedWorkouts) {
        refetchedWorkouts.forEach((record) => {
          const recordDate = new Date(record.workout_date);
          const dayName = JS_DAYS[recordDate.getDay()];
          if (dayName && DAYS_OF_WEEK.includes(dayName)) {
            newSchedule[dayName] = record.drills || [];
            newTitles[dayName] = record.workout_title || '';
          }
        });
      }
      setSchedule(newSchedule);
      setDayTitles(newTitles);
      pushToHistory(newSchedule, newTitles);

      handleToast(`Successfully saved Block: ${name} across Weeks ${startWeek} to ${endWeek}`);
    } catch (err) {
      console.error("Error in handleSaveBlockRange:", err);
      handleToast(`Block replication failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  const handleExportMobileImage = async () => {
    const el = document.getElementById('mobile-export-card');
    if (!el) {
      handleToast("Export container not found / لم يتم العثور على بطاقة التصدير!");
      return;
    }
    setIsLoading(true);
    try {
      const dataUrl = await htmlToImage.toPng(el, {
        pixelRatio: 3,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        }
      });
      const link = document.createElement('a');
      link.download = `${selectedAthlete?.name || 'Athlete'}_${activeMobileDay}_Workout.png`;
      link.href = dataUrl;
      link.click();
      handleToast(`Successfully exported mobile image for ${activeMobileDay}! / تم تصدير بطاقة الجوال بنجاح!`);
    } catch (err) {
      console.error("Error exporting mobile image:", err);
      handleToast(`Mobile image export failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  const handleAddAthlete = async () => {
    if (newAthleteData.name.trim()) {
      const addedId = `athlete-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newAthlete = {
        id: addedId,
        name: newAthleteData.name,
        birth_year: newAthleteData.birthYear
          ? parseInt(newAthleteData.birthYear)
          : null,
        weight: newAthleteData.weight
          ? parseFloat(newAthleteData.weight)
          : null,
      };
      const { data, error } = await supabase
        .from('track_athletes')
        .insert([newAthlete])
        .select();
      if (error) {
        console.error("Supabase add athlete error:", error);
        handleToast(`Failed to add athlete: ${error.message}`);
      } else if (data && data.length > 0) {
        const addedAthlete = {
          ...data[0],
          birthYear: data[0].birth_year,
          bodyFat: data[0].body_fat,
          verticalJump: data[0].vertical_jump,
          halfSquat: data[0].half_squat,
          quarterSquat: data[0].quarter_squat,
        };
        setAthletes([addedAthlete, ...(athletes || [])]);
        setSelectedAthleteId(addedAthlete.id);
        setNewAthleteData({ name: '', birthYear: '', weight: '' });
        setShowAddAthleteModal(false);
      }
    }
  };
  const handleSaveProfile = async (updatedProfile) => {
    const payload = {
      name: updatedProfile.name,
      birth_year: updatedProfile.birthYear
        ? parseInt(updatedProfile.birthYear)
        : null,
      weight: updatedProfile.weight
        ? parseFloat(updatedProfile.weight)
        : null,
      height: updatedProfile.height
        ? parseFloat(updatedProfile.height)
        : null,
      body_fat: updatedProfile.bodyFat
        ? parseFloat(updatedProfile.bodyFat)
        : null,
      vertical_jump: updatedProfile.verticalJump
        ? parseFloat(updatedProfile.verticalJump)
        : null,
      standing_long_jump: updatedProfile.standingLongJump
        ? parseFloat(updatedProfile.standingLongJump)
        : null,
      squat_jump: updatedProfile.squatJump
        ? parseFloat(updatedProfile.squatJump)
        : null,
      clean: updatedProfile.clean ? parseFloat(updatedProfile.clean) : null,
      half_squat: updatedProfile.halfSquat
        ? parseFloat(updatedProfile.halfSquat)
        : null,
      quarter_squat: updatedProfile.quarterSquat
        ? parseFloat(updatedProfile.quarterSquat)
        : null,
      full_squat: updatedProfile.fullSquat
        ? parseFloat(updatedProfile.fullSquat)
        : null,
      bench: updatedProfile.bench ? parseFloat(updatedProfile.bench) : null,
      deadlift: updatedProfile.deadlift
        ? parseFloat(updatedProfile.deadlift)
        : null,
    };
    const speedPayload = {
      ...payload,
      m100: updatedProfile.m100 ? parseFloat(updatedProfile.m100) : null,
      m150: updatedProfile.m150 ? parseFloat(updatedProfile.m150) : null,
      m200: updatedProfile.m200 ? parseFloat(updatedProfile.m200) : null,
      m300: updatedProfile.m300 ? parseFloat(updatedProfile.m300) : null,
      m400: updatedProfile.m400 ? parseFloat(updatedProfile.m400) : null,
    };
    const { error } = await supabase
      .from('track_athletes')
      .update(speedPayload)
      .eq('id', updatedProfile.id);
    if (error) {
      console.warn("Supabase update athlete error with speed columns, retrying without speed columns:", error);
      const { error: fallbackError } = await supabase
        .from('track_athletes')
        .update(payload)
        .eq('id', updatedProfile.id);
      if (fallbackError) {
        console.error("Fallback update failed:", fallbackError);
        handleToast(`Failed to update profile: ${fallbackError.message}`);
      } else {
        setAthletes((prev) =>
          (prev || []).map((a) => (a.id === updatedProfile.id ? updatedProfile : a))
        );
        setShowProfileModal(false);
        handleToast('Profile updated (excluding speed metrics)');
      }
    } else {
      setAthletes((prev) =>
        (prev || []).map((a) => (a.id === updatedProfile.id ? updatedProfile : a))
      );
      setShowProfileModal(false);
      handleToast('Profile updated');
    }
  };
  const handleDeleteLibraryDrill = async (id) => {
    const { error } = await supabase
      .from('track_library_drills')
      .delete()
      .eq('id', id);
    if (!error) {
      setLibrary((prev) => ({
        ...prev,
        drills: (prev?.drills || []).filter((d) => d.id !== id),
      }));
    }
  };
  const handleEditLibraryDrill = (drill) => {
    setAddExerciseModal({
      isOpen: true,
      id: drill.id,
      title: drill.title || '',
      details: drill.details || '',
      type: drill.type || 'speed',
      percentage: drill.percentage || '',
      sets: drill.sets || '',
      reps: drill.reps || '',
      distance: drill.distance || '',
      rest: drill.rest || '',
      unit: drill.unit || 'meters',
      targetVelocity: drill.targetVelocity || '',
      peakVelocity: drill.peakVelocity || '',
      velocityLoss: drill.velocityLoss || '10%',
    });
  };
  const handleDeleteLibraryTemplate = async (id) => {
    const { error } = await supabase
      .from('track_week_templates')
      .delete()
      .eq('id', id);
    if (!error) {
      setLibrary((prev) => ({
        ...prev,
        templates: (prev?.templates || []).filter((t) => t.id !== id),
      }));
    }
  };
  const handleEditTemplate = (tpl) => {
    handleToast('Drag to timeline, alter it, and save it again.');
  };

  const handleSaveLibraryExercise = async () => {
    if (!addExerciseModal.title.trim()) return;
    const drillData = {
      title: addExerciseModal.title || '',
      details: addExerciseModal.details || '',
      type: addExerciseModal.type || 'speed',
      percentage: addExerciseModal.percentage && !isNaN(parseFloat(addExerciseModal.percentage))
        ? parseFloat(addExerciseModal.percentage)
        : null,
      sets: addExerciseModal.sets || '',
      reps: addExerciseModal.reps || '',
      distance: addExerciseModal.distance || '',
      rest: addExerciseModal.rest || '',
      unit: addExerciseModal.unit || 'meters',
      targetVelocity: addExerciseModal.targetVelocity || null,
      peakVelocity: addExerciseModal.peakVelocity || null,
      velocityLoss: addExerciseModal.velocityLoss || null,
    };
    if (addExerciseModal.id) {
      const { data, error } = await supabase
        .from('track_library_drills')
        .update(drillData)
        .eq('id', addExerciseModal.id)
        .select();
      if (!error && data) {
        setLibrary((prev) => ({
          ...prev,
          drills: (prev?.drills || []).map((d) =>
            d.id === addExerciseModal.id ? data[0] : d
          ),
        }));
        setAddExerciseModal({
          isOpen: false,
          id: null,
          title: '',
          details: '',
          type: 'speed',
          percentage: '',
          sets: '',
          reps: '',
          distance: '',
          rest: '',
          unit: 'meters',
          targetVelocity: '',
          peakVelocity: '',
          velocityLoss: '10%',
        });
        handleToast('Exercise updated');
      } else if (error) {
        console.error("Supabase update library drill error:", error);
        handleToast(`Failed to update drill: ${error.message}`);
      }
    } else {
      const drillWithId = {
        ...drillData,
        id: `drill-${Date.now()}-${Math.floor(Math.random() * 10000)}`
      };
      const { data, error } = await supabase
        .from('track_library_drills')
        .insert([drillWithId])
        .select();
      if (!error && data) {
        setLibrary((prev) => ({ ...prev, drills: [data[0], ...(prev?.drills || [])] }));
        setAddExerciseModal({
          isOpen: false,
          id: null,
          title: '',
          details: '',
          type: 'speed',
          percentage: '',
          sets: '',
          reps: '',
          distance: '',
          rest: '',
          unit: 'meters',
          targetVelocity: '',
          peakVelocity: '',
          velocityLoss: '10%',
        });
        handleToast('Exercise added');
      } else if (error) {
        console.error("Supabase insert library drill error:", error);
        handleToast(`Failed to add drill: ${error.message}`);
      }
    }
  };

  const handleDeleteAthlete = async (id) => {
    const { error } = await supabase.from('track_athletes').delete().eq('id', id);
    if (!error) {
      const remaining = (athletes || []).filter((a) => a.id !== id);
      setAthletes(remaining);
      if (remaining.length > 0) {
        setSelectedAthleteId(remaining[0].id);
      } else {
        setSelectedAthleteId(null);
      }
      handleToast('Athlete profile deleted');
    }
  };

  const handlePrintLandscape = () => {
    setPrintOrientation('landscape');
    setShowPrintModal(true);
  };

  const handlePrintPortrait = () => {
    setPrintOrientation('portrait');
    setShowPrintModal(true);
  };

  const triggerActualPrint = () => {
    // 1. Remove all old orientation and theme classes from body
    document.body.classList.remove(
      'print-landscape',
      'print-portrait',
      'print-theme-classic-crimson',
      'print-theme-minimal-ink',
      'print-theme-pro-navy',
      'print-theme-athletic-green',
      'print-theme-dark-neon'
    );

    // 2. Add selected orientation and theme classes to body
    document.body.classList.add(`print-${printOrientation}`);
    document.body.classList.add(`print-theme-${printTheme}`);

    // 3. Close the modal first so it is not visible during print
    setShowPrintModal(false);

    // 4. Wait a tiny bit for React state updates and then open print prompt
    setTimeout(() => {
      window.print();
    }, 150);
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center font-sans ${isDarkMode ? 'dark bg-slate-950 text-slate-50' : 'bg-[#F4F5F7] text-slate-900'}`}>
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
          <p className="text-sm font-black uppercase tracking-wider text-slate-500">Loading Athletics Lab...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen font-sans selection:bg-orange-500/30 transition-colors duration-200 ${
        isDarkMode
          ? 'dark bg-slate-950 text-slate-50'
          : 'bg-[#F4F5F7] text-slate-900'
      } print:bg-white print:text-black`}
    >
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-800 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-[100] animate-[bounce_0.3s_ease-out] print:hidden">
          <Check className="w-5 h-5 text-green-400 dark:text-green-600" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}
      {showProfileModal && selectedAthlete && (
        <AthleteProfileModal
          athlete={selectedAthlete}
          onClose={() => setShowProfileModal(false)}
          onSave={handleSaveProfile}
          onDelete={handleDeleteAthlete}
        />
      )}

      {/* SAVE DAY TEMPLATE MODAL */}
      {saveTemplateModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 print:hidden animate-[fadeIn_0.2s_ease-out]" onClick={() => setSaveTemplateModal({ isOpen: false, day: null, name: '' })}>
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 dark:border-slate-700 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">Save {saveTemplateModal.day} as Template</h3>
              <button onClick={() => setSaveTemplateModal({ isOpen: false, day: null, name: '' })} className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Template Name</label>
                <input
                  type="text"
                  value={saveTemplateModal.name}
                  onChange={(e) => setSaveTemplateModal({ ...saveTemplateModal, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none font-semibold"
                  placeholder="e.g. Acceleration drills, Speed Endurance..."
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSaveTemplateModal({ isOpen: false, day: null, name: '' })}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTemplate}
                  disabled={!saveTemplateModal.name.trim()}
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-md shadow-orange-500/10 font-bold text-sm disabled:opacity-50 transition-all"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SAVE WEEK TEMPLATE MODAL */}
      {saveWeekTemplateModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 print:hidden animate-[fadeIn_0.2s_ease-out]" onClick={() => setSaveWeekTemplateModal({ isOpen: false, name: '' })}>
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 dark:border-slate-700 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">Save Current Week as Template</h3>
              <button onClick={() => setSaveWeekTemplateModal({ isOpen: false, name: '' })} className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Template Name</label>
                <input
                  type="text"
                  value={saveWeekTemplateModal.name}
                  onChange={(e) => setSaveWeekTemplateModal({ ...saveWeekTemplateModal, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none font-semibold"
                  placeholder="e.g. SPP Week 1, General Prep Week 3..."
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSaveWeekTemplateModal({ isOpen: false, name: '' })}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveWeekTemplate}
                  disabled={!saveWeekTemplateModal.name.trim()}
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-md shadow-orange-500/10 font-bold text-sm disabled:opacity-50 transition-all"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SAVE BLOCK RANGE MODAL (MULTI-WEEK SELECTOR) */}
      {saveBlockRangeModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 print:hidden animate-[fadeIn_0.2s_ease-out]" onClick={() => setSaveBlockRangeModal({ isOpen: false, name: '', startWeek: 1, endWeek: 4 })}>
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 dark:border-slate-700 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-orange-500" /> Save Block Range / حفظ كتل الأسابيع
              </h3>
              <button onClick={() => setSaveBlockRangeModal({ isOpen: false, name: '', startWeek: 1, endWeek: 4 })} className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Block Name / اسم الوحدة الكبرى</label>
                <input
                  type="text"
                  value={saveBlockRangeModal.name}
                  onChange={(e) => setSaveBlockRangeModal({ ...saveBlockRangeModal, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-650 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none font-bold text-sm"
                  placeholder="e.g. 4-Week Block Sprints..."
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Start Week / أسبوع البدء</label>
                  <select
                    value={saveBlockRangeModal.startWeek}
                    onChange={(e) => setSaveBlockRangeModal({ ...saveBlockRangeModal, startWeek: parseInt(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-650 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-bold text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((w) => (
                      <option key={`start-w-${w}`} value={w}>Week {w}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">End Week / أسبوع الانتهاء</label>
                  <select
                    value={saveBlockRangeModal.endWeek}
                    onChange={(e) => setSaveBlockRangeModal({ ...saveBlockRangeModal, endWeek: parseInt(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-650 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-bold text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].filter(w => w >= saveBlockRangeModal.startWeek).map((w) => (
                      <option key={`end-w-${w}`} value={w}>Week {w}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  onClick={() => setSaveBlockRangeModal({ isOpen: false, name: '', startWeek: 1, endWeek: 4 })}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-sm"
                >
                  Cancel / إلغاء
                </button>
                <button
                  onClick={handleSaveBlockRange}
                  disabled={!saveBlockRangeModal.name.trim() || saveBlockRangeModal.endWeek < saveBlockRangeModal.startWeek}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl shadow-md font-bold text-sm disabled:opacity-50 transition-all active:scale-95"
                >
                  Save Range / تأكيد التكرار
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ADD ATHLETE MODAL */}
      {showAddAthleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 print:hidden animate-[fadeIn_0.2s_ease-out]" onClick={() => setShowAddAthleteModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 dark:border-slate-700 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">Add Athlete</h3>
              <button onClick={() => setShowAddAthleteModal(false)} className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
                <input
                  type="text"
                  value={newAthleteData.name}
                  onChange={(e) => setNewAthleteData({ ...newAthleteData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="e.g. Noah Lyles"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Birth Year</label>
                  <input
                    type="number"
                    value={newAthleteData.birthYear}
                    onChange={(e) => setNewAthleteData({ ...newAthleteData, birthYear: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="e.g. 1997"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newAthleteData.weight}
                    onChange={(e) => setNewAthleteData({ ...newAthleteData, weight: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="e.g. 70.5"
                  />
                </div>
              </div>
              <button
                onClick={handleAddAthlete}
                className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors shadow-md shadow-orange-500/20"
              >
                Create Athlete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MONTH CALENDAR OVERLAY MODAL */}
      {showMonthCalendar && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 print:hidden animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setShowMonthCalendar(false)}
        >
          <div
            className="bg-white dark:bg-slate-950 rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden border border-slate-200 dark:border-slate-850 flex flex-col h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-950 dark:text-slate-50">
                    Monthly Plan Audit
                  </h3>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Track Lab
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowMonthCalendar(false)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Month Switcher */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const prev = new Date(currentDate);
                    prev.setMonth(prev.getMonth() - 1);
                    setCurrentDate(prev);
                  }}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h4 className="text-sm md:text-base font-black text-slate-950 dark:text-slate-50 min-w-[140px] text-center select-none uppercase tracking-wider">
                  {currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </h4>
                <button
                  onClick={() => {
                    const next = new Date(currentDate);
                    next.setMonth(next.getMonth() + 1);
                    setCurrentDate(next);
                  }}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Go to Today
              </button>
            </div>

            {/* Weekdays Labels */}
            <div className="grid grid-cols-7 gap-1 px-6 py-2 bg-slate-50 dark:bg-slate-900 text-center border-b border-slate-200 dark:border-slate-800">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <span key={`cal-head-${d}`} className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 tracking-wider">
                  {d}
                </span>
              ))}
            </div>

            {/* Calendar Grid Box */}
            <div className="flex-grow overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950">
              <div className="grid grid-cols-7 gap-2">
                {(() => {
                  const year = currentDate.getFullYear();
                  const month = currentDate.getMonth();

                  const firstDayIndex = new Date(year, month, 1).getDay();
                  const totalDays = new Date(year, month + 1, 0).getDate();

                  const cells = [];

                  for (let i = 0; i < firstDayIndex; i++) {
                    cells.push(
                      <div
                        key={`pad-${i}`}
                        className="h-24 sm:h-32 rounded-2xl bg-slate-100/30 dark:bg-slate-800/10 opacity-30 pointer-events-none"
                      />
                    );
                  }

                  for (let d = 1; d <= totalDays; d++) {
                    const boxDate = new Date(year, month, d);
                    const dateKeyStr = getDbDateStr(boxDate);
                    const workout = monthWorkouts[dateKeyStr];

                    const isToday =
                      new Date().getDate() === d &&
                      new Date().getMonth() === month &&
                      new Date().getFullYear() === year;

                    cells.push(
                      <div
                        key={`day-box-${d}`}
                        onClick={() => {
                          setCurrentDate(boxDate);
                          setShowMonthCalendar(false);
                        }}
                        className={`group relative h-24 sm:h-32 rounded-2xl border text-left p-2.5 transition-all flex flex-col justify-between cursor-pointer ${
                          isToday
                            ? 'border-orange-500 bg-orange-50/30 dark:bg-orange-950/10 shadow-md ring-1 ring-orange-400'
                            : workout?.hasDrills
                            ? 'border-emerald-400 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/20 hover:border-emerald-500'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-orange-500/20 hover:scale-[1.01]'
                        }`}
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-colors ${
                            isToday
                              ? 'bg-orange-500 text-white'
                              : workout?.hasDrills
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : 'text-slate-950 dark:text-slate-50 group-hover:bg-slate-100 dark:group-hover:bg-slate-800'
                          }`}>
                            {d}
                          </span>
                          {workout?.hasDrills && (
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
                          )}
                        </div>

                        <div className="w-full mt-2 flex flex-col justify-end relative z-10">
                          <input
                            type="text"
                            value={workout?.title || ''}
                            placeholder={workout?.hasDrills ? "Active Plan" : "Rest/Off"}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleSaveDayTitleFromMonth(dateKeyStr, e.target.value)}
                            className="w-full bg-transparent border-none text-[10px] font-bold text-slate-950 dark:text-slate-50 p-0 outline-none leading-tight placeholder-slate-450 dark:placeholder-slate-500 hover:bg-slate-100/50 dark:hover:bg-slate-850/50 focus:bg-slate-100 dark:focus:bg-slate-800 px-1 rounded transition-all focus:ring-0"
                          />
                        </div>
                      </div>
                    );
                  }

                  return cells;
                })()}
              </div>
            </div>
        </div>
      </div>
      )}

      <Header
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        currentWeekStart={currentWeekStart}
        setShowMonthCalendar={setShowMonthCalendar}
        selectedAthlete={selectedAthlete}
        setSelectedAthleteId={setSelectedAthleteId}
        athletes={athletes || []}
        isAthleteDropdownOpen={isAthleteDropdownOpen}
        setIsAthleteDropdownOpen={setIsAthleteDropdownOpen}
        setShowAddAthleteModal={setShowAddAthleteModal}
        setShowProfileModal={setShowProfileModal}
        isMobileView={isMobileView}
        setIsMobileView={setIsMobileView}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        showLibrary={showLibrary}
        setShowLibrary={setShowLibrary}
        handleToast={handleToast}
        setSaveWeekTemplateModal={setSaveWeekTemplateModal}
        setSaveBlockRangeModal={setSaveBlockRangeModal}
        weeklyStats={weeklyStats}
        onDeleteAthlete={handleDeleteAthlete}
      />

      {/* TRACK & FIELD ANALYTICS DASHBOARD MODAL */}
      {showStatsModal && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 print:hidden"
          onClick={() => setShowStatsModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-5 md:p-6 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-orange-500" /> Track & Field
                Weekly Analytics
              </h3>
              <button
                onClick={() => setShowStatsModal(false)}
                className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-2xl border ${weeklyStats.loadColor}`}
                >
                  <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">
                    Total System Load
                  </p>
                  <p className="text-3xl font-black">
                    {weeklyStats.load}{' '}
                    <span className="text-sm font-medium opacity-80">AU</span>
                  </p>
                  <p className="text-sm font-bold mt-1 opacity-90">
                    Phase: {weeklyStats.loadLabel}
                  </p>
                </div>
                <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">
                    Average S&C Intensity
                  </p>
                  <p className="text-3xl font-black">
                    {weeklyStats.intensity}%
                  </p>
                </div>
              </div>

              {/* T&F Specific Trackers */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Sprints Distance
                  </p>
                  <p className="text-xl font-black text-indigo-500 mt-0.5">
                    {weeklyStats.weekMeters}m
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Foot Contacts
                  </p>
                  <p className="text-xl font-black text-amber-500 mt-0.5">
                    {weeklyStats.weekContacts}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    CNS Impact
                  </p>
                  <p className="text-xl font-black text-red-500 mt-0.5">
                    {weeklyStats.cnsPercentage}%
                  </p>
                </div>
              </div>

              {/* Weekly Workload Curve Chart */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/80 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-orange-500" /> Weekly Workload Distribution / منحنى الحمل الأسبوعي
                  </h4>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 italic">
                    Daily Fatigue & Volume Tracking (AU)
                  </span>
                </div>
                
                <div className="relative w-full h-[150px] bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/40 p-2 overflow-hidden shadow-inner">
                  {(() => {
                    const maxVal = Math.max(...weeklyStats.dailyData.map((d) => d.load), 1000);
                    const points = weeklyStats.dailyData.map((d, i) => {
                      const x = 40 + (470 * i) / 6;
                      const y = 115 - (d.load / maxVal) * 90;
                      return { x, y, load: d.load, day: d.day };
                    });

                    let pathD = '';
                    let areaD = '';
                    points.forEach((p, i) => {
                      if (i === 0) {
                        pathD = `M ${p.x} ${p.y}`;
                        areaD = `M ${p.x} 115 L ${p.x} ${p.y}`;
                      } else {
                        const prev = points[i - 1];
                        const dx = (p.x - prev.x) * 0.45;
                        pathD += ` C ${prev.x + dx} ${prev.y}, ${p.x - dx} ${p.y}, ${p.x} ${p.y}`;
                        areaD += ` C ${prev.x + dx} ${prev.y}, ${p.x - dx} ${p.y}, ${p.x} ${p.y}`;
                      }
                    });
                    if (points.length > 0) {
                      areaD += ` L ${points[points.length - 1].x} 115 Z`;
                    }

                    let chartColor = '#f97316';
                    if (weeklyStats.loadLabel === 'Recovery/Deload') chartColor = '#3b82f6';
                    else if (weeklyStats.loadLabel === 'Neural Peak Week') chartColor = '#ef4444';
                    else if (weeklyStats.loadLabel === 'Balanced Base') chartColor = '#22c55e';

                    const dayAbbrev = {
                      Saturday: 'Sat',
                      Sunday: 'Sun',
                      Monday: 'Mon',
                      Tuesday: 'Tue',
                      Wednesday: 'Wed',
                      Thursday: 'Thu',
                      Friday: 'Fri'
                    };

                    return (
                      <svg viewBox="0 0 540 140" className="w-full h-full text-slate-400 dark:text-slate-600 font-sans">
                        <defs>
                          <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={chartColor} stopOpacity="0.25" />
                            <stop offset="100%" stopColor={chartColor} stopOpacity="0" />
                          </linearGradient>
                          <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="120%">
                            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor={chartColor} floodOpacity="0.2" />
                          </filter>
                        </defs>

                        {/* Y-Axis Guidelines */}
                        <line x1="35" y1="25" x2="520" y2="25" stroke="currentColor" strokeOpacity="0.1" strokeDasharray="3 3" />
                        <line x1="35" y1="70" x2="520" y2="70" stroke="currentColor" strokeOpacity="0.1" strokeDasharray="3 3" />
                        <line x1="35" y1="115" x2="520" y2="115" stroke="currentColor" strokeOpacity="0.15" />

                        {/* Area Path */}
                        {areaD && <path d={areaD} fill="url(#chartAreaGradient)" />}

                        {/* Line Path */}
                        {pathD && (
                          <path
                            d={pathD}
                            fill="none"
                            stroke={chartColor}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            filter="url(#shadowFilter)"
                          />
                        )}

                        {/* Guideline Labels */}
                        <text x="12" y="28" className="text-[8px] font-bold fill-slate-400 select-none">{maxVal}</text>
                        <text x="12" y="73" className="text-[8px] font-bold fill-slate-400 select-none">{Math.round(maxVal / 2)}</text>
                        <text x="18" y="118" className="text-[8px] font-bold fill-slate-400 select-none">0</text>

                        {/* Points & Labels */}
                        {points.map((p, idx) => {
                          const abbrev = dayAbbrev[p.day] || p.day.substring(0, 3);
                          return (
                            <g key={idx} className="group/point">
                              {/* Day Label on X-Axis */}
                              <text
                                x={p.x}
                                y="132"
                                textAnchor="middle"
                                className="text-[9px] font-extrabold fill-slate-500 dark:fill-slate-400 tracking-wider uppercase select-none"
                              >
                                {abbrev}
                              </text>

                              {/* Grid Vertical Guideline */}
                              <line
                                x1={p.x}
                                y1="25"
                                x2={p.x}
                                y2="115"
                                stroke={chartColor}
                                strokeOpacity="0.08"
                                strokeWidth="1.5"
                              />

                              {/* Point Circle */}
                              <circle
                                cx={p.x}
                                cy={p.y}
                                r="5"
                                fill={chartColor}
                                stroke={p.load > 0 ? "#ffffff" : "currentColor"}
                                strokeWidth="1.5"
                                className="transition-all duration-300 dark:stroke-slate-950"
                              />

                              {/* Glowing circle ring */}
                              <circle
                                cx={p.x}
                                cy={p.y}
                                r="8"
                                fill={chartColor}
                                fillOpacity="0"
                                className="hover:fill-opacity-10 cursor-pointer transition-all duration-150"
                              />

                              {/* Load text display right above point */}
                              {p.load > 0 && (
                                <text
                                  x={p.x}
                                  y={p.y - 8}
                                  textAnchor="middle"
                                  className="text-[9px] font-black fill-slate-800 dark:fill-slate-200 select-none drop-shadow-sm transition-all"
                                >
                                  {p.load}
                                </text>
                              )}
                            </g>
                          );
                        })}
                      </svg>
                    );
                  })()}
                </div>
              </div>

              {/* 4-Week Macrocycle Workload Breakdown */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/80 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4 text-orange-500" /> 4-Week Load Cycle Breakdown / دورة الحمل لـ 4 أسابيع
                  </h4>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 italic">
                    Macrocycle Periodization Plan
                  </span>
                </div>

                {is4WeekLoading ? (
                  <div className="flex flex-col items-center justify-center py-6 gap-2">
                    <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-450">Loading periodization chart...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {fourWeekData.map((w) => {
                      const maxWeekLoad = Math.max(...fourWeekData.map(wk => wk.load), 1000);
                      const loadPercentage = Math.min((w.load / maxWeekLoad) * 100, 100);
                      
                      // Color coding based on load level
                      let barColor = 'bg-emerald-500';
                      let textColor = 'text-emerald-600 dark:text-emerald-400';
                      let badgeColor = 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100';
                      if (w.load < 1000) {
                        barColor = 'bg-blue-500';
                        textColor = 'text-blue-600 dark:text-blue-400';
                        badgeColor = 'bg-blue-50 dark:bg-blue-950/20 border-blue-100';
                      } else if (w.load > 3500) {
                        barColor = 'bg-red-500';
                        textColor = 'text-red-600 dark:text-red-400';
                        badgeColor = 'bg-red-50 dark:bg-red-950/20 border-red-100';
                      } else if (w.load > 2500) {
                        barColor = 'bg-orange-500';
                        textColor = 'text-orange-600 dark:text-orange-400';
                        badgeColor = 'bg-orange-50 dark:bg-orange-950/20 border-orange-100';
                      }

                      return (
                        <div key={w.weekIndex} className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                          {/* Week Title & Start Date */}
                          <div className="w-full sm:w-36 shrink-0 flex items-center justify-between sm:justify-start gap-2.5">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${badgeColor} ${textColor}`}>
                              Week {w.weekIndex}
                            </span>
                            <div className="text-right sm:text-left">
                              <p className="text-[11px] font-black text-slate-800 dark:text-slate-200">
                                {w.startStr}
                              </p>
                              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                                Start Date / بداية الأسبوع
                              </p>
                            </div>
                          </div>

                          {/* Workload Progress Bar */}
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="font-bold text-slate-400 uppercase tracking-widest">Load Score</span>
                              <span className={`font-black ${textColor}`}>{w.load} AU</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
                              <div
                                  className={`h-full ${barColor} transition-all duration-500 rounded-full`}
                                  style={{ width: `${loadPercentage}%` }}
                              />
                            </div>
                            <div className="flex gap-2.5 text-[8px] font-bold text-slate-450 uppercase tracking-wider">
                              {w.meters > 0 && <span>🏃‍♂️ {w.meters}m</span>}
                              {w.contacts > 0 && <span>🦘 {w.contacts} contacts</span>}
                            </div>
                          </div>

                          {/* Daily Sparkline Bars */}
                          <div className="flex items-end justify-between sm:justify-end gap-1.5 w-full sm:w-32 h-9 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-900 pt-2 sm:pt-0 sm:pl-3">
                            {w.daily.map((d, dIdx) => {
                              const dayLabel = d.dayName.substring(0, 1);
                              const maxDailyLoad = Math.max(...w.daily.map(day => day.load), 100);
                              const dailyHeightPercentage = Math.min((d.load / maxDailyLoad) * 100, 100);
                              
                              return (
                                <div key={dIdx} className="flex flex-col items-center gap-1 group/day relative">
                                  {/* Hover tooltip for daily load */}
                                  <span className="absolute bottom-full mb-1 scale-0 group-hover/day:scale-100 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[8px] font-black px-1 py-0.5 rounded shadow-md z-30 transition-all pointer-events-none whitespace-nowrap">
                                    {d.load} AU
                                  </span>
                                  
                                  {/* Vertical Bar */}
                                  <div className="w-2.5 h-6 bg-slate-100 dark:bg-slate-900 rounded-t-sm flex items-end overflow-hidden border border-slate-200/30 dark:border-slate-800/30">
                                    <div
                                      className={`w-full ${barColor} opacity-75 group-hover/day:opacity-100 transition-all`}
                                      style={{ height: `${dailyHeightPercentage}%` }}
                                    />
                                  </div>
                                  
                                  {/* Day Initial */}
                                  <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-500 uppercase select-none">
                                    {dayLabel}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Neural vs Structural Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>CNS & Neural Drive (Speed/Power)</span>
                  <span>Structural Loading (Strength/Volume)</span>
                </div>
                <div className="w-full h-4 bg-slate-100 dark:bg-slate-700 rounded-full flex overflow-hidden border border-slate-200/50">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"
                    style={{ width: `${weeklyStats.cnsPercentage}%` }}
                  />
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                    style={{ width: `${weeklyStats.structuralPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>{weeklyStats.cnsPercentage}% CNS</span>
                  <span>{weeklyStats.structuralPercentage}% Struct</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TRACK & FIELD EXERCISE MODAL */}
      {dayDrillModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                {dayDrillModal.isNew ? (
                  <Plus className="w-5 h-5 text-green-500" />
                ) : (
                  <Edit2 className="w-5 h-5 text-blue-500" />
                )}
                {dayDrillModal.isNew ? 'Add Workout Block' : 'Edit Parameters'}
              </h3>
              <button
                onClick={() =>
                  setDayDrillModal({
                    isOpen: false,
                    day: null,
                    drill: null,
                    isNew: false,
                  })
                }
                className="p-1.5 bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
                    Category
                  </label>
                  <select
                    value={getBaseCategory(dayDrillModal.drill.type)}
                    onChange={(e) => {
                      const newBaseType = e.target.value;
                      let newType = newBaseType;
                      if (newBaseType === 'endurance') newType = 'endurance_400';
                      else if (newBaseType === 'core') newType = 'core_rotation';
                      else if (newBaseType === 'strength') newType = 'strength_single_leg';
                      
                      let newUnit = dayDrillModal.drill.unit;
                      if (newBaseType === 'speed' || newBaseType === 'endurance') newUnit = 'meters';
                      else if (newBaseType === 'plyometrics' || newBaseType === 'long_jump' || newBaseType === 'triple_jump') newUnit = 'contacts';
                      else if (newBaseType === 'isometric' || newBaseType === 'mobility') newUnit = 'sec';
                      else newUnit = 'reps';
                      setDayDrillModal({
                        ...dayDrillModal,
                        drill: {
                          ...dayDrillModal.drill,
                          type: newType,
                          unit: newUnit
                        },
                      });
                    }}
                    className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(EXERCISE_CATEGORIES).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>

                  {SUBCATEGORIES[getBaseCategory(dayDrillModal.drill.type)] && (
                    <div className="mt-3 animate-[fadeIn_0.15s_ease-out]">
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
                        Subcategory
                      </label>
                      <select
                        value={dayDrillModal.drill.type}
                        onChange={(e) =>
                          setDayDrillModal({
                            ...dayDrillModal,
                            drill: { ...dayDrillModal.drill, type: e.target.value }
                          })
                        }
                        className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {Object.entries(SUBCATEGORIES[getBaseCategory(dayDrillModal.drill.type)])
                          .filter(([k]) => k !== 'all')
                          .map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 w-48 shrink-0">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold text-slate-500 uppercase">
                        {dayDrillModal.drill.type === 'speed' ? 'Speed' : 'Intensity'}
                      </label>
                      {dayDrillModal.drill.type !== 'speed' && (dayDrillModal.drill.intensityUnit === 'x BW' || dayDrillModal.drill.unit === 'x BW') && selectedAthlete && selectedAthlete.weight && (
                        (() => {
                          const bwVal = parseFloat(dayDrillModal.drill.percentage) || 0;
                          const targetKg = bwVal * parseFloat(selectedAthlete.weight);
                          if (targetKg > 0) {
                            const titleLower = (dayDrillModal.drill.title || '').toLowerCase();
                            let liftMax = 0;
                            if (titleLower.includes('bench')) {
                              liftMax = parseFloat(selectedAthlete.bench) || 0;
                            } else if (titleLower.includes('clean')) {
                              liftMax = parseFloat(selectedAthlete.clean) || 0;
                            } else if (titleLower.includes('deadlift')) {
                              liftMax = parseFloat(selectedAthlete.deadlift) || 0;
                            } else if (titleLower.includes('squat')) {
                              if (titleLower.includes('half')) {
                                liftMax = parseFloat(selectedAthlete.halfSquat) || 0;
                              } else if (titleLower.includes('quarter')) {
                                liftMax = parseFloat(selectedAthlete.quarterSquat) || 0;
                              } else {
                                liftMax = parseFloat(selectedAthlete.fullSquat) || 0;
                              }
                            }
                            if (liftMax > 0) {
                              const pct = Math.round((targetKg / liftMax) * 100);
                              return <span className="text-[10px] font-black text-rose-500 lowercase font-sans">{targetKg.toFixed(1)}kg ({pct}% 1RM)</span>;
                            }
                            return <span className="text-[10px] font-black text-rose-500 lowercase font-sans">{targetKg.toFixed(1)}kg</span>;
                          }
                          return null;
                        })()
                      )}
                    </div>
                    <div className="flex items-center rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden w-full h-[42px] transition-all">
                      <div className="pl-3 pr-1 text-slate-400 dark:text-slate-500 flex items-center shrink-0 select-none">
                        {dayDrillModal.drill.intensityUnit === 'x BW' || dayDrillModal.drill.unit === 'x BW' ? (
                          <span className="text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-500">xBW</span>
                        ) : (
                          <Percent className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={dayDrillModal.drill.percentage || ''}
                        onChange={(e) =>
                          setDayDrillModal({
                            ...dayDrillModal,
                            drill: {
                              ...dayDrillModal.drill,
                              percentage: e.target.value,
                            },
                          })
                        }
                        className="flex-grow w-full text-sm py-2 px-1.5 bg-transparent border-none outline-none text-slate-800 dark:text-white font-medium focus:ring-0 focus:ring-offset-0"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  {dayDrillModal.drill.type !== 'speed' && (
                    <div className="w-18 shrink-0">
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
                        Unit
                      </label>
                      <select
                        value={dayDrillModal.drill.intensityUnit || (dayDrillModal.drill.unit === 'x BW' ? 'x BW' : '%')}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDayDrillModal({
                            ...dayDrillModal,
                            drill: {
                              ...dayDrillModal.drill,
                              intensityUnit: val,
                              unit: val === 'x BW' ? 'x BW' : 'reps'
                            },
                          });
                        }}
                        className="w-full text-sm py-2.5 px-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="%">%</option>
                        <option value="x BW">x BW</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Inputs Based on Category */}
              <div className="flex gap-2 sm:gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
                    Sets
                  </label>
                  <input
                    type="text"
                    value={dayDrillModal.drill.sets || ''}
                    onChange={(e) =>
                      setDayDrillModal({
                        ...dayDrillModal,
                        drill: { ...dayDrillModal.drill, sets: e.target.value },
                      })
                    }
                    placeholder="e.g. 3"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {dayDrillModal.drill.type === 'speed' && (
                  <>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
                        Reps
                      </label>
                      <input
                        type="text"
                        value={dayDrillModal.drill.reps || ''}
                        onChange={(e) =>
                          setDayDrillModal({
                            ...dayDrillModal,
                            drill: { ...dayDrillModal.drill, reps: e.target.value },
                          })
                        }
                        placeholder="e.g. 2"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
                        Distance (Meters)
                      </label>
                      <input
                        type="text"
                        value={dayDrillModal.drill.distance || ''}
                        onChange={(e) =>
                          setDayDrillModal({
                            ...dayDrillModal,
                            drill: {
                              ...dayDrillModal.drill,
                              distance: e.target.value,
                              unit: 'meters'
                            },
                          })
                        }
                        placeholder="e.g. 200"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                {dayDrillModal.drill.type === 'isometric' && (
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
                      Duration (Seconds)
                    </label>
                    <input
                      type="text"
                      value={dayDrillModal.drill.reps || ''}
                      onChange={(e) =>
                        setDayDrillModal({
                          ...dayDrillModal,
                          drill: {
                            ...dayDrillModal.drill,
                            reps: e.target.value,
                            unit: 'sec'
                          },
                        })
                      }
                      placeholder="e.g. 30"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {dayDrillModal.drill.type !== 'speed' && dayDrillModal.drill.type !== 'isometric' && (
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
                      {dayDrillModal.drill.type === 'plyometrics' || dayDrillModal.drill.type === 'long_jump' || dayDrillModal.drill.type === 'triple_jump' ? 'Contacts / Jumps' : 'Reps'}
                    </label>
                    <input
                      type="text"
                      value={dayDrillModal.drill.reps || ''}
                      onChange={(e) =>
                        setDayDrillModal({
                          ...dayDrillModal,
                          drill: {
                            ...dayDrillModal.drill,
                            reps: e.target.value,
                            unit: (dayDrillModal.drill.type === 'plyometrics' || dayDrillModal.drill.type === 'long_jump' || dayDrillModal.drill.type === 'triple_jump') ? 'contacts' : 'reps'
                          },
                        })
                      }
                      placeholder="Value"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {dayDrillModal.drill.type !== 'speed' && (
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
                      Rest
                    </label>
                    <input
                      type="text"
                      value={dayDrillModal.drill.rest || ''}
                      onChange={(e) =>
                        setDayDrillModal({
                          ...dayDrillModal,
                          drill: { ...dayDrillModal.drill, rest: e.target.value },
                        })
                      }
                      placeholder="e.g. 3m"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              {dayDrillModal.drill.type === 'speed' && (
                <div className="flex gap-2 sm:gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
                      Rest (Reps)
                    </label>
                    <input
                      type="text"
                      value={dayDrillModal.drill.rest?.includes('/') ? dayDrillModal.drill.rest.split('/')[0].trim() : ''}
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        const setRest = dayDrillModal.drill.rest?.includes('/') 
                          ? dayDrillModal.drill.rest.split('/')[1].trim() 
                          : dayDrillModal.drill.rest || '';
                        setDayDrillModal({
                          ...dayDrillModal,
                          drill: {
                            ...dayDrillModal.drill,
                            rest: val ? `${val} / ${setRest}` : setRest
                          }
                        });
                      }}
                      placeholder="e.g. 90s"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
                      Rest (Sets)
                    </label>
                    <input
                      type="text"
                      value={dayDrillModal.drill.rest?.includes('/') ? dayDrillModal.drill.rest.split('/')[1].trim() : dayDrillModal.drill.rest || ''}
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        const repRest = dayDrillModal.drill.rest?.includes('/') 
                          ? dayDrillModal.drill.rest.split('/')[0].trim() 
                          : '';
                        setDayDrillModal({
                          ...dayDrillModal,
                          drill: {
                            ...dayDrillModal.drill,
                            rest: repRest ? `${repRest} / ${val}` : val
                          }
                        });
                      }}
                      placeholder="e.g. 5m"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* VBT (Velocity Based Training) Section for Power & Strength */}
              {(getBaseCategory(dayDrillModal.drill.type) === 'power' || getBaseCategory(dayDrillModal.drill.type) === 'strength') && (
                <div className="border border-violet-200 dark:border-violet-800/60 bg-violet-50/50 dark:bg-violet-950/20 rounded-2xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-violet-700 dark:text-violet-300 flex items-center gap-1.5">
                      ⚡ VBT Bar Velocity Target (OVR Velocity)
                    </span>
                    <span className="text-[10px] text-violet-500 font-bold">Force-Velocity Curve</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Target Mean (m/s)</label>
                      <input
                        type="text"
                        value={dayDrillModal.drill.targetVelocity || ''}
                        onChange={(e) => setDayDrillModal({
                          ...dayDrillModal,
                          drill: { ...dayDrillModal.drill, targetVelocity: e.target.value }
                        })}
                        placeholder="e.g. 0.85"
                        className="w-full px-3 py-2 rounded-xl border border-violet-200 dark:border-violet-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-bold text-xs outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Peak Velocity (m/s)</label>
                      <input
                        type="text"
                        value={dayDrillModal.drill.peakVelocity || ''}
                        onChange={(e) => setDayDrillModal({
                          ...dayDrillModal,
                          drill: { ...dayDrillModal.drill, peakVelocity: e.target.value }
                        })}
                        placeholder="e.g. 1.45"
                        className="w-full px-3 py-2 rounded-xl border border-violet-200 dark:border-violet-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-bold text-xs outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Velocity Loss Cutoff</label>
                      <select
                        value={dayDrillModal.drill.velocityLoss || '10%'}
                        onChange={(e) => setDayDrillModal({
                          ...dayDrillModal,
                          drill: { ...dayDrillModal.drill, velocityLoss: e.target.value }
                        })}
                        className="w-full px-2.5 py-2 rounded-xl border border-violet-200 dark:border-violet-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-bold text-xs outline-none focus:ring-2 focus:ring-violet-500"
                      >
                        <option value="10%">10% (Sprints/Power)</option>
                        <option value="15%">15% (Strength-Speed)</option>
                        <option value="20%">20% (Hypertrophy/Base)</option>
                        <option value="5%">5% (Neural Peaking)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
                  Exercise Name
                </label>
                <input
                  type="text"
                  value={dayDrillModal.drill.title}
                  onChange={(e) =>
                    setDayDrillModal({
                      ...dayDrillModal,
                      drill: { ...dayDrillModal.drill, title: e.target.value },
                    })
                  }
                  placeholder="Exercise Name..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
                  Coaching Notes (Technical Cues)
                </label>
                <textarea
                  value={dayDrillModal.drill.details}
                  onChange={(e) =>
                    setDayDrillModal({
                      ...dayDrillModal,
                      drill: {
                        ...dayDrillModal.drill,
                        details: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g., Focus on short ground contact time..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white h-20 resize-none outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Super Set Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="superSetNext"
                  checked={!!dayDrillModal.drill.superSetNext}
                  onChange={(e) =>
                    setDayDrillModal({
                      ...dayDrillModal,
                      drill: { ...dayDrillModal.drill, superSetNext: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-600 cursor-pointer"
                />
                <label htmlFor="superSetNext" className="text-xs font-bold text-slate-600 dark:text-slate-400 select-none cursor-pointer flex items-center gap-1.5">
                  <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                    ⚡ Link with NEXT exercise (Super Set)
                  </span>
                  <span className="text-[10px] text-blue-500 font-medium font-arabic text-left">(سوبر سيت - ربط بالتمرين التالي)</span>
                </label>
              </div>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
              {!dayDrillModal.isNew ? (
                <button
                  onClick={() => {
                    handleDeleteExercise(
                      dayDrillModal.day,
                      dayDrillModal.drill.id
                    );
                    setDayDrillModal({
                      isOpen: false,
                      day: null,
                      drill: null,
                      isNew: false,
                    });
                  }}
                  className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl font-bold text-sm flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              ) : (
                <div></div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setDayDrillModal({
                      isOpen: false,
                      day: null,
                      drill: null,
                      isNew: false,
                    })
                  }
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDayDrillModal}
                  className={`px-6 py-2 ${
                    dayDrillModal.isNew
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white rounded-xl shadow-md font-bold text-sm flex items-center gap-2`}
                >
                  <Save className="w-4 h-4" />{' '}
                  {dayDrillModal.isNew ? 'Add' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETION CONFIRMATION MODAL */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4 print:hidden animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="p-5 flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500 animate-bounce" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  {deleteConfirmation.type === 'week' 
                    ? 'Clear Entire Week / مسح الأسبوع بالكامل' 
                    : `Clear ${deleteConfirmation.targetDay} / مسح تمارين اليوم`
                  }
                </h3>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-450 mt-2 leading-relaxed">
                  {deleteConfirmation.type === 'week'
                    ? 'Are you sure you want to delete all exercises and reset this week\'s plan? This action cannot be undone.'
                    : 'Are you sure you want to clear all workouts for this day?'
                  }
                </p>
                <p className="text-[10px] text-red-500 font-semibold font-arabic leading-relaxed mt-1">
                  {deleteConfirmation.type === 'week'
                    ? '(هل أنت متأكد من رغبتك في حذف جميع تمارين هذا الأسبوع؟ لا يمكن التراجع عن هذا الإجراء)'
                    : '(هل أنت متأكد من رغبتك في مسح جميع تمارين هذا اليوم؟)'
                  }
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
              <button
                onClick={() => setDeleteConfirmation({ isOpen: false, type: null, targetDay: null })}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 font-bold text-xs"
              >
                Cancel / إلغاء
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/10 flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Trash className="w-3.5 h-3.5" /> Clear / تأكيد المسح
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF & PRINTING STUDIOS MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 print:hidden animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="flex justify-between items-center p-5 md:p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-500 animate-pulse" /> Printing & PDF Lab / استوديو الطباعة والـ PDF
              </h3>
              <button
                onClick={() => setShowPrintModal(false)}
                className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* 1. Orientation Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  1. Layout Orientation / اتجاه الصفحة
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPrintOrientation('landscape')}
                    className={`p-4 rounded-2xl border text-left flex flex-col gap-2 transition-all ${
                      printOrientation === 'landscape'
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Layout className="w-5 h-5" />
                      {printOrientation === 'landscape' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold">Landscape (1 Page)</p>
                      <p className="text-[10px] opacity-75 mt-0.5 font-arabic font-medium">بالعرض - ورقة واحدة كامل الأسبوع</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setPrintOrientation('portrait')}
                    className={`p-4 rounded-2xl border text-left flex flex-col gap-2 transition-all ${
                      printOrientation === 'portrait'
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <FileText className="w-5 h-5" />
                      {printOrientation === 'portrait' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold">Portrait (Vertical)</p>
                      <p className="text-[10px] opacity-75 mt-0.5 font-arabic font-medium">بالطول - قائمة عمودية</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* 2. Theme Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  2. Visual Print Theme / المظهر الفني للطباعة
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Crimson Theme */}
                  <button
                    onClick={() => setPrintTheme('classic-crimson')}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      printTheme === 'classic-crimson'
                        ? 'border-red-500 bg-red-50/30 dark:bg-red-950/10 text-red-700 dark:text-red-400 ring-2 ring-red-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded bg-red-600" />
                      <div>
                        <p className="text-xs font-black">Classic Crimson</p>
                        <p className="text-[9px] opacity-75 font-arabic">الأحمر الكلاسيكي للمدرب</p>
                      </div>
                    </div>
                    {printTheme === 'classic-crimson' && <div className="w-2 h-2 rounded-full bg-red-600" />}
                  </button>

                  {/* Navy Theme */}
                  <button
                    onClick={() => setPrintTheme('pro-navy')}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      printTheme === 'pro-navy'
                        ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/10 text-blue-700 dark:text-blue-400 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded bg-blue-800" />
                      <div>
                        <p className="text-xs font-black">Professional Navy</p>
                        <p className="text-[9px] opacity-75 font-arabic">الكحلي الاحترافي</p>
                      </div>
                    </div>
                    {printTheme === 'pro-navy' && <div className="w-2 h-2 rounded-full bg-blue-700" />}
                  </button>

                  {/* Green Theme */}
                  <button
                    onClick={() => setPrintTheme('athletic-green')}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      printTheme === 'athletic-green'
                        ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded bg-emerald-650" />
                      <div>
                        <p className="text-xs font-black">Athletic Green</p>
                        <p className="text-[9px] opacity-75 font-arabic">الأخضر الرياضي الحركي</p>
                      </div>
                    </div>
                    {printTheme === 'athletic-green' && <div className="w-2 h-2 rounded-full bg-emerald-600" />}
                  </button>

                  {/* Ink Saver Theme */}
                  <button
                    onClick={() => setPrintTheme('minimal-ink')}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      printTheme === 'minimal-ink'
                        ? 'border-slate-900 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white ring-2 ring-slate-900/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded bg-white border border-slate-900" />
                      <div>
                        <p className="text-xs font-black">Minimal Ink Saver</p>
                        <p className="text-[9px] opacity-75 font-arabic">موفّر الحبر (أبيض وأسود)</p>
                      </div>
                    </div>
                    {printTheme === 'minimal-ink' && <div className="w-2 h-2 rounded-full bg-slate-900 dark:bg-white" />}
                  </button>

                  {/* Dark Mode Theme */}
                  <button
                    onClick={() => setPrintTheme('dark-neon')}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all sm:col-span-2 ${
                      printTheme === 'dark-neon'
                        ? 'border-sky-500 bg-slate-950 text-sky-400 ring-2 ring-sky-500/20 border-slate-850'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded bg-slate-900 border border-slate-800 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded bg-sky-400" />
                      </div>
                      <div>
                        <p className="text-xs font-black">Elite Dark (Digital PDF)</p>
                        <p className="text-[9px] opacity-75 font-arabic">الداكن الرياضي الاحترافي (مثالي للملفات الرقمية)</p>
                      </div>
                    </div>
                    {printTheme === 'dark-neon' && <div className="w-2 h-2 rounded-full bg-sky-400" />}
                  </button>
                </div>
              </div>

              {/* 3. Mobile Card Export */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  3. Select Day for Mobile Image / اختر يوم التصدير للجوال
                </label>
                <select
                  value={activeMobileDay}
                  onChange={(e) => setActiveMobileDay(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-850 dark:text-slate-200 font-bold text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={`export-day-opt-${day}`} value={day}>{day}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 font-medium leading-normal">
                  Creates a vertically cropped high-contrast 9:16 ratio PNG card designed for easy sharing via WhatsApp.
                </p>
              </div>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 flex-wrap">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 font-bold text-sm mr-auto"
              >
                Cancel / إلغاء
              </button>
              <button
                onClick={handleExportMobileImage}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg flex items-center gap-2 transition-all active:scale-95"
              >
                <Smartphone className="w-4 h-4" /> Export Mobile / تصدير كصورة
              </button>
              <button
                onClick={triggerActualPrint}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-sm shadow-lg flex items-center gap-2 transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" /> Print Plan / طباعة البرنامج
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIBRARY EXERCISE MODAL (CREATE / EDIT LIBRARY DRILLS) */}
      {addExerciseModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                {addExerciseModal.id ? (
                  <Edit2 className="w-5 h-5 text-orange-500" />
                ) : (
                  <Plus className="w-5 h-5 text-orange-500" />
                )}
                {addExerciseModal.id ? 'Edit Library Exercise' : 'Create New Library Exercise'}
              </h3>
              <button
                onClick={() =>
                  setAddExerciseModal({
                    isOpen: false,
                    id: null,
                    title: '',
                    details: '',
                    type: 'speed',
                    percentage: '',
                    sets: '',
                    reps: '',
                    distance: '',
                    rest: '',
                    unit: 'meters',
                  })
                }
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Title</label>
                <input
                  type="text"
                  value={addExerciseModal.title}
                  onChange={(e) => setAddExerciseModal({ ...addExerciseModal, title: e.target.value })}
                  placeholder="e.g. 10m Acceleration Sprints"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-medium outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Description</label>
                <textarea
                  value={addExerciseModal.details}
                  onChange={(e) => setAddExerciseModal({ ...addExerciseModal, details: e.target.value })}
                  placeholder="Additional execution details..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-medium outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm h-20 resize-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Category</label>
                <select
                  value={getBaseCategory(addExerciseModal.type)}
                  onChange={(e) => {
                    const newBaseType = e.target.value;
                    let newType = newBaseType;
                    if (newBaseType === 'endurance') newType = 'endurance_400';
                    else if (newBaseType === 'core') newType = 'core_rotation';
                    else if (newBaseType === 'strength') newType = 'strength_single_leg';

                    let defaultUnit = addExerciseModal.unit;
                    if (newBaseType === 'speed' || newBaseType === 'endurance') defaultUnit = 'meters';
                    else if (newBaseType === 'plyometrics' || newBaseType === 'long_jump' || newBaseType === 'triple_jump') defaultUnit = 'contacts';
                    else if (newBaseType === 'isometric' || newBaseType === 'mobility') defaultUnit = 'sec';
                    else defaultUnit = 'reps';
                    setAddExerciseModal({ 
                      ...addExerciseModal, 
                      type: newType,
                      unit: defaultUnit
                    });
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-medium outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                >
                  {Object.entries(EXERCISE_CATEGORIES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>

                {SUBCATEGORIES[getBaseCategory(addExerciseModal.type)] && (
                  <div className="mt-3 animate-[fadeIn_0.15s_ease-out]">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
                      Subcategory
                    </label>
                    <select
                      value={addExerciseModal.type}
                      onChange={(e) =>
                        setAddExerciseModal({
                          ...addExerciseModal,
                          type: e.target.value
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-medium outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                    >
                      {Object.entries(SUBCATEGORIES[getBaseCategory(addExerciseModal.type)])
                        .filter(([k]) => k !== 'all')
                        .map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Grid for Parameters */}
              <div className="grid grid-cols-2 gap-3">
                {/* Sets */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Sets</label>
                  <input
                    type="text"
                    value={addExerciseModal.sets}
                    onChange={(e) => setAddExerciseModal({ ...addExerciseModal, sets: e.target.value })}
                    placeholder="e.g. 4"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-medium outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                  />
                </div>

                {/* Reps */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
                    {addExerciseModal.type === 'plyometrics' || addExerciseModal.type === 'long_jump' || addExerciseModal.type === 'triple_jump' ? 'Contacts / Jumps' : 'Reps'}
                  </label>
                  <input
                    type="text"
                    value={addExerciseModal.reps}
                    onChange={(e) => setAddExerciseModal({ ...addExerciseModal, reps: e.target.value })}
                    placeholder="e.g. 10"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-medium outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                  />
                </div>

                {/* Distance (Only visible if speed or relevant) */}
                {addExerciseModal.type === 'speed' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Distance (m)</label>
                    <input
                      type="text"
                      value={addExerciseModal.distance}
                      onChange={(e) => setAddExerciseModal({ ...addExerciseModal, distance: e.target.value })}
                      placeholder="e.g. 30"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-medium outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                    />
                  </div>
                )}

                {/* Intensity */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold text-slate-500 uppercase">Intensity</label>
                      {addExerciseModal.type !== 'speed' && (addExerciseModal.intensityUnit === 'x BW' || addExerciseModal.unit === 'x BW') && selectedAthlete && selectedAthlete.weight && (
                        (() => {
                          const bwVal = parseFloat(addExerciseModal.percentage) || 0;
                          const targetKg = bwVal * parseFloat(selectedAthlete.weight);
                          if (targetKg > 0) {
                            const titleLower = (addExerciseModal.title || '').toLowerCase();
                            let liftMax = 0;
                            if (titleLower.includes('bench')) {
                              liftMax = parseFloat(selectedAthlete.bench) || 0;
                            } else if (titleLower.includes('clean')) {
                              liftMax = parseFloat(selectedAthlete.clean) || 0;
                            } else if (titleLower.includes('deadlift')) {
                              liftMax = parseFloat(selectedAthlete.deadlift) || 0;
                            } else if (titleLower.includes('squat')) {
                              if (titleLower.includes('half')) {
                                liftMax = parseFloat(selectedAthlete.halfSquat) || 0;
                              } else if (titleLower.includes('quarter')) {
                                liftMax = parseFloat(selectedAthlete.quarterSquat) || 0;
                              } else {
                                liftMax = parseFloat(selectedAthlete.fullSquat) || 0;
                              }
                            }
                            if (liftMax > 0) {
                              const pct = Math.round((targetKg / liftMax) * 100);
                              return <span className="text-[10px] font-black text-rose-500 lowercase font-sans">{targetKg.toFixed(1)}kg ({pct}% 1RM)</span>;
                            }
                            return <span className="text-[10px] font-black text-rose-500 lowercase font-sans">{targetKg.toFixed(1)}kg</span>;
                          }
                          return null;
                        })()
                      )}
                    </div>
                    <div className="flex items-center rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-orange-500 overflow-hidden w-full h-[42px] transition-all">
                      <div className="pl-3 pr-1 text-slate-400 dark:text-slate-500 flex items-center shrink-0 select-none">
                        {addExerciseModal.intensityUnit === 'x BW' || addExerciseModal.unit === 'x BW' ? (
                          <span className="text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-500">xBW</span>
                        ) : (
                          <Percent className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <input
                        type="text"
                        value={addExerciseModal.percentage || ''}
                        onChange={(e) => setAddExerciseModal({ ...addExerciseModal, percentage: e.target.value })}
                        placeholder="e.g. 95"
                        className="flex-grow w-full text-sm py-2 px-1.5 bg-transparent border-none outline-none text-slate-800 dark:text-white font-medium focus:ring-0 focus:ring-offset-0"
                      />
                    </div>
                  </div>
                  {addExerciseModal.type !== 'speed' && (
                    <div className="w-20">
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Unit</label>
                      <select
                        value={addExerciseModal.intensityUnit || (addExerciseModal.unit === 'x BW' ? 'x BW' : '%')}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAddExerciseModal({
                            ...addExerciseModal,
                            intensityUnit: val,
                            unit: val === 'x BW' ? 'x BW' : 'reps'
                          });
                        }}
                        className="w-full text-sm py-2.5 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                      >
                        <option value="%">%</option>
                        <option value="x BW">x BW</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Rest */}
                {addExerciseModal.type === 'speed' ? (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Rest (Reps)</label>
                      <input
                        type="text"
                        value={addExerciseModal.rest?.includes('/') ? addExerciseModal.rest.split('/')[0].trim() : ''}
                        onChange={(e) => {
                          const val = e.target.value.trim();
                          const setRest = addExerciseModal.rest?.includes('/') 
                            ? addExerciseModal.rest.split('/')[1].trim() 
                            : addExerciseModal.rest || '';
                          setAddExerciseModal({
                            ...addExerciseModal,
                            rest: val ? `${val} / ${setRest}` : setRest
                          });
                        }}
                        placeholder="e.g. 90s"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-medium outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Rest (Sets)</label>
                      <input
                        type="text"
                        value={addExerciseModal.rest?.includes('/') ? addExerciseModal.rest.split('/')[1].trim() : addExerciseModal.rest || ''}
                        onChange={(e) => {
                          const val = e.target.value.trim();
                          const repRest = addExerciseModal.rest?.includes('/') 
                            ? addExerciseModal.rest.split('/')[0].trim() 
                            : '';
                          setAddExerciseModal({
                            ...addExerciseModal,
                            rest: repRest ? `${repRest} / ${val}` : val
                          });
                        }}
                        placeholder="e.g. 5m"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-medium outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Rest Interval</label>
                    <input
                      type="text"
                      value={addExerciseModal.rest}
                      onChange={(e) => setAddExerciseModal({ ...addExerciseModal, rest: e.target.value })}
                      placeholder="e.g. 2 min"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-medium outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                    />
                  </div>
                )}

                {/* Unit */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Unit</label>
                  <select
                    value={addExerciseModal.unit}
                    onChange={(e) => setAddExerciseModal({ ...addExerciseModal, unit: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-medium outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                  >
                    <option value="meters">meters</option>
                    <option value="reps">reps</option>
                    <option value="sec">sec</option>
                    <option value="contacts">contacts</option>
                  </select>
                </div>
              </div>

              {/* VBT (Velocity Based Training) Section for Power & Strength */}
              {(getBaseCategory(addExerciseModal.type) === 'power' || getBaseCategory(addExerciseModal.type) === 'strength') && (
                <div className="border border-violet-200 dark:border-violet-800/60 bg-violet-50/50 dark:bg-violet-950/20 rounded-2xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-violet-700 dark:text-violet-300 flex items-center gap-1.5">
                      ⚡ VBT Bar Velocity Target (OVR Velocity)
                    </span>
                    <span className="text-[10px] text-violet-500 font-bold">Force-Velocity Curve</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Target Mean (m/s)</label>
                      <input
                        type="text"
                        value={addExerciseModal.targetVelocity || ''}
                        onChange={(e) => setAddExerciseModal({
                          ...addExerciseModal,
                          targetVelocity: e.target.value
                        })}
                        placeholder="e.g. 0.85"
                        className="w-full px-3 py-2 rounded-xl border border-violet-200 dark:border-violet-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-bold text-xs outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Peak Velocity (m/s)</label>
                      <input
                        type="text"
                        value={addExerciseModal.peakVelocity || ''}
                        onChange={(e) => setAddExerciseModal({
                          ...addExerciseModal,
                          peakVelocity: e.target.value
                        })}
                        placeholder="e.g. 1.45"
                        className="w-full px-3 py-2 rounded-xl border border-violet-200 dark:border-violet-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-bold text-xs outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Velocity Loss Cutoff</label>
                      <select
                        value={addExerciseModal.velocityLoss || '10%'}
                        onChange={(e) => setAddExerciseModal({
                          ...addExerciseModal,
                          velocityLoss: e.target.value
                        })}
                        className="w-full px-2.5 py-2 rounded-xl border border-violet-200 dark:border-violet-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-bold text-xs outline-none focus:ring-2 focus:ring-violet-500"
                      >
                        <option value="10%">10% (Sprints/Power)</option>
                        <option value="15%">15% (Strength-Speed)</option>
                        <option value="20%">20% (Hypertrophy/Base)</option>
                        <option value="5%">5% (Neural Peaking)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end items-center gap-3 p-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/20">
              <button
                onClick={() =>
                  setAddExerciseModal({
                    isOpen: false,
                    id: null,
                    title: '',
                    details: '',
                    type: 'speed',
                    percentage: '',
                    sets: '',
                    reps: '',
                    distance: '',
                    rest: '',
                    unit: 'meters',
                  })
                }
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 font-bold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLibraryExercise}
                disabled={!addExerciseModal.title.trim()}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl shadow-md font-bold text-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" />{' '}
                {addExerciseModal.id ? 'Save Changes' : 'Create Drill'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Main UI Structure Wrapper */}
      <div
        className={`flex flex-col md:flex-row transition-all duration-300 w-full h-[calc(100vh-64px)] overflow-hidden relative print:h-auto print:overflow-visible ${
          isMobileView ? 'max-w-[420px] mx-auto border-x shadow-2xl' : ''
        }`}
      >
        <Sidebar
          isPreviewMode={isPreviewMode}
          setIsPreviewMode={setIsPreviewMode}
          onCopyWeek={handleCopyWeek}
          onPasteWeek={handlePasteWeek}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onShowStats={() => setShowStatsModal(true)}
          onClearWeek={() =>
            setDeleteConfirmation({ isOpen: true, type: 'week' })
          }
          onPrintLandscape={handlePrintLandscape}
          onPrintPortrait={handlePrintPortrait}
        />

        <div
          className="flex-1 overflow-x-auto overflow-y-auto bg-[#F4F5F7] dark:bg-slate-950 print:bg-white print:overflow-visible w-full pb-24 md:pb-0 relative transition-all duration-300"
        >
          {/* MOBILE WEEK NAVIGATION SUB-HEADER */}
          {isMobileView && (
            <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 print:hidden select-none">
              <button
                onClick={handlePrevWeek}
                className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/50 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-900/50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setShowMonthCalendar(true)}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200/50 dark:border-slate-700/50 transition-all text-xs font-black shadow-sm"
              >
                <CalendarIcon className="w-3.5 h-3.5 text-orange-500" />
                <span>{formatDateRange()}</span>
              </button>

              <button
                onClick={handleNextWeek}
                className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/50 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-900/50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* HORIZONTALLY SCROLLABLE MOBILE DAY CAROUSEL - ULTRA PREMIUM NATIVE STYLE */}
          {isMobileView && (
            <div className="sticky top-[0px] z-40 flex gap-3 overflow-x-auto px-4 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/60 print:hidden select-none scrollbar-none shadow-sm shadow-slate-100/10 dark:shadow-none transition-all duration-300">
              {DAYS_OF_WEEK.map((day, idx) => {
                const drills = schedule[day] || [];
                const stats = calculateDayVolume(drills);
                const load = stats.totalVolumeScore;

                const isActive = activeMobileDay === day;
                let pillStyle = '';

                if (isActive) {
                  pillStyle = 'border-orange-500 bg-gradient-to-br from-orange-500 to-amber-500 text-white font-bold shadow-[0_8px_20px_-6px_rgba(249,115,22,0.45)] dark:shadow-[0_8px_24px_-6px_rgba(249,115,22,0.35)] scale-105 z-10';
                } else {
                  if (load > 0) {
                    if (load < 1000) {
                      pillStyle = 'border-blue-200 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-955/15 text-blue-600 dark:text-blue-400 hover:border-blue-300';
                    } else if (load > 3000) {
                      pillStyle = 'border-red-200 dark:border-red-900/40 bg-red-50/40 dark:bg-red-955/15 text-red-600 dark:text-red-400 hover:border-red-300';
                    } else {
                      pillStyle = 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-955/15 text-emerald-600 dark:text-emerald-400 hover:border-emerald-300';
                    }
                  } else {
                    pillStyle = 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700';
                  }
                }

                return (
                  <button
                    key={`mob-pill-${day}`}
                    onClick={() => setActiveMobileDay(day)}
                    className={`flex flex-col items-center min-w-[72px] p-2.5 rounded-2xl border transition-all duration-300 relative hover:scale-[1.02] ${pillStyle}`}
                  >
                    <span className={`text-[9px] uppercase font-black tracking-widest ${isActive ? 'text-white/90' : 'text-slate-450 dark:text-slate-500'}`}>
                      {day.slice(0, 3)}
                    </span>
                    <span className={`text-base font-black mt-0.5 leading-none ${isActive ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                      {weekDates[idx]}
                    </span>
                    {load > 0 ? (
                      <span className={`text-[8px] font-black uppercase mt-2 px-1.5 py-0.5 rounded-lg border ${
                        isActive
                          ? 'bg-white/20 border-white/30 text-white'
                          : load < 1000
                            ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
                            : load > 3000
                              ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {load} AU
                      </span>
                    ) : (
                      <span className={`text-[8px] font-black uppercase mt-2 px-1.5 py-0.5 rounded-lg border ${
                        isActive
                          ? 'bg-white/10 border-white/20 text-white/80'
                          : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200/50 dark:border-slate-700/50 text-slate-450 dark:text-slate-500'
                      }`}>
                        REST
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-1 w-6 h-0.5 bg-white rounded-full shadow-[0_1px_4px_rgba(255,255,255,0.5)]"></span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Print-Only Header Sheet Branding */}
          <div className="hidden print:block w-full mb-6 p-4 rounded-2xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 print-header-bar">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase print-athlete-name">
                  {selectedAthlete ? `${selectedAthlete.name}` : 'McCarthy, Dillan'}
                </h1>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-450 mt-1 uppercase print-program-sub">
                  Weekly Training Microcycle Plan • {currentWeekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-widest bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-md print-branding-tag">
                  Track Lab
                </span>
                <p className="text-[9px] font-bold text-slate-400 mt-1">
                  Target Load: {weeklyStats.load} AU • {weeklyStats.loadLabel}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`flex h-full p-2 md:p-4 gap-3.5 print-stacked-layout print:grid print:grid-cols-2 print:gap-x-12 print:gap-y-6 print:p-4 ${
              isMobileView ? 'flex-col w-full' : 'flex-row w-full min-w-0'
            }`}
          >
            {DAYS_OF_WEEK.map((day, index) => {
              const fullDateStr = weekDatesFull[index].toLocaleDateString(
                'en-GB',
                { day: 'numeric', month: 'short', year: 'numeric' }
              );
              const dayDrills = schedule[day] || [];
              const { stats: dayStats, dayTotalCombined, dayCnsPct } = dayStatsMap[day];

              const isDayVisibleOnMobile = activeMobileDay === day;
              const displayClass = isMobileView
                ? (isDayVisibleOnMobile ? 'flex flex-col w-full px-2 pb-8' : 'hidden print:flex print:flex-col')
                : 'flex flex-col flex-1 min-w-0 transition-all duration-300';

              return (
                <div
                  key={day}
                  className={`${displayClass} print:break-inside-avoid print:mb-0`}
                >
                  <div className="mb-4 flex flex-col group border-b border-slate-200 dark:border-slate-700 pb-3 px-1 md:px-2">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] md:text-xs font-black tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                          {day}
                        </span>
                        {/* Quick Day Copy/Paste Buttons */}
                        {!isPreviewMode && (
                          <div className="flex items-center gap-1.5 print:hidden">
                            <button
                              onClick={() => handleCopyDay(day)}
                              className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 rounded transition-colors"
                              title="Copy Day Exercises"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handlePasteIntoDay(day)}
                              disabled={!clipboard}
                              className={`p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors ${
                                clipboard ? 'text-slate-500 dark:text-slate-400 hover:text-orange-500' : 'text-slate-200 dark:text-slate-700 cursor-not-allowed opacity-40'
                              }`}
                              title="Paste Clipboard (Exercise or Day)"
                            >
                              <ClipboardPaste className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setSaveTemplateModal({ isOpen: true, day: day, name: '' })}
                              disabled={dayDrills.length === 0}
                              className={`p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors ${
                                dayDrills.length > 0
                                  ? 'text-slate-500 dark:text-slate-400 hover:text-orange-500'
                                  : 'text-slate-200 dark:text-slate-700 cursor-not-allowed opacity-40'
                              }`}
                              title="Save Day as Template"
                            >
                              <BookmarkPlus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirmation({
                                  isOpen: true,
                                  type: 'day',
                                  targetDay: day,
                                })
                              }
                              className="p-1 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all duration-200 active:scale-90 border border-transparent hover:border-red-200/50 dark:hover:border-red-900/30"
                              title="Delete Entire Day"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] md:text-[10px] font-semibold text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        {fullDateStr}
                      </span>
                    </div>
                    <div className="flex items-start gap-1 md:gap-2 justify-between">
                      <div className="flex items-start gap-1 md:gap-2 flex-1">
                        <div className="w-6 h-6 md:w-8 md:h-8 shrink-0 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs md:text-sm font-black text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 shadow-sm">
                          {weekDates[index]}
                        </div>
                        <input
                          type="text"
                          value={dayTitles[day] || ''}
                          onChange={(e) =>
                            handleDayTitleChange(day, e.target.value)
                          }
                          placeholder="Workout Focus"
                          className="text-xs md:text-[14px] font-bold text-slate-900 dark:text-slate-50 bg-transparent border-none outline-none w-full placeholder-slate-400 dark:placeholder-slate-500"
                          readOnly={isPreviewMode}
                        />
                      </div>
                    </div>
                  </div>

                  <div
                    className={`flex-1 px-1 md:px-2 pb-20 ${
                      draggedItem &&
                      draggedItem.source !== 'library' &&
                      draggedItem.day !== day
                        ? 'bg-slate-100/50 dark:bg-slate-800/30 border-dashed border border-slate-200 dark:border-slate-700 rounded-xl'
                        : ''
                    }`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, day)}
                  >
                    {dayDrills.map((drill, drillIndex) => (
                      <TimelineCard
                        key={drill.id}
                        drill={drill}
                        day={day}
                        index={drillIndex}
                        isLast={drillIndex === dayDrills.length - 1}
                        isPreviewMode={isPreviewMode}
                        athlete={selectedAthlete}
                        onEdit={handleEditExerciseBtn}
                        onDelete={handleDeleteExercise}
                        onCopy={handleCopyExercise}
                        onMoveUp={() => moveDrillUp(day, drillIndex)}
                        onMoveDown={() => moveDrillDown(day, drillIndex)}
                        onDragStart={handleDragStartWrapper}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                      />
                    ))}

                    {!isPreviewMode && (
                      <div
                        className="flex items-center gap-2 mt-2 group cursor-pointer"
                        onClick={() => handleAddExerciseBtn(day)}
                      >
                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:bg-green-200">
                          <Plus className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-[11px] md:text-[13px] font-medium text-slate-500 group-hover:text-green-600">
                          Add Exercise
                        </span>
                      </div>
                    )}

                    {/* Enhanced T&F Daily Card Summary */}
                    {schedule[day].length > 0 && !isPreviewMode && (
                      <div className="mt-4 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2 print:hidden">
                        <div className="flex justify-between items-center text-[10px] sm:text-xs font-bold">
                          <div
                            className="flex flex-col items-center text-slate-400"
                            title="Total Exercises"
                          >
                            <span className="text-[8px] uppercase">Drills</span>
                            <span className="text-slate-700 dark:text-slate-300">
                              {dayStats.totalExercises}
                            </span>
                          </div>
                          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700"></div>
                          <div
                            className="flex flex-col items-center text-orange-500"
                            title="Overall System Load"
                          >
                            <span className="text-orange-400 text-[8px] uppercase">
                              Load
                            </span>
                            <span>{dayStats.totalVolumeScore}</span>
                          </div>

                          {(dayStats.totalMeters > 0 ||
                            dayStats.totalContacts > 0) && (
                            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700"></div>
                          )}

                          {dayStats.totalMeters > 0 && (
                            <div
                              className="flex flex-col items-center text-indigo-500"
                              title="Total Sprints Distance"
                            >
                              <span className="text-indigo-400 text-[8px] uppercase">
                                Meters
                              </span>
                              <span>{dayStats.totalMeters}m</span>
                            </div>
                          )}
                          {dayStats.totalContacts > 0 && (
                            <div
                              className="flex flex-col items-center text-amber-500"
                              title="Total Foot Contacts"
                            >
                              <span className="text-amber-400 text-[8px] uppercase">
                                Contacts
                              </span>
                              <span>{dayStats.totalContacts}</span>
                            </div>
                          )}
                        </div>

                        {dayTotalCombined > 0 && (
                          <div className="space-y-0.5">
                            <div className="w-full h-1 bg-slate-100 dark:bg-slate-700 rounded-full flex overflow-hidden">
                              <div
                                className="h-full bg-red-500"
                                style={{ width: `${dayCnsPct}%` }}
                                title={`CNS Power: ${dayCnsPct}%`}
                              />
                              <div
                                className="h-full bg-blue-500"
                                style={{ width: `${100 - dayCnsPct}%` }}
                                title={`Structural: ${100 - dayCnsPct}%`}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Integrated Exercise Library Drawer */}
        {showLibrary && (
          <ExerciseLibrary
            library={library}
            onDragStart={handleLibraryDragStart}
            onDeleteDrill={handleDeleteLibraryDrill}
            onEditDrill={handleEditLibraryDrill}
            onDeleteTemplate={handleDeleteLibraryTemplate}
            onApplyTemplate={handleApplyTemplate}
            onApplyProgram={handleApplyProgramBlock}
            onDeleteProgram={handleDeleteProgramBlock}
            programs={programs}
            onClose={() => setShowLibrary(false)}
            onAddDrill={() => setAddExerciseModal({
              isOpen: true,
              id: null,
              title: '',
              details: '',
              type: 'speed',
              percentage: '',
              sets: '',
              reps: '',
              distance: '',
              rest: '',
              unit: 'meters'
            })}
            onLibraryDrop={handleLibraryDropzone}
          />
        )}

        {/* NATIVE MOBILE BOTTOM TAB BAR */}
        {isMobileView && (
          <div className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-slate-950/95 border-t border-slate-200/60 dark:border-slate-800/80 backdrop-blur-md flex items-center justify-around px-4 z-[110] shadow-[0_-4px_16px_rgba(0,0,0,0.04)] print:hidden">
            {/* Planner Tab */}
            <button
              onClick={() => {
                setShowLibrary(false);
                setShowMobileTools(false);
                setIsAthleteDropdownOpen(false);
              }}
              className={`flex flex-col items-center gap-1 transition-all ${
                !showLibrary && !showMobileTools && !isAthleteDropdownOpen
                  ? 'text-orange-500 font-extrabold scale-105'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350'
              }`}
            >
              <CalendarIcon className="w-5 h-5" />
              <span className="text-[9px] uppercase tracking-wider font-black">Planner</span>
            </button>

            {/* Roster Tab */}
            <button
              onClick={() => {
                setIsAthleteDropdownOpen(!isAthleteDropdownOpen);
                setShowLibrary(false);
                setShowMobileTools(false);
              }}
              className={`flex flex-col items-center gap-1 transition-all ${
                isAthleteDropdownOpen
                  ? 'text-orange-500 font-extrabold scale-105'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[9px] uppercase tracking-wider font-black">Roster</span>
            </button>

            {/* Library Tab */}
            <button
              onClick={() => {
                setShowLibrary(!showLibrary);
                setShowMobileTools(false);
                setIsAthleteDropdownOpen(false);
              }}
              className={`flex flex-col items-center gap-1 transition-all ${
                showLibrary
                  ? 'text-orange-500 font-extrabold scale-105'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350'
              }`}
            >
              <Library className="w-5 h-5" />
              <span className="text-[9px] uppercase tracking-wider font-black">Library</span>
            </button>

            {/* Tools Tab */}
            <button
              onClick={() => {
                setShowMobileTools(!showMobileTools);
                setShowLibrary(false);
                setIsAthleteDropdownOpen(false);
              }}
              className={`flex flex-col items-center gap-1 transition-all ${
                showMobileTools
                  ? 'text-orange-500 font-extrabold scale-105'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350'
              }`}
            >
              <Sliders className="w-5 h-5" />
              <span className="text-[9px] uppercase tracking-wider font-black">Tools</span>
            </button>
          </div>
        )}

        {/* NATIVE MOBILE TOOLS BOTTOM SHEET */}
        {showMobileTools && isMobileView && (
          <div className="fixed inset-0 z-[150] print:hidden">
            {/* Backdrop overlay */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200"
              onClick={() => setShowMobileTools(false)}
            />
            {/* Sheet content */}
            <div className="absolute bottom-0 left-0 right-0 max-w-[420px] mx-auto bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl p-5 space-y-4 animate-[slideUp_0.25s_ease-out] border-t border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-black text-slate-900 dark:text-slate-50 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-orange-500 animate-pulse" />
                  Planner Tools & Actions
                </h3>
                <button
                  onClick={() => setShowMobileTools(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Save Week as Template */}
                <button
                  onClick={() => {
                    setSaveWeekTemplateModal({ isOpen: true, name: '' });
                    setShowMobileTools(false);
                  }}
                  className="flex flex-col items-center justify-center p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 border border-slate-200/50 dark:border-slate-800 rounded-2xl gap-1.5 transition-all active:scale-95"
                >
                  <Save className="w-5 h-5 text-indigo-500" />
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">Save Week Template</span>
                </button>

                {/* Open Workload Stats */}
                <button
                  onClick={() => {
                    setShowStatsModal(true);
                    setShowMobileTools(false);
                  }}
                  className="flex flex-col items-center justify-center p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 border border-slate-200/50 dark:border-slate-800 rounded-2xl gap-1.5 transition-all active:scale-95"
                >
                  <BarChart3 className="w-5 h-5 text-orange-500" />
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">Load Analytics</span>
                </button>

                {/* Copy Week */}
                <button
                  onClick={() => {
                    handleCopyWeek();
                    setShowMobileTools(false);
                  }}
                  className="flex flex-col items-center justify-center p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 border border-slate-200/50 dark:border-slate-800 rounded-2xl gap-1.5 transition-all active:scale-95"
                >
                  <Copy className="w-5 h-5 text-amber-500" />
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">Copy Week</span>
                </button>

                {/* Paste Week */}
                <button
                  onClick={() => {
                    handlePasteWeek();
                    setShowMobileTools(false);
                  }}
                  className="flex flex-col items-center justify-center p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 border border-slate-200/50 dark:border-slate-800 rounded-2xl gap-1.5 transition-all active:scale-95"
                >
                  <ClipboardPaste className="w-5 h-5 text-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">Paste Week</span>
                </button>

                {/* Undo */}
                <button
                  onClick={() => {
                    handleUndo();
                  }}
                  disabled={historyIndex <= 0}
                  className={`flex flex-col items-center justify-center p-3 border rounded-2xl gap-1.5 transition-all active:scale-95 ${
                    historyIndex > 0
                      ? 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 border-slate-200/50 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                      : 'border-slate-100 dark:border-slate-800/20 opacity-40 cursor-not-allowed text-slate-400'
                  }`}
                >
                  <Undo2 className="w-5 h-5 text-sky-500" />
                  <span className="text-[10px] font-bold">Undo Action</span>
                </button>

                {/* Redo */}
                <button
                  onClick={() => {
                    handleRedo();
                  }}
                  disabled={historyIndex >= history.length - 1}
                  className={`flex flex-col items-center justify-center p-3 border rounded-2xl gap-1.5 transition-all active:scale-95 ${
                    historyIndex < history.length - 1
                      ? 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 border-slate-200/50 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                      : 'border-slate-100 dark:border-slate-800/20 opacity-40 cursor-not-allowed text-slate-400'
                  }`}
                >
                  <Redo2 className="w-5 h-5 text-sky-500" />
                  <span className="text-[10px] font-bold">Redo Action</span>
                </button>
              </div>

              {/* Clear Entire Week (Danger Area) */}
              <button
                onClick={() => {
                  setDeleteConfirmation({ isOpen: true, type: 'week' });
                  setShowMobileTools(false);
                }}
                className="w-full py-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded-2xl border border-red-200/50 dark:border-red-900/30 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
                Clear Entire Week
              </button>
            </div>
          </div>
        )}

        {/* Custom PWA Install Action Banner */}
        {deferredPrompt && (
          <div className="fixed bottom-6 right-6 z-[150] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-white rounded-3xl border border-slate-700/50 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.4)] p-4 max-w-sm flex flex-col gap-3 animate-[slideUp_0.3s_ease-out] print:hidden">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl shadow-lg shadow-orange-500/20">
                <Smartphone className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-orange-400">
                  Install Track Lab
                </h4>
                <p className="text-[10px] text-slate-300 font-medium leading-normal mt-0.5">
                  Add to your home screen for full offline support, standalone premium mode & high performance.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstallApp}
                className="flex-1 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider shadow-md shadow-orange-500/20 transition-all hover:scale-[1.01]"
              >
                Install Web App
              </button>
              <button
                onClick={() => setDeferredPrompt(null)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MOBILE EXPORT VIEWPORT CONTAINER (OFF-SCREEN 9:16 HIGH-CONTRAST LIGHT MODE FRAME) */}
      <div
        id="mobile-export-card"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '-9999px',
          width: '360px',
          height: '640px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px',
          backgroundColor: '#f8fafc',
          color: '#0f172a',
          fontFamily: 'sans-serif',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', tracking: '0.1em', color: '#f97316' }}>
              Track Lab
            </span>
            <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#64748b' }}>
              {activeMobileDay} • Day {weekDates[DAYS_OF_WEEK.indexOf(activeMobileDay)]}
            </span>
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.025em', margin: '0' }}>
            {selectedAthlete ? selectedAthlete.name : 'McCarthy, Dillan'}
          </h2>
          <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', margin: '4px 0 0 0', textTransform: 'uppercase' }}>
            Focus: {dayTitles[activeMobileDay] || 'General Preparation / إعداد عام'}
          </p>
        </div>

        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px', overflow: 'hidden' }}>
          {(schedule[activeMobileDay] || []).slice(0, 5).map((drill, idx) => {
            const isSpeed = drill.type === 'speed' || drill.unit === 'meters';
            return (
              <div
                key={`export-drill-${drill.id || idx}`}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  position: 'relative'
                }}
              >
                {drill.superSetNext && (
                  <div style={{ position: 'absolute', left: '6px', bottom: '-10px', width: '2px', height: '12px', backgroundColor: '#818cf8', zIndex: 10 }} />
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '11px', fontWeight: '900', color: '#0f172a', margin: '0', maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {drill.title}
                  </h4>
                  <span style={{ fontSize: '7px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                    {drill.type}
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                  {drill.sets && (
                    <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#334155', backgroundColor: '#e2e8f0', padding: '1px 5px', borderRadius: '4px' }}>
                      {drill.sets} Sets
                    </span>
                  )}
                  {drill.reps && !isSpeed && (
                    <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#334155', backgroundColor: '#e2e8f0', padding: '1px 5px', borderRadius: '4px' }}>
                      {drill.reps} {drill.unit || 'reps'}
                    </span>
                  )}
                  {drill.distance && isSpeed && (
                    <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#334155', backgroundColor: '#e2e8f0', padding: '1px 5px', borderRadius: '4px' }}>
                      {drill.distance}m
                    </span>
                  )}
                  {drill.percentage && (
                    <span style={{ fontSize: '8px', fontWeight: 'black', color: '#ea580c', backgroundColor: '#ffedd5', padding: '1px 5px', borderRadius: '4px' }}>
                      {drill.percentage}{(drill.intensityUnit === 'x BW' || drill.unit === 'x BW') ? 'x BW' : '%'}
                    </span>
                  )}
                  {drill.rest && (
                    <span style={{ fontSize: '8px', fontWeight: 'medium', color: '#475569', border: '1px solid #cbd5e1', padding: '0px 4px', borderRadius: '4px' }}>
                      Rest: {drill.rest}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          
          {(schedule[activeMobileDay] || []).length > 5 && (
            <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#64748b', textAlign: 'center', fontStyle: 'italic' }}>
              + {(schedule[activeMobileDay] || []).length - 5} more drills not shown
            </div>
          )}

          {(schedule[activeMobileDay] || []).length === 0 && (
            <div style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #cbd5e1', borderRadius: '16px', color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}>
              Rest Day / يوم راحة
            </div>
          )}
        </div>

        <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '12px', marginTop: '16px' }}>
          {(() => {
            const statsObj = dayStatsMap[activeMobileDay]?.stats || { totalVolumeScore: 0, totalMeters: 0, totalContacts: 0 };
            return (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontStyle: 'normal' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '7px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Daily Load</span>
                    <span style={{ fontSize: '11px', fontWeight: 'black', color: '#ea580c' }}>{statsObj.totalVolumeScore} AU</span>
                  </div>
                  {statsObj.totalMeters > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '7px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Volume</span>
                      <span style={{ fontSize: '11px', fontWeight: 'black', color: '#6366f1' }}>{statsObj.totalMeters}m</span>
                    </div>
                  )}
                  {statsObj.totalContacts > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '7px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Contacts</span>
                      <span style={{ fontSize: '11px', fontWeight: 'black', color: '#f59e0b' }}>{statsObj.totalContacts} ct</span>
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '7px', fontWeight: 'black', textTransform: 'uppercase', color: '#94a3b8', tracking: '0.05em' }}>
                    Performance Core
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

    </div>
  );
}
