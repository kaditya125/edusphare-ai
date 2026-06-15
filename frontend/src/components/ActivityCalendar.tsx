import React from 'react';
import { cn } from '../lib/utils';

interface ActivityDay {
  date: Date;
  level: number;
  count: number;
}

const generateActivityData = (): ActivityDay[] => {
  const data: ActivityDay[] = [];
  const now = new Date();
  const startDate = new Date(now);
  startDate.setMonth(now.getMonth() - 6); // Last 6 months

  for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
    // Generate some random activity that looks reasonable
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const baseProb = isWeekend ? 0.3 : 0.7; // higher chance of activity on weekdays
    
    let level = 0;
    if (Math.random() < baseProb) {
       level = Math.floor(Math.random() * 4) + 1; // 1 to 4
    }

    data.push({
      date: new Date(d),
      level,
      count: level * (Math.floor(Math.random() * 4) + 1),
    });
  }
  return data;
};

const activityData = generateActivityData();

const getLevelColor = (level: number) => {
  switch (level) {
    case 1: return "bg-indigo-100 dark:bg-indigo-900/40";
    case 2: return "bg-indigo-300 dark:bg-indigo-700/60";
    case 3: return "bg-indigo-500 dark:bg-indigo-500/80";
    case 4: return "bg-indigo-700 dark:bg-indigo-500";
    default: return "bg-slate-100 dark:bg-slate-800/50";
  }
};

export function ActivityCalendar() {
  const weeks: (ActivityDay | null)[][] = [];
  let currentWeek: (ActivityDay | null)[] = [];

  // Pad the first week if the first day is not a Sunday (0)
  if (activityData.length > 0) {
     const firstDayOfWeek = activityData[0].date.getDay();
     for (let i = 0; i < firstDayOfWeek; i++) {
        currentWeek.push(null);
     }
  }

  activityData.forEach((day, i) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="font-bold text-slate-900 dark:text-white text-[15px]">
          Engagement & Activity
        </h3>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span>Less</span>
          <div className="flex gap-1.5 items-center">
            {[0, 1, 2, 3, 4].map(level => (
              <div key={level} className={cn("w-[14px] h-[14px] rounded-[3px]", getLevelColor(level))} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
      
      <div className="flex gap-[5px] sm:gap-[6px] overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
        <div className="flex flex-col gap-[5px] sm:gap-[6px] pr-2 text-[10px] sm:text-xs font-semibold text-slate-400 pb-1 justify-between shrink-0 h-[126px] sm:h-[141px]">
          <span className="invisible">Sun</span>
          <span>Mon</span>
          <span className="invisible">Tue</span>
          <span>Wed</span>
          <span className="invisible">Thu</span>
          <span>Fri</span>
          <span className="invisible">Sat</span>
        </div>
        {weeks.map((week, wIndex) => (
          <div key={wIndex} className="flex flex-col gap-[5px] sm:gap-[6px] shrink-0">
            {week.map((day, dIndex) => {
              if (!day) return <div key={dIndex} className="w-[13px] sm:w-[15px] h-[13px] sm:h-[15px]" />;
              return (
                <div
                  key={dIndex}
                  className={cn(
                    "w-[13px] sm:w-[15px] h-[13px] sm:h-[15px] rounded-[3px] transition-colors cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-offset-white dark:hover:ring-offset-slate-800 dark:hover:ring-indigo-400 active:scale-95 group relative",
                    getLevelColor(day.level)
                  )}
                >
                  {/* Tooltip */}
                  <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1.5 bg-slate-900 text-white text-[11px] font-medium rounded-lg whitespace-nowrap z-50 transition-all pointer-events-none shadow-xl border border-slate-700">
                     {day.count === 0 ? "No" : day.count} contributions on {day.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                     <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-900" />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
         <div className="flex gap-4">
             <div className="flex-1">
                 <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">Total Contributions</p>
                 <p className="text-xl font-bold text-slate-900 dark:text-white">
                     {activityData.reduce((acc, curr) => acc + curr.count, 0)}
                 </p>
             </div>
             <div className="flex-1 border-l border-slate-100 dark:border-slate-700 pl-4">
                 <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">Current Streak</p>
                 <p className="text-xl font-bold text-slate-900 dark:text-white">12 Days</p>
             </div>
         </div>
      </div>
    </div>
  );
}
