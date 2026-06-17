import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Pin, Calendar as CalIcon, ChevronRight, FileText, X, Download, Share2, Bot, Send, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";
import api from "../services/api";
import { Pagination } from "./Pagination";

interface Notice {
  id: string;
  title: string;
  category: string;
  date: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  pinned: boolean;
}
export function NoticeBoard() {
  const [filter, setFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // AI Chat states
  const [chatMessages, setChatMessages] = useState<{role: 'user'|'ai', content: string}[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const categories = ["All", "Academic", "General", "Student Life", "Admin"];

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await api.get('/notices');
        setNotices(res.data);
      } catch (error) {
        console.error("Failed to fetch notices", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotices();
  }, []);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !selectedNoticeId) return;

    const newMsg = currentMessage;
    setCurrentMessage("");
    setChatMessages(prev => [...prev, { role: 'user', content: newMsg }]);
    setIsChatLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/api/notices/${selectedNoticeId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ prompt: newMsg })
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = "";

      setChatMessages(prev => [...prev, { role: 'ai', content: '' }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6);
            if (!dataStr) continue;
            
            try {
              const data = JSON.parse(dataStr);
              if (data.type === 'token') {
                aiResponse += data.token;
                setChatMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1].content = aiResponse;
                  return newMsgs;
                });
              }
            } catch (e) {
              console.error("Error parsing stream data", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error", error);
      setChatMessages(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble analyzing this notice right now." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Simulate download
    alert("Downloading PDF attachment...");
  };

  const handleShare = (e: React.MouseEvent, title: string) => {
    e.stopPropagation();
    // Simulate share
    navigator.clipboard.writeText(`Check out this notice: ${title}`);
    alert("Notice link copied to clipboard!");
  };

  const selectedNotice = notices.find((n) => n.id === selectedNoticeId);

  return (
    <div className="flex-1 h-full overflow-y-auto bg-background p-8 relative">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Notice Board
          </h1>
          <p className="text-slate-700 dark:text-slate-300 mt-1">
            Stay updated with the latest campus announcements.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setFilter(category);
                setCurrentPage(1);
              }}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap",
                filter === category
                  ? "bg-primary-600 text-white shadow-md shadow-primary-500/20"
                  : "bg-surface border border-border/50 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-slate-100 hover:bg-slate-900/5 dark:hover:bg-white/5",
              )}
            >
              {category}
            </button>
          ))}
        </div>

        <motion.div layout className="space-y-4">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
              </div>
            ) : (() => {
              const filteredNotices = notices.filter(
                (notice) => filter === "All" || notice.category === filter
              );
              const totalPages = Math.ceil(filteredNotices.length / itemsPerPage);
              const paginatedNotices = filteredNotices.slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage
              );

              return (
                <>
                  {paginatedNotices.map((notice, i) => (
                    <motion.div
                      layoutId={`notice-${notice.id}`}
                      key={notice.id}
                      onClick={() => setSelectedNoticeId(notice.id)}
                      initial={{ opacity: 0, x: -20, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "group p-6 rounded-3xl bg-surface/50 border transition-all duration-300 relative overflow-hidden cursor-pointer",
                        notice.pinned
                          ? "border-primary-500/30 bg-primary-900/10 shadow-[0_0_30px_-15px_rgba(59,130,246,0.3)]"
                          : "border-border/50 hover:border-slate-600",
                      )}
                    >
                      {notice.pinned && (
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary-500/20 to-transparent flex items-start justify-end p-3">
                          <Pin className="w-4 h-4 text-primary-600 dark:text-primary-400 -rotate-45" />
                        </div>
                      )}

                      <div className="flex items-center gap-3 mb-3 text-xs font-medium">
                        <span
                          className={cn(
                            "font-mono uppercase text-[10px] tracking-widest px-2.5 py-1 rounded-md border",
                            notice.priority === "high"
                              ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                              : notice.priority === "medium"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
                          )}
                        >
                          {notice.category}
                        </span>
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-500">
                          <CalIcon className="w-3.5 h-3.5" />
                          {notice.date}
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-primary-600 dark:text-primary-400 transition-colors pr-8">
                        {notice.title}
                      </h3>

                      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-6 line-clamp-2">
                        {notice.description}
                      </p>

                      <div className="flex items-center justify-between mt-4">
                        <button 
                          onClick={handleDownload}
                          className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white transition-colors bg-card hover:bg-slate-900/10 dark:bg-white/10 px-3 py-1.5 rounded-lg border border-border/50"
                        >
                          <FileText className="w-4 h-4" />
                          View PDF
                        </button>

                        <button className="flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-300 transition-colors">
                          Read More
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </>
              );
            })()}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Detail Modal overlay */}
      <AnimatePresence>
        {selectedNotice && (
          <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 rounded-xl"
                onClick={() => {
                  setSelectedNoticeId(null);
                  setShowChat(false);
                  setChatMessages([]);
                }}
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                layoutId={`notice-${selectedNotice.id}`}
                className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]"
              >
                {/* Print Header styling inside Modal */}
                <div className="p-8 md:p-12 overflow-y-auto bg-[#fcfcf9] dark:bg-slate-900 relative font-serif text-slate-900 dark:text-slate-100">
                  {/* Outer border decoration for paper feel */}
                  <div className="absolute inset-4 sm:inset-6 border-[3px] border-double border-slate-800 dark:border-slate-500 pointer-events-none opacity-50"></div>

                  {/* Subtle water mark */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.05] pointer-events-none select-none">
                     <span className="text-[8rem] sm:text-[12rem] font-serif font-black rotate-[-30deg]">OFFICIAL</span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedNoticeId(null);
                      setShowChat(false);
                      setChatMessages([]);
                    }}
                    className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-200 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors z-20 group"
                  >
                    <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
                  
                  <div className="relative z-10 px-2 sm:px-6">
                    {/* Official Notice Header */}
                    <div className="border-b-[3px] border-slate-900 dark:border-slate-300 pb-8 mb-8">
                       <div className="flex flex-col items-center text-center gap-4 mb-8">
                          <div className="w-20 h-20 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-full flex items-center justify-center text-3xl shadow-md border-4 border-[#fcfcf9] dark:border-slate-900 ring-4 ring-slate-900 dark:ring-slate-100 shrink-0">
                             🎓
                          </div>
                          <div>
                             <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-[0.2em] mb-1">EduSphere Univ.</h2>
                             <p className="text-sm sm:text-base font-bold text-slate-500 dark:text-slate-400 tracking-[0.3em] uppercase">Office of the Registrar</p>
                          </div>
                       </div>
                       
                       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 text-sm font-semibold tracking-wide">
                          <div className="space-y-1">
                             <p><span className="text-slate-500 dark:text-slate-400">Ref No:</span> EDU/2026/N-{selectedNotice.id.replace('n', '').padStart(4, '0')}</p>
                             <p><span className="text-slate-500 dark:text-slate-400">Section:</span> {selectedNotice.category}</p>
                          </div>
                          <div className="space-y-1 text-left sm:text-right">
                             <p><span className="text-slate-500 dark:text-slate-400">Date:</span> {selectedNotice.date}</p>
                             <p><span className="text-slate-500 dark:text-slate-400">Format:</span> Official Notification</p>
                          </div>
                       </div>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black text-center mb-10 uppercase tracking-[0.15em] relative inline-block left-1/2 -translate-x-1/2">
                       Internal Notification
                       <div className="absolute -bottom-3 left-0 right-0 h-1 bg-slate-900 dark:bg-slate-200"></div>
                       <div className="absolute -bottom-4 left-0 right-0 h-px bg-slate-900 dark:bg-slate-200"></div>
                    </h1>

                    {/* Structured Details */}
                    <div className="space-y-8">
                        <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-y-4 gap-x-4 text-base sm:text-lg">
                            <div className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-sm mt-1">To:</div>
                            <div className="font-black">All Students & Relevant Faculty ({selectedNotice.category})</div>
                            
                            <div className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-sm mt-1">From:</div>
                            <div className="font-black">University Administration</div>
                            
                            <div className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-sm mt-1">Subject:</div>
                            <div className="font-black text-lg sm:text-xl uppercase underline underline-offset-4 decoration-2">{selectedNotice.title}</div>
                        </div>
                        
                        {/* Body Content */}
                        <div className="prose prose-lg dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed text-justify font-serif">
                            <p className="font-bold">Sir/Madam,</p>
                            <p>{selectedNotice.description}</p>
                            <p>It is hereby notified for the information of all concerned that the following schedule and arrangements have been finalized. All participants are requested to adhere strictly to the given timings and venue instructions.</p>
                            <p>This issues with the approval of the competent authority.</p>
                        </div>

                        {/* Associated Schedule Table / Details */}
                        <div className="mt-10 overflow-hidden border-2 border-slate-900 dark:border-slate-600">
                            <div className="bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 flex items-center justify-center gap-2">
                               <h4 className="font-black text-sm uppercase tracking-[0.2em]">Associated Schedule of Events</h4>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm sm:text-base text-left font-serif border-collapse">
                                    <thead className="bg-slate-100 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 uppercase text-xs sm:text-sm tracking-wider font-bold">
                                        <tr>
                                            <th className="px-4 py-3 border-b-2 border-r-2 border-slate-900 dark:border-slate-600">Date/Day</th>
                                            <th className="px-4 py-3 border-b-2 border-r-2 border-slate-900 dark:border-slate-600">Time</th>
                                            <th className="px-4 py-3 border-b-2 border-r-2 border-slate-900 dark:border-slate-600">Activity / Event</th>
                                            <th className="px-4 py-3 border-b-2 border-slate-900 dark:border-slate-600">Venue</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y-2 divide-slate-900 dark:divide-slate-600 text-slate-900 dark:text-slate-100 font-medium">
                                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-4 py-4 whitespace-nowrap border-r-2 border-slate-900 dark:border-slate-600">{selectedNotice.date}</td>
                                            <td className="px-4 py-4 whitespace-nowrap font-bold border-r-2 border-slate-900 dark:border-slate-600">09:00 AM</td>
                                            <td className="px-4 py-4 font-semibold border-r-2 border-slate-900 dark:border-slate-600">Commencement / Briefing</td>
                                            <td className="px-4 py-4">Main Auditorium</td>
                                        </tr>
                                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors bg-slate-100/50 dark:bg-slate-800/10">
                                            <td className="px-4 py-4 whitespace-nowrap border-r-2 border-slate-900 dark:border-slate-600">{selectedNotice.date}</td>
                                            <td className="px-4 py-4 whitespace-nowrap font-bold border-r-2 border-slate-900 dark:border-slate-600">10:30 AM</td>
                                            <td className="px-4 py-4 font-semibold border-r-2 border-slate-900 dark:border-slate-600">Primary Sessions / Execution</td>
                                            <td className="px-4 py-4">Respective Departments</td>
                                        </tr>
                                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-4 py-4 whitespace-nowrap border-r-2 border-slate-900 dark:border-slate-600">{selectedNotice.date}</td>
                                            <td className="px-4 py-4 whitespace-nowrap font-bold border-r-2 border-slate-900 dark:border-slate-600">04:00 PM</td>
                                            <td className="px-4 py-4 font-semibold border-r-2 border-slate-900 dark:border-slate-600">Conclusion / Wrap-up</td>
                                            <td className="px-4 py-4">Main Auditorium</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        {/* Signatory */}
                        <div className="mt-16 pt-8 flex justify-end">
                           <div className="text-center">
                              <div className="w-56 mb-2 relative">
                                 <img src="https://upload.wikimedia.org/wikipedia/commons/f/f6/Signature_of_John_Hancock.svg" alt="Signature" className="w-40 h-16 mx-auto opacity-90 dark:invert" />
                                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none mix-blend-multiply dark:mix-blend-lighten">
                                    <div className="w-24 h-24 rounded-full border-4 border-blue-800 flex items-center justify-center -rotate-[15deg]">
                                       <span className="text-xs font-black text-blue-800 uppercase text-center leading-none">Official<br/>Seal</span>
                                    </div>
                                 </div>
                              </div>
                              <div className="border-t-2 border-slate-900 dark:border-slate-400 pt-2 mx-auto inline-block px-4">
                                  <p className="text-base font-black uppercase tracking-wider">Dr. Arthur Pendelton</p>
                                  <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase mt-0.5">Registrar, EduSphere Univ.</p>
                              </div>
                           </div>
                        </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between gap-3 mt-auto flex-wrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowChat(!showChat)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 font-medium rounded-xl transition-colors shadow-sm",
                        showChat 
                          ? "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                          : "bg-primary-600 text-white hover:bg-primary-700"
                      )}
                    >
                      <Bot className="w-4 h-4" />
                      {showChat ? "Close AI Assistant" : "Ask AI About Notice"}
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={(e) => handleShare(e, selectedNotice.title)}
                      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                    <button 
                      onClick={handleDownload}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                  </div>
                </div>

                {/* AI Chat Inline Panel */}
                <AnimatePresence>
                  {showChat && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 pointer-events-auto"
                    >
                      <div className="p-6 h-[300px] flex flex-col">
                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
                          {chatMessages.length === 0 && (
                            <div className="text-center text-slate-500 dark:text-slate-400 mt-8">
                              <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p>Ask me anything about this notice!</p>
                            </div>
                          )}
                          {chatMessages.map((msg, idx) => (
                            <div key={idx} className={cn(
                              "max-w-[85%] rounded-2xl p-3 text-sm",
                              msg.role === 'user' 
                                ? "bg-primary-600 text-white ml-auto rounded-br-sm" 
                                : "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 mr-auto border border-slate-200 dark:border-slate-600 rounded-bl-sm"
                            )}>
                              {msg.content}
                            </div>
                          ))}
                          {isChatLoading && (
                            <div className="bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 mr-auto border border-slate-200 dark:border-slate-600 rounded-bl-sm rounded-2xl p-3 w-fit">
                              <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                            </div>
                          )}
                        </div>
                        
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={currentMessage}
                            onChange={(e) => setCurrentMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Ask a question..."
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-primary-500 dark:text-white"
                          />
                          <button
                            onClick={handleSendMessage}
                            disabled={!currentMessage.trim() || isChatLoading}
                            className="absolute right-2 p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg disabled:opacity-50"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
