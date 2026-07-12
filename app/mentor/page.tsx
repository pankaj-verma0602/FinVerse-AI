"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/firebase/auth-context";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Sparkles, 
  ArrowLeft, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Globe, 
  HelpCircle, 
  Trash2,
  Loader2,
  AlertCircle
} from "lucide-react";

interface ChatMessage {
  sender: "user" | "ai" | "system";
  text: string;
}

const PRESET_PROMPTS_EN = [
  { label: "Explain Compound Interest", query: "Explain compound interest with a simple real-world analogy." },
  { label: "What is Inflation?", query: "How does inflation silently reduce my savings, and how do I beat it?" },
  { label: "How do Tax Brackets work?", query: "Explain how marginal tax brackets work simply. Does a raise mean I take home less?" },
  { label: "SIP vs Lump Sum", query: "What is the difference between SIP and lump sum investing for beginners?" }
];

const PRESET_PROMPTS_HI = [
  { label: "चक्रवृद्धि ब्याज क्या है?", query: "चक्रवृद्धि ब्याज (Compound Interest) क्या है? इसे उदाहरण के साथ आसान शब्दों में समझाएं।" },
  { label: "महंगाई (Inflation) का प्रभाव", query: "मुद्रास्फीति (Inflation) मेरे पैसों की कीमत कैसे घटाती है? इसे समझाएं।" },
  { label: "50/30/20 बजट नियम", query: "बजट बनाने का 50/30/20 नियम क्या है? यह हमारे काम कैसे आ सकता है?" },
  { label: "म्युचुअल फंड क्या होता है?", query: "म्युचुअल फंड (Mutual Funds) क्या होता है और इसमें SIP से निवेश करना क्यों बेहतर है?" }
];

export default function MentorPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Settings states
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  // Chat states
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);

  // Voice states
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Track SpeechSynthesis voices dynamically
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const loadVoices = () => {
        setVoices(window.speechSynthesis.getVoices());
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Ref for scroll auto-adjustment
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auth Protection
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Scroll to chat bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  // Initialize Speech Recognition API
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;

        rec.onstart = () => {
          setListening(true);
        };

        rec.onend = () => {
          setListening(false);
        };

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
        };

        rec.onerror = (event: any) => {
          console.error("Speech Recognition Error:", event.error);
          setListening(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, [language]);

  // Initialize welcome message
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLang = localStorage.getItem("finverse_language") as "en" | "hi";
      if (storedLang) {
        setLanguage(storedLang);
      }
    }
  }, []);

  // Initialize welcome message
  useEffect(() => {
    if (user) {
      setChatHistory([
        { 
          sender: "system", 
          text: language === "hi" 
            ? "नमस्ते! मैं आपका FinVerse AI मनी मेंटर हूँ। मुझसे बजट, निवेश, कंपाउंडिंग या टैक्स के बारे में कोई भी प्रश्न पूछें। आप माइक बटन दबाकर बोल भी सकते हैं।"
            : "Hello! I am your FinVerse AI Money Mentor. Ask me any questions about budgeting, investing, compounding, or taxes. You can also press the mic button to speak."
        }
      ]);
    }
  }, [user, language]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground text-sm">Loading money mentor...</p>
        </div>
      </div>
    );
  }

  // Voice playback using Web Speech API
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    
    // Stop any active audio
    window.speechSynthesis.cancel();
    
    // Clean markdown notation (like bullet points or asterisks) for speech
    const cleanText = text.replace(/[*#`•]/g, " ").replace(/-/g, " ");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Apply custom speech rate from settings
    const storedRate = localStorage.getItem("finverse_speech_rate");
    if (storedRate) {
      utterance.rate = Number(storedRate);
    }

    let voice = null;
    const storedVoiceProfile = localStorage.getItem("finverse_voice_profile");

    if (language === "hi") {
      utterance.lang = "hi-IN";
      const hiVoices = voices.filter(v => v.lang.startsWith("hi") || v.lang.includes("hi"));
      if (storedVoiceProfile === "aura") {
        voice = hiVoices.find(v => v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("kalpana") || v.name.toLowerCase().includes("zira") || v.name.toLowerCase().includes("local"));
      } else if (storedVoiceProfile === "echo") {
        voice = hiVoices.find(v => v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("hemant") || v.name.toLowerCase().includes("ravi") || v.name.toLowerCase().includes("hari"));
      }
      if (!voice) {
        voice = hiVoices[0];
      }
    } else {
      utterance.lang = "en-US";
      const enVoices = voices.filter(v => v.lang.startsWith("en") || v.lang.includes("en"));
      if (storedVoiceProfile === "aura") {
        voice = enVoices.find(v => v.name.toLowerCase().includes("zira") || v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("samantha") || v.name.toLowerCase().includes("google us english"));
      } else if (storedVoiceProfile === "echo") {
        voice = enVoices.find(v => v.name.toLowerCase().includes("david") || v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("mark") || v.name.toLowerCase().includes("google uk english male"));
      }
      if (!voice) {
        voice = enVoices[0];
      }
    }

    if (voice) {
      utterance.voice = voice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  // Toggle Voice listening
  const toggleListening = () => {
    const rec = recognitionRef.current;
    if (!rec) {
      alert("Voice input is not supported in this browser. Please use Google Chrome or Apple Safari.");
      return;
    }

    if (listening) {
      rec.stop();
    } else {
      rec.lang = language === "hi" ? "hi-IN" : "en-US";
      try {
        rec.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Demo Fallback Generator for Offline Mode / Demo Key Mode
  const getDemoMentorResponse = (query: string): string => {
    const q = query.toLowerCase();
    
    if (language === "hi") {
      if (q.includes("चक्रवृद्धि") || q.includes("interest") || q.includes("ब्याज")) {
        return "चक्रवृद्धि ब्याज (Compound Interest) तब होता है जब आप अपने मूल धन पर तो ब्याज कमाते ही हैं, साथ ही पहले कमाए गए ब्याज पर भी ब्याज कमाते हैं।\n\n• उदाहरण: यदि आप 10% की दर से $100 जमा करते हैं, तो वर्ष 1 में आपके पास $110 होंगे। वर्ष 2 में, आप पूरे $110 पर 10% ब्याज ($11) कमाएंगे, जिससे आपका पैसा $121 हो जाएगा।\n• समय के साथ यह ब्याज का ब्याज आपके पैसे को तेजी से बढ़ाता है।";
      }
      if (q.includes("महंगाई") || q.includes("inflation") || q.includes("मुद्रास्फीति")) {
        return "मुद्रास्फीति (Inflation) का अर्थ है समय के साथ वस्तुओं और सेवाओं की कीमतों में होने वाली वृद्धि। इससे आपके पैसे की क्रय शक्ति (खरीदने की क्षमता) घटती है।\n\n• उदाहरण: यदि आज एक पैकेट दूध $100 का है और महंगाई 6% है, तो अगले साल वह $106 का मिलेगा।\n• यदि आपका पैसा केवल अलमारी या बैंक बचत खाते में रखा है, तो उसकी वास्तविक कीमत घट रही है। महंगाई को मात देने के लिए सही जगह निवेश करना जरूरी है।";
      }
      if (q.includes("बजट") || q.includes("50/30/20")) {
        return "50/30/20 नियम बजट बनाने का सबसे आसान तरीका है:\n\n• 50% आवश्यकताएं (Needs): घर का किराया, बिजली बिल, राशन जैसी जरूरी चीजें।\n• 30% इच्छाएं (Wants): बाहर खाना, फिल्में देखना या शौक पूरे करना।\n• 20% बचत (Savings): आपातकालीन फंड बनाना, निवेश करना या कर्ज चुकाना।\n• यह नियम आपकी कमाई को सही संतुलन में रखने में मदद करता है।";
      }
      if (q.includes("म्युचुअल") || q.includes("mutual") || q.includes("sip")) {
        return "म्यूचुअल फंड कई निवेशकों के पैसे को एक साथ मिलाकर शेयरों या बांडों में निवेश करने का माध्यम है, जिसे एक प्रोफेशनल फंड मैनेजर संभालता है।\n\n• SIP (Systematic Investment Plan) इसका एक तरीका है जिसमें आप हर महीने एक निश्चित राशि (जैसे $500) निवेश करते हैं।\n• SIP बाजार के उतार-चढ़ाव को औसत (average) करता है और शुरुआती निवेशकों के लिए सबसे सुरक्षित माना जाता है।";
      }
      return "यह एक बढ़िया सवाल है! पैसों का सही प्रबंधन ही वित्तीय स्वतंत्रता की कुंजी है। हमें बजट बनाना, आपातकालीन फंड (Emergency Fund) तैयार करना, और नियमित रूप से निवेश करना सीखना चाहिए। क्या आप इनमें से किसी विषय को और गहराई से समझना चाहेंगे?";
    } else {
      if (q.includes("interest") || q.includes("compound")) {
        return "Compound interest is when you earn interest on both the money you originally saved and the accumulated interest from previous periods.\n\n• Example: If you save $100 at a 10% APY, you will have $110 after year 1. In year 2, you earn 10% on $110 ($11), making your balance $121.\n• Over time, this compounding effect snowballs your small savings into significant wealth.";
      }
      if (q.includes("inflation")) {
        return "Inflation is the gradual increase in prices over time, which reduces the purchasing power of your cash.\n\n• Example: If inflation is 5%, a grocery basket costing $100 today will cost $105 next year.\n• If you leave your cash under the mattress, it silently loses value. To beat inflation, you must invest in assets that grow faster than the inflation rate.";
      }
      if (q.includes("tax") || q.includes("bracket")) {
        return "Marginal tax brackets mean you only pay higher tax rates on the income earned within that specific range.\n\n• Example: If the first bracket is 10% up to $10,000 and the second is 15%, and you earn $12,000, you pay 10% on the first $10,000 and 15% only on the extra $2,000.\n• Moving to a higher bracket NEVER reduces your net take-home income overall.";
      }
      if (q.includes("sip") || q.includes("lump sum") || q.includes("mutual")) {
        return "A Systematic Investment Plan (SIP) lets you invest a fixed amount regularly (e.g. monthly) into mutual funds, whereas a Lump Sum is investing a large block of cash all at once.\n\n• SIP averages out market fluctuations (dollar-cost averaging) and is ideal for beginners to build discipline.\n• Lump sum is suitable when you have a cash windfall and the market is valued attractively.";
      }
      if (q.includes("50/30/20") || q.includes("budget")) {
        return "The 50/30/20 budgeting rule is a simple framework for tracking cash flow:\n\n• 50% to Needs (Rent, Utilities, Groceries)\n• 30% to Wants (Dining out, Subscription plans, Hobbies)\n• 20% to Savings, investments, or clearing debts\n• It provides a clear target to keep your lifestyle in line with your income.";
      }
      return "That is a great financial query! Managing money effectively comes down to three pillars: building a solid cash cushion (emergency fund), keeping debt low, and investing early in diversified index funds. Let me know if you want me to expand on any of these!";
    }
  };

  // Send message
  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim() || loadingAi) return;

    setInputText("");
    setLoadingAi(true);

    const userMessage: ChatMessage = { sender: "user", text: textToSend };
    setChatHistory((prev) => [...prev, userMessage]);

    // Build history prompt context
    const currentHistory = [...chatHistory, userMessage];

    try {
      const prompt = `You are "FinVerse AI Money Mentor", a helpful, empathetic, and knowledgeable financial coach.
Your mission is to help people understand personal finance, budget planning, investing, and debt strategies.
Explain options using clear real-world analogies, as if explaining to a high-schooler.
The user wants to communicate in ${language === "hi" ? "Hindi (using Devanagari script)" : "English"}.
You MUST respond in the chosen language. If the language is Hindi, speak in clear, simplified, conversational Hindi.
Keep your answers brief, engaging, and well-structured (under 4 sentences). Use bullet points where appropriate.

Chat history:
${currentHistory.map(m => `${m.sender === "user" ? "User" : "Mentor"}: ${m.text}`).join("\n")}
Mentor:`;

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (typeof window !== "undefined") {
        const customKey = localStorage.getItem("finverse_custom_gemini_key");
        if (customKey && customKey.trim() !== "") {
          headers["x-gemini-key"] = customKey.trim();
        }
        const simLatency = localStorage.getItem("finverse_admin_latency");
        if (simLatency) headers["x-sim-latency"] = simLatency;
        const simError = localStorage.getItem("finverse_admin_force_errors");
        if (simError) headers["x-sim-error"] = simError;
      }

      const response = await fetch("/api/gemini", {
        method: "POST",
        headers,
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      let responseText = data.text;

      // Handle demo key fallback
      if (responseText.includes("[Demo Mode]")) {
        responseText = getDemoMentorResponse(textToSend);
      }

      setChatHistory((prev) => [...prev, { sender: "ai", text: responseText }]);

      // If voice playback is enabled, synthesize speech
      if (voiceEnabled) {
        speakText(responseText);
      }
    } catch (err) {
      console.error(err);
      const fallback = getDemoMentorResponse(textToSend);
      setChatHistory((prev) => [...prev, { sender: "ai", text: fallback }]);
      if (voiceEnabled) {
        speakText(fallback);
      }
    } finally {
      setLoadingAi(false);
    }
  };

  // Handle Preset Click
  const handlePresetClick = (query: string) => {
    handleSendMessage(query);
  };

  // Clear Chat log
  const handleClearHistory = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setChatHistory([
      { 
        sender: "system", 
        text: language === "hi" 
          ? "चैट साफ हो गई है। पूछें नया प्रश्न!"
          : "Chat history cleared. Ask me anything!"
      }
    ]);
  };

  return (
    <div className="relative min-h-screen bg-background p-6 md:p-12">
      {/* Background glow orbs */}
      <div className="absolute top-0 left-0 -z-10 h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-[120px]" />
      <div className="absolute bottom-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-pink-500/5 blur-[120px]" />

      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header navigation */}
        <div className="space-y-1">
          <Link href="/dashboard" className="inline-flex items-center text-xs text-muted-foreground hover:text-primary mb-2 gap-1 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">AI Money Mentor</h1>
              <p className="text-muted-foreground text-sm">Consult your personal, voice-enabled financial coach in English or Hindi.</p>
            </div>
            <div className="inline-flex items-center space-x-2 rounded-full border border-purple-500/20 bg-purple-500/5 px-3 py-1 text-xs text-purple-400 shrink-0">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>Phase 4 Activated</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Sidebar suggested prompts & Controls */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Coach Voice & Settings Controls */}
            <Card className="glass-card border border-border/50 p-6 space-y-4">
              <h3 className="font-bold text-sm border-b border-border/30 pb-2 flex items-center gap-2">
                <Globe className="h-4 w-4 text-purple-500" />
                Coach Settings
              </h3>
              
              <div className="space-y-4">
                {/* Language Select */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-muted-foreground">Select Language</span>
                  <div className="flex bg-muted p-0.5 rounded-lg border border-border/40">
                    <button 
                      onClick={() => setLanguage("en")}
                      className={`px-3 py-1 rounded-md font-semibold transition-all ${language === "en" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      English
                    </button>
                    <button 
                      onClick={() => setLanguage("hi")}
                      className={`px-3 py-1 rounded-md font-semibold transition-all ${language === "hi" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      हिन्दी
                    </button>
                  </div>
                </div>

                {/* Voice Feedback Playback toggle */}
                <div className="flex flex-col gap-2.5 border-t border-border/20 pt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-muted-foreground">Voice Answer Read Aloud</span>
                    <Button
                      onClick={() => {
                        const next = !voiceEnabled;
                        setVoiceEnabled(next);
                        if (!next && typeof window !== "undefined" && "speechSynthesis" in window) {
                          window.speechSynthesis.cancel();
                        }
                      }}
                      variant="outline"
                      className={`rounded-lg h-8 px-3 text-xs flex items-center gap-1.5 transition-all ${
                        voiceEnabled 
                          ? "border-purple-500 bg-purple-500/10 text-purple-400 font-bold" 
                          : "text-muted-foreground"
                      }`}
                    >
                      {voiceEnabled ? (
                        <>
                          <Volume2 className="h-4 w-4 text-purple-400" /> ON
                        </>
                      ) : (
                        <>
                          <VolumeX className="h-4 w-4" /> OFF
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Warning if Hindi is selected but no Hindi voice pack is installed */}
                  {language === "hi" && voiceEnabled && !voices.some(v => v.lang.startsWith("hi") || v.lang.includes("hi")) && (
                    <div className="text-[10px] rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-amber-500 leading-normal flex items-start gap-1.5 animate-in fade-in duration-300">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 animate-pulse" />
                      <span>
                        <strong>Note:</strong> No Hindi voice pack is detected in your browser/OS. The read-aloud will fallback to your default English voice, causing incorrect pronunciation. Try using Google Chrome or installing a Hindi voice package in your system settings.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Suggested prompts list */}
            <Card className="glass-card border border-border/50 p-6 space-y-4">
              <h3 className="font-bold text-sm border-b border-border/30 pb-2 flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-purple-500" />
                Quick Learning Topics
              </h3>
              
              <div className="flex flex-col gap-2.5">
                {(language === "hi" ? PRESET_PROMPTS_HI : PRESET_PROMPTS_EN).map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePresetClick(item.query)}
                    className="text-left p-3 rounded-xl border border-border/40 hover:bg-muted/50 hover:border-purple-500/30 transition-all text-xs font-semibold leading-relaxed group flex items-start justify-between"
                  >
                    <span>{item.label}</span>
                    <span className="text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity pl-2">➔</span>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column: Chat workspace thread */}
          <Card className="lg:col-span-8 glass-card border border-border/50 flex flex-col h-[520px] justify-between relative overflow-hidden">
            {/* Header banner */}
            <CardHeader className="py-3 px-6 border-b border-border/40 flex flex-row items-center justify-between shrink-0 bg-background/25">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <div className="text-sm font-bold">FinVerse AI Money Mentor</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-muted-foreground font-semibold">Active Coach • {language === "hi" ? "हिंदी" : "English"}</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleClearHistory}
                className="text-[10px] text-muted-foreground hover:text-red-400 transition-colors flex items-center gap-1 font-semibold"
                title="Clear Chat Logs"
              >
                <Trash2 className="h-3.5 w-3.5" /> {language === "hi" ? "साफ करें" : "Clear"}
              </button>
            </CardHeader>

            {/* Scrollable messages area */}
            <CardContent className="flex-grow p-6 overflow-y-auto space-y-4 leading-relaxed text-xs">
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 max-w-[85%] ${
                    msg.sender === "user" 
                      ? "ml-auto flex-row-reverse" 
                      : msg.sender === "system"
                        ? "mx-auto bg-muted/40 border border-border/30 italic text-muted-foreground p-3 rounded-2xl w-full max-w-[95%] text-center"
                        : "mr-auto"
                  }`}
                >
                  {msg.sender === "ai" && (
                    <div className="h-7 w-7 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                    </div>
                  )}

                  <div className={`p-3.5 rounded-2xl border leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-purple-600 hover:bg-purple-700 text-white border-purple-500/30 rounded-tr-none shadow-md shadow-purple-500/5 font-medium"
                      : msg.sender === "system"
                        ? "border-none bg-transparent"
                        : "bg-background/60 border-border/50 rounded-tl-none"
                  }`}>
                    {msg.sender === "ai" && <div className="font-extrabold text-[10px] text-purple-400 mb-1">AI Mentor</div>}
                    <p className="text-[11.5px] leading-relaxed whitespace-pre-line text-left">{msg.text}</p>
                  </div>
                </div>
              ))}

              {loadingAi && (
                <div className="flex gap-3 max-w-[85%] mr-auto">
                  <div className="h-7 w-7 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center shrink-0 mt-0.5">
                    <Loader2 className="h-3.5 w-3.5 text-purple-400 animate-spin" />
                  </div>
                  <div className="p-3.5 rounded-2xl border border-border/50 rounded-tl-none bg-background/60 flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </CardContent>

            {/* Input Form at bottom */}
            <CardFooter className="py-4 px-6 border-t border-border/40 shrink-0 bg-background/25 flex items-center gap-2">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }} 
                className="flex items-center w-full gap-2"
              >
                {/* Voice Input Trigger */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 transition-all ${
                    listening 
                      ? "bg-red-500 border-red-500 text-white animate-pulse" 
                      : "border-border/60 bg-background/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                  title={listening ? "Stop Listening" : "Speak Message"}
                >
                  {listening ? <MicOff className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
                </button>

                {/* Textbox */}
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    listening 
                      ? (language === "hi" ? "सुन रहा हूँ..." : "Listening...") 
                      : (language === "hi" ? "बजट या निवेश के बारे में पूछें..." : "Ask your financial question here...")
                  }
                  disabled={loadingAi}
                  className="flex-grow text-xs h-10 px-4 rounded-xl bg-background/50 border border-border/60 focus:border-purple-500 focus:outline-none"
                />

                {/* Send Button */}
                <Button
                  type="submit"
                  disabled={loadingAi || !inputText.trim()}
                  className="h-10 w-10 bg-purple-600 hover:bg-purple-700 text-white rounded-xl flex items-center justify-center shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
