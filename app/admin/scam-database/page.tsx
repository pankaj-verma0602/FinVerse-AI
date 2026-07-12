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
  ShieldAlert,
  Plus,
  Trash2,
  Edit,
  Sparkles
} from "lucide-react";

interface ScamDoc {
  id: string;
  title: string;
  description: string;
  riskLevel: "Low" | "Medium" | "High";
  keywords: string;
  sampleMessage: string;
  solution: string;
  createdAt: string;
}

export default function AdminScamDatabasePage() {
  const [scams, setScams] = useState<ScamDoc[]>([]);
  const [activeScamId, setActiveScamId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [riskLevel, setRiskLevel] = useState<"Low" | "Medium" | "High">("High");
  const [keywords, setKeywords] = useState("");
  const [sampleMessage, setSampleMessage] = useState("");
  const [solution, setSolution] = useState("");

  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  useEffect(() => {
    // Listen to real-time scam database templates
    const unsub = onSnapshot(collection(db, "scam_database"), (snap) => {
      const docsList: ScamDoc[] = [];
      snap.forEach((docSnap) => {
        docsList.push({
          id: docSnap.id,
          ...docSnap.data()
        } as ScamDoc);
      });
      docsList.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setScams(docsList);
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
    setActiveScamId(null);
    setIsEditing(true);
    setTitle("");
    setDescription("");
    setRiskLevel("High");
    setKeywords("");
    setSampleMessage("");
    setSolution("");
  };

  const handleSelectScam = (item: ScamDoc) => {
    setActiveScamId(item.id);
    setIsEditing(false);
    setTitle(item.title);
    setDescription(item.description);
    setRiskLevel(item.riskLevel);
    setKeywords(item.keywords);
    setSampleMessage(item.sampleMessage);
    setSolution(item.solution);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !sampleMessage.trim()) return;

    const scamData = {
      title,
      description,
      riskLevel,
      keywords,
      sampleMessage,
      solution,
      updatedAt: new Date().toISOString()
    };

    try {
      if (activeScamId) {
        await setDoc(doc(db, "scam_database", activeScamId), scamData, { merge: true });
        triggerAlert("Scam template updated successfully!");
      } else {
        const newDoc = await addDoc(collection(db, "scam_database"), {
          ...scamData,
          createdAt: new Date().toISOString()
        });
        setActiveScamId(newDoc.id);
      }
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      triggerAlert("Error saving scam template.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this scam? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "scam_database", id));
      triggerAlert("Scam template deleted successfully!");
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
            Scam Database <ShieldAlert className="h-6 w-6 text-primary" />
          </h1>
          <p className="text-muted-foreground text-sm">
            Configure risk trigger keywords, sample SMS/phishing texts, and protection solutions.
          </p>
        </div>
        <Button onClick={handleAddNew} className="bg-primary text-white hover:bg-primary/90 h-10 px-4 rounded-xl flex items-center gap-2 font-bold text-xs">
          <Plus className="h-4 w-4" /> Add New Scam
        </Button>
      </div>

      {alertMsg && (
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-xs font-semibold text-primary animate-pulse">
          {alertMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Scams List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold text-md mb-2">Configured Scams</h3>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin">
            {scams.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground py-8 border border-dashed border-border/40 rounded-xl">
                No scam templates defined.
              </div>
            ) : (
              scams.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectScam(item)}
                  className={`w-full text-left border p-4 transition-all rounded-xl cursor-pointer ${
                    activeScamId === item.id
                      ? "glass-card border-primary bg-primary/10 shadow-md shadow-primary/5"
                      : "glass-card border-border/60 hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      item.riskLevel === "High" 
                        ? "bg-red-500/10 border-red-500/20 text-red-400" 
                        : item.riskLevel === "Medium"
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    }`}>
                      {item.riskLevel} Risk
                    </span>
                  </div>
                  <h4 className="font-bold text-sm">{item.title}</h4>
                  <p className="text-[10px] text-muted-foreground mt-1 truncate">{item.description}</p>
                  
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
          {isEditing || !activeScamId ? (
            <Card className="glass-card border border-border/50 p-6 md:p-8 space-y-6">
              <h3 className="font-bold text-lg border-b border-border/20 pb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                {activeScamId ? "Edit Scam Template" : "Register New Threat Profile"}
              </h3>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Scam Title</Label>
                    <Input 
                      placeholder="e.g. Electricity Bill Cancellation Threat" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      required 
                      className="h-10 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Risk Level</Label>
                    <select
                      value={riskLevel}
                      onChange={(e) => setRiskLevel(e.target.value as any)}
                      className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Trigger Keywords (comma-separated)</Label>
                    <Input 
                      placeholder="e.g. electricity, discom, bill, disconnected, payment" 
                      value={keywords} 
                      onChange={(e) => setKeywords(e.target.value)} 
                      className="h-10 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Scam Mechanics (Description)</Label>
                  <textarea
                    placeholder="Enter the detailed explanation of how scammers deceive victims in this scenario..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-input bg-background p-4 text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Sample Mock Message Text (Will match Scanner inputs)</Label>
                  <textarea
                    placeholder="Copy-paste a typical SMS message template associated with this scam..."
                    value={sampleMessage}
                    onChange={(e) => setSampleMessage(e.target.value)}
                    rows={3}
                    required
                    className="w-full rounded-xl border border-input bg-background p-4 text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Resolution Steps (Action Plan)</Label>
                  <textarea
                    placeholder="Provide 3 lines of actionable steps to verify or avoid this scam safely..."
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-input bg-background p-4 text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-border/20">
                  {activeScamId && (
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
                    Save Scam Profile
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            /* View Details Panel */
            <Card className="glass-card border border-border/50 p-6 md:p-8 space-y-6">
              <div className="flex justify-between items-start border-b border-border/20 pb-4">
                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                    riskLevel === "High" 
                      ? "bg-red-500/10 border-red-500/20 text-red-400" 
                      : riskLevel === "Medium"
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  }`}>
                    {riskLevel} Threat Level
                  </span>
                  <h2 className="text-2xl font-black mt-2">{title}</h2>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setIsEditing(true)} className="bg-primary text-white hover:bg-primary/90 h-9 px-4 rounded-xl flex items-center gap-2 font-bold text-xs">
                    <Edit className="h-4 w-4" /> Edit Profile
                  </Button>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                {keywords && (
                  <div className="space-y-1">
                    <h4 className="font-bold text-muted-foreground uppercase text-[10px]">Configured Keywords</h4>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {keywords.split(",").map((k) => (
                        <span key={k} className="px-2 py-0.5 bg-muted text-[10px] border border-border/40 rounded">
                          {k.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-1 pt-2 border-t border-border/10">
                  <h4 className="font-bold text-muted-foreground uppercase text-[10px]">Description</h4>
                  <p className="text-muted-foreground leading-relaxed">{description}</p>
                </div>

                <div className="space-y-1 pt-2 border-t border-border/10 p-4 rounded-xl bg-red-500/5 border border-red-500/15">
                  <h4 className="font-bold text-red-400 uppercase text-[10px]">Example Mock Message Text</h4>
                  <p className="text-muted-foreground leading-relaxed font-mono text-[11px] whitespace-pre-wrap">{sampleMessage}</p>
                </div>

                {solution && (
                  <div className="space-y-1 pt-2 border-t border-border/10">
                    <h4 className="font-bold text-emerald-400 uppercase text-[10px]">Safety Action Plan</h4>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{solution}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
