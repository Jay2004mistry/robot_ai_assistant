import { useState, useEffect, useRef } from "react";
import { Globe, X } from "lucide-react";
import RobotFace from "./components/RobotFace";
import type { RobotState, RobotExpression } from "./components/RobotFace";
import { motion, AnimatePresence } from "framer-motion";

const LANGUAGES = [
  { code: "en", locale: "en-US", name: "English (US)" },
  { code: "hi", locale: "hi-IN", name: "Hindi (हिंदी)" },
  { code: "gu", locale: "gu-IN", name: "Gujarati (ગુજરાતી)" },
  { code: "es", locale: "es-ES", name: "Spanish (Español)" },
  { code: "fr", locale: "fr-FR", name: "French (Français)" },
  { code: "de", locale: "de-DE", name: "German (Deutsch)" },
  { code: "ja", locale: "ja-JP", name: "Japanese (日本語)" },
  { code: "zh", locale: "zh-CN", name: "Chinese (中文)" },
  { code: "ar", locale: "ar-SA", name: "Arabic (العربية)" },
  { code: "ru", locale: "ru-RU", name: "Russian (Русский)" },
  { code: "pt", locale: "pt-PT", name: "Portuguese (Português)" }
];

export default function App() {
  const [robotState, setRobotState] = useState<RobotState>("idle");
  const [expression, setExpression] = useState<RobotExpression>("neutral");
  const [userTranscript, setUserTranscript] = useState("");
  const userTranscriptRef = useRef("");
  const [botSpeech, setBotSpeech] = useState("Greetings! I am V-Bot, your virtual robot assistant. Click me to speak!");
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]); // Default to English
  const [isListening, setIsListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Custom states for the interactive widget
  const [isBubbleVisible, setIsBubbleVisible] = useState(true);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize SpeechRecognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false; // Stop listening when user stops speaking
        rec.interimResults = true; // Show results in real-time
        rec.maxAlternatives = 1;
        recognitionRef.current = rec;
      } else {
        setErrorMsg("Web Speech API is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      }
    }

    return () => {
      stopAudio();
    };
  }, []);

  // Handle Stop Audio Playback
  const stopAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  // Toggle Microphone
  const handleMicClick = () => {
    const rec = recognitionRef.current;
    if (!rec) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      rec.stop();
      setIsListening(false);
      return;
    }

    // Stop current audio speaking
    stopAudio();
    setRobotState("listening");
    setExpression("neutral");
    setIsListening(true);
    setUserTranscript("");
    userTranscriptRef.current = "";
    setErrorMsg(null);

    // Set recognition language locale
    rec.lang = selectedLang.locale;

    // Handle real-time speech results
    rec.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      const fullTranscript = finalTranscript || interimTranscript;
      setUserTranscript(fullTranscript);
      userTranscriptRef.current = fullTranscript;
    };

    rec.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "no-speech") {
        setErrorMsg("No speech detected. Please speak clearly into your mic.");
      } else if (event.error === "not-allowed") {
        setErrorMsg("Microphone permission denied. Please allow access in browser settings.");
      } else {
        setErrorMsg(`Recognition error: ${event.error}`);
      }
      setIsListening(false);
      setRobotState("idle");
    };

    rec.onend = () => {
      setIsListening(false);
      // Retrieve transcript and send to backend
      const transcriptVal = userTranscriptRef.current.trim();
      if (transcriptVal) {
        submitQueryToBot(transcriptVal);
      } else {
        setRobotState("idle");
      }
    };

    rec.start();
  };

  // Submit text query to FastAPI backend
  const submitQueryToBot = async (queryText: string) => {
    setRobotState("thinking");
    setExpression("thinking");
    setErrorMsg(null);
    setBotSpeech("Processing speech patterns...");
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";
      const response = await fetch(`${apiUrl}/api/voice-query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: queryText,
          lang: selectedLang.code,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Server error generating response.");
      }

      const data = await response.json();
      const textResponse = data.text;
      const expressionResponse = data.expression || "neutral";
      const audioB64 = data.audio;

      setBotSpeech(textResponse);
      setExpression(expressionResponse as RobotExpression);

      if (audioB64) {
        playSpeech(audioB64);
      } else {
        // Fallback if no audio generated
        setRobotState("idle");
        setExpression("neutral");
      }

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to communicate with local Vihil API.");
      setBotSpeech("System error. Check if backend server is online.");
      setRobotState("idle");
      setExpression("sad");
    }
  };

  // Play audio response & update robot state
  const playSpeech = (audioB64: string) => {
    stopAudio();
    
    const audioSrc = `data:audio/mp3;base64,${audioB64}`;
    const audio = new Audio(audioSrc);
    currentAudioRef.current = audio;
    setRobotState("speaking");

    audio.onended = () => {
      setRobotState("idle");
      setExpression("neutral");
    };

    audio.onerror = (e) => {
      console.error("Audio playback error:", e);
      setRobotState("idle");
      setExpression("sad");
      setErrorMsg("Failed to play synthesized voice track.");
    };

    audio.play().catch((err) => {
      console.warn("Autoplay blocked or playback error:", err);
      // Playback failed (browser policy blocking autoplay) - user can click
      setRobotState("idle");
      setExpression("neutral");
    });
  };

  // Toggle mic and make sure bubble is visible
  const handleRobotClick = () => {
    setIsBubbleVisible(true);
    setIsLangOpen(false);
    handleMicClick();
  };

  // Close speech bubble and reset audio/mic
  const handleCloseBubble = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering parent click which starts listening
    setIsBubbleVisible(false);
    setIsLangOpen(false);
    stopAudio();
    if (isListening) {
      const rec = recognitionRef.current;
      if (rec) rec.stop();
      setIsListening(false);
    }
    setRobotState("idle");
    setExpression("neutral");
  };

  return (
    <div className="min-h-screen bg-[#030712] text-gray-200 flex flex-col font-sans relative overflow-x-hidden select-none">
      {/* Visual background details */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-blue-950/20 via-slate-950/0 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* --- FLOATING ROBOT COMPANION COMPONENT (BOTTOM RIGHT) --- */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
        
        {/* SCI-FI SPEECH BUBBLE CLOUD ABOVE ROBOT */}
        <AnimatePresence>
          {isBubbleVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 15 }}
              className="bg-slate-950/90 backdrop-blur-xl border border-white/10 rounded-[20px] p-4 shadow-2xl flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)] select-none pointer-events-auto relative z-40 mb-2.5 text-left"
            >
              {/* Tail pointing to robot antenna */}
              <div className="absolute right-14 -bottom-2 w-3.5 h-3.5 bg-slate-950 border-r border-b border-white/10 transform rotate-45 z-0" />

              {/* Bubble Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-2 text-[10px] font-bold tracking-wider relative z-10">
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    robotState === "listening" ? "bg-emerald-500 animate-pulse shadow-[0_0_6px_#10b981]" :
                    robotState === "thinking" ? "bg-amber-500 animate-pulse shadow-[0_0_6px_#f59e0b]" :
                    robotState === "speaking" ? "bg-cyan-500 animate-pulse shadow-[0_0_6px_#06b6d4]" : "bg-blue-400 shadow-[0_0_6px_#3b82f6]"
                  }`} />
                  {robotState === "idle" && <span className="text-blue-400">V-BOT STANDBY</span>}
                  {robotState === "listening" && <span className="text-emerald-400 animate-pulse">LISTENING...</span>}
                  {robotState === "thinking" && <span className="text-amber-400 animate-pulse">THINKING...</span>}
                  {robotState === "speaking" && <span className="text-cyan-400">V-BOT SPEAKING</span>}
                </div>

                <div className="flex items-center gap-2">
                  {/* Language Selector trigger */}
                  <button
                    onClick={() => setIsLangOpen(!isLangOpen)}
                    className="p-1 rounded bg-white/5 border border-white/5 hover:bg-white/10 active:scale-95 text-gray-400 hover:text-white transition cursor-pointer"
                    title="Change Language"
                  >
                    <Globe className="w-3.5 h-3.5" />
                  </button>
                  {/* Close bubble button */}
                  <button
                    onClick={handleCloseBubble}
                    className="p-1 rounded bg-white/5 border border-white/5 hover:bg-white/10 active:scale-95 text-gray-400 hover:text-white transition cursor-pointer"
                    title="Close bubble"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Bubble Body Content */}
              <div className="text-xs leading-relaxed relative z-10">
                {isLangOpen ? (
                  /* Inline Language Selector */
                  <div className="flex flex-col gap-1 max-h-[160px] overflow-y-auto pr-1 no-scrollbar py-1">
                    <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1">Select Language</div>
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setSelectedLang(lang);
                          setIsLangOpen(false);
                          stopAudio();
                          setRobotState("idle");
                          setExpression("neutral");
                          setBotSpeech(`Language changed to ${lang.name}. Click me to speak!`);
                        }}
                        className={`w-full text-left text-[11px] px-2.5 py-1.5 rounded-lg transition font-semibold ${
                          selectedLang.code === lang.code
                            ? "bg-blue-600/35 text-blue-300 border border-blue-500/30"
                            : "hover:bg-white/5 text-gray-300 border border-transparent"
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  /* Caption text and errors */
                  <div className="flex flex-col gap-2">
                    {/* Error display */}
                    {errorMsg && (
                      <div className="p-2 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold">
                        {errorMsg}
                      </div>
                    )}
                    
                    {/* Caption Log */}
                    {robotState === "listening" ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">You:</span>
                        <p className="text-white italic">
                          {userTranscript ? `"${userTranscript}"` : "Speak now..."}
                        </p>
                      </div>
                    ) : robotState === "thinking" ? (
                      <p className="text-gray-400 italic animate-pulse">Processing neural patterns...</p>
                    ) : robotState === "speaking" ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">V-Bot:</span>
                        <p className="text-gray-100 font-medium">{botSpeech}</p>
                      </div>
                    ) : (
                      /* Idle state greeting */
                      <p className="text-gray-300 font-medium">
                        {botSpeech || "Greetings! Click me to start speaking."}
                      </p>
                    )}
                  </div>
                )}
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Small floating Robot character container */}
        <div className="w-24 h-36 sm:w-28 sm:h-40 pointer-events-auto">
          <RobotFace 
            state={robotState} 
            expression={expression} 
            onClick={handleRobotClick}
          />
        </div>
      </div>
    </div>
  );
}
