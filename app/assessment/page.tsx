"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/firebase/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2
} from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

interface Question {
  id: number;
  text: string;
  options: {
    label: string;
    points: number;
    description: string;
  }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "What is your primary financial goal right now?",
    options: [
      { label: "Building emergency savings", points: 80, description: "Focusing on safety and a solid liquid cash buffer." },
      { label: "Paying off outstanding debt", points: 60, description: "Eliminating compound interest liabilities." },
      { label: "Investing in the stock market", points: 100, description: "Growing long-term compound wealth." },
      { label: "Purchasing my first home", points: 70, description: "Navigating mortgages and major property assets." }
    ]
  },
  {
    id: 2,
    text: "How familiar are you with compound interest and inflation?",
    options: [
      { label: "I am completely new to these terms", points: 40, description: "Need base foundations." },
      { label: "I know the basic definitions", points: 70, description: "Understand how inflation decays and savings grow." },
      { label: "I can comfortably calculate them", points: 100, description: "Ready for advanced asset allocations." }
    ]
  },
  {
    id: 3,
    text: "How do you currently track your monthly expenses?",
    options: [
      { label: "I do not track them regularly", points: 40, description: "Relying on mental estimation." },
      { label: "I estimate roughly in my head", points: 60, description: "Know basic balances but lack strict tracking." },
      { label: "I maintain a strict budget or app tracker", points: 100, description: "Clear discipline over cash flows." }
    ]
  },
  {
    id: 4,
    text: "How confident are you in detecting phishing links or suspicious bank texts?",
    options: [
      { label: "Not confident, I feel vulnerable", points: 50, description: "Worried about digital scam schemes." },
      { label: "Moderately confident, but cautious", points: 80, description: "Can detect obvious traps but want validation tools." },
      { label: "Very confident, I know what to look for", points: 100, description: "Comfortable validating spoofed domains." }
    ]
  },
  {
    id: 5,
    text: "What percentage of your income do you save or invest monthly?",
    options: [
      { label: "0% or less (living paycheck to paycheck)", points: 40, description: "Struggling to build surplus cash." },
      { label: "1% to 15% of my earnings", points: 75, description: "Building a consistent savings routine." },
      { label: "16% or more of my earnings", points: 100, description: "Aggressively growing future capital." }
    ]
  }
];

export default function AssessmentPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0 = Intro, 1-5 = Questions, 6 = Analyzing, 7 = Complete
  const [answers, setAnswers] = useState<number[]>([]);
  const [loadingText, setLoadingText] = useState("Analyzing responses...");
  const [score, setScore] = useState(300);
  const [level, setLevel] = useState("Novice Beginner");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push("/login");
    }
  }, [user, loading, mounted, router]);

  if (!mounted || loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground text-sm">Initializing Assessment...</p>
        </div>
      </div>
    );
  }

  const handleSelectOption = (points: number) => {
    const nextAnswers = [...answers, points];
    setAnswers(nextAnswers);

    if (currentStep < QUESTIONS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleStart = () => {
    setCurrentStep(1);
    setAnswers([]);
  };

  const generateRoadmap = async () => {
    setCurrentStep(6);

    // Simulate AI loading steps
    const messages = [
      "Analyzing quiz metrics...",
      "Evaluating financial goal vectors...",
      "Generating personalized roadmap modules...",
      "Injecting XP modifiers..."
    ];

    for (let i = 0; i < messages.length; i++) {
      setLoadingText(messages[i]);
      await new Promise((r) => setTimeout(r, 800));
    }

    // Calculate dynamic literacy score (FICO style 300 - 850)
    const totalPoints = answers.reduce((a, b) => a + b, 0);
    const maxPoints = QUESTIONS.length * 100;
    const computedScore = Math.round(300 + (totalPoints / maxPoints) * 550);
    
    let computedLevel = "Novice Beginner";
    if (computedScore > 700) computedLevel = "Advanced Wealth builder";
    else if (computedScore > 500) computedLevel = "Intermediate Saver";

    const customRoadmap = [
      {
        id: "phase1",
        title: "Phase 1: Foundation Building",
        description: "Review syllabus Lesson 1 & Lesson 2. Understand compound growth and purchasing decay.",
        targetUrl: "/lessons"
      },
      {
        id: "phase2",
        title: "Phase 2: Asset Multipliers",
        description: "Achieve a simulated net worth exceeding $26,000 to demonstrate cash reserve discipline.",
        targetUrl: "/simulator"
      },
      {
        id: "phase3",
        title: "Phase 3: Financial Mentorship",
        description: "Chat with the AI Money Mentor to resolve tax bracket and budget questions.",
        targetUrl: "/mentor"
      },
      {
        id: "phase4",
        title: "Phase 4: Scam Defense Mastery",
        description: "Scan a text message or web link in the Scam Shield to test phishing detection.",
        targetUrl: "/scam-shield"
      }
    ];

    setScore(computedScore);
    setLevel(computedLevel);

    // Save state locally
    localStorage.setItem("finverse_assessment_completed", "true");
    localStorage.setItem("finverse_assessment_score", String(computedScore));
    localStorage.setItem("finverse_assessment_level", computedLevel);
    localStorage.setItem("finverse_learning_roadmap", JSON.stringify(customRoadmap));
    localStorage.setItem("finverse_user_xp", "50");
    localStorage.setItem("finverse_unlocked_badges", JSON.stringify(["Pioneer"]));

    // Save to Firestore
    try {
      await setDoc(doc(db, "users", user.uid), {
        assessmentCompleted: true,
        assessmentScore: computedScore,
        assessmentLevel: computedLevel,
        roadmap: customRoadmap,
        xp: 50,
        badges: ["Pioneer"],
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn("Firestore user assessment save failed, fallback to local storage active.", e);
      // Fallback for Demo mode
      const demoUser = localStorage.getItem("finverse_demo_user");
      if (demoUser) {
        try {
          const parsed = JSON.parse(demoUser);
          parsed.assessmentCompleted = true;
          parsed.assessmentScore = computedScore;
          parsed.assessmentLevel = computedLevel;
          parsed.roadmap = customRoadmap;
          parsed.xp = 50;
          parsed.badges = ["Pioneer"];
          localStorage.setItem("finverse_demo_user", JSON.stringify(parsed));
        } catch (err) {
          console.error(err);
        }
      }
    }

    setCurrentStep(7);
  };

  return (
    <div className="relative min-h-screen bg-background p-6 md:p-12 flex items-center justify-center">
      {/* Background glow */}
      <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[120px]" />
      
      <div className="max-w-xl w-full">
        {currentStep === 0 && (
          <Card className="glass-card border border-border/50 p-8 rounded-2xl space-y-6 text-center animate-in fade-in duration-300">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight">AI Onboarding Assessment</h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Take a 2-minute diagnostic questionnaire. Our AI will analyze your profiles and goals to generate your personalized learning roadmap.
              </p>
            </div>
            <Button onClick={handleStart} className="w-full rounded-xl h-12 font-bold flex items-center justify-center gap-2">
              Begin Assessment <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        )}

        {currentStep > 0 && currentStep <= QUESTIONS.length && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground font-semibold">
                <span>Assessment Progress</span>
                <span>Question {currentStep} of {QUESTIONS.length}</span>
              </div>
              <Progress value={(currentStep / QUESTIONS.length) * 100} className="h-1.5" />
            </div>

            {/* Question Card */}
            <Card className="glass-card border border-border/50 p-6 md:p-8 rounded-2xl space-y-6">
              <h2 className="text-xl font-bold tracking-tight">{QUESTIONS[currentStep - 1].text}</h2>
              
              <div className="space-y-3">
                {QUESTIONS[currentStep - 1].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (currentStep === QUESTIONS.length) {
                        // Gather answers and submit
                        const finalAnswers = [...answers, opt.points];
                        setAnswers(finalAnswers);
                        setTimeout(() => generateRoadmap(), 100);
                      } else {
                        handleSelectOption(opt.points);
                      }
                    }}
                    className="w-full text-left p-4 border border-border/40 hover:border-primary/30 bg-muted/5 hover:bg-primary/5 rounded-xl transition-all duration-200 flex flex-col gap-0.5 group"
                  >
                    <span className="text-sm font-bold group-hover:text-primary transition-colors">{opt.label}</span>
                    <span className="text-[10px] text-muted-foreground leading-normal">{opt.description}</span>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        )}

        {currentStep === 6 && (
          <Card className="glass-card border border-border/50 p-8 rounded-2xl space-y-6 text-center animate-in fade-in duration-300">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <h2 className="text-xl font-extrabold tracking-tight">AI Diagnostic Assessment</h2>
              <p className="text-muted-foreground text-sm">{loadingText}</p>
            </div>
          </Card>
        )}

        {currentStep === 7 && (
          <Card className="glass-card border border-border/50 p-8 rounded-2xl space-y-6 text-center animate-in fade-in duration-300">
            <div className="mx-auto w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-500 animate-bounce" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold tracking-tight">Onboarding Assessment Complete!</h2>
              <p className="text-muted-foreground text-sm">
                Congratulations! We evaluated your profile and unlocked your learning metrics.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/10 border border-border/40 rounded-xl text-left">
              <div>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Literacy Score</span>
                <div className="text-2xl font-black text-primary mt-0.5">{score}</div>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">AI Level Rating</span>
                <div className="text-sm font-extrabold text-foreground mt-1.5 leading-tight">{level}</div>
              </div>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl text-left flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-primary">Onboarding Pioneer Badge Unlocked!</h4>
                <p className="text-[10px] text-muted-foreground leading-normal">
                  You earned your starting badge and **+50 XP** for completing onboarding.
                </p>
              </div>
            </div>

            <Button onClick={() => router.push("/dashboard")} className="w-full rounded-xl h-12 font-bold">
              View Personalized Roadmap
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
