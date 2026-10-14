'use client';

import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Camera,
  Layers,
  Sparkles,
  Sliders,
  ShieldAlert,
  Cpu,
  Radio,
  Activity,
  Terminal,
  Zap,
  Flame,
  Binary,
  Compass,
  Download,
  Eye,
  CheckCircle2,
  Crosshair
} from 'lucide-react';
import { cyberAudio } from '@/lib/audio';
import { useSentinelStore } from '@/lib/store';

export type CinemaMode =
  | 'SILICON_THERMAL'
  | 'ZERO_DAY_CORRUPTION'
  | 'BUS_LOGIC_ANALYZER'
  | 'EM_SIDE_CHANNEL'
  | 'QUANTUM_LATTICE'
  | 'GLOBAL_BLAST_RADIUS';

interface CinemaModeInfo {
  id: CinemaMode;
  title: string;
  subtitle: string;
  architecture: string;
  cvss: string;
  tags: string[];
  description: string;
  targetAsset: string;
}

const CINEMA_MODES: CinemaModeInfo[] = [
  {
    id: 'SILICON_THERMAL',
    title: 'Silicon Thermal Decapping & Die Profiling',
    subtitle: 'Infrared Microscopic Thermography & Clock Domain Jitter',
    architecture: 'ARM Cortex-A9 Quad-Core (TSMC 28nm)',
    cvss: '9.8 CRITICAL',
    tags: ['PHYSICAL_TAMPER', 'INFRARED_EMISSIVITY', 'THERMAL_THROTTLING', 'BGA_INSPECTION'],
    description:
      'Real-time 4K volumetric thermal profiling of silicon dies under targeted voltage-fault injection. Identifies physical hot-spots, cryptographic coprocessor power leakage, and gate oxide breakdown.',
    targetAsset: 'ASPEED AST2600 BMC / ARM TrustZone'
  },
  {
    id: 'ZERO_DAY_CORRUPTION',
    title: 'Zero-Day Heap Memory Corruption & ROP Chaining',
    subtitle: 'Volumetric Stack Frame Shatter & Arbitrary Instruction Hijack',
    architecture: 'MIPS32 Release 2 (Big-Endian)',
    cvss: '10.0 MAXIMUM',
    tags: ['HEAP_OVERFLOW', 'ROP_GADGET_CHAIN', 'CANARY_BYPASS', 'NX_PIE_DEFEAT'],
    description:
      'Volumetric 3D representation of 32-bit linear address space. Visualizes buffer boundary breaches, stack canary stomping, uncontrolled pointer overwrite, and shellcode return-oriented programming (ROP) execution.',
    targetAsset: 'Kernel Ring-0 / UID 0 System Root Shell'
  },
  {
    id: 'BUS_LOGIC_ANALYZER',
    title: 'High-Speed Hardware Bus & SPI/I2C Signal Extraction',
    subtitle: '3D Oscilloscope Logic Decoding & Voltage Glitch Injection',
    architecture: 'SPI Flash (Quad-IO @ 133 MHz)',
    cvss: '8.4 HIGH',
    tags: ['SPI_EXTRACTION', 'JTAG_DEBUG_BOUNDARY', 'UART_ROOT_SHELL', 'GLITCH_FAULT'],
    description:
      'Multi-channel synchronous hardware logic analyzer rendering high-frequency digital square waves, clock jitter, and instruction bus snooping during boot ROM authentication.',
    targetAsset: 'Macronix MX25L25635F NOR Flash'
  },
  {
    id: 'EM_SIDE_CHANNEL',
    title: 'Electromagnetic (EM) & Side-Channel Cryptanalysis',
    subtitle: 'Near-Field RF Magnetic Radiation & DPA Hamming Weight Spikes',
    architecture: 'Hardware AES-256 Crypto Accelerator',
    cvss: '7.9 HIGH',
    tags: ['DPA_CPA_ATTACK', 'EM_FLUX_RADIANCE', 'CORRELATION_POWER', 'KEY_RECONSTRUCTION'],
    description:
      'Volumetric 3D near-field electromagnetic radiation simulation mapped above cryptographic hardware registers. Tracks Hamming weight leakage during SubBytes S-Box transformations to recover 256-bit AES master keys.',
    targetAsset: 'On-Chip Cryptographic HSM Core'
  },
  {
    id: 'QUANTUM_LATTICE',
    title: 'Post-Quantum Lattice Attack & Hyperspace Deformation',
    subtitle: 'Kyber / Dilithium Shortest Vector Problem (SVP) Perturbation',
    architecture: 'FIPS 203 ML-KEM / ML-DSA Engine',
    cvss: '9.1 CRITICAL',
    tags: ['POST_QUANTUM', 'LATTICE_GEOMETRY', 'ML_KEM_512', 'GROVER_SEARCH'],
    description:
      'Geometric 4D-to-3D projection of high-dimensional lattice vector space. Simulates quantum Grover and Shor perturbations searching for shortest vector anomalies in encrypted IoT firmware updates.',
    targetAsset: 'Quantum-Resistant Firmware Boot Verification'
  },
  {
    id: 'GLOBAL_BLAST_RADIUS',
    title: 'Global Botnet Blast Radius & Lateral Propagation',
    subtitle: 'Multi-Hop Autonomous Exploit Worm Cascade Across 40,000+ Gateways',
    architecture: 'Distributed IoT Grid (MQTT / CoAP / BLE)',
    cvss: '9.9 SEVERE',
    tags: ['LATERAL_SPREAD', 'WORM_PROPAGATION', 'SATELLITE_INTERCEPT', 'CRA_SECTION_14'],
    description:
      '3D interactive planetary threat topology tracing lateral zero-day worm propagation across industrial SCADA telemetry, smart grid energy meters, and medical telemetry networks.',
    targetAsset: 'Critical Infrastructure Substation Fleet'
  }
];

type ResolutionMode = '1080P' | '2K_QHD' | '4K_UHD';

export default function CinemaTheater4K() {
  const { showToast } = useSentinelStore();
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Video Scrubbing & Playback State
  const [activeMode, setActiveMode] = useState<CinemaMode>('SILICON_THERMAL');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(3.8); // 0 to 15 seconds
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const totalDuration = 15.0; // 15 seconds loop

  // Resolution & Rendering Engine State
  const [resolution, setResolution] = useState<ResolutionMode>('4K_UHD');
  const [cameraPreset, setCameraPreset] = useState<'ORBIT' | 'MACRO' | 'TOP' | 'FLYBY'>('ORBIT');
  const [postProcessing, setPostProcessing] = useState({
    bloom: true,
    scanlines: true,
    glitch: false,
    filmGrain: true
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  // Three.js Scene References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Dynamic Scene Objects Ref
  const sceneObjectsRef = useRef<{
    siliconGroup?: THREE.Group;
    thermalParticles?: THREE.Points;
    corruptionGroup?: THREE.Group;
    busGroup?: THREE.Group;
    emGroup?: THREE.Group;
    latticeGroup?: THREE.Group;
    globeGroup?: THREE.Group;
    heatPlanes?: THREE.Mesh[];
  }>({});

  const activeModeDetails = useMemo(() => {
    return CINEMA_MODES.find((m) => m.id === activeMode) || CINEMA_MODES[0];
  }, [activeMode]);

  // Resolution Scale Multipliers
  const pixelRatioMultiplier = useMemo(() => {
    switch (resolution) {
      case '4K_UHD':
        return 2.5; // High supersampling for crisp 4K look
      case '2K_QHD':
        return 1.8;
      case '1080P':
      default:
        return 1.0;
    }
  }, [resolution]);

  // Audio Toggle
  const toggleAudio = useCallback(() => {
    if (!audioEnabled) {
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        // Sub-bass drone + cyber sync oscillator
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(55, ctx.currentTime); // Low A

        // Subtle low-pass filter
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, ctx.currentTime);

        gain.gain.setValueAtTime(0.04, ctx.currentTime);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        oscRef.current = osc;

        setAudioEnabled(true);
        cyberAudio.playSuccess();
        showToast('4K Cyber Spatial Audio Engaged (55Hz Sub-Harmonic)', 'INFO');
      } catch {
        setAudioEnabled(false);
      }
    } else {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setAudioEnabled(false);
      cyberAudio.playBlip();
    }
  }, [audioEnabled, showToast]);

  // Playback Timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.033 * playbackSpeed;
        return next > totalDuration ? 0 : next;
      });
    }, 33);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, totalDuration]);

  // Step 1 Frame
  const stepFrame = (forward: boolean) => {
    setIsPlaying(false);
    cyberAudio.playTick();
    setCurrentTime((prev) => {
      const step = forward ? 0.05 : -0.05;
      const next = prev + step;
      if (next < 0) return 0;
      if (next > totalDuration) return totalDuration;
      return next;
    });
  };

  // 4K Snapshot Capture
  const captureSnapshot = () => {
    const canvas = rendererRef.current?.domElement;
    if (!canvas) return;
    cyberAudio.playLaser();
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `sentinelforge_4k_snapshot_${activeMode}_${Date.now()}.png`;
      a.click();
      showToast('4K Frame Captured & Exported (Ultra-HD PNG)', 'SUCCESS');
    } catch {
      showToast('Frame export failed due to security context', 'ALERT');
    }
  };

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!mountRef.current) return;
    if (!document.fullscreenElement) {
      mountRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Initialize Three.js 4K WebGL Canvas
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 1280;
    const height = container.clientHeight || 720;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06090e, 0.025);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 4.5, 12);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer with high-precision 4K buffer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio * pixelRatioMultiplier, 3));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    rendererRef.current = renderer;
    canvasRef.current = renderer.domElement;
    container.appendChild(renderer.domElement);

    // 4. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const cyanSpot = new THREE.SpotLight(0x00f5d4, 5, 40, Math.PI / 4, 0.3);
    cyanSpot.position.set(10, 15, 10);
    scene.add(cyanSpot);

    const purpleSpot = new THREE.SpotLight(0xa855f7, 4.5, 40, Math.PI / 4, 0.3);
    purpleSpot.position.set(-10, -5, -8);
    scene.add(purpleSpot);

    const crimsonAccent = new THREE.PointLight(0xff3366, 3.5, 25);
    crimsonAccent.position.set(0, 3, 2);
    scene.add(crimsonAccent);

    // 5. Procedural 3D Environment: Holographic Floor Grid
    const floorGrid = new THREE.GridHelper(30, 40, 0x00f5d4, 0x182436);
    floorGrid.position.y = -2.5;
    scene.add(floorGrid);

    // 6. Build Mode-Specific Geometries
    const objs = sceneObjectsRef.current;

    // -------------------------------------------------------------------------
    // SCENE 1: SILICON THERMAL & BGA DIE
    // -------------------------------------------------------------------------
    const siliconGroup = new THREE.Group();
    scene.add(siliconGroup);
    objs.siliconGroup = siliconGroup;

    // Substrate PCB
    const pcbGeo = new THREE.BoxGeometry(7, 0.25, 7);
    const pcbMat = new THREE.MeshStandardMaterial({
      color: 0x08131e,
      roughness: 0.2,
      metalness: 0.85
    });
    const pcbMesh = new THREE.Mesh(pcbGeo, pcbMat);
    pcbMesh.position.y = -0.15;
    siliconGroup.add(pcbMesh);

    // Central Silicon Die
    const dieGeo = new THREE.BoxGeometry(4.2, 0.3, 4.2);
    const dieMat = new THREE.MeshStandardMaterial({
      color: 0x111e2e,
      metalness: 0.95,
      roughness: 0.1
    });
    const dieMesh = new THREE.Mesh(dieGeo, dieMat);
    dieMesh.position.y = 0.12;
    siliconGroup.add(dieMesh);

    // Thermal Heat Conduction Planes
    const heatPlanes: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const hGeo = new THREE.PlaneGeometry(1.6, 1.6);
      const hMat = new THREE.MeshBasicMaterial({
        color: i === 0 ? 0xff3366 : i === 1 ? 0xffaa00 : 0x00f5d4,
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide
      });
      const hMesh = new THREE.Mesh(hGeo, hMat);
      hMesh.rotation.x = -Math.PI / 2;
      hMesh.position.set((i % 2 === 0 ? 1 : -1) * 1.1, 0.28, (i < 2 ? 1 : -1) * 1.1);
      siliconGroup.add(hMesh);
      heatPlanes.push(hMesh);
    }
    objs.heatPlanes = heatPlanes;

    // Microscopic BGA Solder Balls
    const bgaGroup = new THREE.Group();
    const sphereGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x00f5d4,
      metalness: 0.95,
      roughness: 0.05
    });
    for (let x = -3.2; x <= 3.2; x += 0.4) {
      for (let z = -3.2; z <= 3.2; z += 0.4) {
        if (Math.abs(x) > 2.0 || Math.abs(z) > 2.0) {
          const ball = new THREE.Mesh(sphereGeo, sphereMat);
          ball.position.set(x, -0.35, z);
          bgaGroup.add(ball);
        }
      }
    }
    siliconGroup.add(bgaGroup);

    // Thermal Particle Heat Cloud
    const particleCount = 2000;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 5;
      particlePositions[i * 3 + 1] = Math.random() * 4;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 5;

      // Color from cyan to orange to red
      const t = Math.random();
      if (t > 0.6) {
        particleColors[i * 3] = 1.0;
        particleColors[i * 3 + 1] = 0.2;
        particleColors[i * 3 + 2] = 0.3;
      } else if (t > 0.3) {
        particleColors[i * 3] = 1.0;
        particleColors[i * 3 + 1] = 0.7;
        particleColors[i * 3 + 2] = 0.0;
      } else {
        particleColors[i * 3] = 0.0;
        particleColors[i * 3 + 1] = 0.96;
        particleColors[i * 3 + 2] = 0.83;
      }
    }
    const partGeo = new THREE.BufferGeometry();
    partGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    partGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    const partMat = new THREE.PointsMaterial({
      size: 0.07,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const thermalParticles = new THREE.Points(partGeo, partMat);
    siliconGroup.add(thermalParticles);
    objs.thermalParticles = thermalParticles;

    // -------------------------------------------------------------------------
    // SCENE 2: ZERO-DAY HEAP CORRUPTION & ROP CHUNKS
    // -------------------------------------------------------------------------
    const corruptionGroup = new THREE.Group();
    corruptionGroup.visible = false;
    scene.add(corruptionGroup);
    objs.corruptionGroup = corruptionGroup;

    // Volumetric 3D Memory Block Matrix (Stack vs Heap)
    const memBoxes: THREE.Mesh[] = [];
    for (let y = 0; y < 6; y++) {
      for (let x = -2; x <= 2; x++) {
        for (let z = -2; z <= 2; z++) {
          const bGeo = new THREE.BoxGeometry(0.7, 0.45, 0.7);
          const isCorrupted = y >= 3 && Math.abs(x) <= 1;
          const bMat = new THREE.MeshStandardMaterial({
            color: isCorrupted ? 0xff3366 : 0x00f5d4,
            wireframe: false,
            metalness: 0.8,
            roughness: 0.2,
            transparent: true,
            opacity: 0.85
          });
          const box = new THREE.Mesh(bGeo, bMat);
          box.position.set(x * 0.9, y * 0.65 - 1.0, z * 0.9);
          corruptionGroup.add(box);
          memBoxes.push(box);
        }
      }
    }

    // Laser ROP Execution Beams
    const ropCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.8, -1.0, -1.8),
      new THREE.Vector3(0, 0.5, 0),
      new THREE.Vector3(1.5, 1.8, -0.5),
      new THREE.Vector3(0, 2.8, 1.8)
    ]);
    const ropGeo = new THREE.TubeGeometry(ropCurve, 64, 0.08, 8, false);
    const ropMat = new THREE.MeshBasicMaterial({ color: 0xff3366, wireframe: true });
    const ropMesh = new THREE.Mesh(ropGeo, ropMat);
    corruptionGroup.add(ropMesh);

    // -------------------------------------------------------------------------
    // SCENE 3: BUS LOGIC ANALYZER & OSCILLOSCOPE
    // -------------------------------------------------------------------------
    const busGroup = new THREE.Group();
    busGroup.visible = false;
    scene.add(busGroup);
    objs.busGroup = busGroup;

    // Digital Square Wave Traces (4 Channels: CLK, MOSI, MISO, CS)
    for (let ch = 0; ch < 4; ch++) {
      const wavePoints: THREE.Vector3[] = [];
      const chY = ch * 1.2 - 1.8;
      let state = 0;
      for (let x = -6; x <= 6; x += 0.2) {
        if (Math.sin(x * 3 + ch) > 0.1) state = 0.5;
        else state = 0;
        wavePoints.push(new THREE.Vector3(x, chY + state, 0));
      }
      const wGeo = new THREE.BufferGeometry().setFromPoints(wavePoints);
      const wMat = new THREE.LineBasicMaterial({
        color: ch === 0 ? 0x00f5d4 : ch === 1 ? 0xffaa00 : ch === 2 ? 0xa855f7 : 0xff3366,
        linewidth: 2
      });
      const line = new THREE.Line(wGeo, wMat);
      busGroup.add(line);
    }

    // -------------------------------------------------------------------------
    // SCENE 4: ELECTROMAGNETIC (EM) SIDE CHANNEL
    // -------------------------------------------------------------------------
    const emGroup = new THREE.Group();
    emGroup.visible = false;
    scene.add(emGroup);
    objs.emGroup = emGroup;

    // Concentric Magnetic Torus Flux Rings
    for (let r = 1.0; r <= 5.0; r += 0.7) {
      const torusGeo = new THREE.TorusGeometry(r, 0.04, 12, 48);
      const torusMat = new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        transparent: true,
        opacity: 0.65 - r * 0.1
      });
      const torus = new THREE.Mesh(torusGeo, torusMat);
      torus.rotation.x = Math.PI / 2;
      torus.position.y = 0.2;
      emGroup.add(torus);
    }

    // -------------------------------------------------------------------------
    // SCENE 5: POST-QUANTUM LATTICE GEOMETRY
    // -------------------------------------------------------------------------
    const latticeGroup = new THREE.Group();
    latticeGroup.visible = false;
    scene.add(latticeGroup);
    objs.latticeGroup = latticeGroup;

    const latticeNodes: THREE.Mesh[] = [];
    const lNodeGeo = new THREE.IcosahedronGeometry(0.12, 1);
    const lNodeMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      metalness: 0.9,
      roughness: 0.1
    });
    for (let x = -2; x <= 2; x++) {
      for (let y = -2; y <= 2; y++) {
        for (let z = -2; z <= 2; z++) {
          const node = new THREE.Mesh(lNodeGeo, lNodeMat);
          node.position.set(x * 1.2, y * 1.2, z * 1.2);
          latticeGroup.add(node);
          latticeNodes.push(node);
        }
      }
    }

    // -------------------------------------------------------------------------
    // SCENE 6: GLOBAL THREAT BLAST RADIUS GLOBE
    // -------------------------------------------------------------------------
    const globeGroup = new THREE.Group();
    globeGroup.visible = false;
    scene.add(globeGroup);
    objs.globeGroup = globeGroup;

    const earthGeo = new THREE.SphereGeometry(3.2, 32, 32);
    const earthMat = new THREE.MeshStandardMaterial({
      color: 0x0b1523,
      wireframe: true,
      roughness: 0.6
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earth);

    // Orbital Satellite Attack Arcs
    for (let a = 0; a < 6; a++) {
      const arcGeo = new THREE.TorusGeometry(3.8 + a * 0.3, 0.03, 8, 64);
      const arcMat = new THREE.MeshBasicMaterial({
        color: a % 2 === 0 ? 0xff3366 : 0x00f5d4,
        transparent: true,
        opacity: 0.5
      });
      const arc = new THREE.Mesh(arcGeo, arcMat);
      arc.rotation.x = Math.PI / 3 + a * 0.3;
      arc.rotation.y = a * 0.4;
      globeGroup.add(arc);
    }

    // 7. Render Loop
    let frame = 0;
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      frame++;

      const p = currentTime / totalDuration; // 0 to 1
      const timeAngle = p * Math.PI * 2;

      // Rotate Floor Grid slowly
      floorGrid.rotation.y = frame * 0.001;

      // Active Mode Animations
      if (activeMode === 'SILICON_THERMAL' && objs.siliconGroup) {
        objs.siliconGroup.rotation.y = timeAngle;
        if (objs.heatPlanes) {
          objs.heatPlanes.forEach((hp, idx) => {
            const scale = 1 + Math.sin(frame * 0.08 + idx) * 0.2;
            hp.scale.set(scale, scale, 1);
          });
        }
        if (objs.thermalParticles) {
          objs.thermalParticles.rotation.y = frame * 0.005;
        }
      } else if (activeMode === 'ZERO_DAY_CORRUPTION' && objs.corruptionGroup) {
        objs.corruptionGroup.rotation.y = timeAngle * 0.8;
        objs.corruptionGroup.rotation.x = Math.sin(frame * 0.02) * 0.15;
      } else if (activeMode === 'BUS_LOGIC_ANALYZER' && objs.busGroup) {
        objs.busGroup.position.x = -Math.sin(timeAngle) * 0.8;
      } else if (activeMode === 'EM_SIDE_CHANNEL' && objs.emGroup) {
        objs.emGroup.rotation.z = frame * 0.015;
        objs.emGroup.children.forEach((child, i) => {
          const tScale = 1.0 + Math.sin(frame * 0.1 + i) * 0.08;
          child.scale.set(tScale, tScale, tScale);
        });
      } else if (activeMode === 'QUANTUM_LATTICE' && objs.latticeGroup) {
        objs.latticeGroup.rotation.y = timeAngle;
        objs.latticeGroup.rotation.z = Math.sin(timeAngle) * 0.5;
      } else if (activeMode === 'GLOBAL_BLAST_RADIUS' && objs.globeGroup) {
        objs.globeGroup.rotation.y = frame * 0.006;
      }

      // Camera preset animation
      if (cameraPreset === 'ORBIT') {
        camera.position.x = Math.sin(frame * 0.005) * 12;
        camera.position.z = Math.cos(frame * 0.005) * 12;
        camera.position.y = 4.5 + Math.sin(frame * 0.004) * 1.5;
        camera.lookAt(0, 0, 0);
      } else if (cameraPreset === 'MACRO') {
        camera.position.set(0, 2.2, 5.2);
        camera.lookAt(0, 0.5, 0);
      } else if (cameraPreset === 'TOP') {
        camera.position.set(0, 14, 0.01);
        camera.lookAt(0, 0, 0);
      } else if (cameraPreset === 'FLYBY') {
        camera.position.x = Math.sin(frame * 0.01) * 8;
        camera.position.y = 2.5 + Math.cos(frame * 0.01) * 2;
        camera.position.z = Math.cos(frame * 0.01) * 8;
        camera.lookAt(0, 0.5, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Window Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current && rendererRef.current.domElement) {
        container.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
    };
  }, [pixelRatioMultiplier, cameraPreset]);

  // Mode Switch Visibility Updater
  useEffect(() => {
    const objs = sceneObjectsRef.current;
    if (!objs) return;

    if (objs.siliconGroup) objs.siliconGroup.visible = activeMode === 'SILICON_THERMAL';
    if (objs.corruptionGroup) objs.corruptionGroup.visible = activeMode === 'ZERO_DAY_CORRUPTION';
    if (objs.busGroup) objs.busGroup.visible = activeMode === 'BUS_LOGIC_ANALYZER';
    if (objs.emGroup) objs.emGroup.visible = activeMode === 'EM_SIDE_CHANNEL';
    if (objs.latticeGroup) objs.latticeGroup.visible = activeMode === 'QUANTUM_LATTICE';
    if (objs.globeGroup) objs.globeGroup.visible = activeMode === 'GLOBAL_BLAST_RADIUS';
  }, [activeMode]);

  return (
    <div
      ref={mountRef}
      className={`relative w-full rounded-2xl overflow-hidden bg-void-950 border border-zinc-800 shadow-2xl flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'min-h-[750px] lg:min-h-[850px]'
      }`}
    >
      {/* 1. TOP 4K CINEMA HUD HEADER BAR */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 sm:px-6 py-3.5 bg-gradient-to-b from-void-950/95 via-void-950/80 to-transparent flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/40 backdrop-blur-md">
        {/* Left: Mode Title & Real-time Indicator */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan shadow-[0_0_15px_rgba(0,240,255,0.25)]">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-sm sm:text-base text-white tracking-wide">
                {activeModeDetails.title}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neon-crimson/15 text-neon-crimson border border-neon-crimson/30">
                {activeModeDetails.cvss}
              </span>
            </div>
            <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-2">
              <span>ARCH: {activeModeDetails.architecture}</span>
              <span className="text-zinc-600">&bull;</span>
              <span className="text-neon-cyan truncate max-w-[280px]">
                TARGET: {activeModeDetails.targetAsset}
              </span>
            </div>
          </div>
        </div>

        {/* Right: 4K Resolution & Camera Preset Controls */}
        <div className="flex items-center gap-2 font-mono text-xs">
          {/* Resolution Badge Switcher */}
          <div className="flex items-center bg-void-900/90 border border-zinc-700/60 rounded-lg p-0.5">
            {(['1080P', '2K_QHD', '4K_UHD'] as ResolutionMode[]).map((res) => (
              <button
                key={res}
                onClick={() => {
                  setResolution(res);
                  cyberAudio.playTick();
                  showToast(`Visual Engine set to ${res}`, 'INFO');
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                  resolution === res
                    ? 'bg-neon-cyan text-void-950 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {res === '4K_UHD' ? '4K ULTRA' : res}
              </button>
            ))}
          </div>

          {/* Camera Angles */}
          <div className="hidden md:flex items-center bg-void-900/90 border border-zinc-700/60 rounded-lg p-0.5">
            {[
              { id: 'ORBIT', label: 'Orbital' },
              { id: 'MACRO', label: 'Macro Die' },
              { id: 'TOP', label: 'Top-Down' },
              { id: 'FLYBY', label: 'Fly-By' }
            ].map((cam) => (
              <button
                key={cam.id}
                onClick={() => {
                  setCameraPreset(cam.id as any);
                  cyberAudio.playBlip();
                }}
                className={`px-2 py-1 rounded text-[10px] uppercase font-bold transition-all ${
                  cameraPreset === cam.id
                    ? 'bg-neon-purple text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {cam.label}
              </button>
            ))}
          </div>

          {/* Audio Synthesizer Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-2 rounded-lg border transition-all ${
              audioEnabled
                ? 'bg-neon-cyan/15 border-neon-cyan/50 text-neon-cyan shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : 'bg-void-900/90 border-zinc-700/60 text-zinc-400 hover:text-white'
            }`}
            title="Toggle 4K Spatial Audio Synth"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Snapshot Export */}
          <button
            onClick={captureSnapshot}
            className="p-2 rounded-lg bg-void-900/90 border border-zinc-700/60 text-zinc-300 hover:text-neon-cyan hover:border-neon-cyan/40 transition-all"
            title="Export 4K Frame PNG"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-void-900/90 border border-zinc-700/60 text-zinc-300 hover:text-white transition-all"
            title="Toggle Fullscreen Cinema"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. LATERAL SIMULATION SELECTOR RAIL (LEFT OVERLAY) */}
      <div className="absolute top-20 left-4 z-20 flex flex-col gap-2 max-w-[240px] pointer-events-auto">
        <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase px-1">
          4K Video Sequences
        </span>
        {CINEMA_MODES.map((mode) => {
          const active = mode.id === activeMode;
          return (
            <button
              key={mode.id}
              onClick={() => {
                setActiveMode(mode.id);
                cyberAudio.playTick();
              }}
              className={`p-2.5 rounded-xl border text-left transition-all backdrop-blur-md ${
                active
                  ? 'bg-void-900/90 border-neon-cyan shadow-[0_0_20px_rgba(0,240,255,0.25)] text-white'
                  : 'bg-void-900/40 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-void-900/70'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold font-heading mb-0.5">
                <span>{mode.title.split('&')[0]}</span>
                {active && <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-ping" />}
              </div>
              <div className="text-[10px] font-mono text-zinc-500 line-clamp-1">
                {mode.subtitle}
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. POST-PROCESSING OVERLAY SHADERS */}
      {postProcessing.scanlines && (
        <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-40" />
      )}
      {postProcessing.filmGrain && (
        <div className="absolute inset-0 pointer-events-none z-10 bg-grain opacity-25" />
      )}

      {/* 4. REAL-TIME TELEMETRY WATERMARK OVERLAY (RIGHT) */}
      <div className="absolute top-20 right-4 z-20 pointer-events-none flex flex-col items-end gap-1 font-mono text-[11px] text-zinc-400 backdrop-blur-md p-3 rounded-xl bg-void-950/60 border border-zinc-800/50">
        <div className="flex items-center gap-1.5 text-neon-cyan font-bold">
          <Activity className="w-3.5 h-3.5 animate-spin" />
          <span>60.0 FPS &bull; REAL-TIME SHADER</span>
        </div>
        <div className="text-zinc-500">RES: {resolution === '4K_UHD' ? '3840 x 2160 (4K UHD)' : resolution}</div>
        <div className="text-zinc-500">BUFFER: 32-BIT HDR ACES</div>
        <div className="text-zinc-500">GPU TIME: 1.42 ms/frame</div>
        <div className="flex flex-wrap gap-1 mt-1 justify-end">
          {activeModeDetails.tags.map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 rounded bg-zinc-800/60 text-[9px] text-zinc-300 font-mono"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 5. BOTTOM 4K VIDEO SCRUBBER & TIMELINE CONTROLS */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-4 sm:px-6 py-4 bg-gradient-to-t from-void-950 via-void-950/90 to-transparent flex flex-col gap-2 border-t border-zinc-800/50 backdrop-blur-xl">
        {/* Timeline Scrubber Bar with Milliseconds */}
        <div className="flex items-center gap-3 w-full">
          <span className="font-mono text-xs text-neon-cyan font-bold w-16">
            00:{currentTime.toFixed(2).padStart(5, '0')}
          </span>

          <div className="relative flex-1 group py-2 cursor-pointer">
            <input
              type="range"
              min="0"
              max={totalDuration}
              step="0.01"
              value={currentTime}
              onChange={(e) => {
                setCurrentTime(parseFloat(e.target.value));
              }}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-neon-cyan"
            />
          </div>

          <span className="font-mono text-xs text-zinc-500 w-16 text-right">
            00:{totalDuration.toFixed(2)}
          </span>
        </div>

        {/* Playback Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Step Back 1 Frame */}
            <button
              onClick={() => stepFrame(false)}
              className="p-2 rounded-lg bg-void-900 border border-zinc-700/60 text-zinc-400 hover:text-white transition-all"
              title="Step Back 1 Frame (0.05s)"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play / Pause Primary Button */}
            <button
              onClick={() => {
                setIsPlaying(!isPlaying);
                cyberAudio.playTick();
              }}
              className="px-4 py-2 rounded-lg bg-neon-cyan text-void-950 font-bold font-mono text-xs flex items-center gap-2 hover:bg-neon-cyan/90 transition-all shadow-[0_0_18px_rgba(0,240,255,0.4)]"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-void-950" />
                  <span>PAUSE</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-void-950" />
                  <span>PLAY</span>
                </>
              )}
            </button>

            {/* Step Forward 1 Frame */}
            <button
              onClick={() => stepFrame(true)}
              className="p-2 rounded-lg bg-void-900 border border-zinc-700/60 text-zinc-400 hover:text-white transition-all"
              title="Step Forward 1 Frame (0.05s)"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Reset Loop */}
            <button
              onClick={() => {
                setCurrentTime(0);
                cyberAudio.playTick();
              }}
              className="p-2 rounded-lg bg-void-900 border border-zinc-700/60 text-zinc-400 hover:text-white transition-all"
              title="Rewind to 00:00.00"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Speed Selector (0.25x, 0.5x, 1x, 2x, 4x) */}
          <div className="flex items-center gap-1 bg-void-900/80 border border-zinc-700/60 rounded-lg p-0.5 font-mono text-xs">
            {[0.25, 0.5, 1.0, 2.0, 4.0].map((spd) => (
              <button
                key={spd}
                onClick={() => {
                  setPlaybackSpeed(spd);
                  cyberAudio.playTick();
                }}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                  playbackSpeed === spd
                    ? 'bg-zinc-700 text-neon-cyan'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* FX Shaders Toggles */}
          <div className="hidden sm:flex items-center gap-2 font-mono text-xs">
            <button
              onClick={() =>
                setPostProcessing((p) => ({ ...p, scanlines: !p.scanlines }))
              }
              className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-all ${
                postProcessing.scanlines
                  ? 'bg-neon-cyan/15 text-neon-cyan border-neon-cyan/40'
                  : 'bg-void-900 text-zinc-500 border-zinc-800'
              }`}
            >
              CRT SCANLINES
            </button>
            <button
              onClick={() =>
                setPostProcessing((p) => ({ ...p, bloom: !p.bloom }))
              }
              className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-all ${
                postProcessing.bloom
                  ? 'bg-neon-purple/20 text-neon-purple border-neon-purple/40'
                  : 'bg-void-900 text-zinc-500 border-zinc-800'
              }`}
            >
              BLOOM OVERDRIVE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
