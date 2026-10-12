'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';

interface HyperSpatial4DVisualizerProps {
  className?: string;
  threatLevel?: 'NOMINAL' | 'ELEVATED' | 'CRITICAL';
  activeCveCount?: number;
}

export default function HyperSpatial4DVisualizer({
  className = '',
  threatLevel = 'CRITICAL',
  activeCveCount = 1739
}: HyperSpatial4DVisualizerProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  // 4D Interactive Controls State
  const [autoRotate, setAutoRotate] = useState(true);
  const [temporalWPhase, setTemporalWPhase] = useState(0.0);
  const [rotationSpeed, setRotationSpeed] = useState(0.8);
  const [projectionDistance, setProjectionDistance] = useState(2.4);
  const [activeProjection, setActiveProjection] = useState<'TESSERACT' | 'CLIFFORD'>('TESSERACT');

  // Real-time 4D angles for telemetry display
  const [euler4D, setEuler4D] = useState({ xw: 0, yw: 0, zw: 0, xz: 0 });

  // 16 Vertices of 4D Hypercube (±1, ±1, ±1, ±1)
  const baseVertices4D = useMemo(() => {
    const v: number[][] = [];
    for (let x = -1; x <= 1; x += 2) {
      for (let y = -1; y <= 1; y += 2) {
        for (let z = -1; z <= 1; z += 2) {
          for (let w = -1; w <= 1; w += 2) {
            v.push([x, y, z, w]);
          }
        }
      }
    }
    return v; // 16 vertices
  }, []);

  // 32 Edges connecting vertices that differ in exactly one coordinate
  const edges4D = useMemo(() => {
    const e: [number, number][] = [];
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        let diff = 0;
        for (let k = 0; k < 4; k++) {
          if (baseVertices4D[i][k] !== baseVertices4D[j][k]) diff++;
        }
        if (diff === 1) {
          e.push([i, j]);
        }
      }
    }
    return e; // 32 edges
  }, [baseVertices4D]);

  // Three.js Scene Setup & 4D Projection Loop
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 420;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06090e, 0.08);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.5);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 3. Ambient & Directional Cyber Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLightCyan = new THREE.PointLight(0x00f5d4, 3, 20);
    pointLightCyan.position.set(3, 4, 3);
    scene.add(pointLightCyan);

    const pointLightRose = new THREE.PointLight(0xff3366, 3, 20);
    pointLightRose.position.set(-3, -4, 2);
    scene.add(pointLightRose);

    const pointLightViolet = new THREE.PointLight(0xa855f7, 2, 20);
    pointLightViolet.position.set(0, 0, 4);
    scene.add(pointLightViolet);

    // 4. Mesh Containers for 4D Tesseract
    const tesseractGroup = new THREE.Group();
    scene.add(tesseractGroup);

    // 16 Vertex Spheres
    const sphereGeo = new THREE.SphereGeometry(0.065, 16, 16);
    const sphereMatCyan = new THREE.MeshStandardMaterial({
      color: 0x00f5d4,
      emissive: 0x00f5d4,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.9
    });
    const sphereMatRose = new THREE.MeshStandardMaterial({
      color: 0xff3366,
      emissive: 0xff3366,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.9
    });

    const vertexMeshes: THREE.Mesh[] = [];
    for (let i = 0; i < 16; i++) {
      const mesh = new THREE.Mesh(sphereGeo, i % 2 === 0 ? sphereMatCyan : sphereMatRose);
      vertexMeshes.push(mesh);
      tesseractGroup.add(mesh);
    }

    // 32 Edges via LineSegments
    const linePositions = new Float32Array(edges4D.length * 2 * 3);
    const lineColors = new Float32Array(edges4D.length * 2 * 3);

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      linewidth: 2
    });

    const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
    tesseractGroup.add(lineSegments);

    // Background Cyber Grid Lattice in 3D
    const gridHelper = new THREE.GridHelper(10, 20, 0x00f5d4, 0x1e293b);
    gridHelper.position.y = -2.2;
    scene.add(gridHelper);

    // Orbit rings for spatial orientation
    const ringGeo = new THREE.RingGeometry(2.8, 2.82, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4, side: THREE.DoubleSide, transparent: true, opacity: 0.15 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    // 4D Rotation Angles
    let angleXW = 0;
    let angleYW = 0;
    let angleZW = 0;
    let angleXZ = 0;

    // 4D Perspective Projection Function
    // Projects 4D (x,y,z,w) into 3D (x', y', z')
    function project4Dto3D(v4: number[], dist: number, wManual: number): THREE.Vector3 {
      let [x, y, z, w] = v4;

      // Add manual temporal displacement
      w += wManual;

      // 1. Rotate in X-W plane
      const cXW = Math.cos(angleXW), sXW = Math.sin(angleXW);
      const x1 = x * cXW - w * sXW;
      const w1 = x * sXW + w * cXW;

      // 2. Rotate in Y-W plane
      const cYW = Math.cos(angleYW), sYW = Math.sin(angleYW);
      const y2 = y * cYW - w1 * sYW;
      const w2 = y * sYW + w1 * cYW;

      // 3. Rotate in Z-W plane
      const cZW = Math.cos(angleZW), sZW = Math.sin(angleZW);
      const z3 = z * cZW - w2 * sZW;
      const w3 = z * sZW + w2 * cZW;

      // 4. Rotate in X-Z plane (3D spatial rotation)
      const cXZ = Math.cos(angleXZ), sXZ = Math.sin(angleXZ);
      const x4 = x1 * cXZ - z3 * sXZ;
      const z4 = x1 * sXZ + z3 * cXZ;

      // 5. 4D Perspective Projection to 3D
      // Scale factor = 1 / (dist - w4)
      const denom = Math.max(0.2, dist - w3);
      const scale = 1.4 / denom;

      return new THREE.Vector3(x4 * scale, y2 * scale, z4 * scale);
    }

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (autoRotate) {
        angleXW += delta * 0.45 * rotationSpeed;
        angleYW += delta * 0.35 * rotationSpeed;
        angleZW += delta * 0.25 * rotationSpeed;
        angleXZ += delta * 0.20 * rotationSpeed;

        // Periodic state emission for UI HUD (throttled)
        if (Math.random() < 0.1) {
          setEuler4D({
            xw: Math.round(((angleXW % (Math.PI * 2)) * 180) / Math.PI),
            yw: Math.round(((angleYW % (Math.PI * 2)) * 180) / Math.PI),
            zw: Math.round(((angleZW % (Math.PI * 2)) * 180) / Math.PI),
            xz: Math.round(((angleXZ % (Math.PI * 2)) * 180) / Math.PI)
          });
        }
      }

      // Compute 3D Projected Points for all 16 Vertices
      const projectedVecs: THREE.Vector3[] = [];
      for (let i = 0; i < 16; i++) {
        const v3 = project4Dto3D(baseVertices4D[i], projectionDistance, temporalWPhase);
        projectedVecs.push(v3);
        vertexMeshes[i].position.copy(v3);

        // Pulse scale based on 4D distance
        const distFromCenter = v3.length();
        const nodeScale = THREE.MathUtils.lerp(0.8, 1.4, Math.sin(distFromCenter * 3 + angleXW) * 0.5 + 0.5);
        vertexMeshes[i].scale.setScalar(nodeScale);
      }

      // Update 32 Edges in BufferGeometry
      const posAttr = lineGeo.attributes.position as THREE.BufferAttribute;
      const colAttr = lineGeo.attributes.color as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;
      const colArray = colAttr.array as Float32Array;

      let pIdx = 0;
      let cIdx = 0;

      for (let i = 0; i < edges4D.length; i++) {
        const [idxA, idxB] = edges4D[i];
        const vA = projectedVecs[idxA];
        const vB = projectedVecs[idxB];

        posArray[pIdx++] = vA.x;
        posArray[pIdx++] = vA.y;
        posArray[pIdx++] = vA.z;

        posArray[pIdx++] = vB.x;
        posArray[pIdx++] = vB.y;
        posArray[pIdx++] = vB.z;

        // Color based on 4D edge tension
        const edgeLength = vA.distanceTo(vB);
        const isInternalCell = edgeLength < 1.0;

        if (isInternalCell) {
          // Internal Hypercube Cell (Cyan Core)
          colArray[cIdx++] = 0.0; colArray[cIdx++] = 0.96; colArray[cIdx++] = 0.83; // #00f5d4
          colArray[cIdx++] = 0.65; colArray[cIdx++] = 0.33; colArray[cIdx++] = 0.97; // #a855f7
        } else {
          // External Boundary (Rose/Amber Threat Boundary)
          colArray[cIdx++] = 1.0; colArray[cIdx++] = 0.20; colArray[cIdx++] = 0.40; // #ff3366
          colArray[cIdx++] = 0.0; colArray[cIdx++] = 0.96; colArray[cIdx++] = 0.83; // #00f5d4
        }
      }

      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;

      // Gentle orbital sway
      tesseractGroup.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.15;
      tesseractGroup.rotation.x = Math.cos(clock.getElapsedTime() * 0.2) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [baseVertices4D, edges4D, autoRotate, rotationSpeed, projectionDistance, temporalWPhase]);

  return (
    <div className={`relative flex flex-col rounded-2xl border border-cyber-cyan/30 bg-cyber-bg/95 overflow-hidden cyber-liquid-border shadow-2xl ${className}`}>
      {/* Top Holographic Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-cyber-border/60 bg-cyber-surface/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/40">
            <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-ping absolute" />
            <span className="w-2 h-2 rounded-full bg-cyber-cyan" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wider flex items-center gap-2">
              <span>4D SPATIO-TEMPORAL TESSERACT ENGINE</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/40">
                &Delta;t&times;&Ropf;<sup>4</sup>
              </span>
            </h3>
            <p className="text-[11px] font-mono text-cyber-muted">
              4-Dimensional Hypercube Projection &bull; 16 Vertices &bull; 32 Temporal Conduits
            </p>
          </div>
        </div>

        {/* Telemetry Status Pills */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <div className="px-2.5 py-1 rounded-md bg-cyber-rose/10 border border-cyber-rose/30 text-cyber-rose flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-rose animate-pulse" />
            <span>EXPLOIT PATHWAYS: <strong>{activeCveCount} ACTIVE</strong></span>
          </div>
          <div className="px-2.5 py-1 rounded-md bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan hidden sm:flex items-center gap-1.5">
            <span>PROJECTION: <strong>PERSPECTIVE (d={projectionDistance})</strong></span>
          </div>
        </div>
      </div>

      {/* Main 4D Canvas Container */}
      <div className="relative w-full h-[380px] sm:h-[440px] bg-gradient-to-b from-[#06090e] via-[#090d16] to-[#06090e]">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Floating 4D Mathematics HUD Overlay (Top-Left) */}
        <div className="absolute top-4 left-4 p-3 rounded-xl bg-cyber-surface/70 border border-cyber-border/60 backdrop-blur-md font-mono text-[11px] text-cyber-muted pointer-events-none space-y-1">
          <div className="text-[10px] text-cyber-cyan font-bold tracking-wider uppercase border-b border-cyber-border/40 pb-1 flex items-center justify-between gap-4">
            <span>4D EULER TENSOR</span>
            <span className="text-cyber-emerald">&bull; LIVE</span>
          </div>
          <div className="flex justify-between gap-4 pt-1">
            <span>&theta;<sub>XW</sub> (Temporal X):</span>
            <span className="text-white font-bold">{euler4D.xw}&deg;</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>&theta;<sub>YW</sub> (Temporal Y):</span>
            <span className="text-white font-bold">{euler4D.yw}&deg;</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>&theta;<sub>ZW</sub> (Temporal Z):</span>
            <span className="text-white font-bold">{euler4D.zw}&deg;</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>&theta;<sub>XZ</sub> (Spatial Yaw):</span>
            <span className="text-cyber-cyan font-bold">{euler4D.xz}&deg;</span>
          </div>
          <div className="pt-1 border-t border-cyber-border/40 text-[10px] text-slate-400">
            Hyper-Volume: <strong>16.0 a<sup>4</sup></strong> | Rank: <strong>SO(4)</strong>
          </div>
        </div>

        {/* Floating Interactive HUD Controls (Top-Right) */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all backdrop-blur-md flex items-center gap-2 ${
              autoRotate
                ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan shadow-[0_0_15px_rgba(0,245,212,0.3)]'
                : 'bg-cyber-surface/80 border-cyber-border text-cyber-muted hover:text-white'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoRotate ? 'bg-cyber-cyan animate-pulse' : 'bg-cyber-muted'}`} />
            {autoRotate ? '4D ROTATION ACTIVE' : 'ROTATION PAUSED'}
          </button>

          <button
            onClick={() => {
              setTemporalWPhase((prev) => (prev + 0.5) % 3.0);
            }}
            className="px-3 py-1.5 rounded-lg border border-cyber-purple/40 bg-cyber-purple/20 text-cyber-purple hover:bg-cyber-purple/30 text-xs font-mono font-bold transition-all backdrop-blur-md flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Warp W-Axis (+0.5)
          </button>
        </div>

        {/* Bottom Spatial Dimension Legend */}
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-cyber-surface/80 border border-cyber-border/60 backdrop-blur-md font-mono text-[11px]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-cyber-cyan">
              <span className="w-2.5 h-2.5 rounded-full bg-cyber-cyan" />
              <span>Inner Core Cell (SquashFS Decryption)</span>
            </span>
            <span className="flex items-center gap-1.5 text-cyber-rose">
              <span className="w-2.5 h-2.5 rounded-full bg-cyber-rose" />
              <span>Outer Manifold (Zero-Day Attack Ingress)</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-cyber-muted">W-Scrubber:</span>
            <input
              type="range"
              min="-1.5"
              max="1.5"
              step="0.05"
              value={temporalWPhase}
              onChange={(e) => setTemporalWPhase(parseFloat(e.target.value))}
              className="w-28 sm:w-36 accent-cyber-cyan cursor-pointer"
            />
            <span className="text-cyber-cyan font-bold w-10 text-right">{temporalWPhase.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
