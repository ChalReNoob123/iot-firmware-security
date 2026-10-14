'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, Terminal, Shield, Zap, Sparkles, ChevronRight, Activity, Layers, Cpu, ShieldAlert } from 'lucide-react';
import SpatialSocChip from '@/components/canvas/SpatialSocChip';
import ExplodedPcbHero from '@/components/3d/ExplodedPcbHero';

export default function HeroSection() {
  const [active3DMode, setActive3DMode] = useState<'SPATIAL_SOC' | 'EXPLODED_PCB'>('SPATIAL_SOC');

  return (
    <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden flex flex-col items-center">
      {/* Background Radial Glow & Gradient Mesh */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-neon-cyan/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[350px] bg-neon-purple/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Center Hero Content Container */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center z-10">
        
        {/* Kinetic Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-void-900/90 border border-zinc-border text-xs font-mono text-zinc-300 backdrop-blur-xl mb-6 sm:mb-8 shadow-[0_0_20px_rgba(0,0,0,0.8)]"
        >
          <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
          <span className="text-white font-semibold">SENTINELFORGE 2.0</span>
          <span className="text-zinc-500">&bull;</span>
          <span className="text-neon-cyan font-bold">INDUSTRIAL FIRMWARE VULNERABILITY INTELLIGENCE</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
        </motion.div>

        {/* High-Impact Multi-Line Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-heading tracking-tight text-white leading-[1.05] max-w-5xl"
        >
          Autonomous Firmware Intelligence.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-purple drop-shadow-[0_0_35px_rgba(0,240,255,0.35)]">
            Zero Hardware Required.
          </span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl text-zinc-400 font-sans max-w-3xl leading-relaxed"
        >
          Deconstruct proprietary IoT binaries, emulate non-standard peripherals in ephemeral MicroVMs,
          and synthesize multi-hop attack graphs with neural fuzzing guidance.
        </motion.p>

        {/* Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 font-mono text-xs sm:text-sm"
        >
          {/* Flagship Vulnerability Workbench Button */}
          <Link
            href="/vulnerabilities"
            className="px-6 py-3.5 rounded-full bg-gradient-to-r from-neon-crimson via-neon-amber to-neon-cyan text-white font-black hover:opacity-95 transition-all duration-300 shadow-[0_0_35px_rgba(255,0,85,0.4)] flex items-center gap-2 group"
          >
            <ShieldAlert className="w-4 h-4 text-white animate-pulse" />
            <span>Launch Vulnerability Workbench</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>

          <a
            href="#dropzone"
            className="px-6 py-3.5 rounded-full bg-void-800/90 hover:bg-void-700 border border-neon-cyan/40 text-white font-bold transition-all duration-300 shadow-[0_0_20px_rgba(0,240,255,0.2)] flex items-center gap-2 group"
          >
            <Terminal className="w-4 h-4 text-neon-cyan" />
            <span>Drop Firmware Binary</span>
          </a>

          <Link
            href="/dashboard"
            className="px-6 py-3.5 rounded-full bg-void-900/80 hover:bg-void-800 border border-zinc-border text-zinc-300 hover:text-white transition-all duration-300 backdrop-blur-xl flex items-center gap-2"
          >
            <Activity className="w-4 h-4 text-neon-cyan" />
            <span>Operator Console</span>
          </Link>

          <Link
            href="/attack-graph"
            className="px-6 py-3.5 rounded-full bg-void-900/60 hover:bg-void-800 border border-zinc-border text-zinc-300 hover:text-white transition-all duration-300 backdrop-blur-xl flex items-center gap-2"
          >
            <Shield className="w-4 h-4 text-neon-crimson" />
            <span>3D Attack Graph</span>
          </Link>
        </motion.div>

        {/* Real-Time Telemetry Ticker Readout Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 sm:mt-16 w-full max-w-4xl py-2.5 px-4 rounded-xl bg-void-900/70 border border-zinc-border/70 backdrop-blur-xl flex items-center justify-between text-[11px] font-mono text-zinc-400 overflow-x-auto scrollbar-none"
        >
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <span className="flex items-center gap-1.5 text-neon-cyan font-bold">
              <span className="w-2 h-2 rounded-full bg-neon-cyan animate-ping" />
              TELEMETRY:
            </span>
            <span className="text-zinc-300">[DISASSEMBLY: CAPSTONE & GHIDRA]</span>
            <span className="text-zinc-600">&bull;</span>
            <span className="text-zinc-300">[EXTRACT: SQUASHFS/UBIFS]</span>
            <span className="text-zinc-600">&bull;</span>
            <span className="text-zinc-300">[SANDBOX: KVM/FIRECRACKER]</span>
            <span className="text-zinc-600">&bull;</span>
            <span className="text-zinc-300">[CHECKSEC: NX/CANARY/PIE]</span>
          </div>
          <span className="text-zinc-500 hidden md:block shrink-0">
            LATENCY: 0.8ms &bull; CLUSTER: US-EAST-1
          </span>
        </motion.div>

        {/* 3D Visual Model Switcher Pill Bar */}
        <div className="mt-8 flex items-center gap-2 p-1.5 rounded-xl bg-void-900/90 border border-zinc-800 backdrop-blur-xl font-mono text-xs">
          <button
            onClick={() => setActive3DMode('SPATIAL_SOC')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all ${
              active3DMode === 'SPATIAL_SOC'
                ? 'bg-neon-cyan text-void-950 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>SoC Architecture & Pinout</span>
          </button>

          <button
            onClick={() => setActive3DMode('EXPLODED_PCB')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all ${
              active3DMode === 'EXPLODED_PCB'
                ? 'bg-neon-purple text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Exploded PCB Substrate</span>
          </button>
        </div>

        {/* Central 3D Spatial Canvas Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 w-full relative"
        >
          {active3DMode === 'SPATIAL_SOC' && <SpatialSocChip />}
          {active3DMode === 'EXPLODED_PCB' && (
            <div className="w-full h-[520px] rounded-2xl bg-void-950 border border-zinc-800 overflow-hidden relative shadow-2xl p-4">
              <ExplodedPcbHero />
            </div>
          )}
        </motion.div>

        {/* Micro-Metrics Quad Bar */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-4xl font-mono text-left">
          <div className="p-4 rounded-2xl bg-void-900/60 border border-zinc-border">
            <div className="text-[11px] text-zinc-500 uppercase tracking-wider">Cold-Start Boot</div>
            <div className="text-2xl font-bold font-heading text-white mt-1">62ms</div>
            <div className="text-[10px] text-neon-cyan mt-0.5">Firecracker microVM</div>
          </div>
          <div className="p-4 rounded-2xl bg-void-900/60 border border-zinc-border">
            <div className="text-[11px] text-zinc-500 uppercase tracking-wider">Mutation Rate</div>
            <div className="text-2xl font-bold font-heading text-white mt-1">1,840/s</div>
            <div className="text-[10px] text-neon-cyan mt-0.5">AI-steered AFL++</div>
          </div>
          <div className="p-4 rounded-2xl bg-void-900/60 border border-zinc-border">
            <div className="text-[11px] text-zinc-500 uppercase tracking-wider">Lateral Attack Chains</div>
            <div className="text-2xl font-bold font-heading text-white mt-1">Dijkstra</div>
            <div className="text-[10px] text-neon-purple mt-0.5">Weighted resistance cost</div>
          </div>
          <div className="p-4 rounded-2xl bg-void-900/60 border border-zinc-border">
            <div className="text-[11px] text-zinc-500 uppercase tracking-wider">Vulnerability Intelligence</div>
            <div className="text-2xl font-bold font-heading text-white mt-1">CISA KEV</div>
            <div className="text-[10px] text-neon-emerald mt-0.5">CVSS v4.0 & EPSS 3.0</div>
          </div>
        </div>

      </div>
    </section>
  );
}
