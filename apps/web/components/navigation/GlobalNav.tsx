'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Terminal, ArrowUpRight, Menu, X, Cpu, GitPullRequest, FileCheck, Layers } from 'lucide-react';

export default function GlobalNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 sm:pt-6 pointer-events-none">
      <nav
        aria-label="Global Navigation"
        className={`pointer-events-auto w-full max-w-5xl transition-all duration-300 rounded-full px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between border ${
          scrolled
            ? 'bg-void-900/85 backdrop-blur-2xl border-zinc-border shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(0,240,255,0.08)]'
            : 'bg-void-900/60 backdrop-blur-xl border-zinc-border/70 shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
        }`}
      >
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-border flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-neon-cyan/60 group-hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Shield className="w-4 h-4 text-neon-cyan transition-transform duration-300 group-hover:scale-110" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-black text-xs sm:text-sm tracking-[0.2em] text-white flex items-center">
              SENTINEL<span className="text-neon-cyan">FORGE</span>
            </span>
            <span className="text-[9px] font-mono tracking-widest text-zinc-400 uppercase -mt-0.5">
              MICROVM &bull; EMBEDDED ZERO-DAY
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2 text-xs font-mono">
          <Link
            href="/vulnerabilities"
            className="px-3 py-1.5 rounded-full text-neon-crimson hover:text-white hover:bg-neon-crimson/15 transition-all flex items-center gap-1.5 font-bold border border-neon-crimson/30 shadow-[0_0_10px_rgba(255,0,85,0.2)]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-neon-crimson animate-pulse" />
            <span>Vulnerabilities</span>
          </Link>
          <a
            href="#dropzone"
            className="px-3 py-1.5 rounded-full text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
          >
            Dropzone
          </a>
          <a
            href="#capabilities"
            className="px-3 py-1.5 rounded-full text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
          >
            Platform
          </a>
          <a
            href="#emulation"
            className="px-3 py-1.5 rounded-full text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
          >
            Emulation Engine
          </a>
          <a
            href="#attack-graph"
            className="px-3 py-1.5 rounded-full text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
          >
            Attack Graphs
          </a>
          <a
            href="#compliance"
            className="px-3 py-1.5 rounded-full text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
          >
            Compliance (CRA)
          </a>
          <Link
            href="/emulator"
            className="px-3 py-1.5 rounded-full text-zinc-400 hover:text-neon-cyan hover:bg-zinc-800/40 transition-colors flex items-center gap-1"
          >
            Twin <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="relative group inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-mono font-semibold tracking-wider text-white bg-void-800 border border-neon-cyan/40 hover:border-neon-cyan transition-all duration-300 shadow-[0_0_12px_rgba(0,240,255,0.2)] hover:shadow-[0_0_25px_rgba(0,240,255,0.4)]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
            <span className="hidden sm:inline">LAUNCH</span> CONSOLE
            <ArrowUpRight className="w-3 h-3 text-neon-cyan transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white rounded-full bg-void-800 border border-zinc-border"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto md:hidden fixed inset-x-4 top-20 bg-void-900/95 backdrop-blur-2xl border border-zinc-border rounded-2xl p-4 shadow-2xl flex flex-col gap-2 font-mono text-xs z-50">
          <Link
            href="/vulnerabilities"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2.5 rounded-xl text-neon-crimson bg-neon-crimson/10 border border-neon-crimson/30 hover:bg-neon-crimson/20 flex items-center justify-between"
          >
            <div className="flex items-center gap-2 font-bold">
              <span className="w-2 h-2 rounded-full bg-neon-crimson animate-pulse" />
              <span>Vulnerability Intelligence</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-neon-crimson text-white font-black">
              LIVE KEV
            </span>
          </Link>
          <a
            href="#dropzone"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2.5 rounded-xl text-zinc-200 hover:bg-zinc-800 flex items-center gap-2"
          >
            <Layers className="w-4 h-4 text-neon-cyan" /> Firmware Dropzone
          </a>
          <a
            href="#capabilities"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2.5 rounded-xl text-zinc-200 hover:bg-zinc-800 flex items-center gap-2"
          >
            <Cpu className="w-4 h-4 text-neon-cyan" /> Platform Capabilities
          </a>
          <a
            href="#emulation"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2.5 rounded-xl text-zinc-200 hover:bg-zinc-800 flex items-center gap-2"
          >
            <Terminal className="w-4 h-4 text-neon-cyan" /> Emulation Engine (MicroVM)
          </a>
          <a
            href="#attack-graph"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2.5 rounded-xl text-zinc-200 hover:bg-zinc-800 flex items-center gap-2"
          >
            <GitPullRequest className="w-4 h-4 text-neon-cyan" /> Attack Graphs & Blast Radius
          </a>
          <a
            href="#compliance"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2.5 rounded-xl text-zinc-200 hover:bg-zinc-800 flex items-center gap-2"
          >
            <FileCheck className="w-4 h-4 text-neon-cyan" /> Compliance (EU CRA / NIST SSDF)
          </a>
          <div className="pt-2 border-t border-zinc-border flex gap-2">
            <Link
              href="/dashboard"
              className="flex-1 py-2 rounded-xl bg-neon-cyan text-void-900 font-bold text-center"
            >
              Console
            </Link>
            <Link
              href="/pipeline"
              className="flex-1 py-2 rounded-xl bg-void-800 border border-zinc-border text-center text-zinc-300"
            >
              Pipeline
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
