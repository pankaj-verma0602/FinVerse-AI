"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  FileSearch, 
  TrendingUp, 
  MessageSquare, 
  ShieldAlert, 
  BookOpen, 
  ArrowRight, 
  Sparkles, 
  Coins, 
  ShieldCheck, 
  Users 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
      },
    },
  };

  const features = [
    {
      icon: FileSearch,
      title: "AI Document Decoder",
      description: "Upload PDFs, DOCX, or images of loan terms, leases, or credit cards. Instantly extract fine print, identify hidden fees, and translate to simple English or Hindi.",
      color: "from-blue-500/20 to-indigo-500/20 border-blue-500/30",
      iconColor: "text-blue-500",
    },
    {
      icon: TrendingUp,
      title: "Financial Life Simulator",
      description: "Step into an interactive sandbox. Simulate life-altering choices like buying a car, taking a home loan, investing in stocks, or facing a sudden job loss. See live net worth projections.",
      color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
      iconColor: "text-emerald-500",
    },
    {
      icon: MessageSquare,
      title: "AI Money Mentor",
      description: "Engage with a personalized voice-enabled financial mentor. Ask questions, receive tailored advice, and explore core economic principles in conversational English or Hindi.",
      color: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
      iconColor: "text-purple-500",
    },
    {
      icon: ShieldAlert,
      title: "Scam Shield",
      description: "Protect your hard-earned cash. Upload screenshots of suspicious SMS messages, WhatsApp requests, phishing emails, or website links. AI calculates scam risks and outlines warning signs.",
      color: "from-red-500/20 to-orange-500/20 border-red-500/30",
      iconColor: "text-red-500",
    },
    {
      icon: BookOpen,
      title: "Financial Lessons",
      description: "Level up with bite-sized, gamified guides. From compound interest to tax brackets, master financial basics and track your progress through visual milestones.",
      color: "from-amber-500/20 to-yellow-500/20 border-amber-500/30",
      iconColor: "text-amber-500",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[120px] dark:bg-blue-500/15" />
      <div className="absolute top-1/2 right-10 -z-10 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-[100px] dark:bg-emerald-500/10" />

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 lg:px-8 lg:pt-32">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center space-x-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium">Democratizing Financial Literacy with AI</span>
          </div>

          <h1 className="mx-auto max-w-4xl font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight leading-none text-foreground">
            Take Control of Your Future with{" "}
            <span className="bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              FinVerse AI
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-muted-foreground">
            Understand contracts in simple terms, simulate life scenarios risk-free, get personalized financial advice, and shield yourself from online scams.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-blue-500/20 font-medium">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 text-base rounded-xl font-medium border-border/60 hover:bg-muted/50">
                Explore Features
              </Button>
            </a>
          </div>
        </motion.div>
      </section>

      {/* Trust & Stats Section */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 border-y border-border/40 bg-muted/20 backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <Coins className="h-8 w-8 text-blue-500 mb-2" />
            <h3 className="text-lg font-semibold">100% Risk Free Sandbox</h3>
            <p className="text-sm text-muted-foreground mt-1">Simulate life decisions before you commit money</p>
          </div>
          <div className="flex flex-col items-center">
            <ShieldCheck className="h-8 w-8 text-emerald-500 mb-2" />
            <h3 className="text-lg font-semibold">Privacy First Design</h3>
            <p className="text-sm text-muted-foreground mt-1">Your documents and inputs are private and secured</p>
          </div>
          <div className="flex flex-col items-center">
            <Users className="h-8 w-8 text-purple-500 mb-2" />
            <h3 className="text-lg font-semibold">Bilingual AI Mentor</h3>
            <p className="text-sm text-muted-foreground mt-1">Learn complex finance in English & Hindi</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Powered by Next-Gen Intelligence
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Discover a full suite of tools designed to build your financial competence and keep you secure.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`glass-card p-8 rounded-2xl flex flex-col justify-between border bg-gradient-to-br ${feature.color}`}
            >
              <div>
                <div className={`p-3 rounded-xl bg-background/80 w-fit mb-6 shadow-sm border border-border/10`}>
                  <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  {feature.description}
                </p>
              </div>
              <Link href="/login" className="flex items-center text-sm font-semibold text-primary hover:underline group mt-auto w-fit">
                Try it out
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 mb-24">
        <div className="relative glass-card border border-primary/20 overflow-hidden rounded-3xl p-8 sm:p-16 bg-gradient-to-br from-blue-950/20 via-background to-emerald-950/20 text-center">
          <div className="absolute inset-0 -z-10 bg-radial-gradient opacity-50" />
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Ready to master your financial destiny?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Sign up now to decode your first document, run a simulated investment model, or consult our AI Money Mentor.
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/register">
              <Button size="lg" className="h-12 px-8 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg font-semibold">
                Get Started for Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/50 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} FinVerse AI. All rights reserved. Built with Next.js 15, Firebase, and Gemini.
        </div>
      </footer>
    </div>
  );
}

