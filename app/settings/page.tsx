"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/firebase/auth-context";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sun, Moon, Volume2, User, Check, Key } from "lucide-react";

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Form states
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [voiceProfile, setVoiceProfile] = useState<"aura" | "echo">("aura");
  const [speechSpeed, setSpeechSpeed] = useState<0.8 | 1.0 | 1.2>(1.0);
  const [customKey, setCustomKey] = useState("");

  const [savedGeneral, setSavedGeneral] = useState(false);
  const [savedVoice, setSavedVoice] = useState(false);
  const [savedKeys, setSavedKeys] = useState(false);

  // Protect route
  useEffect(() => {
    setMounted(true);
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Load settings on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLang = localStorage.getItem("finverse_language") as "en" | "hi";
      const storedVoice = localStorage.getItem("finverse_voice_profile") as "aura" | "echo";
      const storedSpeed = Number(localStorage.getItem("finverse_speech_rate")) as 0.8 | 1.0 | 1.2;
      const storedKey = localStorage.getItem("finverse_custom_gemini_key") || "";

      if (storedLang) setLanguage(storedLang);
      if (storedVoice) setVoiceProfile(storedVoice);
      if (storedSpeed) setSpeechSpeed(storedSpeed);
      if (storedKey) setCustomKey(storedKey);
    }
  }, []);

  if (loading || !user) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground text-sm">Loading settings...</p>
        </div>
      </div>
    );
  }

  // Save Handlers
  const saveGeneral = () => {
    localStorage.setItem("finverse_language", language);
    setSavedGeneral(true);
    setTimeout(() => setSavedGeneral(false), 2000);
  };

  const saveVoice = () => {
    localStorage.setItem("finverse_voice_profile", voiceProfile);
    localStorage.setItem("finverse_speech_rate", String(speechSpeed));
    setSavedVoice(true);
    setTimeout(() => setSavedVoice(false), 2000);
  };

  const saveKeys = () => {
    localStorage.setItem("finverse_custom_gemini_key", customKey);
    setSavedKeys(true);
    setTimeout(() => setSavedKeys(false), 2000);
  };

  return (
    <div className="relative min-h-screen bg-background p-6 md:p-12">
      {/* Background glow */}
      <div className="absolute top-0 left-0 -z-10 h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-[120px]" />

      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Configure your FinVerse AI preferences</p>
        </div>

        <Tabs defaultValue="general" className="w-full animate-in fade-in duration-300">
          <TabsList className="grid grid-cols-3 max-w-md bg-muted/50 border border-border/40 p-1 rounded-xl mb-8">
            <TabsTrigger value="general" className="rounded-lg py-2">General</TabsTrigger>
            <TabsTrigger value="voice" className="rounded-lg py-2">Voice & AI</TabsTrigger>
            <TabsTrigger value="keys" className="rounded-lg py-2">API Keys</TabsTrigger>
          </TabsList>

          {/* GENERAL TAB */}
          <TabsContent value="general">
            <Card className="glass-card border border-border/50 p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                <User className="h-5 w-5 text-purple-500" />
                <h3 className="text-lg font-semibold">Profile & Layout</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-bold text-muted-foreground">Email Address</Label>
                  <div className="mt-1.5 text-xs bg-muted/40 p-3.5 rounded-xl border border-border/30 text-muted-foreground font-semibold">
                    {user.email}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground">Preferred Dashboard Language</Label>
                  <div className="flex gap-2.5">
                    <Button 
                      variant="outline"
                      onClick={() => setLanguage("en")}
                      className={`rounded-xl h-10 px-4 text-xs font-semibold ${language === "en" ? "border-purple-500 bg-purple-500/10 text-purple-400 font-bold" : "border-border text-muted-foreground"}`}
                    >
                      English
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setLanguage("hi")}
                      className={`rounded-xl h-10 px-4 text-xs font-semibold ${language === "hi" ? "border-purple-500 bg-purple-500/10 text-purple-400 font-bold" : "border-border text-muted-foreground"}`}
                    >
                      Hindi (हिंदी)
                    </Button>
                  </div>
                </div>

                {mounted && (
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground">Theme Mode</Label>
                    <div className="flex gap-2.5">
                      <Button 
                        variant={theme === "light" ? "default" : "outline"} 
                        onClick={() => setTheme("light")}
                        className="flex items-center gap-2 rounded-xl h-10 text-xs"
                      >
                        <Sun className="h-4 w-4" />
                        Light
                      </Button>
                      <Button 
                        variant={theme === "dark" ? "default" : "outline"} 
                        onClick={() => setTheme("dark")}
                        className="flex items-center gap-2 rounded-xl h-10 text-xs"
                      >
                        <Moon className="h-4 w-4" />
                        Dark
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border/40 flex justify-between items-center shrink-0">
                {savedGeneral ? (
                  <span className="text-emerald-500 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                    <Check className="h-4 w-4" /> Preferences saved!
                  </span>
                ) : <span />}
                <Button onClick={saveGeneral} className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-10 px-6 font-bold text-xs">
                  Save Changes
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* VOICE & AI TAB */}
          <TabsContent value="voice">
            <Card className="glass-card border border-border/50 p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                <Volume2 className="h-5 w-5 text-purple-500" />
                <h3 className="text-lg font-semibold">Voice & Mentorship</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground">Mentor Voice Pitch / Gender</Label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Button 
                      variant="outline"
                      onClick={() => setVoiceProfile("aura")}
                      className={`rounded-xl h-10 text-xs font-semibold ${voiceProfile === "aura" ? "border-purple-500 bg-purple-500/10 text-purple-400 font-bold" : "border-border text-muted-foreground"}`}
                    >
                      Aura (Calm, Female)
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setVoiceProfile("echo")}
                      className={`rounded-xl h-10 text-xs font-semibold ${voiceProfile === "echo" ? "border-purple-500 bg-purple-500/10 text-purple-400 font-bold" : "border-border text-muted-foreground"}`}
                    >
                      Echo (Clear, Male)
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground">AI Speech Speed Rate</Label>
                  <div className="flex gap-2.5">
                    <Button 
                      variant="outline"
                      onClick={() => setSpeechSpeed(0.8)}
                      className={`rounded-xl h-10 px-4 text-xs font-semibold ${speechSpeed === 0.8 ? "border-purple-500 bg-purple-500/10 text-purple-400 font-bold" : "border-border text-muted-foreground"}`}
                    >
                      Slow (0.8x)
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setSpeechSpeed(1.0)}
                      className={`rounded-xl h-10 px-4 text-xs font-semibold ${speechSpeed === 1.0 ? "border-purple-500 bg-purple-500/10 text-purple-400 font-bold" : "border-border text-muted-foreground"}`}
                    >
                      Normal (1.0x)
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setSpeechSpeed(1.2)}
                      className={`rounded-xl h-10 px-4 text-xs font-semibold ${speechSpeed === 1.2 ? "border-purple-500 bg-purple-500/10 text-purple-400 font-bold" : "border-border text-muted-foreground"}`}
                    >
                      Fast (1.2x)
                    </Button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/40 flex justify-between items-center shrink-0">
                {savedVoice ? (
                  <span className="text-emerald-500 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                    <Check className="h-4 w-4" /> Voice configuration saved!
                  </span>
                ) : <span />}
                <Button onClick={saveVoice} className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-10 px-6 font-bold text-xs">
                  Save Changes
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* KEYS TAB */}
          <TabsContent value="keys">
            <Card className="glass-card border border-border/50 p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                <Key className="h-5 w-5 text-purple-500" />
                <h3 className="text-lg font-semibold">Personal API Keys (Advanced)</h3>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  By default, FinVerse AI uses shared system keys. If you hit rate limits, you can provide your own Google Gemini API key below. This is stored locally in your browser and sent with queries.
                </p>

                <div className="space-y-2">
                  <Label htmlFor="customGemini" className="text-xs font-bold text-muted-foreground">Custom Google Gemini API Key</Label>
                  <input
                    id="customGemini"
                    type="password"
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    placeholder="AIzaSy... or AQ.Ab8..."
                    className="w-full h-11 px-4 rounded-xl border border-border/60 bg-background/50 text-xs focus:outline-none focus:border-purple-500 leading-normal"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border/40 flex justify-between items-center shrink-0">
                {savedKeys ? (
                  <span className="text-emerald-500 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                    <Check className="h-4 w-4" /> API keys updated!
                  </span>
                ) : <span />}
                <Button onClick={saveKeys} className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-10 px-6 font-bold text-xs">
                  Save Keys
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
