"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Settings,
  Sparkles,
  Key,
  ShieldAlert,
  Activity,
  AlertTriangle
} from "lucide-react";

export default function AdminSettingsPage() {
  const [latency, setLatency] = useState(0);
  const [forceErrors, setForceErrors] = useState(false);
  const [scamThreshold, setScamThreshold] = useState(70);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLatency = localStorage.getItem("finverse_admin_latency");
      if (savedLatency) setLatency(Number(savedLatency));

      const savedErrors = localStorage.getItem("finverse_admin_force_errors");
      if (savedErrors) setForceErrors(savedErrors === "true");

      const savedThreshold = localStorage.getItem("finverse_admin_scam_threshold");
      if (savedThreshold) setScamThreshold(Number(savedThreshold));
    }
  }, []);

  const triggerAlert = (text: string) => {
    setAlertMsg(text);
    setTimeout(() => setAlertMsg(null), 3000);
  };

  const handleSaveSettings = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("finverse_admin_latency", String(latency));
      localStorage.setItem("finverse_admin_force_errors", String(forceErrors));
      localStorage.setItem("finverse_admin_scam_threshold", String(scamThreshold));
      triggerAlert("System preferences updated and synchronized!");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-border/20 pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          System Settings <Settings className="h-6 w-6 text-primary" />
        </h1>
        <p className="text-muted-foreground text-sm">
          Configure API diagnostics latency values, global scam thresholds, and forced error modes.
        </p>
      </div>

      {alertMsg && (
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-xs font-semibold text-primary animate-pulse">
          {alertMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* API Diagnostics */}
        <Card className="glass-card border border-border/50 p-6 md:p-8 space-y-6">
          <h3 className="font-bold text-md flex items-center gap-2 border-b border-border/20 pb-2">
            <Activity className="h-5 w-5 text-primary" />
            <span>Gemini API Diagnostics & Latency</span>
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Simulated Latency (ms)</Label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="100"
                  value={latency}
                  onChange={(e) => setLatency(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-xs font-bold font-mono bg-muted px-2 py-1 rounded min-w-[60px] text-center">
                  {latency} ms
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Appends latency constraints to all active Gemini prompt responses to check loader states.
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-border/20 pt-4">
              <div className="space-y-0.5">
                <Label className="text-xs">Forced Route Failure Simulation</Label>
                <p className="text-[10px] text-muted-foreground">
                  Forces the Gemini gateway server to respond with a 500 error payload.
                </p>
              </div>
              <input
                type="checkbox"
                checked={forceErrors}
                onChange={(e) => setForceErrors(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
            </div>

            {forceErrors && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-[10px] text-red-500 rounded-lg flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 animate-bounce" />
                <span>Caution: Forced API failures are currently ACTIVE! Live AI requests will fail.</span>
              </div>
            )}
          </div>
        </Card>

        {/* Security & Scam Parameters */}
        <Card className="glass-card border border-border/50 p-6 md:p-8 space-y-6">
          <h3 className="font-bold text-md flex items-center gap-2 border-b border-border/20 pb-2">
            <ShieldAlert className="h-5 w-5 text-red-500" />
            <span>Threat Detection Configurations</span>
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Scam Probability Threshold (%)</Label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="30"
                  max="95"
                  step="5"
                  value={scamThreshold}
                  onChange={(e) => setScamThreshold(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-xs font-bold font-mono bg-muted px-2 py-1 rounded min-w-[60px] text-center">
                  {scamThreshold}%
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Minimum confidence level required to mark a query template as a confirmed scam.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-end pt-4 border-t border-border/20">
        <Button onClick={handleSaveSettings} className="bg-primary text-white hover:bg-primary/90 h-10 px-6 rounded-xl text-xs font-bold">
          Save Settings Preference
        </Button>
      </div>
    </div>
  );
}
