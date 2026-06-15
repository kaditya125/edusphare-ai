import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiCall } from '../lib/api';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Calendar as CalIcon,
  Clock,
  ArrowUpRight,
  Flame,
  ChevronDown,
  Check,
  Search,
  Printer,
  MapPin,
  Users,
  Download,
  Sparkles,
  Layers,
  LayoutGrid
} from "lucide-react";
import { cn } from "../lib/utils";

type Category = {
  name: string;
  color: string;
  shadow: string;
  gradient: string;
};

type Event = {
  id: string;
  title: string;
  type: string;
  category: string;
  date: string;
  startTime: number;
  duration: number;
  location: string;
  credits: number;
  instructor: {
    name: string;
    role: string;
    avatar: string;
  };
  participants: string[];
  courseCode?: string;
  isAI?: boolean;
};

const CATEGORIES: Category[] = [
  { name: "Lectures", color: "bg-blue-600", shadow: "shadow-blue-500/20", gradient: "from-blue-500 to-blue-600" },
  { name: "Seminars", color: "bg-cyan-500", shadow: "shadow-cyan-500/20", gradient: "from-cyan-400 to-cyan-500" },
  { name: "Exams", color: "bg-indigo-500", shadow: "shadow-indigo-500/20", gradient: "from-indigo-500 to-indigo-600" },
  { name: "Workshops", color: "bg-purple-500", shadow: "shadow-purple-500/20", gradient: "from-purple-500 to-purple-600" },
  { name: "Public Events", color: "bg-orange-500", shadow: "shadow-orange-500/20", gradient: "from-orange-500 to-orange-600" },
];

export function AcademicCalendar() {
  const TODAY = useMemo(() => new Date(), []);
  
  const [selectedDate, setSelectedDate] = useState<Date>(TODAY);
  const [viewDate, setViewDate] = useState<Date>(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set(CATEGORIES.map(c => c.name)));
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [selectedEventObj, setSelectedEventObj] = useState<Event | null>(null);

  const queryClient = useQueryClient();

  // 1. Fetch Events
  const startDateStr = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1).toISOString();
  const endDateStr = new Date(viewDate.getFullYear(), viewDate.getMonth() + 2, 0).toISOString();

  const { data: fetchedEvents = [], isLoading, isError, error } = useQuery({
    queryKey: ['calendar-events', startDateStr, endDateStr],
    queryFn: () => apiCall(`/calendar/events?start=${startDateStr}&end=${endDateStr}`)
  });

  const [aiEvents, setAiEvents] = useState<Event[]>([]);

  const ALL_EVENTS = useMemo(() => {
    return [...fetchedEvents, ...aiEvents].map(e => ({...e, date: new Date(e.date)}));
  }, [fetchedEvents, aiEvents]);

  // 2. AI Optimizer Mutation
  const optimizeMutation = useMutation({
    mutationFn: () => {
      // Get current week's events
      const d = new Date(selectedDate);
      const day = d.getDay();
      const startOfWeek = new Date(d);
      startOfWeek.setDate(d.getDate() - day);
      
      const weekEvents = ALL_EVENTS.filter(e => {
        const diff = (e.date.getTime() - startOfWeek.getTime()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff < 7 && !e.isAI;
      });

      return apiCall('/calendar/ai-optimize', {
        method: 'POST',
        body: JSON.stringify({ events: weekEvents, startDate: startOfWeek.toISOString() })
      });
    },
    onSuccess: (newAiEvents) => {
      setAiEvents(prev => [...prev, ...newAiEvents]);
    }
  });

  // 3. ICS Export
  const handleExport = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/calendar/export', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'schedule.ics';
      a.click();
    } catch(err) {
      console.error(err);
    }
  };

  const toggleCategory = (catName: string) => {
    setActiveCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(catName)) newSet.delete(catName);
      else newSet.add(catName);
      return newSet;
    });
  };

  const toggleAllCategories = () => {
    if (activeCategories.size === CATEGORIES.length) setActiveCategories(new Set());
    else setActiveCategories(new Set(CATEGORIES.map(c => c.name)));
  };

  const formatTime = (decimalHours: number) => {
    const hrs = Math.floor(decimalHours);
    const mins = Math.round((decimalHours - hrs) * 60);
    const isPM = hrs >= 12;
    const displayHrs = hrs % 12 === 0 ? 12 : hrs % 12;
    const displayMins = mins.toString().padStart(2, "0");
    return `${displayHrs}:${displayMins} ${isPM ? 'pm' : 'am'}`;
  };

  const formatDuration = (hours: number) => {
    const hrs = Math.floor(hours);
    const mins = Math.round((hours - hrs) * 60);
    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
    if (hrs > 0) return `${hrs}h`;
    return `${mins}m`;
  };

  const nextMonth = () => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const prevMonth = () => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const nextDay = () => {
    setSelectedDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 1);
      if (d.getMonth() !== viewDate.getMonth()) setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
      return d;
    });
  };
  const prevDay = () => {
    setSelectedDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 1);
      if (d.getMonth() !== viewDate.getMonth()) setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
      return d;
    });
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const renderMiniCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const prevMonthDays = getDaysInMonth(year, month - 1);

    const days = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push(<div key={`prev-${i}`} className="text-slate-300 dark:text-slate-600 py-1.5 font-semibold">{prevMonthDays - i}</div>);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const isSelected = selectedDate.toDateString() === d.toDateString();
      const isToday = TODAY.toDateString() === d.toDateString();
      const dayEvents = ALL_EVENTS.filter(e => e.date.toDateString() === d.toDateString());
      
      days.push(
        <div key={`day-${i}`} className="relative flex justify-center py-1 cursor-pointer" onClick={() => setSelectedDate(d)}>
          <span className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center text-[13px] transition-all",
            isSelected ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 font-bold" : 
            isToday ? "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 font-bold" : 
            "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
          )}>
            {i}
          </span>
          {dayEvents.length > 0 && !isSelected && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />}
        </div>
      );
    }
    const remainder = 42 - days.length;
    for (let i = 1; i <= remainder; i++) {
        days.push(<div key={`next-${i}`} className="text-slate-300 dark:text-slate-600 py-1.5 font-semibold">{i}</div>);
    }

    return (
      <div className="bg-transparent pt-2">
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {["SU", "MO", "TU", "WE", "TH", "FR", "SA"].map((day) => (
            <div key={day} className="text-[10px] font-bold text-slate-400 py-1">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1 gap-x-1 text-center">{days}</div>
      </div>
    );
  };

  const getFilteredEvents = () => {
    return ALL_EVENTS.filter(e => {
      if (!activeCategories.has(e.category)) return false;
      if (searchQuery && !e.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  };

  // Day View
  const renderDayView = () => {
    const dayEvents = getFilteredEvents().filter(e => e.date.toDateString() === selectedDate.toDateString());
    
    return (
      <div className="flex-1 overflow-y-auto mt-4 px-2 lg:px-4 pb-12 relative scrollbar-none select-none">
        <div className="absolute inset-0 top-6 left-[80px] border-l border-slate-100 dark:border-slate-700/50 pointer-events-none" />
        {Array.from({ length: 11 }).map((_, idx) => {
          const hr = idx + 8;
          const displayHr = hr > 12 ? hr - 12 : hr;
          const ampm = hr >= 12 ? 'pm' : 'am';
          return (
            <div key={idx} className="flex gap-4 h-[120px] relative">
              <div className="w-16 shrink-0 text-right pt-2 text-[13px] font-semibold text-slate-400 dark:text-slate-500">
                {displayHr}:00 {ampm}
              </div>
              <div className="flex-1 border-t border-slate-100 dark:border-slate-700/50 relative">
                 <div className="absolute top-[60px] left-0 right-0 border-t border-slate-50 dark:border-slate-800/50 border-dashed" />
              </div>
            </div>
          );
        })}

        {dayEvents.map(event => {
          const startOffset = (event.startTime - 8) * 120;
          const height = event.duration * 120;
          const cat = CATEGORIES.find(c => c.name === event.category) || CATEGORIES[0];

          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={event.id}
              onClick={() => setSelectedEventObj(event)}
              className={cn(
                "absolute left-[100px] right-6 rounded-[1.25rem] p-4 text-white cursor-pointer hover:brightness-110 hover:-translate-y-0.5 transition-all",
                cat.gradient, cat.shadow, "shadow-lg", event.isAI && "ring-2 ring-purple-400 ring-offset-2 ring-offset-slate-900"
              )}
              style={{ top: `${startOffset + 24}px`, height: `${height - 8}px` }}
            >
              <div className="flex items-start justify-between h-full">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-1 opacity-90">
                    <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-sm">
                      {event.type}
                    </span>
                    <span className="text-[11px] font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(event.startTime)} - {formatTime(event.startTime + event.duration)}
                    </span>
                    {event.isAI && <span className="text-xs font-bold bg-purple-500/40 px-2 py-0.5 rounded-md flex items-center gap-1"><Sparkles className="w-3 h-3"/> AI Suggested</span>}
                  </div>
                  <h3 className="font-bold text-[15px] sm:text-[17px] leading-tight mb-1">{event.title}</h3>
                  <div className="text-[13px] font-medium opacity-90 flex items-center gap-3">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> {event.location}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  // Week View
  const renderWeekView = () => {
    const d = new Date(selectedDate);
    const day = d.getDay();
    const startOfWeek = new Date(d);
    startOfWeek.setDate(d.getDate() - day);
    
    const weekDays = Array.from({length: 7}).map((_, i) => {
      const wd = new Date(startOfWeek);
      wd.setDate(wd.getDate() + i);
      return wd;
    });

    const filtered = getFilteredEvents();

    return (
      <div className="flex-1 overflow-auto mt-4 px-2 pb-12 relative scrollbar-thin scrollbar-thumb-slate-200">
        <div className="flex w-full sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-20 pb-2">
          <div className="w-12 shrink-0"></div>
          {weekDays.map(wd => (
             <div key={wd.toISOString()} className={cn(
               "flex-1 text-center font-bold text-sm py-2 rounded-t-xl",
               wd.toDateString() === TODAY.toDateString() ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-300"
             )}>
                <div>{wd.toLocaleString('en-US', { weekday: 'short' })}</div>
                <div className={cn("text-xl mt-1", wd.toDateString() === TODAY.toDateString() && "font-black")}>{wd.getDate()}</div>
             </div>
          ))}
        </div>
        
        <div className="flex w-full relative">
           <div className="w-12 shrink-0">
             {Array.from({ length: 11 }).map((_, idx) => {
                const hr = idx + 8;
                return <div key={hr} className="h-[80px] text-right pr-2 text-xs font-semibold text-slate-400 mt-[-6px]">{hr}</div>
             })}
           </div>
           
           <div className="flex-1 flex border-t border-l border-slate-100 dark:border-slate-800 relative">
              {weekDays.map((wd, i) => (
                 <div key={i} className="flex-1 border-r border-slate-100 dark:border-slate-800 relative min-w-[100px]">
                    {Array.from({ length: 11 }).map((_, idx) => (
                      <div key={idx} className="h-[80px] border-b border-slate-100 dark:border-slate-800" />
                    ))}
                    
                    {filtered.filter(e => e.date.toDateString() === wd.toDateString()).map(event => {
                      const startOffset = (event.startTime - 8) * 80;
                      const height = event.duration * 80;
                      const cat = CATEGORIES.find(c => c.name === event.category) || CATEGORIES[0];
                      return (
                        <div key={event.id} onClick={() => setSelectedEventObj(event)}
                          className={cn("absolute left-1 right-1 rounded-lg p-1 text-white text-[10px] overflow-hidden cursor-pointer hover:z-10 hover:scale-[1.02] shadow-sm transition-all", cat.gradient)}
                          style={{ top: `${startOffset}px`, height: `${height - 2}px` }}>
                          <div className="font-bold truncate">{event.title}</div>
                          <div className="truncate opacity-80">{formatTime(event.startTime)}</div>
                        </div>
                      )
                    })}
                 </div>
              ))}
           </div>
        </div>
      </div>
    );
  };

  // Month View
  const renderMonthView = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    for(let i=0; i<firstDay; i++) days.push(<div key={`empty-${i}`} className="min-h-[100px] border border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20" />);
    
    const filtered = getFilteredEvents();

    for(let i=1; i<=daysInMonth; i++) {
      const d = new Date(year, month, i);
      const dayEvents = filtered.filter(e => e.date.toDateString() === d.toDateString());
      
      days.push(
        <div key={i} className={cn("min-h-[100px] border border-slate-100 dark:border-slate-800/50 p-1 flex flex-col hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer", TODAY.toDateString() === d.toDateString() && "bg-blue-50/30 dark:bg-blue-900/10")} onClick={() => { setSelectedDate(d); setViewMode('day'); }}>
          <div className={cn("text-right font-bold text-sm p-1", TODAY.toDateString() === d.toDateString() ? "text-blue-600 dark:text-blue-400" : "text-slate-500")}>
             {i}
          </div>
          <div className="flex-1 flex flex-col gap-1 overflow-y-auto scrollbar-none">
             {dayEvents.slice(0, 3).map(e => {
                const cat = CATEGORIES.find(c => c.name === e.category) || CATEGORIES[0];
                return (
                  <div key={e.id} onClick={(ev) => { ev.stopPropagation(); setSelectedEventObj(e); }} className={cn("text-[9px] px-1.5 py-0.5 rounded text-white truncate", cat.gradient)}>
                     {e.title}
                  </div>
                )
             })}
             {dayEvents.length > 3 && <div className="text-[10px] text-slate-400 text-center font-bold">+{dayEvents.length - 3} more</div>}
          </div>
        </div>
      )
    }

    return (
      <div className="flex-1 mt-4 px-2 lg:px-4 pb-12 flex flex-col">
         <div className="grid grid-cols-7 text-center font-bold text-sm text-slate-500 py-2 shrink-0">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d}>{d}</div>)}
         </div>
         <div className="grid grid-cols-7 flex-1 overflow-y-auto content-start rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            {days}
         </div>
      </div>
    );
  };

  return (
    <div className="flex-1 w-full h-full overflow-hidden flex flex-col pt-16 lg:pt-20 px-4 md:px-8 bg-slate-50 dark:bg-slate-900 pb-20 relative">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 dark:bg-blue-600/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 dark:bg-cyan-600/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Top Header */}
      <div className="w-full max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between py-6 shrink-0 gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-4 md:mt-0 tracking-tight">
          Academic Schedule
        </h1>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <select className="px-4 py-2 bg-slate-100/80 dark:bg-slate-800 rounded-2xl text-[13px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700 outline-none hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer">
             <option value="">All Departments</option>
             <option value="cs">Computer Science</option>
             <option value="ee">Electrical Eng</option>
          </select>
          <select className="px-4 py-2 bg-slate-100/80 dark:bg-slate-800 rounded-2xl text-[13px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700 outline-none hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer">
             <option value="">All Courses</option>
             <option value="data">Data Structures</option>
             <option value="ml">Machine Learning</option>
          </select>
          
          <button onClick={handleExport} className="whitespace-nowrap px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 rounded-2xl text-[13px] font-semibold flex items-center gap-2 shadow-sm transition-colors ml-auto md:ml-4">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => window.print()} className="whitespace-nowrap px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[13px] font-semibold flex items-center gap-2 shadow-sm transition-colors ml-2">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="w-full max-w-[1400px] mx-auto flex-1 flex flex-col lg:flex-row gap-6 pb-6 overflow-hidden">
        
        {/* LEFT PANEL */}
        <div className="w-full lg:w-[300px] shrink-0 flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-none pb-20 lg:pb-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center gap-1.5">
              <button onClick={prevMonth} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-blue-600 hover:text-white transition"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={nextMonth} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-blue-600 hover:text-white transition"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-3 relative border border-blue-100 dark:border-blue-800/50 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition" onClick={() => setViewMode('day')}>
               <div className="flex items-center gap-2 text-[11px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-1"><CalIcon className="w-3.5 h-3.5" /> Selected</div>
               <div className="text-sm font-semibold text-slate-900 dark:text-white">{selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric'})}</div>
            </div>
          </div>

          {renderMiniCalendar()}

          <div className="mt-2">
            <button onClick={() => optimizeMutation.mutate()} disabled={optimizeMutation.isPending} className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98] disabled:opacity-70">
              <Sparkles className="w-5 h-5"/> {optimizeMutation.isPending ? 'Optimizing...' : 'AI Study Optimizer'}
            </button>
          </div>

          {/* Categories */}
          <div className="mt-4">
            <h3 className="text-[15px] font-bold text-slate-800 dark:text-white mb-4">Categories</h3>
            <div className="relative mb-6">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search events..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-11 pr-4 text-sm outline-none placeholder:text-slate-400 font-medium focus:ring-2 focus:ring-blue-500/20 transition-shadow" />
            </div>
            <div className="space-y-3 px-1">
              <label className="flex items-center gap-3 cursor-pointer group" onClick={toggleAllCategories}>
                <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors", activeCategories.size === CATEGORIES.length ? "bg-blue-600 shadow-sm shadow-blue-500/20" : "bg-slate-200 dark:bg-slate-700")}>
                  {activeCategories.size === CATEGORIES.length && <div className="w-2.5 h-0.5 bg-white rounded-full" />}
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">Select All</span>
              </label>

              {CATEGORIES.map((cat, i) => {
                const isActive = activeCategories.has(cat.name);
                return (
                  <label key={cat.name} className="flex items-center gap-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); toggleCategory(cat.name); }}>
                    <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all", isActive ? `${cat.color} ${cat.shadow} text-white scale-100` : "bg-slate-200 dark:bg-slate-700 text-transparent scale-95")}>
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </div>
                    <span className={cn("text-sm font-semibold transition-colors", isActive ? "text-slate-800 dark:text-slate-200" : "text-slate-500 dark:text-slate-500")}>{cat.name}</span>
                  </label>
                )
              })}
            </div>
          </div>
        </div>

        {/* MIDDLE/SCHEDULE AREA */}
        <div className="flex-1 bg-white/80 dark:bg-surface/80 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-xl backdrop-blur-xl flex flex-col p-2.5 overflow-hidden min-h-[600px] lg:min-h-0 relative z-10">
          
          <div className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-[2rem] p-3 flex items-center justify-between text-white shrink-0 shadow-lg shadow-blue-500/20">
            <div className="flex items-center gap-2">
              <button onClick={() => { setSelectedDate(TODAY); setViewDate(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1)); }} className="px-5 py-2.5 bg-white/20 hover:bg-white/30 transition-colors rounded-[1.5rem] text-sm font-semibold flex items-center gap-2 backdrop-blur-sm shadow-sm">
                Today
              </button>
              
              <div className="flex bg-white/10 p-1 rounded-full backdrop-blur-sm">
                <button onClick={() => setViewMode('day')} className={cn("px-4 py-1.5 rounded-full text-sm font-bold transition-all", viewMode === 'day' ? "bg-white text-blue-600" : "hover:bg-white/20")}>Day</button>
                <button onClick={() => setViewMode('week')} className={cn("px-4 py-1.5 rounded-full text-sm font-bold transition-all", viewMode === 'week' ? "bg-white text-blue-600" : "hover:bg-white/20")}>Week</button>
                <button onClick={() => setViewMode('month')} className={cn("px-4 py-1.5 rounded-full text-sm font-bold transition-all", viewMode === 'month' ? "bg-white text-blue-600" : "hover:bg-white/20")}>Month</button>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/10 px-6 py-2.5 rounded-[1.5rem] backdrop-blur-sm">
              <CalIcon className="w-4 h-4 opacity-80" />
              <span className="text-sm font-semibold">{selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            
            <div className="flex items-center gap-1.5 px-3">
              <button onClick={viewMode === 'month' ? prevMonth : prevDay} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={viewMode === 'month' ? nextMonth : nextDay} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>

          {isLoading && <div className="absolute inset-0 z-50 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/></div>}

          {viewMode === 'day' && renderDayView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'month' && renderMonthView()}

        </div>
      </div>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEventObj && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedEventObj(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative z-10 border border-slate-200 dark:border-slate-800">
               {(() => {
                 const cat = CATEGORIES.find(c => c.name === selectedEventObj.category) || CATEGORIES[0];
                 return (
                   <>
                     <div className={cn("p-6 text-white flex justify-between items-start", cat.gradient)}>
                        <div>
                           <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-md">{selectedEventObj.category}</span>
                              {selectedEventObj.isAI && <span className="text-xs font-bold bg-purple-500/40 px-2 py-1 rounded-md"><Sparkles className="w-3 h-3 inline"/> AI</span>}
                           </div>
                           <h2 className="text-2xl font-bold">{selectedEventObj.title}</h2>
                        </div>
                        <button onClick={() => setSelectedEventObj(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"><X className="w-4 h-4"/></button>
                     </div>
                     <div className="p-6 space-y-6">
                        <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
                           <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-slate-400"/> {formatTime(selectedEventObj.startTime)} ({formatDuration(selectedEventObj.duration)})</div>
                           <div className="flex items-center gap-2"><MapPin className="w-5 h-5 text-slate-400"/> {selectedEventObj.location}</div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center gap-4">
                           <img src={selectedEventObj.instructor.avatar} className="w-12 h-12 rounded-full object-cover"/>
                           <div>
                              <div className="font-bold text-slate-900 dark:text-white">{selectedEventObj.instructor.name}</div>
                              <div className="text-sm text-slate-500">{selectedEventObj.instructor.role}</div>
                           </div>
                        </div>
                        {selectedEventObj.courseCode && (
                          <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-2xl">
                             <div className="font-semibold text-slate-700 dark:text-slate-300">Course Code</div>
                             <div className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">{selectedEventObj.courseCode}</div>
                          </div>
                        )}
                        <div className="flex gap-3">
                           <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors">Join Online Room</button>
                        </div>
                     </div>
                   </>
                 )
               })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
