import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ViewState } from '../types';
import { useStore } from '../store/useStore';
import { ChevronLeft, BrainCircuit, FileText, PlayCircle, FileCode2, Clock, CheckCircle2, Trophy, MoreVertical } from 'lucide-react';
import { cn } from '../lib/utils';
import { AIQuizModal } from './widgets/AIQuizModal';

interface CourseDetailsProps {
  setView: (view: ViewState) => void;
}

export function CourseDetails({ setView }: CourseDetailsProps) {
  const selectedCourse = useStore(state => state.selectedCourse);
  const setSelectedCourse = useStore(state => state.setSelectedCourse);
  const [quizCourse, setQuizCourse] = useState<any>(null);

  if (!selectedCourse) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-slate-50 dark:bg-slate-900">
        <p className="text-slate-500 mb-4">No course selected.</p>
        <button onClick={() => setView('ilearn')} className="text-blue-600 hover:underline font-medium">Return to ILearn</button>
      </div>
    );
  }

  const handleBack = () => {
    setSelectedCourse(null);
    setView('ilearn');
  };

  const progress = Math.floor(Math.random() * 40) + 60; // Mock 60-99%

  return (
    <div className="flex-1 w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 pt-16 lg:pt-0 pb-20">
      <div className="max-w-[1200px] mx-auto p-6 lg:p-8">
        
        {/* Back Button */}
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-6 font-medium text-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Back to ILearn
        </button>

        {/* Hero Section */}
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700/50 mb-8 relative flex flex-col md:flex-row">
          <div className={cn("md:w-1/3 h-48 md:h-auto relative", selectedCourse.bg)}>
            <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
            <img src={selectedCourse.img} alt={selectedCourse.title} className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
          </div>
          <div className="p-8 md:p-12 flex-1 flex flex-col justify-center">
            <div className="flex items-start justify-between mb-2">
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold uppercase tracking-wider">
                {selectedCourse.type}
              </span>
              <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
              {selectedCourse.title}
            </h1>
            <p className="text-[15px] text-slate-500 font-medium mb-6">
              {selectedCourse.prof} • {selectedCourse.major}
            </p>
            
            <div className="flex flex-wrap gap-4 items-center">
              <button 
                onClick={() => setQuizCourse(selectedCourse)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-[13px] flex items-center gap-2 transition-all shadow-lg shadow-blue-500/30 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <BrainCircuit className="w-5 h-5" /> Generate AI Quiz
              </button>
              <button className="px-6 py-3 bg-white dark:bg-slate-700 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 rounded-xl font-semibold text-[13px] hover:bg-slate-50 dark:hover:bg-slate-600 transition-all flex items-center gap-2">
                <PlayCircle className="w-5 h-5" /> Resume Course
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (Left, 2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Course Resources */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Course Resources</h3>
              
              <div className="space-y-4">
                {[
                  { name: "Syllabus_2024.pdf", type: "PDF", size: "2.4 MB", icon: FileText, color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10" },
                  { name: "Lecture_01_Introduction.mp4", type: "Video", size: "145 MB", icon: PlayCircle, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
                  { name: "Assignment_1_Guidelines.docx", type: "Doc", size: "1.2 MB", icon: FileCode2, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
                  { name: "Study_Notes_Chapter1-3.pdf", type: "PDF", size: "4.1 MB", icon: FileText, color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10" }
                ].map((doc, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", doc.bg)}>
                        <doc.icon className={cn("w-6 h-6", doc.color)} />
                      </div>
                      <div>
                        <h4 className="text-[13px] font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{doc.name}</h4>
                        <p className="text-[11px] font-medium text-slate-500">{doc.type} • {doc.size}</p>
                      </div>
                    </div>
                    <button className="text-[13px] font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Open
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Recent Activity</h3>
              <div className="relative pl-6 space-y-8 before:absolute before:inset-y-0 before:left-[11px] before:w-0.5 before:bg-slate-100 dark:before:bg-slate-700">
                <div className="relative">
                  <div className="absolute -left-6 w-6 h-6 bg-blue-100 dark:bg-blue-900/50 border-4 border-white dark:border-slate-800 rounded-full flex items-center justify-center z-10">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-slate-900 dark:text-white">Completed Quiz: Week 3</h4>
                    <p className="text-[11px] font-medium text-slate-500 mt-1">Score: 92% • 2 days ago</p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -left-6 w-6 h-6 bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-800 rounded-full flex items-center justify-center z-10">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-slate-900 dark:text-white">Watched Lecture 4</h4>
                    <p className="text-[11px] font-medium text-slate-500 mt-1">Duration: 45m • 4 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar (Right, 1 col) */}
          <div className="space-y-8">
            
            {/* Progress Card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
              <h3 className="text-[15px] font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Course Progress
              </h3>
              
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">{progress}%</span>
                <span className="text-[11px] font-medium text-slate-500 mb-1">Completed</span>
              </div>
              
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-6">
                <div 
                  className="h-full bg-blue-600 rounded-full relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)'}}></div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400 font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Modules
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">8 / 12</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400 font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" /> Hours Spent
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">24h 15m</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
      
      <AIQuizModal
        isOpen={!!quizCourse}
        onClose={() => setQuizCourse(null)}
        course={quizCourse}
      />
    </div>
  );
}
