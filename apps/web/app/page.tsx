'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ExplodedPcbHero from '@/components/3d/ExplodedPcbHero';
import ThreatRadarGlobe from '@/components/3d/ThreatRadarGlobe';
import CinematicVideoHero from '@/components/motion/CinematicVideoHero';
import ScrollVideoScrubber from '@/components/motion/ScrollVideoScrubber';
import SplineThreeViewer from '@/components/3d/SplineThreeViewer';
import CyberCinematicHero3D from '@/components/3d/CyberCinematicHero3D';

export default function LandingPage() {
  const [activeHeroMode, setActiveHeroMode] = useState<'HOLOGRAPHIC_CORE' | 'EXPLODED_PCB' | 'CYBER_CORE'>('HOLOGRAPHIC_CORE');

  return (
    <div className="relative flex flex-col gap-14 py-4 overflow-hidden">
      {/* Dynamic Cinematic Video & Particle Motion Background */}
      <CinematicVideoHero />

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col gap-6">
        <div className="flex flex-col gap-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/40 text-cyber-cyan text-xs font-mono w-fit backdrop-blur-md shadow-[0_0_15px_rgba(0,245,212,0.2)]">
            <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-ping" />
            AUTONOMOUS IOT VULNERABILITY DISCOVERY & ZERO-DAY SYNTHESIS
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white font-mono leading-tight">
            BEYOND SIGNATURES.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan via-cyber-blue to-cyber-purple drop-shadow-[0_0_25px_rgba(0,245,212,0.4)]">
              AUTONOMOUS ZERO-DAY DISCOVERY.
            </span>
          </h1>

          <p className="text-sm md:text-base text-slate-200 font-mono leading-relaxed max-w-3xl">
            Most IoT security tools answer <span className="text-cyber-muted italic">&ldquo;does this firmware match a known-bad signature?&rdquo;</span> SentinelForge is built to also answer <span className="text-cyber-cyan font-bold glow-cyan">&ldquo;what could still go wrong that nobody has catalogued yet?&rdquo;</span> — via coverage-guided fuzzing, symbolic taint tracking, and knowledge-graph attack-chain analysis.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/pipeline"
              className="px-5 py-3 rounded-xl bg-cyber-cyan text-cyber-bg font-mono font-bold text-xs sm:text-sm hover:bg-cyber-cyan/90 transition-all shadow-[0_0_25px_rgba(0,245,212,0.4)] flex items-center gap-2 cyber-hover-lift cyber-sheen-sweep"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Launch 10-Stage Pipeline</span>
            </Link>
            <Link
              href="/login"
              className="px-5 py-3 rounded-xl bg-cyber-surface/90 hover:bg-cyber-cardHover border border-cyber-cyan/40 text-cyber-cyan font-mono text-xs sm:text-sm transition-all flex items-center gap-2 backdrop-blur-md cyber-hover-lift cyber-sheen-sweep shadow-[0_0_15px_rgba(0,245,212,0.15)]"
            >
              <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" />
              <span>Operator Clearance</span>
            </Link>
            <Link
              href="/attack-graph"
              className="px-5 py-3 rounded-xl bg-cyber-card/90 hover:bg-cyber-cardHover border border-cyber-border text-white font-mono text-xs sm:text-sm transition-all flex items-center gap-2 backdrop-blur-md cyber-hover-lift cyber-sheen-sweep"
            >
              <svg className="w-4 h-4 text-cyber-rose" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>3D Attack Graph</span>
            </Link>
          </div>
        </div>

        {/* 3D Interactive Hero Viewport Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setActiveHeroMode('HOLOGRAPHIC_CORE')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeHeroMode === 'HOLOGRAPHIC_CORE'
                  ? 'bg-cyber-cyan text-cyber-bg shadow-[0_0_15px_rgba(0,245,212,0.3)]'
                  : 'bg-cyber-surface text-cyber-muted hover:text-white border border-cyber-border'
              }`}
            >
              3D Holographic SoC Core
            </button>
            <button
              onClick={() => setActiveHeroMode('EXPLODED_PCB')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeHeroMode === 'EXPLODED_PCB'
                  ? 'bg-cyber-cyan text-cyber-bg shadow-[0_0_15px_rgba(0,245,212,0.3)]'
                  : 'bg-cyber-surface text-cyber-muted hover:text-white border border-cyber-border'
              }`}
            >
              3D Exploded Hardware PCB
            </button>
            <button
              onClick={() => setActiveHeroMode('CYBER_CORE')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeHeroMode === 'CYBER_CORE'
                  ? 'bg-cyber-purple text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                  : 'bg-cyber-surface text-cyber-muted hover:text-white border border-cyber-border'
              }`}
            >
              3D Spline / Motion Core
            </button>
          </div>

          <div className="text-[11px] font-mono text-cyber-muted hidden md:block">
            INTERACTIVE WEBGL: Mouse Tilt & Parallax Active
          </div>
        </div>

        {/* 3D Main Viewport */}
        <div className="w-full relative">
          {activeHeroMode === 'HOLOGRAPHIC_CORE' ? (
            <CyberCinematicHero3D />
          ) : activeHeroMode === 'EXPLODED_PCB' ? (
            <ExplodedPcbHero />
          ) : (
            <div className="w-full h-[540px] rounded-2xl glass-panel-glow border border-cyber-purple/40 overflow-hidden">
              <SplineThreeViewer />
            </div>
          )}
        </div>
      </section>

      {/* GSAP Scroll-Triggered Video Playhead Scrubber */}
      <section className="relative z-10">
        <ScrollVideoScrubber
          title="Autonomous AFL++ Coverage Fuzzing & Memory Taint Scrubbing"
          subtitle="Scroll page down to scrub instruction playback and observe stack frame corruption in real-time."
        />
      </section>

      {/* Real-Time Telemetry & Threat Radar */}
      <section className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ThreatRadarGlobe />
        </div>
        <div className="lg:col-span-2 glass-panel-glow p-6 rounded-2xl flex flex-col justify-between border border-cyber-border/60">
          <div className="flex items-center justify-between border-b border-cyber-border/40 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyber-cyan animate-pulse" />
              <span className="font-mono text-sm font-bold text-white">LIVE ZERO-DAY DISCOVERY ENGINE STATUS</span>
            </div>
            <span className="text-xs font-mono text-cyber-cyan bg-cyber-cyan/10 px-2.5 py-0.5 rounded border border-cyber-cyan/30">
              CLUSTER: ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 font-mono">
            <div className="p-3.5 rounded-xl bg-cyber-surface/80 border border-cyber-border/60">
              <div className="text-[11px] text-cyber-muted">MUTATIONS EXECUTED</div>
              <div className="text-xl font-bold text-cyber-cyan mt-1">2,481,902</div>
              <div className="text-[10px] text-cyber-emerald mt-0.5">1,840 execs/sec (AFL++)</div>
            </div>
            <div className="p-3.5 rounded-xl bg-cyber-surface/80 border border-cyber-border/60">
              <div className="text-[11px] text-cyber-muted">SYMBOLIC PATHS (SAT)</div>
              <div className="text-xl font-bold text-cyber-purple mt-1">738</div>
              <div className="text-[10px] text-cyber-muted mt-0.5">angr Z3 Solver</div>
            </div>
            <div className="p-3.5 rounded-xl bg-cyber-surface/80 border border-cyber-border/60">
              <div className="text-[11px] text-cyber-muted">AI GUIDANCE GAIN</div>
              <div className="text-xl font-bold text-cyber-blue mt-1">3.8x</div>
              <div className="text-[10px] text-cyber-cyan mt-0.5">Faster coverage reach</div>
            </div>
            <div className="p-3.5 rounded-xl bg-cyber-rose/10 border border-cyber-rose/40">
              <div className="text-[11px] text-cyber-rose font-bold">UNVERIFIED CRASHES</div>
              <div className="text-xl font-bold text-cyber-rose mt-1">4 TRIAGED</div>
              <div className="text-[10px] text-cyber-rose mt-0.5">1 Zero-Day RCE</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-cyber-surface/90 border border-cyber-border/60 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-200">
              <span className="text-cyber-rose font-bold">LATEST ZERO-DAY:</span>
              <span className="truncate max-w-md">SF-ZERO-2026-001 (Stack Overflow in BLE GATT Parser &rarr; memcpy @ +0x98)</span>
            </div>
            <Link href="/pipeline" className="text-cyber-cyan hover:underline flex items-center gap-1 font-bold whitespace-nowrap">
              Inspect Taint Trace &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Core Architectural Differentiators */}
      <section className="relative z-10 flex flex-col gap-6 font-mono">
        <div className="border-b border-cyber-border/40 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">THE AUTONOMOUS DISCOVERY ADVANTAGE</h2>
            <p className="text-xs text-cyber-muted">Engineered for unknown embedded bugs, hardware interfaces, and multi-hop attack chaining.</p>
          </div>
          <span className="text-xs text-cyber-muted hidden md:block">OWASP FSTM & MITRE EMB3D COMPLIANT</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-cyber-cyan/30 hover:border-cyber-cyan/60 transition-all flex flex-col justify-between gap-4 cyber-liquid-border cyber-hover-lift">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-cyber-cyan/20 text-cyber-cyan flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="text-sm font-bold text-white">AI-Guided Coverage Fuzzing</h3>
              <p className="text-xs text-cyber-muted leading-relaxed">
                AFL++ running in QEMU-mode whose mutation strategy is dynamically steered by a learned model trained on the device&apos;s own traffic, targeting unexplored risky code branches.
              </p>
            </div>
            <div className="text-[11px] text-cyber-cyan font-bold">Engine: AFL++ v4.10c + ML Guidance</div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-cyber-purple/30 hover:border-cyber-purple/60 transition-all flex flex-col justify-between gap-4 cyber-liquid-border cyber-hover-lift">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-cyber-purple/20 text-cyber-purple flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="text-sm font-bold text-white">Symbolic Taint Tracking (angr)</h3>
              <p className="text-xs text-cyber-muted leading-relaxed">
                Traces every path from an attacker-controlled input (BLE, USB, Wi-Fi packets) to dangerous sinks (<code>memcpy</code>, <code>system</code>, <code>sprintf</code>) before dynamic test cases run.
              </p>
            </div>
            <div className="text-[11px] text-cyber-purple font-bold">Engine: angr v9.2 SAT Solver</div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-cyber-rose/30 hover:border-cyber-rose/60 transition-all flex flex-col justify-between gap-4 cyber-liquid-border cyber-hover-lift">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-cyber-rose/20 text-cyber-rose flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="text-sm font-bold text-white">Knowledge-Graph Attack Chaining</h3>
              <p className="text-xs text-cyber-muted leading-relaxed">
                Correlates individual low and medium severity findings in a Neo4j knowledge graph to compute shortest paths to complete root takeover.
              </p>
            </div>
            <div className="text-[11px] text-cyber-rose font-bold">Engine: Neo4j 5.18 + APOC Shortest Path</div>
          </div>
        </div>
      </section>
    </div>
  );
}
