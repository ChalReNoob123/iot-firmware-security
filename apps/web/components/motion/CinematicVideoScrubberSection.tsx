'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, ShieldAlert, Cpu, Activity, Terminal, ArrowUpRight, Sparkles, Sliders } from 'lucide-react';

type VideoStreamMode = 'THERMAL_SILICON' | 'MEMORY_RASTER' | 'DISASSEMBLY_HUD' | 'OSCILLOSCOPE_RF';

export default function CinematicVideoScrubberSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState(4.2); // in seconds
  const [activeMode, setActiveMode] = useState<VideoStreamMode>('THERMAL_SILICON');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const totalDuration = 15.0; // 15 seconds loop

  // Audio Context for Cyber Tone Generation
  const audioCtxRef = useRef<AudioContext | null>(null);

  const toggleAudio = () => {
    if (!audioEnabled) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
        setAudioEnabled(true);
      } catch {
        setAudioEnabled(false);
      }
    } else {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setAudioEnabled(false);
    }
  };

  // Playback timer loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.05 * playbackSpeed;
        return next > totalDuration ? 0 : next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, totalDuration]);

  // Procedural 60 FPS Video Frame Generation Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      frame++;

      const width = (canvas.width = canvas.clientWidth || 960);
      const height = (canvas.height = canvas.clientHeight || 540);

      const progress = currentTime / totalDuration; // 0.0 to 1.0

      // 1. Deep Obsidian / Void Black Canvas Base
      ctx.fillStyle = '#08080A';
      ctx.fillRect(0, 0, width, height);

      // Subtle Background Grid
      ctx.strokeStyle = 'rgba(39, 39, 42, 0.4)';
      ctx.lineWidth = 1;
      const gridSize = 32;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Render Based on Selected Video Mode
      if (activeMode === 'THERMAL_SILICON') {
        // Infrared Silicon Thermal Die & Bus Traces
        const centerX = width / 2;
        const centerY = height / 2;
        const dieSize = Math.min(width, height) * 0.48;

        // Radiating Thermal Heat Gradient
        const heatGrad = ctx.createRadialGradient(
          centerX,
          centerY,
          10,
          centerX,
          centerY,
          dieSize * (0.8 + Math.sin(frame * 0.05) * 0.1)
        );
        heatGrad.addColorStop(0, 'rgba(255, 59, 48, 0.7)');
        heatGrad.addColorStop(0.35, 'rgba(255, 184, 0, 0.4)');
        heatGrad.addColorStop(0.7, 'rgba(0, 240, 255, 0.2)');
        heatGrad.addColorStop(1, 'rgba(8, 8, 10, 0)');

        ctx.fillStyle = heatGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, dieSize, 0, Math.PI * 2);
        ctx.fill();

        // Silicon Die Geometry
        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = 2;
        ctx.strokeRect(centerX - dieSize / 2, centerY - dieSize / 2, dieSize, dieSize);

        // Core Quadrants
        const qSize = dieSize / 2 - 8;
        const quads = [
          { x: centerX - dieSize / 2 + 4, y: centerY - dieSize / 2 + 4, name: 'MIPS CORE 0' },
          { x: centerX + 4, y: centerY - dieSize / 2 + 4, name: 'MMIO BRIDGE' },
          { x: centerX - dieSize / 2 + 4, y: centerY + 4, name: 'CRYPTO ACCEL' },
          { x: centerX + 4, y: centerY + 4, name: 'SRAM CACHE' }
        ];

        quads.forEach((q, idx) => {
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
          ctx.strokeRect(q.x, q.y, qSize, qSize);

          // Internal Activity Micro-Pulses
          ctx.fillStyle = idx === 0 ? 'rgba(255, 59, 48, 0.25)' : 'rgba(0, 240, 255, 0.08)';
          ctx.fillRect(q.x, q.y, qSize, qSize);

          ctx.fillStyle = '#A1A1AA';
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillText(q.name, q.x + 8, q.y + 18);
        });

        // Pulsing Data Bus Lines radiating outwards
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2 + progress * 2;
          const x1 = centerX + Math.cos(angle) * (dieSize / 2);
          const y1 = centerY + Math.sin(angle) * (dieSize / 2);
          const x2 = centerX + Math.cos(angle) * (dieSize / 2 + 80);
          const y2 = centerY + Math.sin(angle) * (dieSize / 2 + 80);

          ctx.strokeStyle = i % 2 === 0 ? '#00F0FF' : '#FFB800';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          // Traveling packet dot
          const dotT = (frame * 0.04 + i * 0.2) % 1;
          const dotX = x1 + (x2 - x1) * dotT;
          const dotY = y1 + (y2 - y1) * dotT;
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (activeMode === 'MEMORY_RASTER') {
        // Real-Time Shannon Entropy & Memory Hex Taint Map
        const rows = 14;
        const cols = 28;
        const cellW = (width - 80) / cols;
        const cellH = (height - 100) / rows;

        ctx.font = '10px "JetBrains Mono", monospace';

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = 40 + c * cellW;
            const y = 50 + r * cellH;
            const cellIndex = r * cols + c;

            // Simulate taint saturation wave
            const isCorrupted = cellIndex >= 140 && cellIndex <= 140 + Math.floor(progress * 110);
            const isHighEntropy = (cellIndex * 7 + frame) % 17 === 0;

            if (isCorrupted) {
              ctx.fillStyle = 'rgba(255, 59, 48, 0.85)';
              ctx.fillRect(x, y, cellW - 2, cellH - 2);
              ctx.fillStyle = '#FFFFFF';
              ctx.fillText('0xAA', x + 4, y + cellH - 6);
            } else if (isHighEntropy) {
              ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
              ctx.fillRect(x, y, cellW - 2, cellH - 2);
              ctx.fillStyle = '#00F0FF';
              ctx.fillText('FF', x + 6, y + cellH - 6);
            } else {
              ctx.fillStyle = 'rgba(24, 24, 27, 0.7)';
              ctx.fillRect(x, y, cellW - 2, cellH - 2);
              ctx.fillStyle = '#52525B';
              ctx.fillText('00', x + 6, y + cellH - 6);
            }
          }
        }

        // Taint Overflow Arrow Alert
        ctx.fillStyle = '#FF3B30';
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.fillText(
          `[CRITICAL SINK OVERFLOW] OFFSET 0x8004B2A0 + ${(progress * 420).toFixed(0)} BYTES`,
          40,
          height - 24
        );
      } else if (activeMode === 'DISASSEMBLY_HUD') {
        // High-Speed Disassembly Flow & Register Inspection
        const lines = [
          '0x8004b280:  addiu   $sp, $sp, -0x40',
          '0x8004b284:  sw      $ra, 0x3c($sp)',
          '0x8004b288:  sw      $s0, 0x38($sp)',
          '0x8004b28c:  move    $s0, $a0        ; BLE adv payload buffer',
          '0x8004b290:  lw      $a1, 0x14($s0)  ; Unsanitized length',
          '0x8004b294:  sltiu   $v0, $a1, 0x20  ; Bounds check omitted',
          '0x8004b298:  addiu   $a0, $sp, 0x10  ; Dest stack buffer',
          '0x8004b29c:  move    $a2, $a1        ; Byte count param',
          '0x8004b2a0:  jal     memcpy          <-- SINK OVERWRITING $RA',
          '0x8004b2a4:  nop',
          '0x8004b2a8:  lw      $ra, 0x3c($sp)  ; $ra hijacked to shellcode',
          '0x8004b2ac:  jr      $ra             ; Control flow redirection'
        ];

        ctx.font = '12px "JetBrains Mono", monospace';
        const activeLine = Math.min(lines.length - 1, Math.floor(progress * lines.length));

        lines.forEach((l, idx) => {
          const y = 70 + idx * 28;
          if (idx === activeLine) {
            ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
            ctx.fillRect(40, y - 18, width - 80, 24);
            ctx.fillStyle = '#00F0FF';
            ctx.font = 'bold 12px "JetBrains Mono", monospace';
            ctx.fillText(`> ${l}`, 50, y);
          } else if (idx === 8) {
            ctx.fillStyle = '#FF3B30';
            ctx.font = 'bold 12px "JetBrains Mono", monospace';
            ctx.fillText(`  ${l}`, 50, y);
          } else {
            ctx.fillStyle = idx < activeLine ? '#A1A1AA' : '#52525B';
            ctx.font = '12px "JetBrains Mono", monospace';
            ctx.fillText(`  ${l}`, 50, y);
          }
        });
      } else {
        // Oscilloscope RF Waveform & Hardware Bus Packet Monitor
        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < width; x += 3) {
          const freq = 0.02 + progress * 0.03;
          const y = height / 2 + Math.sin(x * freq + frame * 0.08) * 60 * Math.sin(x * 0.003);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Secondary Violet Waveform
        ctx.strokeStyle = '#A855F7';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x < width; x += 3) {
          const y = height / 2 + Math.cos(x * 0.015 - frame * 0.05) * 45;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // 3. Cinematic Scanlines CRT Overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      for (let y = 0; y < height; y += 4) {
        ctx.fillRect(0, y, width, 1.5);
      }

      // 4. Anamorphic Lens Flare Glow at Center
      const flare = ctx.createLinearGradient(0, height / 2, width, height / 2);
      flare.addColorStop(0, 'rgba(0, 240, 255, 0)');
      flare.addColorStop(0.5, 'rgba(0, 240, 255, 0.25)');
      flare.addColorStop(1, 'rgba(0, 240, 255, 0)');
      ctx.fillStyle = flare;
      ctx.fillRect(0, height / 2 - 1, width, 2);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [currentTime, totalDuration, activeMode]);

  return (
    <section className="relative py-16 sm:py-24 border-t border-zinc-border/60 bg-void-950/90 overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-neon-cyan/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-void-900 border border-zinc-border text-xs font-mono text-neon-cyan mb-3">
            <Activity className="w-3.5 h-3.5" />
            CINEMATIC HARDWARE EXECUTION VIDEO RECONSTRUCTION
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-heading text-white tracking-tight">
            High-Speed Silicon Stream Scrubber
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-400 font-sans max-w-2xl">
            Inspect execution frames, memory taint saturation, and bus signal waveforms in real time.
            Drag the scrub slider to inspect instruction-by-instruction memory corruption.
          </p>
        </div>

        {/* Cinematic Video Player Frame */}
        <div className="rounded-3xl border border-zinc-border bg-void-900/90 shadow-[0_30px_70px_rgba(0,0,0,0.85)] overflow-hidden backdrop-blur-2xl">
          
          {/* Top Video Header & Mode Switcher */}
          <div className="px-5 py-3.5 border-b border-zinc-border/70 bg-void-950/80 flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-zinc-400">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-neon-cyan inline-block animate-pulse" />
              <span className="font-bold text-white tracking-wider">
                EXECUTION STREAM: POD-MIPS32-QEMU-01
              </span>
              <span className="hidden sm:inline text-zinc-600">&bull;</span>
              <span className="hidden sm:inline text-neon-emerald">FRAME RATE: 60 FPS</span>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1 bg-void-900 p-1 rounded-xl border border-zinc-border">
              {(
                [
                  { id: 'THERMAL_SILICON', label: 'Infrared Die' },
                  { id: 'MEMORY_RASTER', label: 'Memory Taint' },
                  { id: 'DISASSEMBLY_HUD', label: 'Disassembly' },
                  { id: 'OSCILLOSCOPE_RF', label: 'Oscilloscope' }
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveMode(m.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all ${
                    activeMode === m.id
                      ? 'bg-neon-cyan text-void-950 font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Canvas Viewport (16:9 Aspect Ratio) */}
          <div className="relative w-full aspect-[16/9] max-h-[520px] bg-void-950 overflow-hidden">
            <canvas ref={canvasRef} className="w-full h-full block" />

            {/* Corner HUD Badges */}
            <div className="absolute top-4 left-4 pointer-events-none font-mono text-[10px] text-zinc-400 space-y-1">
              <div className="px-2.5 py-1 rounded bg-void-900/80 border border-zinc-border backdrop-blur-md text-white font-bold">
                TIME: {currentTime.toFixed(3)}s / {totalDuration.toFixed(1)}s
              </div>
              <div className="px-2.5 py-1 rounded bg-void-900/80 border border-zinc-border backdrop-blur-md text-neon-cyan">
                $PC: 0x8004B2A0 &bull; $SP: 0x7FFFDFC8
              </div>
            </div>

            <div className="absolute top-4 right-4 pointer-events-none font-mono text-[10px] text-right space-y-1">
              <div className="px-2.5 py-1 rounded bg-neon-crimson/20 border border-neon-crimson/50 backdrop-blur-md text-neon-crimson font-bold inline-block">
                EXPLOIT PRIMITIVE: SINK_REACHED
              </div>
            </div>
          </div>

          {/* Bottom Scrubbing & Playback Controller Bar */}
          <div className="p-4 sm:p-5 bg-void-950/90 border-t border-zinc-border/70 flex flex-col gap-3 font-mono">
            
            {/* Scrubber Range Slider */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-400 w-16">
                {currentTime.toFixed(2)}s
              </span>
              <input
                type="range"
                min={0}
                max={totalDuration}
                step={0.05}
                value={currentTime}
                onChange={(e) => {
                  setCurrentTime(parseFloat(e.target.value));
                  setIsPlaying(false);
                }}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-neon-cyan"
              />
              <span className="text-xs text-zinc-500 w-14 text-right">
                {totalDuration.toFixed(1)}s
              </span>
            </div>

            {/* Control Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-3.5 py-1.5 rounded-xl bg-neon-cyan text-void-950 font-bold hover:bg-neon-cyan/90 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.3)] text-xs"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
                </button>

                <button
                  onClick={() => setCurrentTime(0)}
                  className="p-1.5 rounded-xl bg-void-900 border border-zinc-border text-zinc-400 hover:text-white transition-colors"
                  title="Rewind to start"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Speed buttons */}
                <div className="flex items-center gap-1 bg-void-900 p-1 rounded-xl border border-zinc-border text-xs text-zinc-400">
                  {[0.5, 1, 2].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        playbackSpeed === spd
                          ? 'bg-zinc-800 text-neon-cyan font-bold'
                          : 'hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>

                <button
                  onClick={toggleAudio}
                  className={`p-1.5 rounded-xl border transition-colors ${
                    audioEnabled
                      ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/10'
                      : 'border-zinc-border text-zinc-500 hover:text-zinc-300 bg-void-900'
                  }`}
                  title="Toggle Audio Feedback"
                >
                  {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>

              {/* Direct Link Actions */}
              <div className="flex items-center gap-3 text-xs">
                <Link
                  href="/attack-graph"
                  className="text-neon-cyan hover:underline flex items-center gap-1 font-bold"
                >
                  <span>Attack Graph</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
                <Link
                  href="/terminal"
                  className="text-zinc-400 hover:text-white flex items-center gap-1"
                >
                  <span>Interactive Terminal</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
