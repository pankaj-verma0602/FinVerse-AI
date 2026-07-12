"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/firebase/auth-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/config";
import { 
  FileSearch, 
  TrendingUp, 
  MessageSquare, 
  ShieldAlert, 
  BookOpen, 
  Sparkles,
  ArrowRight,
  Wallet,
  ShieldCheck,
  Award,
  CheckCircle2,
  Lock,
  Clock,
  Printer
} from "lucide-react";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [netWorth, setNetWorth] = useState("$24,500");
  const [creditScore, setCreditScore] = useState(740);
  const [scamCount, setScamCount] = useState(0);
  const [lastThreat, setLastThreat] = useState("low");
  const [completedCount, setCompletedCount] = useState(0);
  
  // Onboarding & Gamification states
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  const [assessmentScore, setAssessmentScore] = useState(300);
  const [assessmentLevel, setAssessmentLevel] = useState("Novice Beginner");
  const [xp, setXp] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [dailyTip, setDailyTip] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const updateStats = () => {
      if (typeof window === "undefined") return;

      // 1. OnboardingCompleted check
      const isAssCompleted = localStorage.getItem("finverse_assessment_completed") === "true";
      setAssessmentCompleted(isAssCompleted);
      
      const assScore = localStorage.getItem("finverse_assessment_score");
      if (assScore) setAssessmentScore(Number(assScore));
      
      const assLevel = localStorage.getItem("finverse_assessment_level");
      if (assLevel) setAssessmentLevel(assLevel);

      // 2. Lessons completed
      let completed = 0;
      const saved = localStorage.getItem("finverse_unlocked_lessons");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            completed = parsed.length - 1;
            const isL4Done = localStorage.getItem("finverse_lesson_4_completed") === "true";
            completed = parsed.length - 1 + (isL4Done ? 1 : 0);
            setCompletedCount(Math.max(0, completed));
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        setCompletedCount(0);
      }

      // 3. Net Worth
      let parsedNet = 24500;
      const storedNet = localStorage.getItem("finverse_sim_net_worth");
      if (storedNet) {
        parsedNet = Number(storedNet);
        setNetWorth(`$${parsedNet.toLocaleString()}`);
      } else {
        setNetWorth("$24,500");
      }

      // 4. Credit Score
      const storedCredit = localStorage.getItem("finverse_sim_credit_score");
      if (storedCredit) {
        setCreditScore(Number(storedCredit));
      } else {
        setCreditScore(740);
      }

      // 5. Scams scanned
      let parsedScams = 0;
      const storedScams = localStorage.getItem("finverse_scams_analyzed");
      if (storedScams) {
        parsedScams = Number(storedScams);
        setScamCount(parsedScams);
      } else {
        setScamCount(0);
      }

      // 6. Last threat status
      const storedThreat = localStorage.getItem("finverse_last_scan_threat");
      if (storedThreat) {
        setLastThreat(storedThreat);
      } else {
        setLastThreat("low");
      }

      // 7. Dynamic XP & Badge computation
      if (isAssCompleted) {
        const onboardingXp = 50;
        const lessonsXp = completed * 50;
        const scamsXp = parsedScams * 30;
        const simulatorBonus = parsedNet > 26000 ? 40 : 0;
        const totalXp = onboardingXp + lessonsXp + scamsXp + simulatorBonus;
        setXp(totalXp);
        
        // Compute active badges list
        const activeBadges = ["Onboarding Pioneer"];
        if (completed >= 1) activeBadges.push("Syllabus Scholar");
        if (parsedNet > 30000) activeBadges.push("Smart Saver");
        if (parsedScams >= 1) activeBadges.push("Scam Deflector");
        
        // If all 4 core simulator/lesson requirements are fulfilled
        const isL1Done = localStorage.getItem("finverse_lesson_1_completed") === "true";
        const isSimActive = parsedNet > 26000;
        const isMentorActive = localStorage.getItem("finverse_mentor_chats_sent") ? Number(localStorage.getItem("finverse_mentor_chats_sent")) >= 1 : false;
        const isScamActive = parsedScams >= 1;
        if (isL1Done && isSimActive && isMentorActive && isScamActive) {
          activeBadges.push("Financial Master");
        }
        setUnlockedBadges(activeBadges);
      } else {
        setXp(0);
        setUnlockedBadges([]);
      }
    };

    updateStats();

    // Check localStorage every 500ms to guarantee absolute real-time updates on client-side routing
    const interval = setInterval(updateStats, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsubAnn = onSnapshot(collection(db, "announcements"), (snap) => {
      const docsList: any[] = [];
      snap.forEach((docSnap) => {
        docsList.push({ id: docSnap.id, ...docSnap.data() });
      });
      docsList.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setAnnouncements(docsList.slice(0, 3));
    }, (err) => {
      console.error(err);
    });

    const unsubTips = onSnapshot(collection(db, "tips"), (snap) => {
      const docsList: any[] = [];
      snap.forEach((docSnap) => {
        docsList.push({ id: docSnap.id, ...docSnap.data() });
      });
      if (docsList.length > 0) {
        docsList.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
        setDailyTip(docsList[0]);
      }
    }, (err) => {
      console.error(err);
    });

    return () => {
      unsubAnn();
      unsubTips();
    };
  }, []);

  if (loading || !user) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const modules = [
    {
      title: "AI Document Decoder",
      description: "Upload agreements, leases, or contracts. Extract fine print, identify hidden fees, and translate legalese to simple English or Hindi.",
      icon: FileSearch,
      href: "/document-decoder",
      status: "Ready",
      statusColor: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      stats: "Supports PDF, DOCX, Images",
      cta: "Analyze Document",
    },
    {
      title: "Financial Life Simulator",
      description: "Test career changes, home loans, stock investments, or economic emergencies in a risk-free simulator. Watch your net worth evolve.",
      icon: TrendingUp,
      href: "/simulator",
      status: "Ready",
      statusColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      stats: "Active path: Default Sandbox",
      cta: "Run Simulation",
    },
    {
      title: "AI Money Mentor",
      description: "Engage with your voice-enabled private mentor. Learn core financial habits and get custom calculations in English and Hindi.",
      icon: MessageSquare,
      href: "/mentor",
      status: "Ready",
      statusColor: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      stats: "Personalized advice model active",
      cta: "Chat with Mentor",
    },
    {
      title: "Scam Shield",
      description: "Protect your accounts. Scan suspicious text messages, WhatsApp requests, phishing emails, or unknown links to check scam risks.",
      icon: ShieldAlert,
      href: "/scam-shield",
      status: "Ready",
      statusColor: "text-red-500 bg-red-500/10 border-red-500/20",
      stats: `${scamCount} suspicious alerts resolved`,
      cta: "Verify Threat",
    },
  ];

  return (
    <div className="relative min-h-screen bg-background p-6 md:p-12">
      {/* Background glow */}
      <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[120px]" />
      <div className="absolute bottom-0 left-0 -z-10 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />

      <div className="mx-auto max-w-7xl space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome to your FinVerse</h1>
            <p className="text-muted-foreground mt-1">Logged in as {user.email}</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass-panel border border-border">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium">Financial Health: Excellent</span>
          </div>
        </div>

        {/* AI Onboarding Assessment & Roadmap Section */}
        {!assessmentCompleted ? (
          <Card className="glass-card border border-primary/30 bg-primary/5 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 border border-primary/20 text-primary uppercase">
                <Sparkles className="h-3 w-3 animate-pulse" /> Onboarding Pending
              </div>
              <h2 className="text-xl font-bold">Unlock Your Personalized AI Learning Roadmap</h2>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                Take the 2-minute dynamic assessment to establish your starting Financial Literacy Score, earn +50 starting XP, and get a tailored curriculum matching your targets.
              </p>
            </div>
            <Button 
              onClick={() => router.push("/assessment")}
              className="h-11 px-6 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shrink-0 flex items-center gap-1.5"
            >
              Start Assessment <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Roadmap Checklists */}
            <Card className="lg:col-span-2 glass-card border border-border/50 p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-border/20 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                  <div>
                    <h3 className="font-bold text-sm">Personalized Learning Roadmap</h3>
                    <p className="text-[10px] text-muted-foreground">Complete platform goals to unlock the completion certificate</p>
                  </div>
                </div>
                <div className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted border border-border/40 text-muted-foreground">
                  Score: {assessmentScore} • {assessmentLevel}
                </div>
              </div>

              <div className="space-y-4 pt-1">
                {/* Phase 1 */}
                <div className="flex items-start justify-between gap-4 p-3 border border-border/30 bg-muted/5 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {completedCount >= 1 ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-muted-foreground/50 animate-pulse" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span>Phase 1: Foundation Building</span>
                        {completedCount >= 1 && <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.2 rounded font-bold uppercase">Done</span>}
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-normal">
                        Review syllabus Lesson 1 & Lesson 2. Understand compound growth and purchasing decay.
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => router.push("/lessons")}
                    className="h-7 text-[9px] rounded-lg border-border shrink-0"
                  >
                    Go to Lessons
                  </Button>
                </div>

                {/* Phase 2 */}
                <div className="flex items-start justify-between gap-4 p-3 border border-border/30 bg-muted/5 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {Number(netWorth.replace(/[^0-9.-]+/g,"")) > 26000 ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Lock className="h-5 w-5 text-muted-foreground/45" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span>Phase 2: Asset Multipliers</span>
                        {Number(netWorth.replace(/[^0-9.-]+/g,"")) > 26000 && <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.2 rounded font-bold uppercase">Done</span>}
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-normal">
                        Achieve a simulated net worth exceeding $26,000 to demonstrate cash reserve discipline.
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => router.push("/simulator")}
                    className="h-7 text-[9px] rounded-lg border-border shrink-0"
                  >
                    Run Simulator
                  </Button>
                </div>

                {/* Phase 3 */}
                <div className="flex items-start justify-between gap-4 p-3 border border-border/30 bg-muted/5 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {typeof window !== "undefined" && localStorage.getItem("finverse_mentor_chats_sent") && Number(localStorage.getItem("finverse_mentor_chats_sent")) >= 1 ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Lock className="h-5 w-5 text-muted-foreground/45" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span>Phase 3: Financial Mentorship</span>
                        {typeof window !== "undefined" && localStorage.getItem("finverse_mentor_chats_sent") && Number(localStorage.getItem("finverse_mentor_chats_sent")) >= 1 && (
                          <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.2 rounded font-bold uppercase">Done</span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-normal">
                        Consult your Voice Money Mentor to clarify marginal tax brackets.
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => router.push("/mentor")}
                    className="h-7 text-[9px] rounded-lg border-border shrink-0"
                  >
                    Chat with Mentor
                  </Button>
                </div>

                {/* Phase 4 */}
                <div className="flex items-start justify-between gap-4 p-3 border border-border/30 bg-muted/5 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {scamCount >= 1 ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Lock className="h-5 w-5 text-muted-foreground/45" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span>Phase 4: Threat Defense Mastery</span>
                        {scamCount >= 1 && <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.2 rounded font-bold uppercase">Done</span>}
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-normal">
                        Scan a text message or web link in the Scam Shield to test phishing detection.
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => router.push("/scam-shield")}
                    className="h-7 text-[9px] rounded-lg border-border shrink-0"
                  >
                    Scan Threats
                  </Button>
                </div>
              </div>
            </Card>

            {/* Gamification Hub */}
            <div className="lg:col-span-1 space-y-6">
              {/* XP Progress Card */}
              <Card className="glass-card border border-border/50 p-6 rounded-2xl space-y-4">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase">
                    <span>Active Experience</span>
                    <span className="text-primary font-black">Level {Math.floor(xp / 100) + 1}</span>
                  </div>
                  <div className="flex justify-between items-baseline mt-2">
                    <div className="text-3xl font-black">{xp} <span className="text-xs font-bold text-muted-foreground">XP</span></div>
                    <span className="text-[10px] text-muted-foreground">{(xp % 100)} / 100 XP to next level</span>
                  </div>
                  <Progress value={xp % 100} className="h-2 mt-2" />
                </div>
              </Card>

              {/* Unlocked Badges Locker */}
              <Card className="glass-card border border-border/50 p-6 rounded-2xl space-y-4">
                <h4 className="font-bold text-xs uppercase text-muted-foreground tracking-wide flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-amber-500" />
                  <span>Unlocked Badges Locker</span>
                </h4>
                <div className="flex flex-wrap gap-2 pt-1">
                  {unlockedBadges.map((badge) => (
                    <div 
                      key={badge} 
                      className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 select-none animate-in scale-in duration-300"
                    >
                      <span>🏆</span>
                      <span>{badge}</span>
                    </div>
                  ))}
                  {unlockedBadges.length === 0 && (
                    <span className="text-xs text-muted-foreground">No badges earned yet.</span>
                  )}
                </div>
              </Card>

              {/* Certificate Unlocker */}
              <Card className="glass-card border border-border/50 p-6 rounded-2xl space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-xs uppercase text-muted-foreground tracking-wide">Program Certification</h4>
                  <p className="text-[10px] text-muted-foreground leading-normal mt-1">
                    Complete all 4 roadmap milestones to earn your official Certificate of Financial Capability.
                  </p>
                </div>
                
                {unlockedBadges.includes("Financial Master") || (completedCount >= 1 && Number(netWorth.replace(/[^0-9.-]+/g,"")) > 26000 && scamCount >= 1) ? (
                  <Button 
                    onClick={() => setShowCertificateModal(true)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Award className="h-4 w-4" /> View Certificate
                  </Button>
                ) : (
                  <Button 
                    disabled 
                    className="w-full bg-muted border border-border text-muted-foreground rounded-xl h-10 text-xs font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <Lock className="h-3.5 w-3.5" /> Milestones Pending
                  </Button>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* Certificate Modal */}
        {showCertificateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <Card className="max-w-2xl w-full bg-zinc-950 border border-emerald-500/30 p-8 rounded-2xl relative overflow-hidden space-y-6 animate-in zoom-in-95 duration-200 print:border-0 print:bg-white print:text-black print:absolute print:inset-0 print:p-12">
              {/* Stamp decoration */}
              <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-emerald-500/5 blur-3xl print:hidden" />
              
              {/* Close button */}
              <button 
                onClick={() => setShowCertificateModal(false)}
                className="absolute top-4 right-4 text-xs text-muted-foreground hover:text-foreground print:hidden bg-zinc-900 border border-border p-1.5 rounded-lg"
              >
                ✕
              </button>

              {/* Content for Certificate */}
              <div className="border-4 border-double border-emerald-500/20 p-8 rounded-xl text-center space-y-6 bg-zinc-950/50 print:border-black print:bg-white">
                <div className="space-y-1">
                  <div className="mx-auto w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 print:border-black">
                    <Award className="h-6 w-6 text-emerald-400 print:text-black" />
                  </div>
                  <h4 className="text-[10px] tracking-widest font-black uppercase text-emerald-400 mt-2 print:text-black">FinVerse Academy</h4>
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-black font-sans bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent print:from-black print:to-black">
                    Certificate of Achievement
                  </h2>
                  <p className="text-xs text-muted-foreground italic print:text-zinc-600">This certifies that</p>
                  <div className="text-xl font-bold border-b border-border/40 pb-1 max-w-xs mx-auto text-foreground print:border-black print:text-black">
                    {user.email}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto print:text-zinc-700">
                  has successfully completed all core phases of the AI-powered financial literacy curriculum, demonstrating mastery in compound interest simulations, margin expense allocation, threat detection, and upskilling metrics.
                </p>

                <div className="grid grid-cols-2 gap-8 pt-4 text-left border-t border-border/10 max-w-sm mx-auto print:border-black">
                  <div>
                    <span className="text-[9px] text-muted-foreground uppercase print:text-zinc-500">Date Issued</span>
                    <div className="text-xs font-bold text-foreground print:text-black">{new Date().toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="text-[9px] text-muted-foreground uppercase print:text-zinc-500">Certified Score</span>
                    <div className="text-xs font-bold text-emerald-400 print:text-black">{assessmentScore} FICO-L</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end print:hidden">
                <Button 
                  variant="outline"
                  onClick={() => window.print()}
                  className="h-10 rounded-xl px-4 text-xs font-semibold flex items-center gap-1.5 border-border"
                >
                  <Printer className="h-4 w-4" /> Print Certificate
                </Button>
                <Button 
                  onClick={() => setShowCertificateModal(false)}
                  className="h-10 rounded-xl px-4 text-xs font-semibold bg-zinc-900 border border-border hover:bg-zinc-800 text-foreground"
                >
                  Dismiss
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass-card border border-border/40 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-muted-foreground text-sm mb-2">
                <span>Net Worth (Simulated)</span>
                <Wallet className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">{netWorth}</div>
            </div>
            <div className="text-xs text-emerald-500 flex items-center gap-1 mt-4">
              <span>Updated from simulation</span>
            </div>
          </Card>

          <Card className="glass-card border border-border/40 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-muted-foreground text-sm mb-2">
                <span>Credit Score (Simulated)</span>
                <Award className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold">{creditScore}</div>
            </div>
            <div className="text-xs text-muted-foreground mt-4">
              {creditScore >= 700 ? "Good standing • Updated live" : "At risk • Credit repair advised"}
            </div>
          </Card>

          <Card className="glass-card border border-border/40 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-muted-foreground text-sm mb-2">
                <span>Threat Protection Status</span>
                <ShieldCheck className={`h-4 w-4 ${lastThreat === "high" ? "text-red-500" : "text-emerald-500"}`} />
              </div>
              <div className={`text-2xl font-bold ${lastThreat === "high" ? "text-red-500" : "text-emerald-500"}`}>
                {lastThreat === "high" ? "Warning" : "Secure"}
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-4">
              {scamCount} suspicious alerts resolved
            </div>
          </Card>

          <Card className="glass-card border border-border/40 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-muted-foreground text-sm mb-2">
                <span>Lessons Completed</span>
                <BookOpen className="h-4 w-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold">{completedCount} / 4</div>
            </div>
            <div className="space-y-2 mt-4">
              <Progress value={(completedCount / 4) * 100} className="h-1.5" />
              <div className="text-xs text-muted-foreground flex justify-between">
                <span>{Math.round((completedCount / 4) * 100)}% master rate</span>
                <span>Level {Math.min(4, completedCount + 1)}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Real-time Announcements & Tips Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Daily Tip */}
          <div className="lg:col-span-1">
            {dailyTip ? (
              <Card className="glass-card border border-primary/20 bg-primary/5 p-6 h-full flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                    <span>Daily Financial Tip</span>
                  </div>
                  <h3 className="text-lg font-bold mt-2">{dailyTip.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {dailyTip.description}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-muted border border-border/40 text-muted-foreground w-fit">
                  {dailyTip.category}
                </span>
              </Card>
            ) : (
              <Card className="glass-card border border-border/40 p-6 h-full flex flex-col justify-center items-center text-center text-xs text-muted-foreground">
                <Sparkles className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <span>Tip of the day will appear here.</span>
              </Card>
            )}
          </div>

          {/* Announcements Log */}
          <Card className="lg:col-span-2 glass-card border border-border/40 p-6 space-y-4">
            <h3 className="font-bold text-md border-b border-border/20 pb-2">System Announcements Feed</h3>
            <div className="space-y-3">
              {announcements.length === 0 ? (
                <div className="text-center text-xs text-muted-foreground py-8">
                  No active announcements from administrators.
                </div>
              ) : (
                announcements.map((ann) => (
                  <div key={ann.id} className="flex justify-between items-start border-b border-border/10 pb-2 last:border-b-0 last:pb-0">
                    <div>
                      <h4 className="font-bold text-xs">{ann.title}</h4>
                      <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">{ann.description}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${
                      ann.priority === "High" 
                        ? "bg-red-500/10 border-red-500/20 text-red-400" 
                        : ann.priority === "Medium"
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    }`}>
                      {ann.priority}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Feature Grid */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold border-b border-border/50 pb-2">AI Modules Suite</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {modules.map((mod, idx) => (
              <Card key={idx} className="glass-card border border-border/50 overflow-hidden flex flex-col justify-between hover:border-primary/30 transition-all group duration-300">
                <CardHeader className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-background/80 w-fit shadow-inner border border-border/10">
                      <mod.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${mod.statusColor}`}>
                      {mod.status}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold">{mod.title}</CardTitle>
                  <CardDescription className="text-sm mt-2 leading-relaxed min-h-[3.5rem]">
                    {mod.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0 flex flex-col justify-between flex-grow">
                  <div className="text-xs text-muted-foreground border-t border-border/40 pt-4 mb-4">
                    {mod.stats}
                  </div>
                  <Button 
                    onClick={() => router.push(mod.href)}
                    className="w-full h-10 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center justify-center gap-2 group/btn"
                  >
                    <span>{mod.cta}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Financial Lessons Quick Panel */}
        <Card className="glass-card border border-border/50 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-2 rounded-full border border-purple-500/20 bg-purple-500/5 px-2.5 py-0.5 text-xs text-purple-400">
              <Award className="h-3.5 w-3.5" />
              <span>Financial Lessons Module</span>
            </div>
            <h3 className="text-2xl font-bold">Level Up Your Real-World Economy Skills</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Master inflation, mortgage mechanics, debt relief strategies, and tax structures. Solve scenario puzzles and level up your financial score.
            </p>
          </div>
          <Button 
            onClick={() => router.push("/lessons")}
            className="h-11 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10 shrink-0"
          >
            <span>Resume Lessons</span>
            <BookOpen className="h-4 w-4" />
          </Button>
        </Card>
      </div>
    </div>
  );
}
