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
} from "lucide-react";
import { cn } from "../lib/utils";
import { StudyRoomModal } from "./StudyRoomModal";
import { ClassmateModal } from "./ClassmateModal";

export function ILearn() {
  const [isStudyRoomOpen, setIsStudyRoomOpen] = useState(false);
  const [activeRoomName, setActiveRoomName] = useState("");
  const [selectedClassmate, setSelectedClassmate] = useState<any>(null);
  const [classmateModalMode, setClassmateModalMode] = useState<
    "profile" | "message"
  >("profile");

  const [homeworks, setHomeworks] = useState([
    {
      id: "1",
      title: "Bioinformatics",
      desc: "Hidden Markov Model for Multiple Sequence Al...",
      date: "Due 19 Dec 2024 23:59",
      highlight: true,
      completed: false,
    },
    {
      id: "2",
      title: "Intro to Machine Learning",
      desc: "CNN (Convolutional Neural Net...",
      date: "Due 24 Dec 2024 23:59",
      highlight: false,
      completed: false,
    },
    {
      id: "3",
      title: "Digital Image Processing",
      desc: "Team Final Project",
      date: "Due 25 Dec 2024 23:59",
      highlight: false,
      completed: false,
    },
  ]);

  const toggleHomework = (id: string) => {
    setHomeworks((prev) =>
      prev.map((hw) =>
        hw.id === id ? { ...hw, completed: !hw.completed } : hw
      )
    );
  };

  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const scheduleEvents = [
    { title: "Linear Algebra", day: 2, top: "20%", height: "20%", color: "bg-blue-600", time: "09:00 AM - 11:00 AM", location: "Room 304" },
    { title: "Machine Learning", day: 4, top: "40%", height: "30%", color: "bg-cyan-500", time: "11:00 AM - 02:00 PM", location: "Lab 2" },
    { title: "Study Group", day: 2, top: "70%", height: "25%", color: "bg-cyan-500", time: "02:00 PM - 04:30 PM", location: "Library" },
    { title: "Seminar", day: 6, top: "80%", height: "15%", color: "bg-blue-600", time: "03:00 PM - 04:30 PM", location: "Auditorium" },
  ];

  const handleJoinRoom = (roomName: string) => {
    setActiveRoomName(roomName);
    setIsStudyRoomOpen(true);
  };

  const handleOpenClassmate = (classmate: any, mode: "profile" | "message") => {
    setSelectedClassmate(classmate);
    setClassmateModalMode(mode);
  };

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

            <div className="space-y-6">
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
                      className={cn("absolute rounded opacity-90 cursor-pointer overflow-hidden p-1 text-[8px] font-bold text-white shadow-sm transition-all", evt.color)}
                      style={{ 
                        top: evt.top, 
                        left: `${(evt.day / 7) * 100}%`, 
                        width: "14%", 
                        height: evt.height 
                      }}
                    >
                      <div className="truncate">{evt.title}</div>
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
                Welcome Back, Robert!
              </h2>
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-5 border border-white/50 dark:border-slate-700/50">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Quotes of the Day
                </h4>
                <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  "Success is no accident. It is hard work, perseverance,
                  learning, studying, sacrifice and most of all, love of what
                  you are doing or learning to do." — Pelé, Brazilian pro
                  footballer
                </p>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 w-48 h-48 pointer-events-none">
              <div className="absolute top-4 right-10 w-24 h-24 bg-blue-600 rounded-3xl rotate-12 flex items-center justify-center shadow-xl shadow-blue-500/20">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <div className="absolute top-2 left-8 w-12 h-12 bg-white dark:bg-slate-800 rounded-xl -rotate-12 flex items-center justify-center shadow-lg border border-slate-100 dark:border-slate-700 font-bold text-blue-600">
                En
              </div>
              <div className="absolute bottom-8 right-2 w-10 h-10 bg-cyan-500 rounded-xl rotate-6 flex items-center justify-center shadow-lg">
                <Quote className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Active Study Rooms */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                Live Study Rooms
              </h3>
              <button className="text-[13px] font-bold text-blue-600 hover:underline flex items-center gap-1">
                <Plus className="w-4 h-4" /> Create Room
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              {[
                {
                  name: "Linear Algebra Finals Prep",
                  participants: 4,
                  host: "Jenny W.",
                  theme: "bg-indigo-50 dark:bg-indigo-500/10",
                  border: "border-indigo-100 dark:border-indigo-500/20",
                  text: "text-indigo-600 dark:text-indigo-400",
                },
                {
                  name: "ML Group Project Sync",
                  participants: 3,
                  host: "Jacob J.",
                  theme: "bg-emerald-50 dark:bg-emerald-500/10",
                  border: "border-emerald-100 dark:border-emerald-500/20",
                  text: "text-emerald-600 dark:text-emerald-400",
                },
              ].map((room, idx) => (
                <motion.div
                  whileHover={{ y: -4 }}
                  key={idx}
                  onClick={() => handleJoinRoom(room.name)}
                  className={cn(
                    "p-5 rounded-2xl border cursor-pointer transition-colors hover:shadow-md",
                    room.theme,
                    room.border,
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold text-slate-900 dark:text-white flex-1 pr-4">
                      {room.name}
                    </h4>
                    <span
                      className={cn(
                        "text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full bg-white dark:bg-slate-800",
                        room.text,
                      )}
                    >
                      Live
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="flex -space-x-2">
                      {[...Array(room.participants)].map((_, i) => (
                        <div
                          key={i}
                          className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white dark:border-slate-800 shadow-sm flex items-center justify-center overflow-hidden"
                        >
                          <img
                            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${room.host}${i}`}
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
              {[
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
              ].map((c, i) => (
                <motion.div
                  whileHover={{ y: -4 }}
                  key={i}
                  className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700/50 cursor-pointer"
                >
                  <div className={cn("h-32 relative", c.bg)}>
                    <button className="absolute top-4 right-4 text-white/80 hover:text-white">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-6 relative">
                    <div className="absolute -top-8 left-6 w-14 h-14 rounded-full border-4 border-white dark:border-slate-800 overflow-hidden bg-slate-200 shadow-sm">
                      <img
                        src={c.img}
                        className="w-full h-full object-cover"
                        alt={c.prof}
                      />
                    </div>
                    <div className="mt-8">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight mb-1">
                        {c.title}
                      </h4>
                      <p className="text-[13px] font-medium text-slate-500 mb-6">
                        {c.prof}
                      </p>

                      <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-0.5">
                        {c.type}
                      </p>
                      <p className="text-[11px] font-medium text-slate-400 truncate">
                        {c.major}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
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

            <div className="space-y-6">
              {[
                {
                  title: "Digital Image Processing",
                  desc: "Dear all, you can prepare the final project topic from now",
                  date: "19 Nov 2024",
                },
                {
                  title: "Intro to Machine Learning",
                  desc: "Always prepare student app before class to mark your attendance",
                  date: "09 Aug 2024",
                },
              ].map((ann, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-cyan-50 dark:bg-cyan-900/20 text-cyan-500 border border-cyan-100 dark:border-cyan-800/50 flex items-center justify-center shrink-0">
                    <span className="font-bold font-serif italic text-sm">
                      i
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight mb-1.5">
                      {ann.title}
                    </h4>
                    <p className="text-[12px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                      {ann.desc}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-slate-400">
                        {ann.date}
                      </span>
                      <button className="text-[11px] font-bold text-cyan-500 hover:underline">
                        Mark as read
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Classmates */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[17px] font-bold text-slate-900 dark:text-white">
                My Classmates
              </h3>
              <button className="text-[13px] font-bold text-blue-600 hover:underline">
                See all
              </button>
            </div>

            <div className="space-y-5">
              {[
                {
                  name: "Jenny Wilson",
                  img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
                  online: true,
                },
                {
                  name: "Cody Fisher",
                  img: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop",
                  online: false,
                },
                {
                  name: "Jacob Jones",
                  img: "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=100&h=100&fit=crop",
                  online: false,
                },
                {
                  name: "Annette Black",
                  img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
                  online: false,
                },
                {
                  name: "Savannah Nguyen",
                  img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
                  online: false,
                },
              ].map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 p-2 -mx-2 rounded-2xl transition-colors cursor-pointer group"
                  onClick={() => handleOpenClassmate(c, "profile")}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={c.img}
                        className="w-10 h-10 rounded-full object-cover"
                        alt={c.name}
                      />
                      {c.online && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-slate-900 dark:text-white leading-tight">
                        {c.name}
                      </h4>
                      <p
                        className="text-[11px] font-medium text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenClassmate(c, "profile");
                        }}
                      >
                        View profile
                      </p>
                    </div>
                  </div>
                  <button
                    className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenClassmate(c, "message");
                    }}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
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
    </div>
  );
}
