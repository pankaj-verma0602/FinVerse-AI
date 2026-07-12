"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Search,
  CheckCircle,
  Database
} from "lucide-react";

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-border/20 pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          System Analytics <BarChart3 className="h-6 w-6 text-primary" />
        </h1>
        <p className="text-muted-foreground text-sm">
          Overview of application metrics, AI token consumption, and system health status.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border border-border/40 p-6 space-y-4">
          <div className="flex justify-between items-center text-xs text-muted-foreground uppercase font-bold tracking-wider">
            <span>Daily Active Users</span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black">742</span>
            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> +14.2%
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">Unique authenticated log sessions</p>
        </Card>

        <Card className="glass-card border border-border/40 p-6 space-y-4">
          <div className="flex justify-between items-center text-xs text-muted-foreground uppercase font-bold tracking-wider">
            <span>Total AI Tokens Expended</span>
            <Activity className="h-4 w-4 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black">4.8M</span>
            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> +8.1%
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">Calculated across all active client feeds</p>
        </Card>

        <Card className="glass-card border border-border/40 p-6 space-y-4">
          <div className="flex justify-between items-center text-xs text-muted-foreground uppercase font-bold tracking-wider">
            <span>API Router Failure Rate</span>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black">0.02%</span>
            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
              <CheckCircle className="h-3 w-3" /> Healthy
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">Gateway resilience metrics</p>
        </Card>
      </div>

      {/* Custom Mock Chart Graphics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass-card border border-border/40 p-6 space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            <span>Real-time Ingestion Traffic (Hourly)</span>
          </h3>
          <div className="flex items-end justify-between h-48 pt-6 border-b border-border/20 px-4">
            <div className="w-[10%] bg-blue-500/25 border-t-2 border-blue-500 h-[30%] rounded-t" />
            <div className="w-[10%] bg-blue-500/25 border-t-2 border-blue-500 h-[45%] rounded-t" />
            <div className="w-[10%] bg-blue-500/25 border-t-2 border-blue-500 h-[60%] rounded-t" />
            <div className="w-[10%] bg-blue-500/25 border-t-2 border-blue-500 h-[40%] rounded-t" />
            <div className="w-[10%] bg-blue-500/25 border-t-2 border-blue-500 h-[75%] rounded-t" />
            <div className="w-[10%] bg-blue-500/25 border-t-2 border-blue-500 h-[90%] rounded-t" />
          </div>
          <div className="flex justify-between text-[9px] text-muted-foreground px-2">
            <span>12:00</span>
            <span>14:00</span>
            <span>16:00</span>
            <span>18:00</span>
            <span>20:00</span>
            <span>22:00</span>
          </div>
        </Card>

        <Card className="glass-card border border-border/40 p-6 space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Search className="h-4 w-4 text-purple-400" />
            <span>Scam Scans distribution by category</span>
          </h3>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Lottery / SMS Scams</span>
                <span className="font-bold">58%</span>
              </div>
              <div className="h-2 rounded bg-muted overflow-hidden">
                <div className="h-full bg-red-500 w-[58%]" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Electricity Bill Cancellation Threats</span>
                <span className="font-bold">24%</span>
              </div>
              <div className="h-2 rounded bg-muted overflow-hidden">
                <div className="h-full bg-amber-500 w-[24%]" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Fake Job / Telegram scams</span>
                <span className="font-bold">18%</span>
              </div>
              <div className="h-2 rounded bg-muted overflow-hidden">
                <div className="h-full bg-blue-400 w-[18%]" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
