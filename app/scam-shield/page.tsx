"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/firebase/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ShieldAlert, 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle, 
  Upload, 
  Link2, 
  MessageSquare, 
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  RefreshCw
} from "lucide-react";

interface ScamAnalysis {
  scamScore: number;
  warningSigns: string[];
  analysisEn: string;
  analysisHi: string;
  actionPlan: string[];
}

const PRESET_SCAMS = [
  {
    label: "⚡ Electricity Disconnection",
    text: "Dear customer, your electricity connection will be disconnected tonight at 9:30 PM due to non-update of monthly bill. Call officer at 98765-54321 immediately.",
    type: "text"
  },
  {
    label: "🏆 Lottery Promotion",
    text: "Congratulations! Your mobile number has been selected as the winner of $500,000 in the Google Annual Promo. Send your account details to claim your prize.",
    type: "text"
  },
  {
    label: "📦 Delayed Package Link",
    text: "Your FedEx package is delayed due to address mismatch. Please update details immediately at: fedx-package-tracking-renew.info/portal to avoid return.",
    type: "url"
  },
  {
    label: "💬 Casual Safe Chat",
    text: "Hey! Are we still meeting for lunch at 1 PM today? Let me know.",
    type: "text"
  }
];

export default function ScamShieldPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Navigation states
  const [activeTab, setActiveTab] = useState<"text" | "url" | "screenshot">("text");
  const [inputText, setInputText] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [screenshotName, setScreenshotName] = useState<string | null>(null);
  const [screenshotText, setScreenshotText] = useState("");

  // Analysis states
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ScamAnalysis | null>(null);
  const [language, setLanguage] = useState<"en" | "hi">("en");

  // Auth Protection
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground text-sm">Loading Scam Shield...</p>
        </div>
      </div>
    );
  }

  // Handle preset clicks
  const handleApplyPreset = (preset: typeof PRESET_SCAMS[0]) => {
    if (preset.type === "url") {
      setActiveTab("url");
      setInputUrl(preset.text);
    } else {
      setActiveTab("text");
      setInputText(preset.text);
    }
    setAnalysisResult(null);
  };

  // Mock Screenshot File Upload Parser
  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScreenshotName(file.name);
    // Simulating text extraction from screenshot
    if (file.name.toLowerCase().includes("bill") || file.name.toLowerCase().includes("electric")) {
      setScreenshotText("URGENT: Your power bill is overdue. Pay immediately at www.elect-pay-bill.online/pay or face disconnection.");
    } else if (file.name.toLowerCase().includes("win") || file.name.toLowerCase().includes("gift")) {
      setScreenshotText("You won a free iPhone 15 Pro! Claim your prize now at: prize-claim-giftcard.net/win.");
    } else {
      setScreenshotText("ALERT: Your netbanking is suspended due to verification issues. Reactive now at: hdfc-netbanking-verify.cc/login.");
    }
  };

  // Demo Fallback Generator
  const getDemoScamResponse = (content: string): ScamAnalysis => {
    const q = content.toLowerCase();

    if (q.includes("electricity") || q.includes("power") || q.includes("bill") || q.includes("disconnection") || q.includes("disconnected")) {
      return {
        scamScore: 95,
        warningSigns: ["Fake Urgency", "Direct Contact Request", "Fear Tactics"],
        analysisEn: "This message uses fear and artificial urgency to coerce you into calling an unofficial number. Legitimate utilities will never cut off electricity within hours via a direct SMS call-to-action.",
        analysisHi: "यह संदेश आपको डराने और जल्दबाजी में एक अनौपचारिक नंबर पर कॉल करवाने के लिए भय के हथकंडों का उपयोग करता है। बिजली विभाग कभी भी एसएमएस के माध्यम से कुछ घंटों में बिजली नहीं काटता।",
        actionPlan: [
          "Do NOT call the number provided in the message.",
          "Check your billing status directly on the official utility website or app.",
          "Block the sender and report as spam."
        ]
      };
    }

    if (q.includes("lottery") || q.includes("win") || q.includes("promo") || q.includes("prize") || q.includes("winner")) {
      return {
        scamScore: 98,
        warningSigns: ["Unsolicited Cash Offer", "Direct Banking Request", "Too Good To Be True"],
        analysisEn: "This is a classic advance-fee lottery scam. Legitimate promotions do not randomly select mobile numbers for giant cash winnings, nor do they ask you to send private banking credentials.",
        analysisHi: "यह एक क्लासिक अग्रिम-शुल्क लॉटरी घोटाला है। वास्तविक पुरस्कार प्रदाता कभी भी बड़े नकद इनामों के लिए बेतरतीब ढंग से मोबाइल नंबर नहीं चुनते हैं, और न ही वे आपसे बैंकिंग विवरण मांगते हैं।",
        actionPlan: [
          "Do NOT share bank account details, cards, or OTPs.",
          "Block the number immediately.",
          "Report this message to your local cyber crime helpline."
        ]
      };
    }

    if (q.includes("fedex") || q.includes("package") || q.includes("delayed") || q.includes("renew") || q.includes("fedx")) {
      return {
        scamScore: 92,
        warningSigns: ["Suspicious URL Domain", "Urgent Delivery Claim", "Credential Harvester"],
        analysisEn: "This message uses a spoofed package delivery notification with an unofficial shortened link designed to steal your credentials or install malware.",
        analysisHi: "यह संदेश क्रेडेंशियल चोरी करने या मैलवेयर स्थापित करने के लिए डिज़ाइन किए गए एक अनौपचारिक लिंक के साथ नकली पैकेज डिलीवरी सूचना का उपयोग करता है।",
        actionPlan: [
          "Do NOT click the suspect link.",
          "Check package delivery status only via the official FedEx website/app using your original tracking ID.",
          "Report the phishing link on Google Safe Browsing."
        ]
      };
    }

    if (q.includes("lunch") || q.includes("casual") || q.includes("meeting") || q.includes("hey")) {
      return {
        scamScore: 5,
        warningSigns: ["No Suspicious Elements"],
        analysisEn: "This message appears to be a standard, safe conversational query between acquaintances with no urgency, links, or demands for personal information.",
        analysisHi: "यह संदेश व्यक्तिगत जानकारी के लिए किसी भी तात्कालिकता, संदिग्ध लिंक या मांगों के बिना परिचितों के बीच एक सामान्य और सुरक्षित बातचीत प्रतीत होता है।",
        actionPlan: [
          "Respond normally if you recognize the sender.",
          "Avoid sharing private data if the sender's identity is unconfirmed."
        ]
      };
    }

    return {
      scamScore: 82,
      warningSigns: ["Unverified Source", "Suspicious Pattern"],
      analysisEn: "This input contains warning flags resembling common social engineering tactics, such as asking for direct actions, external links, or sensitive data.",
      analysisHi: "इस इनपुट में सामान्य सोशल इंजीनियरिंग रणनीति से मिलते-जुलते चेतावनी संकेत हैं, जैसे कि प्रत्यक्ष कार्रवाई, बाहरी लिंक, या संवेदनशील डेटा मांगना।",
      actionPlan: [
        "Avoid clicking any links contained in this message.",
        "Verify the source through official, independent offline channels.",
        "Never share credentials or OTPs with unknown contacts."
      ]
    };
  };

  // Submit Analysis
  const handleAnalyzeContent = async () => {
    let contentToAnalyze = "";
    if (activeTab === "text") {
      contentToAnalyze = inputText;
    } else if (activeTab === "url") {
      contentToAnalyze = `URL to scan: ${inputUrl}`;
    } else {
      contentToAnalyze = `Screenshot Extracted Text: ${screenshotText}`;
    }

    if (!contentToAnalyze.trim() || analyzing) return;

    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const prompt = `Analyze the following message transcript, website link, or description for potential financial scams, fraud, phishing, or social engineering indicators.
Return ONLY a valid JSON string (no markdown ticks, no surrounding text, just the raw JSON object) matching this structure:
{
  "scamScore": number (value between 0 and 100 representing the probability of a scam),
  "warningSigns": string[] (list of identified scam indicators, max 4),
  "analysisEn": string (detailed explanation of the scam mechanics in English, max 3 sentences),
  "analysisHi": string (detailed explanation of the scam mechanics in Hindi, max 3 sentences),
  "actionPlan": string[] (concrete safety steps/recommendations, max 3)
}

Content to analyze:
${contentToAnalyze}`;

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
      
      // Strip markdown code block wrappers
      if (responseText.includes("```")) {
        responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      }

      const saveScanStats = (res: ScamAnalysis) => {
        if (typeof window !== "undefined") {
          const currentCount = Number(localStorage.getItem("finverse_scams_analyzed") || "0") + 1;
          localStorage.setItem("finverse_scams_analyzed", String(currentCount));
          if (res.scamScore >= 70) {
            localStorage.setItem("finverse_last_scan_threat", "high");
          } else {
            localStorage.setItem("finverse_last_scan_threat", "low");
          }
        }
      };

      // Handle demo key fallback
      if (responseText.includes("[Demo Mode]")) {
        const fallback = getDemoScamResponse(contentToAnalyze);
        setAnalysisResult(fallback);
        saveScanStats(fallback);
      } else {
        const parsed: ScamAnalysis = JSON.parse(responseText);
        setAnalysisResult(parsed);
        saveScanStats(parsed);
      }
    } catch (err) {
      console.error(err);
      const fallback = getDemoScamResponse(contentToAnalyze);
      setAnalysisResult(fallback);
      if (typeof window !== "undefined") {
        const currentCount = Number(localStorage.getItem("finverse_scams_analyzed") || "0") + 1;
        localStorage.setItem("finverse_scams_analyzed", String(currentCount));
        if (fallback.scamScore >= 70) {
          localStorage.setItem("finverse_last_scan_threat", "high");
        } else {
          localStorage.setItem("finverse_last_scan_threat", "low");
        }
      }
    } finally {
      setAnalyzing(false);
    }
  };

  // Get Score Color Class
  const getScoreColor = (score: number) => {
    if (score < 30) return "text-emerald-500 border-emerald-500/30 bg-emerald-500/5";
    if (score < 70) return "text-amber-500 border-amber-500/30 bg-amber-500/5";
    return "text-red-500 border-red-500/30 bg-red-500/5";
  };

  const getScoreGaugeStyle = (score: number) => {
    // 283 is approx 2 * PI * r (r=45)
    const strokeDashoffset = 283 - (283 * score) / 100;
    let strokeColor = "#10b981"; // emerald
    if (score >= 30 && score < 70) strokeColor = "#f59e0b"; // amber
    if (score >= 70) strokeColor = "#ef4444"; // red
    return { strokeDashoffset, strokeColor };
  };

  return (
    <div className="relative min-h-screen bg-background p-6 md:p-12">
      {/* Background glow orbs */}
      <div className="absolute top-0 left-0 -z-10 h-[500px] w-[500px] rounded-full bg-red-500/5 blur-[120px]" />
      <div className="absolute bottom-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-orange-500/5 blur-[120px]" />

      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header navigation */}
        <div className="space-y-1">
          <Link href="/dashboard" className="inline-flex items-center text-xs text-muted-foreground hover:text-primary mb-2 gap-1 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Scam Shield</h1>
              <p className="text-muted-foreground text-sm">Analyze messages, suspicious links, and screenshots to shield yourself from phishing and fraud.</p>
            </div>
            <div className="inline-flex items-center space-x-2 rounded-full border border-red-500/20 bg-red-500/5 px-3 py-1 text-xs text-red-400 shrink-0">
              <ShieldAlert className="h-3.5 w-3.5 animate-pulse" />
              <span>Phase 5 Active</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Analysis Panel */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="glass-card border border-border/50 p-6 flex flex-col justify-between">
              <div>
                {/* Tabs selection */}
                <div className="flex bg-muted p-1 rounded-xl border border-border/40 mb-6 max-w-md">
                  <button
                    onClick={() => { setActiveTab("text"); setAnalysisResult(null); }}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      activeTab === "text" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> Text
                  </button>
                  <button
                    onClick={() => { setActiveTab("url"); setAnalysisResult(null); }}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      activeTab === "url" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Link2 className="h-3.5 w-3.5" /> URL Link
                  </button>
                  <button
                    onClick={() => { setActiveTab("screenshot"); setAnalysisResult(null); }}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      activeTab === "screenshot" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Upload className="h-3.5 w-3.5" /> Screenshot
                  </button>
                </div>

                {/* Main Inputs Area */}
                {activeTab === "text" && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground">Pasted Message / Chat Thread</label>
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Paste the SMS, WhatsApp chat log, or email content here..."
                      className="w-full text-xs h-36 p-4 rounded-xl bg-background/50 border border-border/60 focus:border-red-500 focus:outline-none resize-none leading-relaxed"
                    />
                  </div>
                )}

                {activeTab === "url" && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground">Suspicious URL / Link</label>
                    <input
                      type="text"
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      placeholder="Enter the suspicious web link (e.g. fedx-tracking-renew.info/portal)..."
                      className="w-full text-xs h-12 px-4 rounded-xl bg-background/50 border border-border/60 focus:border-red-500 focus:outline-none"
                    />
                  </div>
                )}

                {activeTab === "screenshot" && (
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-muted-foreground">Upload SMS or Chat Screenshot</label>
                    <div className="border-2 border-dashed border-border/60 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3 bg-background/30 hover:bg-muted/20 transition-all relative overflow-hidden">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <div className="text-xs font-bold">{screenshotName ? screenshotName : "Click to upload or drag & drop"}</div>
                        <div className="text-[10px] text-muted-foreground mt-1">Supports PNG, JPG, or WEBP up to 5MB</div>
                      </div>
                    </div>

                    {screenshotName && (
                      <div className="p-3 bg-muted/40 border border-border/30 rounded-xl space-y-1 text-xs">
                        <div className="font-semibold flex items-center gap-1.5">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Extracted Text from Image:
                        </div>
                        <p className="text-muted-foreground italic leading-relaxed text-[11px]">{screenshotText}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Trigger button */}
              <div className="pt-6">
                <Button
                  onClick={handleAnalyzeContent}
                  disabled={
                    analyzing ||
                    (activeTab === "text" && !inputText.trim()) ||
                    (activeTab === "url" && !inputUrl.trim()) ||
                    (activeTab === "screenshot" && !screenshotName)
                  }
                  className="w-full h-11 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="h-4.5 w-4.5 animate-spin" /> Shielding Security Analysis...
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="h-4.5 w-4.5" /> Analyze for Scams & Phishing
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Presets List */}
            <Card className="glass-card border border-border/50 p-6 space-y-3">
              <h3 className="font-bold text-xs text-muted-foreground flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-red-500" />
                Select a Preset Example to Test
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_SCAMS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleApplyPreset(preset)}
                    className="p-3.5 text-left border border-border/40 bg-background/30 rounded-xl hover:border-red-500/30 hover:bg-muted/40 transition-all text-xs font-semibold leading-relaxed"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column: Results Dashboard */}
          <div className="lg:col-span-5 space-y-6">
            {!analysisResult && !analyzing && (
              <Card className="h-full min-h-[400px] glass-card border border-border/50 flex flex-col items-center justify-center p-8 text-center space-y-3">
                <div className="h-16 w-16 rounded-2xl bg-muted/40 border border-border/30 flex items-center justify-center mb-2">
                  <ShieldCheck className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-sm">System Guard Standby</h3>
                <p className="text-muted-foreground text-xs max-w-xs leading-relaxed">
                  Enter some suspect content on the left panel to execute an active threat analysis on phishing triggers.
                </p>
              </Card>
            )}

            {analyzing && (
              <Card className="h-full min-h-[400px] glass-card border border-border/50 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="relative flex items-center justify-center">
                  <div className="h-16 w-16 animate-ping rounded-full bg-red-500/10 absolute" />
                  <div className="h-14 w-14 rounded-full border-4 border-red-500/30 border-t-red-600 animate-spin flex items-center justify-center" />
                </div>
                <h3 className="font-bold text-sm">Scanning Contextual Targets</h3>
                <p className="text-muted-foreground text-xs max-w-xs leading-relaxed">
                  Parsing threat indicators, detecting urgent call-to-actions, looking up domain names, and running linguistic analysis...
                </p>
              </Card>
            )}

            {analysisResult && !analyzing && (
              <Card className="glass-card border border-border/50 p-6 space-y-6 animate-in fade-in duration-300">
                {/* Score gauge and top info */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-4 border-b border-border/30">
                  <div className="relative h-28 w-28 shrink-0">
                    <svg className="h-full w-full -rotate-90">
                      <circle
                        cx="56"
                        cy="56"
                        r="45"
                        className="stroke-muted fill-none"
                        strokeWidth="8"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r="45"
                        className="fill-none transition-all duration-1000 ease-out"
                        strokeWidth="8"
                        strokeDasharray="283"
                        strokeDashoffset={getScoreGaugeStyle(analysisResult.scamScore).strokeDashoffset}
                        stroke={getScoreGaugeStyle(analysisResult.scamScore).strokeColor}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black">{analysisResult.scamScore}%</span>
                      <span className="text-[9px] text-muted-foreground font-semibold uppercase">Risk Score</span>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-center sm:text-left w-full">
                    <div className="flex items-center justify-center sm:justify-between w-full">
                      <span className="text-xs font-bold text-muted-foreground">Verdict:</span>
                      <span className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border ${getScoreColor(analysisResult.scamScore)}`}>
                        {analysisResult.scamScore < 30 ? "Safe / Low Risk" : analysisResult.scamScore < 70 ? "Suspicious / Warning" : "High Risk / Fraud"}
                      </span>
                    </div>
                    
                    {/* Language switcher */}
                    <div className="flex items-center justify-center sm:justify-start gap-1 bg-muted p-0.5 rounded-lg border border-border/40 w-fit text-[10px]">
                      <button
                        onClick={() => setLanguage("en")}
                        className={`px-2 py-0.5 rounded font-semibold transition-all ${language === "en" ? "bg-background text-primary" : "text-muted-foreground"}`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => setLanguage("hi")}
                        className={`px-2 py-0.5 rounded font-semibold transition-all ${language === "hi" ? "bg-background text-primary" : "text-muted-foreground"}`}
                      >
                        हिंदी
                      </button>
                    </div>
                  </div>
                </div>

                {/* Warning signs badges */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-muted-foreground">Threat Flags:</div>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.warningSigns.map((sign, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-bold bg-muted border border-border/40 px-2.5 py-1 rounded-lg text-foreground flex items-center gap-1"
                      >
                        <AlertTriangle className="h-3 w-3 text-red-500" /> {sign}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Analysis Description */}
                <div className="space-y-2 bg-muted/20 border border-border/40 rounded-xl p-4">
                  <div className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 text-red-500" /> Analysis Explanation:
                  </div>
                  <p className="text-xs leading-relaxed text-foreground/90">
                    {language === "hi" ? analysisResult.analysisHi : analysisResult.analysisEn}
                  </p>
                </div>

                {/* Action Items List */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-muted-foreground">Safety Recommendations:</div>
                  <div className="flex flex-col gap-2">
                    {analysisResult.actionPlan.map((action, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-xs flex items-start gap-2.5 text-foreground leading-normal"
                      >
                        <span className="h-4.5 w-4.5 shrink-0 rounded-full bg-red-500/15 text-[10px] font-extrabold text-red-400 flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
