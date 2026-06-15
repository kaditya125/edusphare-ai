import React from 'react';
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

interface ActionAlertsProps {
  performanceHistory: any;
  assignments: any;
}

export function ActionAlerts({ performanceHistory, assignments }: ActionAlertsProps) {
  const latestPerformance = performanceHistory?.[performanceHistory.length - 1];
  const lowAttendance = latestPerformance?.attendance < 75;
  
  const upcomingAssignments = assignments?.filter((a: any) => {
    const dueDate = new Date(a.dueDate);
    const now = new Date();
    const diffTime = Math.abs(dueDate.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && a.submissionStatus !== 'Submitted';
  }) || [];

  if (!lowAttendance && upcomingAssignments.length === 0) {
    return null; // No alerts to show
  }

  return (
    <div className="flex flex-col gap-3 mb-6">
      {lowAttendance && (
        <div className="flex items-center gap-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-red-800 dark:text-red-300 mb-0.5">Critical Attendance Warning</h4>
            <p className="text-xs font-medium text-red-600/80 dark:text-red-400/80">
              Your overall attendance has dropped to {latestPerformance?.attendance}%. This is below the required 75% threshold.
            </p>
          </div>
        </div>
      )}

      {upcomingAssignments.map((assignment: any) => (
        <div key={assignment._id} className="flex items-center gap-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500" />
          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-orange-800 dark:text-orange-300 mb-0.5">Approaching Deadline</h4>
            <p className="text-xs font-medium text-orange-600/80 dark:text-orange-400/80">
              Your assignment <strong>{assignment.title}</strong> is due in less than 3 days!
            </p>
          </div>
          <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-500/30 rounded-lg text-xs font-bold text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/20 transition-colors">
            Submit Now
          </button>
        </div>
      ))}
    </div>
  );
}
