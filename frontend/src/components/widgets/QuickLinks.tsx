import React from 'react';
import { BookOpen, CreditCard, Laptop, IdCard } from 'lucide-react';

export function QuickLinks() {
  const links = [
    { icon: <BookOpen className="w-5 h-5 text-indigo-500" />, title: "Library", color: "bg-indigo-50 dark:bg-indigo-500/10" },
    { icon: <CreditCard className="w-5 h-5 text-emerald-500" />, title: "Fee Payment", color: "bg-emerald-50 dark:bg-emerald-500/10" },
    { icon: <Laptop className="w-5 h-5 text-sky-500" />, title: "IT Support", color: "bg-sky-50 dark:bg-sky-500/10" },
    { icon: <IdCard className="w-5 h-5 text-rose-500" />, title: "Digital ID", color: "bg-rose-50 dark:bg-rose-500/10" }
  ];

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm flex flex-col h-full">
      <h3 className="font-bold text-slate-900 dark:text-white text-[15px] mb-6">Quick Links</h3>
      <div className="grid grid-cols-2 gap-3 flex-1">
        {links.map((link, idx) => (
          <button key={idx} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all group bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100/50 dark:hover:bg-slate-700/30">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-transform group-hover:scale-110 ${link.color}`}>
              {link.icon}
            </div>
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{link.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
