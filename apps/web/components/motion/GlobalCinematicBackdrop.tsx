'use client';

import React, { useRef, useEffect, useState } from 'react';

/**
 * Global Cinematic 3D Cyber Video Backdrop
 * Provides a lightweight, 60 FPS hardware-accelerated ambient 3D procedural video animation
 * with interactive fluid particle physics, kinetic mouse wave ripples, glowing synaptic
 * constellations, and CRT phosphor radar sweep.
 */
export default function GlobalCinematicBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fxIntensity, setFxIntensity] = useState<'FULL' | 'BALANCED' | 'STEALTH'>('FULL');
  const [showHudCtrl, setShowHudCtrl] = useState<boolean>(false);

  useEffect(() => {
    if (fxIntensity === 'STEALTH') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Interactive mouse momentum & fluid force field
    let mouseX = width * 0.5;
    let mouseY = height * 0.5;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;
    let mouseSpeed = 0;
    let lastEventTime = performance.now();

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      const dt = Math.max(1, now - lastEventTime);
      const dx = e.clientX - targetMouseX;
      const dy = e.clientY - targetMouseY;
      mouseSpeed = Math.min(Math.hypot(dx, dy) / dt, 5); // Clamped kinetic speed
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
      lastEventTime = now;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Grid configuration
    const cols = fxIntensity === 'FULL' ? 32 : 22;
    const rows = fxIntensity === 'FULL' ? 20 : 14;
    const spacingX = width / cols;
    const spacingY = height / rows;

    // Glowing telemetry particles floating in depth with spring physics
    const particleCount = fxIntensity === 'FULL' ? 60 : 35;
    const particles = Array.from({ length: particleCount }, () => {
      const x = Math.random() * width;
      const y = Math.random() * height;
      return {
        x,
        y,
        originX: x,
        originY: y,
        z: Math.random() * 0.8 + 0.2, // Depth factor
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2.2 + 1.0,
        color: Math.random() > 0.45 ? '#00f5d4' : Math.random() > 0.5 ? '#8b5cf6' : '#38bdf8',
        alpha: Math.random() * 0.5 + 0.25,
        pulseOffset: Math.random() * Math.PI * 2
      };
    });

    // Floating bytecode snippets
    const hexSnippets = [
      '0x41414141', '0x00014a80', '0x7efff840', 'memcpy@plt',
      'Z3_SAT', 'CORTEX-A9', 'FSTM-05', '0xDEADBEEF', 'TAINT_FLOW_OK'
    ];
    const floatingTexts = Array.from({ length: 7 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      text: hexSnippets[Math.floor(Math.random() * hexSnippets.length)],
      vy: -0.25 - Math.random() * 0.35,
      alpha: Math.random() * 0.35 + 0.12
    }));

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse spring lerp
      mouseX += (targetMouseX - mouseX) * 0.08;
      mouseY += (targetMouseY - mouseY) * 0.08;
      mouseSpeed *= 0.95; // Fluid deceleration

      // Deep cyber gradient base with subtle mouse-following luminescence
      const bgGrad = ctx.createRadialGradient(
        mouseX,
        mouseY,
        50,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.95
      );
      bgGrad.addColorStop(0, 'rgba(10, 22, 38, 0.55)');
      bgGrad.addColorStop(0.5, 'rgba(6, 12, 22, 0.7)');
      bgGrad.addColorStop(1, 'rgba(4, 7, 12, 0.92)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 1. Isometric undulating 3D grid with fluid cursor repulsion
      const t = frame * 0.016;

      // Draw horizontal undulating lines
      for (let r = 0; r < rows; r++) {
        ctx.beginPath();
        const yBase = r * spacingY;
        ctx.strokeStyle = `rgba(0, 245, 212, ${0.025 + (r / rows) * 0.035})`;
        ctx.lineWidth = 1;

        for (let c = 0; c < cols; c++) {
          const x = c * spacingX;
          
          // Distance from mouse for fluid ripple deflection
          const distToMouse = Math.hypot(x - mouseX, yBase - mouseY);
          const mouseFactor = Math.max(0, 1 - distToMouse / 280);
          const ripple = Math.sin(distToMouse * 0.03 - t * 3) * mouseFactor * 16 * (1 + mouseSpeed * 0.3);

          const y = yBase + Math.sin(c * 0.22 + t + r * 0.25) * 8 + ripple;
          if (c === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Draw vertical perspective grid lines
      for (let c = 0; c < cols; c += 2) {
        ctx.beginPath();
        const xBase = c * spacingX;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.03)';

        for (let r = 0; r < rows; r++) {
          const y = r * spacingY;
          const distToMouse = Math.hypot(xBase - mouseX, y - mouseY);
          const mouseFactor = Math.max(0, 1 - distToMouse / 260);
          const xRipple = Math.cos(distToMouse * 0.03 - t * 3) * mouseFactor * 10;
          const x = xBase + Math.sin(t + c * 0.2) * 8 + xRipple;

          if (r === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // 2. Interactive Telemetry Particles with Spring Restitution
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Fluid mouse repulsion
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.hypot(dx, dy);
        if (dist < 180 && dist > 0) {
          const force = (1 - dist / 180) * (3 + mouseSpeed * 2);
          p.vx += (dx / dist) * force * p.z;
          p.vy += (dy / dist) * force * p.z;
        }

        // Velocity damping & gentle origin spring
        p.x += p.vx * p.z;
        p.y += p.vy * p.z;
        p.vx *= 0.94;
        p.vy *= 0.94;

        // Subtle ambient orbital drift
        p.x += Math.sin(t + p.pulseOffset) * 0.3 * p.z;
        p.y += Math.cos(t + p.pulseOffset) * 0.3 * p.z;

        // Wrap around boundaries
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // Draw glowing particle
        const breathingAlpha = p.alpha * (0.8 + Math.sin(t * 2 + p.pulseOffset) * 0.2) * p.z;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.z, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = breathingAlpha;
        ctx.fill();

        // Connect nearby nodes with glowing synaptic energy links
        for (let j = i + 1; j < Math.min(i + 5, particles.length); j++) {
          const p2 = particles[j];
          const linkDist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (linkDist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = '#00f5d4';
            ctx.globalAlpha = (1 - linkDist / 120) * 0.12 * p.z;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // 3. Floating Bytecode Streams
      ctx.font = '10px ui-monospace, SFMono-Regular, monospace';
      for (const ft of floatingTexts) {
        ft.y += ft.vy;
        if (ft.y < -20) {
          ft.y = height + 20;
          ft.x = Math.random() * width;
          ft.text = hexSnippets[Math.floor(Math.random() * hexSnippets.length)];
        }
        ctx.fillStyle = '#38bdf8';
        ctx.globalAlpha = ft.alpha;
        ctx.fillText(ft.text, ft.x, ft.y);
      }

      // 4. Rotating Holographic Radar Sweep Beam
      const radarAngle = (frame * 0.009) % (Math.PI * 2);
      const radarCenterX = width * 0.88;
      const radarCenterY = height * 0.18;
      const radarRadius = 130;
      const sweepX = radarCenterX + Math.cos(radarAngle) * radarRadius;
      const sweepY = radarCenterY + Math.sin(radarAngle) * radarRadius;

      const sweepGrad = ctx.createRadialGradient(
        radarCenterX,
        radarCenterY,
        5,
        radarCenterX,
        radarCenterY,
        radarRadius
      );
      sweepGrad.addColorStop(0, 'rgba(0, 245, 212, 0.09)');
      sweepGrad.addColorStop(1, 'rgba(0, 245, 212, 0)');
      ctx.fillStyle = sweepGrad;
      ctx.beginPath();
      ctx.arc(radarCenterX, radarCenterY, radarRadius, 0, Math.PI * 2);
      ctx.fill();

      // Radar beam line
      ctx.beginPath();
      ctx.moveTo(radarCenterX, radarCenterY);
      ctx.lineTo(sweepX, sweepY);
      ctx.strokeStyle = 'rgba(0, 245, 212, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.65;
      ctx.stroke();

      // Reset alpha for next frame
      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [fxIntensity]);

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {fxIntensity !== 'STEALTH' && (
          <canvas
            ref={canvasRef}
            className="w-full h-full block opacity-85 transition-opacity duration-700"
            style={{ willChange: 'transform' }}
          />
        )}
        {/* Cinematic Vignette & CRT Scanlines */}
        <div className="absolute inset-0 bg-gradient-to-t from-cyber-bg via-transparent to-cyber-bg/60 opacity-80 pointer-events-none" />
        <div className="absolute inset-0 scanlines opacity-20 pointer-events-none" />
      </div>

      {/* Floating HUD Ambiance Controller (Bottom Right) */}
      <div className="fixed bottom-3 right-4 z-50 pointer-events-auto">
        <div className="relative">
          {showHudCtrl && (
            <div className="absolute bottom-9 right-0 bg-cyber-card/95 backdrop-blur-md border border-cyber-cyan/30 rounded-lg p-2.5 shadow-2xl w-44 font-mono text-xs text-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="text-[10px] text-cyber-cyan font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Ambient Motion</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-ping" />
              </div>
              <div className="flex flex-col gap-1">
                {(['FULL', 'BALANCED', 'STEALTH'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFxIntensity(mode)}
                    className={`px-2 py-1 rounded text-left transition-colors flex items-center justify-between ${
                      fxIntensity === mode
                        ? 'bg-cyber-cyan/20 text-cyber-cyan font-bold border border-cyber-cyan/40'
                        : 'hover:bg-slate-800/60 text-slate-400'
                    }`}
                  >
                    <span>{mode}</span>
                    {fxIntensity === mode && <span className="text-[9px]">●</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setShowHudCtrl(!showHudCtrl)}
            title="Configure Fluid Cyber Ambiance"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyber-card/80 hover:bg-cyber-card border border-cyber-cyan/20 hover:border-cyber-cyan/60 text-[10px] font-mono text-slate-300 hover:text-cyber-cyan transition-all shadow-lg backdrop-blur-sm group"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan group-hover:scale-125 transition-transform" />
            <span>FX: {fxIntensity}</span>
          </button>
        </div>
      </div>
    </>
  );
}
