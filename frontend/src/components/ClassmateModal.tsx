import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  MessageSquare,
  GraduationCap,
  Clock,
  Send,
  Check,
} from "lucide-react";

interface Classmate {
  name: string;
  img: string;
  online: boolean;
  role?: string;
  major?: string;
  about?: string;
}

interface ClassmateModalProps {
  isOpen: boolean;
  onClose: () => void;
  classmate: Classmate | null;
  mode: "profile" | "message";
}

export function ClassmateModal({
  isOpen,
  onClose,
  classmate,
  mode,
}: ClassmateModalProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "message">(mode);
  const [messageText, setMessageText] = useState("");
  const [sentMsg, setSentMsg] = useState(false);

  // Sync tab with mode prop when opened
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(mode);
      setSentMsg(false);
      setMessageText("");
    }
  }, [isOpen, mode]);

  if (!classmate) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800"
          >
            {/* Header / Cover */}
            <div className="h-32 bg-gradient-to-r from-blue-500 to-cyan-500 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="px-6 pb-6 relative">
              <div className="flex justify-between items-end -mt-12 mb-4 relative z-10">
                <div className="relative">
                  <img
                    src={classmate.img}
                    alt={classmate.name}
                    className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-900 object-cover bg-white"
                  />
                  {classmate.online && (
                    <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" />
                  )}
                </div>
                <div className="flex gap-2 pb-2">
                  <button
                    onClick={() => setActiveTab("message")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 text-sm font-bold transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {classmate.name}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {classmate.role || "Computer Science Student"}
                </p>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 mt-6 mb-6">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`pb-3 px-4 text-sm font-bold transition-colors relative ${
                    activeTab === "profile"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  Profile
                  {activeTab === "profile" && (
                    <motion.div
                      layoutId="classmate-tab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                    />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("message")}
                  className={`pb-3 px-4 text-sm font-bold transition-colors relative ${
                    activeTab === "message"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  Send Message
                  {activeTab === "message" && (
                    <motion.div
                      layoutId="classmate-tab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                    />
                  )}
                </button>
              </div>

              {/* Tab Content */}
              <div className="min-h-[160px]">
                {activeTab === "profile" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                        About
                      </h3>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {classmate.about ||
                          `Hi, I'm ${classmate.name}. I'm currently studying Computer Science and I'm interested in software development and artificial intelligence. Let's collaborate!`}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-start gap-2">
                        <GraduationCap className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-500">
                            Major
                          </p>
                          <p className="text-sm text-slate-900 dark:text-white font-medium">
                            {classmate.major || "Computer Science (MCA)"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-500">
                            Local Time
                          </p>
                          <p className="text-sm text-slate-900 dark:text-white font-medium">
                            IST (GMT +5:30)
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "message" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col h-full"
                  >
                    {!sentMsg ? (
                      <>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl mb-4 border border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
                          <p>
                            Send a direct message to {classmate.name}. They will
                            receive a notification.
                          </p>
                        </div>
                        <textarea
                          placeholder={`Type your message to ${classmate.name}...`}
                          className="w-full h-24 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-4"
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                        />
                        <button
                          onClick={() => setSentMsg(true)}
                          disabled={!messageText.trim()}
                          className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold py-2.5 px-4 rounded-xl transition-colors"
                        >
                          <Send className="w-4 h-4" />
                          Send Message
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center mb-4">
                          <Check className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                          Message Sent!
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                          Your message has been sent to {classmate.name}.
                        </p>
                        <button
                          onClick={() => {
                            setSentMsg(false);
                            setMessageText("");
                            onClose();
                          }}
                          className="text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Close Window
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
