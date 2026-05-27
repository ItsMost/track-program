import React, { useState, memo } from 'react';
import {
  Edit2,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Percent,
  Clock,
  Info,
  Zap,
  Dumbbell,
  Target,
  Activity
} from 'lucide-react';

const CATEGORY_META = {
  speed: {
    icon: Zap,
    color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-500/20',
    labelColor: 'text-amber-600 dark:text-amber-400',
    label: 'Speed'
  },
  plyometrics: {
    icon: Zap,
    color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-500/20',
    labelColor: 'text-amber-600 dark:text-amber-400',
    label: 'Plyos'
  },
  power: {
    icon: Dumbbell,
    color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/30 border-sky-500/20',
    labelColor: 'text-sky-600 dark:text-sky-400',
    label: 'Power'
  },
  strength: {
    icon: Dumbbell,
    color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/30 border-sky-500/20',
    labelColor: 'text-sky-600 dark:text-sky-400',
    label: 'Strength'
  },
  isometric: {
    icon: Target,
    color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30 border-orange-500/20',
    labelColor: 'text-orange-600 dark:text-orange-400',
    label: 'Isometric'
  },
  mobility: {
    icon: Target,
    color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30 border-orange-500/20',
    labelColor: 'text-orange-600 dark:text-orange-400',
    label: 'Mobility'
  },
  core: {
    icon: Target,
    color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30 border-purple-500/20',
    labelColor: 'text-purple-600 dark:text-purple-400',
    label: 'Core'
  },
  physical: {
    icon: Activity,
    color: 'text-slate-500 bg-slate-50 dark:bg-slate-900 border-slate-200',
    labelColor: 'text-slate-600 dark:text-slate-400',
    label: 'Physical'
  }
};

const TimelineCard = memo(function TimelineCard({
  drill,
  day,
  index,
  isLast,
  isPreviewMode,
  athlete,
  onEdit,
  onDelete,
  onCopy,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop
}) {
  const [showNotes, setShowNotes] = useState(false);

  const type = (drill.type || 'speed').toLowerCase();
  const meta = CATEGORY_META[type] || CATEGORY_META.speed;
  const IconComponent = meta.icon;

  const calculateTargetPace = () => {
    if (type !== 'speed' || !drill.percentage || !drill.distance) return null;
    const pct = parseFloat(drill.percentage);
    const dist = parseFloat(drill.distance);
    if (isNaN(pct) || isNaN(dist) || dist <= 0 || pct <= 0) return null;

    // Collect speed tests
    const speedTests = [];
    if (athlete?.m100) speedTests.push({ dist: 100, time: parseFloat(athlete.m100) });
    if (athlete?.m150) speedTests.push({ dist: 150, time: parseFloat(athlete.m150) });
    if (athlete?.m200) speedTests.push({ dist: 200, time: parseFloat(athlete.m200) });
    if (athlete?.m300) speedTests.push({ dist: 300, time: parseFloat(athlete.m300) });
    if (athlete?.m400) speedTests.push({ dist: 400, time: parseFloat(athlete.m400) });

    if (speedTests.length === 0) return { error: 'No PBs set in Profile' };

    speedTests.sort((a, b) => a.dist - b.dist);

    let time100 = null;
    let exact = speedTests.find(t => t.dist === dist);
    
    if (exact) {
      time100 = exact.time;
    } else {
      // Find bounding tests for interpolation
      let lower = null;
      let higher = null;
      for (const t of speedTests) {
        if (t.dist < dist) {
          if (!lower || t.dist > lower.dist) lower = t;
        }
        if (t.dist > dist) {
          if (!higher || t.dist < higher.dist) higher = t;
        }
      }

      if (lower && higher) {
        // Interpolate velocity
        const vLower = lower.dist / lower.time;
        const vHigher = higher.dist / higher.time;
        const vDist = vLower + (vHigher - vLower) * ((dist - lower.dist) / (higher.dist - lower.dist));
        time100 = dist / vDist;
      } else if (lower) {
        // Extrapolate using closest lower velocity
        const vLower = lower.dist / lower.time;
        time100 = dist / vLower;
      } else if (higher) {
        // Extrapolate using closest higher velocity
        const vHigher = higher.dist / higher.time;
        time100 = dist / vHigher;
      }
    }

    if (!time100) return null;
    
    let adjustedTime = time100;
    if (dist < 100) {
      let scaleFactor = 1.0;
      if (dist <= 10) {
        scaleFactor = 0.55;
      } else if (dist <= 20) {
        scaleFactor = 0.55 + ((dist - 10) / 10) * 0.15; // 0.55 to 0.70
      } else if (dist <= 30) {
        scaleFactor = 0.70 + ((dist - 20) / 10) * 0.10; // 0.70 to 0.80
      } else if (dist <= 60) {
        scaleFactor = 0.80 + ((dist - 30) / 30) * 0.13; // 0.80 to 0.93
      } else {
        scaleFactor = 0.93 + ((dist - 60) / 40) * 0.07; // 0.93 to 1.00
      }
      adjustedTime = time100 / scaleFactor;
    }

    let targetTime = adjustedTime / (pct / 100);
    // Apply hand-timing / manual stopwatch reaction adjustment (reduce by 0.24 seconds)
    // to match real-world track practice clocking:
    if (targetTime > 0.24) {
      targetTime = targetTime - 0.24;
    }
    return { time: targetTime.toFixed(2), exact: !!exact };
  };

  const calculateTargetLoad = () => {
    const isStrengthOrPower = type === 'strength' || type === 'power';
    if (!isStrengthOrPower || !drill.percentage) return null;
    const pct = parseFloat(drill.percentage);
    if (isNaN(pct) || pct <= 0) return null;

    const titleLower = (drill.title || '').toLowerCase();
    let liftMax = null;
    let liftName = '';

    if (titleLower.includes('bench')) {
      liftMax = athlete?.bench;
      liftName = 'Bench';
    } else if (titleLower.includes('clean')) {
      liftMax = athlete?.clean;
      liftName = 'Clean';
    } else if (titleLower.includes('deadlift')) {
      liftMax = athlete?.deadlift;
      liftName = 'Deadlift';
    } else if (titleLower.includes('squat')) {
      if (titleLower.includes('half')) {
        liftMax = athlete?.halfSquat;
        liftName = 'Half Squat';
      } else if (titleLower.includes('quarter')) {
        liftMax = athlete?.quarterSquat;
        liftName = 'Quarter Squat';
      } else {
        liftMax = athlete?.fullSquat;
        liftName = 'Squat';
      }
    }

    if (!liftName) return null; // No match found
    if (!liftMax) return { name: liftName, error: 'No 1RM set' };

    const maxVal = parseFloat(liftMax);
    if (isNaN(maxVal) || maxVal <= 0) return { name: liftName, error: 'Invalid 1RM' };

    const targetWeight = maxVal * (pct / 100);
    return { name: liftName, weight: targetWeight.toFixed(1) };
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit(day, drill);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(day, drill.id);
  };

  const handleCopyClick = (e) => {
    e.stopPropagation();
    onCopy(drill);
  };

  const renderParameters = () => {
    const params = [];
    if (type === 'speed') {
      const parts = [];
      if (drill.sets) parts.push(drill.sets);
      
      const repsNum = parseFloat(drill.reps);
      if (drill.reps && (!drill.sets || isNaN(repsNum) || repsNum > 1)) {
        parts.push(drill.reps);
      }
      
      if (drill.distance) {
        parts.push(`${drill.distance}${drill.unit || 'm'}`);
      }
      params.push(parts.join('x'));
    } else {
      if (drill.sets) {
        if (drill.reps) {
          params.push(`${drill.sets}x${drill.reps}${drill.unit === 'sec' ? 's' : ''}`);
        } else {
          params.push(`${drill.sets} Sets`);
        }
      } else if (drill.reps) {
        params.push(`${drill.reps} ${drill.unit || 'Reps'}`);
      }
    }
    return params.join(' ');
  };

  return (
    <div
      draggable={!isPreviewMode}
      onDragStart={(e) => onDragStart(e, day, drill, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, day, index)}
      onClick={isPreviewMode ? null : handleEditClick}
      className={`group relative flex items-stretch gap-2 py-1.5 pl-2 pr-1.5 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/40 transition-all select-none cursor-pointer ${
        drill.superSetNext 
          ? 'border-b-0 pb-3' 
          : 'border-b border-slate-200 dark:border-slate-800/40 last:border-b-0'
      } print:border-slate-200`}
    >
      {/* Dynamic Left Colored Indicator Stripe */}
      <div className="flex shrink-0 w-1 relative rounded-full overflow-hidden my-0.5">
        <div className={`w-full h-full rounded-full ${
          type === 'speed' || type === 'plyometrics' ? 'bg-amber-500' :
          type === 'power' || type === 'strength' ? 'bg-sky-500' :
          type === 'isometric' || type === 'mobility' ? 'bg-orange-500' :
          type === 'core' ? 'bg-purple-500' : 'bg-slate-400'
        }`} />
      </div>

      {/* Super Set Vertical Connector Bridge */}
      {drill.superSetNext && (
        <div className="absolute left-[9px] top-[70%] bottom-[-10px] w-0.5 bg-indigo-500 dark:bg-indigo-400 z-20 flex flex-col justify-end items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-ping absolute bottom-[-2px]" />
        </div>
      )}

      {/* Info Content Column */}
      <div className="flex-1 min-w-0 z-10 flex flex-col justify-center">
        {/* Drill Title & Quick Action Hover Tray */}
        <div className="flex items-start gap-1">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-[8px] font-black uppercase tracking-wider flex items-center gap-0.5 ${meta.labelColor || 'text-slate-500'}`}>
                <IconComponent className="w-2.5 h-2.5 shrink-0" />
                {meta.label}
              </span>
              {drill.percentage ? (
                <span className="px-1 py-0.2 rounded text-[8px] font-black bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100/50 dark:border-rose-950/30">
                  {drill.percentage}% {type === 'speed' ? 'Vmax' : '1RM'}
                </span>
              ) : null}
            </div>
            <h4 className="text-[12px] sm:text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-snug mt-0.5 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors whitespace-normal break-keep [word-break:keep-all]">
              {drill.title}
            </h4>
          </div>
          
          <div className="absolute right-1.5 top-1.5 flex items-center gap-0.5 print:hidden bg-white/95 dark:bg-slate-900/95 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-150 z-20">
            {!isPreviewMode && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
                  className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded transition-colors"
                  title="Move Up"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
                  className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded transition-colors"
                  title="Move Down"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
                <button
                  onClick={handleCopyClick}
                  className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded transition-colors"
                  title="Copy Exercise"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  onClick={handleEditClick}
                  className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-500 rounded transition-colors"
                  title="Edit Parameters"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="p-0.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-500 dark:text-slate-400 hover:text-red-500 rounded transition-colors"
                  title="Delete Exercise"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Inline Parameter Details & Mini Badges */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400 select-none">
          {renderParameters() && (
            <span className="text-slate-600 dark:text-slate-300 font-semibold">
              {renderParameters()}
            </span>
          )}

          {drill.superSetNext && (
            <span className="px-1.5 py-0.2 rounded bg-indigo-500 dark:bg-indigo-600 text-white text-[8px] font-black uppercase tracking-wider flex items-center gap-0.5 shadow-sm animate-pulse">
              ⚡ Super Set
            </span>
          )}

          {drill.rest ? (
            <span className="text-sky-600 dark:text-sky-400 flex items-center gap-0.5 font-bold" title="Rest interval between reps / sets">
              <Clock className="w-2.5 h-2.5 text-sky-500 animate-pulse" />
              {drill.rest.includes('/') ? (
                <>
                  <span className="text-sky-500 dark:text-sky-400">{drill.rest.split('/')[0].trim()}<span className="text-[8px] font-medium opacity-75 ml-0.5">rep</span></span>
                  <span className="text-slate-350 dark:text-slate-650 mx-0.5">/</span>
                  <span className="text-sky-600 dark:text-sky-400">{drill.rest.split('/')[1].trim()}<span className="text-[8px] font-medium opacity-75 ml-0.5">set</span></span>
                </>
              ) : (
                drill.rest
              )}
            </span>
          ) : null}

          {/* Speed Calculator Badge */}
          {(() => {
            const pace = calculateTargetPace();
            if (!pace) return null;
            if (pace.error) {
              return (
                <span className="text-amber-500 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-950/20 px-1 py-0.2 rounded text-[8px] font-bold border border-amber-500/10" title={pace.error}>
                  🎯 Target: --
                </span>
              );
            }
            return (
              <span className="text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1 py-0.2 rounded text-[8px] font-black border border-amber-500/20" title={`Calculated target pace for ${drill.distance}m at ${drill.percentage}% intensity.`}>
                🎯 Target: {pace.time}s
              </span>
            );
          })()}

          {/* Gym Load Calculator Badge */}
          {(() => {
            const load = calculateTargetLoad();
            if (!load) return null;
            if (load.error) {
              return (
                <span className="text-sky-500 dark:text-sky-400 bg-sky-500/5 dark:bg-sky-950/20 px-1 py-0.2 rounded text-[8px] font-bold border border-sky-500/10" title={load.error}>
                  🏋️ {load.name}: --
                </span>
              );
            }
            return (
              <span className="text-sky-600 dark:text-sky-400 bg-sky-500/10 px-1 py-0.2 rounded text-[8px] font-black border border-sky-500/20" title={`Calculated load for ${load.name} at ${drill.percentage}% 1RM.`}>
                🏋️ {load.name}: {load.weight}kg
              </span>
            );
          })()}

          {drill.details && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowNotes(!showNotes);
              }}
              className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded print:hidden"
              title="View Coaching Notes"
            >
              <Info className="w-2.5 h-2.5" />
            </button>
          )}
        </div>

        {/* Expandable Technical Coaching notes */}
        {(showNotes || isPreviewMode) && drill.details ? (
          <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed pl-2 border-l border-slate-300 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-900/30 p-1 rounded-r-lg">
            <span className="font-bold block text-[8px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">
              Technical Cue
            </span>
            {drill.details}
          </p>
        ) : null}
      </div>
    </div>
  );
});

export default TimelineCard;
