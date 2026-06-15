import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Monitor,
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageSquare,
  Users,
  Send,
  Share,
  Maximize2,
} from "lucide-react";
import { cn } from "../lib/utils";

interface StudyRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
}

export function StudyRoomModal({
  isOpen,
  onClose,
  roomName,
}: StudyRoomModalProps) {
  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [chatMessage, setChatMessage] = useState("");
  const [chatOpen, setChatOpen] = useState(true);

  const [messages, setMessages] = useState([
    {
      id: 1,
      author: "Jenny Wilson",
      text: "Can everyone see my screen?",
      time: "10:24 AM",
    },
    {
      id: 2,
      author: "Jacob Jones",
      text: "Yes, loading the linear algebra notes now.",
      time: "10:25 AM",
    },
  ]);

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    setMessages([
      ...messages,
      {
        id: Date.now(),
        author: "You",
        text: chatMessage,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setChatMessage("");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden w-full max-w-6xl h-[85vh] flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">{roomName}</h2>
                <p className="text-slate-400 text-sm">
                  4 Participants • Breakout Session
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Viewport */}
            <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
              {/* Shared Screen */}
              <div className="flex-1 bg-slate-950 rounded-2xl relative border border-slate-800 overflow-hidden min-h-[400px]">
                <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-white text-xs font-bold flex items-center gap-2 z-10">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Jenny's Screen
                </div>
                <button className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md p-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white transition-colors z-10">
                  <Maximize2 className="w-4 h-4" />
                </button>

                {/* Fake Screen Content */}
                <div className="w-full h-full flex flex-col items-center justify-center relative p-8">
                  <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg h-full p-6 text-slate-800 relative z-0 overflow-hidden flex flex-col">
                    <h1 className="text-2xl font-bold mb-4 border-b pb-2">
                      Linear Algebra Notes - Matrix Multiplication
                    </h1>
                    <div className="space-y-4">
                      <p className="text-sm">
                        Remember the rule: columns of the first matrix must
                        equal rows of the second.
                      </p>
                      <img
                        src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=300&fit=crop"
                        alt="Matrix math"
                        className="w-full h-48 object-cover rounded-lg grayscale opacity-80"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Participants */}
              <div className="h-32 flex gap-4 shrink-0 overflow-x-auto pb-2">
                {[
                  {
                    name: "Jenny (Sharing)",
                    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
                    active: true,
                  },
                  {
                    name: "Jacob",
                    img: "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=200&h=200&fit=crop",
                    active: false,
                  },
                  {
                    name: "Cody",
                    img: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&fit=crop",
                    active: false,
                  },
                  {
                    name: "You",
                    img: "https://api.dicebear.com/7.x/notionists/svg?seed=You&backgroundColor=b6e3f4",
                    active: isMicOn,
                  },
                ].map((user, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-48 rounded-xl overflow-hidden relative border-2 shrink-0",
                      user.active ? "border-emerald-500" : "border-slate-800",
                    )}
                  >
                    <img
                      src={user.img}
                      className="w-full h-full object-cover opacity-80"
                      alt={user.name}
                    />
                    <div className="absolute bottom-2 left-2 bg-slate-900/80 px-2 py-1 rounded text-xs font-bold text-white backdrop-blur-sm">
                      {user.name}
                    </div>
                    {!user.active && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center backdrop-blur-sm">
                        <MicOff className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Sidebar */}
            {chatOpen && (
              <div className="w-80 border-l border-slate-800 flex flex-col bg-slate-900 shrink-0">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-white font-bold text-sm">Group Chat</h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex flex-col",
                        msg.author === "You" ? "items-end" : "items-start",
                      )}
                    >
                      <span className="text-[10px] text-slate-500 mb-1 px-1">
                        {msg.author} • {msg.time}
                      </span>
                      <div
                        className={cn(
                          "p-2.5 rounded-xl text-sm max-w-[85%]",
                          msg.author === "You"
                            ? "bg-indigo-600 text-white rounded-tr-sm"
                            : "bg-slate-800 text-slate-200 rounded-tl-sm",
                        )}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-slate-800">
                  <div className="flex items-center gap-2 bg-slate-800 rounded-xl p-1.5 border border-slate-700 focus-within:border-indigo-500">
                    <input
                      type="text"
                      className="flex-1 bg-transparent px-2 text-sm text-white placeholder:text-slate-500 focus:outline-none"
                      placeholder="Message group..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!chatMessage.trim()}
                      className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center disabled:opacity-50 disabled:hover:bg-indigo-600"
                    >
                      <Send className="w-4 h-4 ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls Footer */}
          <div className="h-16 border-t border-slate-800 bg-slate-900 flex items-center justify-center gap-3 px-6 shrink-0 relative">
            <button
              onClick={() => setIsMicOn(!isMicOn)}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                isMicOn
                  ? "bg-slate-800 text-white hover:bg-slate-700"
                  : "bg-red-500/20 text-red-500 hover:bg-red-500/30",
              )}
            >
              {isMicOn ? (
                <Mic className="w-5 h-5" />
              ) : (
                <MicOff className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                isVideoOn
                  ? "bg-slate-800 text-white hover:bg-slate-700"
                  : "bg-red-500/20 text-red-500 hover:bg-red-500/30",
              )}
            >
              {isVideoOn ? (
                <Video className="w-5 h-5" />
              ) : (
                <VideoOff className="w-5 h-5" />
              )}
            </button>
            <button className="h-10 px-4 rounded-full bg-slate-800 text-white hover:bg-slate-700 flex items-center gap-2 font-medium text-sm transition-colors ml-4">
              <Monitor className="w-4 h-4" />
              Share
            </button>

            <div className="absolute right-6 flex gap-2">
              <button
                onClick={() => setChatOpen(!chatOpen)}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                  chatOpen
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white",
                )}
              >
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
