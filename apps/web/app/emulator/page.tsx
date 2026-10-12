'use client';

import React, { useState } from 'react';
import DigitalTwin3DBoard from '@/components/3d/DigitalTwin3DBoard';
import { useSentinelStore } from '@/lib/store';

export default function EmulatorPage() {
  const { showToast } = useSentinelStore();
  const [activeTab, setActiveTab] = useState<'3D_BOARD' | 'SNAPSHOT_REPLAY' | 'CONSOLE' | 'PROCESSES' | 'SOCKETS'>('3D_BOARD');
  const [replayStep, setReplayStep] = useState<number>(4);
  const [isRunning, setIsRunning] = useState<boolean>(true);

  // Crash snapshot state
  const registers = {
    r0: '0x00000001',
    r1: '0x7efff844',
    r2: '0x00000400',
    r3: '0x41414141',
    r4: '0x41414141',
    r5: '0x41414141',
    r6: '0x00028014',
    r7: '0x7efff900',
    pc: '0x00014a88',
    lr: '0x000149f0',
    sp: '0x7efff840',
    cpsr: '0x60000010'
  };

  const disassembly = [
    { address: '0x00014a78', instruction: 'ldr  r2, [sp, #16]', isCurrent: false, desc: 'Load user-supplied packet length header' },
    { address: '0x00014a7c', instruction: 'mov  r0, r3', isCurrent: false, desc: 'Set destination stack buffer pointer' },
    { address: '0x00014a80', instruction: 'bl   0x10b40 <memcpy@plt>', isCurrent: false, desc: 'Trigger unbounded memory copy (1024 bytes into 256 byte array)' },
    { address: '0x00014a84', instruction: 'ldr  r3, [sp, #24]', isCurrent: false, desc: 'Restore corrupted saved frame pointer' },
    { address: '0x00014a88', instruction: 'ldr  r3, [r3, #0]', isCurrent: true, desc: 'CRASH: SIGSEGV invalid memory dereference at 0x41414141' },
    { address: '0x00014a8c', instruction: 'cmp  r3, #0', isCurrent: false, desc: 'Unreachable' },
    { address: '0x00014a90', instruction: 'bne  0x14ab0', isCurrent: false, desc: 'Unreachable' }
  ];

  const processes = [
    { pid: 1, name: 'init', user: 'root', cpu: 0.1, mem: 1.2, status: 'SLEEPING' },
    { pid: 142, name: 'nvram_daemon', user: 'root', cpu: 0.4, mem: 2.1, status: 'RUNNING' },
    { pid: 218, name: 'httpd_arm', user: 'www-data', cpu: 1.8, mem: 4.8, status: 'RUNNING' },
    { pid: 305, name: 'ble_gatewayd', user: 'root', cpu: 3.2, mem: 6.4, status: 'FUZZ_ATTACHED' },
    { pid: 412, name: 'dropbear', user: 'root', cpu: 0.0, mem: 1.8, status: 'SLEEPING' }
  ];

  const sockets = [
    { proto: 'tcp', port: 80, process: 'httpd_arm', bindAddress: '0.0.0.0', state: 'LISTEN' },
    { proto: 'tcp', port: 443, process: 'httpd_arm', bindAddress: '0.0.0.0', state: 'LISTEN' },
    { proto: 'tcp', port: 22, process: 'dropbear', bindAddress: '0.0.0.0', state: 'LISTEN' },
    { proto: 'udp', port: 5353, process: 'mDNSResponder', bindAddress: '224.0.0.251', state: 'BOUND' },
    { proto: 'gatt', port: 1, process: 'ble_gatewayd', bindAddress: 'hci0 (0x1800)', state: 'ACTIVE' }
  ];

  const dmesgLogs = [
    '[  12.482910] [FirmAE-NVRAM] Intercepted get_env("lan_ipaddr") -> 192.168.0.1',
    '[  14.910283] [sf-sandbox] BLE virtual controller initialized on hci0 (MTU=512)',
    '[  18.002819] [sf-sandbox] Virtual tap device tap0 bridged to br0',
    '[  22.110901] [httpd_arm:218] Listening on 0.0.0.0:80 (CGI support active)',
    '[  34.819201] [sf-fuzz-harness] AFL++ harness attached to PID 305 (ble_gatewayd)',
    '[  48.102948] [kernel] Memory fault in ble_gatewayd: [SIGSEGV] at $pc=0x00014a88 ($lr=0x000149f0)'
  ];

  return (
    <div className="flex flex-col gap-6 font-mono">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-cyber-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-cyan animate-pulse" />
            <h1 className="text-xl font-bold text-white">QEMU DIGITAL TWIN & 3D HARDWARE EMULATOR</h1>
          </div>
          <p className="text-xs text-cyber-muted">
            Architecture: <span className="text-cyber-cyan font-bold">ARMv7-A Cortex-A9 (32-bit Little-Endian)</span> &bull; Sandbox Kernel: <span className="text-slate-200">Linux 4.19.128-sf-iot</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 ${
              isRunning ? 'bg-cyber-emerald/20 text-cyber-emerald border border-cyber-emerald/40' : 'bg-cyber-rose/20 text-cyber-rose border border-cyber-rose/40'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-cyber-emerald animate-ping' : 'bg-cyber-rose'}`} />
            {isRunning ? 'SANDBOX RUNNING' : 'SANDBOX PAUSED'}
          </button>
          <button
            onClick={() => showToast('NVRAM snapshot reset successfully. MicroVM memory reset to baseline state.', 'SUCCESS')}
            className="px-3 py-1.5 rounded-lg bg-cyber-surface hover:bg-cyber-surface/80 border border-cyber-border text-xs text-cyber-cyan"
          >
            Reset Snapshot
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-cyber-border/40 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('3D_BOARD')}
          className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
            activeTab === '3D_BOARD'
              ? 'bg-cyber-cyan text-cyber-bg shadow-[0_0_15px_rgba(0,245,212,0.3)]'
              : 'text-cyber-muted hover:text-white bg-cyber-surface/40'
          }`}
        >
          3D Hardware Digital Twin
        </button>
        <button
          onClick={() => setActiveTab('SNAPSHOT_REPLAY')}
          className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
            activeTab === 'SNAPSHOT_REPLAY'
              ? 'bg-cyber-rose/20 text-cyber-rose border border-cyber-rose/40 shadow-[0_0_12px_rgba(255,51,102,0.2)]'
              : 'text-cyber-muted hover:text-white bg-cyber-surface/40'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-cyber-rose animate-ping" />
          Crash Snapshot Replay Scrubber
        </button>
        <button
          onClick={() => setActiveTab('CONSOLE')}
          className={`px-4 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'CONSOLE'
              ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40'
              : 'text-cyber-muted hover:text-white bg-cyber-surface/40'
          }`}
        >
          Kernel Boot & dmesg
        </button>
        <button
          onClick={() => setActiveTab('PROCESSES')}
          className={`px-4 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'PROCESSES'
              ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40'
              : 'text-cyber-muted hover:text-white bg-cyber-surface/40'
          }`}
        >
          Processes ({processes.length})
        </button>
        <button
          onClick={() => setActiveTab('SOCKETS')}
          className={`px-4 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'SOCKETS'
              ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40'
              : 'text-cyber-muted hover:text-white bg-cyber-surface/40'
          }`}
        >
          Sockets ({sockets.length})
        </button>
      </div>

      {/* Tab 0: 3D Hardware Digital Twin Board */}
      {activeTab === '3D_BOARD' && (
        <DigitalTwin3DBoard />
      )}

      {/* Tab 1: Crash Snapshot Replay Scrubber */}
      {activeTab === 'SNAPSHOT_REPLAY' && (
        <div className="flex flex-col gap-5">
          <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-cyber-rose/30">
            <div>
              <div className="text-xs text-cyber-rose font-bold flex items-center gap-2">
                <span>REPLAY SNAPSHOT: crash_snap_0x0041280f (SIGSEGV)</span>
              </div>
              <p className="text-[11px] text-cyber-muted">
                Step backwards and forwards through instructions leading to faulting execution state.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-cyber-muted">Instruction Step: {replayStep} / {disassembly.length - 1}</span>
              <button
                onClick={() => setReplayStep((prev) => Math.max(0, prev - 1))}
                className="px-3 py-1 rounded bg-cyber-surface hover:bg-cyber-card border border-cyber-border text-xs text-white"
              >
                &larr; Step Back
              </button>
              <button
                onClick={() => setReplayStep((prev) => Math.min(disassembly.length - 1, prev + 1))}
                className="px-3 py-1 rounded bg-cyber-surface hover:bg-cyber-card border border-cyber-border text-xs text-white"
              >
                Step Fwd &rarr;
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="glass-panel p-4 rounded-xl flex flex-col gap-3">
              <div className="text-xs font-bold text-cyber-cyan border-b border-cyber-border/40 pb-2">
                ARM CORTEX-A9 CPU REGISTERS
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(registers).map(([reg, val]) => {
                  const isCorrupted = val === '0x41414141';
                  return (
                    <div
                      key={reg}
                      className={`p-2 rounded bg-cyber-surface/70 border ${
                        isCorrupted ? 'border-cyber-rose text-cyber-rose bg-cyber-rose/10 font-bold' : 'border-cyber-border/40 text-slate-300'
                      }`}
                    >
                      <div className="text-[10px] text-cyber-muted">{reg.toUpperCase()}</div>
                      <div className="font-mono">{val}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-2 glass-panel p-4 rounded-xl flex flex-col gap-3">
              <div className="text-xs font-bold text-cyber-cyan border-b border-cyber-border/40 pb-2 flex items-center justify-between">
                <span>DISASSEMBLY AROUND $PC (parse_ble_advertisement_packet)</span>
                <span className="text-[10px] text-cyber-rose font-bold">FAULT AT STEP 04</span>
              </div>

              <div className="space-y-1.5">
                {disassembly.map((line, idx) => {
                  const isCurrent = idx === replayStep;
                  return (
                    <div
                      key={line.address}
                      className={`p-2.5 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all ${
                        isCurrent
                          ? 'bg-cyber-rose/20 border-cyber-rose text-white shadow-[0_0_10px_rgba(255,51,102,0.3)] font-bold'
                          : 'bg-cyber-surface/50 border-cyber-border/40 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-cyber-cyan">{line.address}</span>
                        <span className={isCurrent ? 'text-cyber-rose font-bold' : 'text-white'}>{line.instruction}</span>
                      </div>
                      <span className="text-[10px] text-cyber-muted">{line.desc}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-2 p-3 rounded-lg bg-cyber-bg/90 border border-cyber-border/60 text-[11px] font-mono">
                <div className="text-cyber-muted text-[10px] mb-1">STACK MEMORY DUMP @ $SP (0x7efff840):</div>
                <div className="text-cyber-rose">0x7efff840: 41414141 41414141 41414141 41414141  |AAAAAAAAAAAAAAAA|</div>
                <div className="text-cyber-rose">0x7efff850: 41414141 41414141 41414141 41414141  |AAAAAAAAAAAAAAAA|</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Kernel Console */}
      {activeTab === 'CONSOLE' && (
        <div className="glass-panel p-4 rounded-xl bg-cyber-bg/95 border border-cyber-border flex flex-col gap-2 font-mono text-xs">
          <div className="text-cyber-cyan border-b border-cyber-border/40 pb-2 flex items-center justify-between">
            <span>EMULATED TTY CONSOLE &bull; /dev/ttyAMA0</span>
            <span className="text-cyber-emerald">ONLINE (9600 8N1)</span>
          </div>
          <div className="space-y-1 text-slate-300 py-2">
            {dmesgLogs.map((log, i) => (
              <div key={i} className="leading-relaxed">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Processes */}
      {activeTab === 'PROCESSES' && (
        <div className="glass-panel p-4 rounded-xl flex flex-col gap-3">
          <div className="text-xs font-bold text-cyber-cyan border-b border-cyber-border/40 pb-2">
            RUNNING PROCESSES IN SANDBOX
          </div>
          <div className="space-y-2 text-xs">
            {processes.map((p) => (
              <div key={p.pid} className="p-3 rounded-lg bg-cyber-surface/70 border border-cyber-border/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-cyber-cyan font-bold">PID {p.pid}</span>
                  <span className="text-white font-bold">{p.name}</span>
                  <span className="text-cyber-muted text-[11px]">({p.user})</span>
                </div>
                <div className="flex items-center gap-4 text-[11px]">
                  <span className="text-cyber-muted">CPU: {p.cpu}%</span>
                  <span className="text-cyber-muted">MEM: {p.mem}%</span>
                  <span className="px-2 py-0.5 rounded bg-cyber-emerald/20 text-cyber-emerald border border-cyber-emerald/40 font-bold">
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Sockets */}
      {activeTab === 'SOCKETS' && (
        <div className="glass-panel p-4 rounded-xl flex flex-col gap-3">
          <div className="text-xs font-bold text-cyber-cyan border-b border-cyber-border/40 pb-2">
            NETWORK & WIRELESS INTERFACE SOCKETS
          </div>
          <div className="space-y-2 text-xs">
            {sockets.map((s, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-cyber-surface/70 border border-cyber-border/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-cyber-purple font-bold uppercase">{s.proto}</span>
                  <span className="text-white font-bold">Port {s.port}</span>
                  <span className="text-cyber-muted text-[11px]">({s.process})</span>
                </div>
                <div className="flex items-center gap-4 text-[11px]">
                  <span className="text-cyber-muted">Bind: {s.bindAddress}</span>
                  <span className="px-2 py-0.5 rounded bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40">
                    {s.state}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
