"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot 
} from "firebase/firestore";
import { db } from "@/firebase/config";
import {
  Tag,
  Trash2,
  Sparkles
} from "lucide-react";

interface CategoryDoc {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  useEffect(() => {
    // Listen to real-time categories feed
    const unsub = onSnapshot(collection(db, "categories"), (snap) => {
      const docsList: CategoryDoc[] = [];
      snap.forEach((docSnap) => {
        docsList.push({
          id: docSnap.id,
          ...docSnap.data()
        } as CategoryDoc);
      });
      docsList.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setCategories(docsList);
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await addDoc(collection(db, "categories"), {
        name,
        description,
        createdAt: new Date().toISOString()
      });
      setName("");
      setDescription("");
      triggerAlert("Category registered successfully!");
    } catch (err) {
      console.error(err);
      triggerAlert("Failed to register category.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await deleteDoc(doc(db, "categories", id));
      triggerAlert("Category deleted successfully!");
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
      <div className="border-b border-border/20 pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          Category Manager <Tag className="h-6 w-6 text-primary" />
        </h1>
        <p className="text-muted-foreground text-sm">
          Define content classification domains used across lessons and glossary nodes.
        </p>
      </div>

      {alertMsg && (
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-xs font-semibold text-primary animate-pulse">
          {alertMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Create Form */}
        <Card className="glass-card border border-border/50 p-6 md:p-8 space-y-4 lg:col-span-1 h-fit">
          <h3 className="font-bold text-md flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>Add New Category</span>
          </h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Category Name</Label>
              <Input 
                placeholder="e.g. Cryptocurrency" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                className="h-10 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Description</Label>
              <textarea
                placeholder="Brief category scope context..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-input bg-background p-3 text-xs focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90 h-10 rounded-xl text-xs font-bold">
              Save Category
            </Button>
          </form>
        </Card>

        {/* Right Side: Categories List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-md">Registered Classifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground py-8 border border-dashed border-border/40 rounded-xl col-span-2">
                No categories defined.
              </div>
            ) : (
              categories.map((item) => (
                <div
                  key={item.id}
                  className="glass-card border border-border/60 p-4 rounded-xl flex justify-between items-start"
                >
                  <div>
                    <h4 className="font-bold text-sm text-primary">{item.name}</h4>
                    <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                      {item.description || "No description provided."}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleDelete(item.id)}
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
