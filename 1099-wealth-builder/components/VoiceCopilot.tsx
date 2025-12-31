
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Volume2, Landmark, Loader2, AlertCircle } from 'lucide-react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';

// Helper functions for audio processing as per guidelines
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): any {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

interface VoiceCopilotProps {
  isOpen: boolean;
  onClose: () => void;
  context: {
    safeToSpend: number;
    taxLiabilities: number;
    totalSavings: number;
  };
}

export const VoiceCopilot: React.FC<VoiceCopilotProps> = ({ isOpen, onClose, context }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Tap to Connect');
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const cleanup = () => {
    if (sessionRef.current) {
      sessionRef.current.close?.();
      sessionRef.current = null;
    }
    for (const source of sourcesRef.current) {
      source.stop();
    }
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    setIsActive(false);
    setStatus('Tap to Connect');
  };

  const startSession = async () => {
    setError(null);
    setStatus('Connecting...');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      }
      if (!outAudioContextRef.current) {
        outAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setStatus('Copilot Listening...');
            setIsActive(true);
            
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              // Calculate audio level for UI
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
              setAudioLevel(Math.sqrt(sum / inputData.length) * 500);

              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outAudioContextRef.current) {
              const ctx = outAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.onended = () => sourcesRef.current.delete(source);
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              setStatus('Copilot Speaking...');
            }

            if (message.serverContent?.interrupted) {
              for (const s of sourcesRef.current) s.stop();
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
            
            if (message.serverContent?.turnComplete) {
              setStatus('Copilot Listening...');
            }
          },
          onerror: (e) => {
            console.error('Gemini Live Error:', e);
            setError('Connection failed. Please retry.');
            cleanup();
          },
          onclose: () => {
            cleanup();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: `You are a world-class 1099 Financial Copilot. 
          Current Stats: Safe to Spend: $${context.safeToSpend}, Tax Liabilities: $${context.taxLiabilities}, Total Savings: $${context.totalSavings}.
          Your goal is to help the freelancer understand their tax safety and spending limits.
          Use a friendly, professional tone. Keep answers concise. 
          If they ask about spending money, remind them of their tax obligations if liabilities are high.`,
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setError('Microphone access or connection failed.');
      setStatus('Tap to Connect');
    }
  };

  useEffect(() => {
    return () => cleanup();
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-indigo-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
      <button onClick={() => { cleanup(); onClose(); }} className="absolute top-10 right-10 p-4 bg-white/10 rounded-full hover:bg-white/20 transition-all">
        <X className="w-6 h-6 text-white" />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center space-y-12 w-full max-w-sm text-center">
        <div className="relative">
          <div 
            className={`w-48 h-48 rounded-full flex items-center justify-center shadow-[0_0_80px_rgba(99,102,241,0.4)] transition-all duration-300 ${isActive ? 'bg-indigo-500' : 'bg-white/10'}`}
            style={{ transform: `scale(${1 + (isActive ? audioLevel / 400 : 0)})` }}
          >
            <div className="w-40 h-40 rounded-full bg-indigo-400/30 animate-pulse flex items-center justify-center">
              <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center shadow-2xl relative overflow-hidden">
                {isActive ? (
                  <div className="flex items-end gap-1 px-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div 
                        key={i} 
                        className="w-1.5 bg-indigo-600 rounded-full transition-all duration-75" 
                        style={{ height: `${20 + (Math.random() * audioLevel)}px` }}
                      />
                    ))}
                  </div>
                ) : (
                  <Mic className="w-10 h-10 text-indigo-200" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className={`text-3xl font-black tracking-tight transition-colors ${error ? 'text-red-400' : 'text-white'}`}>
            {error || status}
          </h2>
          {!isActive && !error && (
            <p className="text-indigo-200/60 text-sm font-medium uppercase tracking-widest px-6 animate-bounce">
              Tap the button to start talking
            </p>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] w-full space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-indigo-300 uppercase tracking-widest">
            <span>Wealth Context</span>
            <Landmark className="w-3 h-3" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
              <p className="text-[9px] text-white/40 font-black uppercase tracking-widest">Tax Owed</p>
              <p className="text-white font-bold text-lg">${context.taxLiabilities.toLocaleString()}</p>
            </div>
            <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
              <p className="text-[9px] text-white/40 font-black uppercase tracking-widest">Safe Spend</p>
              <p className="text-emerald-400 font-bold text-lg">${context.safeToSpend.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={isActive ? cleanup : startSession}
        className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl mb-12 relative group ${isActive ? 'bg-red-500 hover:bg-red-600 scale-110' : 'bg-white hover:scale-105'}`}
      >
        {isActive ? (
          <MicOff className="w-10 h-10 text-white" />
        ) : (
          <Mic className="w-10 h-10 text-indigo-600" />
        )}
        {!isActive && (
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping" />
        )}
      </button>

      {error && (
        <div className="absolute bottom-32 bg-red-500/10 border border-red-500/20 px-6 py-2 rounded-full flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-red-400 text-xs font-bold">Session interrupted</span>
        </div>
      )}
    </div>
  );
};
