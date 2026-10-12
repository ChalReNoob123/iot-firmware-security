'use client';

import React, { useRef, useEffect } from 'react';

interface Props {
  className?: string;
}

/**
 * Cinematic Video Motion & Particle Shader Canvas
 * Renders a procedural 60fps high-tech cyber operations visual loop with oscilloscope data streams,
 * particle matrix sweeps, and CRT scanlines.
 */
export default function CinematicVideoHero({ className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    // Particle Matrix
    const particleCount = 80;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      size: Math.random() * 2 + 1,
      color: Math.random() > 0.3 ? '#00f5d4' : '#7b2cbf',
      alpha: Math.random() * 0.6 + 0.2
    }));

    // Data packet beams
    const beams = Array.from({ length: 5 }, (_, i) => ({
      x: (width / 6) * (i + 1),
      y: Math.random() * height,
      speed: Math.random() * 3 + 2,
      length: Math.random() * 80 + 40,
      color: i % 2 === 0 ? '#00f5d4' : '#ff3366'
    }));

    let frame = 0;

    const render = () => {
      frame++;
      ctx.fillStyle = 'rgba(6, 9, 14, 0.25)';
      ctx.fillRect(0, 0, width, height);

      // Subtle Background Grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
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

      // Draw and connect particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        // Connect nearby particles with glowing cyber lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = '#00f5d4';
            ctx.globalAlpha = (1 - dist / 100) * 0.15;
            ctx.stroke();
          }
        }
      }

      // Draw Vertical Data Packet Beams
      for (const beam of beams) {
        beam.y += beam.speed;
        if (beam.y > height + beam.length) beam.y = -beam.length;

        const grad = ctx.createLinearGradient(beam.x, beam.y, beam.x, beam.y + beam.length);
        grad.addColorStop(0, 'rgba(0, 245, 212, 0)');
        grad.addColorStop(0.5, beam.color);
        grad.addColorStop(1, 'rgba(0, 245, 212, 0)');

        ctx.beginPath();
        ctx.moveTo(beam.x, beam.y);
        ctx.lineTo(beam.x, beam.y + beam.length);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.7;
        ctx.stroke();
      }

      // Live Oscilloscope Frequency Waveform at bottom
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = '#00f5d4';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < width; x += 4) {
        const y = height - 40 + Math.sin(x * 0.015 + frame * 0.04) * 15 * Math.cos(x * 0.005);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.globalAlpha = 1.0;
      animationId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block opacity-70" />
      {/* Scanline CRT overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-cyber-bg pointer-events-none" />
    </div>
  );
}
