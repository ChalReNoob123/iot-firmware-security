'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, Zap, Radio, Terminal, Server, Key, Lock, CheckCircle2, AlertOctagon, ArrowRight } from 'lucide-react';

interface StageConfig {
  id: 'STAGE_1' | 'STAGE_2' | 'STAGE_3';
  title: string;
  badge: string;
  vector: string;
  cvss: number;
  epss: number;
  cost: number;
  hopCount: number;
  compromisedNode: string;
  tacticalDescription: string;
  mitigationAdvice: string;
}

const STAGES: Record<'STAGE_1' | 'STAGE_2' | 'STAGE_3', StageConfig> = {
  STAGE_1: {
    id: 'STAGE_1',
    title: 'Remote Entrypoint (Wireless BLE Ingress)',
    badge: 'STAGE 1: INGRESS',
    vector: 'AV:A/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H',
    cvss: 8.8,
    epss: 0.942,
    cost: 0.32,
    hopCount: 2,
    compromisedNode: 'Daemon Context (ble_gatewayd, UID 1002)',
    tacticalDescription:
      'Unauthenticated BLE advertisement packet is parsed by vulnerable memcpy handler in ble_gatewayd, hijacking execution with zero operator interaction.',
    mitigationAdvice: 'Enforce bounds checks at BLE packet ingress & run daemon in sandboxed non-root user namespace.'
  },
  STAGE_2: {
    id: 'STAGE_2',
    title: 'Lateral Escalation (SUID NVRAM Helper)',
    badge: 'STAGE 2: ROOT TAKEOVER',
    vector: 'AV:L/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:H',
    cvss: 9.8,
    epss: 0.974,
    cost: 0.72,
    hopCount: 3,
    compromisedNode: 'Interactive Root Shell (/bin/sh, UID 0)',
    tacticalDescription:
      'ble_gatewayd executes /bin/nvram_set with unsanitized arguments. SUID binary invokes popen() delivering unrestricted root shell on Linux kernel 4.14.',
    mitigationAdvice: 'Strip SUID bit from nvram_set, parameterize execve arguments, and activate AppArmor kernel containment.'
  },
  STAGE_3: {
    id: 'STAGE_3',
    title: 'Hardware Bus Injection (SPI Flash & ASPEED BMC)',
    badge: 'STAGE 3: HARDWARE FLASH',
    vector: 'AV:P/AC:L/PR:H/UI:N/S:C/C:H/I:H/A:H',
    cvss: 10.0,
    epss: 0.988,
    cost: 1.48,
    hopCount: 4,
    compromisedNode: 'Hardware SPI Flash Controller (/dev/spidev0.0)',
    tacticalDescription:
      'Attacker with root permissions issues raw ioctl commands to /dev/spidev0.0, corrupting bootloader flash and achieving persistent hardware backdoor.',
    mitigationAdvice: 'Lock SPI Flash write-protect pin (WP#) via board hardware pull-up and enforce secure boot signature verification.'
  }
};

export default function AttackBlastRadiusSimulator() {
  const [selectedStage, setSelectedStage] = useState<'STAGE_1' | 'STAGE_2' | 'STAGE_3'>('STAGE_2');
  const [virtualPatchActive, setVirtualPatchActive] = useState(false);

  const stage = STAGES[selectedStage];

  // Recalculate metrics when virtual patch is active
  const activeCvss = virtualPatchActive ? 2.1 : stage.cvss;
  const activeEpss = virtualPatchActive ? 0.04 : stage.epss;
  const activeCost = virtualPatchActive ? 14.8 : stage.cost;

  return (
    <section id="attack-graph" className="relative py-16 sm:py-24 border-t border-zinc-border/60 bg-void-950/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Heading */}
        <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-void-900 border border-zinc-border text-xs font-mono text-neon-crimson mb-3">
            <ShieldAlert className="w-3.5 h-3.5" />
            LIVE DIJKSTRA EXPLOIT CHAIN SOLVER
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-heading text-white tracking-tight">
            Attack Blast Radius Simulator
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-400 font-sans max-w-2xl">
            Simulate lateral traversal steps from initial entrypoint to hardware bus compromise.
            Toggle virtual patches to recalculate blast radius in real time.
          </p>
        </div>

        {/* Side-by-Side Interactive Component */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Panel: Exploit Stages Selection (lg:col-span-5) */}
          <div className="lg:col-span-5 rounded-3xl border border-zinc-border bg-void-900/90 p-6 flex flex-col justify-between shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-zinc-border/60 pb-3 font-mono text-xs">
                <span className="text-white font-bold">SELECT EXPLOIT HORIZON</span>
                <span className="text-zinc-500 text-[10px]">3 STAGES SIMULATED</span>
              </div>

              {/* Stage Select Buttons */}
              <div className="space-y-3 font-mono text-xs">
                {(['STAGE_1', 'STAGE_2', 'STAGE_3'] as const).map((stageKey) => {
                  const s = STAGES[stageKey];
                  const isSelected = selectedStage === stageKey;

                  return (
                    <button
                      key={stageKey}
                      onClick={() => setSelectedStage(stageKey)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex flex-col gap-1.5 ${
                        isSelected
                          ? 'border-neon-cyan/60 bg-neon-cyan/10 shadow-[0_0_20px_rgba(0,240,255,0.15)]'
                          : 'border-zinc-border bg-void-950/60 hover:border-zinc-600'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-white">{s.title}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded ${
                            isSelected
                              ? 'bg-neon-cyan text-void-950 font-bold'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          CVSS {s.cvss}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 line-clamp-2">
                        {s.tacticalDescription}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Virtual Patch Mitigation Toggle */}
              <div className="mt-2 p-4 rounded-2xl bg-void-950 border border-zinc-border flex items-center justify-between font-mono text-xs">
                <div className="flex flex-col">
                  <span className="text-white font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-neon-emerald" />
                    Simulate Virtual Patch
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    Sever BLE ingress edge with micro-hotpatch
                  </span>
                </div>
                <button
                  onClick={() => setVirtualPatchActive(!virtualPatchActive)}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                    virtualPatchActive ? 'bg-neon-emerald' : 'bg-zinc-800 border border-zinc-700'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      virtualPatchActive ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Tactical Advice Footnote */}
            <div className="mt-4 pt-4 border-t border-zinc-border/60 font-mono text-[11px] text-zinc-400">
              <strong className="text-neon-cyan block mb-1">TACTICAL MITIGATION:</strong>
              {stage.mitigationAdvice}
            </div>
          </div>

          {/* Right Panel: Animated Dynamic Attack Graph & Real-Time Scoring (lg:col-span-7) */}
          <div className="lg:col-span-7 rounded-3xl border border-zinc-border bg-void-900/90 p-6 sm:p-7 flex flex-col justify-between shadow-2xl backdrop-blur-xl relative overflow-hidden">
            
            {/* Top Score Readouts */}
            <div className="grid grid-cols-3 gap-3 font-mono border-b border-zinc-border/60 pb-4">
              <div className="p-3 rounded-xl bg-void-950 border border-zinc-border text-center">
                <div className="text-[10px] text-zinc-500 uppercase">CVSS v4.0 Score</div>
                <div
                  className={`text-2xl font-bold font-heading mt-0.5 ${
                    activeCvss >= 9.0
                      ? 'text-neon-crimson'
                      : activeCvss >= 7.0
                      ? 'text-neon-amber'
                      : 'text-neon-emerald'
                  }`}
                >
                  {activeCvss.toFixed(1)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-void-950 border border-zinc-border text-center">
                <div className="text-[10px] text-zinc-500 uppercase">EPSS In-The-Wild</div>
                <div className="text-2xl font-bold font-heading text-neon-cyan mt-0.5">
                  {(activeEpss * 100).toFixed(1)}%
                </div>
              </div>
              <div className="p-3 rounded-xl bg-void-950 border border-zinc-border text-center">
                <div className="text-[10px] text-zinc-500 uppercase">Resistance Cost</div>
                <div className="text-2xl font-bold font-heading text-white mt-0.5">
                  {activeCost.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Visual Animated SVG Attack Graph Flow */}
            <div className="my-6 p-4 rounded-2xl bg-void-950 border border-zinc-border relative min-h-[220px] flex flex-col justify-center">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mb-4">
                <span>GRAPH TRAVERSAL TOPOLOGY</span>
                <span className={virtualPatchActive ? 'text-neon-emerald font-bold' : 'text-neon-crimson font-bold'}>
                  {virtualPatchActive ? 'PATH SEVERED &bull; NEUTRALIZED' : 'ACTIVE EXPLOIT CHAIN'}
                </span>
              </div>

              {/* Node Sequence Diagram */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
                {/* Node 1 */}
                <div className="w-full sm:w-auto p-3 rounded-xl border border-neon-cyan/50 bg-neon-cyan/10 text-center">
                  <div className="text-[10px] text-neon-cyan font-bold">NODE 01</div>
                  <div className="text-xs font-bold text-white mt-0.5">BLE Ingress</div>
                  <div className="text-[9px] text-zinc-400">UUID 0xFFE0</div>
                </div>

                <div className="text-zinc-600 font-bold hidden sm:block">&rarr;</div>

                {/* Node 2 */}
                <div
                  className={`w-full sm:w-auto p-3 rounded-xl border text-center transition-all ${
                    virtualPatchActive
                      ? 'border-zinc-700 bg-void-900 line-through opacity-50'
                      : 'border-neon-amber/50 bg-neon-amber/10'
                  }`}
                >
                  <div className="text-[10px] text-neon-amber font-bold">NODE 02</div>
                  <div className="text-xs font-bold text-white mt-0.5">Stack Overflow</div>
                  <div className="text-[9px] text-zinc-400">SF-ZERO-2026-001</div>
                </div>

                <div className="text-zinc-600 font-bold hidden sm:block">&rarr;</div>

                {/* Node 3 */}
                <div
                  className={`w-full sm:w-auto p-3 rounded-xl border text-center transition-all ${
                    virtualPatchActive || selectedStage === 'STAGE_1'
                      ? 'border-zinc-700 bg-void-900 opacity-50'
                      : 'border-neon-crimson/50 bg-neon-crimson/10 shadow-[0_0_15px_rgba(255,59,48,0.2)]'
                  }`}
                >
                  <div className="text-[10px] text-neon-crimson font-bold">NODE 03</div>
                  <div className="text-xs font-bold text-white mt-0.5">Root Shell</div>
                  <div className="text-[9px] text-zinc-400">UID 0 /bin/sh</div>
                </div>

                <div className="text-zinc-600 font-bold hidden sm:block">&rarr;</div>

                {/* Node 4 */}
                <div
                  className={`w-full sm:w-auto p-3 rounded-xl border text-center transition-all ${
                    selectedStage === 'STAGE_3' && !virtualPatchActive
                      ? 'border-neon-crimson bg-neon-crimson/20 shadow-[0_0_20px_rgba(255,59,48,0.4)]'
                      : 'border-zinc-700 bg-void-900 opacity-40'
                  }`}
                >
                  <div className="text-[10px] text-neon-crimson font-bold">NODE 04</div>
                  <div className="text-xs font-bold text-white mt-0.5">SPI Flash</div>
                  <div className="text-[9px] text-zinc-400">/dev/spidev0.0</div>
                </div>
              </div>

              {/* Status Alert Badge */}
              <div className="mt-5 p-3 rounded-xl bg-void-900 border border-zinc-border/70 flex items-center justify-between font-mono text-xs">
                <span className="text-zinc-300">
                  Compromised Target: <strong className="text-white">{stage.compromisedNode}</strong>
                </span>
                <span className="text-[10px] text-zinc-500">Hop Count: {stage.hopCount}</span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-border/60 font-mono text-xs">
              <span className="text-zinc-500 text-[11px]">
                NEO4J BOLT // DIJKSTRA REST INTEGRATION
              </span>
              <Link
                href="/attack-graph"
                className="px-4 py-2 rounded-xl bg-neon-cyan text-void-950 font-bold hover:bg-neon-cyan/90 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.25)]"
              >
                <span>Full 3D Attack Graph</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
