import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { apiCall } from "../lib/api";
import { Joyride, EventData, STATUS, Step } from "react-joyride";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Tooltip as RechartsTooltip, CartesianGrid, BarChart, Bar, Cell, AreaChart, Area } from 'recharts';
import { Skeleton } from "./Skeleton";
import { ActivityCalendar } from "./ActivityCalendar";
import { TodoWidget } from './widgets/TodoWidget';
import { LeaderboardWidget } from './widgets/LeaderboardWidget';
import { ActionAlerts } from './widgets/ActionAlerts';
import { QuickLinks } from './widgets/QuickLinks';
import { AIAdvisorWidget } from './widgets/AIAdvisorWidget';
import { ReportCardTemplate } from './widgets/ReportCardTemplate';
import { ReportPreviewModal } from './widgets/ReportPreviewModal';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  Plus,
  Info,
  Mail,
  CheckCircle2,
  Circle,
  ChevronDown,
  BookOpen,
  Target,
  TrendingUp,
  Zap,
  Settings,
  Download,
} from "lucide-react";
import { cn } from "../lib/utils";

const RadialProgress = ({
  progress,
  size = 60,
  strokeWidth = 6,
  color = "#5b58ed",
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-100 dark:text-slate-800"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[12px] font-bold text-slate-700 dark:text-slate-300">
        {progress}%
      </span>
    </div>
  );
};

const performanceData = [
  { name: "Quarter 1", score: 62, attendance: 92 },
  { name: "Quarter 2", score: 56, attendance: 85 },
  { name: "Half yearly", score: 60, attendance: 88 },
  { name: "Quarter 3", score: 58, attendance: 78 },
  { name: "Model", score: 72, attendance: 86 },
  { name: "Final exam", score: 98, attendance: 99 },
];

export function StudentDashboard() {
  const [runTour, setRunTour] = useState(false);
  const [isJoyrideOpen, setIsJoyrideOpen] = React.useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = React.useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const handleMarkAsRead = async (id: string) => {
    try {
      await apiCall(`/notifications/${id}/read`, { method: 'PUT' });
      refetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiCall('/notifications/read-all', { method: 'PUT' });
      refetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: () => apiCall("/students/me") });
  const { data: overview } = useQuery({ queryKey: ["overview"], queryFn: () => apiCall("/students/me/overview") });
  const { data: enrolledCourses } = useQuery({ queryKey: ["courses"], queryFn: () => apiCall("/courses/courses") });
  const { data: assignments } = useQuery({ queryKey: ["assignments"], queryFn: () => apiCall("/courses/assignments") });
  const { data: results } = useQuery({ queryKey: ["results"], queryFn: () => apiCall("/courses/exams/results") });
  const { data: notifications, refetch: refetchNotifications } = useQuery({ queryKey: ["notifications"], queryFn: () => apiCall("/notifications") });
  const { data: schedule } = useQuery({ queryKey: ["schedule"], queryFn: () => apiCall("/schedule") });
  
  // New queries for Overhaul
  const { data: performanceHistory } = useQuery({ queryKey: ["performanceHistory"], queryFn: () => apiCall("/dashboard/performance-history") });
  const { data: announcements } = useQuery({ queryKey: ["announcements"], queryFn: () => apiCall("/dashboard/announcements") });
  const { data: roadmap } = useQuery({ queryKey: ["roadmap"], queryFn: () => apiCall("/dashboard/roadmap") });
  const [searchQuery, setSearchQuery] = useState("");
  const { data: searchResults, isLoading: isSearchLoading } = useQuery({ 
    queryKey: ["search", searchQuery], 
    queryFn: () => apiCall(`/dashboard/search?q=${searchQuery}`),
    enabled: searchQuery.length > 2
  });

  const [perfStartYear, setPerfStartYear] = useState("2023");
  const [perfEndYear, setPerfEndYear] = useState("2024");
  const [detailScoreMonthOffset, setDetailScoreMonthOffset] = useState(0);

  const detailDate = new Date();
  detailDate.setMonth(detailDate.getMonth() + detailScoreMonthOffset);
  const detailDateString = detailDate.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });

  const filteredResults = React.useMemo(() => {
    if (!results) return [];
    return results.filter((r: any) => {
      if (!r.examId?.examDate) return true; // Include if no date
      const d = new Date(r.examId.examDate);
      return d.getMonth() === detailDate.getMonth() && d.getFullYear() === detailDate.getFullYear();
    });
  }, [results, detailScoreMonthOffset]);

  // Adjust performance history based on year selection for visual effect
  const filteredPerformanceHistory = React.useMemo(() => {
    if (!performanceHistory) return [];
    // Just a mock filter effect to show it's working
    if (perfStartYear === perfEndYear) {
      return performanceHistory.slice(0, 3);
    }
    return performanceHistory;
  }, [performanceHistory, perfStartYear, perfEndYear]);

  const isDataLoading = !profile || !overview || !enrolledCourses || !assignments || !results || !schedule || !performanceHistory || !announcements || !roadmap;

  React.useEffect(() => {
    if (!isDataLoading) {
      const timer = setTimeout(() => setIsLoading(false), 800);
      return () => clearTimeout(timer);
    }
  }, [isDataLoading]);

  const steps: Step[] = [
    {
      target: "#tour-student-switch",
      content:
        "Switch between students here to see their individual progress and schedules.",
    },
    {
      target: "#tour-current-courses",
      content: "View your ongoing courses and track your completion progress.",
    },
    {
      target: "#tour-overall-performance",
      content:
        "Check your overall performance and attendance trends across quarters.",
    },
    {
      target: "#tour-calendar-events",
      content:
        "Keep track of important dates, upcoming classes and exams here.",
      placement: "left",
    },
  ];

  useEffect(() => {
    // Run tour if hasn't been completed before
    const hasSeenTour = localStorage.getItem("dashboard-tour-completed");
    if (!hasSeenTour) {
      setRunTour(true);
    }
  }, []);

  const handleJoyrideCallback = (data: EventData) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRunTour(false);
      localStorage.setItem("dashboard-tour-completed", "true");
    }
  };

  return (
    <div className="flex-1 w-full h-full overflow-hidden flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 relative">
      <Joyride
        steps={steps}
        run={runTour}
        continuous={true}
        onEvent={handleJoyrideCallback}
        options={{
          primaryColor: "#5b58ed",
          textColor: "#334155",
          backgroundColor: "#ffffff",
          arrowColor: "#ffffff",
          overlayColor: "rgba(0, 0, 0, 0.4)",
        }}
        styles={{
          tooltipContainer: {
            textAlign: "left",
          },
          buttonPrimary: {
            backgroundColor: "#5b58ed",
            borderRadius: "8px",
          },
          buttonBack: {
            color: "#64748b",
          },
          buttonSkip: {
            color: "#64748b",
          },
        }}
      />
      {/* Top Bar Navigation */}
      <div className="relative z-30 flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 lg:pl-[280px] lg:pr-16 pointer-events-none">
        <div className="flex-1 max-w-lg pointer-events-auto">
          <div className="relative z-50">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses, faculty, assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-full py-2 pl-11 pr-4 text-sm outline-none placeholder:text-slate-500 font-medium text-slate-900 dark:text-white focus:ring-1 focus:ring-[#5b58ed] transition-all"
            />
            {searchQuery.length > 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 max-h-[400px] overflow-y-auto">
                {isSearchLoading ? (
                  <div className="p-4 text-sm text-slate-500 text-center">Searching...</div>
                ) : (
                  <>
                    {searchResults?.courses?.length > 0 && (
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Courses</div>
                        {searchResults.courses.map((c: any) => (
                          <div key={c._id} className="text-sm font-semibold text-slate-900 dark:text-white mb-1 hover:text-[#5b58ed] cursor-pointer">{c.title}</div>
                        ))}
                      </div>
                    )}
                    {searchResults?.faculty?.length > 0 && (
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Faculty</div>
                        {searchResults.faculty.map((f: any) => (
                          <div key={f._id} className="text-sm font-semibold text-slate-900 dark:text-white mb-1 hover:text-[#5b58ed] cursor-pointer">{f.firstName} {f.lastName}</div>
                        ))}
                      </div>
                    )}
                    {searchResults?.assignments?.length > 0 && (
                      <div className="px-4 py-2">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Assignments</div>
                        {searchResults.assignments.map((a: any) => (
                          <div key={a._id} className="text-sm font-semibold text-slate-900 dark:text-white mb-1 hover:text-[#5b58ed] cursor-pointer">{a.title}</div>
                        ))}
                      </div>
                    )}
                    {!searchResults?.courses?.length && !searchResults?.faculty?.length && !searchResults?.assignments?.length && (
                      <div className="p-4 text-sm text-slate-500 text-center">No results found</div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 pointer-events-auto">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700"
            >
              <Bell className="w-4 h-4" />
              {notifications?.some((n: any) => !n.isRead) && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <h3 className="font-bold text-slate-900 dark:text-white text-[14px]">Notifications</h3>
                  <button 
                    onClick={handleMarkAllAsRead}
                    className="text-[12px] font-semibold text-[#5b58ed] hover:text-indigo-600"
                  >
                    Mark all as read
                  </button>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications?.length === 0 ? (
                    <div className="p-4 text-center text-[13px] text-slate-500 font-medium">No new notifications</div>
                  ) : (
                    notifications?.map((notification: any) => (
                      <div 
                        key={notification._id}
                        onClick={() => {
                          if (!notification.isRead) handleMarkAsRead(notification._id);
                        }}
                        className={cn(
                          "px-4 py-3 border-b border-slate-100 dark:border-slate-700 last:border-0 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50",
                          !notification.isRead ? "bg-indigo-50/30 dark:bg-indigo-900/10" : ""
                        )}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex flex-col gap-1">
                            <h4 className={cn("text-[13px] font-bold", !notification.isRead ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300")}>
                              {notification.title}
                            </h4>
                            {notification.category && notification.category !== 'general' && (
                              <span className={cn("text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded w-max", 
                                notification.category === 'priority' ? "bg-red-100 text-red-600" :
                                notification.category === 'exam' ? "bg-amber-100 text-amber-600" :
                                notification.category === 'deadline' ? "bg-orange-100 text-orange-600" :
                                "bg-slate-100 text-slate-500"
                              )}>
                                {notification.category}
                              </span>
                            )}
                          </div>
                          {!notification.isRead && <div className="w-2 h-2 rounded-full bg-[#5b58ed] shrink-0 mt-1" />}
                        </div>
                        <p className="text-[12px] font-medium text-slate-500 leading-snug">{notification.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <button className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 border border-slate-200 dark:border-slate-700">
              <img
                src={profile?.profilePicture || `https://api.dicebear.com/7.x/notionists/svg?seed=${profile?.firstName}&backgroundColor=b6e3f4`}
                alt={profile?.firstName || "Profile"}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white hidden sm:block pr-2">
              {profile?.firstName || "Student"}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {isLoading ? (
          <div className="flex-1 flex w-full">
            <div className="flex-1 overflow-y-auto p-6 scrollbar-none flex flex-col gap-6">
              <div className="flex gap-4">
                 <Skeleton className="w-32 h-10 rounded-full" />
                 <Skeleton className="w-32 h-10 rounded-full" />
                 <div className="flex-1" />
                 <Skeleton className="w-32 h-10 rounded-lg" />
              </div>
              <Skeleton className="w-full h-[150px]" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 <Skeleton className="w-full h-32" />
                 <Skeleton className="w-full h-32" />
                 <Skeleton className="w-full h-32" />
                 <Skeleton className="w-full h-32" />
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-8 flex flex-col gap-6">
                   <Skeleton className="w-full h-[350px]" />
                   <Skeleton className="w-full h-[250px]" />
                </div>
                <div className="col-span-1 md:col-span-1 xl:col-span-4 flex flex-col gap-6">
                   <Skeleton className="w-full h-[350px]" />
                   <Skeleton className="w-full h-[250px]" />
                </div>
              </div>
            </div>
            <div className="w-[320px] shrink-0 border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-6 hidden lg:flex flex-col gap-6">
              <Skeleton className="w-full h-24" />
              <Skeleton className="w-full h-[300px]" />
              <Skeleton className="w-full h-[400px]" />
            </div>
          </div>
        ) : (
          <>
            {/* Left Side (Scrollable) */}
            <div id="dashboard-content" className="flex-1 overflow-y-auto p-6 scrollbar-none">
              <ActionAlerts performanceHistory={performanceHistory} assignments={assignments} />

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 mt-2">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <img
                      src={profile?.profilePicture || "https://ui-avatars.com/api/?name=Student"}
                      className="w-20 h-20 rounded-2xl object-cover shadow-lg border-4 border-white dark:border-slate-800"
                      alt="Student"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#5b58ed] rounded-xl flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800">
                      <span className="text-white text-xs font-bold">LVL</span>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                      Welcome back, {profile?.firstName} 👋
                    </h1>
                    <p className="text-slate-500 font-medium text-sm">
                      You have <span className="text-[#5b58ed] font-bold">{assignments?.filter((a: any) => new Date(a.dueDate) > new Date()).length || 0} assignments</span> due this week. Keep up the good work!
                    </p>
                  </div>
                </div>
                
                <button onClick={() => setIsReportModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all w-max shrink-0 text-sm">
                  <Download className="w-4 h-4" />
                  <span>Generate Official Report</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div id="tour-student-switch" className="flex items-center gap-3">
              <button
                className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#5b58ed] text-[#5b58ed] bg-indigo-50 dark:bg-indigo-500/10 shadow-sm text-sm font-semibold transition-all"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200">
                  <img
                    src={profile?.profilePicture || `https://api.dicebear.com/7.x/notionists/svg?seed=${profile?.firstName}&backgroundColor=b6e3f4`}
                    className="w-full h-full object-cover"
                    alt={profile?.firstName}
                  />
                </div>
                {profile?.firstName} {profile?.lastName}
              </button>
              <button className="flex items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors group">
                <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
              </button>
            </div>

          </div>

          {/* AI Advisor Widget */}
          <AIAdvisorWidget />
          
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
            {/* Semester Goals */}
            <div className="xl:col-span-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-[15px] flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-500" />
                  Semester Goals
                </h3>
                <button className="text-sm font-semibold text-[#5b58ed] hover:text-indigo-600 transition-colors">
                  Edit Goals
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-6 p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <RadialProgress progress={(overview?.cgpa / 10) * 100 || 0} color="#10b981" size={70} strokeWidth={6} />
                  <div>
                    <h4 className="text-[14px] font-bold text-slate-900 dark:text-white mb-1">Target CGPA: 9.0</h4>
                    <p className="text-[12px] font-medium text-slate-500 mb-2">Current CGPA: {overview?.cgpa}</p>
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20 px-2.5 py-1 rounded-full">
                      <TrendingUp className="w-3.5 h-3.5" /> On Track
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <RadialProgress progress={((overview?.creditsEarned || 0) / ((overview?.creditsEarned || 0) + (overview?.creditsRemaining || 1))) * 100} color="#f59e0b" size={70} strokeWidth={6} />
                  <div>
                    <h4 className="text-[14px] font-bold text-slate-900 dark:text-white mb-1">Credits: {overview?.creditsEarned} / {(overview?.creditsEarned || 0) + (overview?.creditsRemaining || 0)}</h4>
                    <p className="text-[12px] font-medium text-slate-500 mb-2">Completion status</p>
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/20 px-2.5 py-1 rounded-full">
                      <Zap className="w-3.5 h-3.5" /> Keep Going
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Courses Status */}
            <div
              id="tour-current-courses"
              className="xl:col-span-12 flex flex-col mb-2"
            >
              <h3 className="font-bold text-slate-900 dark:text-white text-[15px] mb-4">
                Current Courses Status
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {enrolledCourses?.slice(0, 4).map((enrollment: any, idx: number) => {
                  const course = enrollment.courseId;
                  const progress = Math.floor(Math.random() * 40) + 60; // Mock progress for UI since schema doesn't have course completion %
                  const colors = ["#5b58ed", "#f59e0b", "#10b981", "#3b82f6"];
                  return (
                  <div
                    key={idx}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex items-center gap-5 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors group cursor-pointer"
                  >
                    <RadialProgress
                      progress={progress}
                      color={colors[idx % colors.length]}
                    />
                    <div>
                      <h4 className="text-[14px] font-bold text-slate-900 dark:text-white leading-tight mb-1 group-hover:text-[#5b58ed] transition-colors line-clamp-1">
                        {course?.title || "Unknown Course"}
                      </h4>
                      <p className="text-[12px] font-medium text-slate-500">
                        {course?.courseCode || "N/A"}
                      </p>
                    </div>
                  </div>
                )})}
              </div>
            </div>

            {/* Detail Scores */}
            <div className="xl:col-span-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 dark:text-white text-[15px]">
                  Detail scores
                </h3>
                <div className="flex items-center gap-2 font-semibold text-[13px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600">
                  <button onClick={() => setDetailScoreMonthOffset(prev => prev - 1)} className="hover:text-slate-900 dark:hover:text-white">
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="min-w-[70px] text-center">{detailDateString}</span>
                  <button onClick={() => setDetailScoreMonthOffset(prev => prev + 1)} className="hover:text-slate-900 dark:hover:text-white">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Custom Radial Chart Mockup */}
              <div className="flex-1 flex flex-col justify-center items-center relative min-h-[220px]">
                <div className="w-full h-full flex justify-center items-center scale-90 sm:scale-100">
                  <svg
                    width="240"
                    height="240"
                    viewBox="0 0 240 240"
                    className="-ml-10"
                  >
                    {/* Grid circles */}
                    <circle
                      cx="120"
                      cy="120"
                      r="100"
                      fill="none"
                      stroke="currentColor"
                      className="text-slate-100 dark:text-slate-700"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <circle
                      cx="120"
                      cy="120"
                      r="80"
                      fill="none"
                      stroke="currentColor"
                      className="text-slate-100 dark:text-slate-700"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <circle
                      cx="120"
                      cy="120"
                      r="60"
                      fill="none"
                      stroke="currentColor"
                      className="text-slate-100 dark:text-slate-700"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <circle
                      cx="120"
                      cy="120"
                      r="40"
                      fill="none"
                      stroke="currentColor"
                      className="text-slate-100 dark:text-slate-700"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <circle
                      cx="120"
                      cy="120"
                      r="20"
                      fill="none"
                      stroke="currentColor"
                      className="text-slate-100 dark:text-slate-700"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />

                    {/* Data lines */}
                    <path
                      d="M 120 120 L 195 60"
                      stroke="#5b58ed"
                      strokeWidth="2"
                      opacity="0.2"
                    />
                    <path
                      d="M 120 120 L 160 170"
                      stroke="#5b58ed"
                      strokeWidth="2"
                      opacity="0.2"
                    />
                    <path
                      d="M 120 120 L 60 150"
                      stroke="#5b58ed"
                      strokeWidth="2"
                      opacity="0.2"
                    />
                    <path
                      d="M 120 120 L 60 100"
                      stroke="#5b58ed"
                      strokeWidth="2"
                      opacity="0.2"
                    />
                    <path
                      d="M 120 120 L 120 200"
                      stroke="#5b58ed"
                      strokeWidth="2"
                      opacity="0.2"
                    />

                    {/* Dots */}
                    <circle
                      cx="195"
                      cy="60"
                      r="4"
                      fill="#fff"
                      stroke="#5b58ed"
                      strokeWidth="2"
                    />
                    <circle
                      cx="160"
                      cy="170"
                      r="4"
                      fill="#fff"
                      stroke="#5b58ed"
                      strokeWidth="2"
                    />
                    <circle
                      cx="60"
                      cy="150"
                      r="4"
                      fill="#fff"
                      stroke="#5b58ed"
                      strokeWidth="2"
                    />
                    <circle
                      cx="60"
                      cy="100"
                      r="4"
                      fill="#fff"
                      stroke="#5b58ed"
                      strokeWidth="2"
                    />
                    <circle
                      cx="120"
                      cy="200"
                      r="4"
                      fill="#fff"
                      stroke="#5b58ed"
                      strokeWidth="2"
                    />

                    <text
                      x="230"
                      y="25"
                      fontSize="10"
                      fill="currentColor"
                      className="text-slate-400 font-bold"
                    >
                      100 %
                    </text>
                    <text
                      x="230"
                      y="45"
                      fontSize="10"
                      fill="currentColor"
                      className="text-slate-400 font-bold"
                    >
                      80 %
                    </text>
                    <text
                      x="230"
                      y="65"
                      fontSize="10"
                      fill="currentColor"
                      className="text-slate-400 font-bold"
                    >
                      60 %
                    </text>
                    <text
                      x="230"
                      y="85"
                      fontSize="10"
                      fill="currentColor"
                      className="text-slate-400 font-bold"
                    >
                      40 %
                    </text>
                    <text
                      x="230"
                      y="105"
                      fontSize="10"
                      fill="currentColor"
                      className="text-slate-400 font-bold"
                    >
                      20 %
                    </text>
                  </svg>

                  {/* Labels absolute positioned relative to svg container */}
                  {filteredResults.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-[13px] font-bold text-slate-400">
                      No exams this month
                    </div>
                  ) : (
                    filteredResults.slice(0, 5).map((result: any, i: number) => {
                      const positions = [
                        { top: "18%", left: "25%" },
                        { top: "28%", left: "-10%" },
                        { top: "48%", left: "-15%" },
                        { top: "68%", left: "8%" },
                        { bottom: "8%", left: "20%" }
                      ];
                      const pos = positions[i] || positions[0];
                      return (
                        <div key={result._id} className="absolute flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-[12px] font-bold text-slate-700 dark:text-slate-300" style={pos}>
                          {result.examId?.courseId?.courseCode || result.examId?.courseId?.title?.split(' ')[0] || "Subject"}{" "}
                          <span className="text-slate-900 dark:text-white">{(result.marksObtained / (result.examId?.totalMarks || 100) * 100).toFixed(0)} %</span>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center gap-3">
                <div className="font-serif italic text-2xl px-2 text-slate-400">
                  {enrolledCourses?.[0]?.courseId?.facultyId?.firstName || "Faculty"}
                </div>
                <div>
                  <div className="text-[14px] font-bold text-slate-900 dark:text-white">
                    {enrolledCourses?.[0]?.courseId?.facultyId?.firstName} {enrolledCourses?.[0]?.courseId?.facultyId?.lastName}
                  </div>
                  <div className="text-[11px] font-medium text-slate-500">
                    Class Tutor
                  </div>
                </div>
              </div>
            </div>

            {/* Overall Performance Line Chart */}
            <div
              id="tour-overall-performance"
              className="xl:col-span-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col relative w-full h-[380px] xl:h-auto overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-[15px] mb-4 sm:mb-0">
                  Overall performance
                </h3>
                <div className="flex items-center gap-2">
                  <select 
                    value={perfStartYear}
                    onChange={(e) => setPerfStartYear(e.target.value)}
                    className="flex items-center font-semibold text-[13px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 outline-none cursor-pointer"
                  >
                    <option value="2022">2022</option>
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                  </select>
                  <span className="text-sm font-semibold text-slate-400">
                    to
                  </span>
                  <select 
                    value={perfEndYear}
                    onChange={(e) => setPerfEndYear(e.target.value)}
                    className="flex items-center font-semibold text-[13px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 outline-none cursor-pointer"
                  >
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end items-center gap-6 text-[12px] font-bold text-slate-500 mb-6">
                <div className="flex items-center gap-2">
                  <span>Avg. exam score</span>
                  <div className="w-3 h-3 rounded-full border-2 border-[#5b58ed] bg-white dark:bg-slate-800" />
                  <span className="text-slate-900 dark:text-white">64 %</span>
                </div>
                <div className="flex items-center gap-1 font-normal text-slate-300 dark:text-slate-600">
                  /
                </div>
                <div className="flex items-center gap-2">
                  <span>Avg. attendance</span>
                  <div className="w-3 h-3 rounded-full border-2 border-emerald-400 bg-white dark:bg-slate-800" />
                  <span className="text-slate-900 dark:text-white">86 %</span>
                </div>
              </div>

              <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={filteredPerformanceHistory}
                    margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(148, 163, 184, 0.2)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }}
                      tickFormatter={(val) => `${val}%`}
                      ticks={[0, 25, 50, 75, 100]}
                    />
                    <RechartsTooltip
                      wrapperStyle={{ outline: "none" }}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-lg">
                              <p className="text-[13px] font-bold text-slate-900 dark:text-white mb-2">
                                {label}
                              </p>
                              {payload.map((entry: any, index: number) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-3 text-[12px] font-semibold text-slate-600 dark:text-slate-300"
                                >
                                  <span>
                                    {entry.name === "score"
                                      ? "Exam score"
                                      : "Attendance"}
                                  </span>
                                  <div className="flex items-center gap-1.5 ml-auto">
                                    <div
                                      className={cn(
                                        "w-2.5 h-2.5 rounded-full border-2 bg-white",
                                        entry.color === "#5b58ed"
                                          ? "border-[#5b58ed]"
                                          : "border-emerald-400",
                                      )}
                                    />
                                    <span className="text-slate-900 dark:text-white">
                                      {entry.value} %
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#5b58ed"
                      strokeWidth={2.5}
                      dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="attendance"
                      stroke="#34d399"
                      strokeWidth={2.5}
                      dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                {/* Selection box mockup visual */}
                <div className="absolute top-0 bottom-6 left-[62%] right-[22%] bg-indigo-500/5 dark:bg-indigo-500/10 pointer-events-none" />
              </div>
            </div>
            
            {/* Activity Calendar */}
            <div className="xl:col-span-8">
               <ActivityCalendar />
            </div>

            {/* Leaderboard Widget */}
            <div className="xl:col-span-4">
              <LeaderboardWidget />
            </div>

            {/* Todo Widget */}
            <div className="xl:col-span-4 h-[350px]">
              <TodoWidget />
            </div>

            {/* Quick Links */}
            <div className="xl:col-span-8 h-[350px]">
              <QuickLinks />
            </div>

            {/* Academic Roadmap */}
            <div className="xl:col-span-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-slate-900 dark:text-white text-[15px]">
                  Academic Roadmap
                </h3>
              </div>

              <div className="w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                <div className="min-w-[700px] h-[100px] relative flex md:mx-4 mx-2">
                  <svg
                    className="absolute top-[20px] left-[5%] right-[5%] w-[90%] h-1"
                    preserveAspectRatio="none"
                  >
                    <line
                      x1="0"
                      y1="2"
                      x2="100%"
                      y2="2"
                      stroke="currentColor"
                      className="text-slate-100 dark:text-slate-700"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <line
                      x1="0"
                      y1="2"
                      x2="50%"
                      y2="2"
                      stroke="#5b58ed"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>

                  <div className="w-full flex justify-between relative z-10">
                    {roadmap?.map((item: any, idx: number) => {
                      const isComplete = item.status === 'Complete';
                      const isInProgress = item.status === 'In Progress';
                      const isUpcoming = item.status === 'Upcoming';

                      return (
                        <div key={item._id} className="flex flex-col items-center">
                          {isComplete && (
                            <div className="w-10 h-10 rounded-full bg-[#5b58ed] border-[3px] border-white dark:border-slate-800 flex items-center justify-center shadow-md">
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            </div>
                          )}
                          {isInProgress && (
                            <div className="w-10 h-10 rounded-full border-[3px] border-[#5b58ed] bg-white dark:bg-slate-800 flex items-center justify-center shadow-lg relative z-20 shadow-indigo-500/20">
                              <div className="absolute inset-0 bg-[#5b58ed] opacity-20 rounded-full animate-ping" />
                              <div className="w-3.5 h-3.5 bg-[#5b58ed] rounded-full" />
                            </div>
                          )}
                          {isUpcoming && (
                            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 border-[3px] border-slate-200 dark:border-slate-700 flex items-center justify-center">
                              <Circle className="w-3.5 h-3.5 fill-slate-300 dark:fill-slate-600 text-slate-300 dark:text-slate-600" />
                            </div>
                          )}
                          <div className={cn("text-center mt-3", isInProgress && "relative z-20")}>
                            <p className={cn("text-[13px] font-bold", 
                                isComplete ? "text-slate-900 dark:text-white" : 
                                isInProgress ? "text-[14px] font-black text-[#5b58ed]" : 
                                "text-slate-500 dark:text-slate-400"
                              )}>
                              {item.title}
                            </p>
                            <p className={cn("text-[11px] mt-1 inline-block", 
                                isComplete ? "font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full" :
                                isInProgress ? "font-bold text-slate-600 dark:text-slate-300 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-500/20" :
                                "font-semibold text-slate-400 dark:text-slate-500"
                              )}>
                              {item.statusLabel || item.status}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Motivation Quote Card */}
            <div className="xl:col-span-4 bg-[#5b58ed] rounded-2xl p-6 shadow-sm text-white relative overflow-hidden group">
              <div className="absolute top-4 left-4 w-4 h-4 text-white/50">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M14 11c0 2.76-2.24 5-5 5H8v2h1c3.86 0 7-3.14 7-7V9h-3v2zm-2-2h-3V7h3v2zm6 0h-3V7h3v2zm0 2h-3v2h1c2.76 0 5-2.24 5-5H18v3z" />
                </svg>
              </div>
              <div className="flex justify-between items-center mb-6 pl-6">
                <span className="text-[12px] font-bold uppercase tracking-wider text-white/80">
                  A Note
                </span>
                <div className="w-5 h-5 bg-[#ffb946] rounded-full flex items-center justify-center p-1">
                  <CheckCircle2 className="w-full h-full text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold leading-tight mb-8">
                "He keeps improving, ready for more success."
              </h3>
              <div className="flex gap-3 text-[13px] font-semibold text-white/80">
                <span>#Disciplined</span>
                <span>#Hard-working</span>
              </div>
            </div>

            {/* Announcements */}
            <div className="xl:col-span-8 flex flex-col">
              <h3 className="font-bold text-slate-900 dark:text-white text-[15px] mb-4">
                Announcements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {announcements?.map((ann: any, i: number) => (
                  <div
                    key={i}
                    className="rounded-2xl overflow-hidden relative h-40 group cursor-pointer shadow-sm"
                  >
                    <img
                      src={ann.image}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      alt={ann.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />

                    <div className="absolute top-3 left-0 flex overflow-hidden rounded-r-lg">
                      <div
                        className={cn(
                          "px-2 py-1 text-[10px] font-bold text-white",
                          ann.color,
                        )}
                      >
                        {ann.badge}
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[10px] font-bold text-white">
                      {new Date(ann.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      <h4 className="text-white font-bold text-[14px] leading-tight mb-1 flex items-center justify-between">
                        {ann.title}{" "}
                        <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                      </h4>
                      <p className="text-white/70 text-[11px] font-medium leading-tight">
                        {ann.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Class Faculties */}
            <div className="xl:col-span-12 mt-4 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-[15px]">
                  Class faculties
                </h3>
                <div className="flex items-center gap-2 text-slate-500 text-[13px] font-bold">
                  <span>(1/3)</span>
                  <button className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from(new Map(enrolledCourses?.map((e: any) => [e.courseId?.facultyId?._id, e.courseId?.facultyId])).values()).filter(Boolean).map((fac: any, i: number) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm flex flex-col gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                        <img
                          src={fac.profilePicture || `https://api.dicebear.com/7.x/notionists/svg?seed=${fac.firstName}&backgroundColor=b6e3f4`}
                          alt={fac.firstName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-[14px] font-bold text-slate-900 dark:text-white leading-tight">
                          {fac.firstName} {fac.lastName}
                        </h4>
                        <p className="text-[11px] font-medium text-slate-500">
                          {fac.designation} • {fac.department}
                        </p>
                      </div>
                    </div>
                    <button className="w-full py-2 flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 rounded-lg text-[13px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      <Mail className="w-4 h-4" /> Email
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side (Calendar & Events) */}
        <div
          id="tour-calendar-events"
          className="w-[320px] shrink-0 border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-6 overflow-y-auto hidden lg:block"
        >
          {/* Upcoming Alert */}
          {assignments?.filter((a: any) => new Date(a.dueDate) > new Date() && !a.isRead).length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-700/30 rounded-xl p-3 flex items-start gap-2 mb-8 text-amber-700 dark:text-amber-500 shadow-sm">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-[13px] font-bold leading-snug">
                You have {assignments.filter((a: any) => new Date(a.dueDate) > new Date()).length} upcoming assignment(s)!
              </p>
            </div>
          )}

          <h3 className="text-[15px] font-bold text-slate-900 dark:text-white mb-6">
            Classes & events
          </h3>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-[14px] text-slate-800 dark:text-slate-200">
                {selectedDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </span>
              <div className="flex gap-1">
                <button 
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setMonth(newDate.getMonth() - 1);
                    setSelectedDate(newDate);
                  }}
                  className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-500 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setMonth(newDate.getMonth() + 1);
                    setSelectedDate(newDate);
                  }}
                  className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-500 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 text-center gap-y-3 gap-x-1">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div
                  key={day}
                  className="text-[11px] font-bold text-slate-400 mb-2"
                >
                  {day}
                </div>
              ))}

              {Array.from({ length: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay() }).map((_, i) => (
                 <div key={`empty-${i}`} />
              ))}

              {Array.from({ length: new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                const day = i + 1;
                const currentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
                const isSelected = currentDate.toDateString() === selectedDate.toDateString();
                const isToday = currentDate.toDateString() === new Date().toDateString();

                const hasSchedule = schedule?.some((s: any) => s.dayOfWeek === currentDate.getDay());
                const hasAssignment = assignments?.some((a: any) => new Date(a.dueDate).toDateString() === currentDate.toDateString());

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDate(currentDate)}
                    className={cn(
                      "relative text-[13px] font-bold h-8 flex items-center justify-center rounded-full cursor-pointer transition-colors",
                      isSelected ? "bg-[#5b58ed] text-white shadow-sm border border-[#5b58ed]" : 
                      isToday ? "text-[#5b58ed] border-2 border-[#5b58ed]" : 
                      "text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                    )}
                  >
                    {day}
                    {(hasSchedule || hasAssignment) && (
                      <div className="absolute bottom-1 flex gap-0.5">
                        {hasSchedule && <div className={cn("w-1 h-1 rounded-full", isSelected ? "bg-white" : "bg-emerald-400")} />}
                        {hasAssignment && <div className={cn("w-1 h-1 rounded-full", isSelected ? "bg-white" : "bg-amber-400")} />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
            <div className="text-[13px] font-bold text-slate-900 dark:text-white mb-6">
              {selectedDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>

            <div className="relative space-y-6 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              
              {/* Daily Schedule */}
              {schedule?.filter((s: any) => s.dayOfWeek === selectedDate.getDay()).map((session: any, idx: number) => (
                <div key={session._id} className="relative flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-[3px] border-emerald-400 flex items-center justify-center z-10 shrink-0 mt-0.5">
                    <Circle className="w-2.5 h-2.5 fill-emerald-400 text-emerald-400 hidden" />
                  </div>
                  <div className="flex-1 pb-4 border-b border-slate-200 dark:border-slate-800 border-dashed">
                    <h4 className="text-[14px] font-bold text-slate-900 dark:text-white leading-tight mb-1">
                      {session.courseId?.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[12px] font-medium text-slate-500">
                      <span>{session.startTime} - {session.endTime}</span> 
                      <span>{session.room}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Assignments Due */}
              {assignments?.filter((a: any) => new Date(a.dueDate).toDateString() === selectedDate.toDateString()).map((assignment: any) => (
                <div key={assignment._id} className="relative flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-[3px] border-[#5b58ed] flex items-center justify-center z-10 shrink-0 mt-0.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#5b58ed]" />
                  </div>
                  <div className="flex-1 pb-4 border-b border-slate-200 dark:border-slate-800 border-dashed">
                    <h4 className="text-[14px] font-bold text-[#5b58ed] leading-tight mb-1">
                      {assignment.title} (Due)
                    </h4>
                    <div className="flex items-center gap-2 text-[12px] font-medium text-slate-500">
                      <span>{new Date(assignment.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className={cn("px-2 rounded-full", assignment.submissionStatus === 'Submitted' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600')}>{assignment.submissionStatus}</span>
                    </div>
                  </div>
                </div>
              ))}

              {schedule?.filter((s: any) => s.dayOfWeek === selectedDate.getDay()).length === 0 && 
               assignments?.filter((a: any) => new Date(a.dueDate).toDateString() === selectedDate.toDateString()).length === 0 && (
                <div className="relative flex items-start gap-4 pb-12">
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border-[3px] border-slate-200 dark:border-slate-700 flex items-center justify-center z-10 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-[14px] font-bold text-slate-500 dark:text-slate-400 leading-tight mb-1">
                      No classes or events
                    </h4>
                    <p className="text-[12px] text-slate-400">Enjoy your free day!</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
        </>
        )}
      </div>
      
      <ReportPreviewModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
      />
    </div>
  );
}
