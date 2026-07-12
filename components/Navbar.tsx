"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/firebase/auth-context";
import { useTheme } from "next-themes";
import { Menu, X, Sun, Moon, Sparkles, LogOut, LayoutDashboard, Settings as SettingsIcon, ShieldAlert, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [assessmentPending, setAssessmentPending] = useState(false);
  const pathname = usePathname();

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
    
    // Check if onboarding assessment is pending
    const checkAssessment = () => {
      if (typeof window !== "undefined") {
        const completed = localStorage.getItem("finverse_assessment_completed") === "true";
        setAssessmentPending(!completed);
      }
    };
    checkAssessment();
    const interval = setInterval(checkAssessment, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const navLinks = user
    ? [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Knowledge Hub", href: "/financial-dictionary", icon: BookOpen },
        { name: "Settings", href: "/settings", icon: SettingsIcon },
      ]
    : [
        { name: "Features", href: "/#features", icon: undefined },
        { name: "About", href: "/#about", icon: undefined },
      ];

  const handleLogout = async () => {
    await logout();
  };

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-500 to-emerald-400 bg-clip-text text-transparent">
                FinVerse AI
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative text-sm font-medium transition-colors hover:text-primary ${
                    pathname === link.href ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <span>{link.name}</span>
                  {link.name === "Dashboard" && assessmentPending && (
                    <span className="absolute -top-1 -right-2.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="rounded-full"
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5 text-amber-500" />
                  ) : (
                    <Moon className="h-5 w-5 text-blue-500" />
                  )}
                </Button>
              )}

              {/* Auth Buttons */}
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-xs text-muted-foreground hidden lg:inline-block">
                    {user.email}
                  </span>
                  <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-3">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="rounded-full"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 text-amber-500" />
                ) : (
                  <Moon className="h-5 w-5 text-blue-500" />
                )}
              </Button>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-panel border-b border-border animate-in slide-in-from-top duration-200">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block rounded-md px-3 py-2 text-base font-medium ${
                  pathname === link.href ? "bg-accent/10 text-primary" : "text-muted-foreground hover:bg-accent/5 hover:text-foreground"
                }`}
              >
                <div className="flex items-center space-x-2">
                  {link.icon && <link.icon className="h-5 w-5" />}
                  <span>{link.name}</span>
                </div>
              </Link>
            ))}

            {user ? (
              <div className="border-t border-border/50 pt-4 pb-2 px-3">
                <div className="text-xs text-muted-foreground mb-3 truncate">{user.email}</div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="w-full flex items-center justify-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 border-t border-border/50 pt-4 pb-2 px-3">
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)}>
                  <Button size="sm" className="w-full bg-primary text-white">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
