import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiCall } from '../../lib/api';
import { TrendingUp, TrendingDown, Minus, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

export function PredictiveAnalyticsWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ['predictive-analytics'],
    queryFn: () => apiCall('/dashboard/predictive-analytics'),
    staleTime: 1000 * 60 * 60,
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm flex flex-col xl:col-span-12 animate-pulse h-48" />
    );
  }

  if (!data) return null;

  const isUp = data.trend === 'up';
  const isDown = data.trend === 'down';
  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
  const colorClass = isUp ? 'text-emerald-500' : isDown ? 'text-red-500' : 'text-amber-500';
  const bgClass = isUp ? 'bg-emerald-50 dark:bg-emerald-500/10' : isDown ? 'bg-red-50 dark:bg-red-500/10' : 'bg-amber-50 dark:bg-amber-500/10';

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm flex flex-col xl:col-span-12 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className={cn("absolute top-0 right-0 w-64 h-64 blur-3xl rounded-full opacity-20 -translate-y-1/2 translate-x-1/3 pointer-events-none", isUp ? "bg-emerald-500" : isDown ? "bg-red-500" : "bg-amber-500")} />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="font-bold text-slate-900 dark:text-white text-[15px] flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#5b58ed]" />
          AI Performance Prediction
        </h3>
        <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold border", bgClass, colorClass, isUp ? "border-emerald-200 dark:border-emerald-500/20" : isDown ? "border-red-200 dark:border-red-500/20" : "border-amber-200 dark:border-amber-500/20")}>
          <TrendIcon className="w-3.5 h-3.5" />
          {data.trend.toUpperCase()} TREND
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        <div className="lg:col-span-1 flex flex-col gap-2 p-5 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">AI Forecast</p>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
            {data.prediction}
          </h4>
          <div className="mt-auto pt-4 flex items-start gap-2">
            {isDown ? <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /> : <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
            <p className="text-[13px] font-medium text-slate-600 dark:text-slate-300">
              {data.actionableAdvice}
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-3">
          <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1">Key Insights</p>
          {data.insights?.map((insight: string, idx: number) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#5b58ed]/30 transition-colors">
              <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-[#5b58ed] flex items-center justify-center shrink-0 font-bold text-[11px]">
                {idx + 1}
              </div>
              <p className="text-[13px] font-medium text-slate-700 dark:text-slate-200 leading-relaxed">
                {insight}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
