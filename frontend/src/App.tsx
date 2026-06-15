import React, { useState, useEffect } from "react";
import { ViewState, User } from "./types";
import { useStore } from "./store/useStore";
import { apiCall } from "./lib/api";
import { Sidebar } from "./components/Sidebar";
import { ChatInterface } from "./components/ChatInterface";
import { KnowledgeHub } from "./components/KnowledgeHub";
import { FacultyDirectory } from "./components/FacultyDirectory";
import { NoticeBoard } from "./components/NoticeBoard";
import { StudentDashboard } from "./components/StudentDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { AcademicCalendar } from "./components/AcademicCalendar";
import { SettingsPage } from "./components/SettingsPage";
import { ILearn } from "./components/ILearn";
import { LandingPage } from "./components/LandingPage";
import { CommandPalette } from "./components/CommandPalette";
import { KeyboardShortcuts } from "./components/KeyboardShortcuts";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, ChevronRight, Search, FileText } from "lucide-react";
import { ThemeToggle } from "./components/ThemeToggle";
import { AIAssistanceTooltip } from "./components/AIAssistanceTooltip";

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>("landing");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const { user, setUser, token } = useStore();

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const userData = await apiCall("/auth/me");
          setUser(userData);
          if (currentView === "landing") {
            setCurrentView("chat");
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          useStore.getState().logout();
        }
      }
    };
    checkAuth();
  }, [token]);

  // Global theme persistence on mount
  React.useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light") {
      document.documentElement.classList.remove("dark");
    } else if (
      stored === "dark" ||
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      document.documentElement.classList.add("dark");
    } else {
      // Default to dark as per ThemeToggle logic
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Close mobile menu on view change
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentView]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (currentView === "landing" && !user) {
    return <LandingPage setView={setCurrentView} onLogin={setUser} />;
  }

  const renderView = () => {
    switch (currentView) {
      case "chat":
        return <ChatInterface />;
      case "knowledge":
        return <KnowledgeHub />;
      case "faculty":
        return <FacultyDirectory />;
      case "notices":
        return <NoticeBoard />;
      case "dashboard":
        return <StudentDashboard />;
      case "admin":
        return <AdminDashboard setView={setCurrentView} />;
      case "calendar":
        return <AcademicCalendar />;
      case "settings":
        return <SettingsPage />;
      case "ilearn":
        return <ILearn />;
      default:
        return <ChatInterface />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      {/* Mobile Header */}
      <div className="lg:hidden absolute top-0 inset-x-0 h-16 bg-surface/80 backdrop-blur-xl border-b border-border/50 z-50 flex items-center justify-between px-4">
        <div className="font-bold text-lg text-slate-900 dark:text-white">
          EduSphere AI
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle className="w-9 h-9 p-0" />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:text-white"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <div className="hidden lg:block h-full">
        <Sidebar currentView={currentView} setView={setCurrentView} />
      </div>

      {/* Sidebar - Mobile overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              <Sidebar currentView={currentView} setView={setCurrentView} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 h-full pt-16 lg:pt-0 relative overflow-hidden flex flex-col bg-background">
        {/* Top Header - Desktop/Tablet */}
        <div className="hidden lg:flex items-center justify-between px-8 py-5 absolute top-0 w-full z-20 pointer-events-auto bg-transparent">
          <div className="flex items-center gap-4">
            <button className="w-8 h-8 rounded-full border border-slate-200 dark:border-border flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors bg-white dark:bg-surface">
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
            <div className="font-mono text-[11px] uppercase tracking-widest font-medium text-slate-400 dark:text-slate-500 flex items-center gap-2">
              Overview{" "}
              <span className="text-slate-300 dark:text-slate-600">/</span>{" "}
              <span className="text-slate-900 dark:text-white">
                {currentView.replace("-", " ")}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentView === "chat" && (
              <>
                <button className="hidden xl:flex px-4 py-2 rounded-full bg-white dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 text-[13px] font-semibold border border-slate-200 dark:border-border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors items-center gap-2">
                  <Search className="w-3.5 h-3.5" /> Search thread
                </button>
                <button className="hidden xl:flex px-4 py-2 rounded-full bg-white dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 text-[13px] font-semibold border border-slate-200 dark:border-border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors items-center gap-2">
                  <FileText className="w-3.5 h-3.5" /> Create folder
                </button>
                <button className="hidden md:flex px-4 py-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[13px] font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors items-center gap-2 shadow-sm mr-2 ml-1">
                  + New chat
                </button>
              </>
            )}
            <ThemeToggle className="w-8 h-8 p-0 rounded-full border border-slate-200 dark:border-border bg-white dark:bg-surface text-slate-400 hover:text-slate-800 flex items-center justify-center -ml-1 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800" />
          </div>
        </div>

        {renderView()}
      </div>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        setView={setCurrentView}
      />
      <KeyboardShortcuts />
      <AIAssistanceTooltip currentView={currentView} />
    </div>
  );
}
