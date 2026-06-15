import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Link as LinkIcon,
  MoreHorizontal,
  Settings,
  Calendar,
  Flag,
  Plus,
  MessageSquare,
  Sparkles,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ChevronDown,
  Circle,
  FileText,
  Maximize2,
  Minimize2,
  X,
  Send,
  Loader2,
} from "lucide-react";
import { Document } from "../types";
import api from "../services/api";

interface DocumentDetailProps {
  document: any;
  onBack: () => void;
}

export function DocumentDetail({ document, onBack }: DocumentDetailProps) {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatPrompt, setChatPrompt] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: `Hello! I have analyzed "${document.originalName || document.name}". How can I help you?` }
  ]);

  const [fullDocument, setFullDocument] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"pdf" | "text">("pdf");
  const [selectedText, setSelectedText] = useState("");
  const [selectionCoords, setSelectionCoords] = useState<{ x: number; y: number } | null>(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (document._id) {
      api.get(`/documents/${document._id}`).then(res => setFullDocument(res.data)).catch(console.error);
    }
  }, [document._id]);

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      
      if (text) {
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();
        if (rect && text.length > 5) {
          setSelectionCoords({
            x: rect.left + rect.width / 2,
            y: rect.top - 10
          });
          setSelectedText(text);
          setAiAnalysisResult("");
        }
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if ((e.target as Element).closest('.ai-toolbar')) return;
      setSelectionCoords(null);
      setSelectedText("");
    };

    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousedown", handleMouseDown);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  const handleAiAction = async (action: "summarize" | "explain") => {
    if (!selectedText) return;
    setIsAnalyzing(true);
    try {
      const res = await api.post(`/documents/${document._id}/analyze-text`, {
        selectedText,
        action
      });
      setAiAnalysisResult(res.data.response);
    } catch (error) {
      console.error("AI Action error", error);
      setAiAnalysisResult("Sorry, I could not process this text.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleChatSubmit = async () => {
    if (!chatPrompt.trim() || !document._id) return;

    const userMessage = chatPrompt;
    setChatMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setChatPrompt("");
    setIsChatLoading(true);

    try {
      const res = await api.post(`/documents/${document._id}/chat`, { prompt: userMessage });
      setChatMessages((prev) => [...prev, { role: "ai", text: res.data.response }]);
    } catch (error) {
      console.error("Chat error", error);
      setChatMessages((prev) => [...prev, { role: "ai", text: "Sorry, I encountered an error processing your request. Please make sure the document is fully indexed." }]);
    } finally {
      setIsChatLoading(false);
    }
  };



  return (
    <motion.div
      layout
      className={`flex-1 flex flex-col bg-white dark:bg-slate-900 ${
        isFocusMode
          ? "fixed inset-0 z-[100] w-screen h-screen"
          : "absolute inset-0 z-10 w-full h-full"
      }`}
    >
      {/* Top Bar */}
      <div className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 bg-white dark:bg-slate-900 transition-all">
        <div className="flex items-center gap-4">
          {!isFocusMode && (
            <button
              onClick={onBack}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            {!isFocusMode && (
              <>
                <span>Knowledge</span>
                <span className="text-slate-300 dark:text-slate-700">/</span>
              </>
            )}
            <span className="text-slate-900 dark:text-white capitalize">
              {(document.originalName || document.name || "").replace(".pdf", "").replace(/_/g, " ")}
            </span>
            {isFocusMode && (
              <span className="ml-2 px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full border border-blue-200 dark:border-blue-500/20">
                Focus Mode
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mr-2">
            <button
              onClick={() => setViewMode("pdf")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                viewMode === "pdf"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Original PDF
            </button>
            <button
              onClick={() => setViewMode("text")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                viewMode === "text"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Plain Text
            </button>
          </div>
          {isFocusMode && (
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                isChatOpen
                  ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AI Chat
            </button>
          )}
          <button
            onClick={() => setIsFocusMode(!isFocusMode)}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors border ${
              isFocusMode
                ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 dark:hover:bg-blue-500/20"
                : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            }`}
          >
            {isFocusMode ? (
              <>
                <Minimize2 className="w-4 h-4" />
                <span>Exit Focus</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" />
                <span>Focus Mode</span>
              </>
            )}
          </button>

        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div
          className={`flex-1 overflow-y-auto px-8 md:px-12 py-10 relative transition-all ${isFocusMode ? "max-w-4xl mx-auto" : ""}`}
        >
          <div
            className={`${isFocusMode ? "max-w-3xl mx-auto" : "max-w-3xl mx-auto"}`}
          >
            <h1 className="text-3xl md:text-[2.5rem] font-bold text-slate-900 dark:text-white leading-tight capitalize">
              {(document.originalName || document.name || "").replace(".pdf", "").replace(/_/g, " ")}
            </h1>
            <p className="text-sm text-slate-500 mb-12">Updated 8 mins ago</p>

            <div
              className={`max-w-none mb-16 relative text-slate-700 dark:text-slate-300 text-[15px] ${isFocusMode ? "text-[17px] leading-relaxed" : ""}`}
            >


              {viewMode === "pdf" ? (
                <div className="w-full h-[80vh] min-h-[800px] bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                  <iframe 
                    src={`http://localhost:5000/uploads/${document.filename}`}
                    className="w-full h-full border-none"
                    title={document.originalName}
                  />
                </div>
              ) : (
                <>
                  {fullDocument?.extractedText ? (
                    fullDocument.extractedText.split('\n\n').map((paragraph: string, idx: number) => (
                      <p key={idx} className="mb-6 leading-relaxed whitespace-pre-wrap">
                        {paragraph}
                      </p>
                    ))
                  ) : (
                    <div className="flex items-center justify-center p-12 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                      <p className="text-slate-500">Document text is not available or still processing.</p>
                    </div>
                  )}
                </>
              )}

              {/* AI Selection Toolbar */}
              <AnimatePresence>
                {selectionCoords && selectedText && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="ai-toolbar fixed z-50 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col min-w-[300px] max-w-md transform -translate-x-1/2 -translate-y-full"
                    style={{ left: selectionCoords.x, top: selectionCoords.y }}
                  >
                    <div className="flex items-center p-1.5 gap-1 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/50 rounded-t-xl">
                      <button 
                        onClick={() => handleAiAction('summarize')}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                      >
                        <Sparkles className="w-4 h-4" /> Summarize
                      </button>
                      <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
                      <button 
                        onClick={() => handleAiAction('explain')}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" /> Explain
                      </button>
                    </div>
                    
                    {(isAnalyzing || aiAnalysisResult) && (
                      <div className="p-4 text-sm text-slate-700 dark:text-slate-300 max-h-64 overflow-y-auto">
                        {isAnalyzing ? (
                          <div className="flex items-center gap-2 text-indigo-500 font-medium">
                            <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
                          </div>
                        ) : (
                          <div className="prose prose-sm dark:prose-invert">
                            {aiAnalysisResult}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Activity Section */}
            {!isFocusMode && (
              <div className="border-t border-slate-200 dark:border-slate-800 pt-10">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8">
                  Activity
                </h3>

                <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
                  {/* Event 1 */}
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-white dark:bg-slate-800 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 overflow-hidden">
                      <img
                        src="https://api.dicebear.com/7.x/notionists/svg?seed=Kevin&backgroundColor=ffd8b4"
                        alt="Kevin"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] ml-4 md:ml-0 md:px-0">
                      <div className="flex flex-col mb-1">
                        <div className="text-sm">
                          <span className="font-bold text-slate-900 dark:text-white mr-1.5">
                            Kevin Dukkon
                          </span>
                          <span className="text-slate-500">commented</span>
                        </div>
                        <span className="text-xs text-slate-400">19m ago</span>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-sm text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800/50">
                        Lorem ipsum is placeholder text commonly used in the
                        graphic
                      </div>
                    </div>
                  </div>

                  {/* Event 2 */}
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-amber-50 dark:bg-amber-500/10 text-amber-500 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ml-1">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] ml-5 md:ml-0 md:px-0">
                      <div className="text-sm">
                        <span className="font-bold text-slate-900 dark:text-white mr-1.5">
                          Kevin Dukkon
                        </span>
                        <span className="text-slate-500">
                          changed status from{" "}
                        </span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          Draft
                        </span>
                        <span className="text-slate-500"> to </span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          In Progress
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        19m ago
                      </div>
                    </div>
                  </div>

                  {/* Event 3 */}
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-[#5b58ed]/10 text-[#5b58ed] shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ml-1">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] ml-5 md:ml-0 md:px-0">
                      <div className="text-sm">
                        <span className="font-bold text-slate-900 dark:text-white mr-1.5">
                          Monty Hayton
                        </span>
                        <span className="text-slate-500">created the </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          Document Audit and Review
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Yesterday
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comment Input */}
                <div className="mt-8 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 p-3 shadow-sm focus-within:border-[#5b58ed] transition-colors relative z-20">
                  <textarea
                    rows={2}
                    placeholder="Leave a comment..."
                    className="w-full bg-transparent resize-none outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                  ></textarea>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex gap-1" />
                    <button className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-semibold">
                      Post
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Chat Panel - Focus Mode */}
        <AnimatePresence>
          {isFocusMode && isChatOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col items-stretch shrink-0 will-change-auto h-full"
            >
              <div className="p-6 w-80 border-b border-slate-200 dark:border-slate-800 shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-[15px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    AI Document Chat
                  </h2>
                  <button
                    onClick={() => setIsChatOpen(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-bl-sm shadow-sm'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl rounded-bl-sm shadow-sm">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
                <div className="relative flex items-center">
                  <input 
                    type="text"
                    value={chatPrompt}
                    onChange={(e) => setChatPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
                    placeholder="Ask a question..."
                    className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                  <button 
                    onClick={handleChatSubmit}
                    disabled={isChatLoading}
                    className="absolute right-1.5 w-7 h-7 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Sidebar - Properties */}
        {!isFocusMode && (
          <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0 p-6 overflow-y-auto">
            <h2 className="text-[15px] font-bold text-slate-900 dark:text-white mb-6">
              Properties
            </h2>

            <div className="space-y-6">
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">
                  Status
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <Settings className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                    In Progress
                  </span>
                </button>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">
                  Due Date
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                    Nov 10, 2024
                  </span>
                </button>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">
                  Priority
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <Flag className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                    Low
                  </span>
                </button>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">
                  Assign To
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-full pr-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="w-5 h-5 rounded-full overflow-hidden bg-[#ff79d3]">
                    <img
                      src="https://api.dicebear.com/7.x/notionists/svg?seed=Alan"
                      alt="Alan"
                      className="w-full h-full"
                    />
                  </div>
                  <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                    Alan Turing
                  </span>
                </button>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">
                  Tags
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Feature",
                    "Improvement",
                    "Review",
                    "Audit",
                    "Document",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-[13px] font-medium text-slate-600 dark:text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                  <button className="w-8 h-[34px] flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-600 bg-transparent rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
