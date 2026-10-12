'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface Props {
  videoSrc?: string;
  fallbackPoster?: string;
  title?: string;
  subtitle?: string;
}

/**
 * Scroll-Driven Video Playhead Scrubber & Motion System
 * Connects page scroll velocity and distance directly to HTML5 video currentTime.
 */
export default function ScrollVideoScrubber({
  videoSrc,
  title = 'AI Coverage-Guided Fuzzing in Real-Time',
  subtitle = 'Scroll to scrub through emulated instruction execution and memory taint mutation states.'
}: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    // Simulated Canvas-Based High-FPS Video/Data Playhead Scrubbing
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    const height = (canvas.height = 360);

    let progress = { value: 0 };

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top center',
      end: 'bottom center',
      scrub: 0.8,
      onUpdate: (self) => {
        progress.value = self.progress;

        // Scrub video currentTime if real video element is attached
        if (videoRef.current && videoRef.current.duration) {
          videoRef.current.currentTime = videoRef.current.duration * self.progress;
        }

        // Draw real-time animated memory scrub canvas
        ctx.fillStyle = '#06090e';
        ctx.fillRect(0, 0, width, height);

        // Cyber Grid Lines
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }

        // Animated Waveform / Mutation Curve
        ctx.beginPath();
        ctx.strokeStyle = '#00f5d4';
        ctx.lineWidth = 3;
        for (let x = 0; x < width; x++) {
          const y =
            height / 2 +
            Math.sin((x * 0.02) + (progress.value * Math.PI * 4)) * 60 * (1 - Math.abs(x / width - 0.5));
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Highlighting Playhead Cursor
        const playheadX = width * progress.value;
        ctx.strokeStyle = '#ff3366';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(playheadX, 0);
        ctx.lineTo(playheadX, height);
        ctx.stroke();

        // Playhead Label
        ctx.fillStyle = '#ff3366';
        ctx.font = '11px monospace';
        ctx.fillText(
          `TAINT STEP: 0x${Math.floor(progress.value * 0xffff).toString(16).padStart(4, '0')} ($pc)`,
          Math.min(playheadX + 8, width - 180),
          30
        );

        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.fillText(`SCRUB PROGRESS: ${Math.round(progress.value * 100)}%`, Math.min(playheadX + 8, width - 180), 48);
      }
    });

    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <div ref={sectionRef} className="glass-panel p-6 rounded-2xl border border-cyber-cyan/30 flex flex-col gap-4 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyber-border/40 pb-3">
        <div>
          <div className="text-xs text-cyber-cyan font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyber-rose animate-ping" />
            GSAP SCROLLTRIGGER MOTION SYSTEM
          </div>
          <h3 className="text-sm font-bold text-white mt-0.5">{title}</h3>
        </div>
        <span className="text-[11px] text-cyber-muted">{subtitle}</span>
      </div>

      {/* HTML5 Video Tag with muted, autoPlay, loop, playsInline (Optional video source) */}
      {videoSrc ? (
        <div className="relative w-full rounded-xl overflow-hidden bg-black/90 border border-cyber-border">
          <video
            ref={videoRef}
            src={videoSrc}
            muted
            autoPlay
            loop
            playsInline
            className="w-full h-auto max-h-[360px] object-cover"
          />
        </div>
      ) : (
        <div className="relative w-full rounded-xl overflow-hidden bg-black/90 border border-cyber-border/80 scanlines">
          <canvas ref={canvasRef} className="w-full h-[240px] block" />
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] text-cyber-muted pt-1">
        <span>&larr; Scroll page to drive execution playback</span>
        <span className="text-cyber-cyan font-bold">GSAP Scrub Speed: 1.0s Smooth Spring</span>
      </div>
    </div>
  );
}
