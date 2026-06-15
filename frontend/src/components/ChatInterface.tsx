import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Send,
  Paperclip,
  Mic,
  FileText,
  Cpu,
  MoreHorizontal,
  ChevronDown,
  Wand2,
  Star,
  Search,
  Plus,
  Sparkles,
  Square,
  MessageSquare,
  Edit2,
  Trash2,
  History,
  GraduationCap,
  Code2,
  Building,
  Check,
  Folder,
  FolderPlus,
  ChevronRight,
  Bell,
  ExternalLink,
  Activity,
  Copy,
  PanelRight,
} from "lucide-react";
import { ChatMessage } from "../types";
import { initialChatMessages } from "../data/mockData";
import { Skeleton } from "./Skeleton";
import { ThemeToggle } from "./ThemeToggle";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

type Persona = "mentor" | "tutor" | "agent";

// Removed TypewriterText because the backend streams responses natively in real-time

const CodeBlock = ({ language, code }: { language: string; code: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg overflow-hidden my-4 bg-[#1e1e1e] border border-slate-700">
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#2d2d2d] border-b border-slate-700 text-slate-300 text-xs font-mono">
        <span>{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-white transition-colors py-1"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        style={materialDark as any}
        language={language}
        PreTag="div"
        customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

const COMMON_QUESTIONS = [
  "Show my attendance",
  "What is my current GPA?",
  "Show my semester exam schedule",
  "Where is the library located?",
  "How do I apply for a leave of absence?",
];

export function ChatInterface() {
  type ChatThread = { id: string; title: string; folderId?: string | null; messages: ChatMessage[] };
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<Persona>("mentor");
  const [isRightPaneOpen, setIsRightPaneOpen] = useState(true);
  const [usageStats, setUsageStats] = useState<{ totalQueries: number; growthPercentage: number; dailyData: { day: string; queries: number }[] }>({
    totalQueries: 0,
    growthPercentage: 0,
    dailyData: [
      { day: "Sun", queries: 0 }, { day: "Mon", queries: 0 }, { day: "Tue", queries: 0 },
      { day: "Wed", queries: 0 }, { day: "Thu", queries: 0 }, { day: "Fri", queries: 0 }, { day: "Sat", queries: 0 }
    ]
  });

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch("http://localhost:5000/api/chat/history", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const history = await res.json();
        if (history && history.length > 0) {
           const threads = history.map((h: any) => ({ id: h._id, title: h.title, folderId: null, messages: [] }));
           setChatThreads(threads);
           setActiveThreadId(null);
        } else {
           setChatThreads([]);
           setActiveThreadId(null);
        }
      } catch (err) {
        console.error(err);
      }
    };

    const fetchAnalytics = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/chat/analytics", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await response.json();
        setUsageStats(data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      }
    };

    fetchHistory();
    fetchAnalytics();
  }, []);

  const activeThread = chatThreads.find(t => t.id === activeThreadId);
  const messages = activeThread ? activeThread.messages : [];

  const [folders, setFolders] = useState<{ id: string; name: string }[]>([
    { id: "f1", name: "General/Admissions" },
    { id: "f2", name: "Mathematics" },
    { id: "f3", name: "Computer Science" },
    { id: "f4", name: "Physics" },
  ]);
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editThreadName, setEditThreadName] = useState("");
  const [isCommonQuestionsOpen, setIsCommonQuestionsOpen] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [placeholderText, setPlaceholderText] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentQuestion = COMMON_QUESTIONS[placeholderIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && placeholderText === currentQuestion) {
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && placeholderText === "") {
      setIsDeleting(false);
      setPlaceholderIndex((prev) => (prev + 1) % COMMON_QUESTIONS.length);
    } else {
      const nextText = isDeleting
        ? currentQuestion.substring(0, placeholderText.length - 1)
        : currentQuestion.substring(0, placeholderText.length + 1);

      timeout = setTimeout(
        () => setPlaceholderText(nextText),
        isDeleting ? 30 : 60
      );
    }

    return () => clearTimeout(timeout);
  }, [placeholderText, isDeleting, placeholderIndex]);


  const personas = {
    mentor: {
      name: "Academic Mentor",
      icon: GraduationCap,
      desc: "Guidance & study planning",
    },
    tutor: {
      name: "Technical Tutor",
      icon: Code2,
      desc: "Coding & concept help",
    },
    agent: {
      name: "Campus Info Agent",
      icon: Building,
      desc: "Timetables & facilities",
    },
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const w = window as any;
      const SpeechRecognition =
        w.SpeechRecognition || w.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result) => result.transcript)
            .join("");
          setInputValue(transcript);
        };

        recognition.onerror = () => {
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + / to open common questions
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setIsCommonQuestionsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isCommonQuestionsOpen) {
        setIsCommonQuestionsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCommonQuestionsOpen]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setInputValue("");
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const [apiLatency, setApiLatency] = useState<number | null>(null);
  const [suggestedFollowUps, setSuggestedFollowUps] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = async (overrideInput?: string | React.MouseEvent) => {
    const isString = typeof overrideInput === "string";
    const finalInput = isString ? overrideInput : inputValue;
    if (!finalInput.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: finalInput,
      timestamp: new Date().toISOString(),
    };

    let targetThreadId = activeThreadId;
    let isNewThread = !targetThreadId || !targetThreadId.match(/^[0-9a-fA-F]{24}$/);
    
    if (isNewThread) {
      targetThreadId = Date.now().toString();
      setActiveThreadId(targetThreadId);
    }
    
    setChatThreads((prevThreads) => {
      if (isNewThread) {
        const title = finalInput.slice(0, 30) + (finalInput.length > 30 ? "..." : "");
        return [{ id: targetThreadId, title, folderId: null, messages: [newMsg] }, ...prevThreads];
      }
      return prevThreads.map((t) =>
        t.id === targetThreadId ? { ...t, messages: [...t.messages, newMsg] } : t
      );
    });

    setInputValue("");
    setIsTyping(true);
    setSuggestedFollowUps([]);
    const startTime = performance.now();

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/chat/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          chatId: isNewThread ? null : targetThreadId, 
          content: finalInput,
          persona: selectedPersona 
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error?.message || errData?.error || "Failed to send message");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      let aiResponseContent = "";
      const aiResponseId = (Date.now() + 1).toString();
      
      setChatThreads((prevThreads) => {
        const aiMsg: ChatMessage = { id: aiResponseId, role: "assistant", content: "", timestamp: new Date().toISOString() };
        return prevThreads.map((t) => t.id === targetThreadId ? { ...t, messages: [...t.messages, aiMsg] } : t);
      });

      let buffer = "";
      const originalTargetThreadId = targetThreadId;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || "";
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'metadata' && isNewThread) {
                 setActiveThreadId(data.chatId);
                 setChatThreads(prev => prev.map(t => t.id === originalTargetThreadId ? { ...t, id: data.chatId } : t));
                 targetThreadId = data.chatId;
                 isNewThread = false;
              } else if (data.type === 'token') {
                aiResponseContent += data.token;
                setChatThreads((prevThreads) => {
                  return prevThreads.map((t) =>
                    t.id === targetThreadId ? {
                      ...t,
                      messages: t.messages.map(m => m.id === aiResponseId ? { ...m, content: aiResponseContent } : m)
                    } : t
                  );
                });
              } else if (data.type === 'done') {
                setIsTyping(false);
                setApiLatency(Math.round(performance.now() - startTime));
              } else if (data.error) {
                 console.error("Backend returned error stream:", data.error);
                 aiResponseContent = `Error: ${data.error}`;
                 setChatThreads((prevThreads) => {
                  return prevThreads.map((t) =>
                    t.id === targetThreadId ? {
                      ...t,
                      messages: t.messages.map(m => m.id === aiResponseId ? { ...m, content: aiResponseContent } : m)
                    } : t
                  );
                 });
                 setIsTyping(false);
              }
            } catch (e) {
              // Ignore partial JSON
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      
      // Inject error message as AI response
      const aiResponseId = (Date.now() + 1).toString();
      const aiMsg: ChatMessage = { 
        id: aiResponseId, 
        role: "assistant", 
        content: `Error: ${error.message}`, 
        timestamp: new Date().toISOString() 
      };
      
      setChatThreads((prevThreads) => {
        return prevThreads.map((t) => t.id === targetThreadId ? { ...t, messages: [...t.messages, aiMsg] } : t);
      });
      
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden relative">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 relative">
          <Wand2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div className="relative">
            <button
              onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
              className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white tracking-tight hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {personas[selectedPersona].name}
              <ChevronDown
                className={`w-4 h-4 opacity-50 transition-transform ${isPersonaMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {isPersonaMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsPersonaMenuOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-[280px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-2 z-50 flex flex-col gap-1"
                  >
                    {(
                      Object.entries(personas) as [
                        Persona,
                        (typeof personas)[Persona],
                      ][]
                    ).map(([key, persona]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setSelectedPersona(key);
                          setIsPersonaMenuOpen(false);
                        }}
                        className={`flex items-start text-left gap-3 p-3 rounded-xl transition-colors ${
                          selectedPersona === key
                            ? "bg-blue-50 dark:bg-blue-900/20"
                            : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        }`}
                      >
                        <div
                          className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            selectedPersona === key
                              ? "bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                          }`}
                        >
                          <persona.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-sm font-semibold ${
                              selectedPersona === key
                                ? "text-blue-700 dark:text-blue-400"
                                : "text-slate-900 dark:text-white"
                            }`}
                          >
                            {persona.name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {persona.desc}
                          </div>
                        </div>
                        {selectedPersona === key && (
                          <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-2 shrink-0" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button 
            onClick={() => setIsRightPaneOpen(!isRightPaneOpen)}
            className={`p-2 transition-colors rounded-full ${
              isRightPaneOpen 
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" 
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title="Toggle Right Panel"
          >
            <PanelRight className="w-5 h-5" />
          </button>
          <button className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Floating gradient orb in background */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-full items-center relative">
          <div
            className="w-full max-w-4xl flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 z-10 flex flex-col pb-40"
            id="chat-container"
          >
            {isLoading ? (
              <div className="w-full flex-1 flex flex-col gap-8 justify-end">
                 <div className="flex gap-4 w-full justify-start">
                   <Skeleton className="w-10 h-10 rounded-2xl" />
                   <Skeleton className="max-w-[75%] w-96 h-20 rounded-[1.5rem]" />
                 </div>
                 <div className="flex gap-4 w-full justify-end">
                   <Skeleton className="max-w-[75%] w-64 h-16 rounded-[1.5rem]" />
                 </div>
                 <div className="flex gap-4 w-full justify-start">
                   <Skeleton className="w-10 h-10 rounded-2xl" />
                   <Skeleton className="max-w-[75%] w-full h-32 rounded-[1.5rem]" />
                 </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center -mt-10">
                <div className="w-24 h-24 mb-8 relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-cyan-900/40 rounded-[2rem] shadow-xl opacity-80 backdrop-blur-3xl transform rotate-3" />
                  <div className="absolute inset-2 bg-gradient-to-tr from-white to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-[1.8rem] shadow-inner opacity-90 transform -rotate-1 flex items-center justify-center">
                    {(() => {
                      const Icon = personas[selectedPersona].icon;
                      return (
                        <Icon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                      );
                    })()}
                  </div>
                </div>
                <h1 className="text-3xl md:text-5xl font-semibold text-slate-400 dark:text-slate-500 tracking-tight text-center mb-4">
                  How can I help you{" "}
                  <span className="text-slate-900 dark:text-white">today?</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mx-auto">
                  {selectedPersona === "mentor" &&
                    "Ask me questions about your curriculum, check your attendance, or get help with your assignments."}
                  {selectedPersona === "tutor" &&
                    "Stuck on a problem? Let's walk through the logic, code, or technical concepts together."}
                  {selectedPersona === "agent" &&
                    "Looking for a classroom? Need campus hours? I can help you find your way around."}
                </p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0 }}
                  key={msg.id}
                  className={`flex gap-4 w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20 mt-1">
                      {(() => {
                        const Icon = personas[selectedPersona].icon;
                        return <Icon className="w-5 h-5 text-white" />;
                      })()}
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-[1.5rem] px-6 py-4 leading-relaxed text-[15px] shadow-sm whitespace-pre-wrap relative group ${
                      msg.role === "user"
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-tr-sm font-medium"
                        : "bg-white dark:bg-surface border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="absolute top-2 right-2 opacity-0 flex group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                          title="Copy to clipboard"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    )}
                    <div className="prose dark:prose-invert max-w-none text-sm prose-p:leading-relaxed prose-pre:p-0 prose-pre:my-2">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <CodeBlock language={match[1]} code={String(children).replace(/\n$/, '')} />
                            ) : (
                              <code className="bg-slate-200 dark:bg-slate-800 rounded px-1.5 py-0.5 font-mono text-[13px]" {...props}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex flex-wrap gap-2">
                        {msg.citations.map((citation) => (
                          <button
                            key={citation.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[11px] font-semibold cursor-pointer transition-colors border border-blue-100/50 dark:border-blue-500/20 group"
                          >
                            {citation.source === "notices" ? (
                              <Bell className="w-3 h-3 group-hover:scale-110 transition-transform" />
                            ) : (
                              <FileText className="w-3 h-3 group-hover:scale-110 transition-transform" />
                            )}
                            <span className="truncate max-w-[200px]">
                              {citation.text}
                            </span>
                            <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity ml-0.5" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {msg.role === "user" && (
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 mt-1 overflow-hidden">
                      <img
                        src="https://api.dicebear.com/7.x/notionists/svg?seed=Robert"
                        alt="User"
                        className="w-full h-full object-cover bg-white"
                      />
                    </div>
                  )}
                </motion.div>
              ))
            )}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4 justify-start w-full"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20 mt-1">
                  {(() => {
                    const Icon = personas[selectedPersona].icon;
                    return <Icon className="w-5 h-5 text-white" />;
                  })()}
                </div>
                <div className="bg-white dark:bg-surface border border-slate-200 dark:border-slate-800 rounded-[1.5rem] rounded-tl-sm px-6 py-5 flex items-center gap-1.5 shadow-sm">
                  <div
                    className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Input Area */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent dark:from-slate-900 dark:via-slate-900 z-20">
            <div className="max-w-4xl mx-auto w-full relative">
              <AnimatePresence>
                {isCommonQuestionsOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsCommonQuestionsOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full left-0 mb-4 w-[280px] sm:w-[350px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-2 z-40 flex flex-col gap-1 overflow-hidden"
                    >
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700/50 mb-1">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-blue-500" />
                          Common Questions
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Click to insert templated query
                        </p>
                      </div>
                      {COMMON_QUESTIONS.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setInputValue(q);
                            setIsCommonQuestionsOpen(false);
                            // Focus logic could optionally go here
                          }}
                          className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-[13px] font-medium text-slate-700 dark:text-slate-300"
                        >
                          {q}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* Suggested Follow-ups */}
              <AnimatePresence>
                {suggestedFollowUps.length > 0 && !isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center gap-2 overflow-x-auto pb-3 mb-1 scrollbar-none w-full"
                  >
                    {suggestedFollowUps.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(suggestion)}
                        className="whitespace-nowrap px-4 py-2 rounded-full border border-blue-200 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-500/10 text-[13px] font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100/50 dark:hover:bg-blue-500/20 transition-colors flex items-center gap-2"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {suggestion}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative flex items-end gap-3 bg-white dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-3xl p-3 shadow-xl dark:shadow-none transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/50 hover:border-slate-300 dark:hover:border-slate-600">
                <button className="h-10 w-10 shrink-0 text-slate-400 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors flex items-center justify-center rounded-full hover:bg-blue-50 dark:hover:bg-blue-500/10 mb-1 lg:hidden">
                  <Plus className="w-5 h-5" />
                </button>

                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={`Ask me "${placeholderText}"...`}
                  className="flex-1 max-h-32 min-h-[44px] bg-transparent resize-none outline-none py-3 text-[15px] placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-slate-100"
                  rows={1}
                  style={{ minHeight: "44px" }}
                />

                <div className="flex items-center gap-1 shrink-0 mb-1">
                  <div className="hidden lg:flex items-center gap-1 mr-2 pr-2 border-r border-slate-200 dark:border-slate-700">
                    <button className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center gap-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50">
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button
                      onClick={toggleRecording}
                      className={`p-2 transition-colors flex items-center gap-1.5 rounded-xl ${
                        isRecording
                          ? "text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20"
                          : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                      }`}
                      title={isRecording ? "Stop recording" : "Start recording"}
                    >
                      {isRecording ? (
                        <Square className="w-4 h-4 fill-current animate-pulse" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <button
                    id="chat-send-btn"
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    className="h-10 w-10 bg-blue-600 disabled:opacity-50 hover:bg-blue-700 text-white rounded-full transition-all shadow-md hover:shadow-lg flex items-center justify-center shrink-0 disabled:hover:bg-blue-600 disabled:shadow-none"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>
                  EduSphere AI can make mistakes. Verify important information.
                </span>
                {apiLatency !== null && apiLatency > 800 && (
                  <span
                    className="flex items-center gap-1.5 text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-200/50 dark:border-amber-500/20"
                    title={`API Response Time: ${apiLatency}ms`}
                  >
                    <Activity className="w-3 h-3 animate-pulse" />
                    Latency: {apiLatency}ms
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Context Panel (hidden on small screens) */}
        <AnimatePresence>
          {isRightPaneOpen && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="hidden xl:flex bg-white/50 dark:bg-slate-900/50 border-l border-slate-200 dark:border-slate-800 backdrop-blur-xl flex-col shrink-0 z-10 overflow-hidden h-full min-h-0 relative"
            >
              <div className="w-80 shrink-0 h-full overflow-y-auto p-6 custom-scrollbar absolute inset-0">
                <button 
                   onClick={() => setActiveThreadId(null)}
                   className="mb-8 w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 rounded-xl font-medium transition-colors shadow-sm cursor-pointer"
                >
             <Plus className="w-4 h-4" />
             New Chat
          </button>
          
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Suggested Actions
          </h3>
          <div className="space-y-2 mb-8">
            {[
              "View semester exam timetable",
              "Check my attendance percentage",
              "Download syllabus for Data Science",
              "Find library books on NLP",
            ].map((q, i) => (
              <button
                key={i}
                onClick={() => {
                  setInputValue(q);
                }}
                className="w-full text-left p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/50 focus:border-blue-500 transition-all text-[13px] font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:shadow-md"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mb-4 mt-8">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Folder className="w-4 h-4 text-blue-600" />
              Categorize Threads
            </h3>
            <button
              onClick={() => setIsAddingFolder(true)}
              className="text-xs font-semibold px-2 py-1 flex items-center gap-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
              title="Add Folder"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              New Folder
            </button>
          </div>

          <div className="max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar space-y-3 mb-8">
            {isAddingFolder && (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border-2 border-blue-400 dark:border-blue-500 shadow-sm animate-in fade-in slide-in-from-top-2">
                <Folder className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <input
                  type="text"
                  className="flex-1 bg-transparent text-[13px] font-semibold text-slate-900 dark:text-white outline-none placeholder:text-blue-400/70"
                  placeholder="Enter subject name..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newFolderName.trim()) {
                      setFolders([
                        ...folders,
                        { id: `f${Date.now()}`, name: newFolderName.trim() },
                      ]);
                      setNewFolderName("");
                      setIsAddingFolder(false);
                    } else if (e.key === "Escape") {
                      setIsAddingFolder(false);
                      setNewFolderName("");
                    }
                  }}
                  autoFocus
                />
              </div>
            )}

            {folders.map((folder) => (
              <div
                key={folder.id}
                className="rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-2 transition-all mt-3"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add("border-blue-500");
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove("border-blue-500");
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove("border-blue-500");
                  const threadId = e.dataTransfer.getData("threadId");
                  if (threadId) {
                    setChatThreads(
                      chatThreads.map((t) =>
                        t.id === threadId ? { ...t, folderId: folder.id } : t,
                      ),
                    );
                  }
                }}
              >
                <div className="flex items-center gap-2 px-2 py-1 mb-2 text-slate-700 dark:text-slate-300">
                  <Folder className="w-4 h-4 text-slate-400" />
                  <span className="text-[13px] font-semibold">
                    {folder.name}
                  </span>
                </div>
                <div className="space-y-1 pl-2 border-l-2 border-slate-200 dark:border-slate-700 ml-3">
                  {chatThreads.filter((t) => t.folderId === folder.id)
                    .length === 0 && (
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 italic py-1 px-2">
                      Drag threads here
                    </div>
                  )}
                  {chatThreads
                    .filter((t) => t.folderId === folder.id)
                    .map((thread) => (
                      <div
                        key={thread.id}
                        draggable
                        onClick={() => setActiveThreadId(thread.id)}
                        onDragStart={(e) =>
                          e.dataTransfer.setData("threadId", thread.id)
                        }
                        className={`group flex flex-col p-2.5 rounded-xl border transition-all shadow-sm cursor-grab active:cursor-grabbing ${
                          activeThreadId === thread.id
                           ? "bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                           : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/50"
                        }`}
                      >
                        {editingThreadId === thread.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-[13px] font-medium text-slate-900 dark:text-white outline-none focus:border-blue-500"
                              value={editThreadName}
                              onChange={(e) =>
                                setEditThreadName(e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  setChatThreads(
                                    chatThreads.map((t) =>
                                      t.id === thread.id
                                        ? { ...t, title: editThreadName }
                                        : t,
                                    ),
                                  );
                                  setEditingThreadId(null);
                                } else if (e.key === "Escape") {
                                  setEditingThreadId(null);
                                }
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() => {
                                setChatThreads(
                                  chatThreads.map((t) =>
                                    t.id === thread.id
                                      ? { ...t, title: editThreadName }
                                      : t,
                                  ),
                                );
                                setEditingThreadId(null);
                              }}
                              className="text-xs font-semibold text-blue-600"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <MessageSquare className="w-4 h-4 text-slate-400 shrink-0" />
                              <p className="text-[13px] font-medium text-slate-700 dark:text-slate-300 truncate">
                                {thread.title}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingThreadId(thread.id);
                                  setEditThreadName(thread.title);
                                }}
                                className="p-1 text-slate-400 hover:text-blue-500 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (activeThreadId === thread.id) setActiveThreadId(null);
                                  setChatThreads(
                                    chatThreads.filter(
                                      (t) => t.id !== thread.id,
                                    ),
                                  );
                                }}
                                className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-500/10"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}

            <div
              className="min-h-[60px] space-y-2 mt-4 transition-all"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add(
                  "bg-slate-50",
                  "dark:bg-slate-800/30",
                  "rounded-xl",
                  "p-2",
                );
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove(
                  "bg-slate-50",
                  "dark:bg-slate-800/30",
                  "rounded-xl",
                  "p-2",
                );
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove(
                  "bg-slate-50",
                  "dark:bg-slate-800/30",
                  "rounded-xl",
                  "p-2",
                );
                const threadId = e.dataTransfer.getData("threadId");
                if (threadId) {
                  setChatThreads(
                    chatThreads.map((t) =>
                      t.id === threadId ? { ...t, folderId: null } : t,
                    ),
                  );
                }
              }}
            >
              {chatThreads
                .filter((t) => !t.folderId)
                .map((thread) => (
                  <div
                    key={thread.id}
                    draggable
                    onClick={() => setActiveThreadId(thread.id)}
                    onDragStart={(e) =>
                      e.dataTransfer.setData("threadId", thread.id)
                    }
                    className={`group flex flex-col p-3 rounded-xl border transition-all shadow-sm cursor-grab active:cursor-grabbing ${
                      activeThreadId === thread.id
                       ? "bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                       : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/50"
                    }`}
                  >
                    {editingThreadId === thread.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-[13px] font-medium text-slate-900 dark:text-white outline-none focus:border-blue-500"
                          value={editThreadName}
                          onChange={(e) => setEditThreadName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              setChatThreads(
                                chatThreads.map((t) =>
                                  t.id === thread.id
                                    ? { ...t, title: editThreadName }
                                    : t,
                                ),
                              );
                              setEditingThreadId(null);
                            } else if (e.key === "Escape") {
                              setEditingThreadId(null);
                            }
                          }}
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            setChatThreads(
                              chatThreads.map((t) =>
                                t.id === thread.id
                                  ? { ...t, title: editThreadName }
                                  : t,
                              ),
                            );
                            setEditingThreadId(null);
                          }}
                          className="text-xs font-semibold text-blue-600"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <MessageSquare className="w-4 h-4 text-slate-400 shrink-0" />
                          <p className="text-[13px] font-medium text-slate-700 dark:text-slate-300 truncate">
                            {thread.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingThreadId(thread.id);
                              setEditThreadName(thread.title);
                            }}
                            className="p-1 text-slate-400 hover:text-blue-500 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (activeThreadId === thread.id) setActiveThreadId(null);
                              setChatThreads(
                                chatThreads.filter((t) => t.id !== thread.id),
                              );
                            }}
                            className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-500/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>

          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Recent Context
          </h3>
          <div className="space-y-3">
            {[
              {
                name: "Exam_Guidelines_2024.pdf",
                size: "2.4 MB • Processing",
                color: "text-red-500",
                bg: "bg-red-50 dark:bg-red-500/10",
              },
              {
                name: "CS401_Syllabus.docx",
                size: "1.1 MB • Ready",
                color: "text-blue-500",
                bg: "bg-blue-50 dark:bg-blue-500/10",
              },
            ].map((doc, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start gap-3 cursor-pointer hover:border-blue-300 dark:hover:border-blue-500/50 transition-all shadow-sm"
              >
                <div
                  className={`w-8 h-8 rounded-lg ${doc.bg} flex items-center justify-center shrink-0`}
                >
                  <FileText className={`w-4 h-4 ${doc.color}`} />
                </div>
                <div className="overflow-hidden">
                  <p className="font-mono text-[12px] font-semibold text-slate-900 dark:text-white truncate">
                    {doc.name}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {doc.size}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 mt-8 flex items-center gap-2">
            <Star className="w-4 h-4 text-blue-600" />
            Usage Analytics
          </h3>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm mb-6">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Weekly Queries
                </p>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {usageStats.totalQueries}
                </div>
              </div>
              <div className={`text-xs font-medium px-2 py-1 rounded ${usageStats.growthPercentage >= 0 ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'text-rose-500 bg-rose-50 dark:bg-rose-500/10'}`}>
                {usageStats.growthPercentage >= 0 ? '+' : ''}{usageStats.growthPercentage}% vs last week
              </div>
            </div>
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usageStats.dailyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    dy={5}
                  />
                  <YAxis
                    hide
                    domain={[0, "dataMax + 10"]}
                  />
                  <RechartsTooltip
                    cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    itemStyle={{ color: "#3b82f6" }}
                    labelStyle={{ display: "none" }}
                  />
                  <Bar dataKey="queries" radius={[4, 4, 0, 0]}>
                    {usageStats.dailyData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.queries > (usageStats.totalQueries / 7) ? "#3b82f6" : "#93c5fd"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}
