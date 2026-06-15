import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiCall } from '../../lib/api';
import { Sparkles, Bot, RefreshCw, Quote } from 'lucide-react';

// A simple hook to type out text like a typewriter
function useTypewriter(text: string, speed = 15) {
  const [displayedText, setDisplayedText] = useState('');
  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    if (!text) return;
    const interval = setInterval(() => {
      setDisplayedText(text.substring(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return displayedText;
}

export function AIAdvisorWidget() {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['ai-summary'],
    queryFn: () => apiCall('/dashboard/ai-summary'),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const typedAdvice = useTypewriter(data?.advice || '', 15);

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 mb-8 group shadow-sm transition-all hover:shadow-md">
      {/* Gradient border simulation via background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#5b58ed]/40 via-purple-500/40 to-pink-500/40 opacity-70" />
      <div className="absolute inset-[1.5px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[15px]" />

      {/* Decorative blurry blobs inside */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#5b58ed]/10 dark:bg-[#5b58ed]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
        {/* Icon Container */}
        <div className="shrink-0 relative group-hover:-translate-y-1 transition-transform duration-500">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5b58ed] to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(91,88,237,0.3)] relative z-10 overflow-hidden">
             {/* Sweeping light effect */}
             <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Bot className="w-8 h-8 text-white drop-shadow-md" />
          </div>
          <div className="absolute -top-2 -right-2 w-7 h-7 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg border border-slate-100 dark:border-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <h3 className="text-[13px] font-black uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-[#5b58ed] to-purple-500 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#5b58ed]" />
              AI Academic Advisor
            </h3>
            <button 
              onClick={() => refetch()}
              disabled={isFetching}
              className="text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-[#5b58ed] dark:text-slate-400 dark:hover:text-purple-400 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed bg-slate-100/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-full hover:shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-[#5b58ed]' : ''}`} />
              {isFetching ? 'Thinking...' : 'New Advice'}
            </button>
          </div>

          {(isLoading || isFetching) ? (
            <div className="space-y-3 animate-pulse mt-4">
              <div className="h-2.5 bg-gradient-to-r from-[#5b58ed]/20 to-purple-500/20 rounded-full w-full"></div>
              <div className="h-2.5 bg-gradient-to-r from-[#5b58ed]/20 to-purple-500/20 rounded-full w-11/12"></div>
              <div className="h-2.5 bg-gradient-to-r from-[#5b58ed]/20 to-purple-500/20 rounded-full w-4/5"></div>
            </div>
          ) : (
            <div className="relative mt-2">
              <Quote className="absolute -top-1 -left-2 w-8 h-8 text-[#5b58ed]/10 dark:text-purple-500/20 rotate-180 pointer-events-none" />
              <p className="text-slate-700 dark:text-slate-300 font-medium text-[15px] leading-relaxed relative z-10 pl-6">
                <span className="italic">{typedAdvice}</span>
                <span className="inline-block w-1.5 h-4 ml-1 bg-[#5b58ed] animate-pulse align-middle" />
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
