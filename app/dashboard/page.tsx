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
  Award
} from "lucide-react";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [netWorth, setNetWorth] = useState("$24,500");
  const [creditScore, setCreditScore] = useState(740);
  const [scamCount, setScamCount] = useState(0);
  const [lastThreat, setLastThreat] = useState("low");
  const [completedCount, setCompletedCount] = useState(0);
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

      // 1. Lessons completed
      const saved = localStorage.getItem("finverse_unlocked_lessons");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            let completed = parsed.length - 1;
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

      // 2. Net Worth
      const storedNet = localStorage.getItem("finverse_sim_net_worth");
      if (storedNet) {
        setNetWorth(`$${Number(storedNet).toLocaleString()}`);
      } else {
        setNetWorth("$24,500");
      }

      // 3. Credit Score
      const storedCredit = localStorage.getItem("finverse_sim_credit_score");
      if (storedCredit) {
        setCreditScore(Number(storedCredit));
      } else {
        setCreditScore(740);
      }

      // 4. Scams scanned
      const storedScams = localStorage.getItem("finverse_scams_analyzed");
      if (storedScams) {
        setScamCount(Number(storedScams));
      } else {
        setScamCount(0);
      }

      // 5. Last threat status
      const storedThreat = localStorage.getItem("finverse_last_scan_threat");
      if (storedThreat) {
        setLastThreat(storedThreat);
      } else {
        setLastThreat("low");
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
