'use client';

import React, { useRef, useEffect, useState } from 'react';

interface DashboardScrollVideoScrubberProps {
  className?: string;
  firmwareName?: string;
  architecture?: string;
}

export default function DashboardScrollVideoScrubber({
  className = '',
  firmwareName = 'firmware-ax9000.bin',
  architecture = 'ARM Cortex-A9 (32-bit Little-Endian)'
}: DashboardScrollVideoScrubberProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Scroll Progress State (0.0 to 1.0)
  const [scrollProgress, setScrollProgress] = useState(0.0);
  const [isHovered, setIsHovered] = useState(false);
  const [manualScrub, setManualScrub] = useState<number | null>(null);

  const activeProgress = manualScrub !== null ? manualScrub : scrollProgress;

  // Window Scroll Listener to drive the video animation
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowH = window.innerHeight;

      // Calculate relative visibility progress as container moves through viewport
      const totalDist = windowH + rect.height;
      const currentDist = windowH - rect.top;
      const rawProgress = currentDist / totalDist;
      const clamped = Math.max(0, Math.min(1, rawProgress));

      setScrollProgress(clamped);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // High-Performance 60FPS Procedural Video Frame Rendering Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frameCount = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      frameCount++;

      const width = canvas.width;
      const height = canvas.height;

      // 1. Clear with Deep Obsidian Background
      ctx.fillStyle = '#06090e';
      ctx.fillRect(0, 0, width, height);

      // Current Animation Phase based on Scroll
      const p = activeProgress;

      // Grid Lattice
      ctx.strokeStyle = 'rgba(0, 245, 212, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 40;
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

      // ==========================================
      // PHASE 1: SILICON MOTHERBOARD & PCB BUS (0.0 - 0.35)
      // ==========================================
      const pcbAlpha = Math.max(0, 1 - Math.abs(p - 0.2) * 2.5);
      if (pcbAlpha > 0.01) {
        ctx.save();
        ctx.globalAlpha = pcbAlpha;

        // Central SoC Die
        const centerX = width * 0.5;
        const centerY = height * 0.5;
        const chipSize = 140;

        ctx.strokeStyle = '#00f5d4';
        ctx.lineWidth = 2;
        ctx.strokeRect(centerX - chipSize / 2, centerY - chipSize / 2, chipSize, chipSize);

        // Chip Core Gradient Fill
        const grad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 80);
        grad.addColorStop(0, 'rgba(0, 245, 212, 0.25)');
        grad.addColorStop(1, 'rgba(6, 9, 14, 0.9)');
        ctx.fillStyle = grad;
        ctx.fillRect(centerX - chipSize / 2, centerY - chipSize / 2, chipSize, chipSize);

        // Die Pinout Lines radiating outward
        for (let i = 0; i < 16; i++) {
          const angle = (i / 16) * Math.PI * 2;
          const startR = chipSize / 2;
          const endR = startR + 80 + Math.sin(frameCount * 0.05 + i) * 15;
          const sx = centerX + Math.cos(angle) * startR;
          const sy = centerY + Math.sin(angle) * startR;
          const ex = centerX + Math.cos(angle) * endR;
          const ey = centerY + Math.sin(angle) * endR;

          ctx.strokeStyle = i % 2 === 0 ? '#00f5d4' : '#a855f7';
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(ex, ey);
          ctx.stroke();

          // Data Pulse along the bus line
          const pulseT = (frameCount * 0.03 + i * 0.2) % 1;
          const px = sx + (ex - sx) * pulseT;
          const py = sy + (ey - sy) * pulseT;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Chip Label
        ctx.fillStyle = '#00f5d4';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ARM CORTEX-A9', centerX, centerY - 10);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.fillText('HW TRUST ROOT', centerX, centerY + 12);
        ctx.restore();
      }

      // ==========================================
      // PHASE 2: BINARY FLASH STREAM & ENTROPY RADAR (0.25 - 0.70)
      // ==========================================
      const streamAlpha = Math.max(0, 1 - Math.abs(p - 0.5) * 2.2);
      if (streamAlpha > 0.01) {
        ctx.save();
        ctx.globalAlpha = streamAlpha;

        // Disassembly & Memory Hex Waterfall
        ctx.font = '11px monospace';
        const hexCols = 8;
        const hexRows = 14;
        const startX = 60;
        const startY = 80;

        for (let r = 0; r < hexRows; r++) {
          const yPos = startY + r * 22;
          const memAddr = (0x00401000 + (r + Math.floor(p * 200)) * 16).toString(16).toUpperCase();
          ctx.fillStyle = 'rgba(0, 245, 212, 0.5)';
          ctx.textAlign = 'left';
          ctx.fillText(`0x${memAddr}:`, startX, yPos);

          for (let c = 0; c < hexCols; c++) {
            const byteVal = Math.floor(Math.abs(Math.sin(r * 3 + c * 5 + frameCount * 0.02)) * 255)
              .toString(16)
              .padStart(2, '0')
              .toUpperCase();

            // Highlight suspicious payload bytes (Entropy > 7.9)
            if ((r + c) % 5 === 0) {
              ctx.fillStyle = '#ff3366';
              ctx.fillText(byteVal, startX + 110 + c * 32, yPos);
            } else {
              ctx.fillStyle = '#cbd5e1';
              ctx.fillText(byteVal, startX + 110 + c * 32, yPos);
            }
          }
        }

        // Live Entropy Waveform on the Right
        const waveX = width - 260;
        const waveY = 80;
        const waveW = 200;
        const waveH = 260;

        ctx.strokeStyle = '#334155';
        ctx.strokeRect(waveX, waveY, waveW, waveH);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
        ctx.fillRect(waveX, waveY, waveW, waveH);

        ctx.fillStyle = '#00f5d4';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('SHANNON ENTROPY (H=7.94)', waveX + 10, waveY + 22);

        // Draw dynamic entropy bars
        const numBars = 16;
        const barW = (waveW - 30) / numBars;
        for (let b = 0; b < numBars; b++) {
          const barH = 50 + Math.sin(b * 0.8 + frameCount * 0.05 + p * 10) * 45 + (b > 10 ? 90 : 30);
          const bx = waveX + 15 + b * (barW + 1);
          const by = waveY + waveH - barH - 15;

          const isHighEntropy = barH > 120;
          ctx.fillStyle = isHighEntropy ? '#ff3366' : '#00f5d4';
          ctx.fillRect(bx, by, barW, barH);
        }

        ctx.restore();
      }

      // ==========================================
      // PHASE 3: TAINT SINK & VOLUMETRIC COLLAPSE (0.60 - 1.0)
      // ==========================================
      const exploitAlpha = Math.max(0, (p - 0.6) / 0.4);
      if (exploitAlpha > 0.01) {
        ctx.save();
        ctx.globalAlpha = exploitAlpha;

        const centerX = width * 0.5;
        const centerY = height * 0.5;

        // Concentric Volumetric Shockwaves
        const shockwaves = 5;
        for (let s = 0; s < shockwaves; s++) {
          const baseRadius = ((frameCount * 1.5 + s * 45) % 220);
          const shockProgress = baseRadius / 220;
          const sAlpha = (1 - shockProgress) * 0.8;

          ctx.strokeStyle = s % 2 === 0 ? `rgba(255, 51, 102, ${sAlpha})` : `rgba(168, 85, 247, ${sAlpha})`;
          ctx.lineWidth = 3 - shockProgress * 2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Taint Vector Target Reticle
        ctx.strokeStyle = '#ff3366';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 35, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ff3366';
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CRITICAL SINK BREACH', centerX, centerY - 50);

        ctx.fillStyle = '#ffffff';
        ctx.font = '11px monospace';
        ctx.fillText('PC OVERWRITE @ 0x7FFF8098', centerX, centerY + 60);
        ctx.fillText('SAT SOLVER: TAINT CONFIRMED', centerX, centerY + 78);

        ctx.restore();
      }

      // ==========================================
      // CINEMATIC SCANLINE & HUD OVERLAY
      // ==========================================
      const scanlineY = (frameCount * 2) % height;
      ctx.strokeStyle = 'rgba(0, 245, 212, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, scanlineY);
      ctx.lineTo(width, scanlineY);
      ctx.stroke();

      // Top-Left Frame Timecode HUD
      ctx.fillStyle = '#00f5d4';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'left';
      const frameNum = Math.floor(p * 240).toString().padStart(4, '0');
      ctx.fillText(`FRAME: #${frameNum} / 0240`, 20, 30);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`SCROLL SCRUB: ${(p * 100).toFixed(1)}%`, 20, 48);

      // Top-Right Memory Pointer
      ctx.textAlign = 'right';
      ctx.fillStyle = '#a855f7';
      const currAddr = (0x00400000 + Math.floor(p * 0x000FFFFF)).toString(16).toUpperCase();
      ctx.fillText(`IP: 0x${currAddr}`, width - 20, 30);
      ctx.fillStyle = '#10b981';
      ctx.fillText('EXECUTION: 60 FPS SYNC', width - 20, 48);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [activeProgress]);

  // Adjust canvas resolution to element dimensions
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      canvasRef.current.width = containerRef.current.clientWidth || 800;
      canvasRef.current.height = 360;
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setManualScrub(null);
      }}
      className={`relative flex flex-col rounded-2xl border border-cyber-cyan/30 bg-cyber-bg overflow-hidden cyber-liquid-border shadow-2xl ${className}`}
    >
      {/* Top Video Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-cyber-border/60 bg-cyber-surface/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-cyber-rose/10 border border-cyber-rose/40">
            <span className="w-2 h-2 rounded-full bg-cyber-rose animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wider flex items-center gap-2">
              <span>PAGE-SCROLLING SILICON EXECUTION VIDEO</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40">
                SCROLL-DRIVEN 60FPS
              </span>
            </h3>
            <p className="text-[11px] font-mono text-cyber-muted">
              {firmwareName} &bull; {architecture} &bull; Interactive Timeline Scrubbing
            </p>
          </div>
        </div>

        {/* Dynamic Stage Pill */}
        <div className="font-mono text-[11px]">
          {activeProgress < 0.35 && (
            <span className="px-3 py-1 rounded-md bg-cyber-cyan/10 border border-cyber-cyan/40 text-cyber-cyan">
              STAGE 1: HARDWARE BUS PROBING
            </span>
          )}
          {activeProgress >= 0.35 && activeProgress < 0.65 && (
            <span className="px-3 py-1 rounded-md bg-cyber-amber/10 border border-cyber-amber/40 text-cyber-amber">
              STAGE 2: MEMORY DUMP & ENTROPY SCAN
            </span>
          )}
          {activeProgress >= 0.65 && (
            <span className="px-3 py-1 rounded-md bg-cyber-rose/10 border border-cyber-rose/40 text-cyber-rose animate-pulse">
              STAGE 3: ZERO-DAY TAINT OVERWRITE
            </span>
          )}
        </div>
      </div>

      {/* Main Canvas Video Scrubber */}
      <div className="relative w-full h-[360px] bg-[#06090e]">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Video Scrubber Bar on Bottom */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center gap-3 px-4 py-2 rounded-xl bg-cyber-surface/80 border border-cyber-border/60 backdrop-blur-md font-mono text-xs">
          <span className="text-[10px] text-cyber-cyan font-bold whitespace-nowrap">
            VIDEO SCRUB:
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.005"
            value={activeProgress}
            onChange={(e) => setManualScrub(parseFloat(e.target.value))}
            className="w-full accent-cyber-cyan cursor-pointer h-1.5 bg-cyber-border rounded-lg"
          />
          <span className="text-[11px] text-cyber-cyan font-bold min-w-[50px] text-right">
            {(activeProgress * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}
