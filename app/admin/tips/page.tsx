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
  Lightbulb,
  Plus,
  Trash2,
  Edit,
  Sparkles
} from "lucide-react";

interface TipDoc {
  id: string;
  title: string;
  description: string;
  category: string;
  createdAt: string;
}

const CATEGORIES = ["Budgeting", "Investing", "Saving", "Taxes", "Credit", "General"];

export default function AdminTipsPage() {
  const [tips, setTips] = useState<TipDoc[]>([]);
  const [activeTipId, setActiveTipId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);

  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  useEffect(() => {
    // Listen to real-time tips
    const unsub = onSnapshot(collection(db, "tips"), (snap) => {
      const docsList: TipDoc[] = [];
      snap.forEach((docSnap) => {
        docsList.push({
          id: docSnap.id,
          ...docSnap.data()
        } as TipDoc);
      });
      docsList.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setTips(docsList);
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
    setActiveTipId(null);
    setIsEditing(true);
    setTitle("");
    setDescription("");
    setCategory(CATEGORIES[0]);
  };

  const handleSelectTip = (item: TipDoc) => {
    setActiveTipId(item.id);
    setIsEditing(false);
    setTitle(item.title);
    setDescription(item.description);
    setCategory(item.category);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const tipData = {
      title,
      description,
      category,
      updatedAt: new Date().toISOString()
    };

    try {
      if (activeTipId) {
        await setDoc(doc(db, "tips", activeTipId), tipData, { merge: true });
        triggerAlert("Financial tip updated successfully!");
      } else {
        const newDoc = await addDoc(collection(db, "tips"), {
          ...tipData,
          createdAt: new Date().toISOString()
        });
        setActiveTipId(newDoc.id);
      }
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      triggerAlert("Error saving financial tip.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this tip? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "tips", id));
      triggerAlert("Financial tip deleted successfully!");
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
            Daily Financial Tips <Lightbulb className="h-6 w-6 text-primary" />
          </h1>
          <p className="text-muted-foreground text-sm">
            Publish bite-sized daily suggestions to boost simulated dashboard wisdom widgets.
          </p>
        </div>
        <Button onClick={handleAddNew} className="bg-primary text-white hover:bg-primary/90 h-10 px-4 rounded-xl flex items-center gap-2 font-bold text-xs">
          <Plus className="h-4 w-4" /> Add New Tip
        </Button>
      </div>

      {alertMsg && (
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-xs font-semibold text-primary animate-pulse">
          {alertMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Tips List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold text-md mb-2">Active Tips</h3>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin">
            {tips.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground py-8 border border-dashed border-border/40 rounded-xl">
                No financial tips defined yet.
              </div>
            ) : (
              tips.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectTip(item)}
                  className={`w-full text-left border p-4 transition-all rounded-xl cursor-pointer ${
                    activeTipId === item.id
                      ? "glass-card border-primary bg-primary/10 shadow-md shadow-primary/5"
                      : "glass-card border-border/60 hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-muted border border-border/40 text-muted-foreground">
                      {item.category}
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
          {isEditing || !activeTipId ? (
            <Card className="glass-card border border-border/50 p-6 md:p-8 space-y-6">
              <h3 className="font-bold text-lg border-b border-border/20 pb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                {activeTipId ? "Edit Tip" : "Publish New Daily Tip"}
              </h3>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Tip Title</Label>
                    <Input 
                      placeholder="e.g. Automate Your SIP Transfers" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
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
                  <Label className="text-xs">Tip Description (Short & Clear advice)</Label>
                  <textarea
                    placeholder="Enter the financial advice details..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    required
                    className="w-full rounded-xl border border-input bg-background p-4 text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-border/20">
                  {activeTipId && (
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
                    Save Financial Tip
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
                  <h2 className="text-2xl font-black mt-2">{title}</h2>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setIsEditing(true)} className="bg-primary text-white hover:bg-primary/90 h-9 px-4 rounded-xl flex items-center gap-2 font-bold text-xs">
                    <Edit className="h-4 w-4" /> Edit Tip
                  </Button>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <h4 className="font-bold text-muted-foreground uppercase text-[10px]">Advice Details</h4>
                  <p className="text-muted-foreground leading-relaxed">{description}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
