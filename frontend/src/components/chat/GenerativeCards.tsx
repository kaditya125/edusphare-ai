import React from 'react';
import { motion } from 'motion/react';
import { Calendar, TrendingUp, BookOpen, AlertCircle } from 'lucide-react';

interface CardProps {
  data: any;
}

export const AttendanceSummaryCard: React.FC<CardProps> = ({ data }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 my-4 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white">Attendance Summary</h4>
          <p className="text-xs text-slate-500">Current Semester</p>
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-slate-900 dark:text-white">{data.attendance}%</span>
        <span className="text-sm font-medium text-emerald-500 mb-1">Above Requirement</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${data.attendance}%` }} />
      </div>
    </motion.div>
  );
};

export const PerformanceAnalysisCard: React.FC<CardProps> = ({ data }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 my-4 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg text-purple-600 dark:text-purple-400">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white">Academic Performance</h4>
          <p className="text-xs text-slate-500">CGPA Overview</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
          <p className="text-xs text-slate-500 mb-1">Current CGPA</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{data.cgpa}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
          <p className="text-xs text-slate-500 mb-1">Status</p>
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">Excellent</p>
        </div>
      </div>
    </motion.div>
  );
};

export const GenerativeUICard: React.FC<{ jsonString: string }> = ({ jsonString }) => {
  try {
    const data = JSON.parse(jsonString);
    
    switch (data.component) {
      case 'AttendanceSummary':
        return <AttendanceSummaryCard data={data} />;
      case 'PerformanceAnalysis':
        return <PerformanceAnalysisCard data={data} />;
      default:
        // If it has a component key but we don't know it, render a generic alert
        return (
          <div className="p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-sm flex items-start gap-2 my-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Unsupported Component: {data.component}</p>
              <pre className="text-[10px] mt-1 overflow-x-auto">{jsonString}</pre>
            </div>
          </div>
        );
    }
  } catch (e) {
    return null; // Fallback handled by parent if invalid JSON
  }
};
