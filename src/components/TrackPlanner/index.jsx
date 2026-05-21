import React, { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';

import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import TimelineCard from './TimelineCard.jsx';
import ExerciseLibrary from './ExerciseLibrary.jsx';
import AthleteProfileModal from './AthleteProfileModal.jsx';
import { INITIAL_ATHLETES, INITIAL_LIBRARY } from '../../data/constants.js';
import { supabase } from '../../supabaseClient.js';

// 1. Updated Track & Field Specific Categories
const EXERCISE_CATEGORIES = {
  speed: 'Speed (Track)',
  plyometrics: 'Plyometrics (Jumps)',
  power: 'Power (Gym)',
  strength: 'Strength (Gym)',
  mobility: 'Mobility',
  core: 'Core',
  physical: 'Physical',
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

  const [athletes, setAthletes] = useState(INITIAL_ATHLETES);
  const [selectedAthleteId, setSelectedAthleteId] = useState(
    () => localStorage.getItem('lastSelectedAthlete') || null
  );
  const selectedAthlete =
    athletes.find((a) => a.id === selectedAthleteId) || athletes[0] || null;

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

  const [draggedItem, setDraggedItem] = useState(null);
  const [createProgramModal, setCreateProgramModal] = useState({
    isOpen: false,
    name: '',
    tags: '',
    weeksChain: [''],
  });

  // Add Exercise state updated with 'distance'
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
  });
  const [dayDrillModal, setDayDrillModal] = useState({
    isOpen: false,
    day: null,
    drill: null,
    isNew: false,
  });
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handleToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

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
      const { data } = await supabase
        .from('track_athletes')
        .select('*')
        .order('created_at', { ascending: false });
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
      }
    };
    fetchAthletes();
  }, []);

  useEffect(() => {
    if (selectedAthleteId)
      localStorage.setItem('lastSelectedAthlete', selectedAthleteId);
  }, [selectedAthleteId]);

  const fetchLibraryData = async () => {
    const { data: drillsData } = await supabase
      .from('track_library_drills')
      .select('*')
      .order('created_at', { ascending: false });
    const { data: templatesData } = await supabase
      .from('track_week_templates')
      .select('*')
      .order('created_at', { ascending: false });
    const formattedTemplates = (templatesData || []).map((t) => ({
      id: t.id,
      title: t.template_name,
      type: t.template_type,
      drills: t.drills,
    }));
    setLibrary({ drills: drillsData || [], templates: formattedTemplates });
    const { data: progData } = await supabase
      .from('track_macro_programs')
      .select('*')
      .order('created_at', { ascending: false });
    setPrograms(progData || []);
  };
  useEffect(() => {
    fetchLibraryData();
  }, []);

  useEffect(() => {
    const fetchWeekData = async () => {
      if (!selectedAthleteId) return;
      setIsLoading(true);
      const endStr = getDbDateStr(weekDatesFull[6]);
      const { data } = await supabase
        .from('agilitylap_workouts')
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
      setIsLoading(false);
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
        .from('agilitylap_workouts')
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

  const autoSaveDay = async (day, drillsToSave, titleToSave) => {
    if (!selectedAthleteId) return;
    const dateStr = getDbDateStr(weekDatesFull[DAYS_OF_WEEK.indexOf(day)]);
    const finalTitle =
      titleToSave !== undefined ? titleToSave : dayTitles[day] || '';
    const finalDrills =
      drillsToSave !== undefined ? drillsToSave : schedule[day] || [];
    await supabase.from('agilitylap_workouts').upsert(
      {
        athlete_id: selectedAthleteId,
        workout_date: dateStr,
        workout_title: finalTitle,
        drills: finalDrills,
      },
      { onConflict: 'athlete_id,workout_date' }
    );
  };

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
  const calculateDayVolume = (dayDrills) => {
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
      const intensity = parseInt(drill.percentage) || 0;
      let s = parseInt(String(drill.sets).replace(/\D/g, '')) || 0;
      let r = parseInt(String(drill.reps).replace(/\D/g, '')) || 0;
      let dist = parseInt(String(drill.distance).replace(/\D/g, '')) || 0;

      if (s > 0 && r === 0 && type !== 'speed') r = 1;
      if (r > 0 && s === 0 && type !== 'speed') s = 1;
      if (s > 0 && dist === 0 && type === 'speed') dist = 10; // Default min distance
      if (dist > 0 && s === 0 && type === 'speed') s = 1;

      let repsMultiplier = s * r;
      let drillLoad = 0;

      // 1. SPEED (Sprints): Power/CNS Exponential Formula
      if (type === 'speed') {
        const sprintVolume = s * dist;
        totalMeters += sprintVolume;
        if (intensity > 0) {
          validIntensityCount++;
          sumIntensity += intensity;
        }
        // Speed Load Formula: (Distance) * (%MaxV)^2 * 0.2
        drillLoad =
          sprintVolume * Math.pow(intensity > 0 ? intensity / 100 : 1, 2) * 0.2;
        cnsLoad += drillLoad * 0.8; // 80% CNS
        structuralLoad += drillLoad * 0.2; // 20% Structural
      }
      // 2. PLYOMETRICS (Jumps): High Mechanical Impact
      else if (type === 'plyometrics') {
        totalContacts += repsMultiplier;
        if (intensity > 0) {
          validIntensityCount++;
          sumIntensity += intensity;
        }
        drillLoad = repsMultiplier * 2.5; // Fixed load per contact
        cnsLoad += drillLoad * 0.5; // 50% CNS
        structuralLoad += drillLoad * 0.5; // 50% Structural
      }
      // 3. POWER (Gym Lifts): Pure Neuromuscular
      else if (type === 'power') {
        if (intensity > 0) {
          validIntensityCount++;
          sumIntensity += intensity;
        }
        drillLoad =
          repsMultiplier * 2.0 * (intensity > 0 ? intensity / 100 : 1) * 10;
        cnsLoad += drillLoad; // 100% CNS
      }
      // 4. STRENGTH (Gym Lifts): Pure Structural
      else if (type === 'strength') {
        if (intensity > 0) {
          validIntensityCount++;
          sumIntensity += intensity;
        }
        drillLoad =
          repsMultiplier * 1.5 * (intensity > 0 ? intensity / 100 : 1) * 10;
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
  };

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

  const handleSaveProgramBlock = async () => {
    if (!createProgramModal.name.trim()) return;
    const compiledWeeks = createProgramModal.weeksChain
      .map((tplId) => {
        const found = library.templates.find(
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
    if (!error) {
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
        await supabase.from('agilitylap_workouts').upsert(
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
      .from('agilitylap_workouts')
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
    if (!error) {
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
          const newDrills = item.drills.map((d, i) => ({
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
      title: drill.title,
      details: drill.details || '',
      type: drill.type || 'speed',
      percentage: drill.percentage ? parseFloat(drill.percentage) : null,
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
    if (!error && data) {
      setLibrary((prev) => ({ ...prev, drills: [data[0], ...prev.drills] }));
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

  const handleDeleteExercise = (day, id) => {
    const updatedDrills = schedule[day].filter((w) => w.id !== id);
    const newSchedule = { ...schedule, [day]: updatedDrills };
    setSchedule(newSchedule);
    pushToHistory(newSchedule, dayTitles);
    autoSaveDay(day, updatedDrills, dayTitles[day]);
  };
  const handleDayTitleChange = (day, newTitle) => {
    const newTitles = { ...dayTitles, [day]: newTitle };
    setDayTitles(newTitles);
    pushToHistory(schedule, newTitles);
    autoSaveDay(day, schedule[day], newTitle);
  };
  const confirmDelete = () => {
    if (deleteConfirmation.type === 'week') {
      const emptySchedule = DAYS_OF_WEEK.reduce(
        (acc, day) => ({ ...acc, [day]: [] }),
        {}
      );
      setSchedule(emptySchedule);
      setDayTitles({});
      pushToHistory(emptySchedule, {});
      DAYS_OF_WEEK.forEach((day) => autoSaveDay(day, [], ''));
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
      autoSaveDay(tDay, [], '');
      handleToast(`${tDay} cleared`);
    }
    setDeleteConfirmation({ isOpen: false, type: null, targetDay: null });
  };
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
    if (!error && data) {
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
    const allDrills = [];
    DAYS_OF_WEEK.forEach((day) => {
      schedule[day].forEach((drill) => allDrills.push({ ...drill }));
    });
    if (allDrills.length === 0) return;
    const newTemplate = {
      template_name: saveWeekTemplateModal.name,
      template_type: 'week',
      drills: allDrills,
    };
    const { data, error } = await supabase
      .from('agilitylap_templates')
      .insert([newTemplate])
      .select();
    if (!error && data) {
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
  const handleAddAthlete = async () => {
    if (newAthleteData.name.trim()) {
      const newAthlete = {
        name: newAthleteData.name,
        birth_year: newAthleteData.birthYear
          ? parseInt(newAthleteData.birthYear)
          : null,
        weight: newAthleteData.weight
          ? parseFloat(newAthleteData.weight)
          : null,
      };
      const { data } = await supabase
        .from('agilitylap_athletes')
        .insert([newAthlete])
        .select();
      if (data && data.length > 0) {
        const addedAthlete = {
          ...data[0],
          birthYear: data[0].birth_year,
          bodyFat: data[0].body_fat,
          verticalJump: data[0].vertical_jump,
          halfSquat: data[0].half_squat,
          quarterSquat: data[0].quarter_squat,
        };
        setAthletes([addedAthlete, ...athletes]);
        setSelectedAthleteId(addedAthlete.id);
        setNewAthleteData({ name: '', birthYear: '', weight: '' });
        setShowAddAthleteModal(false);
      }
    }
  };
  const handleSaveProfile = async (updatedProfile) => {
    const { error } = await supabase
      .from('track_athletes')
      .update({
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
      })
      .eq('id', updatedProfile.id);
    if (!error) {
      setAthletes((prev) =>
        prev.map((a) => (a.id === updatedProfile.id ? updatedProfile : a))
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
        drills: prev.drills.filter((d) => d.id !== id),
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
        templates: prev.templates.filter((t) => t.id !== id),
      }));
    }
  };
  const handleEditTemplate = (tpl) => {
    handleToast('Drag to timeline, alter it, and save it again.');
  };

  const handleSaveLibraryExercise = async () => {
    if (!addExerciseModal.title.trim()) return;
    const drillData = {
      title: addExerciseModal.title,
      details: addExerciseModal.details,
      type: addExerciseModal.type,
      percentage: addExerciseModal.percentage
        ? parseFloat(addExerciseModal.percentage)
        : null,
      sets: addExerciseModal.sets,
      reps: addExerciseModal.reps,
      distance: addExerciseModal.distance,
      rest: addExerciseModal.rest,
      unit: addExerciseModal.unit,
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
          drills: prev.drills.map((d) =>
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
        });
        handleToast('Exercise updated');
      }
    } else {
      const { data, error } = await supabase
        .from('track_library_drills')
        .insert([drillData])
        .select();
      if (!error && data) {
        setLibrary((prev) => ({ ...prev, drills: [data[0], ...prev.drills] }));
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
        });
        handleToast('Exercise added');
      }
    }
  };

  return (
    <div
      className={`min-h-screen font-sans selection:bg-orange-500/30 transition-colors duration-200 ${
        isDarkMode
          ? 'dark bg-slate-900 text-slate-100'
          : 'bg-[#F4F5F7] text-slate-800'
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
        />
      )}

      <Header
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        currentWeekStart={currentWeekStart}
        setShowMonthCalendar={setShowMonthCalendar}
        selectedAthlete={selectedAthlete}
        setSelectedAthleteId={setSelectedAthleteId}
        athletes={athletes}
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
        weeklyStats={weeklyStats}
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
                    value={dayDrillModal.drill.type}
                    onChange={(e) =>
                      setDayDrillModal({
                        ...dayDrillModal,
                        drill: { ...dayDrillModal.drill, type: e.target.value },
                      })
                    }
                    className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(EXERCISE_CATEGORIES).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-32">
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
                    {dayDrillModal.drill.type === 'speed'
                      ? 'Speed (%Max V)'
                      : 'Intensity (%1RM)'}
                  </label>
                  <div className="relative w-full">
                    <input
                      type="number"
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
                      className="w-full text-sm py-2.5 pl-7 pr-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                    <Percent className="w-3.5 h-3.5 absolute left-2 top-3 text-slate-400" />
                  </div>
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

                {dayDrillModal.drill.type === 'speed' ? (
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
                          },
                        })
                      }
                      placeholder="e.g. 30"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ) : (
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
                      {dayDrillModal.drill.type === 'plyometrics'
                        ? 'Contacts/Reps'
                        : 'Volume/Reps'}
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
                          },
                        })
                      }
                      placeholder="Value"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

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
              </div>

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
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
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
          onPrint={() => window.print()}
        />

        <div
          className={`flex-1 overflow-x-auto overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50 print:bg-white print:overflow-visible w-full pb-24 md:pb-0 relative transition-all duration-300 ${
            showLibrary ? 'md:mr-80' : ''
          }`}
        >
          <div
            className={`flex h-full p-2 md:p-4 gap-2 print:grid print:grid-cols-2 print:gap-x-12 print:gap-y-6 print:p-4 ${
              isMobileView ? 'flex-col w-full' : 'flex-row w-full'
            }`}
          >
            {DAYS_OF_WEEK.map((day, index) => {
              const fullDateStr = weekDatesFull[index].toLocaleDateString(
                'en-GB',
                { day: 'numeric', month: 'short', year: 'numeric' }
              );
              const dayDrills = schedule[day] || [];
              const dayStats = calculateDayVolume(dayDrills);
              const dayTotalCombined =
                dayStats.cnsLoad + dayStats.structuralLoad;
              const dayCnsPct =
                dayTotalCombined > 0
                  ? Math.round((dayStats.cnsLoad / dayTotalCombined) * 100)
                  : 0;

              return (
                <div
                  key={day}
                  className={`flex flex-col ${
                    isMobileView
                      ? 'w-full mb-6 border-b pb-6'
                      : 'flex-1 min-w-[160px] 2xl:min-w-[200px]'
                  } print:break-inside-avoid print:mb-0`}
                >
                  <div className="mb-4 flex flex-col group border-b border-slate-200 dark:border-slate-700 pb-3 px-1 md:px-2">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-[10px] md:text-xs font-semibold tracking-wider text-slate-400 uppercase">
                        {day}
                      </span>
                      <span className="text-[9px] md:text-[10px] font-medium text-slate-400/80">
                        {fullDateStr}
                      </span>
                    </div>
                    <div className="flex items-start gap-1 md:gap-2 justify-between">
                      <div className="flex items-start gap-1 md:gap-2 flex-1">
                        <div className="w-6 h-6 md:w-8 md:h-8 shrink-0 rounded-full border flex items-center justify-center text-xs md:text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800">
                          {weekDates[index]}
                        </div>
                        <input
                          type="text"
                          value={dayTitles[day] || ''}
                          onChange={(e) =>
                            handleDayTitleChange(day, e.target.value)
                          }
                          placeholder="Workout Focus"
                          className="text-xs md:text-[14px] font-medium text-slate-700 dark:text-slate-200 bg-transparent border-none outline-none w-full"
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
      </div>
    </div>
  );
}
