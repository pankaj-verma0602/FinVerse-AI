"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  collection, 
  addDoc, 
  setDoc, 
  deleteDoc, 
  doc, 
  onSnapshot 
} from "firebase/firestore";
import { db } from "@/firebase/config";
import {
  PlayCircle,
  Plus,
  Trash2,
  Edit,
  Sparkles
} from "lucide-react";

interface ScenarioChoice {
  text: string;
  effect: {
    savings: number;
    investments: number;
    assets: number;
    debt: number;
    health: number;
  };
  consequence: string;
}

interface ScenarioDoc {
  id: string;
  title: string;
  story: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  choices: ScenarioChoice[];
  createdAt: string;
}

export default function AdminSimulatorScenariosPage() {
  const [scenarios, setScenarios] = useState<ScenarioDoc[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  
  // Option 1 Form Fields
  const [opt1Text, setOpt1Text] = useState("");
  const [opt1Savings, setOpt1Savings] = useState(0);
  const [opt1Debt, setOpt1Debt] = useState(0);
  const [opt1Health, setOpt1Health] = useState(0);
  const [opt1Consequence, setOpt1Consequence] = useState("");

  // Option 2 Form Fields
  const [opt2Text, setOpt2Text] = useState("");
  const [opt2Savings, setOpt2Savings] = useState(0);
  const [opt2Debt, setOpt2Debt] = useState(0);
  const [opt2Health, setOpt2Health] = useState(0);
  const [opt2Consequence, setOpt2Consequence] = useState("");

  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  useEffect(() => {
    // Listen to real-time simulator scenarios
    const unsub = onSnapshot(collection(db, "simulator_scenarios"), (snap) => {
      const docsList: ScenarioDoc[] = [];
      snap.forEach((docSnap) => {
        docsList.push({
          id: docSnap.id,
          ...docSnap.data()
        } as ScenarioDoc);
      });
      docsList.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setScenarios(docsList);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const triggerAlert = (text: string) => {
    setAlertMsg(text);
    setTimeout(() => setAlertMsg(null), 3000);
  };

  const handleAddNew = () => {
    setActiveScenarioId(null);
    setIsEditing(true);
    setTitle("");
    setStory("");
    setDifficulty("Beginner");
    
    setOpt1Text("");
    setOpt1Savings(0);
    setOpt1Debt(0);
    setOpt1Health(0);
    setOpt1Consequence("");

    setOpt2Text("");
    setOpt2Savings(0);
    setOpt2Debt(0);
    setOpt2Health(0);
    setOpt2Consequence("");
  };

  const handleSelectScenario = (item: ScenarioDoc) => {
    setActiveScenarioId(item.id);
    setIsEditing(false);
    setTitle(item.title);
    setStory(item.story);
    setDifficulty(item.difficulty);

    if (item.choices && item.choices.length >= 2) {
      const c1 = item.choices[0];
      setOpt1Text(c1.text);
      setOpt1Savings(c1.effect.savings);
      setOpt1Debt(c1.effect.debt);
      setOpt1Health(c1.effect.health);
      setOpt1Consequence(c1.consequence);

      const c2 = item.choices[1];
      setOpt2Text(c2.text);
      setOpt2Savings(c2.effect.savings);
      setOpt2Debt(c2.effect.debt);
      setOpt2Health(c2.effect.health);
      setOpt2Consequence(c2.consequence);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !story.trim()) return;

    const choices: ScenarioChoice[] = [
      {
        text: opt1Text || "Option 1",
        effect: {
          savings: Number(opt1Savings),
          investments: 0,
          assets: 0,
          debt: Number(opt1Debt),
          health: Number(opt1Health)
        },
        consequence: opt1Consequence || "You made choice 1."
      },
      {
        text: opt2Text || "Option 2",
        effect: {
          savings: Number(opt2Savings),
          investments: 0,
          assets: 0,
          debt: Number(opt2Debt),
          health: Number(opt2Health)
        },
        consequence: opt2Consequence || "You made choice 2."
      }
    ];

    const scenarioData = {
      title,
      story,
      difficulty,
      choices,
      updatedAt: new Date().toISOString()
    };

    try {
      if (activeScenarioId) {
        await setDoc(doc(db, "simulator_scenarios", activeScenarioId), scenarioData, { merge: true });
        triggerAlert("Scenario updated successfully!");
      } else {
        const newDoc = await addDoc(collection(db, "simulator_scenarios"), {
          ...scenarioData,
          createdAt: new Date().toISOString()
        });
        setActiveScenarioId(newDoc.id);
      }
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      triggerAlert("Error saving simulator scenario.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this scenario? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "simulator_scenarios", id));
      triggerAlert("Scenario deleted successfully!");
      handleAddNew();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/20 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            Simulator Management <PlayCircle className="h-6 w-6 text-primary" />
          </h1>
          <p className="text-muted-foreground text-sm">
            Deploy dynamic scenario prompts and consequences to the Financial Life Simulator.
          </p>
        </div>
        <Button onClick={handleAddNew} className="bg-primary text-white hover:bg-primary/90 h-10 px-4 rounded-xl flex items-center gap-2 font-bold text-xs">
          <Plus className="h-4 w-4" /> Add New Scenario
        </Button>
      </div>

      {alertMsg && (
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-xs font-semibold text-primary animate-pulse">
          {alertMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Scenarios List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold text-md mb-2">Simulated Scenarios</h3>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin">
            {scenarios.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground py-8 border border-dashed border-border/40 rounded-xl">
                No simulator scenarios configured.
              </div>
            ) : (
              scenarios.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectScenario(item)}
                  className={`w-full text-left border p-4 transition-all rounded-xl cursor-pointer ${
                    activeScenarioId === item.id
                      ? "glass-card border-primary bg-primary/10 shadow-md shadow-primary/5"
                      : "glass-card border-border/60 hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-muted border border-border/40 text-muted-foreground">
                      {item.difficulty}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm">{item.title}</h4>
                  <p className="text-[10px] text-muted-foreground mt-1 truncate">{item.story}</p>
                  
                  <div className="flex justify-end mt-2 pt-2 border-t border-border/25">
                    <Button
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Detail / Edit Form */}
        <div className="lg:col-span-2">
          {isEditing || !activeScenarioId ? (
            <Card className="glass-card border border-border/50 p-6 md:p-8 space-y-6">
              <h3 className="font-bold text-lg border-b border-border/20 pb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                {activeScenarioId ? "Edit Scenario" : "Create New Scenario"}
              </h3>
              
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Scenario Title</Label>
                    <Input 
                      placeholder="e.g. Purchase Your First Car" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      required 
                      className="h-10 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Difficulty</Label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Scenario Story Intro</Label>
                  <textarea
                    placeholder="Enter the backstory situation text to prompt the user..."
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    rows={4}
                    required
                    className="w-full rounded-xl border border-input bg-background p-4 text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                {/* Choice 1 Option */}
                <div className="border border-border/40 p-5 rounded-xl space-y-4 bg-muted/5">
                  <span className="text-[10px] font-bold text-blue-400 block uppercase">Choice Option 1 Configuration</span>
                  <div className="space-y-2">
                    <Label className="text-xs">Button Text</Label>
                    <Input 
                      placeholder="e.g. Buy a used sedan with cash ($5,000)" 
                      value={opt1Text} 
                      onChange={(e) => setOpt1Text(e.target.value)} 
                      className="h-9 text-xs rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[10px]">Savings Impact ($)</Label>
                      <Input type="number" value={opt1Savings} onChange={(e) => setOpt1Savings(Number(e.target.value))} className="h-8 text-xs rounded" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">Debt Impact ($)</Label>
                      <Input type="number" value={opt1Debt} onChange={(e) => setOpt1Debt(Number(e.target.value))} className="h-8 text-xs rounded" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">Health / Wellness Score Impact (-10 to 10)</Label>
                      <Input type="number" value={opt1Health} onChange={(e) => setOpt1Health(Number(e.target.value))} className="h-8 text-xs rounded" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Choice Consequence Outcome Text</Label>
                    <textarea
                      placeholder="Explain what happened as a result of selecting this choice..."
                      value={opt1Consequence}
                      onChange={(e) => setOpt1Consequence(e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-input bg-background p-3 text-xs focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </div>

                {/* Choice 2 Option */}
                <div className="border border-border/40 p-5 rounded-xl space-y-4 bg-muted/5">
                  <span className="text-[10px] font-bold text-emerald-400 block uppercase">Choice Option 2 Configuration</span>
                  <div className="space-y-2">
                    <Label className="text-xs">Button Text</Label>
                    <Input 
                      placeholder="e.g. Finance a brand new sports car ($30,000 at 8% APR)" 
                      value={opt2Text} 
                      onChange={(e) => setOpt2Text(e.target.value)} 
                      className="h-9 text-xs rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[10px]">Savings Impact ($)</Label>
                      <Input type="number" value={opt2Savings} onChange={(e) => setOpt2Savings(Number(e.target.value))} className="h-8 text-xs rounded" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">Debt Impact ($)</Label>
                      <Input type="number" value={opt2Debt} onChange={(e) => setOpt2Debt(Number(e.target.value))} className="h-8 text-xs rounded" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">Health / Wellness Score Impact (-10 to 10)</Label>
                      <Input type="number" value={opt2Health} onChange={(e) => setOpt2Health(Number(e.target.value))} className="h-8 text-xs rounded" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Choice Consequence Outcome Text</Label>
                    <textarea
                      placeholder="Explain what happened as a result of selecting this choice..."
                      value={opt2Consequence}
                      onChange={(e) => setOpt2Consequence(e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-input bg-background p-3 text-xs focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-border/20">
                  {activeScenarioId && (
                    <Button 
                      type="button" 
                      onClick={() => setIsEditing(false)} 
                      variant="outline" 
                      className="border-border text-muted-foreground hover:bg-muted/40 h-10 px-6 rounded-xl text-xs font-bold"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button type="submit" className="bg-primary text-white hover:bg-primary/90 h-10 px-6 rounded-xl text-xs font-bold">
                    Save Scenario
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            /* View Details Panel */
            <Card className="glass-card border border-border/50 p-6 md:p-8 space-y-6">
              <div className="flex justify-between items-start border-b border-border/20 pb-4">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase">
                    {difficulty} Level
                  </span>
                  <h2 className="text-2xl font-black mt-2">{title}</h2>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setIsEditing(true)} className="bg-primary text-white hover:bg-primary/90 h-9 px-4 rounded-xl flex items-center gap-2 font-bold text-xs">
                    <Edit className="h-4 w-4" /> Edit Scenario
                  </Button>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <h4 className="font-bold text-muted-foreground uppercase text-[10px]">Scenario Background</h4>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{story}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 border border-border/40 bg-muted/5 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold text-blue-400 block uppercase">Choice 1: {opt1Text}</span>
                    <p className="text-[11px] text-muted-foreground italic">"{opt1Consequence}"</p>
                    <div className="text-[10px] pt-1 text-muted-foreground font-mono">
                      Effect: Savings: {opt1Savings} | Debt: {opt1Debt} | Health: {opt1Health}
                    </div>
                  </div>

                  <div className="p-4 border border-border/40 bg-muted/5 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold text-emerald-400 block uppercase">Choice 2: {opt2Text}</span>
                    <p className="text-[11px] text-muted-foreground italic">"{opt2Consequence}"</p>
                    <div className="text-[10px] pt-1 text-muted-foreground font-mono">
                      Effect: Savings: {opt2Savings} | Debt: {opt2Debt} | Health: {opt2Health}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
