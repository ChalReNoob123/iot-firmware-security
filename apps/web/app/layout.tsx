import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import AttestationModal from '@/components/AttestationModal';
import FirmwareUploadModal from '@/components/FirmwareUploadModal';
import UploadTriggerButton from '@/components/UploadTriggerButton';
import GlobalCinematicBackdrop from '@/components/motion/GlobalCinematicBackdrop';
import FluidCyberCursor from '@/components/motion/FluidCyberCursor';
import CyberToastNotifier from '@/components/CyberToastNotifier';

export const metadata: Metadata = {
  title: 'SentinelForge | Autonomous IoT Firmware Security & Zero-Day Discovery Platform',
  description:
    'Next-generation defensive security testing platform combining symbolic taint analysis, AI-guided coverage fuzzing, and 3D knowledge-graph attack chaining.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-cyber-bg text-slate-100 min-h-screen flex flex-col antialiased selection:bg-cyber-cyan selection:text-cyber-bg relative">
        {/* Global 3D Ambient Cyber Video Background & Fluid Cursor */}
        <GlobalCinematicBackdrop />
        <FluidCyberCursor />

        {/* Top Cyber Navigation Bar */}
        <header className="sticky top-0 z-40 w-full border-b border-cyber-border/40 bg-cyber-bg/90 backdrop-blur-md">
          <div className="max-w-[1440px] mx-auto px-4 h-14 flex items-center justify-between">
            {/* Brand / Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyber-cyan to-cyber-violet p-[1px]">
                  <div className="w-full h-full bg-cyber-bg rounded-[7px] flex items-center justify-center text-cyber-cyan font-mono font-black text-sm group-hover:scale-105 transition-transform">
                    SF
                  </div>
                </div>
                <div>
                  <span className="font-mono font-bold text-sm tracking-wider text-white flex items-center gap-1.5">
                    SENTINEL<span className="text-cyber-cyan">FORGE</span>
                  </span>
                  <span className="block text-[9px] font-mono text-cyber-muted -mt-1">
                    AUTONOMOUS ZERO-DAY DISCOVERY
                  </span>
                </div>
              </Link>
            </div>

            {/* Nav Links */}
            <nav className="hidden xl:flex items-center gap-0.5 font-mono text-xs">
              <Link href="/dashboard" className="px-2 py-1.5 rounded-md text-slate-300 hover:text-cyber-cyan hover:bg-cyber-card/60 transition-colors">
                Dashboard
              </Link>
              <Link href="/pipeline" className="px-2 py-1.5 rounded-md text-slate-300 hover:text-cyber-cyan hover:bg-cyber-card/60 transition-colors">
                Pipeline
              </Link>
              <Link href="/emulator" className="px-2 py-1.5 rounded-md text-slate-300 hover:text-cyber-cyan hover:bg-cyber-card/60 transition-colors">
                Digital Twin
              </Link>
              <Link href="/attack-graph" className="px-2 py-1.5 rounded-md text-slate-300 hover:text-cyber-cyan hover:bg-cyber-card/60 transition-colors">
                Attack Graph
              </Link>
              <Link href="/war-room" className="px-2 py-1.5 rounded-md text-slate-300 hover:text-cyber-rose hover:bg-cyber-rose/10 transition-colors flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-rose animate-ping" />
                War-Room
              </Link>
              <Link href="/patch-studio" className="px-2 py-1.5 rounded-md text-slate-300 hover:text-cyber-emerald hover:bg-cyber-emerald/10 transition-colors flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-emerald" />
                Patch Studio
              </Link>
              <Link href="/genome" className="px-2 py-1.5 rounded-md text-slate-300 hover:text-cyber-purple hover:bg-cyber-purple/10 transition-colors flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-purple" />
                Genome
              </Link>
              <Link href="/copilot" className="px-2 py-1.5 rounded-md text-slate-300 hover:text-cyber-cyan hover:bg-cyber-card/60 transition-colors flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse" />
                Copilot
              </Link>
              <Link href="/terminal" className="px-2 py-1.5 rounded-md text-slate-300 hover:text-cyber-cyan hover:bg-cyber-card/60 transition-colors">
                Terminal
              </Link>
              <Link href="/sbom-vex" className="px-2 py-1.5 rounded-md text-slate-300 hover:text-cyber-cyan hover:bg-cyber-card/60 transition-colors">
                SBOM
              </Link>
              <Link href="/reports" className="px-2 py-1.5 rounded-md text-slate-300 hover:text-cyber-cyan hover:bg-cyber-card/60 transition-colors">
                Compliance
              </Link>
              <Link href="/side-channel" className="px-2 py-1.5 rounded-md text-slate-300 hover:text-cyber-amber hover:bg-cyber-amber/10 transition-colors flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-amber" />
                Side-Ch
              </Link>
              <Link href="/settings" className="px-2 py-1.5 rounded-md text-slate-300 hover:text-cyber-cyan hover:bg-cyber-card/60 transition-colors">
                Admin
              </Link>
            </nav>

            {/* Quick Actions & Sovereign Operator Clearance */}
            <div className="flex items-center gap-2">
              <UploadTriggerButton />
              <Link
                href="/login"
                className="px-2.5 py-1.5 rounded-lg bg-cyber-surface/80 hover:bg-cyber-card border border-cyber-cyan/40 text-xs font-mono text-cyber-cyan hover:text-white transition-all flex items-center gap-1.5 cyber-liquid-border"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse" />
                <span className="hidden sm:inline">Operator</span> Login
              </Link>
              <Link
                href="/pipeline"
                className="px-3 py-1.5 rounded-lg bg-cyber-cyan text-cyber-bg font-mono font-bold text-xs hover:bg-cyber-cyan/90 transition-all shadow-[0_0_12px_rgba(0,245,212,0.25)] flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-cyber-bg animate-ping" />
                Live Scan
              </Link>
            </div>
          </div>

          {/* Responsive Mobile / Tablet Sub-Navigation */}
          <div className="xl:hidden border-t border-cyber-border/30 bg-cyber-surface/40 backdrop-blur-md px-4 py-1.5 overflow-x-auto flex items-center gap-1.5 font-mono text-xs scrollbar-none">
            <Link href="/dashboard" className="px-2.5 py-1 rounded-md text-slate-300 hover:text-cyber-cyan hover:bg-cyber-card whitespace-nowrap transition-colors">
              Dashboard
            </Link>
            <Link href="/pipeline" className="px-2.5 py-1 rounded-md text-slate-300 hover:text-cyber-cyan hover:bg-cyber-card whitespace-nowrap transition-colors">
              Pipeline
            </Link>
            <Link href="/emulator" className="px-2.5 py-1 rounded-md text-slate-300 hover:text-cyber-cyan hover:bg-cyber-card whitespace-nowrap transition-colors">
              Digital Twin
            </Link>
            <Link href="/attack-graph" className="px-2.5 py-1 rounded-md text-slate-300 hover:text-cyber-cyan hover:bg-cyber-card whitespace-nowrap transition-colors">
              Attack Graph
            </Link>
            <Link href="/war-room" className="px-2.5 py-1 rounded-md text-cyber-rose hover:bg-cyber-rose/10 whitespace-nowrap transition-colors flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-rose animate-ping" />
              War-Room
            </Link>
            <Link href="/patch-studio" className="px-2.5 py-1 rounded-md text-cyber-emerald hover:bg-cyber-emerald/10 whitespace-nowrap transition-colors flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-emerald" />
              Patch Studio
            </Link>
            <Link href="/genome" className="px-2.5 py-1 rounded-md text-cyber-purple hover:bg-cyber-purple/10 whitespace-nowrap transition-colors flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-purple" />
              Genome
            </Link>
            <Link href="/copilot" className="px-2.5 py-1 rounded-md text-slate-300 hover:text-cyber-cyan hover:bg-cyber-card whitespace-nowrap transition-colors">
              Copilot
            </Link>
            <Link href="/terminal" className="px-2.5 py-1 rounded-md text-slate-300 hover:text-cyber-cyan hover:bg-cyber-card whitespace-nowrap transition-colors">
              Terminal
            </Link>
            <Link href="/sbom-vex" className="px-2.5 py-1 rounded-md text-slate-300 hover:text-cyber-cyan hover:bg-cyber-card whitespace-nowrap transition-colors">
              SBOM
            </Link>
            <Link href="/reports" className="px-2.5 py-1 rounded-md text-slate-300 hover:text-cyber-cyan hover:bg-cyber-card whitespace-nowrap transition-colors">
              Compliance
            </Link>
            <Link href="/side-channel" className="px-2.5 py-1 rounded-md text-slate-300 hover:text-cyber-amber hover:bg-cyber-amber/10 whitespace-nowrap transition-colors flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-amber" />
              Side-Ch
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-[1440px] w-full mx-auto p-4 md:p-6 flex flex-col">
          {children}
        </main>

        {/* Global Mandatory Attestation & Firmware Ingestion Modals */}
        <AttestationModal />
        <FirmwareUploadModal />
        <CyberToastNotifier />

        {/* Cyber Footer Telemetry Bar */}
        <footer className="border-t border-cyber-border/40 py-3.5 px-6 text-xs font-mono text-cyber-muted bg-cyber-bg/95 backdrop-blur-md">
          <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Fluid Telemetry Frequency Equalizer */}
              <div className="flex items-end gap-0.5 h-4 w-6 px-0.5 py-0.5 bg-slate-900/80 border border-cyber-cyan/30 rounded">
                <span className="w-1 bg-cyber-cyan rounded-xs animate-eq-1" />
                <span className="w-1 bg-cyber-blue rounded-xs animate-eq-2" />
                <span className="w-1 bg-cyber-purple rounded-xs animate-eq-3" />
                <span className="w-1 bg-cyber-cyan rounded-xs animate-eq-2" />
              </div>
              <span>
                SENTINELFORGE PLATFORM &bull; DEFENSIVE EMBEDDED RESEARCH &bull; NIST IR 8259A &amp; MITRE EMB3D
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5 text-cyber-cyan">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse" />
                AFL++ / angr Core: READY
              </span>
              <span className="flex items-center gap-1.5 text-cyber-emerald">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-emerald" />
                QEMU: 3 IDLE
              </span>
              <span className="flex items-center gap-1.5 text-cyber-purple">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-purple" />
                Genome: 12,480 Indexed
              </span>
              <span className="flex items-center gap-1.5 text-cyber-rose">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-rose opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-rose" />
                </span>
                1 Active Zero-Day
              </span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
