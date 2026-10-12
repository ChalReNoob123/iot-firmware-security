'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Zap,
  Activity,
  ShieldAlert,
  Cpu,
  Sliders,
  Radio,
  Download,
  Flame,
  Binary,
  Layers,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Play
} from 'lucide-react';
import { cyberAudio } from '@/lib/audio';
import { useSentinelStore } from '@/lib/store';

interface CPAByteResult {
  byteIndex: number;
  recoveredHex: string;
  correlationPeak: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  traceCount: number;
}

export default function SideChannelPage() {
  const { showToast } = useSentinelStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fftCanvasRef = useRef<HTMLCanvasElement>(null);

  const [activeTab, setActiveTab] = useState<'POWER_TRACE' | 'CPA_ATTACK' | 'FAULT_INJECTION' | 'RISK_SCORE'>('POWER_TRACE');
  const [traceCount, setTraceCount] = useState(5000);
  const [isCapturing, setIsCapturing] = useState(false);
  const [hardwareRig, setHardwareRig] = useState<'CW_HUSKY' | 'CW_NANO' | 'PICOSCOPE_6000'>('CW_HUSKY');
  const [showFft, setShowFft] = useState(false);

  // Fault Injection Parameters
  const [glitchDelay, setGlitchDelay] = useState(142); // nanoseconds
  const [glitchWidth, setGlitchWidth] = useState(38);  // nanoseconds
  const [glitchVoltage, setGlitchVoltage] = useState(0.85); // Volts
  const [faultSuccessCount, setFaultSuccessCount] = useState(14);

  // CPA Key Recovery Results
  const cpaBytes: CPAByteResult[] = [
    { byteIndex: 0, recoveredHex: '2B', correlationPeak: 0.94, confidence: 'HIGH', traceCount: 5000 },
    { byteIndex: 1, recoveredHex: '7E', correlationPeak: 0.91, confidence: 'HIGH', traceCount: 5000 },
    { byteIndex: 2, recoveredHex: '15', correlationPeak: 0.88, confidence: 'HIGH', traceCount: 5000 },
    { byteIndex: 3, recoveredHex: '16', correlationPeak: 0.86, confidence: 'HIGH', traceCount: 5000 },
    { byteIndex: 4, recoveredHex: '28', correlationPeak: 0.82, confidence: 'HIGH', traceCount: 5000 },
    { byteIndex: 5, recoveredHex: 'AE', correlationPeak: 0.79, confidence: 'MEDIUM', traceCount: 5000 },
    { byteIndex: 6, recoveredHex: 'D2', correlationPeak: 0.74, confidence: 'MEDIUM', traceCount: 5000 },
    { byteIndex: 7, recoveredHex: 'A6', correlationPeak: 0.71, confidence: 'MEDIUM', traceCount: 5000 },
    { byteIndex: 8, recoveredHex: 'AB', correlationPeak: 0.68, confidence: 'MEDIUM', traceCount: 5000 },
    { byteIndex: 9, recoveredHex: 'F7', correlationPeak: 0.65, confidence: 'MEDIUM', traceCount: 5000 },
    { byteIndex: 10, recoveredHex: '15', correlationPeak: 0.61, confidence: 'MEDIUM', traceCount: 5000 },
    { byteIndex: 11, recoveredHex: '88', correlationPeak: 0.58, confidence: 'LOW', traceCount: 5000 },
    { byteIndex: 12, recoveredHex: '09', correlationPeak: 0.52, confidence: 'LOW', traceCount: 5000 },
    { byteIndex: 13, recoveredHex: 'CF', correlationPeak: 0.48, confidence: 'LOW', traceCount: 5000 },
    { byteIndex: 14, recoveredHex: '4F', correlationPeak: 0.44, confidence: 'LOW', traceCount: 5000 },
    { byteIndex: 15, recoveredHex: '3C', correlationPeak: 0.39, confidence: 'LOW', traceCount: 5000 }
  ];

  // Animated Oscilloscope Canvas
  useEffect(() => {
    if (activeTab !== 'POWER_TRACE') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    const height = (canvas.height = 300);

    let animId: number;
    let frame = 0;

    const render = () => {
      frame++;
      // Phosphor decay trail
      ctx.fillStyle = 'rgba(6, 9, 14, 0.25)';
      ctx.fillRect(0, 0, width, height);

      // Grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Trigger line marker (vertical dashed)
      const triggerX = Math.floor(width * 0.42);
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.beginPath();
      ctx.moveTo(triggerX, 0);
      ctx.lineTo(triggerX, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Baseline Normal Operation (Cyan Trace)
      ctx.beginPath();
      ctx.strokeStyle = '#00f5d4';
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#00f5d4';
      for (let x = 0; x < width; x++) {
        const noise = (Math.random() - 0.5) * 6;
        const wave = Math.sin(x * 0.025 + frame * 0.03) * 25;
        const y = height / 2 - 35 + wave + noise;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Leakage / CPA SubBytes Attack Trace (Rose Trace)
      ctx.beginPath();
      ctx.strokeStyle = '#ff3366';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#ff3366';
      for (let x = 0; x < width; x++) {
        const noise = (Math.random() - 0.5) * 5;
        const wave = Math.sin(x * 0.025 + frame * 0.03 + 0.4) * 22;
        // Pronounced leakage spike around trigger area
        const distFromTrigger = Math.abs(x - triggerX);
        const spike = distFromTrigger < 35 ? Math.cos((distFromTrigger / 35) * Math.PI) * 75 : 0;
        const y = height / 2 + 35 + wave + noise + spike;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // HUD Canvas Overlays
      ctx.fillStyle = '#00f5d4';
      ctx.font = '10px monospace';
      ctx.fillText('CH1: Vdd Baseline (500mV/div)', 14, 20);

      ctx.fillStyle = '#ff3366';
      ctx.fillText('CH2: AES Round 1 SubBytes (Hamming Leakage)', 14, 38);

      ctx.fillStyle = '#f59e0b';
      ctx.fillText('▼ HW Trigger (GPIO Pin 4 Edge)', triggerX - 70, 18);

      ctx.fillStyle = '#64748b';
      ctx.font = '9px monospace';
      ctx.fillText(
        `Rig: ${hardwareRig} | 500 MS/s | 12-bit ADC | Frame #${frame}`,
        width - 290,
        height - 12
      );

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [activeTab, hardwareRig]);

  const handleStartCapture = () => {
    cyberAudio.playRadarSweep();
    setIsCapturing(true);
    showToast(`Acquiring 5,000 power traces via ${hardwareRig}...`, 'INFO');
    setTimeout(() => {
      setIsCapturing(false);
      setTraceCount((prev) => prev + 1000);
      cyberAudio.playStageComplete();
      showToast('Trace acquisition completed. CPA matrix updated.', 'SUCCESS');
    }, 1400);
  };

  const handleGlitchTrigger = () => {
    cyberAudio.playClick();
    cyberAudio.playZeroDayAlert();
    setFaultSuccessCount((prev) => prev + 1);
    showToast(`Voltage Glitch [${glitchWidth}ns] injected: Instruction BNE skipped!`, 'ALERT');
  };

  const highConfBytes = cpaBytes.filter((b) => b.confidence === 'HIGH').length;
  const overallRisk = highConfBytes >= 5 ? 'CRITICAL' : highConfBytes >= 3 ? 'HIGH' : 'MEDIUM';

  return (
    <div className="flex flex-col gap-5 font-mono max-w-7xl mx-auto w-full">
      {/* Header HUD Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-cyber-border/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyber-amber/10 border border-cyber-amber/30 flex items-center justify-center text-cyber-amber">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyber-amber animate-pulse" />
              <h1 className="text-lg font-bold text-white tracking-wider">
                HARDWARE SIDE-CHANNEL ANALYSIS & FAULT INJECTION LAB
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyber-surface border border-cyber-amber/30 text-cyber-amber">
                DPA / CPA / EMFI
              </span>
            </div>
            <p className="text-xs text-cyber-muted mt-0.5">
              ChipWhisperer Hardware Integration &bull; Power & EM Leakage Profiling &bull; AES-128 Key Recovery Assessment
            </p>
          </div>
        </div>

        {/* Rig selector and capture trigger */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-cyber-surface/60 px-3 py-1.5 rounded-xl border border-cyber-border">
            <Radio className="w-3.5 h-3.5 text-cyber-cyan" />
            <span className="text-xs text-cyber-muted">RIG:</span>
            <select
              value={hardwareRig}
              onChange={(e) => {
                cyberAudio.playClick();
                setHardwareRig(e.target.value as any);
              }}
              className="bg-transparent border-none text-xs text-white focus:outline-none font-bold"
            >
              <option value="CW_HUSKY" className="bg-cyber-surface">ChipWhisperer Husky (12-bit 200MS/s)</option>
              <option value="CW_NANO" className="bg-cyber-surface">ChipWhisperer Nano (USB 8-bit)</option>
              <option value="PICOSCOPE_6000" className="bg-cyber-surface">PicoScope 6404D (5 GS/s 500MHz)</option>
            </select>
          </div>

          <button
            onClick={handleStartCapture}
            disabled={isCapturing}
            className="px-4 py-2 rounded-xl bg-cyber-amber hover:bg-cyber-amber/90 text-cyber-bg font-bold text-xs transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.35)] disabled:opacity-50"
          >
            <Activity className="w-4 h-4" />
            {isCapturing ? 'ACQUIRING TRACES...' : '⚡ ACQUIRE TRACES'}
          </button>
        </div>
      </div>

      {/* Lab Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-cyber-border/40 pb-2 text-xs">
        {[
          { id: 'POWER_TRACE' as const, label: 'Power Trace Oscilloscope', icon: Activity },
          { id: 'CPA_ATTACK' as const, label: 'CPA Key Byte Recovery Heatmap', icon: Binary },
          { id: 'FAULT_INJECTION' as const, label: 'Fault Injection Simulator (EMFI/VGlitch)', icon: Flame },
          { id: 'RISK_SCORE' as const, label: 'Hardware Risk Scorecard', icon: ShieldAlert }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                cyberAudio.playClick();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                isActive
                  ? 'bg-cyber-amber/15 text-cyber-amber border border-cyber-amber/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'text-cyber-muted hover:text-white bg-cyber-surface/40 hover:bg-cyber-surface/70'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Oscilloscope View */}
      {activeTab === 'POWER_TRACE' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          <div className="lg:col-span-3 glass-panel p-5 rounded-2xl border border-cyber-border/80 flex flex-col gap-4 bg-black/90">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyber-emerald animate-pulse" />
                <span className="text-white font-bold">DIGITAL STORAGE OSCILLOSCOPE (DSO) VIEW</span>
              </div>
              <div className="flex items-center gap-3 text-cyber-muted text-[11px]">
                <span>Traces: <strong className="text-cyber-cyan">{traceCount.toLocaleString()}</strong></span>
                <span>&bull;</span>
                <span>Trigger: <strong className="text-cyber-amber">GPIO Edge</strong></span>
              </div>
            </div>

            <div className="relative w-full rounded-xl bg-black border border-cyber-border/60 overflow-hidden">
              <canvas ref={canvasRef} className="w-full h-[300px] block" />
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs pt-1">
              <div className="p-3 rounded-xl bg-cyber-surface/60 border border-cyber-border">
                <div className="text-[10px] text-cyber-muted">PEAK LEAKAGE CORRELATION</div>
                <div className="text-lg font-bold text-cyber-rose mt-0.5">ρ = 0.942</div>
                <div className="text-[10px] text-cyber-rose">Sample Point #320 (SubBytes)</div>
              </div>
              <div className="p-3 rounded-xl bg-cyber-surface/60 border border-cyber-border">
                <div className="text-[10px] text-cyber-muted">SIGNAL-TO-NOISE RATIO (SNR)</div>
                <div className="text-lg font-bold text-cyber-cyan mt-0.5">18.4 dB</div>
                <div className="text-[10px] text-cyber-emerald">High SNR (Unmasked ASIC)</div>
              </div>
              <div className="p-3 rounded-xl bg-cyber-surface/60 border border-cyber-border">
                <div className="text-[10px] text-cyber-muted">ADC SAMPLING RESOLUTION</div>
                <div className="text-lg font-bold text-white mt-0.5">12-bit / 500 MS/s</div>
                <div className="text-[10px] text-cyber-muted">Analog Frontend: AC-Coupled</div>
              </div>
            </div>
          </div>

          {/* Side Panel: DSO Controls */}
          <div className="flex flex-col gap-4">
            <div className="glass-panel p-4 rounded-2xl border border-cyber-border/80 space-y-3">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyber-cyan" />
                ACQUISITION CONTROLS
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-cyber-muted text-[11px] mb-1">
                    <span>Sample Traces</span>
                    <span className="text-white font-bold">{traceCount.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="20000"
                    step="1000"
                    value={traceCount}
                    onChange={(e) => setTraceCount(Number(e.target.value))}
                    className="w-full accent-cyber-amber cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-cyber-muted text-[11px] mb-1">
                    <span>Lowpass Filter</span>
                    <span className="text-white font-bold">20 MHz</span>
                  </div>
                  <input type="range" min="5" max="50" defaultValue="20" className="w-full accent-cyber-cyan cursor-pointer" />
                </div>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-cyber-amber/30 bg-cyber-amber/5 space-y-2">
              <div className="text-xs font-bold text-cyber-amber flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                HARDWARE FINDING
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Device lacks power line decoupling and hardware masking. High correlation spikes occur consistently at cycle 320 during AES-128 round 1 SubBytes operations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CPA Key Byte Heatmap */}
      {activeTab === 'CPA_ATTACK' && (
        <div className="glass-panel p-5 rounded-2xl border border-cyber-border flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-cyber-border/40 pb-3 text-xs">
            <div>
              <span className="text-cyber-amber font-bold text-sm">CORRELATION POWER ANALYSIS — AES-128 KEY BYTE RECOVERY</span>
              <p className="text-cyber-muted text-[11px] mt-0.5">
                Targeting Hamming Weight model of SubBytes output: S-box[pt[i] ^ key[i]]
              </p>
            </div>
            <div className="text-xs">
              <span className="text-cyber-muted">Traces Processed: </span>
              <strong className="text-cyber-cyan">{traceCount.toLocaleString()}</strong>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-16 gap-2.5">
            {cpaBytes.map((b) => (
              <div
                key={b.byteIndex}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs transition-all hover:scale-105 ${
                  b.confidence === 'HIGH'
                    ? 'bg-cyber-rose/20 border-cyber-rose/50 shadow-[0_0_10px_rgba(255,51,102,0.3)]'
                    : b.confidence === 'MEDIUM'
                    ? 'bg-cyber-amber/15 border-cyber-amber/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                    : 'bg-cyber-surface/60 border-cyber-border/40'
                }`}
              >
                <div className="text-[9px] text-cyber-muted font-bold">K[{b.byteIndex}]</div>
                <div
                  className={`font-bold font-mono text-base ${
                    b.confidence === 'HIGH'
                      ? 'text-cyber-rose'
                      : b.confidence === 'MEDIUM'
                      ? 'text-cyber-amber'
                      : 'text-slate-400'
                  }`}
                >
                  0x{b.recoveredHex}
                </div>
                <div className="w-full h-1.5 rounded-full bg-cyber-bg overflow-hidden mt-1">
                  <div
                    className={`h-full rounded-full ${
                      b.confidence === 'HIGH'
                        ? 'bg-cyber-rose'
                        : b.confidence === 'MEDIUM'
                        ? 'bg-cyber-amber'
                        : 'bg-slate-600'
                    }`}
                    style={{ width: `${b.correlationPeak * 100}%` }}
                  />
                </div>
                <div className="text-[10px] text-cyber-muted font-semibold mt-0.5">
                  {(b.correlationPeak * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>

          {/* Recovered Key Display */}
          <div className="p-4 rounded-xl bg-black/90 border border-cyber-border/80 text-xs font-mono space-y-2">
            <div className="text-cyber-muted flex items-center justify-between">
              <span>RECOVERED MASTER KEY CANDIDATE:</span>
              <span className="text-cyber-rose font-bold">{highConfBytes} of 16 Bytes Recovered</span>
            </div>
            <div className="text-sm font-bold tracking-widest text-slate-200">
              {cpaBytes.map((b) => (
                <span
                  key={b.byteIndex}
                  className={`mr-2 ${
                    b.confidence === 'HIGH'
                      ? 'text-cyber-rose underline'
                      : b.confidence === 'MEDIUM'
                      ? 'text-cyber-amber'
                      : 'text-slate-600'
                  }`}
                >
                  {b.recoveredHex}
                </span>
              ))}
            </div>
            <div className="text-[11px] text-cyber-muted flex items-center gap-4 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyber-rose" /> High Confidence (&gt;80%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyber-amber" /> Medium (60-80%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-600" /> Unknown (&lt;60%)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Fault Injection Simulator */}
      {activeTab === 'FAULT_INJECTION' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-cyber-border/80 space-y-4">
            <div className="flex items-center justify-between text-xs border-b border-cyber-border/40 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-cyber-rose" />
                <span className="text-white font-bold">VOLTAGE & ELECTROMAGNETIC GLITCH SIMULATION</span>
              </div>
              <span className="text-cyber-emerald text-[11px] font-bold">
                GLITCH PULSER ARMED & READY
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-cyber-surface/60 border border-cyber-border space-y-2">
                <div className="text-[10px] text-cyber-muted">GLITCH DELAY (TRIGGER OFFSET)</div>
                <div className="text-lg font-bold text-cyber-cyan">{glitchDelay} ns</div>
                <input
                  type="range"
                  min="50"
                  max="300"
                  value={glitchDelay}
                  onChange={(e) => setGlitchDelay(Number(e.target.value))}
                  className="w-full accent-cyber-cyan cursor-pointer"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-cyber-surface/60 border border-cyber-border space-y-2">
                <div className="text-[10px] text-cyber-muted">GLITCH WIDTH (DURATION)</div>
                <div className="text-lg font-bold text-cyber-amber">{glitchWidth} ns</div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={glitchWidth}
                  onChange={(e) => setGlitchWidth(Number(e.target.value))}
                  className="w-full accent-cyber-amber cursor-pointer"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-cyber-surface/60 border border-cyber-border space-y-2">
                <div className="text-[10px] text-cyber-muted">DROP VOLTAGE (VDD_CORE)</div>
                <div className="text-lg font-bold text-cyber-rose">{glitchVoltage} V</div>
                <input
                  type="range"
                  min="0.4"
                  max="1.2"
                  step="0.05"
                  value={glitchVoltage}
                  onChange={(e) => setGlitchVoltage(Number(e.target.value))}
                  className="w-full accent-cyber-rose cursor-pointer"
                />
              </div>
            </div>

            {/* Target code disassembly simulation */}
            <div className="p-4 rounded-xl bg-black border border-cyber-border text-xs font-mono space-y-2">
              <div className="text-cyber-muted text-[11px] border-b border-cyber-border/40 pb-1">
                DISASSEMBLY OF BOOTLOADER AUTHENTICATION CHECK:
              </div>
              <div className="space-y-1 text-slate-300">
                <div>0x00008120  bl   verify_signature_rsa2048</div>
                <div>0x00008124  cmp  r0, #0</div>
                <div className="p-1 rounded bg-cyber-rose/20 text-cyber-rose font-bold border border-cyber-rose/40 flex justify-between">
                  <span>0x00008128  bne  lock_device_and_halt    ; &lt;-- FAULT INJECTION TARGET</span>
                  <span>[GLITCH CORRUPTS OPCODE TO NOP]</span>
                </div>
                <div className="text-cyber-emerald font-bold">
                  0x0000812c  bl   boot_untrusted_payload    ; &lt;-- SECURE BOOT BYPASS ACHIEVED!
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={handleGlitchTrigger}
                className="px-5 py-2.5 rounded-xl bg-cyber-rose hover:bg-cyber-rose/90 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(255,51,102,0.4)]"
              >
                <Flame className="w-4 h-4" />
                FIRE VOLTAGE GLITCH PULSE
              </button>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-cyber-border/80 space-y-3">
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyber-cyan" />
              FAULT EXPERIMENT METRICS
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 rounded-lg bg-cyber-surface/60">
                <span className="text-cyber-muted">Total Glitch Attempts</span>
                <span className="text-white font-bold">120</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-cyber-surface/60">
                <span className="text-cyber-muted">Successful Bypasses</span>
                <span className="text-cyber-rose font-bold">{faultSuccessCount}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-cyber-surface/60">
                <span className="text-cyber-muted">Device Resets / Mutes</span>
                <span className="text-cyber-amber font-bold">42</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-cyber-surface/60">
                <span className="text-cyber-muted">Success Window</span>
                <span className="text-cyber-emerald font-bold">138ns - 146ns</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Hardware Risk Scorecard */}
      {activeTab === 'RISK_SCORE' && (
        <div className="glass-panel p-6 rounded-2xl border border-cyber-border space-y-6">
          <div className="flex items-center justify-between border-b border-cyber-border/40 pb-4 text-xs">
            <span className="text-cyber-rose font-bold text-sm">
              SIDE-CHANNEL & PHYSICAL SECURITY RISK SCORECARD
            </span>
            <span
              className={`px-3 py-1 rounded-lg font-bold text-xs ${
                overallRisk === 'CRITICAL'
                  ? 'bg-cyber-rose/20 text-cyber-rose border border-cyber-rose/40 animate-pulse'
                  : 'bg-cyber-amber/20 text-cyber-amber border border-cyber-amber/40'
              }`}
            >
              PHYSICAL RISK: {overallRisk}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-cyber-surface/80 border border-cyber-rose/40 text-center">
              <div className="text-3xl font-bold text-cyber-rose">{highConfBytes} / 16</div>
              <div className="text-xs text-cyber-muted mt-1.5 font-bold">CPA Key Bytes Recovered</div>
              <div className="text-[10px] text-cyber-rose mt-1">Brute-force space reduced to 2^{`64`}</div>
            </div>

            <div className="p-4 rounded-xl bg-cyber-surface/80 border border-cyber-amber/40 text-center">
              <div className="text-3xl font-bold text-cyber-amber">11.6%</div>
              <div className="text-xs text-cyber-muted mt-1.5 font-bold">Voltage Fault Injection Rate</div>
              <div className="text-[10px] text-cyber-amber mt-1">Secure Boot signature check bypassed</div>
            </div>

            <div className="p-4 rounded-xl bg-cyber-surface/80 border border-cyber-border text-center">
              <div className="text-3xl font-bold text-white">{traceCount.toLocaleString()}</div>
              <div className="text-xs text-cyber-muted mt-1.5 font-bold">Analyzed Waveforms</div>
              <div className="text-[10px] text-cyber-muted mt-1">High SNR without probe decapitation</div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-cyber-rose/10 border border-cyber-rose/30 text-xs text-slate-200 space-y-3">
            <div className="text-cyber-rose font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              COUNTERMEASURE REMEDIATION ROADMAP:
            </div>
            <ul className="list-disc list-inside space-y-1.5 text-[11px] text-slate-300 leading-relaxed">
              <li>
                <strong>Algorithmic DPA Masking:</strong> Implement first-order Boolean masking for AES SubBytes tables. Mask randomizers must update every block.
              </li>
              <li>
                <strong>Clock Jitter Injection:</strong> Enable internal random clock generator (TRNG-driven) to misalign CPA trace alignment.
              </li>
              <li>
                <strong>Glitch Detectors:</strong> Deploy on-die voltage drop and brown-out sensors paired with dual-rail redundant critical comparisons (<code className="text-cyber-cyan">verify_sig() == 0 && verify_sig_inv() == ~0</code>).
              </li>
              <li>
                <strong>Hardware Root of Trust:</strong> Migrate cryptographic keys to a tamper-resistant Secure Element (e.g. ATECC608B or OPTIGA Trust M).
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
