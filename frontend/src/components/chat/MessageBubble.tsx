import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Volume2, Square, ThumbsUp, ThumbsDown, RotateCw, Bell, FileText, ExternalLink } from 'lucide-react';
import { GenerativeUICard } from './GenerativeCards';
import { voiceService } from '../../services/VoiceService';

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  imageUrl?: string;
  timestamp: string;
  citations?: { id: string; source: string; text: string; link?: string }[];
}

interface MessageBubbleProps {
  msg: ChatMessage;
  isStreaming?: boolean;
  isLast?: boolean;
  onRegenerate?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ msg, isStreaming, isLast, onRegenerate }) => {
  const isUser = msg.role === "user";
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleCopy = React.useCallback((id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handlePlayAudio = () => {
    if (isPlaying) {
      voiceService.stop();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      voiceService.speak(msg.content, true);
      // Wait, we don't have an easy way to listen for when audio ends in this local state right now unless we poll
      // Let's just set timeout to remove playing state for UX, or the user can just hit stop.
      setTimeout(() => setIsPlaying(false), Math.min(msg.content.length * 50, 10000));
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-6 w-full">
        <div className="bg-blue-600 text-white rounded-3xl rounded-tr-sm px-5 py-3.5 max-w-[85%] md:max-w-[75%] shadow-md whitespace-pre-wrap leading-relaxed shadow-blue-500/20">
          {msg.imageUrl && (
            <img src={msg.imageUrl} alt="Uploaded attachment" className="max-w-full rounded-xl mb-3 border border-white/20" style={{ maxHeight: '300px', objectFit: 'contain' }} />
          )}
          {msg.content}
        </div>
      </div>
    );
  }

  const markdownComponents = useMemo(() => ({
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const content = String(children).replace(/\n$/, '');

      // Check if it's a Generative UI JSON block
      if (language === 'json') {
        try {
          const data = JSON.parse(content);
          if (data && data.component) {
            return <GenerativeUICard jsonString={content} />;
          }
        } catch (e) {
          // If we are currently streaming and it looks like a component JSON, render a loading skeleton instead of ugly raw text
          if (content.includes('"component"')) {
            return (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 my-4 shadow-sm animate-pulse h-32 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-slate-400 font-medium">Generating Interface...</p>
                </div>
              </div>
            );
          }
          // Normal JSON formatting fallback
        }
      }

      if (!inline && match) {
        const blockId = `code-${Math.random().toString(36).substr(2, 9)}`;
        return (
          <div className="relative rounded-lg overflow-hidden my-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{language}</span>
              <button
                onClick={() => handleCopy(blockId, content)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title="Copy code"
              >
                {copiedId === blockId ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <SyntaxHighlighter
              style={materialDark as any}
              language={language}
              PreTag="div"
              customStyle={{ margin: 0, padding: '1rem', background: '#1e1e1e' }}
            >
              {content}
            </SyntaxHighlighter>
          </div>
        );
      }
      return (
        <code className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/50 text-purple-600 dark:text-purple-400 font-mono text-xs" {...props}>
          {children}
        </code>
      );
    }
  }), [copiedId, handleCopy]);

  // Assistant Message rendering
  return (
    <div className="flex justify-start mb-6 w-full group">
      <div className="flex flex-col w-full max-w-[85%] sm:max-w-[80%]">
        <div className="px-5 py-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-sm shadow-sm border border-slate-100 dark:border-slate-700/50">
          <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed prose-headings:font-bold prose-h1:text-lg prose-h2:text-base prose-h3:text-sm prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {msg.content + (isStreaming && isLast ? ' █' : '')}
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

        {/* Message Actions */}
        {!isStreaming && (
          <div className="flex items-center gap-1 mt-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button 
              onClick={() => handleCopy(msg.id, msg.content)}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-md transition-colors"
              title="Copy"
            >
              {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button 
              onClick={handlePlayAudio}
              className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-800 rounded-md transition-colors"
              title={isPlaying ? "Stop" : "Read Aloud"}
            >
              {isPlaying ? <Square className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-md transition-colors">
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-md transition-colors">
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
            {onRegenerate && (
              <button 
                onClick={onRegenerate}
                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-md transition-colors ml-auto"
                title="Regenerate"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
