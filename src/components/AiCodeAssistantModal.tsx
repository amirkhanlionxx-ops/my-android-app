import React, { useState, useEffect, useRef } from 'react';
import {
  sendAiChatMessage,
  debugCodeWithAi,
  generateAppWithAi,
  transcribeAudioWithAi,
  AI_TARGET_PLATFORMS,
  AI_QUICK_COMMANDS,
  AI_APP_TEMPLATES,
  AiTargetPlatformId,
  getAiPlatformById,
} from '../services/aiService';

export interface AiCodeAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeFileName?: string;
  currentCode: string;
  onApplyCode: (newCode: string, fileName?: string, runImmediately?: boolean) => void;
  onInsertSnippet?: (snippet: string) => void;
  onShowAlert?: (msg: string) => void;
  initialTab?: 'chat' | 'debug' | 'generate';
  initialPrompt?: string;
}

interface ModalAttachmentItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'file' | 'folder';
  previewUrl?: string;
  sizeLabel?: string;
  contentSnippet?: string;
}

interface ModalFeedItem {
  id: string;
  userPrompt: string;
  mode: 'chat' | 'generate' | 'debug';
  platformLabel: string;
  platformIcon: string;
  platformColor: string;
  attachments: ModalAttachmentItem[];
  summary: string;
  code: string | null;
  fileName: string;
  issues?: { line?: number | null; type?: string; message: string }[];
  timestamp: string;
}

const MODAL_EMOJI_LIST = ['😀', '🔥', '🚀', '✨', '💡', '⚡', '🎯', '💻', '📱', '🛠️', '🎨', '🔒', '✅', '❤️', '👍', '🎉'];

export const AiCodeAssistantModal: React.FC<AiCodeAssistantModalProps> = ({
  isOpen,
  onClose,
  activeFileName = 'source_code',
  currentCode,
  onApplyCode,
  onShowAlert,
  initialTab = 'chat',
  initialPrompt = '',
}) => {
  const [aiMode, setAiMode] = useState<'chat' | 'generate' | 'debug'>('chat');
  const [targetLang, setTargetLang] = useState<AiTargetPlatformId>('html');
  const [promptInput, setPromptInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAttachOpen, setIsAttachOpen] = useState(false);
  const [attachments, setAttachments] = useState<ModalAttachmentItem[]>([]);
  const [feedItems, setFeedItems] = useState<ModalFeedItem[]>([]);

  // Unique Voice / Microphone State with Dynamic Equalizer and Floating Voice Capsule
  const [isMicListening, setIsMicListening] = useState(false);
  const [isMicTranscribing, setIsMicTranscribing] = useState(false);
  const [micVoiceLevel, setMicVoiceLevel] = useState<number>(18);
  const [voiceBars, setVoiceBars] = useState<number[]>([10, 16, 24, 30, 22, 14, 8]);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [liveSpeechText, setLiveSpeechText] = useState<string>('');
  const [voiceStatusMsg, setVoiceStatusMsg] = useState<string>('');

  const speechRecRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const levelTimerRef = useRef<any>(null);
  const recSecTimerRef = useRef<any>(null);
  const liveTranscribeTimerRef = useRef<any>(null);
  const isTranscribingLiveRef = useRef<boolean>(false);
  const hasSpokenRef = useRef<boolean>(false);
  const lastTranscribedChunkCountRef = useRef<number>(0);
  const accumulatedSpeechRef = useRef<string>('');
  const isMicListeningRef = useRef<boolean>(false);
  const capturedTextRef = useRef<string>('');

  const formatVoiceTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const blobToDataUrl = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result || ''));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const stopVoiceRecording = (shouldApply: boolean = true) => {
    isMicListeningRef.current = false;
    setIsMicListening(false);
    setMicVoiceLevel(15);
    setVoiceBars([10, 16, 24, 30, 22, 14, 8]);

    if (recSecTimerRef.current) {
      clearInterval(recSecTimerRef.current);
      recSecTimerRef.current = null;
    }
    if (levelTimerRef.current) {
      clearInterval(levelTimerRef.current);
      levelTimerRef.current = null;
    }
    if (liveTranscribeTimerRef.current) {
      clearInterval(liveTranscribeTimerRef.current);
      liveTranscribeTimerRef.current = null;
    }
    if (speechRecRef.current) {
      try {
        speechRecRef.current.onend = null;
        speechRecRef.current.stop();
      } catch {}
      speechRecRef.current = null;
    }

    if (!shouldApply) {
      // Discard voice recording
      if (mediaStreamRef.current) {
        try {
          mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        } catch {}
        mediaStreamRef.current = null;
      }
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch {}
        audioCtxRef.current = null;
      }
      mediaRecorderRef.current = null;
      setLiveSpeechText('');
      setVoiceStatusMsg('ভয়েস বাতিল করা হয়েছে');
      setTimeout(() => setVoiceStatusMsg(''), 2200);
      return;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    } else {
      if (mediaStreamRef.current) {
        try {
          mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        } catch {}
        mediaStreamRef.current = null;
      }
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch {}
        audioCtxRef.current = null;
      }
    }
  };

  const toggleVoiceRecording = async () => {
    if (isMicListening) {
      stopVoiceRecording(true);
      return;
    }

    const initialBase = promptInput ? promptInput.trim() : '';
    accumulatedSpeechRef.current = initialBase;
    capturedTextRef.current = '';
    audioChunksRef.current = [];
    hasSpokenRef.current = false;
    lastTranscribedChunkCountRef.current = 0;
    isTranscribingLiveRef.current = false;
    isMicListeningRef.current = true;
    setIsMicListening(true);
    setRecordingSeconds(0);
    setLiveSpeechText('');
    setVoiceStatusMsg('');
    setMicVoiceLevel(25);

    if (recSecTimerRef.current) clearInterval(recSecTimerRef.current);
    recSecTimerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        if (!isMicListeningRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        mediaStreamRef.current = stream;

        // Initialize AudioContext & Analyser with resume() for real-time mobile audio visualizer
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          try {
            const ctx = new AudioCtx();
            if (ctx.state === 'suspended') {
              await ctx.resume().catch(() => {});
            }
            audioCtxRef.current = ctx;
            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64;
            analyser.smoothingTimeConstant = 0.55;
            source.connect(analyser);
            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            levelTimerRef.current = setInterval(() => {
              analyser.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
              const avg = sum / dataArray.length;
              if (avg > 4) {
                hasSpokenRef.current = true;
              }
              const scaled = Math.min(100, Math.max(16, Math.round(avg * 1.8)));
              setMicVoiceLevel(scaled);

              // 7-bar dynamic equalizer heights
              const step = Math.max(1, Math.floor(dataArray.length / 7));
              const bars: number[] = [];
              for (let i = 0; i < 7; i++) {
                let bSum = 0;
                for (let j = 0; j < step; j++) {
                  bSum += dataArray[i * step + j] || 0;
                }
                const bAvg = bSum / step;
                const h = Math.max(8, Math.min(34, Math.round((bAvg / 255) * 34) + (avg > 5 ? 6 : 2)));
                bars.push(h);
              }
              setVoiceBars(bars);
            }, 60);
          } catch (ctxErr) {
            console.warn('AudioContext error:', ctxErr);
          }
        }

        if (typeof MediaRecorder !== 'undefined') {
          const candidates = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/mp4',
            'audio/ogg;codecs=opus',
            'audio/aac',
          ];
          let chosenMime = '';
          for (const c of candidates) {
            if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(c)) {
              chosenMime = c;
              break;
            }
          }

          const recorder = chosenMime
            ? new MediaRecorder(stream, { mimeType: chosenMime })
            : new MediaRecorder(stream);
          const effectiveMime = recorder.mimeType || chosenMime || 'audio/webm';
          mediaRecorderRef.current = recorder;

          recorder.ondataavailable = (ev) => {
            if (ev.data && ev.data.size > 0) {
              audioChunksRef.current.push(ev.data);
            }
          };

          recorder.onstop = async () => {
            const chunks = [...audioChunksRef.current];

            if (mediaStreamRef.current) {
              try {
                mediaStreamRef.current.getTracks().forEach((t) => t.stop());
              } catch {}
              mediaStreamRef.current = null;
            }
            if (audioCtxRef.current) {
              try {
                audioCtxRef.current.close();
              } catch {}
              audioCtxRef.current = null;
            }
            mediaRecorderRef.current = null;

            if (chunks.length > 0) {
              setIsMicTranscribing(true);
              setVoiceStatusMsg('AI ট্রান্সক্রাইব করছে...');
              try {
                const fullBlob = new Blob(chunks, { type: effectiveMime });
                if (fullBlob.size > 200) {
                  const base64Url = await blobToDataUrl(fullBlob);
                  const transcript = await transcribeAudioWithAi(base64Url, effectiveMime);
                  if (transcript && transcript.trim()) {
                    const clean = transcript.trim();
                    setPromptInput((prev) => {
                      const current = (prev || '').trim();
                      if (!current) return clean;
                      if (current.toLowerCase().includes(clean.toLowerCase())) return current;
                      if (clean.toLowerCase().includes(current.toLowerCase())) return clean;
                      return `${current} ${clean}`.trim();
                    });
                    setVoiceStatusMsg('✓ ভয়েস কমান্ড যুক্ত হয়েছে!');
                    setTimeout(() => setVoiceStatusMsg(''), 3000);
                  } else if (!capturedTextRef.current && !promptInput.trim()) {
                    setVoiceStatusMsg('কথা শোনা যায়নি, আবার বলুন');
                    setTimeout(() => setVoiceStatusMsg(''), 2500);
                  }
                }
              } catch (tErr) {
                console.warn('AI transcribe error:', tErr);
              } finally {
                setIsMicTranscribing(false);
                setLiveSpeechText('');
              }
            } else {
              setIsMicTranscribing(false);
              setLiveSpeechText('');
            }
          };

          recorder.start(250);

          // Native browser SpeechRecognition for immediate real-time feedback
          const SpeechRecClass =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          if (SpeechRecClass) {
            try {
              const rec = new SpeechRecClass();
              speechRecRef.current = rec;
              rec.lang = 'bn-BD';
              rec.continuous = true;
              rec.interimResults = true;
              rec.maxAlternatives = 1;

              rec.onresult = (event: any) => {
                let interim = '';
                let finalStr = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                  const piece = event.results[i][0]?.transcript || '';
                  if (event.results[i].isFinal) {
                    finalStr += piece + ' ';
                  } else {
                    interim += piece;
                  }
                }
                if (finalStr) {
                  const base = accumulatedSpeechRef.current;
                  accumulatedSpeechRef.current = base ? `${base.trim()} ${finalStr.trim()}` : finalStr.trim();
                }
                const base = accumulatedSpeechRef.current;
                const fullText = (base ? `${base.trim()} ${interim.trim()}` : interim.trim()).trim();
                if (fullText) {
                  hasSpokenRef.current = true;
                  capturedTextRef.current = fullText;
                  setLiveSpeechText(fullText);
                  setPromptInput(fullText);
                }
              };

              rec.onerror = (e: any) => {
                console.warn('SpeechRecognition error:', e?.error);
              };

              rec.onend = () => {
                if (speechRecRef.current && isMicListeningRef.current) {
                  try {
                    rec.start();
                  } catch {}
                }
              };

              rec.start();
            } catch (recErr) {
              console.warn('SpeechRec start error:', recErr);
            }
          }

          return;
        }
      }
    } catch (micErr) {
      console.warn('getUserMedia error:', micErr);
    }

    // Fallback if getUserMedia failed
    if (!levelTimerRef.current) {
      levelTimerRef.current = setInterval(() => {
        setMicVoiceLevel(Math.floor(20 + Math.random() * 60));
        setVoiceBars([
          Math.floor(10 + Math.random() * 18),
          Math.floor(14 + Math.random() * 20),
          Math.floor(18 + Math.random() * 24),
          Math.floor(22 + Math.random() * 28),
          Math.floor(16 + Math.random() * 22),
          Math.floor(12 + Math.random() * 18),
          Math.floor(8 + Math.random() * 14),
        ]);
      }, 90);
    }

    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionCtor) {
      try {
        const recognition = new SpeechRecognitionCtor();
        speechRecRef.current = recognition;
        recognition.lang = 'bn-BD';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptPiece = event.results[i][0]?.transcript || '';
            if (event.results[i].isFinal) {
              finalTranscript += transcriptPiece + ' ';
            } else {
              interimTranscript += transcriptPiece;
            }
          }
          if (finalTranscript) {
            const base = accumulatedSpeechRef.current;
            accumulatedSpeechRef.current = base ? `${base.trim()} ${finalTranscript.trim()}` : finalTranscript.trim();
          }
          const base = accumulatedSpeechRef.current;
          const combined = (base ? `${base.trim()} ${interimTranscript.trim()}` : interimTranscript.trim()).trim();
          if (combined) {
            hasSpokenRef.current = true;
            capturedTextRef.current = combined;
            setLiveSpeechText(combined);
            setPromptInput(combined);
          }
        };

        recognition.onerror = () => {};
        recognition.onend = () => {
          if (speechRecRef.current && isMicListeningRef.current) {
            try {
              recognition.start();
            } catch {}
          }
        };

        recognition.start();
      } catch {}
    }
  };

  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const feedScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsMenuOpen(false);
      setIsAttachOpen(false);
      if (initialTab === 'debug') setAiMode('debug');
      else if (initialTab === 'generate') {
        setAiMode('generate');
        if (initialPrompt) setPromptInput(initialPrompt);
      } else {
        setAiMode('chat');
      }
    }
  }, [isOpen, initialTab, initialPrompt]);

  const extractCode = (markdown: string): string => {
    const codeBlockMatch = markdown.match(/```(?:[a-zA-Z0-9_\-\+]*)\n([\s\S]*?)```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      return codeBlockMatch[1].trim();
    }
    return '';
  };

  const handleAttachmentSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    kind: 'image' | 'video' | 'file' | 'folder'
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from<File>(files)
      .slice(0, 6)
      .forEach((file: File) => {
        const sizeKB = Math.max(1, Math.round(file.size / 1024));
        const itemId = `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const relativePath = (file as any).webkitRelativePath || file.name;

        if (kind === 'image' || file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = () => {
            setAttachments((prev) => [
              ...prev,
              {
                id: itemId,
                name: relativePath,
                type: 'image',
                previewUrl: typeof reader.result === 'string' ? reader.result : undefined,
                sizeLabel: `${sizeKB} KB`,
              },
            ]);
          };
          reader.readAsDataURL(file);
        } else if (kind === 'video' || file.type.startsWith('video/')) {
          setAttachments((prev) => [
            ...prev,
            {
              id: itemId,
              name: relativePath,
              type: 'video',
              sizeLabel: `${sizeKB} KB`,
            },
          ]);
        } else {
          const reader = new FileReader();
          reader.onload = () => {
            const snippet = typeof reader.result === 'string' ? reader.result.slice(0, 2000) : '';
            setAttachments((prev) => [
              ...prev,
              {
                id: itemId,
                name: relativePath,
                type: kind === 'folder' ? 'folder' : 'file',
                sizeLabel: `${sizeKB} KB`,
                contentSnippet: snippet,
              },
            ]);
          };
          reader.readAsText(file);
        }
      });

    e.target.value = '';
    setIsAttachOpen(false);
  };

  const handleExecute = async (
    overridePrompt?: string,
    overrideMode?: 'chat' | 'generate' | 'debug',
    overrideLang?: AiTargetPlatformId
  ) => {
    const activeMode = overrideMode || aiMode;
    const activeLang = overrideLang || targetLang;
    const platInfo = getAiPlatformById(activeLang);
    const rawCmd = (overridePrompt !== undefined ? overridePrompt : promptInput).trim();

    if (activeMode !== 'debug' && !rawCmd && attachments.length === 0) {
      return;
    }
    if (isLoading) return;

    const currentAttachments = [...attachments];
    const attachmentContext =
      currentAttachments.length > 0
        ? `\n[Attached Items: ${currentAttachments
            .map(
              (a) =>
                `${a.type.toUpperCase()}: ${a.name}${
                  a.contentSnippet ? `\nContent:\n${a.contentSnippet}` : ''
                }`
            )
            .join('\n')}]`
        : '';

    const displayPrompt =
      rawCmd ||
      (activeMode === 'debug'
        ? `Scan & Auto-Fix All Errors (${platInfo.label})`
        : `Attached ${currentAttachments.map((a) => a.name).join(', ')}`);

    setIsLoading(true);
    setIsMenuOpen(false);
    setIsAttachOpen(false);
    if (overridePrompt === undefined) {
      setPromptInput('');
    }
    setAttachments([]);

    const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      if (activeMode === 'debug') {
        const codeToScan =
          currentCode && currentCode.trim()
            ? currentCode
            : `// Sample code check for ${platInfo.label}`;
        const res = await debugCodeWithAi(codeToScan, activeFileName, activeLang);
        const newEntry: ModalFeedItem = {
          id: `feed-${Date.now()}`,
          userPrompt: displayPrompt,
          mode: 'debug',
          platformLabel: platInfo.label,
          platformIcon: platInfo.icon,
          platformColor: platInfo.color,
          attachments: currentAttachments,
          summary: res.summary || 'Scan & Auto-Fix completed.',
          code: res.fixedCode || null,
          fileName: activeFileName || platInfo.defaultFile,
          issues: res.issues || [],
          timestamp: timeLabel,
        };
        setFeedItems((prev) => [...prev, newEntry]);
      } else if (activeMode === 'generate') {
        const res = await generateAppWithAi(
          `${rawCmd || 'Create complete app'}${attachmentContext}`,
          activeLang
        );
        const newEntry: ModalFeedItem = {
          id: `feed-${Date.now()}`,
          userPrompt: displayPrompt,
          mode: 'generate',
          platformLabel: platInfo.label,
          platformIcon: platInfo.icon,
          platformColor: platInfo.color,
          attachments: currentAttachments,
          summary: `${res.title}: ${res.description}`,
          code: res.code || null,
          fileName: res.fileName || platInfo.defaultFile,
          timestamp: timeLabel,
        };
        setFeedItems((prev) => [...prev, newEntry]);
      } else {
        const responseText = await sendAiChatMessage(
          `${rawCmd || 'Analyze attached files and respond'}${attachmentContext}`,
          [],
          activeFileName,
          currentCode || undefined,
          activeLang
        );
        const parsedCode = extractCode(responseText);
        const cleanSummary =
          responseText.replace(/```(?:[a-zA-Z0-9_\-\+]*)\n[\s\S]*?```/g, '').trim() ||
          'AI command completed.';

        const newEntry: ModalFeedItem = {
          id: `feed-${Date.now()}`,
          userPrompt: displayPrompt,
          mode: 'chat',
          platformLabel: platInfo.label,
          platformIcon: platInfo.icon,
          platformColor: platInfo.color,
          attachments: currentAttachments,
          summary: cleanSummary,
          code: parsedCode || null,
          fileName: activeFileName || platInfo.defaultFile,
          timestamp: timeLabel,
        };
        setFeedItems((prev) => [...prev, newEntry]);
      }
    } catch {
      const fallbackEntry: ModalFeedItem = {
        id: `feed-${Date.now()}`,
        userPrompt: displayPrompt,
        mode: activeMode,
        platformLabel: platInfo.label,
        platformIcon: platInfo.icon,
        platformColor: platInfo.color,
        attachments: currentAttachments,
        summary: 'Hello! 👋 How can I help you with your code or app today?',
        code: null,
        fileName: activeFileName || platInfo.defaultFile,
        timestamp: timeLabel,
      };
      setFeedItems((prev) => [...prev, fallbackEntry]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        if (feedScrollRef.current) {
          feedScrollRef.current.scrollTop = feedScrollRef.current.scrollHeight;
        }
      }, 80);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        background: '#070913',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        padding: '6px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
      onClick={(e) => {
        e.stopPropagation();
        setIsMenuOpen(false);
        setIsAttachOpen(false);
      }}
    >
      {/* Hidden File / Gallery / Video / Folder Inputs for + Button */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => handleAttachmentSelect(e, 'image')}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => handleAttachmentSelect(e, 'video')}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="*/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => handleAttachmentSelect(e, 'file')}
      />
      <input
        ref={folderInputRef}
        type="file"
        {...({ webkitdirectory: '', directory: '' } as any)}
        multiple
        style={{ display: 'none' }}
        onChange={(e) => handleAttachmentSelect(e, 'folder')}
      />

      {/* MAIN FULL-SCREEN COMMAND BOX */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: '#080a14',
          border: '1.5px solid #1e2646',
          borderRadius: '16px',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 10px 32px rgba(0, 0, 0, 0.65)',
        }}
      >
        {/* Subtle Floating Close Button in Top-Right so user can return to editor */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 50,
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(20, 24, 44, 0.85)',
            border: '1px solid #334155',
            color: '#cbd5e1',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
          }}
          title="Close AI Command Box"
        >
          <i className="fas fa-times"></i>
        </button>

        {/* UPPER FULL-SCREEN RESPONSE FEED AREA */}
        <div
          ref={feedScrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* Sequential One-by-One Responses */}
          {feedItems.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                background: '#0e1224',
                border: '1px solid #222b4d',
                borderRadius: '14px',
                padding: '12px',
              }}
            >
              {/* User Command Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  paddingBottom: '6px',
                  borderBottom: '1px solid #1b223f',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0 }}>
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '7px',
                      background: `${item.platformColor}22`,
                      border: `1px solid ${item.platformColor}66`,
                      color: item.platformColor,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      flexShrink: 0,
                    }}
                  >
                    <i className={item.platformIcon}></i>
                  </span>
                  <span
                    style={{
                      fontSize: '12.5px',
                      fontWeight: 800,
                      color: '#f8fafc',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.userPrompt}
                  </span>
                </div>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, flexShrink: 0 }}>
                  {item.platformLabel} • {item.timestamp}
                </span>
              </div>

              {/* Attached Media / Files Preview */}
              {item.attachments && item.attachments.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {item.attachments.map((att) => (
                    <div
                      key={att.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 9px',
                        borderRadius: '8px',
                        background: '#151b33',
                        border: '1px solid #293462',
                        fontSize: '11px',
                        color: '#cbd5e1',
                      }}
                    >
                      {att.type === 'image' && att.previewUrl ? (
                        <img
                          src={att.previewUrl}
                          alt={att.name}
                          style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '5px' }}
                        />
                      ) : (
                        <i
                          className={
                            att.type === 'video'
                              ? 'fas fa-film'
                              : att.type === 'folder'
                              ? 'fas fa-folder-open'
                              : 'fas fa-file-lines'
                          }
                          style={{ color: '#38bdf8' }}
                        ></i>
                      )}
                      <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {att.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* AI Answer / Summary */}
              {item.summary && (
                <div
                  style={{
                    padding: '9px 11px',
                    borderRadius: '10px',
                    background: 'rgba(56, 189, 248, 0.09)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    color: '#f8fafc',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  <i className="fas fa-robot mr-2" style={{ color: '#38bdf8' }}></i>
                  {item.summary}
                </div>
              )}

              {/* Resolved Debug Issues */}
              {item.issues && item.issues.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {item.issues.map((iss, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '7px',
                        background: '#14182e',
                        border: '1px solid #202747',
                        fontSize: '11.5px',
                        color: iss.type === 'error' ? '#f87171' : '#fbbf24',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <i className="fas fa-circle-check"></i>
                      <span>
                        {iss.line ? `[Line ${iss.line}] ` : ''}
                        {iss.message}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Generated / Fixed Code Block + Apply / Run / Copy Buttons */}
              {item.code && (
                <>
                  <pre
                    style={{
                      margin: 0,
                      padding: '11px',
                      background: '#060811',
                      border: '1px solid #1b223c',
                      borderRadius: '10px',
                      color: '#e2e8f0',
                      fontSize: '11.5px',
                      lineHeight: '1.45',
                      fontFamily: 'monospace',
                      maxHeight: '260px',
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    <code>{item.code}</code>
                  </pre>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        onApplyCode(item.code!, item.fileName, false);
                        onShowAlert?.(`Applied code to ${item.fileName}!`);
                        onClose();
                      }}
                      style={{
                        height: '34px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                      }}
                    >
                      <i className="fas fa-check"></i>
                      <span>APPLY</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onApplyCode(item.code!, item.fileName, true);
                        onShowAlert?.('Running live preview!');
                        onClose();
                      }}
                      style={{
                        height: '34px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                      }}
                    >
                      <i className="fas fa-play"></i>
                      <span>RUN</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(item.code!);
                        onShowAlert?.('Code copied to clipboard!');
                      }}
                      style={{
                        height: '34px',
                        borderRadius: '8px',
                        border: '1px solid #334155',
                        background: '#171d36',
                        color: '#f8fafc',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                      }}
                    >
                      <i className="fas fa-copy"></i>
                      <span>COPY</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Loading Indicator inside Feed */}
          {isLoading && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                background: '#0e1326',
                border: '1px solid #26325e',
                color: '#38bdf8',
                fontSize: '12.5px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <i className="fas fa-spinner fa-spin"></i>
              <span>AI IS WORKING ON YOUR COMMAND...</span>
            </div>
          )}
        </div>

        {/* VERTICAL RIGHT-SIDE HALF-SCREEN OPTIONS DRAWER (Full height top-to-bottom, 52% width on right side, single serial column 1-by-1) */}
        {isMenuOpen && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              width: '52%',
              minWidth: '175px',
              maxWidth: '250px',
              height: '100%',
              overflowY: 'auto',
              zIndex: 120,
              background: '#111528',
              borderLeft: '2px solid #35416e',
              padding: '10px 8px',
              boxShadow: '-12px 0 36px rgba(0, 0, 0, 0.92)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header with Close Button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '6px',
                borderBottom: '1px solid #263056',
              }}
            >
              <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.5px' }}>
                AI STUDIO OPTIONS
              </span>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  background: '#1c2340',
                  border: '1px solid #334170',
                  color: '#cbd5e1',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* SECTION 1: AI Studio Mode (Single Serial Column 1-by-1) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.4px' }}>
                1. AI STUDIO MODE
              </span>
              {[
                { id: 'chat', label: 'AI Chat & Command', icon: 'fas fa-terminal', color: '#38bdf8' },
                { id: 'generate', label: 'Prompt to App', icon: 'fas fa-wand-magic-sparkles', color: '#10b981' },
                { id: 'debug', label: 'Debug & Fix Errors', icon: 'fas fa-bug-slash', color: '#fbbf24' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setAiMode(m.id as any);
                    setIsMenuOpen(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 9px',
                    borderRadius: '9px',
                    background: aiMode === m.id ? `${m.color}24` : '#181d35',
                    border: aiMode === m.id ? `1.5px solid ${m.color}` : '1px solid #262f52',
                    color: '#f8fafc',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '6px',
                      background: `${m.color}22`,
                      color: m.color,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      flexShrink: 0,
                    }}
                  >
                    <i className={m.icon}></i>
                  </span>
                  <span style={{ lineHeight: '1.25' }}>{m.label}</span>
                </button>
              ))}
            </div>

            <div style={{ height: '1px', background: '#262d4a' }} />

            {/* SECTION 2: All 15 Target Platforms (Single Serial Column 1-by-1) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#34d399', letterSpacing: '0.4px' }}>
                2. PLATFORMS ({AI_TARGET_PLATFORMS.length})
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {AI_TARGET_PLATFORMS.map((plat) => (
                  <button
                    key={plat.id}
                    type="button"
                    onClick={() => {
                      setTargetLang(plat.id);
                      setIsMenuOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '7px 9px',
                      borderRadius: '9px',
                      border: targetLang === plat.id ? `1.5px solid ${plat.color}` : '1px solid #242c4c',
                      background: targetLang === plat.id ? `${plat.color}22` : '#171c32',
                      color: targetLang === plat.id ? '#ffffff' : '#e2e8f0',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      textAlign: 'left',
                    }}
                  >
                    <span
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '6px',
                        background: `${plat.color}24`,
                        color: plat.color,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        flexShrink: 0,
                      }}
                    >
                      <i className={plat.icon}></i>
                    </span>
                    <span style={{ lineHeight: '1.25', wordBreak: 'break-word' }}>{plat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ height: '1px', background: '#262d4a' }} />

            {/* SECTION 3: All 13 Direct AI Quick Commands & Features (Single Serial Column 1-by-1) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.4px' }}>
                3. AI FEATURES ({AI_QUICK_COMMANDS.length})
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {AI_QUICK_COMMANDS.map((cmd) => (
                  <button
                    key={cmd.id}
                    type="button"
                    onClick={() => {
                      setAiMode('chat');
                      handleExecute(cmd.prompt, 'chat');
                    }}
                    style={{
                      width: '100%',
                      padding: '7px 9px',
                      borderRadius: '9px',
                      border: '1px solid #263056',
                      background: '#171c34',
                      color: '#e2e8f0',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      textAlign: 'left',
                    }}
                  >
                    <span
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '6px',
                        background: `${cmd.color}24`,
                        color: cmd.color,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        flexShrink: 0,
                      }}
                    >
                      <i className={cmd.icon}></i>
                    </span>
                    <span style={{ lineHeight: '1.25' }}>{cmd.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ height: '1px', background: '#262d4a' }} />

            {/* SECTION 4: All 9 Prompt to App Templates (Single Serial Column 1-by-1) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#10b981', letterSpacing: '0.4px' }}>
                4. APP TEMPLATES ({AI_APP_TEMPLATES.length})
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {AI_APP_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      setAiMode('generate');
                      handleExecute(tpl.prompt, 'generate');
                    }}
                    style={{
                      width: '100%',
                      padding: '7px 9px',
                      borderRadius: '9px',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      background: '#142129',
                      color: '#d1fae5',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      textAlign: 'left',
                    }}
                  >
                    <span
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '6px',
                        background: `${tpl.color}24`,
                        color: tpl.color,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        flexShrink: 0,
                      }}
                    >
                      <i className={tpl.icon}></i>
                    </span>
                    <span style={{ lineHeight: '1.25' }}>{tpl.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ height: '1px', background: '#262d4a' }} />

            {/* SECTION 5: One-Tap Scan & Auto-Fix All Errors */}
            <button
              type="button"
              onClick={() => {
                setAiMode('debug');
                handleExecute('Scan & Auto-Fix All Errors', 'debug');
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '9px 10px',
                borderRadius: '9px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                border: 'none',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <i className="fas fa-wrench"></i>
              <span>SCAN & AUTO-FIX</span>
            </button>
          </div>
        )}

        {/* COMPACT ATTACHMENT & EMOJI POPUP ABOVE THE BOTTOM-LEFT PLUS (+) BUTTON */}
        {isAttachOpen && (
          <div
            style={{
              position: 'absolute',
              bottom: '112px',
              left: '10px',
              width: '220px',
              zIndex: 120,
              background: '#14182e',
              border: '1.5px solid #35416e',
              borderRadius: '14px',
              padding: '8px',
              boxShadow: '0 -10px 35px rgba(0, 0, 0, 0.92)',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              style={{
                padding: '8px 10px',
                borderRadius: '9px',
                background: '#1b213d',
                border: '1px solid #2b355e',
                color: '#f8fafc',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                textAlign: 'left',
              }}
            >
              <i className="fas fa-image" style={{ color: '#38bdf8', width: '16px', textAlign: 'center' }}></i>
              <span>Gallery Photo (ছবি)</span>
            </button>

            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              style={{
                padding: '8px 10px',
                borderRadius: '9px',
                background: '#1b213d',
                border: '1px solid #2b355e',
                color: '#f8fafc',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                textAlign: 'left',
              }}
            >
              <i className="fas fa-film" style={{ color: '#f472b6', width: '16px', textAlign: 'center' }}></i>
              <span>Movie / Video (মুভি)</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '8px 10px',
                borderRadius: '9px',
                background: '#1b213d',
                border: '1px solid #2b355e',
                color: '#f8fafc',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                textAlign: 'left',
              }}
            >
              <i className="fas fa-file-lines" style={{ color: '#34d399', width: '16px', textAlign: 'center' }}></i>
              <span>Upload File (ফাইল)</span>
            </button>

            <button
              type="button"
              onClick={() => folderInputRef.current?.click()}
              style={{
                padding: '8px 10px',
                borderRadius: '9px',
                background: '#1b213d',
                border: '1px solid #2b355e',
                color: '#f8fafc',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                textAlign: 'left',
              }}
            >
              <i className="fas fa-folder-plus" style={{ color: '#fbbf24', width: '16px', textAlign: 'center' }}></i>
              <span>Upload Folder (ফোল্ডার)</span>
            </button>
          </div>
        )}

        {/* BOTTOM ROUNDED COMMAND BOX MATCHING IMG_20261011_211401.png */}
        <div
          style={{
            padding: '6px 8px 8px 8px',
            background: '#080a14',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            flexShrink: 0,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Selected Attachments Strip */}
          {attachments.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto' }}>
              {attachments.map((att) => (
                <div
                  key={att.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '3px 8px',
                    borderRadius: '7px',
                    background: '#171f3c',
                    border: '1px solid #2e3b6e',
                    fontSize: '11px',
                    color: '#e2e8f0',
                    flexShrink: 0,
                  }}
                >
                  {att.type === 'image' && att.previewUrl ? (
                    <img
                      src={att.previewUrl}
                      alt={att.name}
                      style={{ width: '20px', height: '20px', borderRadius: '4px', objectFit: 'cover' }}
                    />
                  ) : (
                    <i
                      className={
                        att.type === 'video'
                          ? 'fas fa-film'
                          : att.type === 'folder'
                          ? 'fas fa-folder'
                          : 'fas fa-file'
                      }
                      style={{ color: '#38bdf8' }}
                    ></i>
                  )}
                  <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {att.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAttachments((prev) => prev.filter((x) => x.id !== att.id))}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#f87171',
                      cursor: 'pointer',
                      fontSize: '11px',
                      padding: 0,
                    }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* UNIQUE HIGH-TECH FLOATING VOICE WAVE CAPSULE (Appears when user is recording or AI is transcribing) */}
          {(isMicListening || isMicTranscribing || voiceStatusMsg) && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '18px',
                background: isMicListening
                  ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(30, 27, 75, 0.96) 100%)'
                  : isMicTranscribing
                  ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(23, 37, 84, 0.96) 100%)'
                  : 'rgba(15, 23, 42, 0.96)',
                border: isMicListening
                  ? '1.5px solid rgba(239, 68, 68, 0.7)'
                  : isMicTranscribing
                  ? '1.5px solid rgba(59, 130, 246, 0.75)'
                  : '1.5px solid rgba(16, 185, 129, 0.6)',
                boxShadow: isMicListening
                  ? '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(239, 68, 68, 0.35)'
                  : isMicTranscribing
                  ? '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(59, 130, 246, 0.35)'
                  : '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 16px rgba(16, 185, 129, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                backdropFilter: 'blur(12px)',
                transition: 'all 0.25s ease',
              }}
            >
              {/* Header Row: Status badge + Timer + 7-Bar Sound Wave + Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isMicListening ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        background: 'rgba(239, 68, 68, 0.22)',
                        border: '1px solid rgba(239, 68, 68, 0.6)',
                        color: '#fca5a5',
                        fontSize: '11px',
                        fontWeight: 800,
                        letterSpacing: '0.5px',
                      }}
                    >
                      <span
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          background: '#ef4444',
                          boxShadow: '0 0 8px #ef4444',
                        }}
                      />
                      LIVE {formatVoiceTimer(recordingSeconds)}
                    </span>
                  ) : isMicTranscribing ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        background: 'rgba(59, 130, 246, 0.22)',
                        border: '1px solid rgba(59, 130, 246, 0.6)',
                        color: '#93c5fd',
                        fontSize: '11px',
                        fontWeight: 800,
                      }}
                    >
                      <i className="fas fa-wand-magic-sparkles fa-spin" style={{ fontSize: '10px' }}></i>
                      AI ট্রান্সক্রাইব করছে...
                    </span>
                  ) : (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        background: 'rgba(16, 185, 129, 0.22)',
                        border: '1px solid rgba(16, 185, 129, 0.6)',
                        color: '#6ee7b7',
                        fontSize: '11px',
                        fontWeight: 800,
                      }}
                    >
                      <i className="fas fa-check" style={{ fontSize: '10px' }}></i>
                      {voiceStatusMsg}
                    </span>
                  )}

                  <span
                    style={{
                      fontSize: '11px',
                      color: '#94a3b8',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: 600,
                    }}
                  >
                    <i className="fas fa-language" style={{ color: '#38bdf8' }}></i>
                    বাংলা / EN
                  </span>
                </div>

                {/* 7-Bar Dynamic Equalizer Sound Wave */}
                {isMicListening && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      height: '24px',
                      padding: '0 4px',
                    }}
                  >
                    {voiceBars.map((barHeight, idx) => (
                      <span
                        key={idx}
                        style={{
                          width: '3.5px',
                          height: `${barHeight}px`,
                          background:
                            idx === 3
                              ? 'linear-gradient(180deg, #ef4444 0%, #ec4899 100%)'
                              : idx === 2 || idx === 4
                              ? 'linear-gradient(180deg, #ec4899 0%, #8b5cf6 100%)'
                              : 'linear-gradient(180deg, #8b5cf6 0%, #38bdf8 100%)',
                          borderRadius: '3px',
                          transition: 'height 0.06s ease',
                          display: 'block',
                          boxShadow: '0 0 6px rgba(236, 72, 153, 0.6)',
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Quick Action buttons */}
                {isMicListening && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => stopVoiceRecording(true)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '9px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
                      }}
                      title="ভয়েস রেকর্ড সম্পন্ন করুন ও যুক্ত করুন"
                    >
                      <i className="fas fa-check" style={{ fontSize: '10px' }}></i>
                      ডান
                    </button>
                    <button
                      type="button"
                      onClick={() => stopVoiceRecording(false)}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '8px',
                        background: 'rgba(239, 68, 68, 0.18)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#f87171',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="বাতিল করুন (Cancel)"
                    >
                      <i className="fas fa-xmark"></i>
                    </button>
                  </div>
                )}
              </div>

              {/* Live Audio / Transcribed Text Preview */}
              {isMicListening && (
                <div
                  style={{
                    fontSize: '12.5px',
                    color: liveSpeechText ? '#f8fafc' : '#94a3b8',
                    fontStyle: liveSpeechText ? 'normal' : 'italic',
                    background: 'rgba(0, 0, 0, 0.35)',
                    padding: '7px 10px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    minHeight: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <i
                    className="fas fa-microphone-lines"
                    style={{ fontSize: '11px', color: '#60a5fa', opacity: 0.85 }}
                  ></i>
                  <span style={{ flex: 1, wordBreak: 'break-word', lineHeight: '1.4' }}>
                    {liveSpeechText || 'কথা বলুন... আপনার কণ্ঠ স্বয়ংক্রিয়ভাবে কমান্ডে রূপান্তরিত হবে'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Rounded Dark Command Card */}
          <div
            style={{
              background: '#181920',
              border: '1.5px solid #2e313d',
              borderRadius: '20px',
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.45)',
            }}
          >
            {/* Top Command Textarea (Clean short placeholder: "কমান্ড লেখো...") */}
            <textarea
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onContextMenu={(e) => {
                e.preventDefault();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (isMicListening) stopVoiceRecording();
                  handleExecute();
                }
              }}
              placeholder="কমান্ড লেখো..."
              rows={2}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#f8fafc',
                fontSize: '14px',
                lineHeight: '1.45',
                padding: '0 2px',
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit',
                userSelect: 'text',
              }}
            />

            {/* Bottom Action Row: Left [⊕ Plus] [☰ Options] | Right [🎤 Unique Voice System] [↑ Send] */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              {/* LEFT SIDE: [⊕ Plus Gallery/Files] + [☰ Vertical Right-Half Screen AI Options] */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsAttachOpen((prev) => !prev);
                  }}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: isAttachOpen ? '#2563eb' : '#22242e',
                    border: '1px solid #363947',
                    color: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                  title="Attach Photo, Video, File, Folder"
                >
                  <i className="fas fa-circle-plus"></i>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsAttachOpen(false);
                    setIsMenuOpen((prev) => !prev);
                  }}
                  style={{
                    height: '38px',
                    padding: '0 11px',
                    borderRadius: '12px',
                    background: isMenuOpen
                      ? 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)'
                      : '#22242e',
                    border: isMenuOpen ? '1px solid #60a5fa' : '1px solid #363947',
                    color: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                  title="Open Half-Screen AI Options"
                >
                  <i className="fas fa-bars" style={{ fontSize: '13px', color: '#38bdf8' }}></i>
                  <i
                    className={getAiPlatformById(targetLang).icon}
                    style={{ fontSize: '12px', color: getAiPlatformById(targetLang).color }}
                  ></i>
                </button>
              </div>

              {/* RIGHT SIDE: [🎤 Unique Glowing Equalizer Mic] + [↑ Send Button] */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: isMicListening
                      ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                      : isMicTranscribing
                      ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                      : '#22242e',
                    border: isMicListening
                      ? '1.5px solid #f87171'
                      : isMicTranscribing
                      ? '1.5px solid #60a5fa'
                      : '1px solid #363947',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    flexShrink: 0,
                    boxShadow: isMicListening
                      ? '0 0 16px rgba(239, 68, 68, 0.85), 0 0 30px rgba(239, 68, 68, 0.4)'
                      : isMicTranscribing
                      ? '0 0 16px rgba(59, 130, 246, 0.85)'
                      : 'none',
                    transition: 'all 0.2s ease',
                  }}
                  title={
                    isMicListening
                      ? 'ভয়েস বন্ধ করতে ট্যাপ করুন (Tap to Stop)'
                      : isMicTranscribing
                      ? 'AI ট্রান্সক্রাইব করছে...'
                      : 'ভয়েসে কথা বলুন (বাংলা / English)'
                  }
                >
                  {isMicListening ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '20px' }}>
                      <span
                        style={{
                          width: '3px',
                          height: `${Math.max(6, Math.min(18, Math.round((micVoiceLevel / 100) * 18)))}px`,
                          background: '#ffffff',
                          borderRadius: '2px',
                          transition: 'height 0.06s ease',
                        }}
                      />
                      <span
                        style={{
                          width: '3px',
                          height: `${Math.max(10, Math.min(22, Math.round((micVoiceLevel / 100) * 24)))}px`,
                          background: '#ffffff',
                          borderRadius: '2px',
                          transition: 'height 0.06s ease',
                        }}
                      />
                      <span
                        style={{
                          width: '3px',
                          height: `${Math.max(6, Math.min(18, Math.round((micVoiceLevel / 100) * 18)))}px`,
                          background: '#ffffff',
                          borderRadius: '2px',
                          transition: 'height 0.06s ease',
                        }}
                      />
                    </div>
                  ) : isMicTranscribing ? (
                    <i className="fas fa-wand-magic-sparkles fa-spin" style={{ fontSize: '13px', color: '#ffffff' }}></i>
                  ) : (
                    <i
                      className="fas fa-microphone"
                      style={{ position: 'relative', zIndex: 2, fontSize: '14px', color: '#f1f5f9' }}
                    ></i>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (isMicListening) stopVoiceRecording();
                    handleExecute();
                  }}
                  disabled={isLoading}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    border: '1px solid #363947',
                    background: isLoading
                      ? '#334155'
                      : promptInput.trim() || attachments.length > 0
                      ? 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)'
                      : '#22242e',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    flexShrink: 0,
                  }}
                  title="Send Command"
                >
                  {isLoading ? (
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: '12px' }}></i>
                  ) : (
                    <i className="fas fa-arrow-up"></i>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

