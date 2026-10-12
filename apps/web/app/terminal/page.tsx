'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal as TerminalIcon,
  Play,
  Pause,
  Download,
  Trash2,
  Cpu,
  Activity,
  ShieldAlert,
  Binary,
  Radio,
  RefreshCw,
  Search,
  Maximize2,
  Volume2,
  VolumeX,
  Code2
} from 'lucide-react';
import { cyberAudio } from '@/lib/audio';
import { useSentinelStore } from '@/lib/store';

interface LogEntry {
  id: string;
  type: 'IN' | 'OUT' | 'SYSTEM' | 'ERROR' | 'SUCCESS' | 'WARN';
  text: string;
  timestamp: string;
}

interface FuzzTelemetry {
  execSpeed: number;
  totalExecs: number;
  uniquePaths: number;
  activeCrashes: number;
  coverageRatio: number;
  lastCrashTime: string;
}

export default function TerminalPage() {
  const { showToast } = useSentinelStore();
  const [activeTab, setActiveTab] = useState<'SHELL' | 'AFL_FUZZER' | 'ANGR_SYMBOLIC' | 'HEX_DUMP'>('SHELL');
  const [history, setHistory] = useState<LogEntry[]>([
    {
      id: '1',
      type: 'SYSTEM',
      text: '========================================================================\n SENTINELFORGE HARDENED MULTI-TOOL FIRMWARE SANDBOX SHELL v2.4.0\n Hypervisor: QEMU ARM Cortex-A9 (Emulated TAP0: 192.168.0.1)\n Zero-Day Taint Monitoring & AFL++ Mutation Engine Attached\n========================================================================',
      timestamp: new Date().toLocaleTimeString()
    },
    {
      id: '2',
      type: 'SYSTEM',
      text: '[+] Sandboxed environment ready. Type "help" or click any quick command pill below to execute analysis.',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  const [inputCommand, setInputCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(cyberAudio.isMuted);
  const [crtScanlines, setCrtScanlines] = useState(true);
  const [hexOffset, setHexOffset] = useState('0x00014a00');
  const [hexFilter, setHexFilter] = useState('');

  // Live Fuzzing Telemetry state
  const [fuzzTelemetry, setFuzzTelemetry] = useState<FuzzTelemetry>({
    execSpeed: 2140,
    totalExecs: 3418902,
    uniquePaths: 842,
    activeCrashes: 4,
    coverageRatio: 68.4,
    lastCrashTime: '3m 12s ago'
  });

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll terminal
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Session recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Real-time WebSocket connection to FastAPI /ws/telemetry with synthetic heartbeat fallback
  useEffect(() => {
    let ws: WebSocket | null = null;
    let fallbackInterval: NodeJS.Timeout;

    try {
      ws = new WebSocket('ws://127.0.0.1:8000/ws/telemetry');
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'FUZZ_TELEMETRY_UPDATE') {
            setFuzzTelemetry((prev) => ({
              ...prev,
              execSpeed: data.execSpeed || prev.execSpeed,
              totalExecs: data.totalExecs || prev.totalExecs,
              uniquePaths: data.uniquePaths || prev.uniquePaths,
              activeCrashes: data.activeCrashes || prev.activeCrashes
            }));
          }
        } catch {
          // ignore parsing error
        }
      };
      ws.onerror = () => {
        // Fallback simulation
      };
    } catch {
      // Fallback simulation
    }

    // High frequency simulated jitter to keep UI live if WS offline
    fallbackInterval = setInterval(() => {
      setFuzzTelemetry((prev) => ({
        ...prev,
        execSpeed: Math.max(1200, Math.floor(prev.execSpeed + (Math.random() * 80 - 40))),
        totalExecs: prev.totalExecs + Math.floor(Math.random() * 85 + 20),
        coverageRatio: Number((Math.min(94.2, prev.coverageRatio + 0.01)).toFixed(2))
      }));
    }, 1200);

    return () => {
      if (ws) ws.close();
      clearInterval(fallbackInterval);
    };
  }, []);

  const handleToggleMute = () => {
    const muted = cyberAudio.toggleMute();
    setIsMuted(muted);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIdx = historyIndex + 1 < commandHistory.length ? historyIndex + 1 : historyIndex;
      setHistoryIndex(nextIdx);
      setInputCommand(commandHistory[commandHistory.length - 1 - nextIdx] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputCommand(commandHistory[commandHistory.length - 1 - nextIdx] || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputCommand('');
      }
    }
  };

  const executeCommandString = (cmd: string) => {
    const cleanCmd = cmd.trim();
    if (!cleanCmd) return;

    cyberAudio.playClick();
    const ts = new Date().toLocaleTimeString();

    setCommandHistory((prev) => [...prev, cleanCmd]);
    setHistoryIndex(-1);

    const newEntries: LogEntry[] = [
      ...history,
      {
        id: `cmd_${Date.now()}`,
        type: 'IN',
        text: `$ ${cleanCmd}`,
        timestamp: ts
      }
    ];

    const lower = cleanCmd.toLowerCase();

    if (lower === 'help') {
      newEntries.push({
        id: `out_${Date.now()}`,
        type: 'OUT',
        text: `AVAILABLE ANALYSIS COMMANDS:
  uname -a           : Display kernel architecture, cross-compilation & build version
  ps aux             : Enumerate emulated sandbox processes & attached fuzzers
  netstat -tuln      : Audit open listening TCP/UDP/GATT Bluetooth sockets
  checksec           : Run mitigation checks (NX/DEP, PIE, Stack Canaries, RELRO)
  angr trace         : Trigger symbolic taint tracking on BLE buffer ingress
  afl status         : Display real-time coverage fuzzer mutation telemetry
  nvram show         : Dump intercepted NVRAM configuration variables & credentials
  hexdump            : View hex and ASCII memory slice of libble_protocol_core.so
  dmesg              : Display kernel ring buffer messages & segmentation faults
  clear              : Clear active terminal screen buffer`,
        timestamp: ts
      });
    } else if (lower === 'clear') {
      setHistory([]);
      return;
    } else if (lower.includes('uname')) {
      newEntries.push({
        id: `out_${Date.now()}`,
        type: 'OUT',
        text: 'Linux sf-iot-gateway 4.19.128-sf-iot #1 SMP PREEMPT Tue Oct 12 14:02:19 UTC 2026 armv7l GNU/Linux\nArchitecture: ARMv7-A 32-bit Little Endian (QEMU Virt Machine)',
        timestamp: ts
      });
    } else if (lower.includes('checksec')) {
      cyberAudio.playScanTick();
      newEntries.push({
        id: `out_${Date.now()}`,
        type: 'WARN',
        text: `[!] CHECKSEC BINARY MITIGATION AUDIT (/usr/sbin/httpd_arm):
  CANARY    : No canary found      --> HIGH RISK (Stack buffer overflows uninhibited)
  FORTIFY   : No                   --> HIGH RISK (Dangerous string operations unfortified)
  NX/DEP    : NX disabled          --> CRITICAL (Executable stack! Shellcode executes directly)
  PIE       : No PIE (0x00010000)  --> HIGH RISK (Fixed memory addresses enable stable ROP)
  RELRO     : Partial RELRO        --> MODERATE (GOT table writable)`,
        timestamp: ts
      });
    } else if (lower.includes('ps')) {
      newEntries.push({
        id: `out_${Date.now()}`,
        type: 'OUT',
        text: `PID   USER     %CPU %MEM   COMMAND
  1   root      0.1  0.8   /sbin/init
142   root      0.4  1.2   /bin/nvram_daemon --emulated
218   www-data  1.8  3.4   /usr/sbin/httpd_arm -p 80
305   root      4.6  6.1   /usr/bin/ble_gatewayd --hci hci0 [AFL++ ATTACHED]
412   root      0.0  1.0   /usr/sbin/dropbear -F -p 22
599   sf-fuzz  88.2 14.5   afl-fuzz -i /corpus -o /findings -m none -- ./ble_gatewayd`,
        timestamp: ts
      });
    } else if (lower.includes('netstat')) {
      newEntries.push({
        id: `out_${Date.now()}`,
        type: 'OUT',
        text: `Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      218/httpd_arm
tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN      218/httpd_arm
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      412/dropbear
udp        0      0 0.0.0.0:5353            0.0.0.0:*                           305/ble_gatewayd
raw        0      0 0.0.0.0:HCI_BLE         0.0.0.0:*                           305/ble_gatewayd`,
        timestamp: ts
      });
    } else if (lower.includes('angr')) {
      cyberAudio.playScanTick();
      newEntries.push({
        id: `out_${Date.now()}`,
        type: 'SUCCESS',
        text: `[angr-symbolic] Loading binary /usr/lib/libble_protocol_core.so...
[angr-symbolic] Initializing symbolic bitvector 'packet_ingress' (length: 1024 bytes)
[angr-symbolic] Simulating state branch exploration: 42 active paths explored...
[angr-symbolic] Target sink reached: memcpy() @ 0x00014a80 (+0x98)
[angr-symbolic] SAT Solver Verdict: SATISFIABLE (Unconstrained memory corruption)
[angr-symbolic] Overwritten Link Register: $lr = 0x41414141 (Replicable RCE Proof-of-Concept generated)
[angr-symbolic] Exploit payload saved: /tmp/angr_ble_zero_day_poc.bin`,
        timestamp: ts
      });
    } else if (lower.includes('afl')) {
      newEntries.push({
        id: `out_${Date.now()}`,
        type: 'OUT',
        text: `[AFL++ QEMU-Mode Coverage Telemetry]
  Campaign Status   : ACTIVE & RUNNING
  Execution Speed   : ${fuzzTelemetry.execSpeed.toLocaleString()} execs/sec
  Total Executions  : ${fuzzTelemetry.totalExecs.toLocaleString()}
  Unique Paths Found: ${fuzzTelemetry.uniquePaths}
  Verified Crashes  : ${fuzzTelemetry.activeCrashes} (1 Verified Zero-Day Memory Corruption)
  Bitmap Coverage   : ${fuzzTelemetry.coverageRatio}% of reachable Basic Blocks
  AI Mutation Gain  : 3.8x faster coverage reach via LLM seed guidance`,
        timestamp: ts
      });
    } else if (lower.includes('nvram')) {
      newEntries.push({
        id: `out_${Date.now()}`,
        type: 'WARN',
        text: `lan_ipaddr=192.168.0.1
lan_netmask=255.255.255.0
http_admin_user=admin
http_admin_pass=gateway2026!
ble_pairing_mode=JUST_WORKS_BYPASS
wpa_psk=EnterpriseSecretWPA3_Fallback
default_root_shadow=$1$sf$u6VfW0G5vV89z8WkU9B01.:19500:0:99999:7:::`,
        timestamp: ts
      });
    } else if (lower.includes('dmesg')) {
      newEntries.push({
        id: `out_${Date.now()}`,
        type: 'ERROR',
        text: `[ 182.491024] ble_gatewayd[305]: segfault at 41414141 ip 00014a88 sp 7efff840 error 14 in libble_protocol_core.so[10000+18000]
[ 182.491039] Code: e5933000 e3530000 1a000008 e59f001c (e5933000)
[ 182.491051] CPU: 0 PID: 305 Comm: ble_gatewayd Not tainted 4.19.128-sf-iot #1
[ 182.491060] Hardware name: ARM-Versatile Express CA9`,
        timestamp: ts
      });
    } else if (lower.includes('hexdump')) {
      newEntries.push({
        id: `out_${Date.now()}`,
        type: 'OUT',
        text: `00014a00  7f 45 4c 46 01 01 01 00  00 00 00 00 00 00 00 00  |.ELF............|
00014a10  02 00 28 00 01 00 00 00  80 4a 01 00 34 00 00 00  |..(......J..4...|
00014a20  84 12 00 00 00 00 00 05  34 00 20 00 08 00 28 00  |........4. ...(.|
00014a30  6d 65 6d 63 70 79 00 00  62 6c 65 5f 70 61 63 6b  |memcpy..ble_pack|
00014a40  65 74 5f 73 69 6e 6b 00  73 74 72 63 70 79 00 00  |et_sink.strcpy..|`,
        timestamp: ts
      });
    } else {
      newEntries.push({
        id: `out_${Date.now()}`,
        type: 'OUT',
        text: `sf-sandbox: command executed: '${cleanCmd}' (returned code 0)`,
        timestamp: ts
      });
    }

    setHistory(newEntries);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCommand.trim()) return;
    executeCommandString(inputCommand);
    setInputCommand('');
  };

  const handleDownloadLog = () => {
    cyberAudio.playClick();
    const logText = history.map((h) => `[${h.timestamp}] [${h.type}] ${h.text}`).join('\n\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentinelforge-terminal-session-${Date.now()}.log`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Session terminal log downloaded successfully.', 'SUCCESS');
  };

  return (
    <div className="flex flex-col gap-4 font-mono h-[calc(100vh-120px)] max-w-7xl mx-auto w-full">
      {/* Top HUD Banner */}
      <div className="glass-panel rounded-2xl p-4 border border-cyber-border/70 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center text-cyber-cyan">
            <TerminalIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyber-emerald animate-pulse" />
              <h1 className="text-base font-bold text-white tracking-wider">
                INTERACTIVE FIRMWARE SANDBOX & MULTI-TOOL TERMINAL
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyber-surface border border-cyber-border text-cyber-cyan">
                ARMv7 QEMU TAP0
              </span>
            </div>
            <p className="text-xs text-cyber-muted flex items-center gap-2 mt-0.5">
              <span>Target: 192.168.0.1 (libble_protocol_core.so)</span>
              <span>&bull;</span>
              <span>Session: <strong className="text-slate-300">tty-sf-arm-8902</strong></span>
              <span>&bull;</span>
              <span>Latency: <strong className="text-cyber-emerald">0.4ms</strong></span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Audio toggle */}
          <button
            onClick={handleToggleMute}
            className="p-2 rounded-lg bg-cyber-surface hover:bg-cyber-card border border-cyber-border text-cyber-muted hover:text-white transition-all"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-cyber-rose" /> : <Volume2 className="w-4 h-4 text-cyber-cyan" />}
          </button>

          {/* CRT scanlines toggle */}
          <button
            onClick={() => setCrtScanlines(!crtScanlines)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              crtScanlines
                ? 'bg-cyber-cyan/15 border-cyber-cyan/40 text-cyber-cyan'
                : 'bg-cyber-surface border-cyber-border text-cyber-muted'
            }`}
            title="Toggle Retro CRT Scanlines"
          >
            CRT
          </button>

          {/* Session Recording */}
          <button
            onClick={() => {
              cyberAudio.playClick();
              setIsRecording(!isRecording);
              showToast(isRecording ? 'Session recording finalized.' : 'Recording live terminal session...', 'INFO');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              isRecording
                ? 'bg-cyber-rose/20 text-cyber-rose border border-cyber-rose/50 animate-pulse'
                : 'bg-cyber-surface hover:bg-cyber-card border border-cyber-border text-cyber-muted hover:text-white'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-cyber-rose' : 'bg-cyber-muted'}`} />
            {isRecording ? `REC [${Math.floor(recordingSeconds / 60)}:${(recordingSeconds % 60).toString().padStart(2, '0')}]` : 'RECORD SESSION'}
          </button>

          {/* Export Log */}
          <button
            onClick={handleDownloadLog}
            className="px-3 py-1.5 rounded-lg bg-cyber-surface hover:bg-cyber-card border border-cyber-border text-xs text-cyber-muted hover:text-white flex items-center gap-1.5 transition-all"
            title="Download Session Log"
          >
            <Download className="w-3.5 h-3.5" />
            Export Log
          </button>

          {/* Clear screen */}
          <button
            onClick={() => {
              cyberAudio.playClick();
              setHistory([]);
            }}
            className="p-2 rounded-lg bg-cyber-surface hover:bg-cyber-card border border-cyber-border text-cyber-muted hover:text-white transition-all"
            title="Clear Terminal Output"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Terminal Grid with Viewport & Telemetry HUD */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        {/* Terminal Area (Cols 1-3) */}
        <div className="lg:col-span-3 flex flex-col glass-panel rounded-2xl border border-cyber-border/80 bg-black/95 overflow-hidden shadow-2xl relative">
          {/* Sub-tab navigation bar */}
          <div className="flex items-center justify-between border-b border-cyber-border/40 px-4 py-2 bg-cyber-surface/40">
            <div className="flex items-center gap-1">
              {[
                { id: 'SHELL', label: 'Interactive Shell', icon: TerminalIcon },
                { id: 'AFL_FUZZER', label: 'AFL++ Fuzzer Monitor', icon: Activity },
                { id: 'ANGR_SYMBOLIC', label: 'angr Symbolic Trace', icon: Binary },
                { id: 'HEX_DUMP', label: 'Memory Hex View', icon: Code2 }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      cyberAudio.playClick();
                      setActiveTab(tab.id as any);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30'
                        : 'text-cyber-muted hover:text-slate-200 hover:bg-cyber-surface/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="text-[11px] text-cyber-muted hidden sm:flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse" />
              <span>PID: 305</span>
              <span>&bull;</span>
              <span>FD 0,1,2 ATTACHED</span>
            </div>
          </div>

          {/* CRT Scanline Overlay */}
          {crtScanlines && (
            <div
              className="pointer-events-none absolute inset-0 z-10 opacity-30"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.04), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.04))',
                backgroundSize: '100% 3px, 4px 100%'
              }}
            />
          )}

          {/* VIEW: Interactive Shell */}
          {activeTab === 'SHELL' && (
            <div className="flex-1 flex flex-col justify-between p-4 overflow-hidden relative z-0">
              {/* Output stream */}
              <div className="flex-1 overflow-y-auto space-y-1.5 text-xs text-slate-200 pr-2 font-mono scrollbar-thin">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className={`leading-relaxed whitespace-pre-wrap ${
                      entry.type === 'SYSTEM'
                        ? 'text-cyber-muted italic'
                        : entry.type === 'IN'
                        ? 'text-cyber-cyan font-bold flex items-center gap-1.5'
                        : entry.type === 'WARN'
                        ? 'text-cyber-amber bg-cyber-amber/5 p-2 rounded border border-cyber-amber/20'
                        : entry.type === 'ERROR'
                        ? 'text-cyber-rose bg-cyber-rose/5 p-2 rounded border border-cyber-rose/20'
                        : entry.type === 'SUCCESS'
                        ? 'text-cyber-emerald bg-cyber-emerald/5 p-2 rounded border border-cyber-emerald/20'
                        : 'text-slate-300'
                    }`}
                  >
                    {entry.text}
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Command Input prompt */}
              <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-3 border-t border-cyber-border/40 mt-2">
                <span className="text-cyber-emerald font-bold text-xs select-none flex items-center gap-1">
                  root@sf-gateway:~#
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputCommand}
                  onChange={(e) => setInputCommand(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a command (e.g. checksec, angr trace, afl status, ps aux, nvram show)..."
                  className="flex-1 bg-transparent border-none text-xs text-white focus:outline-none placeholder:text-cyber-muted/50 font-mono"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1 rounded-lg bg-cyber-cyan/15 hover:bg-cyber-cyan/25 border border-cyber-cyan/40 text-xs font-bold text-cyber-cyan transition-all"
                >
                  EXECUTE
                </button>
              </form>
            </div>
          )}

          {/* VIEW: AFL++ Fuzzer Monitor */}
          {activeTab === 'AFL_FUZZER' && (
            <div className="flex-1 p-5 overflow-y-auto space-y-5 text-xs">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="glass-card p-3 rounded-xl border border-cyber-border">
                  <div className="text-cyber-muted text-[10px]">EXEC SPEED</div>
                  <div className="text-lg font-bold text-cyber-cyan mt-1">
                    {fuzzTelemetry.execSpeed.toLocaleString()} <span className="text-[10px] text-cyber-muted">/sec</span>
                  </div>
                  <div className="text-[10px] text-cyber-emerald mt-1">+18.4% vs baseline</div>
                </div>
                <div className="glass-card p-3 rounded-xl border border-cyber-border">
                  <div className="text-cyber-muted text-[10px]">TOTAL EXECUTIONS</div>
                  <div className="text-lg font-bold text-white mt-1">
                    {fuzzTelemetry.totalExecs.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-cyber-muted mt-1">QEMU user-mode JIT</div>
                </div>
                <div className="glass-card p-3 rounded-xl border border-cyber-border">
                  <div className="text-cyber-muted text-[10px]">BITMAP COVERAGE</div>
                  <div className="text-lg font-bold text-cyber-purple mt-1">
                    {fuzzTelemetry.coverageRatio}%
                  </div>
                  <div className="w-full bg-cyber-surface h-1 rounded mt-1.5 overflow-hidden">
                    <div className="bg-cyber-purple h-full" style={{ width: `${fuzzTelemetry.coverageRatio}%` }} />
                  </div>
                </div>
                <div className="glass-card p-3 rounded-xl border border-cyber-border">
                  <div className="text-cyber-muted text-[10px]">VERIFIED CRASHES</div>
                  <div className="text-lg font-bold text-cyber-rose mt-1">
                    {fuzzTelemetry.activeCrashes} <span className="text-[10px] text-cyber-rose">CRITICAL</span>
                  </div>
                  <div className="text-[10px] text-cyber-rose mt-1">SIGSEGV at 0x41414141</div>
                </div>
              </div>

              {/* Fuzzing mutation log */}
              <div className="glass-card rounded-xl p-4 border border-cyber-border">
                <div className="text-xs font-bold text-white mb-2 flex items-center justify-between">
                  <span>LIVE MUTATION CAMPAIGN QUEUE</span>
                  <span className="text-cyber-cyan text-[10px]">AFL++ v4.10c + AI Guidance</span>
                </div>
                <div className="space-y-1.5 font-mono text-[11px] text-slate-300">
                  <div className="flex items-center justify-between p-1.5 rounded bg-cyber-surface/60">
                    <span className="text-cyber-cyan">Stage: havoc (splice + byte flip)</span>
                    <span className="text-cyber-muted">Queue item: 412/842</span>
                    <span className="text-cyber-emerald">FAVORED</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded bg-cyber-surface/60">
                    <span className="text-cyber-purple">LLM Boundary Mutation Synthesizer</span>
                    <span className="text-cyber-muted">Length extension: 1024 bytes</span>
                    <span className="text-cyber-rose font-bold">CRASH TRIGGER</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded bg-cyber-surface/60">
                    <span className="text-slate-300">Grammar fuzzer: BLE GATT attribute parser</span>
                    <span className="text-cyber-muted">Depth: 18 edges</span>
                    <span className="text-cyber-cyan">NEW PATH</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => executeCommandString('afl status')}
                  className="px-3 py-1.5 rounded-lg bg-cyber-cyan/15 border border-cyber-cyan/40 text-cyber-cyan font-bold text-xs"
                >
                  Dump Detailed Fuzzer State
                </button>
              </div>
            </div>
          )}

          {/* VIEW: angr Symbolic Trace */}
          {activeTab === 'ANGR_SYMBOLIC' && (
            <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-cyber-purple/10 border border-cyber-purple/30">
                <div className="text-xs font-bold text-cyber-purple mb-1 flex items-center gap-2">
                  <Binary className="w-4 h-4" />
                  SYMBOLIC EXECUTION TAINT ENGINE (Z3 SOLVER INTERFACE)
                </div>
                <p className="text-[11px] text-cyber-muted">
                  Tracing user-controlled packet input through basic blocks in <span className="text-white">libble_protocol_core.so</span> without requiring native execution.
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-cyber-surface/60 border border-cyber-border flex items-start gap-3">
                  <span className="text-cyber-cyan font-bold">0x00014a60</span>
                  <div>
                    <div className="text-white font-semibold">Entry: parse_ble_advertisement_packet</div>
                    <div className="text-cyber-muted text-[10px]">Symbolic BitVector 'ingress_buf' instantiated (8192 bits)</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-cyber-surface/60 border border-cyber-border flex items-start gap-3">
                  <span className="text-cyber-cyan font-bold">0x00014a74</span>
                  <div>
                    <div className="text-white font-semibold">Constraint: len &lt; 0x100 (Bypassable)</div>
                    <div className="text-cyber-amber text-[10px]">Taint solver branches into unchecked branch due to signedness mismatch</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-cyber-rose/10 border border-cyber-rose/40 flex items-start gap-3">
                  <span className="text-cyber-rose font-bold">0x00014a80</span>
                  <div>
                    <div className="text-cyber-rose font-semibold flex items-center gap-2">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      SINK REACHED: memcpy(dest_stack, ingress_buf, len)
                    </div>
                    <div className="text-slate-300 text-[10px] mt-1">
                      Target buffer: 256 bytes &bull; Ingress length: 1024 bytes &bull; Link Register ($lr) overwritten with 0x41414141
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => executeCommandString('angr trace')}
                  className="px-3 py-1.5 rounded-lg bg-cyber-purple/20 border border-cyber-purple/40 text-cyber-purple font-bold text-xs"
                >
                  Re-Execute Symbolic SAT Solver
                </button>
              </div>
            </div>
          )}

          {/* VIEW: Hex Memory Dump */}
          {activeTab === 'HEX_DUMP' && (
            <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-3 font-mono text-xs">
              <div className="flex items-center gap-3 bg-cyber-surface/60 p-2.5 rounded-xl border border-cyber-border">
                <Search className="w-4 h-4 text-cyber-muted" />
                <input
                  type="text"
                  value={hexOffset}
                  onChange={(e) => setHexOffset(e.target.value)}
                  placeholder="Address offset (e.g. 0x00014a00)..."
                  className="bg-transparent border-none text-xs text-white focus:outline-none flex-1"
                />
                <span className="text-[10px] text-cyber-muted">ARMv7 Little-Endian</span>
              </div>

              <div className="flex-1 bg-black p-3 rounded-xl border border-cyber-border/70 overflow-x-auto text-[11px] leading-relaxed text-slate-300">
                <div className="text-cyber-muted pb-1 border-b border-cyber-border/40 mb-2 flex justify-between">
                  <span>OFFSET    00 01 02 03 04 05 06 07  08 09 0A 0B 0C 0D 0E 0F  ASCII</span>
                  <span className="text-cyber-cyan">libble_protocol_core.so</span>
                </div>
                <div>00014a00  7f 45 4c 46 01 01 01 00  00 00 00 00 00 00 00 00  |.ELF............|</div>
                <div>00014a10  02 00 28 00 01 00 00 00  80 4a 01 00 34 00 00 00  |..(......J..4...|</div>
                <div>00014a20  84 12 00 00 00 00 00 05  34 00 20 00 08 00 28 00  |........4. ...(.|</div>
                <div className="text-cyber-rose font-bold">00014a30  6d 65 6d 63 70 79 00 00  62 6c 65 5f 70 61 63 6b  |memcpy..ble_pack|</div>
                <div>00014a40  65 74 5f 73 69 6e 6b 00  73 74 72 63 70 79 00 00  |et_sink.strcpy..|</div>
                <div>00014a50  41 41 41 41 41 41 41 41  41 41 41 41 41 41 41 41  |AAAAAAAAAAAAAAAA|</div>
                <div className="text-cyber-amber">00014a60  73 79 73 74 65 6d 00 00  2f 62 69 6e 2f 73 68 00  |system../bin/sh.|</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Quick Actions & Target Telemetry (Col 4) */}
        <div className="flex flex-col gap-4 overflow-y-auto">
          {/* Quick Command Launcher */}
          <div className="glass-panel rounded-2xl p-4 border border-cyber-border/70 space-y-3">
            <div className="text-xs font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-cyber-cyan" />
                ANALYSIS PILLS
              </span>
              <span className="text-[10px] text-cyber-muted">1-Click</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'checksec', desc: 'Binary defenses' },
                { label: 'angr trace', desc: 'Symbolic taint' },
                { label: 'afl status', desc: 'Fuzz telemetry' },
                { label: 'nvram show', desc: 'Config dump' },
                { label: 'ps aux', desc: 'Process tree' },
                { label: 'netstat -tuln', desc: 'Open ports' },
                { label: 'uname -a', desc: 'Kernel build' },
                { label: 'dmesg', desc: 'Crash ring' }
              ].map((pill) => (
                <button
                  key={pill.label}
                  onClick={() => executeCommandString(pill.label)}
                  className="p-2 rounded-xl bg-cyber-surface hover:bg-cyber-cyan/15 border border-cyber-border hover:border-cyber-cyan/40 text-left transition-all group"
                >
                  <div className="text-xs font-bold text-cyber-cyan group-hover:text-white transition-colors">
                    {pill.label}
                  </div>
                  <div className="text-[9px] text-cyber-muted mt-0.5 truncate">{pill.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sandbox Host Status */}
          <div className="glass-panel rounded-2xl p-4 border border-cyber-border/70 space-y-3">
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyber-purple" />
              QEMU EMULATOR HOST
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-cyber-surface/60">
                <span className="text-cyber-muted">Target Architecture</span>
                <span className="text-white font-bold">ARM Cortex-A9</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-cyber-surface/60">
                <span className="text-cyber-muted">Endianness</span>
                <span className="text-cyber-cyan font-bold">LITTLE</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-cyber-surface/60">
                <span className="text-cyber-muted">Emulation Driver</span>
                <span className="text-cyber-emerald font-bold">QEMU 8.2 (KVM-off)</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-cyber-surface/60">
                <span className="text-cyber-muted">Network Tap</span>
                <span className="text-white font-mono">tap0 / 192.168.0.1</span>
              </div>
            </div>
          </div>

          {/* Active Zero-Day Notification Box */}
          <div className="glass-panel rounded-2xl p-4 border border-cyber-rose/40 bg-cyber-rose/5 space-y-2">
            <div className="text-xs font-bold text-cyber-rose flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              DISCOVERED VULNERABILITY
            </div>
            <div className="text-[11px] text-slate-300 leading-relaxed">
              <strong>SF-2026-004:</strong> Unbounded stack buffer overflow in <code className="text-cyber-cyan">ble_gatewayd</code> via BLE advertisement length parameter. Direct EIP/LR control achieved.
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  cyberAudio.playClick();
                  showToast('Navigating to Patch Studio with crash state...', 'INFO');
                }}
                className="px-2.5 py-1 rounded bg-cyber-rose/20 hover:bg-cyber-rose/30 border border-cyber-rose/50 text-[10px] font-bold text-cyber-rose transition-all"
              >
                Synthesize Patch &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
