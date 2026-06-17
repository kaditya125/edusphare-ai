import { useStore } from '../store/useStore';

class VoiceService {
  private static instance: VoiceService;
  private currentAudio: HTMLAudioElement | null = null;
  private queue: string[] = [];
  private isPlaying = false;
  private playbackSpeed = 1.0;

  private constructor() {
    // Sync speed from store
    useStore.subscribe((state) => {
      this.playbackSpeed = state.voicePreferences.speed;
      if (this.currentAudio) {
        this.currentAudio.playbackRate = this.playbackSpeed;
      }
      
      if (state.voicePreferences.globalMute && this.currentAudio) {
        this.currentAudio.muted = true;
      } else if (!state.voicePreferences.globalMute && this.currentAudio) {
        this.currentAudio.muted = false;
      }
    });
  }

  public static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  public async speak(text: string, forceStart: boolean = false, previewVoiceId?: string) {
    const prefs = useStore.getState().voicePreferences;
    
    // Only return early if not explicitly forced
    if (!forceStart && (!prefs.enabled || prefs.globalMute)) return;

    if (forceStart && (prefs.globalMute || !prefs.enabled)) {
      // Forcefully enable audio if the user explicitly clicked Play
      useStore.getState().updateVoicePreferences({ globalMute: false, enabled: true });
    }

    try {
      const token = localStorage.getItem("token");
      const targetVoiceId = previewVoiceId || prefs.selectedVoiceId;
      
      // Clean text: Remove code blocks, json blocks, and markdown symbols
      const cleanText = text
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/[*_~`#]+/g, '') // Remove markdown symbols
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Clean links
        .trim();

      if (!cleanText) return; // Don't speak empty text

      const res = await fetch("http://localhost:5000/api/chat/synthesize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ 
          text: cleanText, 
          voiceId: targetVoiceId,
          intensity: prefs.voiceIntensity
        })
      });

      if (res.ok) {
        const blob = await res.blob();
        const audioUrl = URL.createObjectURL(blob);

        if (forceStart) {
          this.queue = [];
          this.stop();
        }

        this.queue.push(audioUrl);
        if (!this.isPlaying) {
          this.playNext();
        }
      } else {
        console.error("VoiceService: Failed to fetch audio stream");
        this.fallbackSpeech(text);
      }
    } catch (e) {
      console.error("VoiceService Error:", e);
      this.fallbackSpeech(text);
    }
  }

  private playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      return;
    }

    const audioUrl = this.queue.shift()!;
    this.isPlaying = true;

    this.currentAudio = new Audio(audioUrl);
    this.currentAudio.playbackRate = this.playbackSpeed;
    this.currentAudio.muted = useStore.getState().voicePreferences.globalMute;

    this.currentAudio.onended = () => {
      this.currentAudio = null;
      this.playNext();
    };

    this.currentAudio.onerror = (e) => {
      console.error("Audio playback error:", e);
      this.currentAudio = null;
      this.playNext();
    };

    this.currentAudio.play().catch(e => {
      console.error("Audio auto-play prevented:", e);
      this.isPlaying = false;
      this.currentAudio = null;
    });
  }

  public togglePause() {
    if (this.currentAudio) {
      if (this.currentAudio.paused) {
        this.currentAudio.play();
        this.isPlaying = true;
      } else {
        this.currentAudio.pause();
        this.isPlaying = false;
      }
    }
  }

  public stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.queue = [];
    this.isPlaying = false;
  }

  public isCurrentlyPlaying() {
    return this.isPlaying;
  }

  // Fallback to browser TTS if ElevenLabs fails
  private fallbackSpeech(text: string) {
    if (window.speechSynthesis) {
      const cleanText = text.replace(/[*_~`#]+/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const voices = window.speechSynthesis.getVoices();
      // Try to find an Indian English voice profile
      const inVoice = voices.find(v => v.lang.includes('en-IN')) || voices[0];
      if (inVoice) {
        utterance.voice = inVoice;
      }
      utterance.rate = this.playbackSpeed;
      window.speechSynthesis.speak(utterance);
    }
  }
}

export const voiceService = VoiceService.getInstance();
