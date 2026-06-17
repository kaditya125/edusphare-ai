import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, ChevronRight, Lightbulb, Loader2, RefreshCw } from 'lucide-react';
import { ViewState } from '../types';
import api from '../services/api';
import { cn } from '../lib/utils';

interface AIAssistanceTooltipProps {
  currentView: ViewState;
}

export function AIAssistanceTooltip({ currentView }: AIAssistanceTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tips, setTips] = useState<string[]>([]);
  const [currentTip, setCurrentTip] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const fetchTips = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/tips?view=${currentView}`);
      if (response.data && response.data.tips) {
        setTips(response.data.tips);
      } else {
        setTips(["Try exploring the interface to discover new features.", "Stay organized.", "Use the search bar."]);
      }
    } catch (error) {
      console.error("Failed to fetch AI tips", error);
      setTips(["Try exploring the interface to discover new features.", "Stay organized.", "Use the search bar."]);
    } finally {
      setIsLoading(false);
      setCurrentTip(0);
    }
  };

  const nextTip = () => {
    if (tips.length > 0) {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }
  };

  useEffect(() => {
    fetchTips();
  }, [currentView]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[280px] sm:w-[320px] pointer-events-auto bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Tips
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchTips}
                    disabled={isLoading}
                    className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
                    aria-label="Generate new tips"
                    title="Generate new tips"
                  >
                    <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    aria-label="Close tips"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 min-h-[3rem]"
                  >
                    <div className="flex items-center gap-1.5 mr-1">
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    </div>
                    Thinking...
                  </motion.div>
                ) : (
                  <motion.p
                    key={currentTip + currentView}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm font-medium text-slate-700 dark:text-slate-200 min-h-[3rem]"
                  >
                    {tips[currentTip]}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            {tips.length > 1 && (
              <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium tracking-wide">Tip {currentTip + 1} of {tips.length}</span>
                <button
                  onClick={nextTip}
                  className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative pointer-events-auto">
        <AnimatePresence>
          {hasUnread && !isOpen && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-2 -right-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 z-10 px-1.5 py-1 flex items-center gap-[2px] shadow-sm"
            >
              <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-1 h-1 bg-white rounded-full" />
              <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-1 h-1 bg-white rounded-full" />
              <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-1 h-1 bg-white rounded-full" />
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          onClick={() => {
            setIsOpen(!isOpen);
            setHasUnread(false);
          }}
          animate={!isOpen ? { scale: [1, 1.1, 1], boxShadow: ["0px 4px 14px rgba(37,99,235,0.3)", "0px 4px 20px rgba(37,99,235,0.6)", "0px 4px 14px rgba(37,99,235,0.3)"] } : { scale: 1, boxShadow: "0px 4px 14px rgba(0,0,0,0.1)" }}
          transition={{ duration: 3, repeat: !isOpen ? Infinity : 0, ease: "easeInOut" }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
          className={`w-[52px] h-[52px] rounded-full shadow-lg hover:shadow-xl flex items-center justify-center ${
            isOpen 
              ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700' 
              : 'bg-blue-600 text-white'
          }`}
          aria-label="Show AI Tips"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Lightbulb className="w-6 h-6" />}
        </motion.button>
      </div>
    </div>
  );
}
