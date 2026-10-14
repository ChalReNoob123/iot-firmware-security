'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Cpu, Terminal, Zap, ShieldAlert, Sparkles } from 'lucide-react';

interface Props {
  className?: string;
}

export default function SpatialSocChip({ className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);
  const [telemetryTicks, setTelemetryTicks] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetryTicks((t) => (t + 1) % 1000);
    }, 120);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    let width = container.clientWidth;
    let height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x08080a, 0.025);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 3.8, 8.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    const domElement = renderer.domElement;
    container.appendChild(domElement);

    // 1. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x00f0ff, 0.4);
    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(0x00f0ff, 3.5, 30);
    mainLight.position.set(5, 8, 6);
    scene.add(mainLight);

    const secondaryLight = new THREE.PointLight(0xa855f7, 2.8, 25);
    secondaryLight.position.set(-6, -3, -4);
    scene.add(secondaryLight);

    const crimsonAccent = new THREE.PointLight(0xff3b30, 2.2, 15);
    crimsonAccent.position.set(0, 1.5, 2);
    scene.add(crimsonAccent);

    // 2. Chip Base PCB & Silicon Die Geometry
    const group = new THREE.Group();
    scene.add(group);

    // PCB Substrate Board (Void Black with hairline grid)
    const pcbGeo = new THREE.BoxGeometry(6, 0.18, 6);
    const pcbMat = new THREE.MeshStandardMaterial({
      color: 0x0c0e14,
      roughness: 0.25,
      metalness: 0.85
    });
    const pcbMesh = new THREE.Mesh(pcbGeo, pcbMat);
    pcbMesh.position.y = -0.1;
    group.add(pcbMesh);

    // Gold / Cyan Corner Contacts & Pins
    const pinGroup = new THREE.Group();
    for (let i = -2.8; i <= 2.8; i += 0.4) {
      // North & South pins
      const pinGeo = new THREE.BoxGeometry(0.12, 0.08, 0.35);
      const pinMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, metalness: 0.95, roughness: 0.1 });
      const pinN = new THREE.Mesh(pinGeo, pinMat);
      pinN.position.set(i, -0.05, 3.08);
      pinGroup.add(pinN);

      const pinS = new THREE.Mesh(pinGeo, pinMat);
      pinS.position.set(i, -0.05, -3.08);
      pinGroup.add(pinS);

      // East & West pins
      const pinE = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 0.12), pinMat);
      pinE.position.set(3.08, -0.05, i);
      pinGroup.add(pinE);

      const pinW = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 0.12), pinMat);
      pinW.position.set(-3.08, -0.05, i);
      pinGroup.add(pinW);
    }
    group.add(pinGroup);

    // Center Silicon Die Core (Raised, glowing edge)
    const dieGeo = new THREE.BoxGeometry(3.2, 0.35, 3.2);
    const dieMat = new THREE.MeshStandardMaterial({
      color: 0x05070a,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0x002233,
      emissiveIntensity: 0.6
    });
    const dieMesh = new THREE.Mesh(dieGeo, dieMat);
    dieMesh.position.y = 0.12;
    group.add(dieMesh);

    // Glowing Silicon Etched Traces on top of Die
    const traceGrid = new THREE.GridHelper(3.1, 16, 0x00f0ff, 0x1f2937);
    traceGrid.position.y = 0.31;
    group.add(traceGrid);

    // Floating Holographic Heatspreader Wireframe Cage
    const cageGeo = new THREE.BoxGeometry(3.5, 0.6, 3.5);
    const cageWireMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    const cageMesh = new THREE.Mesh(cageGeo, cageWireMat);
    cageMesh.position.y = 0.25;
    group.add(cageMesh);

    // 3. Floating MicroVM Disassembly Nodes (Surrounding Rings)
    const nodesGroup = new THREE.Group();
    const nodeCount = 18;
    const nodeMeshes: THREE.Mesh[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 3.6 + (i % 3) * 0.5;
      const heightOffset = Math.sin(i * 1.5) * 0.6 + 0.4;

      const nodeGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
      const isCritical = i === 4 || i === 12;
      const nodeMat = new THREE.MeshStandardMaterial({
        color: isCritical ? 0xff3b30 : 0x00f0ff,
        emissive: isCritical ? 0xff3b30 : 0x00f0ff,
        emissiveIntensity: 0.8,
        roughness: 0.2,
        metalness: 0.8
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(Math.cos(angle) * radius, heightOffset, Math.sin(angle) * radius);
      nodesGroup.add(nodeMesh);
      nodeMeshes.push(nodeMesh);
    }
    group.add(nodesGroup);

    // 4. Data Bus Energy Pulse Lines (Connecting Nodes to SoC Die)
    const busLinesGroup = new THREE.Group();
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.4
    });

    for (let i = 0; i < nodeCount; i += 2) {
      const targetPos = nodeMeshes[i].position;
      const points = [
        new THREE.Vector3(0, 0.3, 0),
        new THREE.Vector3(targetPos.x * 0.4, 0.35, targetPos.z * 0.4),
        new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z)
      ];
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, 16, 0.015, 6, false);
      const tubeMesh = new THREE.Mesh(tubeGeo, lineMat);
      busLinesGroup.add(tubeMesh);
    }
    group.add(busLinesGroup);

    // Pointer Parallax Response
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0.35;
    let targetRotationY = -0.45;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / height) * 2 - 1);
      mouseX = x;
      mouseY = y;
      targetRotationY = -0.45 + mouseX * 0.6;
      targetRotationX = 0.35 - mouseY * 0.4;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth camera/group rotation interpolation
      group.rotation.y += (targetRotationY - group.rotation.y) * 0.05 + 0.0018;
      group.rotation.x += (targetRotationX - group.rotation.x) * 0.05;

      // Animate floating disassembly nodes
      for (let i = 0; i < nodeCount; i++) {
        const mesh = nodeMeshes[i];
        mesh.position.y += Math.sin(elapsed * 2 + i) * 0.002;
        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.015;
      }

      // Wireframe pulse
      cageWireMat.opacity = 0.2 + Math.sin(elapsed * 3) * 0.12;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
    };
  }, []);

  return (
    <div className={`relative w-full h-[480px] sm:h-[560px] lg:h-[620px] rounded-3xl overflow-hidden border border-zinc-border bg-gradient-to-b from-void-900/90 via-void-850/80 to-void-950/95 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl ${className}`}>
      {/* Film grain noise & Radial Glow Backdrop */}
      <div className="absolute inset-0 bg-grain pointer-events-none opacity-40" />
      <div className="absolute inset-0 bg-radial-glow-cyan pointer-events-none" />

      {/* 3D WebGL Canvas Injection Target */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left Live System Metadata Header */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-col gap-1 pointer-events-none font-mono">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-void-900/80 border border-zinc-border text-[11px] text-zinc-300 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-neon-cyan animate-ping" />
          <span>MICROVM SPATIAL TWIN &bull; SOC DECONSTRUCTION</span>
        </div>
        <div className="text-[10px] text-zinc-500 tracking-wider">
          EMU ARCH: MIPS32 / ARMv8-M TRUSTZONE &bull; MMIO HOOKS: 24 ACTIVE
        </div>
      </div>

      {/* Top Right Live Telemetry Badge */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 hidden sm:flex items-center gap-3 pointer-events-none font-mono text-[11px]">
        <div className="px-3 py-1 rounded-lg bg-void-900/80 border border-zinc-border text-zinc-300 backdrop-blur-md flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-neon-cyan" />
          <span>BUS SPEED: 480 MHz</span>
        </div>
        <div className="px-3 py-1 rounded-lg bg-void-900/80 border border-neon-crimson/40 text-neon-crimson backdrop-blur-md flex items-center gap-1.5 font-bold">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>1 TAINT SINK REACHED</span>
        </div>
      </div>

      {/* Floating Interactive Disassembly HUD Overlay */}
      <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 pointer-events-none">
        {/* Disassembly Snippet Box */}
        <div className="p-3 sm:p-4 rounded-2xl bg-void-900/85 border border-zinc-border backdrop-blur-xl pointer-events-auto max-w-sm sm:max-w-md w-full shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-border/60 pb-2 mb-2 font-mono text-[10px] text-zinc-400">
            <span className="flex items-center gap-1.5 text-neon-cyan font-bold">
              <Terminal className="w-3 h-3" />
              HOT-PATH DISASSEMBLY (TAINT INGRESS)
            </span>
            <span>$pc: 0x8004B2A0</span>
          </div>
          <div className="font-mono text-[11px] space-y-0.5 text-zinc-300">
            <div className="flex items-center justify-between text-zinc-500">
              <span>0x8004B298:</span>
              <span className="text-zinc-400">addiu $sp, $sp, -0x38</span>
              <span className="text-zinc-600">; allocate stack</span>
            </div>
            <div className="flex items-center justify-between bg-neon-cyan/10 px-1 rounded text-neon-cyan font-bold">
              <span>0x8004B29C:</span>
              <span>lw $a0, 0x14($sp)</span>
              <span className="text-[9px] uppercase tracking-wider text-neon-cyan">Tainted Buf</span>
            </div>
            <div className="flex items-center justify-between bg-neon-crimson/15 px-1 rounded text-neon-crimson font-bold">
              <span>0x8004B2A0:</span>
              <span>jal memcpy</span>
              <span className="text-[9px] uppercase tracking-wider text-neon-crimson animate-pulse">OVERFLOW SINK</span>
            </div>
            <div className="flex items-center justify-between text-zinc-500">
              <span>0x8004B2A4:</span>
              <span className="text-zinc-400">nop</span>
              <span className="text-zinc-600">; branch delay</span>
            </div>
          </div>
        </div>

        {/* Spatial Mode Selector Tags */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs pointer-events-auto">
          <button
            onClick={() => setHoveredModule('CORE_MIPS')}
            className={`px-3 py-1.5 rounded-full border transition-all ${
              hoveredModule === 'CORE_MIPS'
                ? 'bg-neon-cyan text-void-950 border-neon-cyan font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'bg-void-900/80 text-zinc-400 border-zinc-border hover:border-zinc-500'
            }`}
          >
            MIPS32 InterAptiv
          </button>
          <button
            onClick={() => setHoveredModule('MMIO_PERIPH')}
            className={`px-3 py-1.5 rounded-full border transition-all ${
              hoveredModule === 'MMIO_PERIPH'
                ? 'bg-neon-cyan text-void-950 border-neon-cyan font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'bg-void-900/80 text-zinc-400 border-zinc-border hover:border-zinc-500'
            }`}
          >
            Synthetic MMIO
          </button>
          <button
            onClick={() => setHoveredModule('CRYPTO_ACCEL')}
            className={`px-3 py-1.5 rounded-full border transition-all ${
              hoveredModule === 'CRYPTO_ACCEL'
                ? 'bg-neon-cyan text-void-950 border-neon-cyan font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'bg-void-900/80 text-zinc-400 border-zinc-border hover:border-zinc-500'
            }`}
          >
            AES Hardware Engine
          </button>
        </div>
      </div>
    </div>
  );
}
