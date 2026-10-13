'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { UploadCloud, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, FileCode, Terminal, Shield, Zap, Lock } from 'lucide-react';

interface StepperStage {
  id: number;
  label: string;
  detail: string;
  timeMs: number;
}

const STEPS: StepperStage[] = [
  {
    id: 1,
    label: 'Decompressing SquashFS V4.0 filesystem...',
    detail: 'Extracted 1,482 files, 42 shared ELF libraries, and init scripts.',
    timeMs: 650
  },
  {
    id: 2,
    label: 'Instrumenting MIPS32el binary symbols...',
    detail: 'Recovered stripped function table: 34 libc sinks (memcpy, system, sprintf).',
    timeMs: 800
  },
  {
    id: 3,
    label: 'Booting ephemeral Firecracker MicroVM (Cold-start: 62ms)...',
    detail: 'Synthetic NVRAM initialized. MMIO hooks mapped to 0x1E000000 - 0x1E00FFFF.',
    timeMs: 750
  },
  {
    id: 4,
    label: 'Synthesizing shortest exploit path to root peripheral...',
    detail: 'Dijkstra solver identified 4-hop chain: BLE GATT -> SUID nvram_set -> Root Shell.',
    timeMs: 900
  }
];

const PRESETS = [
  {
    name: 'IP-Cam Vendor FW',
    file: 'dahua_ipc_hfw4431r_v2.800.bin',
    arch: 'ARMv7-A',
    size: '14.8 MB',
    desc: 'HiSilicon SoC, SquashFS, uHTTPd web service'
  },
  {
    name: 'Smart Meter Gateway',
    file: 'landis_gw_e650_mips.img',
    arch: 'MIPS32el',
    size: '8.4 MB',
    desc: 'Mediatek MT7688, Zigbee + BLE stack, lighttpd'
  },
  {
    name: 'Automotive ECU',
    file: 'bosch_md1_tricore_sec.hex',
    arch: 'TriCore TC397',
    size: '4.2 MB',
    desc: 'AUTOSAR Classic, CAN FD bus, Hardware Security Module'
  }
];

export default function FirmwareDropzoneTerminal() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const startScan = (presetName: string, fileName: string, arch: string) => {
    setSelectedPreset(presetName);
    setScanning(true);
    setScanComplete(false);
    setCurrentStep(1);
    setTerminalLogs([
      `[INGEST] Received archive: ${fileName}`,
      `[SECURITY] Air-gap isolated container allocated (pod-firecracker-${Math.random().toString(36).substring(7)})`,
      `[SHA256] 9b2d8471fa2889270e5b7cb89104fae10820bb7f4e912781498c1192837419ef`,
      `[PROVENANCE] Authorizing test payload under owner certified attestation.`
    ]);

    let stepIdx = 1;
    const interval = setInterval(() => {
      if (stepIdx < STEPS.length) {
        stepIdx += 1;
        setCurrentStep(stepIdx);
        setTerminalLogs((prev) => [
          ...prev,
          `[STAGE ${stepIdx}] ${STEPS[stepIdx - 1].label}`,
          `[STAGE ${stepIdx}_RESULT] ${STEPS[stepIdx - 1].detail}`
        ]);
      } else {
        clearInterval(interval);
        setScanning(false);
        setScanComplete(true);
        setTerminalLogs((prev) => [
          ...prev,
          `[COMPLETE] Autonomous discovery finished in 3.12s.`,
          `[EXPLOIT_CHAIN] Zero-Day buffer overflow confirmed SAT in angr Z3 solver.`,
          `[BLAST_RADIUS] Unauthenticated BLE remote attacker escalates to UID 0.`
        ]);
      }
    }, 850);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const validExtensions = ['.bin', '.img', '.hex', '.elf', '.tar', '.gz', '.squashfs', '.rom', '.fw', '.iso'];
      const ext = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')).toLowerCase() : '';

      if (!validExtensions.includes(ext)) {
        setTerminalLogs([
          `[ERROR] Ingestion rejected: "${file.name}" is not a recognized IoT firmware binary format.`,
          `[FAIL] Supported extensions: ${validExtensions.join(', ')}`,
          `[HINT] Ensure raw firmware dumps, U-Boot images, or SquashFS filesystems are provided.`
        ]);
        setScanning(false);
        setScanComplete(false);
        return;
      }

      if (file.size > 256 * 1024 * 1024) {
        setTerminalLogs([
          `[ERROR] Payload entity too large: "${file.name}" exceeds the 256MB memory ingestion limit.`,
          `[FAIL] Archive size: ${(file.size / (1024 * 1024)).toFixed(1)} MB`
        ]);
        setScanning(false);
        return;
      }

      startScan('Custom Binary', file.name, 'Auto-Detect MIPS/ARM');
    } else {
      startScan(PRESETS[0].name, PRESETS[0].file, PRESETS[0].arch);
    }
  };


  return (
    <section id="dropzone" className="relative py-16 sm:py-24 border-t border-zinc-border/60 bg-void-950/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-void-900 border border-zinc-border text-xs font-mono text-neon-cyan mb-3">
            <Lock className="w-3.5 h-3.5" />
            AIR-GAPPED SIMULATION ENVIRONMENT
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-heading text-white tracking-tight">
            Tactile Firmware Ingestion
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-400 font-sans max-w-2xl">
            Drop raw IoT vendor firmware images for automated deconstruction, MicroVM peripheral synthesis,
            and symbolic taint path generation.
          </p>
        </div>

        {/* Main Terminal Window Frame */}
        <div className="rounded-3xl border border-zinc-border bg-void-900/90 shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-2xl">
          {/* Terminal Titlebar */}
          <div className="px-5 py-3.5 border-b border-zinc-border/70 bg-void-950/80 flex items-center justify-between font-mono text-xs text-zinc-400">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-zinc-700/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-zinc-700/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-zinc-700/80 inline-block" />
              <span className="ml-2 font-bold text-zinc-300">sentinelforge-ingest-v2.bin</span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-neon-cyan">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
                ISOLATED SANDBOX
              </span>
              <span className="hidden sm:inline text-zinc-500">MAX: 512MB ARCHIVE</span>
            </div>
          </div>

          {/* Interactive Ingestion Content */}
          <div className="p-6 sm:p-8 flex flex-col gap-6">
            
            {/* Drag and Drop Box */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => {
                if (!scanning) startScan(PRESETS[0].name, PRESETS[0].file, PRESETS[0].arch);
              }}
              className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${
                isDragging
                  ? 'border-neon-cyan bg-neon-cyan/5 shadow-[0_0_30px_rgba(0,240,255,0.15)]'
                  : 'border-zinc-border hover:border-zinc-500 bg-void-950/50 hover:bg-void-950/70'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-void-800 border border-zinc-border flex items-center justify-center text-neon-cyan shadow-lg">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="font-heading font-bold text-base sm:text-lg text-white">
                  Drop firmware binary (<span className="text-neon-cyan">.bin</span>, <span className="text-neon-cyan">.hex</span>, <span className="text-neon-cyan">.img</span>)
                </div>
                <div className="text-xs font-mono text-zinc-400">
                  Or click to execute real-time automated zero-day analysis
                </div>
              </div>
            </div>

            {/* Quick-Pick Demo Payloads */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                Or select pre-staged sample firmware:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    disabled={scanning}
                    onClick={() => startScan(preset.name, preset.file, preset.arch)}
                    className={`p-3.5 rounded-xl border text-left font-mono transition-all flex flex-col gap-1 ${
                      selectedPreset === preset.name
                        ? 'border-neon-cyan/60 bg-neon-cyan/10 shadow-[0_0_20px_rgba(0,240,255,0.1)]'
                        : 'border-zinc-border bg-void-950/60 hover:border-zinc-600 hover:bg-void-950'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span>{preset.name}</span>
                      <span className="text-[10px] text-neon-cyan px-1.5 py-0.5 rounded bg-neon-cyan/10 border border-neon-cyan/20">
                        {preset.arch}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate">{preset.file}</div>
                    <div className="text-[10px] text-zinc-500 mt-1">{preset.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Progress Stepper (Active during scan or completed) */}
            {(scanning || scanComplete) && (
              <div className="p-5 rounded-2xl bg-void-950 border border-zinc-border flex flex-col gap-4">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-white font-bold flex items-center gap-2">
                    {scanning ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 text-neon-cyan animate-spin" />
                        <span>ANALYSIS IN PROGRESS &bull; STAGE {currentStep} OF 4</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-neon-emerald" />
                        <span>ZERO-DAY ATTACK GRAPH SYNTHESIZED</span>
                      </>
                    )}
                  </span>
                  <span className="text-zinc-400 font-bold">
                    {scanComplete ? '100% COMPLETE' : `${currentStep * 25}%`}
                  </span>
                </div>

                {/* Stepper Progress Bar */}
                <div className="w-full h-1.5 bg-void-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all duration-500 shadow-[0_0_12px_rgba(0,240,255,0.6)]"
                    style={{ width: `${scanComplete ? 100 : currentStep * 25}%` }}
                  />
                </div>

                {/* 4 Pipeline Stages */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {STEPS.map((step) => {
                    const isDone = currentStep > step.id || scanComplete;
                    const isCurrent = currentStep === step.id && scanning;

                    return (
                      <div
                        key={step.id}
                        className={`p-3 rounded-xl border font-mono text-xs transition-all ${
                          isDone
                            ? 'border-neon-emerald/30 bg-neon-emerald/5 text-zinc-300'
                            : isCurrent
                            ? 'border-neon-cyan/50 bg-neon-cyan/10 text-white shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                            : 'border-zinc-border/40 bg-void-900/40 text-zinc-600'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold mb-1">
                          {isDone ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-neon-emerald" />
                          ) : isCurrent ? (
                            <span className="w-2 h-2 rounded-full bg-neon-cyan animate-ping" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-zinc-700" />
                          )}
                          <span>{step.label}</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 pl-4">{step.detail}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Live Terminal Stream Output */}
                <div className="p-3.5 rounded-xl bg-void-900 border border-zinc-border/60 font-mono text-[11px] text-zinc-300 max-h-36 overflow-y-auto space-y-1">
                  {terminalLogs.map((log, i) => (
                    <div key={i} className="flex gap-2 leading-relaxed">
                      <span className="text-zinc-600">&gt;</span>
                      <span
                        className={
                          log.includes('[COMPLETE]')
                            ? 'text-neon-emerald font-bold'
                            : log.includes('Zero-Day') || log.includes('EXPLOIT_CHAIN')
                            ? 'text-neon-crimson font-bold'
                            : log.includes('[STAGE')
                            ? 'text-neon-cyan'
                            : 'text-zinc-400'
                        }
                      >
                        {log}
                      </span>
                    </div>
                  ))}
                  <div ref={terminalEndRef} />
                </div>

                {/* Action CTA when complete */}
                {scanComplete && (
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-border/60">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="px-2 py-0.5 rounded bg-neon-crimson/20 border border-neon-crimson/40 text-neon-crimson font-bold">
                        SF-ZERO-2026-001 (CRITICAL 9.8)
                      </span>
                      <span className="text-zinc-400">BLE GATT Memory Corruption</span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs">
                      <Link
                        href="/attack-graph"
                        className="px-4 py-2 rounded-xl bg-neon-cyan text-void-950 font-bold hover:bg-neon-cyan/90 transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] flex items-center gap-1.5"
                      >
                        <span>Inspect Attack Graph</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href="/pipeline"
                        className="px-4 py-2 rounded-xl bg-void-900 hover:bg-void-800 border border-zinc-border text-white transition-all flex items-center gap-1.5"
                      >
                        <span>Full Taint Pipeline</span>
                      </Link>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        </div>

      </div>
    </section>
  );
}
