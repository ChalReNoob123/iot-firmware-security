'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Terminal, Cpu, GitBranch, Shield, ArrowUpRight, Copy, Check, Play, RefreshCw, Zap, ShieldAlert } from 'lucide-react';

export default function BentoCapabilitiesGrid() {
  // 1. Dynamic MicroVM state
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    '[INIT] firecracker-microvm-kvm initialized (PID 40921)',
    '[MMIO] Virtualized UART0 @ 0x1E784000 [OK]',
    '[HOOK] Synthetic nvram_get("http_auth") -> "BYPASS_MODE"',
    '[WATCH] Intercepted outbound socket connect: 127.0.0.1:80'
  ]);
  const [cmdInput, setCmdInput] = useState('');

  // 2. Fuzzing Live Sparkline State
  const [fuzzExecSpeed, setFuzzExecSpeed] = useState(1840);
  const [coverageDensity, setCoverageDensity] = useState(72.4);
  const [historyPoints, setHistoryPoints] = useState<number[]>([40, 48, 55, 62, 59, 71, 78, 85, 82, 94, 91, 98]);

  useEffect(() => {
    const timer = setInterval(() => {
      setFuzzExecSpeed((prev) => 1840 + Math.floor(Math.random() * 280) - 100);
      setCoverageDensity((prev) => Math.min(99.4, +(prev + 0.1).toFixed(1)));
      setHistoryPoints((prev) => {
        const nextVal = Math.min(100, Math.max(30, prev[prev.length - 1] + Math.floor(Math.random() * 11) - 4));
        return [...prev.slice(1), nextVal];
      });
    }, 1400);
    return () => clearInterval(timer);
  }, []);

  // 4. Hotpatch Diff Copied state
  const [diffCopied, setDiffCopied] = useState(false);

  const handleCopyDiff = () => {
    navigator.clipboard.writeText(`--- a/drivers/bluetooth/ble_ad_parser.c
+++ b/drivers/bluetooth/ble_ad_parser.c
@@ -142,4 +142,7 @@ int parse_ble_advertisement_packet(const uint8_t *data, size_t len) {
+    /* SentinelForge Virtual Patch SF-VIRT-2026-001 */
+    if (len > MAX_BLE_AD_PAYLOAD_SIZE) {
+        return -EINVAL; /* Mitigates buffer overflow prior to memcpy */
+    }
-    memcpy(rx_buf, data, len);
+    memcpy(rx_buf, data, min(len, sizeof(rx_buf)));`);
    setDiffCopied(true);
    setTimeout(() => setDiffCopied(false), 2000);
  };

  const handleRunCommand = (cmd: string) => {
    if (cmd === 'regs') {
      setTerminalOutput((prev) => [
        ...prev,
        `$ ${cmd}`,
        `$pc=0x8004b2a0  $sp=0x7fffdfc8  $ra=0x8004b280`,
        `$a0=0x100234a0  $a1=0x00000400  $v0=0x00000000`
      ]);
    } else if (cmd === 'unhook') {
      setTerminalOutput((prev) => [
        ...prev,
        `$ ${cmd}`,
        `[MMIO] Unhooked peripheral SPI Flash 0x1E000000`,
        `[SIGNAL] SIGSEGV intercepted at illegal bus dereference`
      ]);
    } else {
      setTerminalOutput((prev) => [
        ...prev,
        `$ ${cmd}`,
        `[SYNTHETIC] Executed microVM probe command: ${cmd}`
      ]);
    }
  };

  return (
    <section id="capabilities" className="relative py-16 sm:py-24 border-t border-zinc-border/60 bg-void-900/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Heading */}
        <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-void-900 border border-zinc-border text-xs font-mono text-neon-cyan mb-3">
            <Zap className="w-3.5 h-3.5" />
            CORE ARCHITECTURAL PRIMITIVES
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-heading text-white tracking-tight">
            The Bento Grid Architecture
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-400 font-sans max-w-2xl">
            A cohesive stack built from the ground up for deep firmware reverse-engineering,
            hybrid symbolic fuzzing, and lateral privilege graph synthesis.
          </p>
        </div>

        {/* 4-Card Responsive Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6">
          
          {/* Card 1: Dynamic MicroVM Emulation (lg:col-span-7) */}
          <div className="lg:col-span-7 rounded-3xl border border-zinc-border bg-void-950/80 p-6 sm:p-7 flex flex-col justify-between shadow-2xl backdrop-blur-xl relative overflow-hidden group hover:border-neon-cyan/40 transition-colors">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-zinc-border/60 pb-3 font-mono text-xs">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Terminal className="w-4 h-4 text-neon-cyan" />
                  <span>01. Dynamic MicroVM Emulation</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-[10px]">
                  KVM / FIRECRACKER
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans">
                Boots Linux/VxWorks/eCos firmware in ephemeral KVM microVMs with synthetic NVRAM interceptors
                and automated peripheral memory-mapped I/O (MMIO) loop unrolling.
              </p>
            </div>

            {/* Interactive Terminal Window */}
            <div className="mt-5 rounded-2xl bg-void-900 border border-zinc-border p-4 font-mono text-xs text-zinc-300 flex flex-col gap-3">
              <div className="flex items-center justify-between text-[11px] text-zinc-500 border-b border-zinc-border/40 pb-2">
                <span>vm-worker-pod#08 // MIPS32el</span>
                <span className="text-neon-emerald flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-emerald animate-pulse" />
                  RUNNING
                </span>
              </div>
              <div className="space-y-1 text-[11px] min-h-[90px] overflow-y-auto max-h-[120px]">
                {terminalOutput.map((line, i) => (
                  <div key={i} className="text-zinc-300 font-mono">
                    {line}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-border/40">
                <span className="text-zinc-500 text-[10px]">Quick Probes:</span>
                <button
                  onClick={() => handleRunCommand('regs')}
                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300 border border-zinc-700 transition-colors"
                >
                  $ regs
                </button>
                <button
                  onClick={() => handleRunCommand('unhook')}
                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300 border border-zinc-700 transition-colors"
                >
                  $ unhook MMIO
                </button>
                <Link
                  href="/emulator"
                  className="ml-auto text-[10px] text-neon-cyan hover:underline flex items-center gap-1 font-bold"
                >
                  Full Sandbox &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: Neural Greybox Fuzzing (lg:col-span-5) */}
          <div className="lg:col-span-5 rounded-3xl border border-zinc-border bg-void-950/80 p-6 sm:p-7 flex flex-col justify-between shadow-2xl backdrop-blur-xl relative overflow-hidden group hover:border-neon-cyan/40 transition-colors">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-zinc-border/60 pb-3 font-mono text-xs">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Zap className="w-4 h-4 text-neon-cyan" />
                  <span>02. Neural Greybox Fuzzing</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-neon-purple/10 border border-neon-purple/30 text-neon-purple text-[10px]">
                  AFL++ QEMU
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans">
                Learned branch prediction steers seed mutation directly toward unexercised conditional paths,
                yielding a 3.8x faster code coverage reach.
              </p>
            </div>

            {/* Live Sparkline Graph & Counter */}
            <div className="mt-5 p-4 rounded-2xl bg-void-900 border border-zinc-border font-mono flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase">Executions / Sec</div>
                  <div className="text-xl font-bold font-heading text-white">{fuzzExecSpeed.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-zinc-500 uppercase">Bitmap Density</div>
                  <div className="text-xl font-bold font-heading text-neon-cyan">{coverageDensity}%</div>
                </div>
              </div>

              {/* Dynamic SVG Sparkline */}
              <div className="w-full h-16 relative flex items-end">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 120 40">
                  <defs>
                    <linearGradient id="fuzzGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Fill area */}
                  <polygon
                    points={`0,40 ${historyPoints.map((p, idx) => `${idx * 10},${40 - (p / 100) * 35}`).join(' ')} 110,40`}
                    fill="url(#fuzzGradient)"
                  />
                  {/* Line */}
                  <polyline
                    fill="none"
                    stroke="#00F0FF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={historyPoints.map((p, idx) => `${idx * 10},${40 - (p / 100) * 35}`).join(' ')}
                  />
                </svg>
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-border/40">
                <span className="text-neon-emerald flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-emerald animate-ping" />
                  ML GUIDANCE ACTIVE
                </span>
                <span>Crash Seed Pool: 4 Verified</span>
              </div>
            </div>
          </div>

          {/* Card 3: 3D Knowledge Attack Graph (lg:col-span-5) */}
          <div className="lg:col-span-5 rounded-3xl border border-zinc-border bg-void-950/80 p-6 sm:p-7 flex flex-col justify-between shadow-2xl backdrop-blur-xl relative overflow-hidden group hover:border-neon-cyan/40 transition-colors">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-zinc-border/60 pb-3 font-mono text-xs">
                <div className="flex items-center gap-2 text-white font-bold">
                  <GitBranch className="w-4 h-4 text-neon-cyan" />
                  <span>03. 3D Knowledge Attack Graph</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-neon-crimson/10 border border-neon-crimson/30 text-neon-crimson text-[10px]">
                  NEO4J + DIJKSTRA
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans">
                Translates isolated CVEs and zero-days into a directed exploit graph, solving the shortest
                path from perimeter ingress down to raw SPI flash bus.
              </p>
            </div>

            {/* Compact Force-Directed Traversal Chain Visualization */}
            <div className="mt-5 p-4 rounded-2xl bg-void-900 border border-zinc-border font-mono flex flex-col gap-2.5">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
                Multi-Hop Traversal Chain:
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-[10px] font-bold">
                    PORT 80 (uHTTPd)
                  </span>
                  <span className="text-zinc-600">&rarr;</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px]">
                    Buffer Overflow
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs pl-4">
                  <span className="text-zinc-600">&rarr;</span>
                  <span className="px-2 py-0.5 rounded bg-neon-amber/10 border border-neon-amber/30 text-neon-amber text-[10px] font-bold">
                    Root Shell (UID 0)
                  </span>
                  <span className="text-zinc-600">&rarr;</span>
                  <span className="px-2 py-0.5 rounded bg-neon-crimson/20 border border-neon-crimson/40 text-neon-crimson text-[10px] font-bold">
                    /dev/spidev0.0
                  </span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-zinc-border/40 flex items-center justify-between text-[10px] text-zinc-400">
                <span>Resistance Cost: <strong className="text-white">1.48</strong></span>
                <Link href="/attack-graph" className="text-neon-cyan hover:underline flex items-center gap-1 font-bold">
                  View Full Graph &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Card 4: Autonomous Hotpatch Synthesis (lg:col-span-7) */}
          <div className="lg:col-span-7 rounded-3xl border border-zinc-border bg-void-950/80 p-6 sm:p-7 flex flex-col justify-between shadow-2xl backdrop-blur-xl relative overflow-hidden group hover:border-neon-cyan/40 transition-colors">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-zinc-border/60 pb-3 font-mono text-xs">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Shield className="w-4 h-4 text-neon-cyan" />
                  <span>04. Autonomous Hotpatch Synthesis</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-neon-emerald/10 border border-neon-emerald/30 text-neon-emerald text-[10px]">
                  BINARY HOTPATCH
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans">
                Generates assembly byte patches and source-level C mitigations with automated
                QEMU regression verification to ensure zero device boot bricking.
              </p>
            </div>

            {/* Monaco-Style Unified Diff Viewer */}
            <div className="mt-5 rounded-2xl bg-void-900 border border-zinc-border overflow-hidden font-mono text-xs">
              <div className="px-4 py-2 border-b border-zinc-border/60 bg-void-950/80 flex items-center justify-between text-[11px] text-zinc-400">
                <span>patch_sf_zero_2026_001.diff</span>
                <button
                  onClick={handleCopyDiff}
                  className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                >
                  {diffCopied ? <Check className="w-3 h-3 text-neon-emerald" /> : <Copy className="w-3 h-3" />}
                  <span>{diffCopied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-3 text-[11px] space-y-0.5 overflow-x-auto">
                <div className="text-zinc-500">--- a/drivers/bluetooth/ble_ad_parser.c</div>
                <div className="text-zinc-500">+++ b/drivers/bluetooth/ble_ad_parser.c</div>
                <div className="text-neon-cyan font-bold pt-1">@@ -142,4 +142,7 @@</div>
                <div className="text-neon-emerald bg-neon-emerald/10 px-1 rounded">
                  +    /* SentinelForge Virtual Patch SF-VIRT-2026-001 */
                </div>
                <div className="text-neon-emerald bg-neon-emerald/10 px-1 rounded">
                  +    if (len &gt; MAX_BLE_AD_PAYLOAD_SIZE) return -EINVAL;
                </div>
                <div className="text-neon-crimson bg-neon-crimson/10 px-1 rounded line-through opacity-70">
                  -    memcpy(rx_buf, data, len);
                </div>
                <div className="text-neon-emerald bg-neon-emerald/10 px-1 rounded">
                  +    memcpy(rx_buf, data, min(len, sizeof(rx_buf)));
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
