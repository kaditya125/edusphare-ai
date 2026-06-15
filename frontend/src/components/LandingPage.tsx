import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Users,
  Brain,
  Shield,
  Rocket,
  X,
  Lock,
  User,
  Globe,
  CheckCircle,
  Quote,
  LayoutDashboard,
  FileText,
  Bot,
  Zap,
  ChevronRight,
  Search,
  Bell,
  Target,
  GraduationCap,
  ChevronDown,
  Send,
  Plus,
  Folder
} from "lucide-react";
import { ViewState, User as UserType } from "../types";
import { ThemeToggle } from "./ThemeToggle";
import { apiCall } from "../lib/api";
import { useStore } from "../store/useStore";

interface LandingPageProps {
  setView: (view: ViewState) => void;
  onLogin: (user: UserType) => void;
}

export function LandingPage({ setView, onLogin }: LandingPageProps) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [email, setEmail] = useState("aditya@university.edu");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await apiCall("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      
      useStore.getState().setToken(response.token);
      useStore.getState().setUser(response.user);
      if (onLogin) onLogin(response.user);
      setIsLoginOpen(false);
      setView("chat");
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col font-sans overflow-y-auto relative selection:bg-blue-500/30">
      <AnimatePresence>
        {isLoginOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 w-full max-w-[440px] shadow-[0_0_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] border border-slate-100 dark:border-slate-800 relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
              <button
                onClick={() => setIsLoginOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-8 text-center relative z-10">
                <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20 transform rotate-3 hover:rotate-0 transition-transform cursor-pointer">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                  Welcome back
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Please enter your details to sign in.
                </p>
              </div>

              <div className="space-y-5 relative z-10">
                 <button className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all shadow-sm active:scale-[0.98]">
                   <Globe className="w-[18px] h-[18px] text-slate-500 shrink-0" />
                   Sign in with University SSO
                 </button>
                 
                 <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-700/70"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Or continue with email</span>
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-700/70"></div>
                 </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Password
                    </label>
                    <button className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                      Forgot?
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {error && <p className="text-red-500 text-xs font-semibold text-center mt-2">{error}</p>}
                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-4 text-sm font-bold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Signing In..." : "Sign In to EduSphere"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12 md:py-6 relative z-10 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center transform -rotate-12 shadow-lg shadow-blue-500/20">
            <Sparkles className="text-white w-5 h-5 fill-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
            EduSphere AI
          </span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle className="w-10 h-10 p-0 rounded-full border border-slate-200 dark:border-border bg-white dark:bg-surface" />
          <button
            onClick={() => setIsLoginOpen(true)}
            className="flex bg-white dark:bg-surface border border-slate-200 dark:border-border text-slate-900 dark:text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm items-center"
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLoginOpen(true)}
            className="hidden md:flex bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-6 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 items-center gap-2"
          >
            Launch App <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 pt-16 md:pt-24 pb-12 text-center relative overflow-hidden">
        {/* Ambient Gradients */}
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-[120px] -z-10 animate-pulse pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-[600px] h-[600px] bg-cyan-500/10 dark:bg-cyan-600/15 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-slate-800/80 text-blue-600 dark:text-blue-400 text-sm font-bold mb-8 border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md"
        >
          <Sparkles className="w-4 h-4" />
          <span>Next-Generation Learning OS</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white max-w-4xl mb-6 leading-tight pb-2"
        >
          Elevate education with{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 inline-block">
            Intelligent AI
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed font-medium"
        >
          Empower students, support faculty, and streamline administration with
          EduSphere AI's comprehensive, smart university management platform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <button
            onClick={() => setIsLoginOpen(true)}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-10 py-5 bg-blue-600 text-white rounded-full text-lg font-bold hover:bg-blue-700 transition-all shadow-xl hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-1 active:translate-y-0"
          >
            Explore Dashboard <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsLoginOpen(true)}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-10 py-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full text-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            Student Login
          </button>
        </motion.div>

        {/* Floating App Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 150 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, type: 'spring', damping: 25, stiffness: 100 }}
          className="relative w-full max-w-5xl mx-auto mt-24 h-[400px] md:h-[500px] rounded-t-3xl border-t border-l border-r border-slate-200/80 dark:border-slate-700/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl overflow-hidden shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.1)] dark:shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.5)] flex items-end justify-center group"
        >
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          
          <div className="w-[95%] h-[95%] bg-[#f8fafc] dark:bg-[#0f172a] rounded-t-[2rem] border-t border-l border-r border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-2xl flex transition-transform duration-700 group-hover:scale-[1.02]">
             
             {/* High-Fidelity Sidebar Replica */}
             <div className="w-56 hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 p-4 gap-2 bg-white dark:bg-[#1e293b]">
                <div className="flex items-center gap-2 mb-8 px-2 mt-2">
                   <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center transform -rotate-12 shadow-md">
                     <Sparkles className="text-white w-4 h-4 fill-white" />
                   </div>
                   <span className="font-bold text-slate-900 dark:text-white">EduSphere</span>
                </div>
                
                <div className="w-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl p-3 flex items-center gap-3 font-semibold text-sm border border-blue-100 dark:border-blue-800/50 shadow-sm">
                   <LayoutDashboard className="w-4 h-4" /> Dashboard
                </div>
                <div className="w-full text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl p-3 flex items-center gap-3 font-medium text-sm transition-colors">
                   <CheckCircle className="w-4 h-4" /> Attendance
                </div>
                <div className="w-full text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl p-3 flex items-center gap-3 font-medium text-sm transition-colors">
                   <FileText className="w-4 h-4" /> Assignments
                </div>
                <div className="w-full text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl p-3 flex items-center gap-3 font-medium text-sm transition-colors">
                   <Bot className="w-4 h-4" /> AI Advisor
                </div>
                
                <div className="mt-auto border-t border-slate-200 dark:border-slate-800 pt-4 flex items-center gap-3 px-2 pb-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 border border-white dark:border-slate-600 overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Aditya&backgroundColor=b6e3f4" alt="User" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Aditya Kumar</div>
                    <div className="text-[10px] text-slate-500">Student</div>
                  </div>
                </div>
             </div>
             
             {/* High-Fidelity Content Replica */}
             <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 overflow-hidden">
                
                {/* Header */}
                <div className="flex justify-between items-end">
                   <div>
                     <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome back, Aditya!</h2>
                     <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Here is what's happening with your academics today.</p>
                   </div>
                   <div className="hidden lg:flex items-center gap-4">
                     <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 flex items-center gap-2 w-64 shadow-sm">
                       <Search className="w-4 h-4 text-slate-400" />
                       <span className="text-sm text-slate-400">Search courses...</span>
                     </div>
                     <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm relative">
                       <Bell className="w-5 h-5" />
                       <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                     </div>
                   </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-2">
                   
                   {/* Card 1: CGPA */}
                   <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                     <div className="flex items-center gap-3 mb-2">
                       <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                         <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                       </div>
                       <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current CGPA</span>
                     </div>
                     <div className="flex items-end justify-between">
                       <div className="text-3xl font-extrabold text-slate-900 dark:text-white">8.5<span className="text-sm text-slate-400 font-medium">/10</span></div>
                       <div className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">+0.2</div>
                     </div>
                   </div>

                   {/* Card 2: Attendance */}
                   <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
                     <div className="flex items-center gap-3 mb-2 relative z-10">
                       <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                         <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                       </div>
                       <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance</span>
                     </div>
                     <div className="flex items-center gap-4 relative z-10">
                       <div className="text-3xl font-extrabold text-slate-900 dark:text-white">88%</div>
                       {/* Mock Radial */}
                       <div className="w-10 h-10 rounded-full border-[4px] border-indigo-500 border-t-indigo-100 dark:border-t-slate-700 transform rotate-45" />
                     </div>
                   </div>

                   {/* Card 3: Upcoming Exam */}
                   <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                     <div className="flex items-center gap-3 mb-2">
                       <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                         <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                       </div>
                       <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Next Exam</span>
                     </div>
                     <div>
                       <div className="text-sm font-bold text-slate-900 dark:text-white leading-tight mb-1 truncate">Data Structures</div>
                       <div className="text-xs font-bold text-amber-500 flex items-center gap-1"><Zap className="w-3 h-3"/> In 2 Days</div>
                     </div>
                   </div>

                   {/* Card 4: Action */}
                   <div className="bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-2xl border border-blue-500 shadow-lg shadow-blue-500/20 p-5 flex flex-col justify-between relative overflow-hidden group cursor-pointer">
                     <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xNSkiLz48L3N2Zz4=')] opacity-50"></div>
                     <div className="flex items-center gap-3 mb-2 relative z-10">
                       <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                         <Bot className="w-4 h-4 text-white" />
                       </div>
                       <span className="text-xs font-bold text-blue-100 uppercase tracking-wider">AI Advisor</span>
                     </div>
                     <div className="relative z-10 flex items-end justify-between">
                       <div className="text-lg font-bold text-white leading-tight">Ask a question</div>
                       <ArrowRight className="w-5 h-5 text-white transform group-hover:translate-x-1 transition-transform" />
                     </div>
                   </div>
                </div>
                
                {/* Large Chart Area */}
                <div className="flex-1 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl w-full flex flex-col p-6 relative overflow-hidden shadow-sm">
                   <div className="flex justify-between items-center mb-6">
                     <div>
                       <h3 className="text-lg font-bold text-slate-900 dark:text-white">Performance Overview</h3>
                       <p className="text-xs text-slate-500 mt-1">CGPA trend over the last 6 semesters</p>
                     </div>
                     <div className="flex gap-2">
                       <div className="px-3 py-1 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 rounded-md cursor-pointer">CGPA</div>
                       <div className="px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md cursor-pointer">Attendance</div>
                     </div>
                   </div>
                   
                   {/* CSS Chart Mockup */}
                   <div className="flex-1 flex items-end justify-between gap-2 px-4 pb-2 relative">
                     {/* Horizontal Grid Lines */}
                     <div className="absolute inset-0 flex flex-col justify-between py-2 z-0">
                       <div className="w-full border-t border-slate-100 dark:border-slate-800/60"></div>
                       <div className="w-full border-t border-slate-100 dark:border-slate-800/60"></div>
                       <div className="w-full border-t border-slate-100 dark:border-slate-800/60"></div>
                       <div className="w-full border-t border-slate-100 dark:border-slate-800/60"></div>
                     </div>
                     
                     {/* Bars */}
                     {[40, 60, 50, 80, 70, 90, 85].map((h, i) => (
                       <div key={i} className="w-full max-w-[40px] bg-blue-100 dark:bg-slate-800 rounded-t-md relative z-10 group cursor-pointer" style={{ height: `${h}%` }}>
                         <div className="absolute bottom-0 w-full bg-blue-500 rounded-t-md transition-all duration-500 group-hover:bg-blue-400" style={{ height: `${h - 10}%` }}></div>
                       </div>
                     ))}
                   </div>
                   
                   <div className="flex justify-between px-4 mt-2 text-[10px] font-semibold text-slate-400 uppercase">
                     <span>Sem 1</span><span>Sem 2</span><span>Sem 3</span><span>Sem 4</span><span>Sem 5</span><span>Sem 6</span><span>Sem 7</span>
                   </div>
                </div>

             </div>
          </div>
        </motion.div>
      </main>

      {/* Trust Banner */}
      <section className="w-full border-y border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl py-12 relative z-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x-0 md:divide-x divide-slate-200 dark:divide-slate-800">
           <div className="py-2">
             <div className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">50+</div>
             <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Universities</div>
           </div>
           <div className="py-2">
             <div className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">10k+</div>
             <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Students</div>
           </div>
           <div className="py-2">
             <div className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">2M+</div>
             <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">AI Interactions</div>
           </div>
           <div className="py-2">
             <div className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">99.9%</div>
             <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Platform Uptime</div>
           </div>
        </div>
      </section>

      {/* Deep Dive Features */}
      <section className="max-w-7xl mx-auto px-6 py-32 flex flex-col gap-32 lg:gap-40">
        
        {/* Feature 1 */}
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-8 border border-blue-100 dark:border-blue-800/50 shadow-inner">
              <Bot className="w-8 h-8" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              Your Personal <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">AI Mentor</span>
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Experience a revolution in personalized learning. Our integrated AI Mentor helps you debug code, understand complex mathematics, and plan your curriculum—available 24/7 directly inside your dashboard.
            </p>
            <ul className="space-y-4 pt-4">
              <li className="flex items-center gap-3 text-slate-800 dark:text-slate-200 font-medium"><CheckCircle className="w-5 h-5 text-blue-500" /> Instant conversational assistance</li>
              <li className="flex items-center gap-3 text-slate-800 dark:text-slate-200 font-medium"><CheckCircle className="w-5 h-5 text-blue-500" /> Real-time code execution and debugging</li>
              <li className="flex items-center gap-3 text-slate-800 dark:text-slate-200 font-medium"><CheckCircle className="w-5 h-5 text-blue-500" /> Tailored study plans based on your pace</li>
            </ul>
          </div>
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-cyan-500/20 rounded-[3rem] blur-3xl transform rotate-6" />
            <div className="bg-[#f8fafc] dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex h-[450px]">
              
              {/* Left Sidebar Miniature */}
              <div className="w-[28%] bg-white dark:bg-[#1e293b] border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col hidden sm:flex">
                <div className="flex items-center gap-2 mb-6">
                   <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
                     <Bot className="text-white w-3 h-3" />
                   </div>
                   <span className="font-bold text-slate-900 dark:text-white text-xs truncate">EduSphere AI</span>
                </div>
                
                <div className="text-[9px] font-bold text-slate-400 tracking-widest mb-2 uppercase">Overview</div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg p-2 flex items-center gap-2 font-semibold text-[10px] mb-1">
                   <Plus className="w-3 h-3" /> New Chat
                </div>
                <div className="w-full text-slate-500 dark:text-slate-400 p-2 flex items-center gap-2 font-medium text-[10px] mb-1">
                   <LayoutDashboard className="w-3 h-3" /> Student Dashboard
                </div>
                <div className="w-full text-slate-500 dark:text-slate-400 p-2 flex items-center gap-2 font-medium text-[10px]">
                   <FileText className="w-3 h-3" /> Documents Hub
                </div>
                
                <div className="mt-auto border-t border-slate-200 dark:border-slate-800 pt-3 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Aditya&backgroundColor=b6e3f4" alt="User" className="w-full h-full" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="text-[10px] font-bold text-slate-900 dark:text-white truncate">Aditya</div>
                    <div className="text-[8px] text-slate-500 truncate">MCA Data Science</div>
                  </div>
                </div>
              </div>

              {/* Middle Chat Area Miniature */}
              <div className="flex-1 bg-gradient-to-b from-slate-50 to-white dark:from-[#0f172a] dark:to-[#1e293b] flex flex-col relative overflow-hidden">
                <div className="h-12 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-blue-600" /> Academic Mentor <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                   <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-6">
                     <GraduationCap className="w-8 h-8 text-blue-600" />
                   </div>
                   <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">How can I help you <span className="text-slate-900 dark:text-slate-100">today?</span></h3>
                   <p className="text-[10px] text-slate-500 max-w-[80%] leading-relaxed">
                     Ask me questions about your curriculum, check your attendance, or get help with your assignments.
                   </p>
                </div>
                
                <div className="p-4">
                  <div className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 flex items-center gap-2 shadow-sm">
                    <div className="flex-1 text-[10px] text-slate-400 pl-2">Ask me "What is my current GPA?"...</div>
                    <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
                      <Send className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="text-center mt-2 text-[8px] text-slate-400">EduSphere AI can make mistakes. Verify important information.</div>
                </div>
              </div>

              {/* Right Sidebar Miniature */}
              <div className="w-[28%] bg-[#f8fafc] dark:bg-[#0f172a] border-l border-slate-200 dark:border-slate-800 p-4 flex flex-col hidden lg:flex">
                 <div className="w-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-semibold text-[10px] py-2 rounded-lg flex justify-center items-center gap-1 border border-blue-100 dark:border-blue-800/50 mb-6 shadow-sm">
                   <Plus className="w-3 h-3" /> New Chat
                 </div>
                 
                 <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-bold text-[10px] mb-3">
                   <Sparkles className="w-3 h-3" /> Suggested Actions
                 </div>
                 
                 <div className="space-y-2 mb-6">
                   <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-lg text-[9px] text-slate-600 dark:text-slate-300 shadow-sm truncate">
                     View semester exam timetable
                   </div>
                   <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-lg text-[9px] text-slate-600 dark:text-slate-300 shadow-sm truncate">
                     Check my attendance percentage
                   </div>
                   <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-lg text-[9px] text-slate-600 dark:text-slate-300 shadow-sm truncate">
                     Download syllabus for Data Science
                   </div>
                 </div>
                 
                 <div className="flex items-center justify-between text-slate-800 dark:text-slate-200 font-bold text-[10px] mb-3">
                   <div className="flex items-center gap-1"><Folder className="w-3 h-3" /> Categorize Threads</div>
                 </div>
                 
                 <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-lg text-[9px] shadow-sm">
                   <div className="font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1"><Folder className="w-2.5 h-2.5"/> General/Admissions</div>
                   <div className="text-[8px] text-slate-400 italic">Drag threads here</div>
                 </div>
              </div>

            </div>
          </div>
        </div>

        {/* Feature 2 (Reversed) */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-20">
          <div className="flex-1 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-8 border border-indigo-100 dark:border-indigo-800/50 shadow-inner">
              <LayoutDashboard className="w-8 h-8" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              Interactive <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500">Student Hub</span>
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Say goodbye to scattered spreadsheets and clunky portals. Everything you need—from live attendance tracking to assignment submissions—is centralized in one beautiful, lightning-fast dashboard.
            </p>
            <ul className="space-y-4 pt-4">
              <li className="flex items-center gap-3 text-slate-800 dark:text-slate-200 font-medium"><CheckCircle className="w-5 h-5 text-indigo-500" /> Visually track CGPA & Credits</li>
              <li className="flex items-center gap-3 text-slate-800 dark:text-slate-200 font-medium"><CheckCircle className="w-5 h-5 text-indigo-500" /> Beautifully designed Course Roadmaps</li>
              <li className="flex items-center gap-3 text-slate-800 dark:text-slate-200 font-medium"><CheckCircle className="w-5 h-5 text-indigo-500" /> Unified Assignments & Results tracking</li>
            </ul>
          </div>
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-gradient-to-bl from-indigo-600/20 to-purple-500/20 rounded-[3rem] blur-3xl transform -rotate-6" />
            <div className="bg-[#f8fafc] dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex h-[450px]">
              {/* Left Sidebar Miniature */}
              <div className="w-[28%] bg-white dark:bg-[#1e293b] border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col hidden sm:flex">
                <div className="flex items-center gap-2 mb-6">
                   <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center transform -rotate-12">
                     <Sparkles className="text-white w-3 h-3" />
                   </div>
                   <span className="font-bold text-slate-900 dark:text-white text-xs truncate">EduSphere AI</span>
                </div>
                
                <div className="text-[9px] font-bold text-slate-400 tracking-widest mb-2 uppercase">Overview</div>
                <div className="w-full text-slate-500 dark:text-slate-400 p-2 flex items-center gap-2 font-medium text-[10px] mb-1">
                   <Plus className="w-3 h-3" /> New Chat
                </div>
                <div className="w-full text-slate-500 dark:text-slate-400 p-2 flex items-center gap-2 font-medium text-[10px] mb-1">
                   <LayoutDashboard className="w-3 h-3" /> Student Dashboard
                </div>
                <div className="w-full text-slate-500 dark:text-slate-400 p-2 flex items-center gap-2 font-medium text-[10px] mb-1">
                   <FileText className="w-3 h-3" /> Documents Hub
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg p-2 flex items-center justify-between font-semibold text-[10px]">
                   <div className="flex items-center gap-2"><GraduationCap className="w-3 h-3" /> iLearn</div>
                   <ChevronRight className="w-3 h-3 opacity-50" />
                </div>
                
                <div className="mt-auto border-t border-slate-200 dark:border-slate-800 pt-3 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Aditya&backgroundColor=b6e3f4" alt="User" className="w-full h-full" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="text-[10px] font-bold text-slate-900 dark:text-white truncate">Aditya Kumar</div>
                    <div className="text-[8px] text-slate-500 truncate">MCA Data Science</div>
                  </div>
                </div>
              </div>

              {/* Main Content Miniature */}
              <div className="flex-1 bg-slate-50 dark:bg-[#0f172a] p-4 overflow-hidden flex flex-col">
                 <div className="text-[8px] font-bold text-slate-400 tracking-widest mb-3 uppercase flex items-center gap-2">
                   <div className="w-5 h-5 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center"><ChevronRight className="w-3 h-3 rotate-180" /></div>
                   OVERVIEW / ILEARN
                 </div>
                 
                 <div className="flex gap-4 flex-1 overflow-hidden">
                   {/* Left Col */}
                   <div className="w-[32%] flex flex-col gap-4">
                      <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex-1">
                        <div className="font-bold text-slate-800 dark:text-slate-200 text-[11px] mb-3">Homeworks (3)</div>
                        <div className="space-y-3">
                          <div className="flex gap-2 items-start">
                            <div className="w-5 h-5 rounded border border-blue-200 flex items-center justify-center bg-blue-50 text-blue-500 flex-shrink-0"><CheckCircle className="w-3 h-3" /></div>
                            <div className="flex-1"><div className="text-[9px] font-bold text-slate-800 dark:text-slate-200 leading-tight">Bioinformatics</div><div className="text-[8px] text-slate-400 truncate">Markov Models</div><div className="text-[8px] text-blue-500 font-semibold mt-1">Due 19 Dec</div></div>
                          </div>
                          <div className="flex gap-2 items-start">
                            <div className="w-5 h-5 rounded border border-slate-200 flex items-center justify-center text-slate-300 flex-shrink-0"><CheckCircle className="w-3 h-3" /></div>
                            <div className="flex-1"><div className="text-[9px] font-bold text-slate-800 dark:text-slate-200 leading-tight">Machine Learning</div><div className="text-[8px] text-slate-400 truncate">CNN Architectures</div><div className="text-[8px] text-blue-500 font-semibold mt-1">Due 24 Dec</div></div>
                          </div>
                        </div>
                      </div>
                   </div>
                   
                   {/* Middle Col */}
                   <div className="w-[42%] flex flex-col gap-4">
                      <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden h-[140px]">
                        <div className="text-blue-600 dark:text-blue-400 font-extrabold text-sm mb-2">Welcome Back, Aditya!</div>
                        <div className="font-bold text-[9px] text-slate-700 dark:text-slate-300 mb-1">Quote of the Day</div>
                        <div className="text-[9px] text-slate-500 dark:text-slate-400 max-w-[70%] leading-relaxed">"Success is no accident. It is hard work, perseverance, learning, studying..."</div>
                        <div className="absolute -right-4 -top-2 w-20 h-20 bg-blue-600 rounded-2xl transform rotate-12 flex items-center justify-center opacity-90 shadow-lg">
                           <FileText className="text-white w-8 h-8 -rotate-12" />
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <div className="font-bold text-[11px] text-slate-800 dark:text-slate-200">Live Study Rooms</div>
                        <div className="text-[9px] text-blue-600 font-bold">+ Create Room</div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-3 border border-indigo-100 dark:border-indigo-800/50 flex-1 relative overflow-hidden">
                          <div className="absolute top-2 right-2 bg-white text-indigo-600 text-[6px] font-bold px-1 rounded">LIVE</div>
                          <div className="text-[10px] font-bold text-indigo-900 dark:text-indigo-100 mb-2 w-[80%] leading-tight">Linear Algebra Finals</div>
                          <div className="text-[8px] text-indigo-600 font-semibold bg-white dark:bg-indigo-900 px-2 py-1 rounded inline-block shadow-sm">Join Room</div>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-3 border border-emerald-100 dark:border-emerald-800/50 flex-1 relative overflow-hidden">
                          <div className="absolute top-2 right-2 bg-white text-emerald-600 text-[6px] font-bold px-1 rounded">LIVE</div>
                          <div className="text-[10px] font-bold text-emerald-900 dark:text-emerald-100 mb-2 w-[80%] leading-tight">ML Group Sync</div>
                          <div className="text-[8px] text-emerald-600 font-semibold bg-white dark:bg-emerald-900 px-2 py-1 rounded inline-block shadow-sm">Join Room</div>
                        </div>
                      </div>
                      
                      <div className="font-bold text-[11px] text-slate-800 dark:text-slate-200 mt-1">Recently Accessed</div>
                      <div className="flex gap-3 flex-1 pb-1">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex-1 shadow-md"></div>
                        <div className="bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex-1 shadow-md"></div>
                      </div>
                   </div>

                   {/* Right Col */}
                   <div className="w-[26%] flex flex-col gap-4">
                      <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex-1">
                        <div className="font-bold text-slate-800 dark:text-slate-200 text-[11px] mb-4">Announcements</div>
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <div className="w-5 h-5 rounded-full bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center flex-shrink-0 text-cyan-500 text-[8px] font-bold">i</div>
                            <div>
                              <div className="text-[9px] font-bold text-slate-800 dark:text-slate-200">Image Processing</div>
                              <div className="text-[8px] text-slate-500 mt-1 leading-tight">Prepare the final project topic from now...</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <div className="w-5 h-5 rounded-full bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center flex-shrink-0 text-cyan-500 text-[8px] font-bold">i</div>
                            <div>
                              <div className="text-[9px] font-bold text-slate-800 dark:text-slate-200">Machine Learning</div>
                              <div className="text-[8px] text-slate-500 mt-1 leading-tight">Always prepare app before class...</div>
                            </div>
                          </div>
                        </div>
                      </div>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-8 border border-emerald-100 dark:border-emerald-800/50 shadow-inner">
              <FileText className="w-8 h-8" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              Official <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">AI Transcripts</span>
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Download beautifully formatted, official-looking academic transcripts with a single click. Our AI analyzes your performance to generate a highly professional, Dean-level written evaluation tailored specifically to your grades.
            </p>
            <button onClick={() => setIsLoginOpen(true)} className="mt-6 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-base font-bold hover:gap-3 transition-all">
              Generate an AI Report <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-teal-400/20 rounded-[3rem] blur-3xl transform rotate-6" />
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
               <div className="w-full bg-[#f1f3f1] p-8 rounded-2xl border border-[#cbd5e1] font-serif shadow-inner">
                 <div className="flex justify-center mb-6 text-[#334155]">
                   <BookOpen className="w-12 h-12" />
                 </div>
                 <div className="text-center text-sm font-bold tracking-[0.2em] text-[#64748b] mb-2">OFFICIAL TRANSCRIPT</div>
                 <div className="text-center text-[11px] font-medium tracking-widest text-[#94a3b8] mb-8 border-b border-[#cbd5e1] pb-6">EVALUATED BY AI DEAN</div>
                 
                 <div className="space-y-4">
                   <div className="h-2.5 bg-[#cbd5e1] rounded-full w-full"></div>
                   <div className="h-2.5 bg-[#cbd5e1] rounded-full w-11/12"></div>
                   <div className="h-2.5 bg-[#cbd5e1] rounded-full w-full"></div>
                   <div className="h-2.5 bg-[#cbd5e1] rounded-full w-4/5"></div>
                   <div className="h-2.5 bg-transparent w-full"></div>
                   <div className="h-2.5 bg-[#cbd5e1] rounded-full w-10/12"></div>
                   <div className="h-2.5 bg-[#cbd5e1] rounded-full w-full"></div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-50 dark:bg-slate-900/30 py-32 border-y border-slate-200 dark:border-slate-800 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">Loved by Scholars</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg font-medium max-w-2xl mx-auto">Don't just take our word for it. See what top scholars are saying about their EduSphere experience.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Sarah Jenkins", role: "Business Administration", quote: "The Official AI Report Card feature is mind-blowing. It perfectly evaluated my 7.2 CGPA and gave me actionable feedback from the 'Dean'!" },
              { name: "Aditya Kumar", role: "Computer Science", quote: "Having an AI Mentor embedded right into my dashboard that can debug my Python data structures has saved me countless hours." },
              { name: "Priya Sharma", role: "Faculty, Mathematics", quote: "EduSphere makes managing curriculum and attendance a breeze. The interface is stunning and the student engagement has skyrocketed." },
            ].map((t, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-2 transition-all duration-300 flex flex-col">
                <Quote className="w-10 h-10 text-blue-100 dark:text-blue-900/50 mb-6" />
                <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed font-medium mb-8">"{t.quote}"</p>
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm">
                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${t.name}&backgroundColor=b6e3f4`} alt={t.name} className="w-full h-full" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-base">{t.name}</div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600 dark:bg-blue-900" />
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/50 to-blue-700/50 mix-blend-overlay" />
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-white/10 rounded-full blur-[120px] mix-blend-overlay pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-cyan-400/20 rounded-full blur-[100px] mix-blend-overlay pointer-events-none" />
        
        <div className="relative max-w-4xl mx-auto px-6 text-center text-white z-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">Ready to transform your academic journey?</h2>
          <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">Join thousands of students already using EduSphere AI to learn faster, manage better, and achieve more.</p>
          <button
            onClick={() => setIsLoginOpen(true)}
            className="px-10 py-5 bg-white text-blue-600 rounded-full text-lg font-bold hover:bg-slate-50 hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-blue-900/50 flex items-center justify-center gap-3 mx-auto group"
          >
            Launch Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-20">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center transform -rotate-12 shadow-lg">
                  <Sparkles className="text-white w-5 h-5 fill-white" />
                </div>
                <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">EduSphere AI</span>
              </div>
              <p className="text-base text-slate-500 dark:text-slate-400 mb-8 leading-relaxed max-w-sm font-medium">
                The intelligent operating system for modern education. Empowering minds with artificial intelligence, elegant design, and seamless experiences.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-sm">Product</h4>
              <ul className="space-y-4 text-base font-medium text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">AI Advisor</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Dashboard</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Official Transcripts</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-sm">Resources</h4>
              <ul className="space-y-4 text-base font-medium text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">University Guidelines</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-sm">Legal</h4>
              <ul className="space-y-4 text-base font-medium text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Data Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-500 font-medium">© 2026 EduSphere Inc. All rights reserved.</div>
            <div className="flex gap-6">
               <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-blue-100 hover:text-blue-600 transition-colors cursor-pointer"><Globe className="w-5 h-5"/></div>
               <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-blue-100 hover:text-blue-600 transition-colors cursor-pointer"><Users className="w-5 h-5"/></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
