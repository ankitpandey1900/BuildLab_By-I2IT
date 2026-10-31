"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[var(--bg-canvas)] relative overflow-hidden">
      {/* Ambient background glow & subtle dot grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_50%_35%,rgba(59,130,246,0.12),transparent_60%)]" 
      />
      <div 
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)"
        }}
      />

      {/* Main Glassmorphic Card */}
      <section 
        className="relative w-full max-w-[420px] rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-[0_20px_50px_rgba(0,0,0,0.45)] p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200"
        style={{ backgroundColor: "var(--bg-surface)" }}
      >
        
        {/* Brand Header */}
        <div className="flex items-center gap-3.5">
          <img 
            src="/icon.webp" 
            alt="BuildLab" 
            className="w-12 h-12 rounded-xl object-contain shrink-0 shadow-md" 
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-[var(--text-pure)] tracking-tight">
                BuildLab
              </span>
              <span className="text-[10.5px] font-mono text-[var(--text-tertiary)] border border-[var(--border-subtle)] px-2 py-0.5 rounded-md bg-[var(--bg-surface-elevated)] whitespace-nowrap">
                by I2IT
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-tertiary)] font-mono">
              Open-Source Campus Engineering
            </p>
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-1.5">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-pure)]">
            Join the Community
          </h1>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Turn your academic assignments, hackathon projects, and prototypes into verified open-source software.
          </p>
        </div>

        {/* Primary CTA */}
        <div className="space-y-3 pt-1">
          <Link
            href="/dashboard"
            className="w-full h-11 px-5 rounded-xl bg-[var(--text-pure)] text-[var(--text-inverse)] hover:opacity-90 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm group cursor-pointer"
          >
            <span>Enter Workspace</span>
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="pt-4 border-t border-[var(--border-subtle)] space-y-2 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span>Discover student repositories & issues</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
            <span>1-on-1 mentor guidance & code review</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
            <span>Verified PRN contributor accreditation</span>
          </div>
        </div>

        {/* Institutional Footer */}
        <p className="text-[10.5px] text-[var(--text-tertiary)] text-center font-mono pt-2 border-t border-[var(--border-subtle)]">
          Hope Foundation&apos;s International Institute of Information Technology, Pune
        </p>
      </section>
    </main>
  );
}
