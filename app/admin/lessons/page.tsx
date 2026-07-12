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
  BookOpen,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Sparkles
} from "lucide-react";

interface QuizOption {
  val: number;
  label: string;
}

interface LessonDoc {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  language: "English" | "Hindi";
  status: "Published" | "Draft";
  imageUrl?: string;
  videoUrl?: string;
  quizQuestion?: string;
  quizOptions?: QuizOption[];
  quizCorrectVal?: number;
  createdAt: string;
}

const CATEGORIES = ["Budgeting", "Investing", "Debt", "Taxes", "Inflation"];

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<LessonDoc[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [language, setLanguage] = useState<"English" | "Hindi">("English");
  const [status, setStatus] = useState<"Published" | "Draft">("Draft");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  
  // Quiz Fields
  const [quizQuestion, setQuizQuestion] = useState("");
  const [opt1Label, setOpt1Label] = useState("");
  const [opt2Label, setOpt2Label] = useState("");
  const [opt3Label, setOpt3Label] = useState("");
  const [quizCorrectVal, setQuizCorrectVal] = useState(1);

  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  useEffect(() => {
    // Listen to real-time lessons feed
    const unsub = onSnapshot(collection(db, "lessons"), (snap) => {
      const docsList: LessonDoc[] = [];
      snap.forEach((docSnap) => {
        docsList.push({
          id: docSnap.id,
          ...docSnap.data()
        } as LessonDoc);
      });
      // Sort by creation date
      docsList.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setLessons(docsList);
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
    setActiveLessonId(null);
    setIsEditing(true);
    // Reset inputs
    setTitle("");
    setDescription("");
    setContent("");
    setCategory(CATEGORIES[0]);
    setDifficulty("Beginner");
    setLanguage("English");
    setStatus("Draft");
    setImageUrl("");
    setVideoUrl("");
    setQuizQuestion("");
    setOpt1Label("");
    setOpt2Label("");
    setOpt3Label("");
    setQuizCorrectVal(1);
  };

  const handleSelectLesson = (les: LessonDoc) => {
    setActiveLessonId(les.id);
    setIsEditing(false);
    setTitle(les.title);
    setDescription(les.description);
    setContent(les.content);
    setCategory(les.category);
    setDifficulty(les.difficulty);
    setLanguage(les.language);
    setStatus(les.status);
    setImageUrl(les.imageUrl || "");
    setVideoUrl(les.videoUrl || "");
    setQuizQuestion(les.quizQuestion || "");
    
    if (les.quizOptions && les.quizOptions.length >= 3) {
      setOpt1Label(les.quizOptions[0].label);
      setOpt2Label(les.quizOptions[1].label);
      setOpt3Label(les.quizOptions[2].label);
    } else {
      setOpt1Label("");
      setOpt2Label("");
      setOpt3Label("");
    }
    setQuizCorrectVal(les.quizCorrectVal || 1);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const quizOptions = [
      { val: 1, label: opt1Label || "Option 1" },
      { val: 2, label: opt2Label || "Option 2" },
      { val: 3, label: opt3Label || "Option 3" }
    ];

    const lessonData = {
      title,
      description,
      content,
      category,
      difficulty,
      language,
      status,
      imageUrl,
      videoUrl,
      quizQuestion,
      quizOptions,
      quizCorrectVal,
      updatedAt: new Date().toISOString()
    };

    try {
      if (activeLessonId) {
        // Edit existing
        await setDoc(doc(db, "lessons", activeLessonId), {
          ...lessonData
        }, { merge: true });
        triggerAlert("Lesson updated successfully!");
      } else {
        // Create new
        const newDoc = await addDoc(collection(db, "lessons"), {
          ...lessonData,
          createdAt: new Date().toISOString()
        });
        setActiveLessonId(newDoc.id);
      }
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      triggerAlert("Error saving lesson documentation.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this lesson? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "lessons", id));
      triggerAlert("Lesson deleted successfully!");
      handleAddNew();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePublish = async (les: LessonDoc) => {
    const nextStatus = les.status === "Published" ? "Draft" : "Published";
    try {
      await setDoc(doc(db, "lessons", les.id), {
        status: nextStatus
      }, { merge: true });
      triggerAlert(`Lesson status changed to ${nextStatus}!`);
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
            Lesson Management <BookOpen className="h-6 w-6 text-primary" />
          </h1>
          <p className="text-muted-foreground text-sm">
            Publish courses, manage study materials, images, videos, and quizzes.
          </p>
        </div>
        <Button onClick={handleAddNew} className="bg-primary text-white hover:bg-primary/90 h-10 px-4 rounded-xl flex items-center gap-2 font-bold text-xs">
          <Plus className="h-4 w-4" /> Add New Course
        </Button>
      </div>

      {alertMsg && (
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-xs font-semibold text-primary animate-pulse">
          {alertMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Lessons List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold text-md mb-2">Academy Course Catalog</h3>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin">
            {lessons.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground py-8 border border-dashed border-border/40 rounded-xl">
                No lessons created yet.
              </div>
            ) : (
              lessons.map((les) => (
                <div
                  key={les.id}
                  onClick={() => handleSelectLesson(les)}
                  className={`w-full text-left border p-4 transition-all rounded-xl cursor-pointer ${
                    activeLessonId === les.id
                      ? "glass-card border-primary bg-primary/10 shadow-md shadow-primary/5"
                      : "glass-card border-border/60 hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-muted border border-border/40 text-muted-foreground">
                      {les.category}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      les.status === "Published" 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                        : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    }`}>
                      {les.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm">{les.title}</h4>
                  <p className="text-[10px] text-muted-foreground mt-1 truncate">{les.description}</p>
                  
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/20 text-[10px] text-muted-foreground">
                    <span>{les.difficulty} • {les.language}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        onClick={(e) => { e.stopPropagation(); handleTogglePublish(les); }}
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded hover:bg-muted"
                      >
                        {les.status === "Published" ? <EyeOff className="h-3 w-3 text-amber-500" /> : <Eye className="h-3 w-3 text-emerald-500" />}
                      </Button>
                      <Button
                        onClick={(e) => { e.stopPropagation(); handleDelete(les.id); }}
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Detail / Edit Form */}
        <div className="lg:col-span-2">
          {isEditing || !activeLessonId ? (
            <Card className="glass-card border border-border/50 p-6 md:p-8 space-y-6">
              <h3 className="font-bold text-lg border-b border-border/20 pb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                {activeLessonId ? "Edit Course Lesson" : "Create New Academy Course"}
              </h3>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Lesson Title</Label>
                    <Input 
                      placeholder="e.g. Compound Interest Foundations" 
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
                  <Label className="text-xs">Short Description</Label>
                  <Input 
                    placeholder="Brief 1-sentence course overview" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    className="h-10 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Main Lesson Content (Markdown Supported)</Label>
                  <textarea
                    placeholder="Enter the complete educational guide content here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={8}
                    required
                    className="w-full rounded-xl border border-input bg-background p-4 text-xs focus:ring-1 focus:ring-primary outline-none resize-y min-h-[150px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                  <div className="space-y-2">
                    <Label className="text-xs">Language</Label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as any)}
                      className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Status</Label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Image URL (Optional)</Label>
                    <Input 
                      placeholder="https://example.com/image.jpg" 
                      value={imageUrl} 
                      onChange={(e) => setImageUrl(e.target.value)} 
                      className="h-10 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Video URL (Optional)</Label>
                    <Input 
                      placeholder="https://example.com/video.mp4" 
                      value={videoUrl} 
                      onChange={(e) => setVideoUrl(e.target.value)} 
                      className="h-10 rounded-xl"
                    />
                  </div>
                </div>

                {/* Quiz Block */}
                <div className="border border-border/40 p-4 rounded-xl space-y-3 bg-muted/5">
                  <span className="text-[10px] font-bold text-purple-400 block uppercase">Quiz Knowledge Check</span>
                  <div className="space-y-2">
                    <Label className="text-[11px]">Quiz Question</Label>
                    <Input 
                      placeholder="e.g. Which investment model compounding interest multiplies faster?" 
                      value={quizQuestion} 
                      onChange={(e) => setQuizQuestion(e.target.value)} 
                      className="h-9 text-xs rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[10px]">Option 1</Label>
                      <Input value={opt1Label} onChange={(e) => setOpt1Label(e.target.value)} className="h-8 text-xs rounded" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">Option 2</Label>
                      <Input value={opt2Label} onChange={(e) => setOpt2Label(e.target.value)} className="h-8 text-xs rounded" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">Option 3</Label>
                      <Input value={opt3Label} onChange={(e) => setOpt3Label(e.target.value)} className="h-8 text-xs rounded" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px]">Correct Option Option Number</Label>
                    <select
                      value={quizCorrectVal}
                      onChange={(e) => setQuizCorrectVal(Number(e.target.value))}
                      className="w-full h-8 rounded border border-input bg-background px-2 text-[10px] outline-none"
                    >
                      <option value={1}>Option 1</option>
                      <option value={2}>Option 2</option>
                      <option value={3}>Option 3</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-border/20">
                  {activeLessonId && (
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
                    Save Course Details
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
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setIsEditing(true)} className="bg-primary text-white hover:bg-primary/90 h-9 px-4 rounded-xl flex items-center gap-2 font-bold text-xs">
                    <Edit className="h-4 w-4" /> Edit Course
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center text-xs">
                <div className="p-3 border border-border/40 rounded-xl bg-muted/10">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Difficulty</span>
                  <span className="font-bold text-purple-400">{difficulty}</span>
                </div>
                <div className="p-3 border border-border/40 rounded-xl bg-muted/10">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Language</span>
                  <span className="font-bold text-purple-400">{language}</span>
                </div>
                <div className="p-3 border border-border/40 rounded-xl bg-muted/10">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Publish Status</span>
                  <span className={`font-bold ${status === "Published" ? "text-emerald-500" : "text-amber-500"}`}>{status}</span>
                </div>
              </div>

              {imageUrl && (
                <div className="rounded-xl overflow-hidden border border-border/40 max-h-[200px] flex items-center justify-center bg-muted/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt={title} className="object-cover w-full h-full" />
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wide">Lesson Content Summary</h4>
                <div className="text-xs leading-relaxed text-muted-foreground bg-muted/5 border border-border/20 p-4 rounded-xl max-h-[200px] overflow-y-auto scrollbar-thin whitespace-pre-wrap">
                  {content}
                </div>
              </div>

              {quizQuestion && (
                <div className="p-4 border border-border/40 bg-muted/5 rounded-xl space-y-2 text-xs">
                  <span className="text-[10px] font-bold text-purple-400 block uppercase">Configured Quiz</span>
                  <div className="font-bold">{quizQuestion}</div>
                  <div className="space-y-1 pl-4 text-muted-foreground text-[11px]">
                    <div>• Option 1: {opt1Label || "Option 1"} {quizCorrectVal === 1 && "✅"}</div>
                    <div>• Option 2: {opt2Label || "Option 2"} {quizCorrectVal === 2 && "✅"}</div>
                    <div>• Option 3: {opt3Label || "Option 3"} {quizCorrectVal === 3 && "✅"}</div>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
