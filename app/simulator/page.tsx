"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/firebase/auth-context";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Sparkles,
  ArrowLeft,
  Calendar,
  Briefcase,
  Home,
  Award,
  AlertTriangle,
  RefreshCw,
  DollarSign,
  Activity,
  ChevronRight
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface HistoryPoint {
  age: number;
  netWorth: number;
  savings: number;
  investments: number;
  debt: number;
}

const PRESETS = [
  {
    name: "Debt-ridden Graduate",
    description: "Young graduate with student loans and entry-level salary. Needs to balance debt payoff with building an emergency fund.",
    age: 22,
    salary: 3200,
    expenses: 2600,
    savings: 1000,
    investments: 0,
    debt: 12000,
    assets: 0,
  },
  {
    name: "Steady Corporate Earner",
    description: "Mid-career professional with stable income and some savings. Ready to start investing in equities or home ownership.",
    age: 28,
    salary: 6200,
    expenses: 4200,
    savings: 15000,
    investments: 5000,
    debt: 0,
    assets: 0,
  },
  {
    name: "Freelance Gig Contractor",
    description: "Variable monthly income, high expenses, and minimal safety net. Must focus on liquidity and building a robust cash cushion.",
    age: 25,
    salary: 4200,
    expenses: 3400,
    savings: 3000,
    investments: 1000,
    debt: 2500,
    assets: 0,
  }
];

const RANDOM_EVENTS = [
  {
    name: "Medical Emergency",
    description: "An unexpected dental surgery requires immediate attention.",
    impactType: "expense",
    impactValue: 3000,
    message: "Ouch! A medical emergency costs you $3,000 out of pocket."
  },
  {
    name: "Market Correction",
    description: "Stock market experiences a sudden 20% correction.",
    impactType: "market_crash",
    impactValue: 0.20,
    message: "Market Dip: Your index funds drop by 20% value."
  },
  {
    name: "Company Bonus",
    description: "Your team outperforms, yielding a one-time cash award.",
    impactType: "windfall",
    impactValue: 4000,
    message: "Windfall! You receive a performance bonus of $4,000 cash."
  },
  {
    name: "Stock Market Rally",
    description: "Tech sector earnings push equities up significantly.",
    impactType: "market_boom",
    impactValue: 0.25,
    message: "Market Boom! Your index funds gain 25% value."
  },
  {
    name: "Rent Spike",
    description: "Landlord increases your lease rate due to local demand.",
    impactType: "expense_increase",
    impactValue: 200,
    message: "Rent Hike: Your monthly expenses increase by $200."
  }
];

function getRandomModifier() {
  return (Math.random() * 0.3) - 0.1;
}

function getRandomEvent() {
  return RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
}

export default function SimulatorPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Simulation Game States
  const [isPlaying, setIsPlaying] = useState(false);
  const [presetName, setPresetName] = useState("");
  
  const [age, setAge] = useState(22);
  const [salary, setSalary] = useState(3200);
  const [expenses, setExpenses] = useState(2600);
  const [savings, setSavings] = useState(1000);
  const [investments, setInvestments] = useState(0);
  const [debt, setDebt] = useState(12000);
  const [assets, setAssets] = useState(0);

  // Asset Flags
  const [hasHouse, setHasHouse] = useState(false);
  const [investmentAllocation, setInvestmentAllocation] = useState(0); // % of savings to auto-invest annually

  // Outputs
  const [timeline, setTimeline] = useState<HistoryPoint[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [aiFeedback, setAiFeedback] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [lastAction, setLastAction] = useState("");
  const [dbScenarios, setDbScenarios] = useState<any[]>([]);
  const [completedScenarios, setCompletedScenarios] = useState<string[]>([]);

  // UI inputs
  const [investAmount, setInvestAmount] = useState(1000);
  const [debtPayoffAmount, setDebtPayoffAmount] = useState(1000);

  // Hydration safety check and load scenarios
  useEffect(() => {
    setMounted(true);

    const unsub = onSnapshot(collection(db, "simulator_scenarios"), (snap) => {
      const list: any[] = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setDbScenarios(list);
    }, (err) => {
      console.error("Simulator scenarios load error:", err);
    });

    return () => unsub();
  }, []);

  // Auth check
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Calculate Net Worth
  const netWorth = savings + investments + assets - debt;

  // Calculate Financial Health Score (0 - 100)
  const calculateHealthScore = () => {
    let score = 50;

    // Savings Rate (Income vs Expense margin)
    const monthlyMargin = salary - expenses;
    const savingsRate = salary > 0 ? (monthlyMargin / salary) * 100 : 0;
    if (savingsRate > 25) score += 15;
    else if (savingsRate > 10) score += 5;
    else if (savingsRate <= 0) score -= 15;

    // Liquidity Buffer (Emergency Fund)
    const monthsBuffer = expenses > 0 ? savings / expenses : 0;
    if (monthsBuffer >= 6) score += 15;
    else if (monthsBuffer >= 3) score += 8;
    else if (monthsBuffer < 1) score -= 10;

    // Debt to Net Worth Ratio
    if (debt === 0) {
      score += 15;
    } else {
      const debtRatio = netWorth !== 0 ? debt / Math.abs(netWorth) : 2;
      if (debtRatio < 0.2) score += 10;
      else if (debtRatio > 1) score -= 15;
    }

    // Investment Exposure
    if (investments > 5000) score += 5;

    return Math.min(Math.max(score, 5), 100);
  };

  const healthScore = calculateHealthScore();

  // Synchronize simulation metrics to localStorage for dashboard real-time updates
  useEffect(() => {
    if (typeof window !== "undefined" && isPlaying) {
      localStorage.setItem("finverse_sim_net_worth", String(netWorth));
      // Map 0-100 healthScore to a credit score between 300 and 850
      const calculatedCreditScore = Math.round(300 + (healthScore / 100) * 550);
      localStorage.setItem("finverse_sim_credit_score", String(calculatedCreditScore));
    }
  }, [netWorth, healthScore, isPlaying]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground text-sm">Loading simulator...</p>
        </div>
      </div>
    );
  }

  // Load Preset
  const handleLoadPreset = (preset: typeof PRESETS[0]) => {
    setPresetName(preset.name);
    setAge(preset.age);
    setSalary(preset.salary);
    setExpenses(preset.expenses);
    setSavings(preset.savings);
    setInvestments(preset.investments);
    setDebt(preset.debt);
    setAssets(preset.assets);
    setHasHouse(false);
    setInvestmentAllocation(0);
    
    const initialNet = preset.savings + preset.investments + preset.assets - preset.debt;
    const initialPoint = {
      age: preset.age,
      netWorth: initialNet,
      savings: preset.savings,
      investments: preset.investments,
      debt: preset.debt
    };
    
    setTimeline([initialPoint]);
    setLogs([`Initialized simulation: "${preset.name}". Net Worth: $${initialNet.toLocaleString()}`]);
    setAiFeedback("Select an action below to start modeling your financial lifecycle. Advancing years compounds your growth and interest rates.");
    setIsPlaying(true);
  };

  // Call Gemini for dynamic advice
  const triggerAiFeedback = async (actionDesc: string, updatedState: {
    age: number;
    salary: number;
    expenses: number;
    savings: number;
    investments: number;
    assets: number;
    debt: number;
  }) => {
    setLoadingAi(true);
    setLastAction(actionDesc);

    try {
      const prompt = `You are a financial advisor AI. The user is playing a life simulator and just did this action: "${actionDesc}".
Here is their current state:
- Age: ${updatedState.age}
- Monthly Salary: $${updatedState.salary}
- Monthly Expenses: $${updatedState.expenses}
- Cash Savings: $${updatedState.savings}
- Stocks/Index Funds: $${updatedState.investments}
- Assets (e.g. house value): $${updatedState.assets}
- Debt: $${updatedState.debt}
- Net Worth: $${updatedState.savings + updatedState.investments + updatedState.assets - updatedState.debt}

Write a short, 2-3 sentence analysis of this choice. Explain its long-term benefits or potential risks. Keep the tone conversational, concise, and educational.`;

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

      if (data.text.includes("[Demo Mode]")) {
        // Fallback demo insights
        setAiFeedback(getDemoFeedback(actionDesc, updatedState));
      } else {
        setAiFeedback(data.text);
      }
    } catch (err) {
      console.error(err);
      setAiFeedback(getDemoFeedback(actionDesc, updatedState));
    } finally {
      setLoadingAi(false);
    }
  };

  // High-fidelity fallback generator for Offline/Demo Mode
  const getDemoFeedback = (action: string, state: any) => {
    const computedNet = state.savings + state.investments + state.assets - state.debt;
    if (action.includes("Advance Year")) {
      if (state.salary - state.expenses <= 0) {
        return "Warning: Your annual expenses exceed or match your salary. You are not saving any money. Consider cutting monthly costs or finding ways to boost your salary.";
      }
      return `Annual cycle complete. Your net worth is now $${computedNet.toLocaleString()}. Compounding index funds and regular savings are contributing to your long-term wealth. Keep it up!`;
    }
    if (action.includes("Buy House")) {
      return `Congratulations on buying a home! While mortgage debt of $200,000 has been added, you now own a $220,000 asset. Note that your monthly expenses increased by $1,200, which reduces your savings rate. Make sure to rebuild your cash buffer.`;
    }
    if (action.includes("Stocks")) {
      return `You allocated cash to equity index funds. This is a smart choice to build compound returns over inflation, but keep in mind stocks can be volatile. Ensure you still maintain at least 3-6 months of expenses in cash.`;
    }
    if (action.includes("Promotion")) {
      return `Great career move! Investing $5,000 in your skills secured a 20% salary increase. This raises your monthly savings capacity from here on out, making other goals like investing or housing much safer.`;
    }
    if (action.includes("Pay Debt")) {
      return `Paying off high-interest debt is a guaranteed return on investment. By reducing your debt balance, you lower interest accrual and improve your debt-to-income ratio, making your net worth much healthier.`;
    }
    if (action.includes("Random Event")) {
      return `A random event occurred. Life is full of unpredictable surprises, highlighting why a solid emergency fund (liquid cash savings) is absolutely crucial to shield you from debt traps.`;
    }
    return "Your financial parameters look steady. Keep managing your cash reserves and look for opportunities to invest your surplus into compound accounts.";
  };

  // Game action: Advance 1 Year
  const handleAdvanceYear = () => {
    const nextAge = age + 1;
    const monthlyMargin = salary - expenses;
    const annualCashSavings = monthlyMargin * 12;

    // Apply auto-investment allocation
    let newCashSavings = savings + annualCashSavings;
    let newInvestments = investments;
    
    if (investmentAllocation > 0 && annualCashSavings > 0) {
      const investPortion = Math.round(annualCashSavings * (investmentAllocation / 100));
      if (newCashSavings >= investPortion) {
        newCashSavings -= investPortion;
        newInvestments += investPortion;
      }
    }

    // Compound Investments (index fund average return 8% with some volatility)
    const randomModifier = getRandomModifier(); // -10% to +20%
    newInvestments = Math.round(newInvestments * (1 + 0.08 + (randomModifier / 2)));

    // Compound Debt (Interest rate e.g., 5% on debt)
    let newDebt = debt;
    if (debt > 0) {
      newDebt = Math.round(debt * 1.05);
    }

    const nextNet = newCashSavings + newInvestments + assets - newDebt;

    // Update States
    setAge(nextAge);
    setSavings(newCashSavings);
    setInvestments(newInvestments);
    setDebt(newDebt);

    // Save history
    const nextPoint = {
      age: nextAge,
      netWorth: nextNet,
      savings: newCashSavings,
      investments: newInvestments,
      debt: newDebt
    };
    setTimeline((prev) => [...prev, nextPoint]);

    // Log
    const marginStr = monthlyMargin >= 0 
      ? `added $${(monthlyMargin * 12).toLocaleString()} to savings`
      : `drew $${Math.abs(monthlyMargin * 12).toLocaleString()} from savings to cover expenses`;
    
    setLogs((prev) => [
      `Year ${nextAge}: Age advanced. You ${marginStr}. Index funds grew to $${newInvestments.toLocaleString()}. Debt accrued 5% interest.`,
      ...prev
    ]);

    triggerAiFeedback("Advance Year", {
      age: nextAge,
      salary,
      expenses,
      savings: newCashSavings,
      investments: newInvestments,
      assets,
      debt: newDebt
    });
  };

  // Game Action: Invest in Stocks
  const handleInvestInStocks = () => {
    if (investAmount <= 0 || savings < investAmount) return;

    const newSavings = savings - investAmount;
    const newInvestments = investments + investAmount;

    setSavings(newSavings);
    setInvestments(newInvestments);

    const nextNet = newSavings + newInvestments + assets - debt;
    updateTimelinePoint(nextNet, newSavings, newInvestments, debt);

    setLogs((prev) => [
      `Transferred $${investAmount.toLocaleString()} from liquid savings to stock index funds.`,
      ...prev
    ]);

    triggerAiFeedback("Invest in Stocks", {
      age,
      salary,
      expenses,
      savings: newSavings,
      investments: newInvestments,
      assets,
      debt
    });
  };

  // Game Action: Pay Off Debt
  const handlePayOffDebt = () => {
    if (debtPayoffAmount <= 0 || savings < debtPayoffAmount || debt <= 0) return;

    const payment = Math.min(debtPayoffAmount, debt);
    const newSavings = savings - payment;
    const newDebt = debt - payment;

    setSavings(newSavings);
    setDebt(newDebt);

    const nextNet = newSavings + investments + assets - newDebt;
    updateTimelinePoint(nextNet, newSavings, investments, newDebt);

    setLogs((prev) => [
      `Paid off $${payment.toLocaleString()} of outstanding debt using cash savings.`,
      ...prev
    ]);

    triggerAiFeedback("Pay Debt", {
      age,
      salary,
      expenses,
      savings: newSavings,
      investments,
      assets,
      debt: newDebt
    });
  };

  // Game Action: Buy House
  const handleBuyHouse = () => {
    const downPayment = 30000;
    if (savings < downPayment || hasHouse) return;

    const newSavings = savings - downPayment;
    const newDebt = debt + 200000; // Mortgage debt
    const newAssets = assets + 220000; // House value
    const newExpenses = expenses + 1200; // Added monthly mortgage bill

    setSavings(newSavings);
    setDebt(newDebt);
    setAssets(newAssets);
    setExpenses(newExpenses);
    setHasHouse(true);

    const nextNet = newSavings + investments + newAssets - newDebt;
    updateTimelinePoint(nextNet, newSavings, investments, newDebt);

    setLogs((prev) => [
      `Purchased residential property. Spent $30,000 down payment. Mortgaged $200,000. Expenses increased by $1,200/mo.`,
      ...prev
    ]);

    triggerAiFeedback("Buy House", {
      age,
      salary,
      expenses: newExpenses,
      savings: newSavings,
      investments,
      assets: newAssets,
      debt: newDebt
    });
  };

  // Game Action: Promotion / Upskilling
  const handleUpskill = () => {
    const cost = 5000;
    if (savings < cost) return;

    const newSavings = savings - cost;
    const newSalary = Math.round(salary * 1.20); // 20% raise

    setSavings(newSavings);
    setSalary(newSalary);

    const nextNet = newSavings + investments + assets - debt;
    updateTimelinePoint(nextNet, newSavings, investments, debt);

    setLogs((prev) => [
      `Completed career training ($5,000 cost). Promoted! Monthly salary increased by 20% to $${newSalary.toLocaleString()}.`,
      ...prev
    ]);

    triggerAiFeedback("Career Promotion", {
      age,
      salary: newSalary,
      expenses,
      savings: newSavings,
      investments,
      assets,
      debt
    });
  };

  const handleResolveScenario = (sc: any, choiceIdx: number) => {
    const choice = sc.choices[choiceIdx];
    const eff = choice.effect;
    
    // Apply changes
    const newSavings = Math.max(0, savings + (eff.savings || 0));
    const newInvestments = Math.max(0, investments + (eff.investments || 0));
    const newDebt = Math.max(0, debt + (eff.debt || 0));
    const newAssets = Math.max(0, assets + (eff.assets || 0));

    setSavings(newSavings);
    setInvestments(newInvestments);
    setDebt(newDebt);
    setAssets(newAssets);

    const nextNet = newSavings + newInvestments + newAssets - newDebt;
    updateTimelinePoint(nextNet, newSavings, newInvestments, newDebt);

    // Save to completed
    setCompletedScenarios((prev) => [...prev, sc.id]);

    // Log
    setLogs((prev) => [
      `DECISION: Resolved scenario "${sc.title}". Chosen: "${choice.text}". ${choice.consequence}`,
      ...prev
    ]);

    // Trigger AI Advice
    triggerAiFeedback(`Resolved Scenario: ${sc.title}`, {
      age,
      salary,
      expenses,
      savings: newSavings,
      investments: newInvestments,
      assets: newAssets,
      debt: newDebt
    });
  };

  // Game Action: Trigger Life Event
  const handleTriggerEvent = () => {
    const event = getRandomEvent();
    let newSavings = savings;
    let newInvestments = investments;
    let newExpenses = expenses;

    if (event.impactType === "expense") {
      newSavings = Math.max(0, savings - event.impactValue);
    } else if (event.impactType === "windfall") {
      newSavings = savings + event.impactValue;
    } else if (event.impactType === "expense_increase") {
      newExpenses = expenses + event.impactValue;
    } else if (event.impactType === "market_crash") {
      newInvestments = Math.round(investments * (1 - event.impactValue));
    } else if (event.impactType === "market_boom") {
      newInvestments = Math.round(investments * (1 + event.impactValue));
    }

    setSavings(newSavings);
    setInvestments(newInvestments);
    setExpenses(newExpenses);

    const nextNet = newSavings + newInvestments + assets - debt;
    updateTimelinePoint(nextNet, newSavings, newInvestments, debt);

    setLogs((prev) => [
      `EVENT: ${event.message}`,
      ...prev
    ]);

    triggerAiFeedback(`Random Event: ${event.name}`, {
      age,
      salary,
      expenses: newExpenses,
      savings: newSavings,
      investments: newInvestments,
      assets,
      debt
    });
  };

  const updateTimelinePoint = (net: number, sav: number, inv: number, deb: number) => {
    setTimeline((prev) => {
      const copy = [...prev];
      if (copy.length > 0) {
        copy[copy.length - 1] = {
          age,
          netWorth: net,
          savings: sav,
          investments: inv,
          debt: deb
        };
      }
      return copy;
    });
  };

  return (
    <div className="relative min-h-screen bg-background p-6 md:p-12">
      {/* Background glow effects */}
      <div className="absolute top-0 left-0 -z-10 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
      <div className="absolute bottom-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[120px]" />

      <div className="mx-auto max-w-7xl space-y-8">
        {/* Navigation header */}
        <div className="space-y-1">
          <Link href="/dashboard" className="inline-flex items-center text-xs text-muted-foreground hover:text-primary mb-2 gap-1 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Financial Life Simulator</h1>
              <p className="text-muted-foreground text-sm">Model critical career, housing, and investment decisions in a risk-free sandbox game.</p>
            </div>
            <div className="inline-flex items-center space-x-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs text-emerald-400 shrink-0">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>Phase 3 Activated</span>
            </div>
          </div>
        </div>

        {!isPlaying ? (
          /* Set Up Preset Starting Paths */
          <div className="max-w-4xl mx-auto space-y-6 pt-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Choose a Starting Path</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">Select one of our financial sandbox presets to initialize your simulated timeline and start making decisions.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {PRESETS.map((preset, idx) => (
                <Card key={idx} className="glass-card border border-border/50 overflow-hidden flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300 group">
                  <CardHeader className="p-6 pb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                        {idx === 0 ? <AlertTriangle className="h-4 w-4" /> : idx === 1 ? <Award className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                      </div>
                      <span className="font-bold text-base text-foreground">{preset.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed min-h-[50px]">{preset.description}</p>
                  </CardHeader>
                  <CardContent className="p-6 pt-2 text-xs space-y-2">
                    <div className="flex justify-between border-b border-border/20 py-1.5">
                      <span className="text-muted-foreground">Starting Age</span>
                      <span className="font-bold">{preset.age} years</span>
                    </div>
                    <div className="flex justify-between border-b border-border/20 py-1.5">
                      <span className="text-muted-foreground">Monthly Salary</span>
                      <span className="font-bold text-emerald-400">${preset.salary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/20 py-1.5">
                      <span className="text-muted-foreground">Monthly Expenses</span>
                      <span className="font-bold">${preset.expenses.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/20 py-1.5">
                      <span className="text-muted-foreground">Savings (Cash)</span>
                      <span className="font-bold">${preset.savings.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Outstanding Debt</span>
                      <span className={`font-bold ${preset.debt > 0 ? "text-red-400" : ""}`}>${preset.debt.toLocaleString()}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 pt-0">
                    <Button 
                      onClick={() => handleLoadPreset(preset)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-9 text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      Initialize Path <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* Active Simulation Dashboard */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Dashboard metrics and Controls */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Quick Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="glass-card border border-border/40 p-4 relative overflow-hidden">
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase">Net Worth</div>
                  <div className={`text-xl font-bold mt-1 ${netWorth >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    ${netWorth.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-muted-foreground mt-2">Savings + Investments - Debt</div>
                </Card>

                <Card className="glass-card border border-border/40 p-4">
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase">Cash Savings</div>
                  <div className="text-xl font-bold text-foreground mt-1">${savings.toLocaleString()}</div>
                  <div className="text-[9px] text-muted-foreground mt-2">Liquid Emergency Fund</div>
                </Card>

                <Card className="glass-card border border-border/40 p-4">
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase">Stock Investments</div>
                  <div className="text-xl font-bold text-blue-400 mt-1">${investments.toLocaleString()}</div>
                  <div className="text-[9px] text-muted-foreground mt-2">Index Funds (Compound Assets)</div>
                </Card>

                <Card className="glass-card border border-border/40 p-4">
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase">Outstanding Debt</div>
                  <div className={`text-xl font-bold mt-1 ${debt > 0 ? "text-red-400" : "text-foreground"}`}>
                    ${debt.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-muted-foreground mt-2">5% Compound Interest Rate</div>
                </Card>
              </div>

              {/* Chart Projections */}
              <Card className="glass-card border border-border/50 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-border/30 pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                    <div>
                      <h3 className="font-bold text-sm">Financial Timeline Projection</h3>
                      <p className="text-[10px] text-muted-foreground">Historical progression of your Net Worth and Debt over time</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Net Worth</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" /> Debt</span>
                  </div>
                </div>

                <div className="w-full">
                  {mounted && timeline.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <AreaChart data={timeline}>
                        <defs>
                          <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorDebt" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis 
                          dataKey="age" 
                          stroke="#888888" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                          label={{ value: "Simulated Age (Years)", position: "insideBottom", offset: -5, fill: "#888888", fontSize: 9 }}
                        />
                        <YAxis 
                          stroke="#888888" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} 
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: "rgba(20, 20, 20, 0.85)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "10px", fontSize: "11px" }}
                          labelFormatter={(v) => `Age: ${v}`}
                        />
                        <Area type="monotone" dataKey="netWorth" name="Net Worth" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorNet)" />
                        <Area type="monotone" dataKey="debt" name="Debt" stroke="#ef4444" strokeWidth={1.5} fillOpacity={1} fill="url(#colorDebt)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[260px] flex items-center justify-center text-xs text-muted-foreground">Initializing chart...</div>
                  )}
                </div>
              </Card>

              {/* Action sandbox grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Regular Life Operations */}
                <Card className="glass-card border border-border/50 p-6 space-y-4">
                  <h4 className="font-bold text-sm flex items-center gap-2 border-b border-border/40 pb-2">
                    <Calendar className="h-4.5 w-4.5 text-emerald-500" />
                    Simulated Life Actions
                  </h4>

                  <div className="space-y-4 pt-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold">Advance 1 Year</div>
                        <p className="text-[10px] text-muted-foreground">Accrues yearly income, incurs expenses, compounds stock returns.</p>
                      </div>
                      <Button 
                        onClick={handleAdvanceYear} 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-9 px-4 text-xs font-semibold"
                      >
                        Advance +1 Year
                      </Button>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/20 pt-4">
                      <div>
                        <div className="text-xs font-bold">Trigger Random Event</div>
                        <p className="text-[10px] text-muted-foreground">Test emergency reserves with random bonuses or layoffs.</p>
                      </div>
                      <Button 
                        onClick={handleTriggerEvent} 
                        variant="outline" 
                        className="rounded-lg h-9 px-4 text-xs font-semibold"
                      >
                        Test Unpredictability
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Investment & Debt payoff sliders */}
                <Card className="glass-card border border-border/50 p-6 space-y-4">
                  <h4 className="font-bold text-sm flex items-center gap-2 border-b border-border/40 pb-2">
                    <DollarSign className="h-4.5 w-4.5 text-blue-500" />
                    Capital Allocation
                  </h4>

                  <div className="space-y-4">
                    {/* Invest in index funds */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-medium">
                        <span>Invest in Stocks</span>
                        <span className="text-blue-400 font-bold">${investAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="range"
                          min="500"
                          max={Math.max(500, savings)}
                          step="500"
                          value={investAmount}
                          onChange={(e) => setInvestAmount(Number(e.target.value))}
                          disabled={savings < 500}
                          className="w-full accent-blue-500 cursor-pointer"
                        />
                        <Button
                          onClick={handleInvestInStocks}
                          disabled={savings < investAmount || investAmount <= 0}
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-7 px-2.5 text-[10px]"
                        >
                          Invest
                        </Button>
                      </div>
                    </div>

                    {/* Pay down debt */}
                    <div className="space-y-2 border-t border-border/20 pt-3">
                      <div className="flex justify-between text-xs font-medium">
                        <span>Pay Down Debt</span>
                        <span className="text-red-400 font-bold">${debtPayoffAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="range"
                          min="500"
                          max={Math.max(500, Math.min(savings, debt))}
                          step="500"
                          value={debtPayoffAmount}
                          onChange={(e) => setDebtPayoffAmount(Number(e.target.value))}
                          disabled={savings < 500 || debt === 0}
                          className="w-full accent-red-500 cursor-pointer"
                        />
                        <Button
                          onClick={handlePayOffDebt}
                          disabled={savings < debtPayoffAmount || debtPayoffAmount <= 0 || debt === 0}
                          className="bg-red-600 hover:bg-red-700 text-white rounded-lg h-7 px-2.5 text-[10px]"
                        >
                          Repay
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Major Decisions Sandbox */}
                <Card className="glass-card border border-border/50 p-6 space-y-4 md:col-span-2">
                  <h4 className="font-bold text-sm flex items-center gap-2 border-b border-border/40 pb-2">
                    <Briefcase className="h-4.5 w-4.5 text-purple-500" />
                    Major Life Decisions
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="text-xs font-bold flex items-center gap-1">
                          <Home className="h-4 w-4 text-emerald-500" />
                          Purchase Real Estate
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-normal">
                          Requires $30,000 down payment. Mortgages $200,000. Adds $220,000 house asset value. Monthly expense increases by $1,200 (mortgage charges).
                        </p>
                      </div>
                      <Button 
                        onClick={handleBuyHouse} 
                        disabled={savings < 30000 || hasHouse} 
                        className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg h-9 px-4 text-xs font-semibold shrink-0"
                      >
                        {hasHouse ? "Owned" : "Buy House"}
                      </Button>
                    </div>

                    <div className="flex items-start justify-between gap-4 border-t sm:border-t-0 sm:border-l border-border/20 pt-4 sm:pt-0 sm:pl-6">
                      <div className="space-y-1">
                        <div className="text-xs font-bold flex items-center gap-1">
                          <Award className="h-4 w-4 text-amber-500" />
                          Upskilling & Promotion
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-normal">
                          Spend $5,000 on a certifications or degree to permanently increase your monthly salary by 20%.
                        </p>
                      </div>
                      <Button 
                        onClick={handleUpskill} 
                        disabled={savings < 5000} 
                        className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg h-9 px-4 text-xs font-semibold shrink-0"
                      >
                        Upskill
                      </Button>
                    </div>
                  </div>
                </Card>

                {dbScenarios.filter(sc => !completedScenarios.includes(sc.id)).length > 0 && (
                  <Card className="glass-card border border-border/50 p-6 space-y-4 md:col-span-2">
                    <h4 className="font-bold text-sm flex items-center gap-2 border-b border-border/40 pb-2">
                      <Sparkles className="h-4.5 w-4.5 text-primary animate-pulse" />
                      <span>Admin Published Scenarios</span>
                    </h4>

                    <div className="space-y-6">
                      {dbScenarios.filter(sc => !completedScenarios.includes(sc.id)).map((sc) => (
                        <div key={sc.id} className="p-4 border border-border/40 bg-muted/5 rounded-xl space-y-3">
                          <div className="flex justify-between items-center">
                            <h5 className="font-bold text-xs uppercase text-purple-400">{sc.title}</h5>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-muted border border-border/40 text-muted-foreground">{sc.difficulty}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">{sc.story}</p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            {sc.choices?.map((choice: any, idx: number) => (
                              <Button
                                key={idx}
                                onClick={() => handleResolveScenario(sc, idx)}
                                variant="outline"
                                className="h-auto p-3 text-left border-border text-xs rounded-xl flex flex-col items-start gap-1 justify-start hover:bg-primary/5 hover:border-primary/20"
                              >
                                <span className="font-bold text-primary">{choice.text}</span>
                                <span className="text-[9px] text-muted-foreground leading-normal">{choice.consequence}</span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </div>

            {/* Right Column: Parameters and AI Advice */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Financial Health Score Meter */}
              <Card className="glass-card border border-border/50 p-6 space-y-4">
                <div className="text-center space-y-1.5">
                  <div className="text-xs font-bold text-muted-foreground">FINANCIAL HEALTH SCORE</div>
                  <div className="text-4xl font-extrabold text-emerald-400 font-mono">{healthScore}</div>
                  <Progress value={healthScore} className="h-2 mt-2" />
                </div>
                
                <div className="text-[10px] text-muted-foreground space-y-2 border-t border-border/20 pt-3 leading-relaxed">
                  <div className="flex justify-between">
                    <span>Active Preset</span>
                    <span className="font-semibold text-foreground truncate max-w-[120px]">{presetName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Simulated Age</span>
                    <span className="font-semibold text-foreground">{age} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Salary</span>
                    <span className="font-semibold text-emerald-400">${salary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Expenses</span>
                    <span className="font-semibold text-foreground">${expenses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-border/20 pt-2 font-semibold">
                    <span>Monthly Savings Margin</span>
                    <span className={salary - expenses >= 0 ? "text-emerald-400" : "text-red-400"}>
                      ${(salary - expenses).toLocaleString()}
                    </span>
                  </div>
                </div>
              </Card>

              {/* AI Advice Panel */}
              <Card className="glass-card border border-border/50 p-6 space-y-4 relative overflow-hidden bg-gradient-to-b from-purple-950/10 to-background/50">
                <div className="flex items-center gap-1.5 border-b border-border/30 pb-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <h4 className="font-bold text-xs">AI Planner Consequence Feedback</h4>
                </div>
                
                <div className="min-h-[100px] flex flex-col justify-center">
                  {loadingAi ? (
                    <div className="flex flex-col items-center justify-center space-y-2 py-4">
                      <RefreshCw className="h-6 w-6 text-purple-400 animate-spin" />
                      <span className="text-[10px] text-muted-foreground">AI is calculating trade-offs...</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {lastAction && (
                        <span className="inline-block text-[9px] px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 uppercase font-semibold">
                          Action: {lastAction}
                        </span>
                      )}
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {aiFeedback}
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Action Log panel */}
              <Card className="glass-card border border-border/50 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-border/30 pb-2">
                  <span className="font-bold text-xs">Simulation Logs</span>
                  <button 
                    onClick={() => {
                      setIsPlaying(false);
                      setLogs([]);
                      setTimeline([]);
                    }}
                    className="text-[10px] text-muted-foreground hover:text-red-400 transition-colors flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" /> Reset Path
                  </button>
                </div>
                
                <div className="max-h-[160px] overflow-y-auto pr-1 text-[10px] text-muted-foreground font-mono space-y-2 scrollbar-thin">
                  {logs.map((log, idx) => (
                    <div key={idx} className="border-b border-border/10 pb-1.5 leading-normal">
                      <span className="text-emerald-500">▶</span> {log}
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="text-center py-6">No event logs recorded.</div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
