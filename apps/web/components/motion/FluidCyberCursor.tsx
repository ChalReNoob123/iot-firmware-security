'use client';

import React, { useEffect, useState, useRef } from 'react';

/**
 * FluidCyberCursor - Futuristic Interactive HUD Reticle
 * Provides a fluid spring-lagged holographic targeting cursor that tracks mouse movement,
 * expands into lock-on brackets over interactive elements, and emits subtle cyber energy.
 */
export default function FluidCyberCursor() {
  const [enabled, setEnabled] = useState<boolean>(true);
  const [isHoveringInteractive, setIsHoveringInteractive] = useState<boolean>(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if pointer is fine (mouse/trackpad, not touch)
    if (typeof window === 'undefined' || !window.matchMedia('(pointer: fine)').matches) {
      setEnabled(false);
      return;
    }

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let animId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      // Check if target or parent is interactive
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = Boolean(
          target.closest('button, a, input, select, textarea, [role="button"], canvas, .clickable')
        );
        setIsHoveringInteractive(interactive);
      }
    };

    const updateRing = () => {
      // Fluid spring lerp interpolation
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }

      animId = requestAnimationFrame(updateRing);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    animId = requestAnimationFrame(updateRing);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {/* 1. Direct Pinpoint Cursor Dot */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-2 h-2 -ml-1 -mt-1 rounded-full bg-cyber-cyan shadow-[0_0_8px_#00f5d4] transition-opacity duration-300 will-change-transform"
      />

      {/* 2. Fluid Spring Holographic Reticle Ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 -ml-5 -mt-5 rounded-full border border-cyber-cyan/40 transition-[width,height,margin,border-color,background-color] duration-200 ease-out will-change-transform flex items-center justify-center ${
          isHoveringInteractive
            ? 'w-14 h-14 -ml-7 -mt-7 border-cyber-cyan bg-cyber-cyan/10 shadow-[0_0_16px_rgba(0,245,212,0.4)]'
            : 'w-10 h-10 -ml-5 -mt-5 bg-transparent'
        }`}
      >
        {/* Holographic Crosshair Ticks */}
        {isHoveringInteractive && (
          <div className="relative w-full h-full animate-radar-sweep">
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-0.5 bg-cyber-cyan" />
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-0.5 bg-cyber-cyan" />
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-1.5 bg-cyber-cyan" />
            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-1.5 bg-cyber-cyan" />
          </div>
        )}
      </div>
    </div>
  );
}
