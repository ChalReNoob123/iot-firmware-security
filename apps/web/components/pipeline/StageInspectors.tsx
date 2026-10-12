'use client';

import React, { useState } from 'react';
import { PipelineStageInfo, Finding, ScanSession } from '@sentinelforge/shared-types';
import { useTelemetrySocket } from '@/lib/useTelemetrySocket';

interface StageInspectorProps {
  stage: PipelineStageInfo;
  scan: ScanSession;
  finding?: Finding;
}

export function StageInspector({ stage, scan, finding }: StageInspectorProps) {
  const telemetry = useTelemetrySocket({
    execSpeed: scan.fuzzMetrics?.execSpeedPerSec ?? 1840,
    totalExecs: scan.fuzzMetrics?.totalExecutions ?? 2481902,
    uniquePaths: scan.fuzzMetrics?.uniquePaths ?? 738,
    activeCrashes: scan.fuzzMetrics?.crashesCount ?? 4
  });

  switch (stage.id) {
    case 'stage_1_acquisition':
      return <Stage1AttestationGateView stage={stage} scan={scan} />;
    case 'stage_2_unpacking':
      return <Stage2UnpackingEntropyView stage={stage} />;
    case 'stage_3_static_secrets':
      return <Stage3StaticSecretsView stage={stage} />;
    case 'stage_4_sbom_vex':
      return <Stage4SbomVexView stage={stage} scan={scan} />;
    case 'stage_5_symbolic_taint':
      return <Stage5SymbolicTaintView stage={stage} finding={finding} />;
    case 'stage_6_dynamic_emulation':
      return <Stage6DynamicEmulationView stage={stage} />;
    case 'stage_7_coverage_fuzzing':
      return <Stage7CoverageFuzzingView stage={stage} scan={scan} telemetry={telemetry} />;
    case 'stage_8_protocol_fuzzing':
      return <Stage8ProtocolFuzzingView stage={stage} />;
    case 'stage_9_attack_graph':
      return <Stage9AttackGraphView stage={stage} scan={scan} />;
    case 'stage_10_scoring_reporting':
      return <Stage10ScoringComplianceView stage={stage} scan={scan} finding={finding} />;
    default:
      return (
        <div className="p-4 rounded-xl bg-cyber-surface/70 border border-cyber-border text-xs text-cyber-muted">
          Select a pipeline stage from the sequencer above to view detailed execution telemetry.
        </div>
      );
  }
}

// ---------------- STAGE 1: INGESTION & ATTESTATION GATE ----------------
function Stage1AttestationGateView({ stage, scan }: { stage: PipelineStageInfo; scan: ScanSession }) {
  return (
    <div className="space-y-4 pt-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-cyber-surface/80 border border-cyber-emerald/40">
          <div className="text-[10px] text-cyber-muted uppercase">Hardware Root of Trust</div>
          <div className="text-sm font-bold text-cyber-emerald mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyber-emerald animate-ping" />
            vTPM Attested & Validated
          </div>
          <div className="text-[10px] text-slate-300 mt-1">Measured Boot PCR-0 through PCR-7 match golden baseline</div>
        </div>

        <div className="p-3.5 rounded-xl bg-cyber-surface/80 border border-cyber-border">
          <div className="text-[10px] text-cyber-muted uppercase">Firmware Image Container</div>
          <div className="text-sm font-bold text-white mt-1">SquashFS v4.0 (16.4 MB)</div>
          <div className="text-[10px] text-cyber-cyan mt-1">Superblock Magic: 0x73717368 (Little-Endian)</div>
        </div>

        <div className="p-3.5 rounded-xl bg-cyber-surface/80 border border-cyber-border">
          <div className="text-[10px] text-cyber-muted uppercase">Ingestion Engine</div>
          <div className="text-sm font-bold text-cyber-purple mt-1">{stage.engine}</div>
          <div className="text-[10px] text-slate-300 mt-1">Duration: {stage.durationMs}ms &bull; Zero Egress Policy</div>
        </div>
      </div>

      {/* Attestation Certificate Chain of Custody */}
      <div className="p-4 rounded-xl bg-cyber-card/70 border border-cyber-border/70 space-y-2">
        <div className="flex items-center justify-between text-xs text-cyber-cyan font-bold border-b border-cyber-border/40 pb-2">
          <span>SIGNED CHAIN-OF-CUSTODY AUTHORIZATION RECORD</span>
          <span className="text-cyber-emerald text-[11px]">CERTIFIED OWNER AUTHORIZED</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div>
            <span className="text-cyber-muted text-[10px]">Attestation Record ID:</span>
            <div className="text-slate-200">att_9842_signed (SHA-256 Measured)</div>
          </div>
          <div>
            <span className="text-cyber-muted text-[10px]">Lead Defensive Engineer:</span>
            <div className="text-slate-200">Lead Offensive Security Architect</div>
          </div>
          <div>
            <span className="text-cyber-muted text-[10px]">Firmware SHA-256 Digest:</span>
            <div className="text-cyber-cyan text-[11px] truncate">e8f9a2b4c6d8e0f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9</div>
          </div>
          <div>
            <span className="text-cyber-muted text-[10px]">Audit Verification Status:</span>
            <div className="text-cyber-emerald">ETSI EN 303 645 Clause 5.1 & NIST IR 8259A Compliant</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- STAGE 2: DEEP UNPACKING & ENTROPY ANALYSIS ----------------
function Stage2UnpackingEntropyView({ stage }: { stage: PipelineStageInfo }) {
  const binwalkOffsets = [
    { offset: '+0x00000000', type: 'SquashFS Superblock', desc: 'Little-endian, version 4.0, 842 inodes, blocksize: 131072', entropy: 4.12, isEncrypted: false },
    { offset: '+0x00028000', type: 'Linux Kernel zImage', desc: 'ARM Linux-4.19.128 LZMA compressed executable block', entropy: 7.42, isEncrypted: false },
    { offset: '+0x00200000', type: 'Encrypted Key Vault', desc: 'High entropy block (>7.9 bits/byte); potential proprietary crypto blob', entropy: 7.94, isEncrypted: true },
    { offset: '+0x00410000', type: 'SquashFS Inode Table', desc: 'Root filesystem tree (/bin, /sbin, /etc, /lib, /usr)', entropy: 5.61, isEncrypted: false }
  ];

  return (
    <div className="space-y-4 pt-2">
      {/* Shannon Entropy Graph Indicator */}
      <div className="p-4 rounded-xl bg-cyber-card/70 border border-cyber-border/70 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-cyber-cyan">SHANNON ENTROPY DISTRIBUTION CURVE (0.0 TO 8.0 BITS/BYTE)</span>
          <span className="text-cyber-rose font-bold text-[11px]">PEAK: 7.94 bits/byte @ +0x200000</span>
        </div>

        {/* Visual entropy bars */}
        <div className="h-16 flex items-end gap-1 px-2 py-1 rounded-lg bg-cyber-bg/90 border border-cyber-border/40">
          {[
            3.2, 3.8, 4.1, 4.5, 6.1, 7.2, 7.4, 7.3, 6.8, 5.4, 5.1,
            7.9, 7.94, 7.91, 7.85, 6.2, 5.8, 5.5, 5.2, 4.8, 4.2, 3.9
          ].map((val, idx) => {
            const isHigh = val >= 7.8;
            return (
              <div
                key={idx}
                className="flex-1 rounded-t transition-all hover:opacity-80"
                style={{
                  height: `${(val / 8.0) * 100}%`,
                  backgroundColor: isHigh ? '#ff3366' : val > 6.5 ? '#f97316' : '#00f5d4'
                }}
                title={`Offset Segment #${idx}: ${val} bits/byte`}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-between text-[10px] text-cyber-muted">
          <span>0x000000 (Flash Start)</span>
          <span className="text-cyber-rose font-bold">▲ High-Entropy Encrypted Section (+0x200000)</span>
          <span>0x01000000 (16.4 MB EOF)</span>
        </div>
      </div>

      {/* Binwalk Offsets Table */}
      <div className="rounded-xl overflow-hidden border border-cyber-border">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-cyber-surface/90 text-cyber-muted border-b border-cyber-border/40">
            <tr>
              <th className="p-2.5">OFFSET</th>
              <th className="p-2.5">CONTAINER TYPE</th>
              <th className="p-2.5">EXTRACTION DETAILS</th>
              <th className="p-2.5">ENTROPY</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyber-border/30 bg-cyber-card/60">
            {binwalkOffsets.map((b) => (
              <tr key={b.offset} className="hover:bg-cyber-surface/50">
                <td className="p-2.5 text-cyber-cyan font-bold">{b.offset}</td>
                <td className="p-2.5 text-white font-bold">{b.type}</td>
                <td className="p-2.5 text-slate-300 text-[11px]">{b.desc}</td>
                <td className="p-2.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    b.isEncrypted ? 'bg-cyber-rose/20 text-cyber-rose border border-cyber-rose/40' : 'bg-cyber-cyan/10 text-cyber-cyan'
                  }`}>
                    {b.entropy} b/B {b.isEncrypted ? '⚠ ENCRYPTED' : ''}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------- STAGE 3: STATIC CODE & SECRET SCANNING ----------------
function Stage3StaticSecretsView({ stage }: { stage: PipelineStageInfo }) {
  const hardening = [
    { binary: '/usr/sbin/httpd_arm', nx: true, pie: false, canary: false, relro: 'PARTIAL', fortify: false },
    { binary: '/usr/bin/ble_gatewayd', nx: true, pie: false, canary: false, relro: 'NONE', fortify: false },
    { binary: '/bin/nvram_set', nx: true, pie: false, canary: false, relro: 'PARTIAL', fortify: false },
    { binary: '/usr/sbin/dropbear', nx: true, pie: true, canary: true, relro: 'FULL', fortify: true }
  ];

  return (
    <div className="space-y-4 pt-2">
      {/* Flagged Secrets Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-cyber-rose/10 border border-cyber-rose/40 space-y-2">
          <div className="flex items-center justify-between text-cyber-rose font-bold">
            <span>HARDCODED PRIVATE KEY EXTRACTED</span>
            <span className="px-1.5 py-0.5 rounded bg-cyber-rose/20 text-[10px]">CRITICAL</span>
          </div>
          <div className="font-mono text-slate-200 text-[11px]">File: /etc/ssl/gateway.key (RSA 2048-bit)</div>
          <pre className="p-2 rounded bg-cyber-bg/90 text-cyber-rose text-[10px] overflow-x-auto">
{`-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA0rY3n9... [Shared Universal Factory Certificate]
-----END RSA PRIVATE KEY-----`}
          </pre>
          <div className="text-[10px] text-cyber-muted">Same private key found across 12,480 manufactured units.</div>
        </div>

        <div className="p-3.5 rounded-xl bg-cyber-amber/10 border border-cyber-amber/40 space-y-2">
          <div className="flex items-center justify-between text-cyber-amber font-bold">
            <span>BACKDOOR TELNET PASSWORDS IDENTIFIED</span>
            <span className="px-1.5 py-0.5 rounded bg-cyber-amber/20 text-[10px]">HIGH</span>
          </div>
          <div className="font-mono text-slate-200 text-[11px]">File: /etc/shadow &bull; User: root</div>
          <div className="p-2 rounded bg-cyber-bg/90 text-cyber-amber text-[10px] font-mono">
            root:$1$$gateway2026!:19000:0:99999:7:::
          </div>
          <div className="text-[10px] text-cyber-muted">
            Matches default backdoor string across firmware lineage; violates ETSI EN 303 645 Provision 5.1-1.
          </div>
        </div>
      </div>

      {/* Binary Mitigations Matrix */}
      <div className="p-4 rounded-xl bg-cyber-card/70 border border-cyber-border space-y-2">
        <div className="text-xs font-bold text-cyber-cyan border-b border-cyber-border/40 pb-2">
          BINARY COMPILATION HARDENING AUDIT (checksec / Ghidra)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-cyber-surface/90 text-cyber-muted border-b border-cyber-border/40">
              <tr>
                <th className="p-2">BINARY PATH</th>
                <th className="p-2">NX / DEP</th>
                <th className="p-2">ASLR / PIE</th>
                <th className="p-2">STACK CANARY</th>
                <th className="p-2">RELRO</th>
                <th className="p-2">FORTIFY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/30">
              {hardening.map((h) => (
                <tr key={h.binary}>
                  <td className="p-2 text-white font-bold">{h.binary}</td>
                  <td className="p-2"><span className="text-cyber-emerald">YES</span></td>
                  <td className="p-2">{h.pie ? <span className="text-cyber-emerald">PIE</span> : <span className="text-cyber-rose font-bold">NO PIE</span>}</td>
                  <td className="p-2">{h.canary ? <span className="text-cyber-emerald">CANARY</span> : <span className="text-cyber-rose font-bold">NO CANARY</span>}</td>
                  <td className="p-2"><span className={h.relro === 'FULL' ? 'text-cyber-emerald' : 'text-cyber-amber'}>{h.relro}</span></td>
                  <td className="p-2">{h.fortify ? <span className="text-cyber-emerald">YES</span> : <span className="text-cyber-rose">NO</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------------- STAGE 4: SBOM & VEX GENERATION ----------------
function Stage4SbomVexView({ stage, scan }: { stage: PipelineStageInfo; scan: ScanSession }) {
  const sbomItems = [
    { name: 'libble_protocol_core', version: '2.4.1', license: 'Vendor SDK', vex: 'affected', reason: 'Zero-day stack overflow verified reachable via BLE GATT 0xFFE1' },
    { name: 'busybox', version: '1.33.1', license: 'GPL-2.0', vex: 'not_affected', reason: 'CVE-2022-30065 present but execution path unreachable in embedded config' },
    { name: 'openssl', version: '1.1.1w', license: 'Apache-2.0', vex: 'affected', reason: 'EOL version lacking NIST PQC hybrid signature support' },
    { name: 'liboqs', version: '0.9.0', license: 'MIT', vex: 'not_affected', reason: 'Post-quantum reference library present in experimental partition' }
  ];

  return (
    <div className="space-y-4 pt-2">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-cyber-surface/80 border border-cyber-border">
          <div className="text-[10px] text-cyber-muted">TOTAL SBOM COMPONENTS</div>
          <div className="text-2xl font-bold text-white mt-1">48 Packages</div>
          <div className="text-[10px] text-cyber-cyan">CycloneDX 1.5 JSON Validated</div>
        </div>
        <div className="p-3.5 rounded-xl bg-cyber-rose/10 border border-cyber-rose/30">
          <div className="text-[10px] text-cyber-rose font-bold">CISA VEX: AFFECTED</div>
          <div className="text-2xl font-bold text-cyber-rose mt-1">3 Components</div>
          <div className="text-[10px] text-slate-300">Exploitable ingress reach confirmed</div>
        </div>
        <div className="p-3.5 rounded-xl bg-cyber-purple/10 border border-cyber-purple/30">
          <div className="text-[10px] text-cyber-purple font-bold">PQC QUANTUM READINESS</div>
          <div className="text-2xl font-bold text-cyber-purple mt-1">42% Prepared</div>
          <div className="text-[10px] text-slate-300">Requires NIST ML-KEM upgrade</div>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border border-cyber-border">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-cyber-surface/90 text-cyber-muted border-b border-cyber-border/40">
            <tr>
              <th className="p-2.5">PACKAGE & VERSION</th>
              <th className="p-2.5">LICENSE</th>
              <th className="p-2.5">CISA VEX ASSERTION</th>
              <th className="p-2.5">REACHABILITY RATIONALE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyber-border/30 bg-cyber-card/60">
            {sbomItems.map((item) => (
              <tr key={item.name} className="hover:bg-cyber-surface/50">
                <td className="p-2.5">
                  <span className="text-white font-bold">{item.name}</span>
                  <span className="text-cyber-cyan ml-2 text-[11px]">v{item.version}</span>
                </td>
                <td className="p-2.5 text-slate-300 text-[11px]">{item.license}</td>
                <td className="p-2.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.vex === 'affected' ? 'bg-cyber-rose/20 text-cyber-rose border border-cyber-rose/40' : 'bg-cyber-emerald/20 text-cyber-emerald border border-cyber-emerald/40'
                  }`}>
                    VEX: {item.vex.toUpperCase()}
                  </span>
                </td>
                <td className="p-2.5 text-cyber-muted text-[11px]">{item.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------- STAGE 5: SYMBOLIC TAINT ANALYSIS (angr) ----------------
function Stage5SymbolicTaintView({ stage, finding }: { stage: PipelineStageInfo; finding?: Finding }) {
  if (!finding?.symbolicTrace) return null;
  const trace = finding.symbolicTrace;

  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-cyber-rose flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyber-rose animate-ping" />
          <span>STEP-BY-STEP INSTRUCTION TAINT FLOW (SAT SOLVER PROVED)</span>
        </h3>
        <span className="text-xs text-cyber-muted">Z3 Path Feasibility: <strong className="text-cyber-emerald">94%</strong></span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {trace.taintTrace.map((step, sIdx) => (
          <div
            key={step.address}
            className="p-3 rounded-xl bg-cyber-surface/90 border border-cyber-border hover:border-cyber-rose/50 transition-all flex flex-col justify-between gap-2 text-xs"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-cyber-muted">
                <span>STEP 0{sIdx + 1}</span>
                <span className="text-cyber-cyan font-mono">{step.address}</span>
              </div>
              <div className="font-bold text-cyber-rose text-[11px]">{step.operation}</div>
              <div className="font-mono text-slate-300 bg-cyber-bg/80 px-2 py-1 rounded text-[11px] border border-cyber-border/40">
                {step.instruction}
              </div>
            </div>
            <p className="text-[10px] text-cyber-muted leading-tight mt-1">{step.notes}</p>
          </div>
        ))}
      </div>

      <div className="glass-panel p-4 rounded-xl bg-cyber-bg/90 border border-cyber-border/60">
        <div className="flex items-center justify-between text-xs text-cyber-muted mb-2 border-b border-cyber-border/40 pb-2">
          <span>GHIDRA DECOMPILED C FUNCTION &bull; libble_protocol_core.c:140</span>
          <span className="text-cyber-rose font-bold">UNCHECKED LENGTH SINK DETECTED</span>
        </div>
        <pre className="text-xs font-mono text-cyber-cyan overflow-x-auto p-2 bg-cyber-surface/80 rounded-lg leading-relaxed">
          {trace.angrDecompiledSnippet}
        </pre>
      </div>
    </div>
  );
}

// ---------------- STAGE 6: DYNAMIC EMULATION (QEMU/FirmAE) ----------------
function Stage6DynamicEmulationView({ stage }: { stage: PipelineStageInfo }) {
  const nvramIntercepts = [
    { key: 'lan_ipaddr', value: '192.168.0.1', type: 'INTERCEPTED_DEFAULT' },
    { key: 'wan_proto', value: 'dhcp', type: 'INTERCEPTED_DEFAULT' },
    { key: 'http_admin_user', value: 'admin', type: 'RECOVERED_SECRET' },
    { key: 'ble_pin_required', value: '0', type: 'SECURITY_WEAKNESS' }
  ];

  return (
    <div className="space-y-4 pt-2 text-xs">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-cyber-surface/80 border border-cyber-cyan/40">
          <div className="text-[10px] text-cyber-muted uppercase">Emulation Sandbox</div>
          <div className="text-sm font-bold text-white mt-1">QEMU ARM Cortex-A9 (32-bit)</div>
          <div className="text-[10px] text-cyber-cyan mt-1">Linux 4.19.128-sf-iot Kernel Online</div>
        </div>

        <div className="p-3.5 rounded-xl bg-cyber-surface/80 border border-cyber-border">
          <div className="text-[10px] text-cyber-muted uppercase">Virtual Peripherals</div>
          <div className="text-sm font-bold text-cyber-emerald mt-1">HCI0 (BLE) + tap0 (Ethernet)</div>
          <div className="text-[10px] text-slate-300 mt-1">FirmAE NVRAM Hooks Active</div>
        </div>

        <div className="p-3.5 rounded-xl bg-cyber-surface/80 border border-cyber-border">
          <div className="text-[10px] text-cyber-muted uppercase">Isolated Network</div>
          <div className="text-sm font-bold text-cyber-purple mt-1">192.168.0.1 (br0)</div>
          <div className="text-[10px] text-slate-300 mt-1">ANALYSIS_EGRESS_POLICY=deny-all</div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-cyber-card/70 border border-cyber-border space-y-2">
        <div className="text-xs font-bold text-cyber-cyan border-b border-cyber-border/40 pb-2">
          FIRMAE NVRAM INTERCEPTED ENVIRONMENT HOOKS
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {nvramIntercepts.map((n) => (
            <div key={n.key} className="p-2.5 rounded bg-cyber-bg/90 border border-cyber-border/40 flex items-center justify-between">
              <div>
                <span className="text-cyber-muted text-[10px] block">{n.key}:</span>
                <span className="text-white font-mono font-bold">{n.value}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                n.type === 'SECURITY_WEAKNESS' ? 'bg-cyber-rose/20 text-cyber-rose border border-cyber-rose/30' : 'bg-cyber-cyan/10 text-cyber-cyan'
              }`}>
                {n.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------- STAGE 7: AI-GUIDED COVERAGE FUZZING (AFL++) ----------------
function Stage7CoverageFuzzingView({ stage, scan, telemetry }: { stage: PipelineStageInfo; scan: ScanSession; telemetry: any }) {
  return (
    <div className="space-y-4 pt-2 text-xs">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-cyber-surface/80 border border-cyber-cyan/40">
          <div className="text-[10px] text-cyber-muted">EXECUTION SPEED</div>
          <div className="text-2xl font-bold text-cyber-cyan mt-1 flex items-center gap-2">
            <span>{telemetry.execSpeed.toLocaleString()}</span>
            <span className="text-xs text-cyber-muted font-normal">/sec</span>
          </div>
          <div className="text-[10px] text-cyber-emerald flex items-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-emerald animate-pulse" />
            {telemetry.isLive ? 'Live WebSocket Telemetry' : 'Simulated Ticker Active'}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-cyber-surface/80 border border-cyber-border">
          <div className="text-[10px] text-cyber-muted">TOTAL MUTATIONS</div>
          <div className="text-2xl font-bold text-white mt-1">{telemetry.totalExecs.toLocaleString()}</div>
          <div className="text-[10px] text-cyber-muted mt-1">QEMU Persistent Mode</div>
        </div>

        <div className="p-3.5 rounded-xl bg-cyber-surface/80 border border-cyber-emerald/40">
          <div className="text-[10px] text-cyber-muted">UNIQUE PATHS</div>
          <div className="text-2xl font-bold text-cyber-emerald mt-1">{telemetry.uniquePaths}</div>
          <div className="text-[10px] text-cyber-emerald mt-1">Bitmap Density: 78.4%</div>
        </div>

        <div className="p-3.5 rounded-xl bg-cyber-rose/10 border border-cyber-rose/40">
          <div className="text-[10px] text-cyber-rose font-bold">CRASHES TRIAGED</div>
          <div className="text-2xl font-bold text-cyber-rose mt-1">{telemetry.activeCrashes}</div>
          <div className="text-[10px] text-cyber-rose mt-1">1 Verified Zero-Day RCE</div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-cyber-card/70 border border-cyber-border space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-cyber-cyan border-b border-cyber-border/40 pb-2">
          <span>AI MUTATION GUIDANCE STEERING GAIN</span>
          <span className="text-cyber-emerald text-[11px]">3.8x Faster Coverage Reach</span>
        </div>
        <p className="text-slate-300 text-[11px] leading-relaxed">
          The neural AST mutation predictor prioritizes branch paths reaching untested cryptographic and protocol parsing subroutines, achieving edge coverage 3.8x faster than generic random bit-flipping AFL++ harnesses.
        </p>
      </div>
    </div>
  );
}

// ---------------- STAGE 8: PROTOCOL STATE-MACHINE FUZZING (Boofuzz) ----------------
function Stage8ProtocolFuzzingView({ stage }: { stage: PipelineStageInfo }) {
  return (
    <div className="space-y-4 pt-2 text-xs">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-cyber-surface/80 border border-cyber-purple/40">
          <div className="text-[10px] text-cyber-muted uppercase">Protocol State Engine</div>
          <div className="text-sm font-bold text-cyber-purple mt-1">Boofuzz GATT/MQTT State Explorer</div>
          <div className="text-[10px] text-slate-300 mt-1">Packet Sequence Fuzzing</div>
        </div>

        <div className="p-3.5 rounded-xl bg-cyber-rose/10 border border-cyber-rose/40">
          <div className="text-[10px] text-cyber-rose font-bold">STATE ANOMALY DISCOVERED</div>
          <div className="text-sm font-bold text-cyber-rose mt-1">Out-of-Order Pairing Handshake</div>
          <div className="text-[10px] text-slate-300 mt-1">Direct memory write before auth gate</div>
        </div>

        <div className="p-3.5 rounded-xl bg-cyber-surface/80 border border-cyber-border">
          <div className="text-[10px] text-cyber-muted uppercase">Target Characteristic</div>
          <div className="text-sm font-bold text-white mt-1">UUID: 0xFFE1 (Raw RX Stream)</div>
          <div className="text-[10px] text-cyber-cyan mt-1">Packet Length Header: 1024 Bytes</div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-cyber-card/70 border border-cyber-border space-y-2">
        <div className="text-xs font-bold text-cyber-cyan border-b border-cyber-border/40 pb-2">
          REPRODUCING HANDSHAKE PACKET SEQUENCE
        </div>
        <pre className="p-3 rounded-lg bg-cyber-bg/90 text-slate-200 text-[11px] font-mono leading-relaxed border border-cyber-border/40 overflow-x-auto">
{`[Frame #1] ADV_IND -> Connectable Undirected Advertisement received
[Frame #2] CONNECT_REQ -> Connection Handle: 1 established
[Frame #3] GATT_WRITE_CMD -> UUID 0xFFE1 (Payload: 1024 bytes) [OUT-OF-ORDER INJECTION]
[Frame #4] RESULT: Parser invokes memcpy() without assertion -> SIGSEGV Stack Overflow`}
        </pre>
      </div>
    </div>
  );
}

// ---------------- STAGE 9: ATTACK-CHAIN GRAPH SYNTHESIS (Neo4j) ----------------
function Stage9AttackGraphView({ stage, scan }: { stage: PipelineStageInfo; scan: ScanSession }) {
  return (
    <div className="space-y-4 pt-2 text-xs">
      <div className="p-4 rounded-xl bg-cyber-card/70 border border-cyber-rose/30 space-y-3">
        <div className="flex items-center justify-between border-b border-cyber-border/40 pb-2">
          <span className="text-xs font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyber-rose animate-ping" />
            SYNTHESIZED 4-HOP ATTACK PATH TO ROOT TAKE OVER
          </span>
          <span className="px-2 py-0.5 rounded bg-cyber-rose/20 text-cyber-rose font-bold text-[10px]">
            EXPLOIT CONFIDENCE: 94%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1 font-mono">
          <div className="p-3 rounded-lg bg-cyber-surface border border-cyber-border">
            <div className="text-[10px] text-cyber-muted">HOP 1: INGRESS</div>
            <div className="text-xs font-bold text-white mt-1">BLE GATT Interface</div>
            <div className="text-[10px] text-cyber-cyan">Unauthenticated Radio</div>
          </div>
          <div className="p-3 rounded-lg bg-cyber-surface border border-cyber-rose/40">
            <div className="text-[10px] text-cyber-rose font-bold">HOP 2: EXPLOIT</div>
            <div className="text-xs font-bold text-cyber-rose mt-1">Zero-Day RCE</div>
            <div className="text-[10px] text-slate-300">libble_protocol_core.so</div>
          </div>
          <div className="p-3 rounded-lg bg-cyber-surface border border-cyber-amber/40">
            <div className="text-[10px] text-cyber-amber font-bold">HOP 3: ESCALATE</div>
            <div className="text-xs font-bold text-cyber-amber mt-1">SUID Injection</div>
            <div className="text-[10px] text-slate-300">/bin/nvram_set (UID 0)</div>
          </div>
          <div className="p-3 rounded-lg bg-cyber-surface border border-cyber-purple/40">
            <div className="text-[10px] text-cyber-purple font-bold">HOP 4: ASSET</div>
            <div className="text-xs font-bold text-cyber-purple mt-1">BMC Flash Write</div>
            <div className="text-[10px] text-slate-300">/dev/spidev0.0 Control</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- STAGE 10: EPSS/SSVC SCORING & REPORTS ----------------
function Stage10ScoringComplianceView({ stage, scan, finding }: { stage: PipelineStageInfo; scan: ScanSession; finding?: Finding }) {
  return (
    <div className="space-y-4 pt-2 text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-cyber-rose/10 border border-cyber-rose/40">
          <div className="text-[10px] text-cyber-rose font-bold">CISA SSVC DECISION</div>
          <div className="text-3xl font-bold text-cyber-rose mt-1">ACT</div>
          <div className="text-[10px] text-slate-300 mt-1">Immediate remediation required</div>
        </div>

        <div className="p-3.5 rounded-xl bg-cyber-amber/10 border border-cyber-amber/40">
          <div className="text-[10px] text-cyber-amber font-bold">EPSS EXPLOIT PROBABILITY</div>
          <div className="text-3xl font-bold text-cyber-amber mt-1">94%</div>
          <div className="text-[10px] text-slate-300 mt-1">98.6th percentile of global CVEs</div>
        </div>

        <div className="p-3.5 rounded-xl bg-cyber-purple/10 border border-cyber-purple/40">
          <div className="text-[10px] text-cyber-purple font-bold">COMPLIANCE READINESS</div>
          <div className="text-3xl font-bold text-cyber-purple mt-1">{scan.compliance.overallCompliancePercent}%</div>
          <div className="text-[10px] text-slate-300 mt-1">IEC 62443 & NIST IR 8259A Mapped</div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-cyber-card/70 border border-cyber-border space-y-2">
        <div className="text-xs font-bold text-cyber-cyan border-b border-cyber-border/40 pb-2">
          CISA SSVC DECISION TREE PATH
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
          <div className="p-2 rounded bg-cyber-surface border border-cyber-border">
            <span className="text-cyber-muted text-[10px] block">EXPLOITATION:</span>
            <span className="text-cyber-rose font-bold">ACTIVE (PoC / Fuzzed)</span>
          </div>
          <div className="p-2 rounded bg-cyber-surface border border-cyber-border">
            <span className="text-cyber-muted text-[10px] block">EXPOSURE:</span>
            <span className="text-cyber-amber font-bold">CONTROLLED</span>
          </div>
          <div className="p-2 rounded bg-cyber-surface border border-cyber-border">
            <span className="text-cyber-muted text-[10px] block">UTILITY:</span>
            <span className="text-cyber-purple font-bold">EFFICIENT</span>
          </div>
          <div className="p-2 rounded bg-cyber-surface border border-cyber-rose/40">
            <span className="text-cyber-muted text-[10px] block">FINAL OUTCOME:</span>
            <span className="text-cyber-rose font-bold">ACT</span>
          </div>
        </div>
      </div>
    </div>
  );
}
