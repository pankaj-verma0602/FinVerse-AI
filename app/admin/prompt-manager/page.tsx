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
  Terminal,
  Plus,
  Trash2,
  Edit,
  Sparkles
} from "lucide-react";

interface PromptDoc {
  id: string;
  moduleName: string;
  systemPrompt: string;
  userPromptTemplate: string;
  createdAt: string;
}

export default function AdminPromptManagerPage() {
  const [prompts, setPrompts] = useState<PromptDoc[]>([]);
  const [activePromptId, setActivePromptId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [moduleName, setModuleName] = useState("AI Money Mentor");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [userPromptTemplate, setUserPromptTemplate] = useState("");

  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  useEffect(() => {
    // Listen to real-time AI prompts
    const unsub = onSnapshot(collection(db, "ai_prompts"), (snap) => {
      const docsList: PromptDoc[] = [];
      snap.forEach((docSnap) => {
        docsList.push({
          id: docSnap.id,
          ...docSnap.data()
        } as PromptDoc);
      });
      docsList.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setPrompts(docsList);
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
    setActivePromptId(null);
    setIsEditing(true);
    setModuleName("AI Money Mentor");
    setSystemPrompt("");
    setUserPromptTemplate("");
  };

  const handleSelectPrompt = (item: PromptDoc) => {
    setActivePromptId(item.id);
    setIsEditing(false);
    setModuleName(item.moduleName);
    setSystemPrompt(item.systemPrompt);
    setUserPromptTemplate(item.userPromptTemplate);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!systemPrompt.trim()) return;

    const promptData = {
      moduleName,
      systemPrompt,
      userPromptTemplate,
      updatedAt: new Date().toISOString()
    };

    try {
      if (activePromptId) {
        await setDoc(doc(db, "ai_prompts", activePromptId), promptData, { merge: true });
        triggerAlert("AI Prompt configuration updated!");
      } else {
        const newDoc = await addDoc(collection(db, "ai_prompts"), {
          ...promptData,
          createdAt: new Date().toISOString()
        });
        setActivePromptId(newDoc.id);
      }
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      triggerAlert("Error saving AI prompt configuration.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this prompt template?")) return;
    try {
      await deleteDoc(doc(db, "ai_prompts", id));
      triggerAlert("AI Prompt configuration deleted!");
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
            AI Prompt Manager <Terminal className="h-6 w-6 text-primary" />
          </h1>
          <p className="text-muted-foreground text-sm">
            Tune system guidelines, formatting prompts, and instruction contexts for Gemini gateways.
          </p>
        </div>
        <Button onClick={handleAddNew} className="bg-primary text-white hover:bg-primary/90 h-10 px-4 rounded-xl flex items-center gap-2 font-bold text-xs">
          <Plus className="h-4 w-4" /> Add Prompt Preset
        </Button>
      </div>

      {alertMsg && (
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-xs font-semibold text-primary animate-pulse">
          {alertMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Prompts List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold text-md mb-2">Configured Prompts</h3>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin">
            {prompts.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground py-8 border border-dashed border-border/40 rounded-xl">
                No prompt presets configured yet.
              </div>
            ) : (
              prompts.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectPrompt(item)}
                  className={`w-full text-left border p-4 transition-all rounded-xl cursor-pointer ${
                    activePromptId === item.id
                      ? "glass-card border-primary bg-primary/10 shadow-md shadow-primary/5"
                      : "glass-card border-border/60 hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-muted border border-border/40 text-muted-foreground">
                      {item.moduleName}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs truncate">System Prompt</h4>
                  <p className="text-[10px] text-muted-foreground mt-1 truncate">{item.systemPrompt}</p>
                  
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
          {isEditing || !activePromptId ? (
            <Card className="glass-card border border-border/50 p-6 md:p-8 space-y-6">
              <h3 className="font-bold text-lg border-b border-border/20 pb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                {activePromptId ? "Edit AI Prompt Template" : "Build AI Prompt Preset"}
              </h3>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Target Module</Label>
                  <select
                    value={moduleName}
                    onChange={(e) => setModuleName(e.target.value)}
                    className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="AI Money Mentor">AI Money Mentor</option>
                    <option value="Document Decoder">Document Decoder</option>
                    <option value="Scam Shield">Scam Shield</option>
                    <option value="Simulator Adviser">Simulator Adviser</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">System Prompt (Directives, safety limits)</Label>
                  <textarea
                    placeholder="e.g. You are a conversational financial expert. Output strict JSON formats only..."
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    rows={6}
                    required
                    className="w-full rounded-xl border border-input bg-background p-4 text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">User Prompt Template (Optional suffix)</Label>
                  <textarea
                    placeholder="Enter additional contextual constraints for user prompts..."
                    value={userPromptTemplate}
                    onChange={(e) => setUserPromptTemplate(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-input bg-background p-4 text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-border/20">
                  {activePromptId && (
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
                    Save AI Configuration
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
                    {moduleName}
                  </span>
                  <h2 className="text-2xl font-black mt-2">AI Model Contexts</h2>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setIsEditing(true)} className="bg-primary text-white hover:bg-primary/90 h-9 px-4 rounded-xl flex items-center gap-2 font-bold text-xs">
                    <Edit className="h-4 w-4" /> Edit Configuration
                  </Button>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <h4 className="font-bold text-muted-foreground uppercase text-[10px]">System Guidelines</h4>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap bg-muted/5 border border-border/20 p-4 rounded-xl">{systemPrompt}</p>
                </div>

                {userPromptTemplate && (
                  <div className="space-y-1 pt-2 border-t border-border/10">
                    <h4 className="font-bold text-purple-400 uppercase text-[10px]">User Instruction Template</h4>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{userPromptTemplate}</p>
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
