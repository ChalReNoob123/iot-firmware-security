'use client';

import React, { useRef, useEffect } from 'react';

/**
 * Industrial Engineering Dark Chassis Grid Backdrop
 * High-performance, low-overhead static CAD/EDA grid canvas.
 * Eliminates distracting floating particles, floating text, and rotating radars,
 * providing a rock-solid, ultra-high-contrast background for security engineering.
 */
export default function GlobalCinematicBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resize = () => {
      const width = (canvas.width = window.innerWidth);
      const height = (canvas.height = window.innerHeight);

      // Deep solid dark void base
      ctx.fillStyle = '#06090e';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle technical blueprint grid (48px primary cells)
      const gridSize = 48;
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(24, 34, 53, 0.45)';

      ctx.beginPath();
      for (let x = 0; x <= width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Precision crosshair tick marks at major intersections (every 192px)
      const majorStep = gridSize * 4;
      ctx.strokeStyle = 'rgba(0, 245, 212, 0.35)';
      ctx.lineWidth = 1;

      for (let x = majorStep; x < width; x += majorStep) {
        for (let y = majorStep; y < height; y += majorStep) {
          ctx.beginPath();
          // Horizontal tick
          ctx.moveTo(x - 4, y);
          ctx.lineTo(x + 4, y);
          // Vertical tick
          ctx.moveTo(x, y - 4);
          ctx.lineTo(x, y + 4);
          ctx.stroke();
        }
      }

      // Subtle edge vignette for focus
      const vignette = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        Math.min(width, height) * 0.4,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.85
      );
      vignette.addColorStop(0, 'rgba(6, 9, 14, 0)');
      vignette.addColorStop(1, 'rgba(6, 9, 14, 0.85)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
