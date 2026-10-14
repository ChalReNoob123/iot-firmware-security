'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

export default function ExplodedPcbHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [explosionLevel, setExplosionLevel] = useState<number>(1.0);
  const explosionLevelRef = useRef<number>(1.0);

  useEffect(() => {
    explosionLevelRef.current = explosionLevel;
  }, [explosionLevel]);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06090e, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f5d4, 2.5);
    dirLight1.position.set(10, 20, 15);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x7b2cbf, 2.0);
    dirLight2.position.set(-10, -10, -10);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xff3366, 3, 20);
    pointLight.position.set(0, 2, 0);
    scene.add(pointLight);

    // Group for the exploded PCB
    const pcbGroup = new THREE.Group();
    scene.add(pcbGroup);

    // 1. Bottom Aluminum Shield (Layer -1.5)
    const baseGeo = new THREE.BoxGeometry(7, 0.2, 5);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.8,
      roughness: 0.2,
      wireframe: false
    });
    const basePlate = new THREE.Mesh(baseGeo, baseMat);
    basePlate.position.y = -1.8;
    pcbGroup.add(basePlate);

    // 2. Main PCB Substrate (Layer 0)
    const pcbGeo = new THREE.BoxGeometry(6.6, 0.15, 4.6);
    const pcbMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b, // Matte dark green solder mask
      metalness: 0.3,
      roughness: 0.4
    });
    const mainPcb = new THREE.Mesh(pcbGeo, pcbMat);
    mainPcb.position.y = 0;
    pcbGroup.add(mainPcb);

    // Copper Traces Grid on PCB
    const traceGrid = new THREE.GridHelper(6, 20, 0x00f5d4, 0x1e3a8a);
    traceGrid.position.y = 0.09;
    pcbGroup.add(traceGrid);

    // 3. ARM SoC MCU (Layer +1.0)
    const mcuGeo = new THREE.BoxGeometry(1.6, 0.25, 1.6);
    const mcuMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.1
    });
    const mcu = new THREE.Mesh(mcuGeo, mcuMat);
    mcu.position.set(-1.0, 0.8, -0.5);
    pcbGroup.add(mcu);

    // 4. SPI Flash Memory (Layer +0.7)
    const flashGeo = new THREE.BoxGeometry(0.8, 0.2, 1.1);
    const flashMat = new THREE.MeshStandardMaterial({
      color: 0x1e1e24,
      metalness: 0.7,
      roughness: 0.3
    });
    const flashChip = new THREE.Mesh(flashGeo, flashMat);
    flashChip.position.set(1.2, 0.7, -0.8);
    pcbGroup.add(flashChip);

    // 5. BLE / Wi-Fi RF Shield & Antenna (Layer +1.2)
    const rfGeo = new THREE.BoxGeometry(1.4, 0.3, 1.2);
    const rfMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.95,
      roughness: 0.05
    });
    const rfShield = new THREE.Mesh(rfGeo, rfMat);
    rfShield.position.set(1.4, 1.1, 1.0);
    pcbGroup.add(rfShield);

    // 6. Top Heatsink Enclosure (Layer +2.5)
    const heatsinkGeo = new THREE.BoxGeometry(6.8, 0.3, 4.8);
    const heatsinkMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.7,
      roughness: 0.3,
      transparent: true,
      opacity: 0.75,
      wireframe: true
    });
    const heatsink = new THREE.Mesh(heatsinkGeo, heatsinkMat);
    heatsink.position.y = 2.4;
    pcbGroup.add(heatsink);

    // Glowing Laser Scan Plane
    const laserGeo = new THREE.PlaneGeometry(8, 6);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    const laserPlane = new THREE.Mesh(laserGeo, laserMat);
    laserPlane.rotation.x = Math.PI / 2;
    scene.add(laserPlane);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0.3;
    let targetRotationY = -0.5;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotationY = mouseX * 0.8;
      targetRotationX = 0.3 + mouseY * 0.4;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let currentExplosion = explosionLevelRef.current;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth group rotation with fluid spring inertia
      pcbGroup.rotation.y += (targetRotationY - pcbGroup.rotation.y) * 0.045;
      pcbGroup.rotation.x += (targetRotationX - pcbGroup.rotation.x) * 0.045;

      // Organic levitation breathing drift
      pcbGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.12;

      // Smooth physics damping for layer explosion
      currentExplosion += (explosionLevelRef.current - currentExplosion) * 0.08;
      basePlate.position.y = -1.8 * currentExplosion;
      heatsink.position.y = 2.4 * currentExplosion;
      rfShield.position.y = 0.5 + 0.6 * currentExplosion;
      flashChip.position.y = 0.3 + 0.4 * currentExplosion;
      mcu.position.y = 0.4 + 0.4 * currentExplosion;

      // Laser sweep animation with fluid breathing
      laserPlane.position.y = Math.sin(elapsedTime * 2.2) * 2.2;
      laserMat.opacity = 0.18 + Math.sin(elapsedTime * 4) * 0.08;

      // Pulse RF point light
      pointLight.intensity = 2 + Math.sin(elapsedTime * 4) * 1.5;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const newW = containerRef.current.clientWidth;
      const newH = containerRef.current.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      const domElement = renderer.domElement;
      if (domElement && domElement.parentNode) {
        domElement.parentNode.removeChild(domElement);
      }
      renderer.dispose();
    };
  }, []); // Run once on mount for rock-solid 60 FPS performance

  return (
    <div className="relative w-full h-[540px] rounded-2xl glass-panel-glow overflow-hidden select-none border border-cyber-cyan/30 cyber-liquid-border">
      {/* HUD Header Overlay */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-3 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-card/80 border border-cyber-cyan/40 text-xs font-mono text-cyber-cyan">
          <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-ping" />
          AUTONOMOUS HARDWARE SCANNER ACTIVE
        </div>
        <div className="text-xs text-cyber-muted font-mono hidden md:block">
          TARGET: ARM Cortex-A9 IoT Gateway (GW-800)
        </div>
      </div>

      {/* Interactive Controls Overlay */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
        <button
          onClick={() => setExplosionLevel((prev) => (prev === 1 ? 1.8 : 1))}
          className="px-3 py-1.5 rounded-lg bg-cyber-surface/90 hover:bg-cyber-cyan/20 border border-cyber-border text-xs text-cyber-cyan transition-all flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          {explosionLevel === 1 ? 'Explode Layer Stack' : 'Collapse Layers'}
        </button>
      </div>

      {/* Layer Hotspots Indicator */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 text-right font-mono text-[11px]">
        <div className="px-2.5 py-1 rounded bg-cyber-surface/70 border border-cyber-border/40 text-cyber-muted">
          Layer 4: <span className="text-cyber-cyan">Shield / Heatsink (Al)</span>
        </div>
        <div className="px-2.5 py-1 rounded bg-cyber-surface/70 border border-cyber-rose/40 text-cyber-rose font-bold">
          Layer 3: <span className="text-cyber-rose">BLE/GATT RF Core (Zero-Day Target)</span>
        </div>
        <div className="px-2.5 py-1 rounded bg-cyber-surface/70 border border-cyber-border/40 text-cyber-muted">
          Layer 2: <span className="text-cyber-blue">SoC (ARMv7 32-bit Cortex-A9)</span>
        </div>
        <div className="px-2.5 py-1 rounded bg-cyber-surface/70 border border-cyber-amber/40 text-cyber-amber">
          Layer 1: <span className="text-cyber-amber">SPI NOR Flash (16MB SquashFS)</span>
        </div>
      </div>

      {/* 3D Canvas Mount Point */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
}
