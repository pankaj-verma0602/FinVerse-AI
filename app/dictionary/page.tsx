"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  ArrowLeft, 
  BookOpen,
  Share2,
  Check
} from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/config";

interface DictionaryTerm {
  id: string;
  title?: string;
  term?: string;
  meaning: string;
  simpleExplanation: string;
  example: string;
  hindiTranslation: string;
  category: string;
}

const CATEGORIES = ["All", "Investment", "Banking", "Taxation", "Economics", "General"];

export default function DictionaryPage() {
  const [terms, setTerms] = useState<DictionaryTerm[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [copiedTermId, setCopiedTermId] = useState<string | null>(null);

  // Load search from URL query parameter once on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get("search");
    if (searchParam) {
      setSearch(searchParam);
    }
  }, []);

  // Sync search state back to URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    const newUrl = search 
      ? `${window.location.pathname}?search=${encodeURIComponent(search)}`
      : window.location.pathname;
    window.history.replaceState({ path: newUrl }, "", newUrl);
  }, [search]);

  const handleShare = (t: DictionaryTerm) => {
    if (typeof window === "undefined") return;
    const termName = t.title || t.term || "";
    const shareUrl = `${window.location.origin}${window.location.pathname}?search=${encodeURIComponent(termName)}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopiedTermId(t.id);
        setTimeout(() => setCopiedTermId(null), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy link: ", err);
      });
  };

  useEffect(() => {
    // Subscribe to Firestore financial_terms in real time
    const unsub = onSnapshot(collection(db, "financial_terms"), (snap) => {
      const docsList: DictionaryTerm[] = [];
      snap.forEach((docSnap) => {
        docsList.push({
          id: docSnap.id,
          ...docSnap.data()
        } as DictionaryTerm);
      });
      // Sort alphabetically
      docsList.sort((a, b) => {
        const nameA = a.title || a.term || "";
        const nameB = b.title || b.term || "";
        return nameA.localeCompare(nameB);
      });
      setTerms(docsList);
      setLoading(false);
    }, (err) => {
      console.error("Error loading dictionary terms:", err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const filteredTerms = terms.filter((t) => {
    const termText = (t.title || t.term || "").toLowerCase();
    const meaningText = (t.meaning || "").toLowerCase();
    const searchText = search.toLowerCase();
    const matchesSearch = termText.includes(searchText) || meaningText.includes(searchText);
    const matchesCategory = activeCategory === "All" || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="relative min-h-screen bg-background p-6 md:p-12">
      {/* Background glow */}
      <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[120px]" />
      
      <div className="mx-auto max-w-6xl space-y-8 animate-in fade-in duration-300">
        {/* Header */}
        <div className="space-y-1">
          <Link href="/dashboard" className="inline-flex items-center text-xs text-muted-foreground hover:text-primary mb-2 gap-1 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            Financial Dictionary <BookOpen className="h-6 w-6 text-primary animate-pulse" />
          </h1>
          <p className="text-muted-foreground text-sm">
            Bilingual explanations for complex financial terms, models, and tax codes.
          </p>
        </div>

        {/* Filters & Search Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search financial terminology..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-background/50 border-border/60"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat)}
                className="text-xs h-9 rounded-xl border-border"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Terms list */}
        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : filteredTerms.length === 0 ? (
          <div className="text-center text-xs text-muted-foreground py-16 border border-dashed border-border/40 rounded-2xl">
            No terms found matching your query.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTerms.map((t) => (
              <Card key={t.id} className="glass-card border border-border/50 p-6 rounded-2xl space-y-4 hover:border-primary/20 transition-all duration-300">
                <div className="flex justify-between items-start">
                  <h3 className="font-extrabold text-lg text-primary">{t.title || t.term}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-muted border border-border/40 text-muted-foreground">
                      {t.category}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-lg hover:bg-muted"
                      onClick={() => handleShare(t)}
                    >
                      {copiedTermId === t.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Share2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div>
                    <h4 className="font-bold text-muted-foreground uppercase text-[10px] tracking-wide">Definition</h4>
                    <p className="text-muted-foreground">{t.meaning}</p>
                  </div>

                  {t.simpleExplanation && (
                    <div className="border-t border-border/10 pt-2">
                      <h4 className="font-bold text-purple-400 uppercase text-[10px] tracking-wide">In simple terms</h4>
                      <p className="text-muted-foreground">{t.simpleExplanation}</p>
                    </div>
                  )}

                  {t.example && (
                    <div className="border-t border-border/10 pt-2">
                      <h4 className="font-bold text-emerald-400 uppercase text-[10px] tracking-wide">Real-world Example</h4>
                      <p className="text-muted-foreground italic">"{t.example}"</p>
                    </div>
                  )}

                  {t.hindiTranslation && (
                    <div className="border-t border-border/10 pt-2 p-3 bg-purple-500/5 rounded-xl border border-purple-500/10 font-sans">
                      <h4 className="font-bold text-purple-400 uppercase text-[10px] tracking-wide">हिंदी अनुवाद (Hindi Context)</h4>
                      <p className="text-muted-foreground font-sans mt-0.5">{t.hindiTranslation}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
