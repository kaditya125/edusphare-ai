import React, { useState } from "react";
import { ViewState } from "../types";
import {
  MessageSquare,
  FileText,
  Users,
  Calendar,
  Settings,
  UserCircle,
  LogOut,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  Bell,
  BarChart2,
  Github,
  GitMerge,
} from "lucide-react";
import { cn } from "../lib/utils";
import { motion } from "motion/react";
import { ThemeToggle } from "./ThemeToggle";
import { useStore } from "../store/useStore";

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export function Sidebar({ currentView, setView }: SidebarProps) {
  const [sidebarWidth, setSidebarWidth] = useState(288);
  const [isDragging, setIsDragging] = useState(false);

  React.useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      let newWidth = e.clientX;
      if (newWidth < 140) newWidth = 76; // snap to collapsed
      if (newWidth > 400) newWidth = 400; // max width
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const isCollapsed = sidebarWidth === 76;

  const menus = [
    { label: "New Chat", view: "chat", icon: MessageSquare },
    { label: "Student Dashboard", view: "dashboard", icon: BarChart2 },
    { label: "Documents Hub", view: "knowledge", icon: FileText },
    { label: "Faculty Directory", view: "faculty", icon: Users },
    { label: "Notice Board", view: "notices", icon: Bell },
    { label: "iLearn", view: "ilearn", icon: GraduationCap },
  ];

  return (
    <div 
      style={{ width: `${sidebarWidth}px` }}
      className={cn(
        "bg-surface/50 border-r border-border backdrop-blur-xl flex flex-col h-full flex-shrink-0 relative",
        !isDragging && "transition-all duration-300 ease-in-out"
      )}
    >
      {/* Drag Handle (String-like) */}
      <div
        onMouseDown={(e) => { e.preventDefault(); setIsDragging(true); }}
        className="absolute -right-1.5 top-0 bottom-0 w-3 cursor-col-resize z-50 flex items-center justify-center group"
      >
        <div className={cn(
          "h-12 w-1 rounded-full transition-colors duration-200",
          isDragging ? "bg-blue-500" : "bg-slate-200 dark:bg-slate-700 group-hover:bg-blue-400"
        )} />
      </div>

      {/* Logo */}
      <div className={cn("p-6 flex items-center", isCollapsed ? "justify-center px-0" : "gap-3")}>
        <motion.div 
          animate={{ rotate: [-12, -20, -4, -12], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0"
        >
          <MessageSquare className="text-white w-4 h-4 fill-white" />
        </motion.div>
        {!isCollapsed && (
          <div className="overflow-hidden">
            <h1 className="font-bold text-xl tracking-tight text-slate-900 dark:text-white flex">
              {"EduSphere AI".split("").map((char, index) => (
                <motion.span
                  key={index}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: [0, -4, 0], rotate: [-2, 3, -1, 0], opacity: 1 }}
                  transition={{
                    opacity: { duration: 0.3, delay: index * 0.05 },
                    y: {
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.05,
                    },
                    rotate: {
                      duration: 0.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                      delay: index * 0.05,
                    }
                  }}
                  className="inline-block origin-bottom"
                  style={{ whiteSpace: "pre" }}
                >
                  {char}
                </motion.span>
              ))}
            </h1>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pt-2 pb-6 px-4 space-y-1">
        {!isCollapsed && (
          <div className="font-mono text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 px-2 truncate">
            OVERVIEW
          </div>
        )}
        {menus.map((menu) => (
          <button
            key={menu.view}
            onClick={() => setView(menu.view as ViewState)}
            title={isCollapsed ? menu.label : undefined}
            className={cn(
              "flex items-center rounded-xl transition-all duration-200 group relative w-full",
              isCollapsed ? "justify-center p-2.5 my-1.5" : "justify-between px-3 py-2.5",
              currentView === menu.view
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-border font-medium"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-900/5 dark:hover:bg-white/5",
            )}
          >
            {currentView === menu.view && (
              <motion.div
                layoutId="active-nav"
                className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{ zIndex: -1 }}
              />
            )}
            <div className="flex items-center gap-3 relative z-10 w-full">
              <menu.icon
                className={cn(
                  "w-4 h-4 shrink-0",
                  currentView === menu.view
                    ? "text-slate-900 dark:text-white"
                    : "group-hover:text-slate-900 dark:text-slate-200",
                  isCollapsed && "mx-auto"
                )}
              />
              {!isCollapsed && (
                <span className="text-[13px] whitespace-nowrap truncate">{menu.label}</span>
              )}
            </div>
            {!isCollapsed && currentView === menu.view && (
              <ChevronRight className="w-3 h-3 relative z-10 opacity-50 shrink-0" />
            )}
          </button>
        ))}

        <div className="mt-8">
          {!isCollapsed && (
            <div className="font-mono text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 px-2 truncate">
              TOOLS
            </div>
          )}
          <button
            onClick={() => setView("calendar")}
            title={isCollapsed ? "Academic Calendar" : undefined}
            className={cn(
              "flex items-center rounded-xl transition-all duration-200 group relative w-full",
              isCollapsed ? "justify-center p-2.5 my-1.5" : "justify-between px-3 py-2.5",
              currentView === "calendar"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-border font-medium"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-900/5 dark:hover:bg-white/5",
            )}
          >
            {currentView === "calendar" && (
              <motion.div
                layoutId="active-nav"
                className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{ zIndex: -1 }}
              />
            )}
            <div className="flex items-center gap-3 relative z-10 w-full">
              <Calendar
                className={cn(
                  "w-4 h-4 shrink-0",
                  currentView === "calendar" ? "text-slate-900 dark:text-white" : "group-hover:text-slate-900 dark:text-slate-200",
                  isCollapsed && "mx-auto"
                )}
              />
              {!isCollapsed && <span className="text-[13px] whitespace-nowrap truncate">Academic Calendar</span>}
            </div>
          </button>
          
          <button
            onClick={() => setView("settings")}
            title={isCollapsed ? "Settings" : undefined}
            className={cn(
              "flex items-center rounded-xl transition-all duration-200 group relative w-full",
              isCollapsed ? "justify-center p-2.5 my-1.5" : "justify-between px-3 py-2.5",
              currentView === "settings"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-border font-medium"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-900/5 dark:hover:bg-white/5",
            )}
          >
            <div className="flex items-center gap-3 relative z-10 w-full">
              <Settings
                className={cn(
                  "w-4 h-4 shrink-0",
                  currentView === "settings" ? "text-slate-900 dark:text-white" : "group-hover:text-slate-900 dark:text-slate-200",
                  isCollapsed && "mx-auto"
                )}
              />
              {!isCollapsed && <span className="text-[13px] whitespace-nowrap truncate">Settings</span>}
            </div>
          </button>
        </div>
      </div>

      <div className={cn("p-4", isCollapsed && "px-2 pb-6")}>
        {!isCollapsed && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-border mb-4 text-center relative overflow-hidden group">
            <motion.div 
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 w-32 h-32 bg-blue-200 dark:bg-blue-600/30 rounded-full blur-3xl pointer-events-none" 
            />
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 relative z-10">
              How can I help?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 relative z-10">
              Ask me anything just a voice
            </p>
            <button
              onClick={() => setView("chat")}
              className="w-full py-2 bg-transparent text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-full text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center gap-2 relative z-10 overflow-hidden"
            >
              <motion.div 
                animate={{ rotate: [-5, 5, -5], scale: [1, 1.1, 1] }} 
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              </motion.div>
              Chat with AI
            </button>
          </div>
        )}
        
        <div className={cn(
          "flex items-center relative rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50",
          isCollapsed ? "justify-center p-2 flex-col gap-2" : "justify-between px-1 mb-1 p-2"
        )}>
          <div className={cn("flex items-center gap-3", isCollapsed ? "justify-center" : "")}>
            <div
              className="w-9 h-9 rounded-full bg-cover bg-center shrink-0 border border-slate-200 dark:border-slate-700"
              style={{
                backgroundImage:
                  `url(${useStore.getState().user?.profile?.profilePicture || "https://api.dicebear.com/7.x/notionists/svg?seed=user&backgroundColor=b6e3f4"})`,
              }}
              title={isCollapsed ? useStore.getState().user?.profile?.firstName || 'User' : undefined}
            />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 truncate">
                  {useStore.getState().user?.profile?.firstName || 'User'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {useStore.getState().user?.profile?.department || 'Student'}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              useStore.getState().logout();
              window.location.reload();
            }}
            className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {!isCollapsed ? (
          <a
            href="https://github.com/kaditya125/edusphare-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="relative mt-4 group flex items-center justify-center w-full px-4 py-2.5 text-white shadow-sm rounded-xl overflow-hidden font-semibold text-[13px] hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-[linear-gradient(110deg,#0f172a,45%,#334155,55%,#0f172a)] bg-[length:200%_100%] animate-custom-shimmer" />

            <div className="relative z-10 flex items-center gap-2 text-white">
              <Github className="w-4 h-4" />
              <span>Star on GitHub</span>
            </div>

            <style>{`
              @keyframes custom-shimmer {
                from { background-position: 200% 0; }
                to { background-position: -200% 0; }
              }
              .animate-custom-shimmer {
                animation: custom-shimmer 2.5s linear infinite;
              }
            `}</style>
          </a>
        ) : (
          <a
            href="https://github.com/kaditya125/edusphare-ai"
            target="_blank"
            rel="noopener noreferrer"
            title="Star on GitHub"
            className="relative mt-2 group flex items-center justify-center w-10 h-10 mx-auto text-white shadow-sm rounded-xl overflow-hidden hover:scale-[1.05] active:scale-[0.95] transition-transform"
          >
            <div className="absolute inset-0 bg-[linear-gradient(110deg,#0f172a,45%,#334155,55%,#0f172a)] bg-[length:200%_100%] animate-custom-shimmer" />
            <Github className="w-4 h-4 relative z-10" />
          </a>
        )}
      </div>
    </div>
  );
}
