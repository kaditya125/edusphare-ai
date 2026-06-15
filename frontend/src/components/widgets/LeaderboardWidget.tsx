import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiCall } from '../../lib/api';
import { Trophy, Medal } from 'lucide-react';
import { cn } from '../../lib/utils';

export function LeaderboardWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => apiCall('/dashboard/leaderboard')
  });

  const students = data?.topStudents || [];
  const currentUserRank = data?.currentUserRank;
  const currentUser = data?.currentUser;
  
  const isCurrentUserInTop5 = students.some((s: any) => s.userId === currentUser?.userId);

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm flex flex-col h-full relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="font-bold text-slate-900 dark:text-white text-[15px] flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          Class Leaderboard
        </h3>
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Top 5</span>
      </div>

      <div className="flex-1 flex flex-col gap-3 relative z-10">
        {isLoading ? (
          <div className="text-center text-sm text-slate-400 py-4">Loading ranks...</div>
        ) : (
          students?.map((student: any, index: number) => {
            const isTop3 = index < 3;
            return (
              <div 
                key={student._id} 
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl transition-all",
                  index === 0 ? "bg-gradient-to-r from-amber-50 to-white dark:from-amber-900/20 dark:to-slate-800 border border-amber-200 dark:border-amber-700/30 shadow-sm" :
                  index === 1 ? "bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50" :
                  index === 2 ? "bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30" :
                  "border border-transparent"
                )}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 flex justify-center shrink-0">
                    {index === 0 ? <Medal className="w-6 h-6 text-amber-500" /> :
                     index === 1 ? <Medal className="w-5 h-5 text-slate-400" /> :
                     index === 2 ? <Medal className="w-5 h-5 text-orange-400" /> :
                     <span className="text-sm font-bold text-slate-400">#{index + 1}</span>}
                  </div>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img 
                      src={student.profilePicture || `https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=random`} 
                      alt={student.firstName}
                      className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm shrink-0"
                    />
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                          {student.firstName} {student.lastName}
                        </p>
                        {currentUser?.userId === student.userId && (
                           <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-white bg-[#5b58ed] px-1.5 py-0.5 rounded">You</span>
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 truncate">
                        {student.department}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-sm font-bold",
                    index === 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-white"
                  )}>
                    {student.cgpa.toFixed(2)}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CGPA</p>
                </div>
              </div>
            )
          })
        )}
        
        {!isLoading && currentUser && !isCurrentUserInTop5 && (
          <>
            <div className="flex items-center justify-center my-1">
              <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 mx-1"></div>
              <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 mx-1"></div>
              <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 mx-1"></div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl transition-all border border-[#5b58ed]/30 bg-indigo-50/50 dark:bg-indigo-900/10 shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5b58ed]" />
              <div className="flex items-center gap-3">
                <div className="w-8 flex justify-center">
                  <span className="text-sm font-bold text-[#5b58ed]">#{currentUserRank}</span>
                </div>
                <div className="flex items-center gap-3">
                  <img 
                    src={currentUser.profilePicture || `https://ui-avatars.com/api/?name=${currentUser.firstName}+${currentUser.lastName}&background=random`} 
                    alt={currentUser.firstName}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                      {currentUser.firstName} {currentUser.lastName}
                      <span className="text-[9px] font-bold uppercase tracking-wider text-white bg-[#5b58ed] px-1.5 py-0.5 rounded">You</span>
                    </p>
                    <p className="text-[11px] font-medium text-slate-500">
                      {currentUser.department}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {currentUser.cgpa?.toFixed(2)}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CGPA</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
