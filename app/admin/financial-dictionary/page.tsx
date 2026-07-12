"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  collection, 
  setDoc, 
  deleteDoc, 
  doc, 
  onSnapshot 
} from "firebase/firestore";
import { db } from "@/firebase/config";
import {
  FileText,
  Plus,
  Trash2,
  Edit,
  Sparkles
} from "lucide-react";

interface DictionaryTerm {
  id: string;
  term: string;
  meaning: string;
  simpleExplanation: string;
  example: string;
  hindiTranslation: string;
  category: string;
  createdAt: string;
}

const CATEGORIES = ["Investment", "Banking", "Taxation", "Economics", "General"];

export default function AdminDictionaryPage() {
  const [terms, setTerms] = useState<DictionaryTerm[]>([]);
  const [activeTermId, setActiveTermId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [term, setTerm] = useState("");
  const [meaning, setMeaning] = useState("");
  const [simpleExplanation, setSimpleExplanation] = useState("");
  const [example, setExample] = useState("");
  const [hindiTranslation, setHindiTranslation] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);

  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    // Listen to real-time dictionary terms feed
    const unsub = onSnapshot(collection(db, "financial_terms"), (snap) => {
      if (!active) return;
      const docsList: DictionaryTerm[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        docsList.push({
          id: docSnap.id,
          term: data.term || docSnap.id,
          meaning: data.meaning || data.definition || "",
          simpleExplanation: data.simpleExplanation || "",
          example: data.example || "",
          hindiTranslation: data.hindiTranslation || data.hindiExplanation || "",
          category: data.category || "General",
          createdAt: data.createdAt || new Date().toISOString()
        } as DictionaryTerm);
      });
      docsList.sort((a, b) => a.term.localeCompare(b.term));
      setTerms(docsList);
      localStorage.setItem("finverse_local_financial_terms", JSON.stringify(docsList));
      setLoading(false);
    }, (err) => {
      console.warn("Firestore dictionary load failed, using local storage:", err);
      if (active) loadLocalFallback();
    });

    const timeoutId = setTimeout(() => {
      if (active && terms.length === 0) {
        console.warn("Firestore dictionary load timed out, using local storage.");
        loadLocalFallback();
      }
    }, 1200);

    function loadLocalFallback() {
      const stored = localStorage.getItem("finverse_local_financial_terms");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setTerms(parsed);
        } catch (e) {
          console.error(e);
        }
      } else {
        // Fallback seeded terms
        const fallbackList: DictionaryTerm[] = [
          {
            id: "APR",
            term: "APR",
            meaning: "Annual Percentage Rate shows the yearly cost of borrowing money.",
            simpleExplanation: "The total yearly cost of a loan expressed as a percentage.",
            example: "A credit card with 36% APR can become expensive if unpaid.",
            hindiTranslation: "वार्षिक प्रतिशत दर (APR) ऋण लेने की वार्षिक कुल लागत को दर्शाती है।",
            category: "Banking",
            createdAt: new Date().toISOString()
          },
          {
            id: "Compound_Interest",
            term: "Compound Interest",
            meaning: "Interest calculated on the initial principal and also on the accumulated interest of previous periods.",
            simpleExplanation: "Earning interest on your interest, creating a snowball wealth effect.",
            example: "₹10,000 earns ₹1,000 in Year 1. Year 2 earns interest on ₹11,000, yielding ₹1,210.",
            hindiTranslation: "चक्रवृद्धि ब्याज (Compound Interest) में मूलधन के साथ-साथ पहले मिले ब्याज पर भी ब्याज मिलता है।",
            category: "Investment",
            createdAt: new Date().toISOString()
          }
        ];
        setTerms(fallbackList);
        localStorage.setItem("finverse_local_financial_terms", JSON.stringify(fallbackList));
      }
      setLoading(false);
    }

    return () => {
      active = false;
      unsub();
      clearTimeout(timeoutId);
    };
  }, [terms.length]);

  const triggerAlert = (text: string) => {
    setAlertMsg(text);
    setTimeout(() => setAlertMsg(null), 3000);
  };

  const handleAddNew = () => {
    setActiveTermId(null);
    setIsEditing(true);
    setTerm("");
    setMeaning("");
    setSimpleExplanation("");
    setExample("");
    setHindiTranslation("");
    setCategory(CATEGORIES[0]);
  };

  const handleSelectTerm = (item: DictionaryTerm) => {
    setActiveTermId(item.id);
    setIsEditing(false);
    setTerm(item.term);
    setMeaning(item.meaning);
    setSimpleExplanation(item.simpleExplanation);
    setExample(item.example);
    setHindiTranslation(item.hindiTranslation);
    setCategory(item.category);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim() || !meaning.trim()) return;

    const termData = {
      term,
      title: term,
      meaning,
      definition: meaning,
      simpleExplanation,
      example,
      hindiTranslation,
      hindiExplanation: hindiTranslation,
      category,
      updatedAt: new Date().toISOString()
    };

    // Optimistically update local state & local storage
    const updatedTerms = [...terms];
    const newId = activeTermId || term.replace(/\s+/g, "_");
    const newDoc: DictionaryTerm = {
      id: newId,
      term,
      meaning,
      simpleExplanation,
      example,
      hindiTranslation,
      category,
      createdAt: activeTermId ? (terms.find(t => t.id === activeTermId)?.createdAt || new Date().toISOString()) : new Date().toISOString()
    };

    const existingIdx = updatedTerms.findIndex(t => t.id === newId);
    if (existingIdx >= 0) {
      updatedTerms[existingIdx] = newDoc;
    } else {
      updatedTerms.push(newDoc);
    }
    updatedTerms.sort((a, b) => a.term.localeCompare(b.term));
    setTerms(updatedTerms);
    localStorage.setItem("finverse_local_financial_terms", JSON.stringify(updatedTerms));

    try {
      await setDoc(doc(db, "financial_terms", newId), {
        ...termData,
        createdAt: new Date().toISOString()
      }, { merge: true });
      triggerAlert("Dictionary term saved to cloud and local storage successfully!");
    } catch (err) {
      console.warn("Firestore save failed, using local storage cache:", err);
      triggerAlert("Dictionary term saved locally (Offline Mode).");
    }

    setIsEditing(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this term? This cannot be undone.")) return;

    // Optimistically update local
    const filtered = terms.filter(t => t.id !== id);
    setTerms(filtered);
    localStorage.setItem("finverse_local_financial_terms", JSON.stringify(filtered));

    try {
      await deleteDoc(doc(db, "financial_terms", id));
      triggerAlert("Dictionary term deleted successfully!");
      handleAddNew();
    } catch (err) {
      console.warn("Firestore delete failed, removed locally:", err);
      triggerAlert("Term removed locally.");
      handleAddNew();
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
            Financial Dictionary <FileText className="h-6 w-6 text-primary" />
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage corporate and investment definitions, examples, and Hindi translations.
          </p>
        </div>
        <Button onClick={handleAddNew} className="bg-primary text-white hover:bg-primary/90 h-10 px-4 rounded-xl flex items-center gap-2 font-bold text-xs">
          <Plus className="h-4 w-4" /> Add New Term
        </Button>
      </div>

      {alertMsg && (
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-xs font-semibold text-primary animate-pulse">
          {alertMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Terms List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold text-md mb-2">Glossary Terms</h3>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin">
            {terms.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground py-8 border border-dashed border-border/40 rounded-xl">
                No dictionary terms created yet.
              </div>
            ) : (
              terms.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectTerm(item)}
                  className={`w-full text-left border p-4 transition-all rounded-xl cursor-pointer ${
                    activeTermId === item.id
                      ? "glass-card border-primary bg-primary/10 shadow-md shadow-primary/5"
                      : "glass-card border-border/60 hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-muted border border-border/40 text-muted-foreground">
                      {item.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm">{item.term}</h4>
                  <p className="text-[10px] text-muted-foreground mt-1 truncate">{item.meaning}</p>
                  
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
          {isEditing || !activeTermId ? (
            <Card className="glass-card border border-border/50 p-6 md:p-8 space-y-6">
              <h3 className="font-bold text-lg border-b border-border/20 pb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                {activeTermId ? "Edit Dictionary Term" : "Define New Financial Term"}
              </h3>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Financial Term Name</Label>
                    <Input 
                      placeholder="e.g. Compound Annual Growth Rate (CAGR)" 
                      value={term} 
                      onChange={(e) => setTerm(e.target.value)} 
                      required 
                      className="h-10 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Category</Label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary outline-none"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Core Definition (Meaning)</Label>
                  <textarea
                    placeholder="Enter the formal description or textbook meaning of this term..."
                    value={meaning}
                    onChange={(e) => setMeaning(e.target.value)}
                    rows={3}
                    required
                    className="w-full rounded-xl border border-input bg-background p-4 text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Simplified Explanation (For Beginners)</Label>
                  <textarea
                    placeholder="Explain this concept in simple, real-world analogies..."
                    value={simpleExplanation}
                    onChange={(e) => setSimpleExplanation(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-input bg-background p-4 text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Real-World Example</Label>
                  <textarea
                    placeholder="Provide a concrete example showing how this term applies..."
                    value={example}
                    onChange={(e) => setExample(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-input bg-background p-4 text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Hindi Translation & Meaning (Hindi Script)</Label>
                  <textarea
                    placeholder="e.g. सीएजीआर (चक्रवृद्धि वार्षिक वृद्धि दर)..."
                    value={hindiTranslation}
                    onChange={(e) => setHindiTranslation(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-input bg-background p-4 text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-border/20">
                  {activeTermId && (
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
                    Save Term Definition
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
                    {category}
                  </span>
                  <h2 className="text-2xl font-black mt-2">{term}</h2>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setIsEditing(true)} className="bg-primary text-white hover:bg-primary/90 h-9 px-4 rounded-xl flex items-center gap-2 font-bold text-xs">
                    <Edit className="h-4 w-4" /> Edit Definition
                  </Button>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <h4 className="font-bold text-muted-foreground uppercase text-[10px] tracking-wide">Core Meaning</h4>
                  <p className="text-muted-foreground leading-relaxed">{meaning}</p>
                </div>
                
                {simpleExplanation && (
                  <div className="space-y-1 pt-2 border-t border-border/10">
                    <h4 className="font-bold text-purple-400 uppercase text-[10px] tracking-wide">Simplified Explanation</h4>
                    <p className="text-muted-foreground leading-relaxed">{simpleExplanation}</p>
                  </div>
                )}

                {example && (
                  <div className="space-y-1 pt-2 border-t border-border/10">
                    <h4 className="font-bold text-emerald-400 uppercase text-[10px] tracking-wide">Real-World Example</h4>
                    <p className="text-muted-foreground leading-relaxed">{example}</p>
                  </div>
                )}

                {hindiTranslation && (
                  <div className="space-y-1 pt-2 border-t border-border/10 p-4 rounded-xl bg-purple-500/5 border border-purple-500/15">
                    <h4 className="font-bold text-purple-400 uppercase text-[10px] tracking-wide">Hindi Translation (हिंदी अनुवाद)</h4>
                    <p className="text-muted-foreground leading-relaxed font-sans">{hindiTranslation}</p>
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
