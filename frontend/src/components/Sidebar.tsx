import React from "react";
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
  GraduationCap,
  Bell,
  BarChart2,
  Github,
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
  const menus = [
    { label: "New Chat", view: "chat", icon: MessageSquare },
    { label: "Student Dashboard", view: "dashboard", icon: BarChart2 },
    { label: "Documents Hub", view: "knowledge", icon: FileText },
    { label: "Faculty Directory", view: "faculty", icon: Users },
    { label: "Notice Board", view: "notices", icon: Bell },
    { label: "iLearn", view: "ilearn", icon: GraduationCap },
  ];

  return (
    <div className="w-72 bg-surface/50 border-r border-border backdrop-blur-xl flex flex-col h-full flex-shrink-0">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center transform -rotate-12">
          <MessageSquare className="text-white w-4 h-4 fill-white" />
        </div>
        <div>
          <h1 className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
            EduSphere AI
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto pt-2 pb-6 px-4 space-y-1">
        <div className="font-mono text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 px-2">
          OVERVIEW
        </div>
        {menus.map((menu) => (
          <button
            key={menu.view}
            onClick={() => setView(menu.view as ViewState)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
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
            <div className="flex items-center gap-3 relative z-10">
              <menu.icon
                className={cn(
                  "w-4 h-4",
                  currentView === menu.view
                    ? "text-slate-900 dark:text-white"
                    : "group-hover:text-slate-900 dark:text-slate-200",
                )}
              />
              <span className="text-[13px]">{menu.label}</span>
            </div>
            {currentView === menu.view && (
              <ChevronRight className="w-3 h-3 relative z-10 opacity-50" />
            )}
          </button>
        ))}

        <div className="mt-8">
          <div className="font-mono text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 px-2">
            TOOLS
          </div>
          <button
            onClick={() => setView("calendar")}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
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
            <div className="flex items-center gap-3 relative z-10">
              <Calendar
                className={cn(
                  "w-4 h-4",
                  currentView === "calendar"
                    ? "text-slate-900 dark:text-white"
                    : "",
                )}
              />
              <span className="text-[13px]">Academic Calendar</span>
            </div>
          </button>
          <button
            onClick={() => setView("settings")}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group relative mt-1",
              currentView === "settings"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-border font-medium"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-900/5 dark:hover:bg-white/5",
            )}
          >
            <div className="flex items-center gap-3 relative z-10">
              <Settings
                className={cn(
                  "w-4 h-4",
                  currentView === "settings"
                    ? "text-slate-900 dark:text-white"
                    : "",
                )}
              />
              <span className="text-[13px]">Settings</span>
            </div>
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-border mb-4 text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-2xl" />
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
            How can I help?
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Ask me anything just a voice
          </p>
          <button
            onClick={() => setView("chat")}
            className="w-full py-2 bg-transparent text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-full text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-600" /> Chat with AI
          </button>
        </div>
        <div className="flex items-center justify-between px-1 mb-1 relative p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full bg-cover bg-center shrink-0 border border-slate-200 dark:border-slate-700"
              style={{
                backgroundImage:
                  `url(${useStore.getState().user?.profile?.profilePicture || "https://api.dicebear.com/7.x/notionists/svg?seed=user&backgroundColor=b6e3f4"})`,
              }}
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 truncate">
                {useStore.getState().user?.profile?.firstName || 'User'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {useStore.getState().user?.profile?.department || 'Student'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              useStore.getState().logout();
              window.location.reload();
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

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
      </div>
    </div>
  );
}
