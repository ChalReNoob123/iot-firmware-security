'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { cyberAudio } from '@/lib/audio';

export default function TaintFlow3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [taintStep, setTaintStep] = useState<number>(3); // Step 0 to 3
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const taintStepRef = useRef<number>(taintStep);

  useEffect(() => {
    taintStepRef.current = taintStep;
  }, [taintStep]);

  // Automated step-by-step player
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setTaintStep((prev) => (prev >= 3 ? 0 : prev + 1));
        cyberAudio.playClick();
      }, 1600);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    let width = container.clientWidth;
    let height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 3.8, 9.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    const domElement = renderer.domElement;
    container.appendChild(domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0x38bdf8, 1.2);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0x00f5d4, 2.5);
    dirLight.position.set(5, 10, 8);
    scene.add(dirLight);

    const redLight = new THREE.PointLight(0xff3366, 3, 20);
    redLight.position.set(0, 1.5, 2);
    scene.add(redLight);

    const stackGroup = new THREE.Group();
    scene.add(stackGroup);

    // 3D Memory Stack Slots (Stack Frame)
    const slotCount = 8;
    const slots: THREE.Mesh[] = [];

    for (let i = 0; i < slotCount; i++) {
      const geo = new THREE.BoxGeometry(4.5, 0.45, 1.8);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x0c1e2e,
        metalness: 0.8,
        roughness: 0.2,
        wireframe: false,
        emissive: 0x001122
      });

      const slot = new THREE.Mesh(geo, mat);
      slot.position.y = (i - slotCount / 2) * 0.6;
      stackGroup.add(slot);
      slots.push(slot);
    }

    // Packet Flux Particles (Attacker controlled bytes streaming in)
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 6;
      particlePos[i + 1] = Math.random() * 6;
      particlePos[i + 2] = (Math.random() - 0.5) * 4;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xff3366,
      size: 0.08,
      transparent: true,
      opacity: 0.85
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Dynamic rotation & animation loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentStep = taintStepRef.current;

      stackGroup.rotation.y = Math.sin(time * 0.5) * 0.3 - 0.2;
      particles.rotation.y = -time * 0.4;

      // Update slot colors dynamically based on active taintStep
      slots.forEach((slot, idx) => {
        const mat = slot.material as THREE.MeshStandardMaterial;
        if (currentStep === 0) {
          // Ingress: only base slot
          if (idx <= 1) {
            mat.color.setHex(0x00f5d4);
            mat.emissive.setHex(0x003328);
          } else {
            mat.color.setHex(0x0c1e2e);
            mat.emissive.setHex(0x001122);
          }
        } else if (currentStep === 1) {
          // Length propagation
          if (idx <= 3) {
            mat.color.setHex(0xf59e0b);
            mat.emissive.setHex(0x331c00);
          } else {
            mat.color.setHex(0x0c1e2e);
            mat.emissive.setHex(0x001122);
          }
        } else if (currentStep === 2) {
          // Stack capacity reached
          if (idx <= 5) {
            mat.color.setHex(0xf97316);
            mat.emissive.setHex(0x331100);
          } else {
            mat.color.setHex(0x0c1e2e);
            mat.emissive.setHex(0x001122);
          }
        } else {
          // Full Hijack (Overwritten return pointer)
          if (idx >= 4) {
            mat.color.setHex(0xff3366);
            mat.emissive.setHex(0x660022);
          } else {
            mat.color.setHex(0x0c1e2e);
            mat.emissive.setHex(0x001122);
          }
        }
      });

      // Animate packet particles streaming downwards into stack
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        positions[i] -= 0.06;
        if (positions[i] < -3) positions[i] = 4;
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
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      if (domElement.parentNode) {
        domElement.parentNode.removeChild(domElement);
      }
      renderer.dispose();
    };
  }, []);

  const stepDescriptions = [
    { title: 'Step 1: Radio Ingress', desc: 'BLE GATT packet (1024 bytes) loaded into attr_value_buffer via register $r0' },
    { title: 'Step 2: Unchecked Length', desc: 'Header length (0x0400 = 1024) loaded into $r2 without asserting len <= 256' },
    { title: 'Step 3: Stack Allocation', desc: 'Target buffer capacity fixed at 256 bytes; delta of 768 bytes will overflow' },
    { title: 'Step 4: Control Flow Hijack', desc: 'memcpy() overwrites saved $lr and $fp with 0x41414141 -> Full $PC RCE' }
  ];

  return (
    <div className="w-full glass-panel p-5 rounded-2xl border border-cyber-rose/40 flex flex-col gap-4 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyber-border/40 pb-3">
        <div>
          <div className="text-xs text-cyber-rose font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyber-rose animate-ping" />
            3D SYMBOLIC TAINT PROPAGATION & MEMORY CORRUPTION SOLVER
          </div>
          <h3 className="text-sm font-bold text-white mt-0.5">
            Z3 Constraint Reachability &rarr; <code>memcpy()</code> Buffer Overflow at <code>0x00014a80</code>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsPlaying(!isPlaying);
              cyberAudio.playClick();
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              isPlaying ? 'bg-cyber-rose/20 text-cyber-rose border border-cyber-rose/40' : 'bg-cyber-cyan text-cyber-bg'
            }`}
          >
            {isPlaying ? 'Pause Playhead' : 'Auto Play Steps'}
          </button>
          <span className="text-[11px] text-cyber-emerald font-bold bg-cyber-emerald/10 px-2.5 py-1 rounded border border-cyber-emerald/30">
            SAT SOLVER: SATISFIABLE (94%)
          </span>
        </div>
      </div>

      {/* Interactive Step Switcher */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {stepDescriptions.map((s, idx) => (
          <button
            key={idx}
            onClick={() => {
              setTaintStep(idx);
              cyberAudio.playClick();
            }}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              taintStep === idx
                ? idx === 3
                  ? 'bg-cyber-rose/20 border-cyber-rose text-cyber-rose shadow-[0_0_12px_rgba(255,51,102,0.3)]'
                  : 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan shadow-[0_0_12px_rgba(0,245,212,0.3)]'
                : 'bg-cyber-surface/60 border-cyber-border text-cyber-muted hover:text-white'
            }`}
          >
            <div className="text-[10px] font-bold">STAGE 0{idx + 1}</div>
            <div className="text-xs font-bold text-white truncate">{s.title}</div>
          </button>
        ))}
      </div>

      {/* 3D Stack Canvas Viewport */}
      <div className="relative w-full h-[320px] rounded-xl bg-cyber-bg/90 border border-cyber-border/60 overflow-hidden">
        <div className="absolute top-3 left-3 z-10 font-mono text-[10px] space-y-1">
          <div className="text-cyber-cyan font-bold">&larr; Stack Base: 0x7efff900</div>
          <div className={`font-bold transition-colors ${taintStep === 3 ? 'text-cyber-rose font-black' : 'text-slate-400'}`}>
            &larr; Return Address ($lr / 0x7efff850): {taintStep === 3 ? 'OVERWRITTEN (0x41414141)' : '0x000149f0'}
          </div>
          <div className={`font-bold transition-colors ${taintStep === 3 ? 'text-cyber-rose font-black' : 'text-slate-400'}`}>
            &larr; Frame Pointer ($fp / 0x7efff84c): {taintStep === 3 ? 'OVERWRITTEN (0x41414141)' : '0x7efff900'}
          </div>
          <div className="text-cyber-muted">&larr; Target Buffer [256 bytes]: 0x7efff840</div>
        </div>

        <div className="absolute bottom-3 right-3 z-10 text-[10px] text-cyber-muted bg-cyber-bg/80 px-2 py-1 rounded border border-cyber-border/40">
          Current State: <span className="text-white font-bold">{stepDescriptions[taintStep].desc}</span>
        </div>

        <div ref={containerRef} className="w-full h-full" />
      </div>

      {/* Taint Step Details */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-cyber-surface/80 border border-cyber-border">
          <div className="text-[10px] text-cyber-muted">INGRESS PACKET</div>
          <div className="text-white font-bold mt-1">BLE GATT (0xFFE1)</div>
          <div className="text-[10px] text-cyber-cyan mt-0.5">Length: 1024 Bytes</div>
        </div>
        <div className="p-3 rounded-xl bg-cyber-surface/80 border border-cyber-border">
          <div className="text-[10px] text-cyber-muted">UNCHECKED LENGTH</div>
          <div className="text-cyber-amber font-bold mt-1">Reg $r2 Ingestion</div>
          <div className="text-[10px] text-cyber-muted mt-0.5">Missing bound check</div>
        </div>
        <div className="p-3 rounded-xl bg-cyber-surface/80 border border-cyber-border">
          <div className="text-[10px] text-cyber-muted">STACK CAPACITY</div>
          <div className="text-white font-bold mt-1">256 Bytes Array</div>
          <div className="text-[10px] text-cyber-muted mt-0.5">Stack Delta: 768 Bytes</div>
        </div>
        <div className="p-3 rounded-xl bg-cyber-rose/10 border border-cyber-rose/40">
          <div className="text-[10px] text-cyber-rose font-bold">CONTROL HIJACK</div>
          <div className="text-cyber-rose font-bold mt-1">Full $PC Control</div>
          <div className="text-[10px] text-cyber-rose mt-0.5">Unauthenticated RCE</div>
        </div>
      </div>
    </div>
  );
}
