"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminRouteGuard } from "@/components/RouteGuard";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  ShieldAlert,
  PlayCircle,
  Lightbulb,
  Megaphone,
  Terminal,
  Tag,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  Sparkles,
  LogOut
} from "lucide-react";
import { useAuth } from "@/firebase/auth-context";
import { Button } from "@/components/ui/button";

const MODULES = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Lessons", href: "/admin/lessons", icon: BookOpen },
  { name: "Financial Dictionary", href: "/admin/financial-dictionary", icon: FileText },
  { name: "Scam Database", href: "/admin/scam-database", icon: ShieldAlert },
  { name: "Simulator Scenarios", href: "/admin/simulator-scenarios", icon: PlayCircle },
  { name: "Financial Tips", href: "/admin/tips", icon: Lightbulb },
  { name: "Announcements", href: "/admin/announcements", icon: Megaphone },
  { name: "AI Prompt Manager", href: "/admin/prompt-manager", icon: Terminal },
  { name: "Categories", href: "/admin/categories", icon: Tag },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <AdminRouteGuard>
      <div className="flex h-screen overflow-hidden bg-background text-foreground">
        {/* Mobile Header */}
        <header className="flex h-16 w-full items-center justify-between border-b border-border/40 bg-background/80 px-6 backdrop-blur-md lg:hidden">
          <Link href="/admin/dashboard" className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            <span className="font-bold text-lg bg-gradient-to-r from-blue-500 to-emerald-400 bg-clip-text text-transparent">
              FinVerse CMS
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg border border-border/40 p-2 text-muted-foreground hover:bg-muted/40"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {/* Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border/40 bg-background transition-transform duration-300 lg:static lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Sidebar Header */}
          <div className="flex h-16 items-center px-6 border-b border-border/40 justify-between">
            <Link href="/admin/dashboard" className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              <span className="font-black text-lg bg-gradient-to-r from-blue-500 to-emerald-400 bg-clip-text text-transparent">
                FinVerse CMS
              </span>
            </Link>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Module Links */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4 scrollbar-thin">
            {MODULES.map((mod) => {
              const Icon = mod.icon;
              const isActive = pathname === mod.href;
              return (
                <Link
                  key={mod.name}
                  href={mod.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-primary border border-primary/20 text-white shadow-md shadow-blue-500/10"
                      : "text-muted-foreground border border-transparent hover:bg-muted/40 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {mod.name}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="border-t border-border/40 p-4 space-y-3 bg-muted/5">
            <div className="flex items-center justify-between px-2 text-xs">
              <span className="font-medium text-muted-foreground truncate max-w-[140px]">
                {user?.email}
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                Admin
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 h-9 text-xs rounded-xl"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-thin">
            {children}
          </main>
        </div>
      </div>
    </AdminRouteGuard>
  );
}
