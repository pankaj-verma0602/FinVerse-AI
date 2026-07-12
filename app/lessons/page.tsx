"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles, ArrowLeft, Lock, Play, HelpCircle, CheckCircle } from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/config";

interface Lesson {
  id: number;
  title: string;
  description: string;
  duration: string;
  type: string;
}

const LESSONS_LIST: Lesson[] = [
  {
    id: 1,
    title: "Compound Interest: The 8th Wonder",
    description: "Learn how time multiplies your cash, and why starting early is the ultimate cheat code.",
    duration: "5 min",
    type: "Interactive Tutorial",
  },
  {
    id: 2,
    title: "The Silent Thief: Understanding Inflation",
    description: "Why leaving money under the mattress means losing wealth, and how to outrun it.",
    duration: "7 min",
    type: "Concept Guide",
  },
  {
    id: 3,
    title: "Mortgages & Debt Mechanics",
    description: "Demystify principal vs interest, amortization tables, and high-interest traps.",
    duration: "10 min",
    type: "Scenario Analysis",
  },
  {
    id: 4,
    title: "Tax Brackets Made Simple",
    description: "Understand marginal tax rates, deductions, and tax-deferred savings schemes.",
    duration: "8 min",
    type: "Calculators Included",
  },
];

export default function LessonsPage() {
  // Navigation & Progression states
  const [unlockedLessons, setUnlockedLessons] = useState<number[]>([1]);
  const [activeLessonId, setActiveLessonId] = useState<number | string>(1);
  const [customLessons, setCustomLessons] = useState<any[]>([]);
  const [customQuizAnswer, setCustomQuizAnswer] = useState<Record<string, number | null>>({});
  const [customQuizChecked, setCustomQuizChecked] = useState<Record<string, boolean>>({});

  // Lesson 1 states
  const [principal1, setPrincipal1] = useState(1000);
  const [rate1, setRate1] = useState(8);
  const [years1, setYears1] = useState(10);
  const [quizAnswer1, setQuizAnswer1] = useState<number | null>(null);
  const [quizChecked1, setQuizChecked1] = useState(false);
  const [showExplanation1, setShowExplanation1] = useState(false);

  // Lesson 2 states
  const [savings2, setSavings2] = useState(10000);
  const [inflation2, setInflation2] = useState(5);
  const [years2, setYears2] = useState(10);
  const [quizAnswer2, setQuizAnswer2] = useState<number | null>(null);
  const [quizChecked2, setQuizChecked2] = useState(false);
  const [showExplanation2, setShowExplanation2] = useState(false);

  // Lesson 3 states
  const [mortgage3, setMortgage3] = useState(150000);
  const [rate3, setRate3] = useState(6);
  const [term3, setTerm3] = useState<15 | 30>(30);
  const [quizAnswer3, setQuizAnswer3] = useState<number | null>(null);
  const [quizChecked3, setQuizChecked3] = useState(false);
  const [showExplanation3, setShowExplanation3] = useState(false);

  // Lesson 4 states
  const [income4, setIncome4] = useState(60000);
  const [filingStatus4, setFilingStatus4] = useState<"single" | "married">("single");
  const [quizAnswer4, setQuizAnswer4] = useState<number | null>(null);
  const [quizChecked4, setQuizChecked4] = useState(false);
  const [showExplanation4, setShowExplanation4] = useState(false);

  const [lessonsList, setLessonsList] = useState<Lesson[]>(LESSONS_LIST);
  const [l1CorrectOption, setL1CorrectOption] = useState(2);
  const [l2CorrectOption, setL2CorrectOption] = useState(2);

  // Load progress and admin overrides on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("finverse_unlocked_lessons");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setUnlockedLessons(parsed);
          }
        } catch (e) {
          console.error(e);
        }
      }

      const overrides = localStorage.getItem("finverse_admin_lessons_overrides");
      if (overrides) {
        try {
          const parsed = JSON.parse(overrides);
          if (parsed.l1Duration || parsed.l2Duration) {
            setLessonsList(prev => prev.map(les => {
              if (les.id === 1 && parsed.l1Duration) {
                return { ...les, duration: parsed.l1Duration };
              }
              if (les.id === 2 && parsed.l2Duration) {
                return { ...les, duration: parsed.l2Duration };
              }
              return les;
            }));
          }
          if (parsed.l1Answer) setL1CorrectOption(parsed.l1Answer);
          if (parsed.l2Answer) setL2CorrectOption(parsed.l2Answer);
        } catch (e) {
          console.error(e);
        }
      }
    }

    // Load custom lessons in real time from Firestore
    const unsub = onSnapshot(collection(db, "lessons"), (snap) => {
      const docsList: any[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.status === "Published") {
          docsList.push({
            id: docSnap.id,
            ...data
          });
        }
      });
      setCustomLessons(docsList);
    }, (err) => {
      console.error(err);
    });

    return () => unsub();
  }, []);

  // Helper to save unlocked lessons
  const unlockNextLesson = (completedId: number) => {
    if (completedId === 4) {
      if (typeof window !== "undefined") {
        localStorage.setItem("finverse_lesson_4_completed", "true");
      }
      return;
    }
    const nextId = completedId + 1;
    if (nextId <= 4 && !unlockedLessons.includes(nextId)) {
      const nextUnlocked = [...unlockedLessons, nextId];
      setUnlockedLessons(nextUnlocked);
      if (typeof window !== "undefined") {
        localStorage.setItem("finverse_unlocked_lessons", JSON.stringify(nextUnlocked));
      }
    }
  };

  // Calculations for Lesson 1
  const compoundAmount1 = Math.round(principal1 * Math.pow(1 + rate1 / 100, years1));
  const simpleSavings1 = Math.round(principal1 + (principal1 * (rate1 / 100) * years1));

  // Calculations for Lesson 2
  const futurePurchasingPower2 = Math.round(savings2 / Math.pow(1 + inflation2 / 100, years2));
  const valueLost2 = savings2 - futurePurchasingPower2;

  // Calculations for Lesson 3
  const computeMortgage = () => {
    const r = rate3 / 12 / 100;
    const n = term3 * 12;
    if (r === 0) return { monthly: Math.round(mortgage3 / n), total: mortgage3, interest: 0 };
    
    const monthly = Math.round((mortgage3 * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    const total = monthly * n;
    const interest = total - mortgage3;
    return { monthly, total, interest };
  };
  const mortgageResult3 = computeMortgage();

  // Calculations for Lesson 4
  const computeTax = () => {
    const brackets = filingStatus4 === "single" 
      ? [
          { limit: 11600, rate: 0.10 },
          { limit: 47150, rate: 0.12 },
          { limit: 100525, rate: 0.22 },
          { limit: Infinity, rate: 0.24 }
        ]
      : [
          { limit: 23200, rate: 0.10 },
          { limit: 94300, rate: 0.12 },
          { limit: 201050, rate: 0.22 },
          { limit: Infinity, rate: 0.24 }
        ];
    
    let tax = 0;
    let previousLimit = 0;
    let marginalBracket = 10;
    
    for (const b of brackets) {
      if (income4 > b.limit) {
        tax += (b.limit - previousLimit) * b.rate;
        previousLimit = b.limit;
      } else {
        tax += (income4 - previousLimit) * b.rate;
        marginalBracket = Math.round(b.rate * 100);
        break;
      }
    }
    const taxLiability = Math.round(tax);
    const effectiveRate = income4 > 0 ? Math.round((taxLiability / income4) * 100) : 0;
    return { taxLiability, marginalBracket, effectiveRate };
  };
  const taxResult4 = computeTax();

  return (
    <div className="relative min-h-screen bg-background p-6 md:p-12">
      {/* Background glow */}
      <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-[120px]" />

      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <Link href="/dashboard" className="inline-flex items-center text-xs text-muted-foreground hover:text-primary mb-2 gap-1 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight">Financial Academy</h1>
            <p className="text-muted-foreground text-sm">Bite-sized, interactive guides for real-world economics.</p>
          </div>
          <Card className="glass-panel px-4 py-2 border-border/50 flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-purple-500" />
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Course Completion</div>
              <div className="text-sm font-bold">{Math.round((unlockedLessons.length / 4) * 100)}% ({unlockedLessons.length}/4 Modules)</div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Modules List */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="font-bold text-lg mb-2">Syllabus</h3>
            <div className="space-y-3">
              {lessonsList.map((les) => {
                const isUnlocked = unlockedLessons.includes(les.id);
                const isActive = activeLessonId === les.id;
                return (
                  <button
                    key={les.id} 
                    onClick={() => isUnlocked && setActiveLessonId(les.id)}
                    disabled={!isUnlocked}
                    className={`w-full text-left border p-4 transition-all rounded-xl ${
                      isActive 
                        ? "glass-card border-purple-500/50 bg-purple-500/10 shadow-md shadow-purple-500/5" 
                        : isUnlocked
                          ? "glass-card border-border/60 hover:bg-muted/40 cursor-pointer"
                          : "border-border/20 bg-background/20 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted border border-border/40 text-muted-foreground">
                        {les.type}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{les.duration}</span>
                    </div>
                    <h4 className="font-bold text-sm flex items-center gap-1.5">
                      {les.title}
                      {!isUnlocked && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                      {isUnlocked && unlockedLessons.includes(les.id + 1) && (
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 ml-auto" />
                      )}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{les.description}</p>
                  </button>
                );
              })}
            </div>

            {customLessons.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-border/20">
                <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mt-4">Admin Custom Lessons</h3>
                {customLessons.map((les) => {
                  const isActive = activeLessonId === les.id;
                  return (
                    <button
                      key={les.id}
                      onClick={() => setActiveLessonId(les.id)}
                      className={`w-full text-left border p-4 transition-all rounded-xl cursor-pointer ${
                        isActive
                          ? "glass-card border-purple-500/55 bg-purple-500/10 shadow-md shadow-purple-500/5"
                          : "glass-card border-border/60 hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted border border-border/40 text-muted-foreground">
                          {les.category}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{les.difficulty}</span>
                      </div>
                      <h4 className="font-bold text-sm">{les.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{les.description}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Interactive Workspace Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* LESSON 1: Compound Interest */}
            {activeLessonId === 1 && (
              <Card className="glass-card border border-border/50 p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-purple-400 text-xs font-bold">
                  <Sparkles className="h-4 w-4" />
                  <span>Active Module: Lesson 1</span>
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold">Compound Interest: The 8th Wonder</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Simple interest calculates gains only on your initial deposit. Compound interest computes gains on your deposit <strong>plus</strong> your accumulated gains. Over time, this builds exponential growth.
                  </p>
                </div>

                {/* Slider Tool */}
                <div className="space-y-6 bg-muted/20 border border-border/40 p-6 rounded-2xl">
                  <h4 className="font-bold text-sm border-b border-border/40 pb-2 flex items-center gap-2">
                    <Play className="h-4 w-4 text-purple-500" />
                    Try the Calculator Sandbox
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <label className="font-medium text-muted-foreground">Principal Investment</label>
                        <span className="text-purple-400 font-bold">${principal1.toLocaleString()}</span>
                      </div>
                      <input 
                        type="range" 
                        min="100" 
                        max="10000" 
                        step="100" 
                        value={principal1} 
                        onChange={(e) => setPrincipal1(Number(e.target.value))}
                        className="w-full accent-purple-500 cursor-pointer"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <label className="font-medium text-muted-foreground">Annual Rate (APY)</label>
                          <span className="text-purple-400 font-bold">{rate1}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="20" 
                          step="0.5" 
                          value={rate1} 
                          onChange={(e) => setRate1(Number(e.target.value))}
                          className="w-full accent-purple-500 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <label className="font-medium text-muted-foreground">Duration (Years)</label>
                          <span className="text-purple-400 font-bold">{years1} Years</span>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="30" 
                          step="1" 
                          value={years1} 
                          onChange={(e) => setYears1(Number(e.target.value))}
                          className="w-full accent-purple-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Calculation Outputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border/40 pt-4 mt-4">
                    <div className="bg-background/45 p-3 rounded-lg border border-border/30 text-center">
                      <div className="text-[10px] text-muted-foreground">Without Compound</div>
                      <div className="text-base font-bold">${simpleSavings1.toLocaleString()}</div>
                    </div>
                    <div className="bg-background/45 p-3 rounded-lg border border-border/30 text-center">
                      <div className="text-[10px] text-muted-foreground">With Compound</div>
                      <div className="text-base font-bold text-emerald-500">${compoundAmount1.toLocaleString()}</div>
                    </div>
                    <div className="bg-purple-900/10 p-3 rounded-lg border border-purple-500/25 text-center">
                      <div className="text-[10px] text-purple-400">Time Value Bonus</div>
                      <div className="text-base font-bold text-purple-400">${(compoundAmount1 - simpleSavings1).toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {/* Quick Quiz Card */}
                <div className="space-y-4 border-t border-border/40 pt-6">
                  <h4 className="font-bold text-sm flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-purple-500" />
                    Knowledge Check
                  </h4>
                  
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      If you invest $1,000 at a 10% annual rate for 2 years with compounding, how much total interest do you earn?
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { val: 1, label: "$200 (Simple interest only)" },
                        { val: 2, label: "$210 (Interest compounds year 2)" },
                        { val: 3, label: "$220 (Extra bonus year 2)" },
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          onClick={() => !quizChecked1 && setQuizAnswer1(opt.val)}
                          disabled={quizChecked1}
                          className={`text-xs text-left p-3 rounded-lg border transition-all ${
                            quizAnswer1 === opt.val 
                              ? "border-purple-500 bg-purple-500/10 font-bold" 
                              : "border-border/40 hover:bg-muted/50 text-muted-foreground"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-4 items-center justify-between mt-4">
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => {
                            setQuizChecked1(true);
                            setShowExplanation1(true);
                            if (quizAnswer1 === l1CorrectOption) unlockNextLesson(1);
                          }} 
                          disabled={quizAnswer1 === null || quizChecked1}
                          className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg h-9 px-4 text-xs font-bold"
                        >
                          Check Answer
                        </Button>

                        {quizChecked1 && quizAnswer1 !== l1CorrectOption && (
                          <Button
                            onClick={() => {
                              setQuizChecked1(false);
                              setQuizAnswer1(null);
                              setShowExplanation1(false);
                            }}
                            variant="outline"
                            className="border-purple-500/40 text-purple-400 hover:bg-purple-500/10 rounded-lg h-9 px-4 text-xs font-bold"
                          >
                            Try Again
                          </Button>
                        )}

                        {quizChecked1 && quizAnswer1 === l1CorrectOption && (
                          <Button
                            onClick={() => {
                              setActiveLessonId(2);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-9 px-4 text-xs font-bold"
                          >
                            Proceed to Lesson 2
                          </Button>
                        )}
                      </div>

                      {quizChecked1 && (
                        <span className={`text-xs font-bold ${quizAnswer1 === l1CorrectOption ? "text-emerald-500" : "text-red-500"}`}>
                          {quizAnswer1 === l1CorrectOption ? "Correct! $100 in year 1 + $110 in year 2." : "Incorrect. Remember, Year 2 interest accrues on $1,100."}
                        </span>
                      )}
                    </div>

                    {showExplanation1 && (
                      <div className="bg-purple-500/5 border border-purple-500/20 p-4 rounded-xl text-xs text-muted-foreground leading-relaxed animate-in fade-in duration-300">
                        <strong>Explanation:</strong> In Year 1, you earn 10% of $1,000 = $100, bringing your balance to $1,100. In Year 2, you earn 10% of $1,100 = $110. The total interest is $100 + $110 = $210. Under simple interest, you would only earn $200!
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* LESSON 2: Inflation */}
            {activeLessonId === 2 && (
              <Card className="glass-card border border-border/50 p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-purple-400 text-xs font-bold">
                  <Sparkles className="h-4 w-4" />
                  <span>Active Module: Lesson 2</span>
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold">The Silent Thief: Understanding Inflation</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Inflation is the rate at which the general level of prices for goods and services rises, purchasing power falls. Money sitting idle in cash loses purchasing power every single year.
                  </p>
                </div>

                {/* Slider Tool */}
                <div className="space-y-6 bg-muted/20 border border-border/40 p-6 rounded-2xl">
                  <h4 className="font-bold text-sm border-b border-border/40 pb-2 flex items-center gap-2">
                    <Play className="h-4 w-4 text-purple-500" />
                    Inflation Decay Simulator
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <label className="font-medium text-muted-foreground">Cash Savings</label>
                        <span className="text-purple-400 font-bold">${savings2.toLocaleString()}</span>
                      </div>
                      <input 
                        type="range" 
                        min="1000" 
                        max="100000" 
                        step="1000" 
                        value={savings2} 
                        onChange={(e) => setSavings2(Number(e.target.value))}
                        className="w-full accent-purple-500 cursor-pointer"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <label className="font-medium text-muted-foreground">Inflation Rate</label>
                          <span className="text-purple-400 font-bold">{inflation2}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="15" 
                          step="0.5" 
                          value={inflation2} 
                          onChange={(e) => setInflation2(Number(e.target.value))}
                          className="w-full accent-purple-500 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <label className="font-medium text-muted-foreground">Time Horizon</label>
                          <span className="text-purple-400 font-bold">{years2} Years</span>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="30" 
                          step="1" 
                          value={years2} 
                          onChange={(e) => setYears2(Number(e.target.value))}
                          className="w-full accent-purple-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Calculation Outputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border/40 pt-4 mt-4">
                    <div className="bg-background/45 p-3 rounded-lg border border-border/30 text-center">
                      <div className="text-[10px] text-muted-foreground">Original Cash Value</div>
                      <div className="text-base font-bold">${savings2.toLocaleString()}</div>
                    </div>
                    <div className="bg-background/45 p-3 rounded-lg border border-border/30 text-center">
                      <div className="text-[10px] text-muted-foreground">Future Purchasing Power</div>
                      <div className="text-base font-bold text-amber-500">${futurePurchasingPower2.toLocaleString()}</div>
                    </div>
                    <div className="bg-red-950/10 p-3 rounded-lg border border-red-500/25 text-center">
                      <div className="text-[10px] text-red-400">Purchasing Power Lost</div>
                      <div className="text-base font-bold text-red-400">${valueLost2.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {/* Quick Quiz Card */}
                <div className="space-y-4 border-t border-border/40 pt-6">
                  <h4 className="font-bold text-sm flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-purple-500" />
                    Knowledge Check
                  </h4>
                  
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      If inflation is 6% per year, and your salary does not increase, what happens to your purchasing power after 10 years?
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { val: 1, label: "It stays exactly the same." },
                        { val: 2, label: "It decreases by about 44%." },
                        { val: 3, label: "It increases because prices are higher." },
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          onClick={() => !quizChecked2 && setQuizAnswer2(opt.val)}
                          disabled={quizChecked2}
                          className={`text-xs text-left p-3 rounded-lg border transition-all ${
                            quizAnswer2 === opt.val 
                              ? "border-purple-500 bg-purple-500/10 font-bold" 
                              : "border-border/40 hover:bg-muted/50 text-muted-foreground"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-4 items-center justify-between mt-4">
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => {
                            setQuizChecked2(true);
                            setShowExplanation2(true);
                            if (quizAnswer2 === l2CorrectOption) unlockNextLesson(2);
                          }} 
                          disabled={quizAnswer2 === null || quizChecked2}
                          className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg h-9 px-4 text-xs font-bold"
                        >
                          Check Answer
                        </Button>

                        {quizChecked2 && quizAnswer2 !== l2CorrectOption && (
                          <Button
                            onClick={() => {
                              setQuizChecked2(false);
                              setQuizAnswer2(null);
                              setShowExplanation2(false);
                            }}
                            variant="outline"
                            className="border-purple-500/40 text-purple-400 hover:bg-purple-500/10 rounded-lg h-9 px-4 text-xs font-bold"
                          >
                            Try Again
                          </Button>
                        )}

                        {quizChecked2 && quizAnswer2 === l2CorrectOption && (
                          <Button
                            onClick={() => {
                              setActiveLessonId(3);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-9 px-4 text-xs font-bold"
                          >
                            Proceed to Lesson 3
                          </Button>
                        )}
                      </div>

                      {quizChecked2 && (
                        <span className={`text-xs font-bold ${quizAnswer2 === l2CorrectOption ? "text-emerald-500" : "text-red-500"}`}>
                          {quizAnswer2 === l2CorrectOption ? "Correct! Prices increase compounding, losing about 44% buying capacity." : "Incorrect. Inflation decreases your buying power."}
                        </span>
                      )}
                    </div>

                    {showExplanation2 && (
                      <div className="bg-purple-500/5 border border-purple-500/20 p-4 rounded-xl text-xs text-muted-foreground leading-relaxed animate-in fade-in duration-300">
                        <strong>Explanation:</strong> With 6% annual inflation, the value of cash scales by 1 / (1.06)^10 = 0.558. This means your cash can only purchase 55.8% of what it could buy today, representing a purchasing power loss of ~44.2%.
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* LESSON 3: Mortgages */}
            {activeLessonId === 3 && (
              <Card className="glass-card border border-border/50 p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-purple-400 text-xs font-bold">
                  <Sparkles className="h-4 w-4" />
                  <span>Active Module: Lesson 3</span>
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold">Mortgages & Debt Mechanics</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    A mortgage allows you to buy a home by borrowing capital. Long-term debt compounds interest on the remaining principal, meaning the total cost of a 30-year loan is often double the actual purchase price.
                  </p>
                </div>

                {/* Slider Tool */}
                <div className="space-y-6 bg-muted/20 border border-border/40 p-6 rounded-2xl">
                  <h4 className="font-bold text-sm border-b border-border/40 pb-2 flex items-center gap-2">
                    <Play className="h-4 w-4 text-purple-500" />
                    Mortgage Cost Amortizer
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <label className="font-medium text-muted-foreground">Loan Amount (Principal)</label>
                        <span className="text-purple-400 font-bold">${mortgage3.toLocaleString()}</span>
                      </div>
                      <input 
                        type="range" 
                        min="50000" 
                        max="500000" 
                        step="5000" 
                        value={mortgage3} 
                        onChange={(e) => setMortgage3(Number(e.target.value))}
                        className="w-full accent-purple-500 cursor-pointer"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <label className="font-medium text-muted-foreground">Interest Rate (APR)</label>
                          <span className="text-purple-400 font-bold">{rate3}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="2" 
                          max="12" 
                          step="0.1" 
                          value={rate3} 
                          onChange={(e) => setRate3(Number(e.target.value))}
                          className="w-full accent-purple-500 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground block mb-2">Loan Term</label>
                        <div className="flex bg-background rounded-lg border border-border p-0.5">
                          <button
                            onClick={() => setTerm3(15)}
                            className={`flex-1 py-1 rounded-md text-xs font-semibold ${term3 === 15 ? "bg-purple-600 text-white font-bold" : "text-muted-foreground"}`}
                          >
                            15 Years
                          </button>
                          <button
                            onClick={() => setTerm3(30)}
                            className={`flex-1 py-1 rounded-md text-xs font-semibold ${term3 === 30 ? "bg-purple-600 text-white font-bold" : "text-muted-foreground"}`}
                          >
                            30 Years
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Calculation Outputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border/40 pt-4 mt-4">
                    <div className="bg-background/45 p-3 rounded-lg border border-border/30 text-center">
                      <div className="text-[10px] text-muted-foreground font-semibold">Monthly P&I Payment</div>
                      <div className="text-base font-bold">${mortgageResult3.monthly.toLocaleString()}</div>
                    </div>
                    <div className="bg-background/45 p-3 rounded-lg border border-border/30 text-center">
                      <div className="text-[10px] text-muted-foreground font-semibold">Total Paid Over Term</div>
                      <div className="text-base font-bold text-amber-500">${mortgageResult3.total.toLocaleString()}</div>
                    </div>
                    <div className="bg-red-950/10 p-3 rounded-lg border border-red-500/25 text-center">
                      <div className="text-[10px] text-red-400 font-semibold">Total Interest Paid</div>
                      <div className="text-base font-bold text-red-400">${mortgageResult3.interest.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {/* Quick Quiz Card */}
                <div className="space-y-4 border-t border-border/40 pt-6">
                  <h4 className="font-bold text-sm flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-purple-500" />
                    Knowledge Check
                  </h4>
                  
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      If you take a 30-year mortgage for $200,000 at a 6% interest rate, the total payments over 30 years will be closest to:
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { val: 1, label: "$200,000 (just the principal)" },
                        { val: 2, label: "$236,000 (principal + small fee)" },
                        { val: 3, label: "$431,600 (more than double)" },
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          onClick={() => !quizChecked3 && setQuizAnswer3(opt.val)}
                          disabled={quizChecked3}
                          className={`text-xs text-left p-3 rounded-lg border transition-all ${
                            quizAnswer3 === opt.val 
                              ? "border-purple-500 bg-purple-500/10 font-bold" 
                              : "border-border/40 hover:bg-muted/50 text-muted-foreground"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-4 items-center justify-between mt-4">
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => {
                            setQuizChecked3(true);
                            setShowExplanation3(true);
                            if (quizAnswer3 === 3) unlockNextLesson(3);
                          }} 
                          disabled={quizAnswer3 === null || quizChecked3}
                          className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg h-9 px-4 text-xs font-bold"
                        >
                          Check Answer
                        </Button>

                        {quizChecked3 && quizAnswer3 !== 3 && (
                          <Button
                            onClick={() => {
                              setQuizChecked3(false);
                              setQuizAnswer3(null);
                              setShowExplanation3(false);
                            }}
                            variant="outline"
                            className="border-purple-500/40 text-purple-400 hover:bg-purple-500/10 rounded-lg h-9 px-4 text-xs font-bold"
                          >
                            Try Again
                          </Button>
                        )}

                        {quizChecked3 && quizAnswer3 === 3 && (
                          <Button
                            onClick={() => {
                              setActiveLessonId(4);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-9 px-4 text-xs font-bold"
                          >
                            Proceed to Lesson 4
                          </Button>
                        )}
                      </div>

                      {quizChecked3 && (
                        <span className={`text-xs font-bold ${quizAnswer3 === 3 ? "text-emerald-500" : "text-red-500"}`}>
                          {quizAnswer3 === 3 ? "Correct! Compounding interest makes you pay back more than double the loan!" : "Incorrect. Interest accumulates significantly over 30 years."}
                        </span>
                      )}
                    </div>

                    {showExplanation3 && (
                      <div className="bg-purple-500/5 border border-purple-500/20 p-4 rounded-xl text-xs text-muted-foreground leading-relaxed animate-in fade-in duration-300">
                        <strong>Explanation:</strong> A 30-year loan at 6% requires a monthly payment of $1,199.10. Over 360 payments, you will pay a total of $431,677, paying back $200,000 of principal and $231,677 in pure interest to the bank!
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* LESSON 4: Tax Brackets */}
            {activeLessonId === 4 && (
              <Card className="glass-card border border-border/50 p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-purple-400 text-xs font-bold">
                  <Sparkles className="h-4 w-4" />
                  <span>Active Module: Lesson 4</span>
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold">Tax Brackets Made Simple</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Most countries use a marginal tax bracket system. A higher bracket does not tax your whole income at that rate—it only taxes the dollars that fall within that specific bracket range.
                  </p>
                </div>

                {/* Slider Tool */}
                <div className="space-y-6 bg-muted/20 border border-border/40 p-6 rounded-2xl">
                  <h4 className="font-bold text-sm border-b border-border/40 pb-2 flex items-center gap-2">
                    <Play className="h-4 w-4 text-purple-500" />
                    Marginal Tax Bracket Simulator
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <label className="font-medium text-muted-foreground">Annual Taxable Income</label>
                        <span className="text-purple-400 font-bold">${income4.toLocaleString()}</span>
                      </div>
                      <input 
                        type="range" 
                        min="10000" 
                        max="250000" 
                        step="5000" 
                        value={income4} 
                        onChange={(e) => setIncome4(Number(e.target.value))}
                        className="w-full accent-purple-500 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground block mb-2">Filing Status</label>
                      <div className="flex bg-background rounded-lg border border-border p-0.5 max-w-xs">
                        <button
                          onClick={() => setFilingStatus4("single")}
                          className={`flex-1 py-1 rounded-md text-xs font-semibold ${filingStatus4 === "single" ? "bg-purple-600 text-white font-bold" : "text-muted-foreground"}`}
                        >
                          Single Filer
                        </button>
                        <button
                          onClick={() => setFilingStatus4("married")}
                          className={`flex-1 py-1 rounded-md text-xs font-semibold ${filingStatus4 === "married" ? "bg-purple-600 text-white font-bold" : "text-muted-foreground"}`}
                        >
                          Married Jointly
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Calculation Outputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border/40 pt-4 mt-4">
                    <div className="bg-background/45 p-3 rounded-lg border border-border/30 text-center">
                      <div className="text-[10px] text-muted-foreground font-semibold">Total Tax Owed</div>
                      <div className="text-base font-bold text-red-400">${taxResult4.taxLiability.toLocaleString()}</div>
                    </div>
                    <div className="bg-background/45 p-3 rounded-lg border border-border/30 text-center">
                      <div className="text-[10px] text-muted-foreground font-semibold">Top Marginal Bracket</div>
                      <div className="text-base font-bold text-purple-400">{taxResult4.marginalBracket}%</div>
                    </div>
                    <div className="bg-emerald-950/10 p-3 rounded-lg border border-emerald-500/25 text-center">
                      <div className="text-[10px] text-emerald-400 font-semibold">Effective Overall Tax Rate</div>
                      <div className="text-base font-bold text-emerald-400">{taxResult4.effectiveRate}%</div>
                    </div>
                  </div>
                </div>

                {/* Quick Quiz Card */}
                <div className="space-y-4 border-t border-border/40 pt-6">
                  <h4 className="font-bold text-sm flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-purple-500" />
                    Knowledge Check
                  </h4>
                  
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      If you get a raise that pushes you into a higher marginal tax bracket, will your take-home pay from your previous income level decrease?
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { val: 1, label: "Yes, the new rate applies to all income." },
                        { val: 2, label: "No, it only applies to the extra income." },
                        { val: 3, label: "Only if you file as Single." },
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          onClick={() => !quizChecked4 && setQuizAnswer4(opt.val)}
                          disabled={quizChecked4}
                          className={`text-xs text-left p-3 rounded-lg border transition-all ${
                            quizAnswer4 === opt.val 
                              ? "border-purple-500 bg-purple-500/10 font-bold" 
                              : "border-border/40 hover:bg-muted/50 text-muted-foreground"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-4 items-center justify-between mt-4">
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => {
                            setQuizChecked4(true);
                            setShowExplanation4(true);
                            if (quizAnswer4 === 2) unlockNextLesson(4);
                          }} 
                          disabled={quizAnswer4 === null || quizChecked4}
                          className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg h-9 px-4 text-xs font-bold"
                        >
                          Check Answer
                        </Button>

                        {quizChecked4 && quizAnswer4 !== 2 && (
                          <Button
                            onClick={() => {
                              setQuizChecked4(false);
                              setQuizAnswer4(null);
                              setShowExplanation4(false);
                            }}
                            variant="outline"
                            className="border-purple-500/40 text-purple-400 hover:bg-purple-500/10 rounded-lg h-9 px-4 text-xs font-bold"
                          >
                            Try Again
                          </Button>
                        )}

                        {quizChecked4 && quizAnswer4 === 2 && (
                          <Link href="/dashboard">
                            <Button
                              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-9 px-4 text-xs font-bold animate-pulse"
                            >
                              Finish Academy 🎉
                            </Button>
                          </Link>
                        )}
                      </div>

                      {quizChecked4 && (
                        <span className={`text-xs font-bold ${quizAnswer4 === 2 ? "text-emerald-500" : "text-red-500"}`}>
                          {quizAnswer4 === 2 ? "Correct! Only the dollars in that specific bracket range are taxed at the higher rate." : "Incorrect. Remember how marginal tax works."}
                        </span>
                      )}
                    </div>

                    {showExplanation4 && (
                      <div className="bg-purple-500/5 border border-purple-500/20 p-4 rounded-xl text-xs text-muted-foreground leading-relaxed animate-in fade-in duration-300">
                        <strong>Explanation:</strong> Marginal tax systems only tax the dollars earned within each specific bracket. Moving to a higher bracket NEVER reduces your net take-home income overall—it only taxes the new, extra income at the higher rate.
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* CUSTOM LESSON WORKSPACE */}
            {typeof activeLessonId === "string" && (() => {
              const les = customLessons.find(c => c.id === activeLessonId);
              if (!les) return null;
              return (
                <Card className="glass-card border border-border/50 p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between text-purple-400 text-xs font-bold border-b border-border/25 pb-3">
                    <span className="flex items-center gap-1.5"><Sparkles className="h-4 w-4" /> Admin Course Module</span>
                    <span>{les.difficulty} • {les.language}</span>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold">{les.title}</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">{les.description}</p>
                  </div>

                  {les.imageUrl && (
                    <div className="rounded-xl overflow-hidden border border-border/40 max-h-[300px] flex items-center justify-center bg-muted/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={les.imageUrl} alt={les.title} className="object-cover w-full h-full" />
                    </div>
                  )}

                  {les.videoUrl && (
                    <div className="rounded-xl overflow-hidden border border-border/40 aspect-video bg-black flex items-center justify-center">
                      <video src={les.videoUrl} controls className="w-full h-full" />
                    </div>
                  )}

                  <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap font-sans">
                    {les.content}
                  </div>

                  {les.quizQuestion && (
                    <div className="border border-border/40 p-6 rounded-xl space-y-4 bg-muted/5 mt-8">
                      <h3 className="font-bold text-md flex items-center gap-2 text-purple-400">
                        <HelpCircle className="h-5 w-5" />
                        <span>Interactive Knowledge Check</span>
                      </h3>
                      <p className="text-xs text-muted-foreground">{les.quizQuestion}</p>
                      
                      <div className="space-y-2">
                        {les.quizOptions?.map((opt: any) => (
                          <button
                            key={opt.val}
                            onClick={() => {
                              if (!customQuizChecked[les.id]) {
                                setCustomQuizAnswer(prev => ({ ...prev, [les.id]: opt.val }));
                              }
                            }}
                            className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${
                              customQuizAnswer[les.id] === opt.val
                                ? "border-purple-500 bg-purple-500/10 font-bold"
                                : "border-border/40 hover:bg-muted/50 text-muted-foreground"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      <div className="pt-2 flex gap-2">
                        <Button
                          onClick={() => {
                            setCustomQuizChecked(prev => ({ ...prev, [les.id]: true }));
                          }}
                          disabled={!customQuizAnswer[les.id] || customQuizChecked[les.id]}
                          className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg h-9 px-4 text-xs font-bold"
                        >
                          Check Answer
                        </Button>
                        {customQuizChecked[les.id] && customQuizAnswer[les.id] !== les.quizCorrectVal && (
                          <Button
                            onClick={() => {
                              setCustomQuizChecked(prev => ({ ...prev, [les.id]: false }));
                              setCustomQuizAnswer(prev => ({ ...prev, [les.id]: null }));
                            }}
                            variant="outline"
                            className="border-purple-500/40 text-purple-400 hover:bg-purple-500/10 rounded-lg h-9 px-4 text-xs font-bold"
                          >
                            Try Again
                          </Button>
                        )}
                      </div>

                      {customQuizChecked[les.id] && (
                        <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                          customQuizAnswer[les.id] === les.quizCorrectVal
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-red-500/10 border-red-500/20 text-red-500"
                        }`}>
                          {customQuizAnswer[les.id] === les.quizCorrectVal ? (
                            <div className="space-y-1">
                              <span className="font-bold flex items-center gap-1.5"><CheckCircle className="h-4 w-4" /> Correct Answer!</span>
                              <p>Excellent job! You have fully understood this concept and verified your financial competence.</p>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <span className="font-bold">Incorrect Option.</span>
                              <p>Please review the course details above and choose another option to try again.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
