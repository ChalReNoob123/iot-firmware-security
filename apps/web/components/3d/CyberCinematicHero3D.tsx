'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { cyberAudio } from '@/lib/audio';
import { useSentinelStore } from '@/lib/store';

interface Props {
  className?: string;
}

export default function CyberCinematicHero3D({ className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { showToast } = useSentinelStore();
  const [activeVisualMode, setActiveVisualMode] = useState<'NEURAL_FUZZ' | 'SOC_ARCH' | 'ZERO_DAY_TAINT'>('NEURAL_FUZZ');
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [fuzzRate] = useState<number>(1840);
  const activeModeRef = useRef(activeVisualMode);

  useEffect(() => {
    activeModeRef.current = activeVisualMode;
  }, [activeVisualMode]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    let width = container.clientWidth;
    let height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06090e, 0.022);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 4.2, 11);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    const domElement = renderer.domElement;
    container.appendChild(domElement);

    // 1. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 0.9);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x00f5d4, 4.5, 30);
    cyanLight.position.set(6, 8, 8);
    scene.add(cyanLight);

    const violetLight = new THREE.PointLight(0xa855f7, 4.5, 30);
    violetLight.position.set(-6, -4, -6);
    scene.add(violetLight);

    const roseLight = new THREE.PointLight(0xff3366, 3.5, 20);
    roseLight.position.set(0, 3, 0);
    scene.add(roseLight);

    // 2. Central Master Holographic Group
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // Isometric Holographic Base Floor Grid
    const floorGrid = new THREE.GridHelper(16, 24, 0x00f5d4, 0x132030);
    floorGrid.position.y = -2.2;
    masterGroup.add(floorGrid);

    // Central SoC Processor Die (Silicon Wafer Slab)
    const socGeo = new THREE.BoxGeometry(4.2, 0.28, 4.2);
    const socMat = new THREE.MeshStandardMaterial({
      color: 0x09101d,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0x040c14
    });
    const socMesh = new THREE.Mesh(socGeo, socMat);
    socMesh.position.y = -0.5;
    masterGroup.add(socMesh);

    // Golden Micro-Circuit Bus Ring
    const busGeo = new THREE.TorusGeometry(3.2, 0.08, 16, 64);
    const busMat = new THREE.MeshStandardMaterial({
      color: 0x00f5d4,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x00443a
    });
    const busRing = new THREE.Mesh(busGeo, busMat);
    busRing.rotation.x = Math.PI / 2;
    busRing.position.y = -0.4;
    masterGroup.add(busRing);

    // Satellite Core Co-processors (Cortex-A9 Quad-Core Array)
    const coreMeshes: THREE.Mesh[] = [];
    const coreOffsets = [
      { x: -1.2, z: -1.2, color: 0x00f5d4 },
      { x: 1.2, z: -1.2, color: 0xa855f7 },
      { x: -1.2, z: 1.2, color: 0x38bdf8 },
      { x: 1.2, z: 1.2, color: 0xff3366 }
    ];

    coreOffsets.forEach((cfg) => {
      const cGeo = new THREE.BoxGeometry(1.2, 0.35, 1.2);
      const cMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        metalness: 0.85,
        roughness: 0.2,
        emissive: 0x111827
      });
      const cMesh = new THREE.Mesh(cGeo, cMat);
      cMesh.position.set(cfg.x, -0.2, cfg.z);
      masterGroup.add(cMesh);
      coreMeshes.push(cMesh);
    });

    // Central Floating Quantum Crystal Core (Octahedron)
    const crystalGeo = new THREE.OctahedronGeometry(1.3, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x00f5d4,
      metalness: 0.92,
      roughness: 0.08,
      wireframe: false,
      emissive: 0x003328
    });
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    crystalMesh.position.set(0, 1.2, 0);
    masterGroup.add(crystalMesh);

    // Holographic Wireframe Shell enclosing the core
    const shellGeo = new THREE.IcosahedronGeometry(2.0, 1);
    const shellMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    shellMesh.position.set(0, 1.2, 0);
    masterGroup.add(shellMesh);

    // Expanding Holographic Shockwave Ring on Mode Transition
    const shockwaveGeo = new THREE.TorusGeometry(0.1, 0.04, 16, 64);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      transparent: true,
      opacity: 0
    });
    const shockwaveMesh = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    shockwaveMesh.rotation.x = Math.PI / 2;
    shockwaveMesh.position.y = 1.2;
    masterGroup.add(shockwaveMesh);

    // 3. Volumetric Scanning Laser Plane
    const laserGeo = new THREE.PlaneGeometry(6.5, 6.5);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.22
    });
    const laserPlane = new THREE.Mesh(laserGeo, laserMat);
    laserPlane.rotation.x = Math.PI / 2;
    masterGroup.add(laserPlane);

    // 4. Fluid Orbiting Quantum Particles Swarm (650 Fuzz Mutation Packets)
    const particleCount = 650;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);
    const particleRadii = new Float32Array(particleCount);
    const particleAngles = new Float32Array(particleCount);
    const particleHeights = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      const radius = 2.4 + Math.random() * 5.2;
      const angle = Math.random() * Math.PI * 2;
      const h = (Math.random() - 0.5) * 5.5;

      particleRadii[i] = radius;
      particleAngles[i] = angle;
      particleHeights[i] = h;
      particleSpeeds[i] = 0.008 + Math.random() * 0.016;

      particlePos[idx] = Math.cos(angle) * radius;
      particlePos[idx + 1] = h;
      particlePos[idx + 2] = Math.sin(angle) * radius;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00f5d4,
      size: 0.075,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Fluid Mouse Interaction with Spring Inertia
    let mouseX = 0;
    let mouseY = 0;
    let targetRotY = 0;
    let targetRotX = 0.25;
    let shockwaveScale = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = mouseX * 0.65;
      targetRotX = 0.25 + mouseY * 0.32;
    };

    container.addEventListener('mousemove', handleMouseMove);

    // 5. Render Animation Loop (60 FPS with Fluid Physics)
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Fluid spring follow parallax
      masterGroup.rotation.y += (targetRotY - masterGroup.rotation.y) * 0.045;
      masterGroup.rotation.x += (targetRotX - masterGroup.rotation.x) * 0.045;

      // Auto rotation if enabled
      if (isRotating) {
        masterGroup.rotation.y += 0.0035;
      }

      // Crystal & Shell core organic rotation
      crystalMesh.rotation.y = time * 0.85;
      crystalMesh.rotation.z = time * 0.45;
      crystalMesh.position.y = 1.2 + Math.sin(time * 2.2) * 0.16;
      shellMesh.rotation.y = -time * 0.55;
      shellMesh.position.y = crystalMesh.position.y;

      // Volumetric Laser sweep scanning
      laserPlane.position.y = Math.sin(time * 2.4) * 1.8 + 0.2;

      // Shockwave ring animation
      if (shockwaveScale > 0) {
        shockwaveScale += 0.14;
        shockwaveMesh.scale.set(shockwaveScale, shockwaveScale, shockwaveScale);
        shockwaveMat.opacity = Math.max(0, 0.8 - shockwaveScale * 0.14);
        if (shockwaveScale > 6) {
          shockwaveScale = 0;
          shockwaveMat.opacity = 0;
        }
      }

      // Color/Mode Reactive Shifts with Smooth Fluid Lerp
      const currentMode = activeModeRef.current;
      if (currentMode === 'ZERO_DAY_TAINT') {
        laserMat.color.lerp(new THREE.Color(0xff3366), 0.08);
        particleMat.color.lerp(new THREE.Color(0xff3366), 0.08);
        crystalMat.color.lerp(new THREE.Color(0xff3366), 0.08);
        shockwaveMat.color.setHex(0xff3366);
        roseLight.intensity = 5;
      } else if (currentMode === 'SOC_ARCH') {
        laserMat.color.lerp(new THREE.Color(0xa855f7), 0.08);
        particleMat.color.lerp(new THREE.Color(0x38bdf8), 0.08);
        crystalMat.color.lerp(new THREE.Color(0xa855f7), 0.08);
        shockwaveMat.color.setHex(0xa855f7);
        roseLight.intensity = 2;
      } else {
        laserMat.color.lerp(new THREE.Color(0x00f5d4), 0.08);
        particleMat.color.lerp(new THREE.Color(0x00f5d4), 0.08);
        crystalMat.color.lerp(new THREE.Color(0x00f5d4), 0.08);
        shockwaveMat.color.setHex(0x00f5d4);
        roseLight.intensity = 3.5;
      }

      // Satellite Core pulsers
      coreMeshes.forEach((mesh, idx) => {
        mesh.scale.y = 1.0 + Math.sin(time * 4.2 + idx * 1.5) * 0.18;
      });

      // Animate Fluid Orbiting Particles
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        particleAngles[i] += particleSpeeds[i];
        const rad = particleRadii[i] + Math.sin(time * 1.5 + i) * 0.2;

        positions[idx] = Math.cos(particleAngles[i]) * rad;
        positions[idx + 1] = particleHeights[i] + Math.sin(time * 2 + i * 0.1) * 0.35;
        positions[idx + 2] = Math.sin(particleAngles[i]) * rad;
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      if (domElement.parentNode) {
        domElement.parentNode.removeChild(domElement);
      }
      renderer.dispose();
    };
  }, [isRotating]);

  return (
    <div className={`relative w-full h-[560px] rounded-2xl glass-panel-glow border border-cyber-cyan/40 overflow-hidden font-mono select-none cyber-liquid-border ${className}`}>
      {/* 3D WebGL Canvas Viewport */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left Holographic HUD Badge */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyber-bg/90 border border-cyber-cyan/50 text-xs text-cyber-cyan backdrop-blur-md shadow-[0_0_18px_rgba(0,245,212,0.35)]">
          <span className="w-2.5 h-2.5 rounded-full bg-cyber-cyan animate-ping" />
          <span className="font-bold tracking-wider cyber-text-shimmer">VOLUMETRIC HARDWARE CORE & 3D SCANNER</span>
        </div>
        <div className="text-[10px] text-cyber-muted pl-1">
          Fluid Particle Dynamics &bull; ACES Filmic Shaders &bull; 60 FPS Accelerated
        </div>
      </div>

      {/* Top Right Mode Switcher Tabs */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5">
        {[
          { id: 'NEURAL_FUZZ' as const, label: 'Neural Fuzz Vortex', color: 'border-cyber-cyan text-cyber-cyan' },
          { id: 'SOC_ARCH' as const, label: 'SoC Architecture', color: 'border-cyber-purple text-cyber-purple' },
          { id: 'ZERO_DAY_TAINT' as const, label: 'Zero-Day Taint Beam', color: 'border-cyber-rose text-cyber-rose' }
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => {
              setActiveVisualMode(m.id);
              cyberAudio.playClick();
              showToast(`Visual Engine switched to ${m.label}`, 'INFO');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all backdrop-blur-md border cyber-hover-lift cyber-sheen-sweep ${
              activeVisualMode === m.id
                ? 'bg-cyber-surface/90 shadow-[0_0_15px_rgba(0,245,212,0.3)] ' + m.color
                : 'bg-cyber-bg/80 text-cyber-muted border-cyber-border hover:text-white'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Bottom Floating Telemetry Bar */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-cyber-bg/85 border border-cyber-border/70 backdrop-blur-md text-xs">
        <div className="flex items-center gap-6">
          <div>
            <div className="text-[10px] text-cyber-muted">MUTATION VELOCITY</div>
            <div className="text-cyber-cyan font-bold flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse" />
              {fuzzRate.toLocaleString()} execs/sec
            </div>
          </div>
          <div>
            <div className="text-[10px] text-cyber-muted">AST COVERAGE REACH</div>
            <div className="text-cyber-emerald font-bold mt-0.5">78.4% (3.8x AI Gain)</div>
          </div>
          <div className="hidden md:block">
            <div className="text-[10px] text-cyber-muted">Z3 PATH FEASIBILITY</div>
            <div className="text-cyber-purple font-bold mt-0.5">SATISFIABLE (94%)</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className="px-3 py-1 rounded-lg bg-cyber-surface hover:bg-cyber-card border border-cyber-border text-xs text-cyber-muted hover:text-white transition-colors cyber-hover-lift"
          >
            {isRotating ? 'Pause Orbit' : 'Resume Orbit'}
          </button>
          <button
            onClick={() => {
              cyberAudio.playRadarSweep();
              showToast('Holographic LiDAR calibration synchronized across 3D axes.', 'SUCCESS');
            }}
            className="px-3.5 py-1 rounded-lg bg-cyber-cyan text-cyber-bg font-bold text-xs hover:bg-cyber-cyan/90 transition-all shadow-[0_0_15px_rgba(0,245,212,0.35)] cyber-hover-lift cyber-sheen-sweep"
          >
            Recalibrate Scanner
          </button>
        </div>
      </div>
    </div>
  );
}
