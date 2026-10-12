'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import Link from 'next/link';
import ThreatRadarGlobe from '@/components/3d/ThreatRadarGlobe';
import { cyberAudio } from '@/lib/audio';

interface GDBStep {
  step: number;
  pc: string;
  instruction: string;
  description: string;
  registers: Record<string, string>;
  memoryHex: string;
  isCrash?: boolean;
}

const GDB_TRACE_STEPS: GDBStep[] = [
  {
    step: 1,
    pc: '0x00014a70',
    instruction: 'push {r4, r5, lr}',
    description: 'Function prologue: save link register and callee-saved registers to stack frame.',
    registers: {
      r0: '0x00000001',
      r1: '0x7efff844',
      r2: '0x00000400',
      r3: '0x00028014',
      pc: '0x00014a70',
      lr: '0x000149f0',
      sp: '0x7efff850'
    },
    memoryHex: '0x7efff840: 00 00 00 00  00 00 00 00  f0 49 01 00  14 80 02 00\n0x7efff850: 01 00 00 00  44 f8 ff 7e  00 04 00 00  00 00 00 00'
  },
  {
    step: 2,
    pc: '0x00014a78',
    instruction: 'ldr  r2, [sp, #16]',
    description: 'Load user-supplied packet length header into $r2 (unchecked length = 1024 bytes).',
    registers: {
      r0: '0x00000001',
      r1: '0x7efff844',
      r2: '0x00000400',
      r3: '0x00028014',
      pc: '0x00014a78',
      lr: '0x000149f0',
      sp: '0x7efff844'
    },
    memoryHex: '0x7efff840: 00 00 00 00  41 41 41 41  41 41 41 41  41 41 41 41\n0x7efff850: 41 41 41 41  41 41 41 41  41 41 41 41  41 41 41 41'
  },
  {
    step: 3,
    pc: '0x00014a80',
    instruction: 'bl   0x10b40 <memcpy@plt>',
    description: 'Call memcpy() with unchecked count: 1024 bytes copied into 256-byte stack array.',
    registers: {
      r0: '0x7efff840',
      r1: '0x00030100',
      r2: '0x00000400',
      r3: '0x00000000',
      pc: '0x00014a80',
      lr: '0x00014a84',
      sp: '0x7efff840'
    },
    memoryHex: '0x7efff840: 41 41 41 41  41 41 41 41  41 41 41 41  41 41 41 41\n0x7efff850: 41 41 41 41  41 41 41 41  41 41 41 41  41 41 41 41'
  },
  {
    step: 4,
    pc: '0x00014a84',
    instruction: 'ldr  r3, [sp, #24]',
    description: 'Restore frame pointer from stack: corrupted by overflow payload to 0x41414141.',
    registers: {
      r0: '0x00000001',
      r1: '0x7efff844',
      r2: '0x00000400',
      r3: '0x41414141',
      pc: '0x00014a84',
      lr: '0x00014a88',
      sp: '0x7efff840'
    },
    memoryHex: '0x7efff840: 41 41 41 41  41 41 41 41  41 41 41 41  41 41 41 41\n0x7efff850: 41 41 41 41  41 41 41 41  41 41 41 41  41 41 41 41'
  },
  {
    step: 5,
    pc: '0x00014a88',
    instruction: 'ldr  r3, [r3, #0]',
    description: 'CRASH: Memory Dereference of unmapped address [0x41414141] -> SIGSEGV generated.',
    registers: {
      r0: '0x00000001',
      r1: '0x7efff844',
      r2: '0x00000400',
      r3: '0x41414141',
      pc: '0x00014a88',
      lr: '0x41414141',
      sp: '0x7efff840'
    },
    memoryHex: '0x7efff840: 41 41 41 41  41 41 41 41  41 41 41 41  41 41 41 41\n0x7efff850: 41 41 41 41  41 41 41 41  41 41 41 41  41 41 41 41',
    isCrash: true
  }
];

interface ThreatNodeInfo {
  id: string;
  name: string;
  stage: string;
  cvss: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  vector: string;
  busOrProtocol: string;
  impact: string;
  mitigation: string;
}

const THREAT_NODES: Record<string, ThreatNodeInfo> = {
  node_ble: {
    id: 'node_ble',
    name: 'GATT BLE / HTTP Ingress Service',
    stage: 'Hop #1: Initial Ingress',
    cvss: 7.5,
    severity: 'HIGH',
    vector: 'Wireless GATT Broadcast / Mini-HTTP Port 80',
    busOrProtocol: 'BLE 5.3 Radio / TCP Port 80',
    impact: 'Unauthenticated packets accepted directly into userland network service daemon without prior crypto handshake.',
    mitigation: 'Deploy eBPF Ingress Filter to drop malformed MTU advertisements exceeding 512 bytes.'
  },
  node_overflow: {
    id: 'node_overflow',
    name: 'CVE-2026-8812 Heap Buffer Overflow',
    stage: 'Hop #2: Vulnerability Exploitation',
    cvss: 9.8,
    severity: 'CRITICAL',
    vector: 'Corrupted Packet Length Header (1024 > 256)',
    busOrProtocol: 'In-Memory memcpy() Dereference',
    impact: 'Overwrites adjacent chunk metadata and saved Link Register ($lr=0x41414141), granting unconstrained arbitrary code execution.',
    mitigation: 'Synthesize SafeClib bounds check wrapper via PatchStudio.'
  },
  node_root: {
    id: 'node_root',
    name: 'UID 0 Root Shell Privilege Escalation',
    stage: 'Hop #3: Privilege Escalation',
    cvss: 8.8,
    severity: 'HIGH',
    vector: 'Escalation via setuid() / nvram_daemon helper',
    busOrProtocol: 'UNIX Domain Socket (/var/run/nvram.sock)',
    impact: 'Process escapes unprivileged sandbox, obtaining full root permissions and raw peripheral hardware device access.',
    mitigation: 'Enforce AppArmor MAC profile and seccomp syscall whitelist denying open(/dev/spidev*).'
  },
  node_spi: {
    id: 'node_spi',
    name: '/dev/spidev0.0 Kernel SPI Bus Driver',
    stage: 'Hop #4: Lateral Hardware Movement',
    cvss: 8.4,
    severity: 'HIGH',
    vector: 'Direct IOCTL SPI Flash Master Access',
    busOrProtocol: 'Hardware SPI Bus (104 MHz Quad-I/O)',
    impact: 'Direct flash write IOCTL commands issued directly to external microcontroller and BMC supervisor chip.',
    mitigation: 'Lock SPI write-protect pin (WP# pulled low in hardware) and seal flash write-enable bit in bootloader.'
  },
  node_bmc: {
    id: 'node_bmc',
    name: 'ASPEED AST2600 BMC Flash Die',
    stage: 'Hop #5: Target Hardware Persistence Asset',
    cvss: 10.0,
    severity: 'CRITICAL',
    vector: 'Permanent Out-of-Band Firmware Implantation',
    busOrProtocol: 'Dedicated Management Bus & SPI NOR',
    impact: 'Root-of-Trust obliterated. Malicious payload survives OS reinstallation, factory wipes, and software updates.',
    mitigation: 'Deploy cryptographic attestation verification and secure hardware root of trust (DICE / RoT).'
  }
};

export default function WarRoomPage() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [currentGdbIndex, setCurrentGdbIndex] = useState<number>(4);
  const [isPlayingGdb, setIsPlayingGdb] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'3D_THREAT_CANVAS' | 'GDB_STEPPER' | 'PLAYBOOKS' | 'TEAM_ANNOTATIONS'>('3D_THREAT_CANVAS');
  const [spatialMode, setSpatialMode] = useState<'KILL_CHAIN' | 'GLOBAL_RADAR'>('KILL_CHAIN');
  const [selectedThreatNodeId, setSelectedThreatNodeId] = useState<string>('node_bmc');
  const [shockwaveBurstTime, setShockwaveBurstTime] = useState<number>(0);
  const [showForensicsPanel, setShowForensicsPanel] = useState<boolean>(true);
  const [isAutoOrbit, setIsAutoOrbit] = useState<boolean>(true);
  const [isShockwavesActive, setIsShockwavesActive] = useState<boolean>(true);

  const isAutoOrbitRef = useRef(isAutoOrbit);
  const isShockwavesActiveRef = useRef(isShockwavesActive);

  useEffect(() => {
    isAutoOrbitRef.current = isAutoOrbit;
  }, [isAutoOrbit]);

  useEffect(() => {
    isShockwavesActiveRef.current = isShockwavesActive;
  }, [isShockwavesActive]);
  
  // Playbook execution states
  const [playbookStates, setPlaybookStates] = useState<Record<string, 'IDLE' | 'EXECUTING' | 'DEPLOYED'>>({
    pb1: 'IDLE',
    pb2: 'IDLE',
    pb3: 'IDLE'
  });
  const [playbookLogs, setPlaybookLogs] = useState<string[]>([
    '[12:44:02] Incident War-Room initialized for Target Firmware AX9000-v1.0.4',
    '[12:44:03] Multi-Hop Kill Chain verified: Port 80 -> CVE-2026-8812 -> root -> /dev/spidev0.0 -> BMC Flash',
    '[12:44:05] Blast Radius assessment: 4,800 edge units across industrial SCADA subnet'
  ]);

  // Automated GDB step player
  useEffect(() => {
    let timer: any;
    if (isPlayingGdb) {
      timer = setInterval(() => {
        setCurrentGdbIndex((prev) => (prev >= GDB_TRACE_STEPS.length - 1 ? 0 : prev + 1));
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isPlayingGdb]);

  // 3D Volumetric Threat Kill-Chain & Shockwave Canvas (Three.js WebGL)
  useEffect(() => {
    if (!canvasRef.current || activeTab !== '3D_THREAT_CANVAS' || spatialMode !== 'KILL_CHAIN') return;
    const container = canvasRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06090e, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 11, 18);
    camera.lookAt(0, 1.5, 0);

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

    // Lights
    const ambient = new THREE.AmbientLight(0x38bdf8, 1.2);
    scene.add(ambient);

    const lightCyan = new THREE.PointLight(0x00f5d4, 4.5, 40);
    lightCyan.position.set(-8, 9, 6);
    scene.add(lightCyan);

    const lightRose = new THREE.PointLight(0xff3366, 4.5, 40);
    lightRose.position.set(8, 9, 6);
    scene.add(lightRose);

    const group = new THREE.Group();
    scene.add(group);

    // 1. Grid plane
    const grid = new THREE.GridHelper(34, 34, 0x00f5d4, 0x132235);
    grid.position.y = -1.5;
    scene.add(grid);

    // 2. Kill Chain 5 Key Nodes Positions (Symmetrically balanced around center)
    const nodeCoords: Record<string, { pos: THREE.Vector3; color: number; geo: THREE.BufferGeometry }> = {
      node_ble: {
        pos: new THREE.Vector3(-6.0, 0.9, 0.8),
        color: 0x00f5d4,
        geo: new THREE.CylinderGeometry(0.7, 0.7, 0.8, 16)
      },
      node_overflow: {
        pos: new THREE.Vector3(-3.0, 2.3, -0.6),
        color: 0xf59e0b,
        geo: new THREE.OctahedronGeometry(0.9, 0)
      },
      node_root: {
        pos: new THREE.Vector3(0.0, 3.4, 0.8),
        color: 0xa855f7,
        geo: new THREE.DodecahedronGeometry(1.0, 0)
      },
      node_spi: {
        pos: new THREE.Vector3(3.0, 2.3, -0.6),
        color: 0x38bdf8,
        geo: new THREE.BoxGeometry(1.2, 1.2, 1.2)
      },
      node_bmc: {
        pos: new THREE.Vector3(6.0, 1.6, 0.8),
        color: 0xff3366,
        geo: new THREE.IcosahedronGeometry(1.3, 0)
      }
    };

    const nodeMeshes: Record<string, THREE.Mesh> = {};
    const haloMeshes: Record<string, THREE.Mesh> = {};

    Object.entries(nodeCoords).forEach(([id, cfg]) => {
      const mat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        emissive: cfg.color,
        emissiveIntensity: 0.45,
        wireframe: true
      });
      const mesh = new THREE.Mesh(cfg.geo, mat);
      mesh.position.copy(cfg.pos);
      mesh.userData = { nodeId: id };
      group.add(mesh);
      nodeMeshes[id] = mesh;

      // Outer Pulsing Glow Halo
      const haloGeo = new THREE.RingGeometry(1.4, 1.55, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: id === selectedThreatNodeId ? 0.9 : 0.35
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.rotation.x = Math.PI / 2;
      halo.position.copy(cfg.pos);
      halo.position.y -= 0.6;
      group.add(halo);
      haloMeshes[id] = halo;
    });

    // 3. Kill-Chain Spline Curve & Laser Energy Tube
    const killChainPoints = [
      nodeCoords.node_ble.pos,
      nodeCoords.node_overflow.pos,
      nodeCoords.node_root.pos,
      nodeCoords.node_spi.pos,
      nodeCoords.node_bmc.pos
    ];
    const curve = new THREE.CatmullRomCurve3(killChainPoints);

    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.08, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: 0xff3366,
      transparent: true,
      opacity: 0.6
    });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    group.add(tube);

    // 4. Traveling High-Speed Laser Photon Particles along Kill Chain
    const photonCount = 28;
    const photonGeo = new THREE.SphereGeometry(0.13, 8, 8);
    const photons: THREE.Mesh[] = [];
    for (let i = 0; i < photonCount; i++) {
      const photonMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xff3366 : 0x00f5d4
      });
      const photon = new THREE.Mesh(photonGeo, photonMat);
      group.add(photon);
      photons.push(photon);
    }

    // 5. Volumetric Threat Blast Pillar & Concentric Shockwaves at BMC Epicenter
    const shockwaveOrigin = new THREE.Vector3(6.0, -1.3, 0.8);

    // Glowing Vertical Volumetric Blast Pillar
    const blastPillarGeo = new THREE.CylinderGeometry(0.65, 1.5, 5.5, 32, 1, true);
    const blastPillarMat = new THREE.MeshBasicMaterial({
      color: 0xff3366,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide
    });
    const blastPillar = new THREE.Mesh(blastPillarGeo, blastPillarMat);
    blastPillar.position.set(6.0, 1.4, 0.8);
    group.add(blastPillar);

    const shockwaveCount = 5;
    const shockwaveColors = [0xff3366, 0xf97316, 0xa855f7, 0x00f5d4, 0xff3366];
    const shockwaveMeshes: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; speed: number; phase: number }[] = [];
    for (let i = 0; i < shockwaveCount; i++) {
      const swGeo = new THREE.RingGeometry(1.0, 1.18, 64);
      const swMat = new THREE.MeshBasicMaterial({
        color: shockwaveColors[i % shockwaveColors.length],
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65
      });
      const swMesh = new THREE.Mesh(swGeo, swMat);
      swMesh.rotation.x = Math.PI / 2;
      swMesh.position.copy(shockwaveOrigin);
      group.add(swMesh);
      shockwaveMeshes.push({ mesh: swMesh, mat: swMat, speed: 0.55, phase: i * 0.2 });
    }

    // 6. Perimeter Industrial SCADA Substation Nodes (12 nodes)
    const scadaCount = 12;
    for (let i = 0; i < scadaCount; i++) {
      const angle = (i / scadaCount) * Math.PI * 2;
      const radius = 11.5 + (i % 2) * 2.2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const scadaGeo = new THREE.SphereGeometry(0.32, 12, 12);
      const scadaMat = new THREE.MeshStandardMaterial({
        color: i === 3 || i === 8 ? 0xff3366 : 0x00f5d4,
        emissive: i === 3 ? 0x880022 : 0x004433
      });
      const scadaMesh = new THREE.Mesh(scadaGeo, scadaMat);
      scadaMesh.position.set(x, 0.4 + Math.sin(i) * 0.4, z);
      group.add(scadaMesh);

      // Connective faint telemetry tracer line to BMC node
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        nodeCoords.node_bmc.pos,
        new THREE.Vector3(x, 0.4 + Math.sin(i) * 0.4, z)
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: i === 3 || i === 8 ? 0xff3366 : 0x00f5d4,
        transparent: true,
        opacity: 0.18
      });
      const line = new THREE.Line(lineGeo, lineMat);
      group.add(line);
    }

    // Mouse Parallax & Raycasting
    let mouseX = 0;
    let mouseY = 0;
    let isHovering = false;
    const raycaster = new THREE.Raycaster();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      isHovering = true;
    };

    const handleMouseLeave = () => {
      isHovering = false;
    };

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const clickX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const clickY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      raycaster.setFromCamera(new THREE.Vector2(clickX, clickY), camera);

      const interactiveList = Object.values(nodeMeshes);
      const hits = raycaster.intersectObjects(interactiveList, false);
      if (hits.length > 0) {
        const clickedId = hits[0].object.userData.nodeId;
        if (clickedId) {
          setSelectedThreatNodeId(clickedId);
        }
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('click', handleClick);

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Camera parallax with smooth damping
      if (isHovering) {
        camera.position.x += (mouseX * 3.5 - camera.position.x) * 0.04;
        camera.position.y += (10 + mouseY * 2.2 - camera.position.y) * 0.04;
      } else {
        camera.position.x += (0 - camera.position.x) * 0.04;
        camera.position.y += (10 - camera.position.y) * 0.04;
      }
      camera.lookAt(0.3, 1.6, 0);

      // Auto-orbit if enabled
      if (isAutoOrbitRef.current) {
        group.rotation.y += 0.0025;
      }

      // Rotate nodes subtly
      Object.entries(nodeMeshes).forEach(([id, m]) => {
        m.rotation.y = elapsedTime * 0.6;
        m.rotation.x = elapsedTime * 0.4;
      });

      // Update Halos
      Object.entries(haloMeshes).forEach(([id, halo]) => {
        const isSelected = id === selectedThreatNodeId;
        halo.scale.setScalar(isSelected ? 1.0 + Math.sin(elapsedTime * 4) * 0.08 : 1.0);
        (halo.material as THREE.MeshBasicMaterial).opacity = isSelected ? 0.9 : 0.35;
      });

      // Stream photons along kill chain curve
      photons.forEach((p, idx) => {
        const progress = ((elapsedTime * 0.5 + idx / photonCount) % 1.0);
        const pt = curve.getPointAt(progress);
        p.position.copy(pt);
      });

      // Animate Volumetric Blast Pillar
      blastPillar.scale.y = 1.0 + Math.sin(elapsedTime * 3.5) * 0.15;
      blastPillarMat.opacity = 0.22 + Math.sin(elapsedTime * 2.5) * 0.08;

      // Expand continuous shockwaves
      if (isShockwavesActiveRef.current) {
        shockwaveMeshes.forEach((sw) => {
          const progress = ((elapsedTime * sw.speed + sw.phase) % 1.0);
          const currentRadius = 1.0 + progress * 13.5;
          sw.mesh.scale.set(currentRadius, currentRadius, currentRadius);
          sw.mat.opacity = Math.max(0, 0.72 * (1.0 - progress));
        });
      } else {
        shockwaveMeshes.forEach((sw) => {
          sw.mat.opacity = 0;
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (domElement.parentNode) {
        domElement.parentNode.removeChild(domElement);
      }
      renderer.dispose();
    };
  }, [activeTab, spatialMode, selectedThreatNodeId]);


  const executePlaybook = (id: string, name: string) => {
    setPlaybookStates((prev) => ({ ...prev, [id]: 'EXECUTING' }));
    setPlaybookLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Executing Playbook: ${name}...`,
      `[${new Date().toLocaleTimeString()}] Injecting attestation boundary check and deploying sandboxed mitigation stub...`
    ]);

    setTimeout(() => {
      setPlaybookStates((prev) => ({ ...prev, [id]: 'DEPLOYED' }));
      setPlaybookLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] SUCCESS: ${name} verified and deployed. Exploit chain severed at hop #3.`
      ]);
    }, 1800);
  };

  const currentGdb = GDB_TRACE_STEPS[currentGdbIndex];

  return (
    <div className="flex flex-col gap-6 font-mono">
      {/* Top Incident Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-cyber-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-cyber-rose animate-ping" />
            <span className="px-2.5 py-0.5 rounded bg-cyber-rose/20 text-cyber-rose text-xs font-bold border border-cyber-rose/40">
              ACTIVE INCIDENT #IR-2026-9041
            </span>
            <span className="text-xs text-cyber-muted hidden sm:inline">&bull; REAL-TIME WAR-ROOM</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white mt-1">
            CRITICAL FIRMWARE BLAST RADIUS & ZERO-DAY MULTIPLAYER WAR-ROOM
          </h1>
          <p className="text-xs text-cyber-muted">
            Target: <span className="text-white font-bold">Router-GW-AX9000 (MIPS32el)</span> &bull; Kill-Chain: <span className="text-cyber-rose font-bold">Web Server &rarr; CVE-2026-8812 &rarr; root &rarr; BMC Flash</span>
          </p>
        </div>

        {/* Live Distributed Team Badges */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            <span className="w-7 h-7 rounded-full bg-cyber-cyan/30 border border-cyber-cyan flex items-center justify-center text-[10px] text-cyber-cyan font-bold" title="Lead PSIRT Architect (Online)">
              EV
            </span>
            <span className="w-7 h-7 rounded-full bg-cyber-purple/30 border border-cyber-purple flex items-center justify-center text-[10px] text-cyber-purple font-bold" title="OT Security Architect (Online)">
              MR
            </span>
            <span className="w-7 h-7 rounded-full bg-cyber-rose/30 border border-cyber-rose flex items-center justify-center text-[10px] text-cyber-rose font-bold" title="Binary Exploitation Researcher (Online)">
              CW
            </span>
            <span className="w-7 h-7 rounded-full bg-cyber-emerald/30 border border-cyber-emerald flex items-center justify-center text-[10px] text-cyber-emerald font-bold animate-pulse" title="AI Copilot Agent (Connected via MCP)">
              AI
            </span>
          </div>
          <span className="text-[11px] text-cyber-emerald font-bold px-2.5 py-1 rounded-lg bg-cyber-emerald/10 border border-cyber-emerald/30">
            4 Collaborators Live
          </span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-panel p-3.5 rounded-xl border border-cyber-rose/40 bg-cyber-rose/5">
          <div className="text-[11px] text-cyber-muted">CVSS v4.0 RATING</div>
          <div className="text-2xl font-bold text-cyber-rose mt-1">9.8 CRITICAL</div>
          <div className="text-[10px] text-slate-300">Remote Code Execution</div>
        </div>
        <div className="glass-panel p-3.5 rounded-xl border border-cyber-amber/40 bg-cyber-amber/5">
          <div className="text-[11px] text-cyber-muted">ATTACK BLAST RADIUS</div>
          <div className="text-2xl font-bold text-cyber-amber mt-1">4,800 Units</div>
          <div className="text-[10px] text-slate-300">SCADA & BMC Subnets</div>
        </div>
        <div className="glass-panel p-3.5 rounded-xl border border-cyber-cyan/40 bg-cyber-cyan/5">
          <div className="text-[11px] text-cyber-muted">SHORTEST PATH DEPTH</div>
          <div className="text-2xl font-bold text-cyber-cyan mt-1">4 Hops</div>
          <div className="text-[10px] text-slate-300">Zero-Click Escalation</div>
        </div>
        <div className="glass-panel p-3.5 rounded-xl border border-cyber-purple/40 bg-cyber-purple/5">
          <div className="text-[11px] text-cyber-muted">EGRESS ISOLATION</div>
          <div className="text-2xl font-bold text-cyber-emerald mt-1">ENFORCED</div>
          <div className="text-[10px] text-slate-300">Zero Socket Leaks</div>
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="flex items-center gap-2 border-b border-cyber-border/40 pb-2 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('3D_THREAT_CANVAS')}
          className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
            activeTab === '3D_THREAT_CANVAS'
              ? 'bg-cyber-cyan text-cyber-bg shadow-[0_0_15px_rgba(0,245,212,0.3)]'
              : 'bg-cyber-surface text-cyber-muted hover:text-white border border-cyber-border'
          }`}
        >
          <span>3D Spatial Threat Canvas</span>
        </button>
        <button
          onClick={() => setActiveTab('GDB_STEPPER')}
          className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
            activeTab === 'GDB_STEPPER'
              ? 'bg-cyber-purple text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
              : 'bg-cyber-surface text-cyber-muted hover:text-white border border-cyber-border'
          }`}
        >
          <span>GDB Trace Stepper</span>
        </button>
        <button
          onClick={() => setActiveTab('PLAYBOOKS')}
          className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
            activeTab === 'PLAYBOOKS'
              ? 'bg-cyber-emerald text-cyber-bg shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              : 'bg-cyber-surface text-cyber-muted hover:text-white border border-cyber-border'
          }`}
        >
          <span>Live Playbooks</span>
        </button>
        <button
          onClick={() => setActiveTab('TEAM_ANNOTATIONS')}
          className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
            activeTab === 'TEAM_ANNOTATIONS'
              ? 'bg-cyber-rose text-white shadow-[0_0_15px_rgba(255,51,102,0.3)]'
              : 'bg-cyber-surface text-cyber-muted hover:text-white border border-cyber-border'
          }`}
        >
          <span>War-Room Log & Notes</span>
        </button>
      </div>

      {/* Active Tab Views */}
      {activeTab === '3D_THREAT_CANVAS' && (
        <div className="flex flex-col gap-4">
          {/* 1. Top Kill-Chain Hop Progression Banner */}
          {spatialMode === 'KILL_CHAIN' && (
            <div className="glass-panel p-3.5 rounded-xl border border-cyber-border/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-cyber-border/40 text-[11px]">
                <span className="flex items-center gap-1.5 text-cyber-cyan font-bold">
                  <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" />
                  RECONSTRUCTED MULTI-HOP ATTACK PATHWAY &amp; EXPLORATION CHRONOLOGY
                </span>
                <span className="text-cyber-rose font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyber-rose animate-ping" />
                  Hop 5 of 5 Reached BMC &bull; Shortest Exploit Path Proved
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 font-mono">
                {Object.values(THREAT_NODES).map((node, idx) => {
                  const isSelected = selectedThreatNodeId === node.id;
                  const isEpicenter = node.id === 'node_bmc';
                  return (
                    <button
                      key={node.id}
                      onClick={() => {
                        setSelectedThreatNodeId(node.id);
                        cyberAudio.playClick();
                      }}
                      className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between gap-1 cyber-hover-lift ${
                        isSelected
                          ? isEpicenter
                            ? 'bg-cyber-rose/20 border-cyber-rose text-cyber-rose shadow-[0_0_15px_rgba(255,51,102,0.4)]'
                            : 'bg-cyber-cyan/15 border-cyber-cyan text-cyber-cyan shadow-[0_0_15px_rgba(0,245,212,0.3)]'
                          : 'bg-cyber-surface/60 border-cyber-border text-slate-300 hover:border-cyber-cyan/40'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold">HOP #{idx + 1}</span>
                        <span className={`px-1.5 py-0.2 rounded font-bold ${
                          node.severity === 'CRITICAL' ? 'bg-cyber-rose/20 text-cyber-rose' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          CVSS {node.cvss}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white truncate">{node.name}</div>
                      <div className="text-[10px] text-cyber-muted truncate">{node.vector}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Expansive Widescreen 3D Spatial Canvas Stage */}
          <div className="relative w-full h-[580px] lg:h-[620px] rounded-2xl glass-panel-glow border border-cyber-cyan/40 overflow-hidden shadow-2xl cyber-liquid-border">
            {spatialMode === 'KILL_CHAIN' ? (
              <>
                {/* 3D WebGL Canvas Viewport */}
                <div ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

                {/* Top-Left Stage Header Overlay */}
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-1 pointer-events-none">
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyber-bg/90 border border-cyber-rose/50 text-xs text-cyber-rose backdrop-blur-md shadow-[0_0_18px_rgba(255,51,102,0.35)]">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyber-rose animate-ping" />
                    <span className="font-bold tracking-wider text-white cyber-text-shimmer">3D SPATIAL KILL-CHAIN TOPOLOGY &amp; VOLUMETRIC SHOCKWAVES</span>
                  </div>
                  <div className="text-[10px] text-cyber-muted pl-1">
                    Multi-Hop Attack Spline &bull; Epicenter Blast Radius Radiating 4,800 SCADA Units
                  </div>
                </div>

                {/* Top-Right Mode & View Controls */}
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                  <div className="flex items-center bg-cyber-bg/85 p-1 rounded-lg border border-cyber-border text-xs backdrop-blur-md">
                    <button
                      onClick={() => setSpatialMode('KILL_CHAIN')}
                      className="px-3 py-1 rounded transition-all font-bold bg-cyber-cyan text-cyber-bg shadow-[0_0_10px_rgba(0,245,212,0.4)]"
                    >
                      Kill-Chain Topology
                    </button>
                    <button
                      onClick={() => setSpatialMode('GLOBAL_RADAR')}
                      className="px-3 py-1 rounded transition-all font-bold text-slate-400 hover:text-white"
                    >
                      Global Fleet Radar
                    </button>
                  </div>

                  <button
                    onClick={() => setShowForensicsPanel(!showForensicsPanel)}
                    className="px-3 py-1.5 rounded-lg bg-cyber-surface/90 hover:bg-cyber-card border border-cyber-cyan/40 text-cyber-cyan font-bold text-xs backdrop-blur-md shadow-lg transition-all flex items-center gap-1.5 cyber-hover-lift"
                  >
                    {showForensicsPanel ? 'Hide Forensics [—]' : 'Show Forensics [+]'}
                  </button>
                </div>

                {/* Floating Holographic Forensics HUD Drawer (Right Quadrant) */}
                {showForensicsPanel && (() => {
                  const selectedThreatNode = THREAT_NODES[selectedThreatNodeId] || THREAT_NODES.node_bmc;
                  return (
                    <div className="absolute top-16 right-4 bottom-16 w-84 lg:w-92 bg-cyber-bg/92 backdrop-blur-xl border border-cyber-cyan/40 rounded-xl p-4 flex flex-col justify-between shadow-[0_0_35px_rgba(0,0,0,0.85)] z-20 pointer-events-auto animate-in fade-in slide-in-from-right-4 duration-300 text-xs">
                      <div className="flex items-center justify-between border-b border-cyber-border/40 pb-2.5">
                        <span className="font-bold text-cyber-cyan flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan" />
                          KILL-CHAIN HOP FORENSICS
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            selectedThreatNode.severity === 'CRITICAL'
                              ? 'bg-cyber-rose/20 text-cyber-rose border border-cyber-rose/40 animate-pulse'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          }`}
                        >
                          CVSS {selectedThreatNode.cvss} {selectedThreatNode.severity}
                        </span>
                      </div>

                      <div className="py-2">
                        <div className="text-[10px] text-cyber-muted tracking-wider uppercase">{selectedThreatNode.stage}</div>
                        <div className="text-white font-bold text-sm mt-0.5">{selectedThreatNode.name}</div>
                      </div>

                      <div className="space-y-2 overflow-y-auto max-h-[240px] pr-1">
                        <div className="p-2.5 rounded bg-cyber-surface/80 border border-cyber-border/50">
                          <div className="text-[10px] text-cyber-muted font-bold">ATTACK VECTOR</div>
                          <div className="text-cyber-rose font-bold mt-0.5 text-[11px]">{selectedThreatNode.vector}</div>
                        </div>

                        <div className="p-2.5 rounded bg-cyber-surface/80 border border-cyber-border/50">
                          <div className="text-[10px] text-cyber-muted font-bold">BUS / PROTOCOL CHANNEL</div>
                          <div className="text-cyber-cyan font-bold mt-0.5 text-[11px]">{selectedThreatNode.busOrProtocol}</div>
                        </div>

                        <div className="p-2.5 rounded bg-cyber-surface/80 border border-cyber-border/50">
                          <div className="text-[10px] text-cyber-muted font-bold">IMPACT ASSESSMENT</div>
                          <div className="text-slate-200 mt-0.5 text-[11px] leading-relaxed">{selectedThreatNode.impact}</div>
                        </div>

                        <div className="p-2.5 rounded bg-cyber-emerald/15 border border-cyber-emerald/40">
                          <div className="text-[10px] text-cyber-emerald font-bold">RECOMMENDED PLAYBOOK MITIGATION</div>
                          <div className="text-slate-100 mt-0.5 text-[11px] leading-relaxed">{selectedThreatNode.mitigation}</div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-cyber-border/40 space-y-2 mt-auto">
                        <Link
                          href="/patch-studio"
                          className="w-full py-2 rounded-lg bg-cyber-cyan text-cyber-bg font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,245,212,0.3)] hover:bg-cyber-cyan/90 transition-all cyber-hover-lift cyber-sheen-sweep"
                        >
                          Synthesize Binary Hotpatch
                        </Link>
                        <Link
                          href="/attack-graph"
                          className="w-full py-2 rounded-lg bg-cyber-surface hover:bg-cyber-card border border-cyber-border text-white text-xs flex items-center justify-center gap-1.5 transition-all cyber-hover-lift"
                        >
                          Open Neo4j Attack Graph
                        </Link>
                      </div>
                    </div>
                  );
                })()}

                {/* Bottom Interactive HUD Action Toolbar */}
                <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
                  {/* Left Controls */}
                  <div className="flex items-center gap-2 pointer-events-auto">
                    <button
                      onClick={() => setIsAutoOrbit(!isAutoOrbit)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all backdrop-blur-md cyber-hover-lift ${
                        isAutoOrbit
                          ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan'
                          : 'bg-cyber-bg/85 border-cyber-border text-cyber-muted hover:text-white'
                      }`}
                    >
                      {isAutoOrbit ? 'Auto-Orbit: ON' : 'Auto-Orbit: OFF'}
                    </button>
                    <button
                      onClick={() => setIsShockwavesActive(!isShockwavesActive)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all backdrop-blur-md cyber-hover-lift ${
                        isShockwavesActive
                          ? 'bg-cyber-rose/20 border-cyber-rose text-cyber-rose'
                          : 'bg-cyber-bg/85 border-cyber-border text-cyber-muted hover:text-white'
                      }`}
                    >
                      {isShockwavesActive ? 'Shockwaves: ACTIVE' : 'Shockwaves: PAUSED'}
                    </button>
                  </div>

                  {/* Right Node Quick Chips */}
                  <div className="flex flex-wrap gap-1.5 pointer-events-auto">
                    {Object.values(THREAT_NODES).map((n) => (
                      <button
                        key={n.id}
                        onClick={() => setSelectedThreatNodeId(n.id)}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all flex items-center gap-1.5 backdrop-blur-md cyber-hover-lift ${
                          selectedThreatNodeId === n.id
                            ? 'bg-cyber-cyan text-cyber-bg shadow-[0_0_12px_rgba(0,245,212,0.4)]'
                            : n.severity === 'CRITICAL'
                            ? 'bg-cyber-rose/25 text-cyber-rose border border-cyber-rose/40'
                            : 'bg-cyber-bg/85 text-slate-300 border border-cyber-border hover:border-cyber-cyan/40'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${n.severity === 'CRITICAL' ? 'bg-cyber-rose animate-ping' : 'bg-cyber-cyan'}`} />
                        {n.stage.split(':')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 relative">
                <div className="absolute top-4 right-4 z-20 flex items-center bg-cyber-bg/85 p-1 rounded-lg border border-cyber-border text-xs backdrop-blur-md">
                  <button
                    onClick={() => setSpatialMode('KILL_CHAIN')}
                    className="px-3 py-1 rounded transition-all font-bold text-slate-400 hover:text-white"
                  >
                    Kill-Chain Topology
                  </button>
                  <button
                    onClick={() => setSpatialMode('GLOBAL_RADAR')}
                    className="px-3 py-1 rounded transition-all font-bold bg-cyber-purple text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                  >
                    Global Fleet Radar
                  </button>
                </div>
                <div className="w-full max-w-2xl h-[520px]">
                  <ThreatRadarGlobe />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'GDB_STEPPER' && (
        <div className="glass-panel p-5 rounded-xl border border-cyber-purple/40 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyber-border/40 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyber-purple animate-pulse" />
                <h3 className="text-sm font-bold text-white">
                  DETERMINISTIC GDB EXECUTION TRACE STEPPER (MICROVM ATTESTED)
                </h3>
              </div>
              <p className="text-[11px] text-cyber-muted">
                Step through CPU registers, stack memory, and assembly instructions up to crash point
              </p>
            </div>

            {/* Stepper Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentGdbIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentGdbIndex === 0}
                className="px-3 py-1.5 rounded-lg bg-cyber-surface hover:bg-cyber-card border border-cyber-border text-xs text-white disabled:opacity-40"
              >
                &larr; Step Back
              </button>
              <button
                onClick={() => setIsPlayingGdb(!isPlayingGdb)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isPlayingGdb
                    ? 'bg-cyber-rose/20 text-cyber-rose border border-cyber-rose/40'
                    : 'bg-cyber-cyan text-cyber-bg'
                }`}
              >
                {isPlayingGdb ? 'Pause Replay' : 'Auto Play'}
              </button>
              <button
                onClick={() => setCurrentGdbIndex((prev) => Math.min(GDB_TRACE_STEPS.length - 1, prev + 1))}
                disabled={currentGdbIndex === GDB_TRACE_STEPS.length - 1}
                className="px-3 py-1.5 rounded-lg bg-cyber-surface hover:bg-cyber-card border border-cyber-border text-xs text-white disabled:opacity-40"
              >
                Step Next &rarr;
              </button>
            </div>
          </div>

          {/* Instruction Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {GDB_TRACE_STEPS.map((s, idx) => {
              const isSelected = currentGdbIndex === idx;
              return (
                <button
                  key={s.step}
                  onClick={() => setCurrentGdbIndex(idx)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    isSelected
                      ? s.isCrash
                        ? 'bg-cyber-rose/20 border-cyber-rose text-cyber-rose shadow-[0_0_12px_rgba(255,51,102,0.3)]'
                        : 'bg-cyber-purple/20 border-cyber-purple text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                      : 'bg-cyber-surface/60 border-cyber-border text-cyber-muted hover:text-white'
                  }`}
                >
                  <div className="text-[10px] font-bold">STEP #{s.step}</div>
                  <div className="text-xs font-mono truncate">{s.pc}</div>
                  <div className="text-[10px] truncate text-slate-300">{s.instruction}</div>
                </button>
              );
            })}
          </div>

          {/* Trace Detail Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
            {/* Left: Disassembly and Step Explanation */}
            <div className="p-4 rounded-xl bg-cyber-surface/70 border border-cyber-border space-y-3">
              <div className="flex items-center justify-between border-b border-cyber-border/40 pb-2">
                <span className="text-cyber-cyan font-bold">CURRENT INSTRUCTION</span>
                <span className="text-[11px] text-cyber-muted font-mono">{currentGdb.pc}</span>
              </div>
              <div className="p-3 rounded-lg bg-cyber-bg border border-cyber-border/50 text-white font-mono text-sm">
                {currentGdb.instruction}
              </div>
              <div>
                <span className="text-[10px] text-cyber-muted block">ANALYSIS SUMMARY</span>
                <p className="text-slate-200 text-xs leading-relaxed mt-1">{currentGdb.description}</p>
              </div>
              {currentGdb.isCrash && (
                <div className="p-3 rounded-lg bg-cyber-rose/15 border border-cyber-rose/40 text-cyber-rose text-xs font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyber-rose animate-ping" />
                  FAULTING EXECUTION TRACE TERMINATION: [SIGSEGV] at address 0x41414141
                </div>
              )}
            </div>

            {/* Right: Register Bank & Stack Dump */}
            <div className="p-4 rounded-xl bg-cyber-surface/70 border border-cyber-border space-y-3">
              <div className="text-cyber-purple font-bold border-b border-cyber-border/40 pb-2">
                ARM CORTEX-A9 REGISTER DUMP
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                {Object.entries(currentGdb.registers).map(([reg, val]) => (
                  <div key={reg} className="p-1.5 rounded bg-cyber-bg border border-cyber-border/40">
                    <span className="text-cyber-muted uppercase">${reg}: </span>
                    <span className={val === '0x41414141' ? 'text-cyber-rose font-bold' : 'text-white'}>
                      {val}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <div className="text-cyber-cyan font-bold text-[10px] mb-1">STACK BUFFER PREVIEW</div>
                <pre className="p-2.5 rounded-lg bg-cyber-bg text-[10px] font-mono text-slate-300 overflow-x-auto border border-cyber-border/40">
                  {currentGdb.memoryHex}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'PLAYBOOKS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Playbook 1 */}
          <div className="glass-panel p-5 rounded-xl border border-cyber-cyan/40 flex flex-col justify-between gap-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-cyber-cyan/10 text-cyber-cyan font-bold text-[10px] border border-cyber-cyan/30">
                  PLAYBOOK #01
                </span>
                <span className={`text-[10px] font-bold ${playbookStates.pb1 === 'DEPLOYED' ? 'text-cyber-emerald' : 'text-cyber-muted'}`}>
                  {playbookStates.pb1}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">Drop Privileges on mini_httpd</h3>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Reconfigure init scripts to start mini_httpd as unprivileged `www-data` (UID 1001) instead of root, mitigating lateral access to raw hardware buses.
              </p>
            </div>
            <button
              onClick={() => executePlaybook('pb1', 'Drop Privileges on mini_httpd')}
              disabled={playbookStates.pb1 !== 'IDLE'}
              className="w-full py-2 rounded-lg bg-cyber-cyan text-cyber-bg font-bold text-xs hover:bg-cyber-cyan/90 transition-all disabled:opacity-50"
            >
              {playbookStates.pb1 === 'EXECUTING' ? 'Executing...' : playbookStates.pb1 === 'DEPLOYED' ? 'Deployed & Active' : 'Execute Mitigation Playbook'}
            </button>
          </div>

          {/* Playbook 2 */}
          <div className="glass-panel p-5 rounded-xl border border-cyber-purple/40 flex flex-col justify-between gap-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-cyber-purple/10 text-cyber-purple font-bold text-[10px] border border-cyber-purple/30">
                  PLAYBOOK #02
                </span>
                <span className={`text-[10px] font-bold ${playbookStates.pb2 === 'DEPLOYED' ? 'text-cyber-emerald' : 'text-cyber-muted'}`}>
                  {playbookStates.pb2}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">Restrict /dev/spidev0.0 Access</h3>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Apply kernel udev policy locking SPI bus permissions to group `hardware_admin` (mode 0660), blocking unauthenticated daemon access to the BMC SPI flash controller.
              </p>
            </div>
            <button
              onClick={() => executePlaybook('pb2', 'Restrict /dev/spidev0.0 Access')}
              disabled={playbookStates.pb2 !== 'IDLE'}
              className="w-full py-2 rounded-lg bg-cyber-purple text-white font-bold text-xs hover:bg-cyber-purple/90 transition-all disabled:opacity-50"
            >
              {playbookStates.pb2 === 'EXECUTING' ? 'Executing...' : playbookStates.pb2 === 'DEPLOYED' ? 'Deployed & Active' : 'Execute Mitigation Playbook'}
            </button>
          </div>

          {/* Playbook 3 */}
          <div className="glass-panel p-5 rounded-xl border border-cyber-rose/40 flex flex-col justify-between gap-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-cyber-rose/10 text-cyber-rose font-bold text-[10px] border border-cyber-rose/30">
                  PLAYBOOK #03
                </span>
                <span className={`text-[10px] font-bold ${playbookStates.pb3 === 'DEPLOYED' ? 'text-cyber-emerald' : 'text-cyber-muted'}`}>
                  {playbookStates.pb3}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">Binary Hotpatch Ingress Buffer</h3>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Inject assembly runtime boundary clamp stub (`cmp r2, #256; movgt r2, #256`) before the memcpy call at address 0x00014a80 in `mini_httpd`.
              </p>
            </div>
            <button
              onClick={() => executePlaybook('pb3', 'Binary Hotpatch Ingress Buffer')}
              disabled={playbookStates.pb3 !== 'IDLE'}
              className="w-full py-2 rounded-lg bg-cyber-rose text-white font-bold text-xs hover:bg-cyber-rose/90 transition-all disabled:opacity-50"
            >
              {playbookStates.pb3 === 'EXECUTING' ? 'Executing...' : playbookStates.pb3 === 'DEPLOYED' ? 'Deployed & Active' : 'Execute Mitigation Playbook'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'TEAM_ANNOTATIONS' && (
        <div className="glass-panel p-5 rounded-xl border border-cyber-border space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-cyber-border/40 pb-2">
            <span className="font-bold text-cyber-cyan">REAL-TIME INCIDENT AUDIT TRAIL</span>
            <span className="text-[11px] text-cyber-muted">Append-only compliance logs</span>
          </div>

          <div className="space-y-2 font-mono text-[11px] bg-cyber-bg/90 p-4 rounded-xl border border-cyber-border/50 max-h-[300px] overflow-y-auto">
            {playbookLogs.map((log, i) => (
              <div key={i} className="text-slate-300">
                <span className="text-cyber-cyan font-bold">{log.slice(0, 10)}</span>
                <span>{log.slice(10)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
