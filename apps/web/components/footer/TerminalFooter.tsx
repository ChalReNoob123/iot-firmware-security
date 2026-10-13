'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, ArrowUpRight, Github, Terminal, Activity, CheckCircle2 } from 'lucide-react';

export default function TerminalFooter() {
  return (
    <footer className="border-t border-zinc-border bg-void-950 text-zinc-400 font-mono text-xs py-12 px-4 sm:px-6 relative">
      <div className="max-w-6xl mx-auto flex flex-col gap-10">
        
        {/* Top Operational Status Banner */}
        <div className="p-4 rounded-2xl bg-void-900 border border-zinc-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-neon-emerald animate-pulse shrink-0" />
            <span className="text-white font-bold text-xs sm:text-sm">
              ALL RUNNER PODS OPERATIONAL [US-EAST-1 / EU-CENTRAL]
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-zinc-500">
            <span>UPTIME: 99.98%</span>
            <span>&bull;</span>
            <span>MEDIAN COLD-START: 62ms</span>
            <span>&bull;</span>
            <span className="text-neon-cyan">ZERO-DAY ENGINE: READY</span>
          </div>
        </div>

        {/* Main Footer Link Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="flex flex-col gap-3">
            <span className="text-white font-bold tracking-wider text-xs uppercase">Platform</span>
            <Link href="/pipeline" className="hover:text-neon-cyan transition-colors">
              10-Stage Pipeline
            </Link>
            <Link href="/emulator" className="hover:text-neon-cyan transition-colors">
              Digital Twin (MicroVM)
            </Link>
            <Link href="/attack-graph" className="hover:text-neon-cyan transition-colors">
              Attack Graph Solver
            </Link>
            <Link href="/war-room" className="hover:text-neon-cyan transition-colors">
              Live Incident War-Room
            </Link>
          </div>

          {/* Col 2 */}
          <div className="flex flex-col gap-3">
            <span className="text-white font-bold tracking-wider text-xs uppercase">Engines</span>
            <Link href="/patch-studio" className="hover:text-neon-cyan transition-colors">
              Binary Hotpatch Studio
            </Link>
            <Link href="/genome" className="hover:text-neon-cyan transition-colors">
              Firmware Genome AI
            </Link>
            <Link href="/side-channel" className="hover:text-neon-cyan transition-colors">
              Side-Channel & Fault Injection
            </Link>
            <Link href="/terminal" className="hover:text-neon-cyan transition-colors">
              WebSerial / QEMU Terminal
            </Link>
          </div>

          {/* Col 3 */}
          <div className="flex flex-col gap-3">
            <span className="text-white font-bold tracking-wider text-xs uppercase">Compliance</span>
            <Link href="/sbom-vex" className="hover:text-neon-cyan transition-colors">
              CycloneDX 1.5 SBOM
            </Link>
            <Link href="/reports" className="hover:text-neon-cyan transition-colors">
              EU Cyber Resilience Act (CRA)
            </Link>
            <Link href="/reports" className="hover:text-neon-cyan transition-colors">
              NIST SP 800-218 (SSDF)
            </Link>
            <Link href="/admin" className="hover:text-neon-cyan transition-colors">
              Sovereign Operator Vault
            </Link>
          </div>

          {/* Col 4 */}
          <div className="flex flex-col gap-3">
            <span className="text-white font-bold tracking-wider text-xs uppercase">Resources</span>
            <a
              href="https://github.com/ChalReNoob123/iot-firmware-security"
              target="_blank"
              rel="noreferrer"
              className="hover:text-neon-cyan transition-colors flex items-center gap-1.5"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub Repository</span>
              <ArrowUpRight className="w-3 h-3 text-zinc-500" />
            </a>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="hover:text-neon-cyan transition-colors flex items-center gap-1.5"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>API Reference (Swagger)</span>
              <ArrowUpRight className="w-3 h-3 text-zinc-500" />
            </a>
            <span className="text-zinc-500">Playwright E2E Suite: 28 Passed</span>
            <span className="text-zinc-500">NIST IR 8259A &bull; MITRE EMB3D</span>
          </div>
        </div>

        {/* Bottom Micro-Bar */}
        <div className="pt-8 border-t border-zinc-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-neon-cyan" />
            <span>&copy; {new Date().getFullYear()} SENTINELFORGE &bull; DEFENSIVE EMBEDDED RESEARCH</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-zinc-400">APACHE 2.0 LICENSE</span>
            <span>&bull;</span>
            <span className="text-zinc-400">SECURE AIR-GAP STANDARD</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
