import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2,
  Users,
  Link as LinkIcon,
  ShieldCheck,
  Upload,
  Plus,
  Pencil,
  Phone,
  Calendar,
  Mail,
  FileText,
  Globe,
  Clock,
  MapPin,
  Building,
  Search,
  Bell,
  ChevronDown,
  CheckSquare,
  MessageSquare,
  MoreVertical,
  BookOpen,
  Quote,
  Video,
  BrainCircuit,
} from "lucide-react";
import { cn } from "../lib/utils";
import { StudyRoomModal } from "./StudyRoomModal";
import { Pagination } from "./Pagination";
import api from "../services/api";
import { AIQuizModal } from "./widgets/AIQuizModal";
import { ClassmateModal } from "./ClassmateModal";
import { ViewState } from "../types";
import { useStore } from "../store/useStore";

const TypewriterText = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState("");
  
  React.useEffect(() => {
    if (!text) return;
    let i = 0;
    let timer: NodeJS.Timeout;

    const startTyping = () => {
      i = 0;
      setDisplayedText("");
      timer = setInterval(() => {
        setDisplayedText((prev) => text.substring(0, i + 1));
        i++;
        if (i >= text.length) {
          clearInterval(timer);
          setTimeout(startTyping, 4000); // Wait 4 seconds before looping
        }
      }, 40);
    };

    startTyping();
    return () => clearInterval(timer);
  }, [text]);

  return (
    <span>
      {displayedText}
      <span className="animate-pulse inline-block w-[2px] h-[1em] bg-blue-500 ml-0.5 align-middle"></span>
    </span>
  );
};

export function ILearn({ setView }: { setView?: (view: ViewState) => void } = {}) {
  const setSelectedCourse = useStore(state => state.setSelectedCourse);
  const [isStudyRoomOpen, setIsStudyRoomOpen] = useState(false);
  const [activeRoomName, setActiveRoomName] = useState("");
  const [selectedClassmate, setSelectedClassmate] = useState<any>(null);
  const [classmateModalMode, setClassmateModalMode] = useState<
    "profile" | "message"
  >("profile");
  const [quizCourse, setQuizCourse] = useState<any>(null);

  const [courses, setCourses] = useState<any[]>([
    {
      bg: "bg-gradient-to-r from-blue-500 to-indigo-500",
      title: "Bioinformatics",
      prof: "Prof. Stuart Churchill",
      type: "Course",
      major: "Undergraduate - Computer Science",
      img: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=100&h=100&fit=crop",
    },
    {
      bg: "bg-gradient-to-r from-cyan-500 to-blue-500",
      title: "Digital Image Processing",
      prof: "Prof. Lee Soo Wan",
      type: "Guided Project",
      major: "Undergraduate - Computer Science",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
    {
      bg: "bg-gradient-to-r from-indigo-500 to-purple-500",
      title: "Intro to Machine Learning",
      prof: "Prof. Andrew Ng",
      type: "Course",
      major: "Undergraduate - Computer Science",
      img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    },
    {
      bg: "bg-gradient-to-r from-sky-400 to-cyan-500",
      title: "Arabic for Beginner",
      prof: "Prof. Syed Ahmad",
      type: "Course",
      major: "Undergraduate - Cross Majors",
      img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [scheduleEvents, setScheduleEvents] = useState<any[]>([]);
  const [liveRooms, setLiveRooms] = useState<any[]>([
    { name: "Algorithms Prep", theme: "bg-indigo-50 border-indigo-100 text-indigo-600" },
    { name: "Final Year Project", theme: "bg-emerald-50 border-emerald-100 text-emerald-600" }
  ]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [firstName, setFirstName] = useState("Student");
  const [dailyQuote, setDailyQuote] = useState("Success is no accident. It is hard work, perseverance, learning, studying, sacrifice and most of all, love of what you are doing or learning to do. — Pelé");

  React.useEffect(() => {
    // Fetch courses
    api.get('/courses').then(res => {
      if (res.data && res.data.length > 0) {
        const gradients = [
          "bg-gradient-to-r from-blue-500 to-indigo-500",
          "bg-gradient-to-r from-cyan-500 to-blue-500",
          "bg-gradient-to-r from-indigo-500 to-purple-500",
          "bg-gradient-to-r from-sky-400 to-cyan-500",
          "bg-gradient-to-r from-emerald-500 to-teal-500",
        ];
        const mapped = res.data.map((enrollment: any, i: number) => ({
          _id: enrollment.courseId?._id,
          bg: gradients[i % gradients.length],
          title: enrollment.courseId?.title || "Unknown Course",
          prof: enrollment.courseId?.facultyId ? `Prof. ${enrollment.courseId.facultyId.lastName}` : "Unknown Professor",
          type: "Course",
          major: enrollment.courseId?.department || "General",
          img: enrollment.courseId?.facultyId?.profilePicture || `https://api.dicebear.com/7.x/notionists/svg?seed=${enrollment.courseId?._id}`,
        }));
        setCourses(mapped);
      }
    }).catch(console.error);

    // Fetch assignments
    api.get('/courses/assignments').then(res => {
      if (res.data) {
        // Map backend assignment to frontend format
        const mappedHw = res.data.map((a: any) => {
          const isCompleted = a.submissionStatus === 'Submitted';
          // highlight if due within 48h
          const dueDates = new Date(a.dueDate);
          const now = new Date();
          const diffHrs = (dueDates.getTime() - now.getTime()) / (1000 * 60 * 60);
          const isUrgent = diffHrs > 0 && diffHrs <= 48;
          
          return {
            id: a._id,
            title: a.courseId?.title || "Assignment",
            desc: a.title,
            date: `Due ${dueDates.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
            highlight: isUrgent,
            completed: isCompleted,
          };
        });
        setHomeworks(mappedHw);
      }
    }).catch(console.error);

    // Fetch schedule
    api.get('/schedule').then(res => {
      if (res.data) {
        const dayMap: Record<string, number> = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
        const colors = ["bg-blue-600", "bg-cyan-500", "bg-indigo-500", "bg-purple-500"];
        
        const mappedSchedule = res.data.map((s: any, i: number) => {
          const startParts = s.startTime.split(':');
          const endParts = s.endTime.split(':');
          const startHour = parseInt(startParts[0]);
          const endHour = parseInt(endParts[0]);
          
          // Map time to grid (Grid starts at 07:00, 10 hours total from 7 AM to 5 PM)
          // Actually 07 AM to 05 PM = 10 hours.
          const topPercent = Math.max(0, ((startHour - 7) / 10) * 100);
          const heightPercent = Math.max(5, ((endHour - startHour) / 10) * 100);
          
          return {
            id: s._id,
            title: s.courseId?.title || "Class",
            day: dayMap[s.dayOfWeek] || 0,
            top: `${topPercent}%`,
            height: `${heightPercent}%`,
            color: s.isSmartBlock ? "bg-amber-500" : colors[i % colors.length],
            time: `${s.startTime} - ${s.endTime}`,
            location: s.location || "TBA",
            isSmartBlock: s.isSmartBlock
          };
        });
        setScheduleEvents(mappedSchedule);
      }
    }).catch(console.error);

    // Fetch Study Rooms
    api.get('/study-rooms').then(res => {
      if (res.data && res.data.length > 0) {
        setLiveRooms(res.data);
      }
    }).catch(console.error);

    // Fetch Announcements
    api.get('/notices').then(res => {
      if (res.data) {
        setAnnouncements(res.data); // Show all with scrollbar
      }
    }).catch(console.error);

    // Fetch User Profile
    api.get('/students/me').then(res => {
      if (res.data?.firstName) {
        setFirstName(res.data.firstName);
      }
    }).catch(console.error);

    // Fetch AI Quote
    api.get('/tips?view=quote').then(res => {
      if (res.data?.tips && res.data.tips.length > 0) {
        setDailyQuote(res.data.tips[0]);
      }
    }).catch(console.error);

  }, []);

  const toggleHomework = (id: string) => {
    setHomeworks((prev) =>
      prev.map((hw) =>
        hw.id === id ? { ...hw, completed: !hw.completed } : hw
      )
    );
  };

  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [expandedAnnouncement, setExpandedAnnouncement] = useState<string | null>(null);

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const handleJoinRoom = (roomName: string) => {
    setActiveRoomName(roomName);
    setIsStudyRoomOpen(true);
  };

  const handleOpenClassmate = (classmate: any, mode: "profile" | "message") => {
    setSelectedClassmate(classmate);
    setClassmateModalMode(mode);
  };

  const [studyBuddies, setStudyBuddies] = useState<any[]>([]);
  const [loadingBuddies, setLoadingBuddies] = useState(false);

  React.useEffect(() => {
    setLoadingBuddies(true);
    api.get('/dashboard/study-buddies')
      .then(res => {
        if (res.data?.matches) {
          setStudyBuddies(res.data.matches);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingBuddies(false));
  }, []);

  return (
    <div className="flex-1 w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 pt-16 lg:pt-20 pb-20">
      <div className="max-w-[1400px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-3 space-y-8">
          {/* Homeworks */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
            <h3 className="text-[17px] font-bold text-slate-900 dark:text-white mb-6">
              Homeworks ({homeworks.filter(h => !h.completed).length})
            </h3>

            <div className="space-y-6 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
              {homeworks.map((hw) => (
                <div key={hw.id} className="flex gap-4 group cursor-pointer" onClick={() => toggleHomework(hw.id)}>
                  <div
                    className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border transition-colors",
                      hw.completed
                        ? "bg-green-50 border-green-100 dark:bg-green-500/10 dark:border-green-500/20 text-green-600 dark:text-green-400"
                        : hw.highlight
                          ? "bg-blue-50 border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20 text-blue-600 dark:text-blue-400"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 group-hover:border-blue-300",
                    )}
                  >
                    <CheckSquare className={cn("w-5 h-5", hw.completed ? "fill-current" : "")} />
                  </div>
                  <div className={cn("transition-all", hw.completed ? "opacity-50 line-through" : "")}>
                    <h4 className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight mb-1">
                      {hw.title}{" "}
                      <span className="font-medium text-slate-500">
                        • {hw.desc.split("•")[0]}
                      </span>
                    </h4>
                    <p className="text-[11px] font-medium text-slate-500 leading-tight mb-2 truncate max-w-[180px]">
                      {hw.desc.includes("•") ? hw.desc.split("•")[1] : hw.desc}
                    </p>
                    <p className={cn("text-[11px] font-bold", hw.completed ? "text-slate-500" : "text-blue-600 dark:text-blue-400")}>
                      {hw.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[17px] font-bold text-slate-900 dark:text-white">
                My Schedule
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentWeekOffset(prev => prev - 1)}
                  className="w-7 h-7 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition-colors"
                >
                  <ChevronDown className="w-4 h-4 rotate-90" />
                </button>
                <button 
                  onClick={() => setCurrentWeekOffset(prev => prev + 1)}
                  className="w-7 h-7 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition-colors"
                >
                  <ChevronDown className="w-4 h-4 -rotate-90" />
                </button>
              </div>
            </div>
            <p className="text-[13px] font-medium text-slate-500 mb-6">
              {new Date(2024, 11, 12 + currentWeekOffset * 7).getDate()}-{new Date(2024, 11, 18 + currentWeekOffset * 7).getDate()} Dec 2024
            </p>

            {/* Minimal Grid representation */}
            <div className="relative w-full h-[240px] border-t border-l border-slate-100 dark:border-slate-700/50 pt-2 select-none">
              <div className="grid grid-cols-7 gap-0 text-center mb-2">
                {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(
                  (day, i) => {
                    const date = new Date(2024, 11, 12 + i + currentWeekOffset * 7);
                    const isToday = currentWeekOffset === 0 && i === 2; // Arbitrary "today"
                    return (
                      <div
                        key={day}
                        className="text-[9px] font-bold text-slate-400"
                      >
                        {day}
                        <div className={cn("mt-1 w-6 h-6 mx-auto flex items-center justify-center rounded-full", isToday ? "bg-blue-600 text-white" : "text-slate-800 dark:text-slate-300")}>
                          {date.getDate()}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              <div className="absolute inset-x-0 top-12 bottom-0 flex">
                <div className="w-8 flex flex-col justify-between text-[8px] font-bold text-slate-400 pr-2 border-r border-slate-100 dark:border-slate-700/50 text-right">
                  <span>07 AM</span>
                  <span>09 AM</span>
                  <span>11 AM</span>
                  <span>01 PM</span>
                  <span>03 PM</span>
                  <span>05 PM</span>
                </div>
                <div className="flex-1 relative">
                  {currentWeekOffset === 0 && scheduleEvents.map((evt, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.05, zIndex: 10 }}
                      onClick={() => setSelectedEvent(evt)}
                      className={cn(
                        "absolute rounded opacity-90 cursor-pointer overflow-hidden p-1 text-[8px] font-bold text-white shadow-sm transition-all flex flex-col justify-between", 
                        evt.color,
                        evt.isSmartBlock && "animate-pulse ring-2 ring-amber-400 ring-offset-1 dark:ring-offset-slate-800"
                      )}
                      style={{ 
                        top: evt.top, 
                        left: `${(evt.day / 7) * 100}%`, 
                        width: "14%", 
                        height: evt.height 
                      }}
                    >
                      <div className="truncate">{evt.title}</div>
                      {evt.isSmartBlock && (
                        <div className="flex items-center gap-1 mt-0.5 text-[7px] text-amber-100">
                          <BrainCircuit className="w-2.5 h-2.5" /> AI Suggestion
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="border-t border-slate-300 dark:border-slate-500 w-full"
                      />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex justify-between pointer-events-none opacity-20">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <div
                        key={i}
                        className="border-l border-slate-300 dark:border-slate-500 h-full"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <AnimatePresence>
              {selectedEvent && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 relative"
                >
                  <button 
                    onClick={() => setSelectedEvent(null)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <ChevronDown className="w-4 h-4 rotate-180" />
                  </button>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{selectedEvent.title}</h4>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {selectedEvent.time}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {selectedEvent.location}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Middle Column */}
        <div className="lg:col-span-6 space-y-8">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-[2rem] p-8 relative overflow-hidden">
            <div className="relative z-10 w-2/3">
              <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-6">
                Welcome Back, {firstName}!
              </h2>
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-5 border border-white/50 dark:border-slate-700/50">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Quote of the Day
                </h4>
                <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium min-h-[40px]">
                  <TypewriterText text={dailyQuote} />
                </p>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 w-48 h-48 pointer-events-none">
              <motion.div 
                animate={{ y: [0, -10, 0], rotate: [12, 16, 12] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-4 right-10 w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-500/20"
              >
                <FileText className="w-10 h-10 text-white" />
              </motion.div>
              <motion.div 
                animate={{ y: [0, -8, 0], rotate: [-12, -8, -12] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-2 left-8 w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-lg border border-slate-100 dark:border-slate-700 font-bold text-blue-600"
              >
                En
              </motion.div>
              <motion.div 
                animate={{ y: [0, 8, 0], rotate: [6, 10, 6] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-8 right-2 w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg"
              >
                <Quote className="w-5 h-5 text-white" />
              </motion.div>
            </div>
          </div>

          {/* Active Study Rooms */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                Live Study Rooms
              </h3>
              <button 
                onClick={() => {
                  api.post('/study-rooms', { name: "New Study Session" })
                    .then(res => {
                      setLiveRooms(prev => [res.data, ...prev]);
                    })
                    .catch(console.error);
                }}
                className="text-[13px] font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Create Room
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              {liveRooms.map((room, idx) => (
                <motion.div
                  whileHover={{ y: -4 }}
                  key={idx}
                  onClick={() => handleJoinRoom(room.name)}
                  className={cn(
                    "p-5 rounded-2xl border cursor-pointer transition-colors hover:shadow-md",
                    room.theme?.split(' ')[0] || "bg-indigo-50",
                    room.theme?.split(' ').find((c:string) => c.startsWith('border-')) || "border-indigo-100",
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold text-slate-900 dark:text-white flex-1 pr-4">
                      {room.name}
                    </h4>
                    <span
                      className={cn(
                        "text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full bg-white dark:bg-slate-800",
                        room.theme?.split(' ').find((c:string) => c.startsWith('text-')) || "text-indigo-600",
                      )}
                    >
                      Live
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="flex -space-x-2">
                      {room.participants.map((pid: string, i: number) => (
                        <div
                          key={i}
                          className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white dark:border-slate-800 shadow-sm flex items-center justify-center overflow-hidden"
                        >
                          <img
                            src={room.hostId?.profilePicture || `https://api.dicebear.com/7.x/notionists/svg?seed=${pid}`}
                            alt="user"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    <button className="text-[13px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 hover:underline decoration-slate-400">
                      <Video className="w-4 h-4" /> Join Room
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Courses */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Recently Accessed Courses
              </h3>
              <button className="text-[13px] font-bold text-blue-600 hover:underline">
                See all
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {(() => {
                const totalPages = Math.ceil(courses.length / itemsPerPage);
                const paginatedCourses = courses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                return (
                  <>
                    {paginatedCourses.map((c, i) => (
                      <motion.div
                        whileHover={{ y: -4 }}
                        key={i}
                        onClick={() => {
                          setSelectedCourse(c);
                          if (setView) setView('course-details');
                        }}
                        className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700/50 cursor-pointer flex flex-col"
                      >
                        <div className={cn("h-32 relative", c.bg)}>
                          <button className="absolute top-4 right-4 text-white/80 hover:text-white">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="p-6 relative flex flex-col flex-1">
                          <div className="absolute -top-8 left-6 w-14 h-14 rounded-full border-4 border-white dark:border-slate-800 overflow-hidden bg-slate-200 shadow-sm">
                            <img
                              src={c.img}
                              className="w-full h-full object-cover"
                              alt={c.prof}
                            />
                          </div>
                          <div className="mt-8 flex-1">
                            <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight mb-1">
                              {c.title}
                            </h4>
                            <p className="text-[13px] font-medium text-slate-500 mb-6">
                              {c.prof}
                            </p>

                            <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-0.5">
                              {c.type}
                            </p>
                            <p className="text-[11px] font-medium text-slate-400 truncate mb-4">
                              {c.major}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setQuizCourse(c);
                            }}
                            className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[12px] font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                          >
                            <BrainCircuit className="w-4 h-4" /> Generate AI Quiz
                          </button>
                        </div>
                      </motion.div>
                    ))}
                    <div className="col-span-1 md:col-span-2">
                      <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-3 space-y-8">
          {/* Announcements */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
            <h3 className="text-[17px] font-bold text-slate-900 dark:text-white mb-6">
              Announcements
            </h3>

            <div className="space-y-6 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-cyan-200 dark:scrollbar-thumb-cyan-800">
              {announcements.map((ann, i) => {
                const isExpanded = expandedAnnouncement === ann.id;
                return (
                  <div 
                    key={i} 
                    className="flex gap-4 cursor-pointer group"
                    onClick={() => setExpandedAnnouncement(isExpanded ? null : ann.id)}
                  >
                    <div className="w-10 h-10 rounded-full bg-cyan-50 dark:bg-cyan-900/20 text-cyan-500 border border-cyan-100 dark:border-cyan-800/50 flex items-center justify-center shrink-0 group-hover:bg-cyan-100 transition-colors">
                      <span className="font-bold font-serif italic text-sm">
                        i
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight mb-1.5 group-hover:text-cyan-600 transition-colors">
                        {ann.title}
                      </h4>
                      <p className="text-[12px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed mb-3 transition-all duration-200">
                        {isExpanded ? ann.description : (ann.description?.length > 100 ? `${ann.description.substring(0, 100)}...` : ann.description)}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-slate-400">
                          {new Date(ann.date).toLocaleDateString('en-GB')}
                        </span>
                        <button 
                          onClick={(e) => handleMarkAsRead(ann.id, e)}
                          className="text-[11px] font-bold text-cyan-500 hover:underline"
                        >
                          Mark as read
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Recommended Study Buddies */}
          <div className="bg-gradient-to-br from-[#5b58ed]/10 to-purple-500/10 dark:from-[#5b58ed]/20 dark:to-purple-500/20 rounded-3xl p-6 shadow-sm border border-[#5b58ed]/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[17px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#5b58ed]" />
                Recommended Buddies
              </h3>
            </div>
            
            {loadingBuddies ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-white/50 dark:bg-slate-800/50 rounded-2xl" />
                ))}
              </div>
            ) : studyBuddies.length > 0 ? (
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#5b58ed]/30 dark:scrollbar-thumb-[#5b58ed]/40">
                {studyBuddies.map((c, i) => (
                  <div
                    key={i}
                    className="flex flex-col hover:bg-white dark:hover:bg-slate-800/80 p-3 rounded-2xl transition-all cursor-pointer group shadow-sm bg-white/50 dark:bg-slate-800/50 border border-white dark:border-slate-700"
                    onClick={() => handleOpenClassmate({ name: `${c.firstName} ${c.lastName}`, img: c.profilePicture }, "profile")}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={c.profilePicture || `https://api.dicebear.com/7.x/notionists/svg?seed=${c._id}`}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm"
                        alt={c.firstName}
                      />
                      <div className="flex-1">
                        <h4 className="text-[14px] font-bold text-slate-900 dark:text-white leading-tight">
                          {c.firstName} {c.lastName}
                        </h4>
                        <p className="text-[11px] font-medium text-slate-500">
                          {c.sharedCourses} Shared Course{c.sharedCourses > 1 ? 's' : ''}
                        </p>
                      </div>
                      <button
                        className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[#5b58ed] hover:bg-[#5b58ed]/10 transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenClassmate({ name: `${c.firstName} ${c.lastName}`, img: c.profilePicture }, "message");
                        }}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                    {c.matchReason && (
                      <p className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 p-2 rounded-xl italic">
                        {c.matchReason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No recommendations available at this time.</p>
            )}
          </div>
        </div>
      </div>
      <StudyRoomModal
        isOpen={isStudyRoomOpen}
        onClose={() => setIsStudyRoomOpen(false)}
        roomName={activeRoomName}
      />
      <ClassmateModal
        isOpen={!!selectedClassmate}
        onClose={() => setSelectedClassmate(null)}
        classmate={selectedClassmate}
        mode={classmateModalMode}
      />
      <AIQuizModal
        isOpen={!!quizCourse}
        onClose={() => setQuizCourse(null)}
        course={quizCourse}
      />
    </div>
  );
}
