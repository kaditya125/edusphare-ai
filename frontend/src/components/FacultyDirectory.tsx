import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  MapPin,
  Mail,
  BookOpen,
  MessageSquare,
  X,
  Send,
  Copy,
  Loader2,
  Sparkles,
  Star,
  LayoutGrid,
  Network,
  PenTool,
  ThumbsUp,
  Clock,
  Check,
  CalendarPlus,
} from "lucide-react";
import { cn } from "../lib/utils";
import api from "../services/api";
import { FacultyKnowledgeGraph } from "./FacultyKnowledgeGraph";
import { Pagination } from "./Pagination";

const HighlightText = ({
  text,
  highlight,
}: {
  text: string;
  highlight: string;
}) => {
  if (!highlight.trim()) return <>{text}</>;
  const regex = new RegExp(
    `(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi",
  );
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-amber-200 dark:bg-amber-500/30 text-inherit rounded-[2px] px-[1px] py-0"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
};

export function FacultyDirectory() {
  const [facultyData, setFacultyData] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [messagingFaculty, setMessagingFaculty] = useState<any | null>(null);
  const [message, setMessage] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    Record<string, { role: string; content: string; time: string }[]>
  >({});
  const [syncedOfficeHours, setSyncedOfficeHours] = useState<
    Record<string, boolean>
  >({});
  const [studentDept, setStudentDept] = useState<string | null>(null);
  const [isAISearching, setIsAISearching] = useState(false);
  const [hasAISearched, setHasAISearched] = useState(false);

  // New states for premium features
  const [viewMode, setViewMode] = useState<"grid" | "graph">("grid");
  const [bookingFaculty, setBookingFaculty] = useState<any | null>(null);
  const [draftingFaculty, setDraftingFaculty] = useState<any | null>(null);
  const [draftedEmail, setDraftedEmail] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<string | null>(null);

  const fetchFaculty = async () => {
    try {
      const res = await api.get('/faculty');
      const formatted = res.data.map((f: any) => ({
        ...f,
        id: f._id,
        name: `${f.designation.includes('Prof') ? '' : f.designation + ' '}${f.firstName} ${f.lastName}`.trim()
      }));
      setFacultyData(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFaculty();
    api.get('/student/me').then(res => {
      if (res.data && res.data.department) {
        setStudentDept(res.data.department);
      }
    }).catch(console.error);
  }, []);

  const handleAISearch = async () => {
    if (!searchQuery.trim()) {
      setHasAISearched(false);
      fetchFaculty();
      return;
    }
    setIsAISearching(true);
    setHasAISearched(true);
    try {
      const res = await api.post('/faculty/search', { query: searchQuery });
      const formatted = res.data.map((f: any) => ({
        ...f,
        id: f._id,
        name: `${f.designation.includes('Prof') ? '' : f.designation + ' '}${f.firstName} ${f.lastName}`.trim()
      }));
      setFacultyData(formatted);
    } catch (err) {
      console.error("AI Search failed", err);
    } finally {
      setIsAISearching(false);
    }
  };

  const handleEndorse = async (facultyId: string, trait: string) => {
    try {
      await api.post(`/faculty/${facultyId}/endorse`, { trait });
      fetchFaculty();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDraftIntro = async (faculty: any) => {
    setDraftingFaculty(faculty);
    setIsDrafting(true);
    setDraftedEmail("");
    try {
      const res = await api.post(`/faculty/${faculty.id}/draft-intro`, { studentDept });
      setDraftedEmail(res.data.email);
    } catch (err) {
      console.error("Draft error", err);
      setDraftedEmail("Failed to generate draft. Please try again.");
    } finally {
      setIsDrafting(false);
    }
  };

  const handleBookSlot = async (facultyId: string, day: string, startTime: string) => {
    try {
      await api.post(`/faculty/${facultyId}/book-office-hours`, { day, startTime });
      setBookingStatus(`Successfully booked for ${day} at ${startTime}!`);
      setTimeout(() => {
        setBookingStatus(null);
        setBookingFaculty(null);
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const departments = [
    "All",
    "Computer Science",
    "Data Science",
    "Cybersecurity",
  ];

  const handleSendMessage = async () => {
    if (!message.trim() || !messagingFaculty) return;

    const facultyId = messagingFaculty.id;
    const newMessage = { role: "user", content: message, time: "Just now" };

    setChatHistory((prev) => ({
      ...prev,
      [facultyId]: [...(prev[facultyId] || []), newMessage],
    }));

    const currentMessage = message;
    setMessage("");
    setIsChatLoading(true);

    try {
      const existingHistory = chatHistory[facultyId] || [];
      const res = await api.post(`/faculty/${facultyId}/chat`, { 
        prompt: currentMessage,
        history: existingHistory
      });
      setChatHistory((prev) => ({
        ...prev,
        [facultyId]: [
          ...(prev[facultyId] || []),
          {
            role: "faculty",
            content: res.data.response,
            time: "Just now",
          },
        ],
      }));
    } catch (error) {
      console.error("Chat error", error);
      setChatHistory((prev) => ({
        ...prev,
        [facultyId]: [
          ...(prev[facultyId] || []),
          {
            role: "faculty",
            content: "Sorry, I am currently unavailable.",
            time: "Just now",
          },
        ],
      }));
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSyncOfficeHours = (facultyId: string) => {
    setSyncedOfficeHours((prev) => ({ ...prev, [facultyId]: true }));
    setTimeout(() => {
      setSyncedOfficeHours((prev) => ({ ...prev, [facultyId]: false }));
    }, 3000);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-background p-8 relative">
      <div
        className={`max-w-6xl mx-auto space-y-8 transition-all ${messagingFaculty ? "pr-[350px]" : ""}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Faculty Directory
            </h1>
            <p className="text-slate-700 dark:text-slate-300 mt-1">
              Find and connect with university professors and staff.
            </p>
          </div>
          <div className="relative flex items-center w-full md:w-auto">
            <Search className="w-4 h-4 text-slate-500 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                 setSearchQuery(e.target.value);
                 setCurrentPage(1);
                 if (e.target.value === "") {
                    setHasAISearched(false);
                    fetchFaculty();
                 }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAISearch();
                }
              }}
              placeholder="Ask AI to find faculty..."
              className="pl-9 pr-12 py-2.5 rounded-xl bg-surface border border-border/50 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-500/50 w-full md:w-80 shadow-sm"
            />
            <button 
              onClick={handleAISearch}
              disabled={isAISearching}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
              title="AI Search"
            >
              {isAISearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Filters and View Toggle */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none flex-1">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => {
                  setFilter(dept);
                  setCurrentPage(1);
                }}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap",
                  filter === dept
                    ? "bg-primary-600 text-white shadow-md shadow-primary-500/20"
                    : "bg-surface border border-border/50 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-slate-100 hover:bg-slate-900/5 dark:hover:bg-white/5",
                )}
              >
                {dept}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-surface border border-border/50 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors",
                viewMode === "grid" ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              <LayoutGrid className="w-4 h-4" /> <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode("graph")}
              className={cn(
                "p-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors",
                viewMode === "graph" ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              <Network className="w-4 h-4" /> <span className="hidden sm:inline">Graph</span>
            </button>
          </div>
        </div>

        {viewMode === "graph" ? (
          <FacultyKnowledgeGraph 
            facultyData={facultyData.filter((f) => filter === "All" || f.department === filter)} 
            onNodeClick={(faculty) => setMessagingFaculty(faculty)}
          />
        ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {(() => {
              const filteredFaculty = facultyData
                .filter((f) => filter === "All" || f.department === filter)
                .filter(
                  (f) =>
                    hasAISearched ||
                    !searchQuery.trim() ||
                    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    f.department
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    f.designation
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    f.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    f.researchInterests.some((r: string) =>
                      r.toLowerCase().includes(searchQuery.toLowerCase()),
                    ),
                )
                .sort((a, b) => {
                   // Sort domain specialists to top if not in AI search mode (AI search naturally sorts by relevance)
                   if (!hasAISearched && studentDept) {
                      if (a.department === studentDept && b.department !== studentDept) return -1;
                      if (b.department === studentDept && a.department !== studentDept) return 1;
                   }
                   return 0;
                });

              const totalPages = Math.ceil(filteredFaculty.length / itemsPerPage);
              const paginatedFaculty = filteredFaculty.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

              return (
                <>
                  {paginatedFaculty.map((faculty, i) => (
                    <motion.div
                      layout
                      key={faculty.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="group p-6 rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/60 dark:border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] dark:hover:shadow-[0_20px_40px_rgb(0,0,0,0.5)] hover:-translate-y-1.5 transition-all duration-500 relative flex flex-col h-full overflow-hidden"
                    >
                      {/* Premium Ambient Blobs */}
                      <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-primary-400/20 to-purple-500/20 dark:from-primary-500/10 dark:to-purple-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-emerald-400/20 to-teal-500/20 dark:from-emerald-500/10 dark:to-teal-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                      <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />

                      <div className="flex items-start gap-4 relative z-10">
                        <div className="relative">
                          <img
                            src={faculty.avatar}
                            alt={faculty.name}
                            className="w-16 h-16 rounded-2xl object-cover bg-white dark:bg-slate-800 ring-4 ring-white/80 dark:ring-slate-800/80 shadow-lg group-hover:scale-105 transition-transform duration-500"
                          />
                          <div
                            className={cn(
                              "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-surface",
                              faculty.status === "available"
                                ? "bg-emerald-500"
                                : faculty.status === "busy"
                                  ? "bg-red-500"
                                  : "bg-slate-500",
                            )}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg flex items-center gap-2 flex-wrap">
                            <span className="line-clamp-1">
                              <HighlightText
                                text={faculty.name}
                                highlight={!hasAISearched ? searchQuery : ""}
                              />
                            </span>
                            {studentDept && faculty.department === studentDept && (
                               <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider shrink-0" title="Specialist in your domain">
                                 <Star className="w-3 h-3" /> Specialist
                               </span>
                            )}
                          </h3>
                          <p className="text-primary-600 dark:text-primary-400 text-sm font-medium">
                            <HighlightText
                              text={faculty.designation}
                              highlight={searchQuery}
                            />
                          </p>
                          <p className="text-slate-500 dark:text-slate-500 text-xs mt-0.5">
                            <HighlightText
                              text={faculty.department}
                              highlight={searchQuery}
                            />
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 space-y-3 relative z-10 flex-grow">
                        <div className="flex items-center gap-3 text-sm text-slate-800 dark:text-slate-200 group/email relative">
                          <Mail className="w-4 h-4 text-slate-500 dark:text-slate-500 shrink-0" />
                          <span className="truncate">
                            <HighlightText
                              text={faculty.email}
                              highlight={searchQuery}
                            />
                          </span>

                          {/* Quick Contact Popover */}
                          <div className="absolute left-0 bottom-full mb-2 hidden group-hover/email:block z-50">
                            <div className="bg-slate-900 border border-slate-700 text-white rounded-xl shadow-xl p-3 flex flex-col gap-2 min-w-[200px] animate-in fade-in zoom-in-95 duration-200">
                              <p className="text-[10px] font-bold text-slate-400/80 mb-1 uppercase tracking-widest px-1">
                                Quick Contact
                              </p>
                              <a
                                href={`mailto:${faculty.email}`}
                                className="flex items-center gap-2 text-[13px] hover:text-blue-400 hover:bg-slate-800 p-1.5 rounded-lg transition-colors"
                              >
                                <Send className="w-3.5 h-3.5" /> Send Email
                              </a>
                              <button
                                onClick={() =>
                                  navigator.clipboard.writeText(faculty.email)
                                }
                                className="flex items-center gap-2 text-[13px] hover:text-blue-400 hover:bg-slate-800 p-1.5 rounded-lg transition-colors text-left"
                              >
                                <Copy className="w-3.5 h-3.5" /> Copy Address
                              </button>
                            </div>
                            <div className="w-3 h-3 bg-slate-900 border-b border-r border-slate-700 rotate-45 absolute -bottom-1.5 left-4"></div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-800 dark:text-slate-200">
                          <MapPin className="w-4 h-4 text-slate-500 dark:text-slate-500 shrink-0" />
                          <span className="truncate">{faculty.location}</span>
                        </div>
                        <div className="flex items-start gap-3 flex-col sm:flex-row sm:items-center mt-4 pt-4 border-t border-border/50">
                          <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            <BookOpen className="w-3.5 h-3.5" />
                            Research Areas
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {faculty.researchInterests
                              .slice(0, 2)
                              .map((interest: any, idx: number) => (
                                <span
                                  key={idx}
                                  className="font-mono uppercase px-2 py-1 rounded-md bg-card border border-border/50 text-[9px] tracking-widest text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap"
                                >
                                  <HighlightText
                                    text={interest}
                                    highlight={searchQuery}
                                  />
                                </span>
                              ))}
                            {faculty.researchInterests.length > 2 && (
                              <span className="font-mono uppercase px-2 py-1 rounded-md bg-card border border-border/50 text-[9px] tracking-widest text-slate-500 dark:text-slate-500 font-medium">
                                +{faculty.researchInterests.length - 2}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Courses Taught */}
                        {faculty.coursesTaught && faculty.coursesTaught.length > 0 && (
                          <div className="flex items-start gap-3 flex-col sm:flex-row sm:items-center mt-3 pt-3 border-t border-border/50">
                            <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 whitespace-nowrap">
                              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                              Teaching
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {faculty.coursesTaught.map((course: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-[10px] text-blue-700 dark:text-blue-400 font-medium whitespace-nowrap cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-500/30 transition-colors"
                                >
                                  {course}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Endorsements */}
                        {faculty.endorsements && faculty.endorsements.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-border/50">
                            {faculty.endorsements.slice(0, 3).map((end: any, idx: number) => (
                              <button
                                key={idx}
                                onClick={() => handleEndorse(faculty.id, end.trait)}
                                className="group flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface border border-border/50 hover:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                              >
                                <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium group-hover:text-emerald-700 dark:group-hover:text-emerald-400">{end.trait}</span>
                                <span className="flex items-center justify-center bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 text-[9px] font-bold h-4 min-w-[16px] px-1 rounded-full transition-colors">{end.count}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-4 mt-4 border-t border-border/50 relative z-10">
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => setMessagingFaculty(faculty)}
                            className="w-full py-2.5 flex flex-col items-center justify-center gap-1 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 font-medium text-[11px] hover:bg-gradient-to-b hover:from-blue-50 hover:to-blue-100/50 dark:hover:from-blue-500/20 dark:hover:to-blue-600/10 hover:border-blue-200 dark:hover:border-blue-500/30 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-sm transition-all duration-300 backdrop-blur-sm group/btn"
                          >
                            <MessageSquare className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform duration-300" />
                            Chat
                          </button>
                          <button
                            onClick={() => handleDraftIntro(faculty)}
                            className="w-full py-2.5 flex flex-col items-center justify-center gap-1 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 font-medium text-[11px] hover:bg-gradient-to-b hover:from-amber-50 hover:to-amber-100/50 dark:hover:from-amber-500/20 dark:hover:to-amber-600/10 hover:border-amber-200 dark:hover:border-amber-500/30 hover:text-amber-600 dark:hover:text-amber-400 hover:shadow-sm transition-all duration-300 backdrop-blur-sm group/btn"
                          >
                            <PenTool className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform duration-300" />
                            Draft Intro
                          </button>
                          <button
                            onClick={() => setBookingFaculty(faculty)}
                            className="w-full py-2.5 flex flex-col items-center justify-center gap-1 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 font-medium text-[11px] hover:bg-gradient-to-b hover:from-emerald-50 hover:to-emerald-100/50 dark:hover:from-emerald-500/20 dark:hover:to-emerald-600/10 hover:border-emerald-200 dark:hover:border-emerald-500/30 hover:text-emerald-600 dark:hover:text-emerald-400 hover:shadow-sm transition-all duration-300 backdrop-blur-sm group/btn"
                          >
                            <CalendarPlus className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform duration-300" />
                            Book Slot
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  <div className="col-span-1 md:col-span-2 xl:col-span-3">
                    <Pagination 
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                </>
              );
            })()}
          </AnimatePresence>
        </motion.div>
        )}
      </div>

      {/* Messaging Panel */}
      <AnimatePresence>
        {messagingFaculty && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-[350px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col"
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={messagingFaculty.avatar}
                    alt={messagingFaculty.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div
                    className={cn(
                      "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900",
                      messagingFaculty.status === "available"
                        ? "bg-emerald-500"
                        : messagingFaculty.status === "busy"
                          ? "bg-red-500"
                          : "bg-slate-500",
                    )}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                    {messagingFaculty.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {messagingFaculty.designation}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMessagingFaculty(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/20">
              <div className="text-center">
                <span className="text-xs text-slate-400 font-medium bg-slate-200/50 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                  Today
                </span>
              </div>

              <div className="flex flex-col gap-1 items-start">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm p-3 shadow-sm inline-block max-w-[85%] text-sm text-slate-700 dark:text-slate-300">
                  Hello! How can I help you with your academic inquiries today?
                </div>
                <span className="text-[10px] text-slate-400 px-1">
                  10:00 AM
                </span>
              </div>

              {(chatHistory[messagingFaculty.id] || []).map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={cn(
                      "rounded-2xl p-3 shadow-sm inline-block max-w-[85%] text-sm",
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-tr-sm"
                        : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-tl-sm",
                    )}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-slate-400 px-1">
                    {msg.time}
                  </span>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex flex-col gap-1 items-start">
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm p-3 shadow-sm inline-block max-w-[85%] text-sm text-slate-700 dark:text-slate-300">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 border border-transparent focus-within:border-blue-500/50 transition-all">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg bg-blue-600 text-white disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 transition-colors"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
              <p className="text-center text-[10px] text-slate-400 mt-2">
                Usually responds within 24 hours
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Draft Intro Modal */}
      <AnimatePresence>
        {draftingFaculty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-amber-500" /> Draft Intro Email
                </h3>
                <button onClick={() => setDraftingFaculty(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                AI has drafted a warm introduction to Prof. {draftingFaculty.lastName} based on their research.
              </p>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 min-h-[200px] relative">
                {isDrafting ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-amber-500">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <span className="text-sm font-medium">AI is writing...</span>
                  </div>
                ) : (
                  <textarea
                    readOnly
                    value={draftedEmail}
                    className="w-full h-full min-h-[200px] bg-transparent resize-none focus:outline-none text-sm text-slate-700 dark:text-slate-300"
                  />
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setDraftingFaculty(null)} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                  Cancel
                </button>
                <button
                  disabled={isDrafting}
                  onClick={() => {
                    navigator.clipboard.writeText(draftedEmail);
                    setDraftingFaculty(null);
                  }}
                  className="px-4 py-2 flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <Copy className="w-4 h-4" /> Copy to Clipboard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Book Office Hours Modal */}
      <AnimatePresence>
        {bookingFaculty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CalendarPlus className="w-5 h-5 text-emerald-500" /> Book Office Hours
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">With Prof. {bookingFaculty.lastName}</p>
                </div>
                <button onClick={() => setBookingFaculty(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {bookingStatus ? (
                <div className="py-8 flex flex-col items-center justify-center text-emerald-500">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-4">
                    <Check className="w-8 h-8" />
                  </div>
                  <p className="font-medium text-center">{bookingStatus}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookingFaculty.officeHours && bookingFaculty.officeHours.length > 0 ? (
                    bookingFaculty.officeHours.map((slot: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-surface hover:border-emerald-500/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">{slot.day}</p>
                            <p className="text-xs text-slate-500">{slot.startTime} - {slot.endTime}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleBookSlot(bookingFaculty.id, slot.day, slot.startTime)}
                          className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-bold hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                        >
                          Book
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-slate-500 text-sm">
                      No office hours listed for this professor.
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
