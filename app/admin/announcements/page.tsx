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
  Megaphone,
  Plus,
  Trash2,
  Edit,
  Sparkles
} from "lucide-react";

interface AnnouncementDoc {
  id: string;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  publishedAt: string;
  createdAt: string;
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementDoc[]>([]);
  const [activeAnnId, setActiveAnnId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");

  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  useEffect(() => {
    // Listen to real-time announcements
    const unsub = onSnapshot(collection(db, "announcements"), (snap) => {
      const docsList: AnnouncementDoc[] = [];
      snap.forEach((docSnap) => {
        docsList.push({
          id: docSnap.id,
          ...docSnap.data()
        } as AnnouncementDoc);
      });
      docsList.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setAnnouncements(docsList);
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
    setActiveAnnId(null);
    setIsEditing(true);
    setTitle("");
    setDescription("");
    setPriority("Medium");
  };

  const handleSelectAnn = (item: AnnouncementDoc) => {
    setActiveAnnId(item.id);
    setIsEditing(false);
    setTitle(item.title);
    setDescription(item.description);
    setPriority(item.priority);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const annData = {
      title,
      description,
      priority,
      publishedAt: new Date().toLocaleDateString(),
      updatedAt: new Date().toISOString()
    };

    try {
      if (activeAnnId) {
        await setDoc(doc(db, "announcements", activeAnnId), annData, { merge: true });
        triggerAlert("Announcement updated successfully!");
      } else {
        const newDoc = await addDoc(collection(db, "announcements"), {
          ...annData,
          createdAt: new Date().toISOString()
        });
        setActiveAnnId(newDoc.id);
      }
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      triggerAlert("Error saving announcement.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this announcement? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "announcements", id));
      triggerAlert("Announcement deleted successfully!");
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
            Announcements <Megaphone className="h-6 w-6 text-primary" />
          </h1>
          <p className="text-muted-foreground text-sm">
            Publish high priority notifications to user dashboards in real time.
          </p>
        </div>
        <Button onClick={handleAddNew} className="bg-primary text-white hover:bg-primary/90 h-10 px-4 rounded-xl flex items-center gap-2 font-bold text-xs">
          <Plus className="h-4 w-4" /> Add Announcement
        </Button>
      </div>

      {alertMsg && (
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-xs font-semibold text-primary animate-pulse">
          {alertMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Announcements List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold text-md mb-2">Publish Log</h3>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin">
            {announcements.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground py-8 border border-dashed border-border/40 rounded-xl">
                No announcements published yet.
              </div>
            ) : (
              announcements.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectAnn(item)}
                  className={`w-full text-left border p-4 transition-all rounded-xl cursor-pointer ${
                    activeAnnId === item.id
                      ? "glass-card border-primary bg-primary/10 shadow-md shadow-primary/5"
                      : "glass-card border-border/60 hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      item.priority === "High" 
                        ? "bg-red-500/10 border-red-500/20 text-red-400" 
                        : item.priority === "Medium"
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    }`}>
                      {item.priority} Priority
                    </span>
                  </div>
                  <h4 className="font-bold text-sm">{item.title}</h4>
                  <p className="text-[10px] text-muted-foreground mt-1 truncate">{item.description}</p>
                  
                  <div className="flex justify-end mt-2 pt-2 border-t border-border/25 text-[10px] text-muted-foreground">
                    <span>Published: {item.publishedAt}</span>
                    <Button
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                      variant="ghost"
                      size="icon"
                      className="ml-2 h-6 w-6 rounded text-red-500 hover:bg-red-500/10"
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
          {isEditing || !activeAnnId ? (
            <Card className="glass-card border border-border/50 p-6 md:p-8 space-y-6">
              <h3 className="font-bold text-lg border-b border-border/20 pb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                {activeAnnId ? "Edit Announcement" : "Create New Announcement"}
              </h3>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Announcement Headline</Label>
                    <Input 
                      placeholder="e.g. Server Maintenance: Delayed API responses" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      required 
                      className="h-10 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Priority</Label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Announcement Description</Label>
                  <textarea
                    placeholder="Enter the notification announcement description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    required
                    className="w-full rounded-xl border border-input bg-background p-4 text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-border/20">
                  {activeAnnId && (
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
                    Publish Announcement
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
                    priority === "High" 
                      ? "bg-red-500/10 border-red-500/20 text-red-400" 
                      : priority === "Medium"
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  }`}>
                    {priority} Priority
                  </span>
                  <h2 className="text-2xl font-black mt-2">{title}</h2>
                  <p className="text-xs text-muted-foreground">Published at {publishedAt}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setIsEditing(true)} className="bg-primary text-white hover:bg-primary/90 h-9 px-4 rounded-xl flex items-center gap-2 font-bold text-xs">
                    <Edit className="h-4 w-4" /> Edit Announcement
                  </Button>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <h4 className="font-bold text-muted-foreground uppercase text-[10px]">Notification Text</h4>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{description}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
