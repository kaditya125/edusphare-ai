import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  FileText,
  Activity,
  MessageSquare,
  Briefcase,
  Database,
  Shield,
  Upload,
  X,
  CheckCircle2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";

const queryData = [
  { time: "00:00", queries: 120 },
  { time: "04:00", queries: 80 },
  { time: "08:00", queries: 450 },
  { time: "12:00", queries: 890 },
  { time: "16:00", queries: 750 },
  { time: "20:00", queries: 320 },
];

export function AdminDashboard({ setView }: { setView: (v: any) => void }) {
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success"
  >("idle");

  const handleBulkUpload = () => {
    setUploadStatus("uploading");
    // Simulate upload delay
    setTimeout(() => {
      setUploadStatus("success");
      setTimeout(() => {
        setUploadStatus("idle");
        setIsBulkUploadModalOpen(false);
      }, 2000);
    }, 2000);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-background p-8 relative">
      <AnimatePresence>
        {isBulkUploadModalOpen && (
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
              className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-500" />
              <button
                onClick={() => setIsBulkUploadModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Bulk Upload Notices
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Upload a CSV or Excel file containing multiple notices to
                  broadcast to students.
                </p>
              </div>

              {uploadStatus === "idle" && (
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                    <FileText className="w-10 h-10 text-slate-400 mb-4" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Click to browse or drag and drop
                    </p>
                    <p className="text-xs text-slate-500">
                      CSV, XLSX (Max. 5MB)
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                    <Database className="w-5 h-5 text-blue-600 shrink-0" />
                    <p className="text-xs text-blue-800 dark:text-blue-300 font-medium">
                      Please ensure your file has columns: Title, Content,
                      Category, and Date.
                    </p>
                  </div>
                  <div className="flexjustify-end pt-2">
                    <button
                      onClick={handleBulkUpload}
                      className="w-full bg-blue-600 text-white rounded-xl py-3.5 text-sm font-bold shadow-md hover:shadow-lg hover:bg-blue-700 transition-all"
                    >
                      Upload & Process
                    </button>
                  </div>
                </div>
              )}

              {uploadStatus === "uploading" && (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 border-4 border-blue-100 dark:border-slate-700 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin mb-6" />
                  <p className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    Processing file...
                  </p>
                  <p className="text-sm text-slate-500">
                    Validating and indexing notices
                  </p>
                </div>
              )}

              {uploadStatus === "success" && (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <p className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    Upload complete!
                  </p>
                  <p className="text-sm text-slate-500">
                    24 notices have been added to the database.
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary-500" />
              Admin Portal
            </h1>
            <p className="text-slate-700 dark:text-slate-300 mt-1">
              Enterprise management and platform analytics.
            </p>
          </div>
          <button
            onClick={() => setView("dashboard")}
            className="px-4 py-2 hover:bg-surface border border-border/50 text-slate-800 dark:text-slate-200 rounded-xl transition-colors text-sm font-medium"
          >
            Exit Admin
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Students",
              value: "15,234",
              icon: Users,
              color: "text-blue-600 dark:text-blue-400",
              bg: "bg-blue-500/10",
            },
            {
              label: "Active Faculty",
              value: "450",
              icon: Briefcase,
              color: "text-indigo-600 dark:text-indigo-400",
              bg: "bg-indigo-500/10",
            },
            {
              label: "Daily AI Queries",
              value: "8,432",
              icon: MessageSquare,
              color: "text-emerald-600 dark:text-emerald-400",
              bg: "bg-emerald-400/10",
            },
            {
              label: "Indexed Docs",
              value: "1,204",
              icon: Database,
              color: "text-amber-600 dark:text-amber-400",
              bg: "bg-amber-500/10",
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-3xl bg-surface border border-border/50 flex items-center gap-4 hover:border-primary-500/30 transition-colors"
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-mono text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-3xl bg-surface border border-border/50 flex flex-col h-full">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                AI Query Volume (Today)
              </h3>
              <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={queryData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="queryColor"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#06b6d4"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#06b6d4"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="time"
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "#111827",
                        borderColor: "#1e293b",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="queries"
                      stroke="#06b6d4"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#queryColor)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-surface border border-border/50 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Notice Board Management
                </h3>
                <button
                  onClick={() => setIsBulkUploadModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Upload className="w-4 h-4" />
                  Bulk Upload Notices
                </button>
              </div>
              <p className="text-sm text-slate-500 mb-6">
                Manage institution-wide announcements and targeted class
                notices.
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-border/50">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        Exam Schedule Updated
                      </p>
                      <p className="text-xs text-slate-500">
                        24 mins ago • University Wide
                      </p>
                    </div>
                  </div>
                  <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                    Edit
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-border/50">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-cyan-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        Hackathon Registration
                      </p>
                      <p className="text-xs text-slate-500">
                        2 hours ago • CS Department
                      </p>
                    </div>
                  </div>
                  <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-surface border border-border/50 flex flex-col">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
              System Health
            </h3>
            <div className="flex-1 space-y-6">
              {[
                {
                  label: "API Response Time",
                  value: "124ms",
                  status: "optimal",
                },
                { label: "Database Load", value: "34%", status: "optimal" },
                {
                  label: "Vector Search Latency",
                  value: "45ms",
                  status: "optimal",
                },
                {
                  label: "Model Fallback Rate",
                  value: "0.2%",
                  status: "warning",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Activity
                      className={`w-4 h-4 ${item.status === "optimal" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}
                    />
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <button className="w-full mt-auto py-3 bg-card border border-border/50 hover:bg-slate-900/5 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200 rounded-xl text-sm font-semibold transition-colors">
              View Detailed Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
