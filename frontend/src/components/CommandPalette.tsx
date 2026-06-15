import React, { useState, useEffect, useRef } from "react";
import { ViewState } from "../types";
import { facultyData, noticesData } from "../data/mockData";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  User,
  FileText,
  ChevronRight,
  LayoutDashboard,
  Calendar,
  Settings,
  MessageSquare,
  BookOpen,
  GraduationCap,
  Bell,
} from "lucide-react";

type CommandPaletteProps = {
  isOpen: boolean;
  onClose: () => void;
  setView: (view: ViewState) => void;
};

const navigationItems = [
  { id: "chat", label: "Chat Assistant", icon: MessageSquare },
  { id: "dashboard", label: "Student Dashboard", icon: LayoutDashboard },
  { id: "faculty", label: "Faculty Directory", icon: User },
  { id: "calendar", label: "Academic Calendar", icon: Calendar },
  { id: "notices", label: "Notice Board", icon: Bell },
  { id: "knowledge", label: "Knowledge Hub", icon: BookOpen },
  { id: "ilearn", label: "iLearn Portal", icon: GraduationCap },
  { id: "settings", label: "Settings", icon: Settings },
];

export function CommandPalette({
  isOpen,
  onClose,
  setView,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 10);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filteredNavigation = navigationItems.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()),
  );

  const filteredNotices = noticesData.filter(
    (notice) =>
      notice.title.toLowerCase().includes(query.toLowerCase()) ||
      notice.description.toLowerCase().includes(query.toLowerCase()),
  );

  const filteredFaculty = facultyData.filter(
    (faculty) =>
      faculty.name.toLowerCase().includes(query.toLowerCase()) ||
      faculty.department.toLowerCase().includes(query.toLowerCase()),
  );

  const hasResults =
    filteredNavigation.length > 0 ||
    filteredNotices.length > 0 ||
    filteredFaculty.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed left-1/2 top-[15%] w-[90%] max-w-2xl -translate-x-1/2 z-[101] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[70vh]"
          >
            <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-200 dark:border-slate-800">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search resources, navigate, or find faculty..."
                className="flex-1 bg-transparent text-[15px] font-medium text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <div className="flex items-center gap-1.5 hidden sm:flex shrink-0">
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[11px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  ESC
                </kbd>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              {query && !hasResults && (
                <div className="px-4 py-12 text-center">
                  <p className="text-[14px] text-slate-500 dark:text-slate-400 font-medium">
                    No results found for "{query}"
                  </p>
                </div>
              )}

              {filteredNavigation.length > 0 && (
                <div className="mb-4">
                  <div className="px-3 py-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Navigation
                  </div>
                  {filteredNavigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setView(item.id as ViewState);
                          onClose();
                        }}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:border-blue-300 dark:group-hover:border-blue-500/50 transition-colors">
                            <Icon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                          </div>
                          <span className="text-[14px] font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {item.label}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors" />
                      </button>
                    );
                  })}
                </div>
              )}

              {filteredFaculty.length > 0 && (
                <div className="mb-4">
                  <div className="px-3 py-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Faculty
                  </div>
                  {filteredFaculty.map((faculty) => (
                    <button
                      key={faculty.id}
                      onClick={() => {
                        setView("faculty");
                        onClose();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={faculty.avatar}
                          alt={faculty.name}
                          className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50"
                        />
                        <div>
                          <p className="text-[14px] font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {faculty.name}
                          </p>
                          <p className="text-[12px] text-slate-500 dark:text-slate-400">
                            {faculty.department}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors" />
                    </button>
                  ))}
                </div>
              )}

              {filteredNotices.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Notices
                  </div>
                  {filteredNotices.map((notice) => (
                    <button
                      key={notice.id}
                      onClick={() => {
                        setView("notices");
                        onClose();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer text-left"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-[14px] font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                            {notice.title}
                          </p>
                          <p className="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {notice.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 items-center justify-between hidden sm:flex">
              <p className="text-[12px] font-medium text-slate-500">
                Tip: Search for a specific module or navigate by name.
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-medium tracking-wide">
                    TO NAVIGATE
                  </span>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-bold text-[10px] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-sm">
                      &uarr;
                    </kbd>
                    <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-bold text-[10px] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-sm">
                      &darr;
                    </kbd>
                  </div>
                </div>
                <div className="w-[1px] h-3 bg-slate-200 dark:bg-slate-700" />
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-medium tracking-wide">
                    TO SELECT
                  </span>
                  <kbd className="px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 rounded font-bold text-[10px] text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 shadow-sm">
                    ENTER
                  </kbd>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
