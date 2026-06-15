import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Command,
  X,
  HelpCircle,
  FileText,
  Search,
  LayoutDashboard,
  Settings,
  MessageSquare,
} from "lucide-react";

const shortcuts = [
  { keys: ["⌘/Ctrl", "K"], label: "Open Command Palette", icon: Command },
  {
    keys: ["⌘/Ctrl", "/"],
    label: "Trigger Common Questions",
    icon: MessageSquare,
  },
  { keys: ["ESC"], label: "Close Modals & Focus Mode", icon: X },
  { keys: ["Shift", "?"], label: "Toggle this overlay", icon: HelpCircle },
];

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shift + ? to toggle overlay
      if (e.shiftKey && e.key === "?") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        title="Keyboard Shortcuts (Shift + ?)"
        className="fixed bottom-6 right-6 w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors z-50 group hover:scale-105 active:scale-95"
      >
        <HelpCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110]"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-[111] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Command className="w-5 h-5 text-slate-400" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-[15px]">
                    Keyboard Shortcuts
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-2 py-3 overflow-y-auto max-h-[60vh]">
                <div className="space-y-1">
                  {shortcuts.map((shortcut, idx) => {
                    const Icon = shortcut.icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-slate-400" />
                          <span className="text-[14px] font-medium text-slate-700 dark:text-slate-300">
                            {shortcut.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {shortcut.keys.map((key) => (
                            <kbd
                              key={key}
                              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[11px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-sm min-w-[24px] text-center"
                            >
                              {key}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
