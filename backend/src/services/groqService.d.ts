import Groq from 'groq-sdk';
export declare const groq: Groq;
export declare const generateRAGResponseStream: (messages: any[], context: string, persona?: string) => Promise<import("groq-sdk/core/streaming.js").Stream<Groq.Chat.Completions.ChatCompletionChunk>>;
export declare const generateAITips: (view: string) => Promise<string[]>;
//# sourceMappingURL=groqService.d.ts.map