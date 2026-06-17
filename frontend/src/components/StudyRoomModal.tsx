import React, { useState, useEffect, useRef } from "react";
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
  Maximize2,
} from "lucide-react";
import { cn } from "../lib/utils";
import { io, Socket } from "socket.io-client";

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
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatOpen, setChatOpen] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

  // WebRTC & Socket State
  const socketRef = useRef<Socket | null>(null);
  const peersRef = useRef<{ [socketId: string]: RTCPeerConnection }>({});
  const [remoteStreams, setRemoteStreams] = useState<{ [socketId: string]: MediaStream }>({});

  const [messages, setMessages] = useState([
    {
      id: 1,
      author: "System",
      text: "Welcome to the study room! You can chat with your peers or ask the AI Expert for help.",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  ]);

  // Handle local media setup and socket connection
  useEffect(() => {
    if (isOpen) {
      // 1. Setup Local Media
      let myStream: MediaStream | undefined;
      
      const initMedia = async () => {
        try {
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            myStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(myStream);
            setIsVideoOn(true);
            setIsMicOn(true);
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = myStream;
            }
          } else {
            console.warn("Media devices API not available.");
          }
        } catch (err) {
          console.error("Error accessing media devices:", err);
        }

        // 2. Setup Socket Connection
        socketRef.current = io("http://localhost:5000");
        
        socketRef.current.on('connect', () => {
          socketRef.current?.emit('join-room', roomName);
        });

        socketRef.current.on('user-connected', (userId: string) => {
          // A new user joined, create an offer
          createPeerConnection(userId, true, myStream);
        });

        socketRef.current.on('user-disconnected', (userId: string) => {
          if (peersRef.current[userId]) {
            peersRef.current[userId].close();
            delete peersRef.current[userId];
            setRemoteStreams(prev => {
              const newStreams = { ...prev };
              delete newStreams[userId];
              return newStreams;
            });
          }
        });

        socketRef.current.on('offer', async (payload: any) => {
          await createPeerConnection(payload.caller, false, myStream, payload.sdp);
        });

        socketRef.current.on('answer', async (payload: any) => {
          const pc = peersRef.current[payload.target];
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          }
        });

        socketRef.current.on('ice-candidate', async (payload: any) => {
          const pc = peersRef.current[payload.target];
          if (pc && payload.candidate) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
            } catch (e) {
              console.error("Error adding ice candidate", e);
            }
          }
        });
      };

      initMedia();
    } else {
      // Cleanup streams and socket when modal closes
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
      }
      
      Object.values(peersRef.current).forEach(pc => pc.close());
      peersRef.current = {};
      setRemoteStreams({});
      
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      setIsVideoOn(false);
      setIsMicOn(false);
      setIsSharing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, roomName]);

  const createPeerConnection = async (targetId: string, isInitiator: boolean, stream?: MediaStream, remoteSdp?: any) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
      ]
    });

    peersRef.current[targetId] = pc;

    if (stream) {
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit('ice-candidate', {
          target: targetId,
          candidate: event.candidate
        });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStreams(prev => ({
        ...prev,
        [targetId]: event.streams[0]
      }));
    };

    if (isInitiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current?.emit('offer', {
        target: targetId,
        caller: socketRef.current.id,
        sdp: offer
      });
    } else if (remoteSdp) {
      await pc.setRemoteDescription(new RTCSessionDescription(remoteSdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketRef.current?.emit('answer', {
        target: targetId,
        sdp: answer
      });
    }

    return pc;
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => track.enabled = !isVideoOn);
      setIsVideoOn(!isVideoOn);
    }
  };

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => track.enabled = !isMicOn);
      setIsMicOn(!isMicOn);
    }
  };

  const toggleShare = async () => {
    if (isSharing) {
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
      setScreenStream(null);
      setIsSharing(false);
    } else {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          setScreenStream(stream);
          setIsSharing(true);
          if (screenVideoRef.current) {
            screenVideoRef.current.srcObject = stream;
          }
          stream.getVideoTracks()[0].onended = () => {
            setScreenStream(null);
            setIsSharing(false);
          };
          
          // Optionally replace video track for peers
          const videoTrack = stream.getVideoTracks()[0];
          Object.values(peersRef.current).forEach(pc => {
            const sender = pc.getSenders().find(s => s.track?.kind === 'video');
            if (sender) {
              sender.replaceTrack(videoTrack);
            }
          });

        } else {
          console.warn("getDisplayMedia API not available.");
          alert("Screen sharing is not supported in this environment. It requires HTTPS or localhost.");
        }
      } catch (err) {
        console.error("Error sharing screen:", err);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    const userMsg = chatMessage;
    setChatMessage("");
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        author: "You",
        text: userMsg,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);

    // Expert Chatbot (AI integration)
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("http://localhost:5000/api/chat/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          message: `In a live study room context, I just said: "${userMsg}". Reply briefly as an Expert AI Tutor helping the room. Keep it under 2 sentences.`
        })
      });
      
      const data = await res.json();
      if (data.response) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            author: "Expert AI",
            text: data.response,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (e) {
      console.error("AI reply failed", e);
    }
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
                  {Object.keys(remoteStreams).length + 1} Participant(s) • Live WebRTC + AI Expert
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
              
              {/* Main Stage (Shared Screen or nothing) */}
              {isSharing && (
                <div className="flex-1 bg-slate-950 rounded-2xl relative border border-slate-800 overflow-hidden min-h-[300px]">
                  <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-white text-xs font-bold flex items-center gap-2 z-10">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Your Screen
                  </div>
                  <video ref={screenVideoRef} autoPlay playsInline className="w-full h-full object-contain" />
                </div>
              )}

              {/* Video Grid (Real WebRTC Peers) */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max p-2">
                
                {/* Local Video */}
                <div className={cn(
                    "rounded-2xl overflow-hidden relative border-2 shrink-0 bg-slate-950 aspect-video",
                    isMicOn ? "border-emerald-500" : "border-slate-800",
                  )}
                >
                  <video 
                    ref={localVideoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className={cn("w-full h-full object-cover", !isVideoOn && "opacity-0")} 
                  />
                  {!isVideoOn && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                        <Users className="w-16 h-16 text-slate-600" />
                      </div>
                  )}
                  <div className="absolute bottom-3 left-3 bg-slate-900/80 px-2 py-1 rounded text-xs font-bold text-white backdrop-blur-sm flex items-center gap-2">
                    You
                    {!isMicOn && <MicOff className="w-3 h-3 text-red-400" />}
                  </div>
                </div>

                {/* Remote Videos */}
                {Object.entries(remoteStreams).map(([socketId, stream]) => (
                  <div
                    key={socketId}
                    className="rounded-2xl overflow-hidden relative border-2 border-slate-800 shrink-0 bg-slate-950 aspect-video"
                  >
                    <video
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                      ref={video => {
                        if (video && video.srcObject !== stream) {
                          video.srcObject = stream;
                        }
                      }}
                    />
                    <div className="absolute bottom-3 left-3 bg-slate-900/80 px-2 py-1 rounded text-xs font-bold text-white backdrop-blur-sm">
                      Peer ({socketId.substring(0,4)})
                    </div>
                  </div>
                ))}
                
                {Object.keys(remoteStreams).length === 0 && !isSharing && (
                   <div className="col-span-full h-64 flex flex-col items-center justify-center text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed mt-4">
                     <Users className="w-12 h-12 mb-3 text-slate-600" />
                     <p>Waiting for peers to join the room...</p>
                   </div>
                )}
              </div>
            </div>

            {/* Chat Sidebar */}
            {chatOpen && (
              <div className="w-80 border-l border-slate-800 flex flex-col bg-slate-900 shrink-0">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
                  <h3 className="text-white font-bold text-sm flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                    Expert AI Chat
                  </h3>
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
                            : msg.author === "System"
                            ? "bg-slate-800/80 text-slate-400 italic rounded-tl-sm text-center w-full"
                            : "bg-emerald-600 text-white rounded-tl-sm",
                        )}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-slate-800">
                  <div className="flex items-center gap-2 bg-slate-800 rounded-xl p-1.5 border border-slate-700 focus-within:border-indigo-500 transition-colors">
                    <input
                      type="text"
                      className="flex-1 bg-transparent px-2 text-sm text-white placeholder:text-slate-500 focus:outline-none"
                      placeholder="Ask the Expert AI..."
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
          <div className="h-20 border-t border-slate-800 bg-slate-900 flex items-center justify-center gap-4 px-6 shrink-0 relative">
            <button
              onClick={toggleMic}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-lg",
                isMicOn
                  ? "bg-slate-800 text-white hover:bg-slate-700"
                  : "bg-red-500 text-white hover:bg-red-600",
              )}
            >
              {isMicOn ? (
                <Mic className="w-5 h-5" />
              ) : (
                <MicOff className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={toggleVideo}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-lg",
                isVideoOn
                  ? "bg-slate-800 text-white hover:bg-slate-700"
                  : "bg-red-500 text-white hover:bg-red-600",
              )}
            >
              {isVideoOn ? (
                <Video className="w-5 h-5" />
              ) : (
                <VideoOff className="w-5 h-5" />
              )}
            </button>
            <button 
              onClick={toggleShare}
              className={cn(
                "h-12 px-6 rounded-full flex items-center gap-2 font-bold text-sm transition-colors shadow-lg",
                isSharing ? "bg-red-500 text-white hover:bg-red-600" : "bg-indigo-600 text-white hover:bg-indigo-500"
              )}
            >
              <Monitor className="w-5 h-5" />
              {isSharing ? "Stop Sharing" : "Share Screen"}
            </button>

            <div className="absolute right-6 flex gap-2">
              <button
                onClick={() => setChatOpen(!chatOpen)}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-lg",
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
