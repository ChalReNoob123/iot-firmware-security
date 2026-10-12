'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

interface ChipInfo {
  id: string;
  name: string;
  role: string;
  status: 'ACTIVE' | 'NORMAL' | 'TAINTED' | 'STANDBY';
  tempC: number;
  telemetry: Record<string, string>;
}

export default function DigitalTwin3DBoard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visualMode, setVisualMode] = useState<'CYBER' | 'THERMAL'>('CYBER');
  const [cameraPreset, setCameraPreset] = useState<'ISOMETRIC' | 'TOP_DOWN' | 'SOC_MACRO' | 'RF_VECTOR'>('ISOMETRIC');
  const [selectedChipId, setSelectedChipId] = useState<string>('mcu');

  const chips: Record<string, ChipInfo> = {
    mcu: {
      id: 'mcu',
      name: 'ARM Cortex-A9 Dual-Core SoC',
      role: 'Primary Kernel Execution Core & Fault Origin',
      status: 'ACTIVE',
      tempC: 84.6,
      telemetry: {
        'Clock Frequency': '1.20 GHz (Turbo Governor)',
        'Execution Mode': 'Thumb-2 / ARMv7-A Little-Endian',
        'PC Register': '0x00014a88 (Fault State SIGSEGV)',
        'LR Register': '0x41414141 (Hijacked Saved LR)',
        'Thermal Die': '84.6 °C (High Under Fuzz Stress)',
        'L1/L2 Cache': '32KB I/D + 512KB Unified L2'
      }
    },
    ble: {
      id: 'ble',
      name: 'Nordic nRF52840 BLE 5.3 SoC',
      role: 'Zero-Day Attack Ingress Vector (GATT Ingress)',
      status: 'TAINTED',
      tempC: 72.1,
      telemetry: {
        'Service Handle': '0xFFE0 / 0xFFE1 (Custom GATT Vendor)',
        'Packet MTU': '512 Bytes (Unchecked Max: 1024)',
        'Buffer Status': 'CRITICAL: Stack Overflow Detected',
        'Radio Frequency': '2.402 - 2.480 GHz FHSS',
        'PHY Layer': 'LE 2M / Coded S=8 Long Range',
        'Thermal Die': '72.1 °C (RF Amplification Active)'
      }
    },
    flash: {
      id: 'flash',
      name: 'Winbond W25Q128 16MB SPI NOR Flash',
      role: 'SquashFS Read-Only Storage & U-Boot Image',
      status: 'NORMAL',
      tempC: 44.2,
      telemetry: {
        'SPI Bus Clock': '104 MHz Quad-I/O SPI (QSPI)',
        'Flash Address Space': '0x00000000 - 0x01000000',
        'Filesystem': 'SquashFS v4.0 (LZMA Compressed)',
        'NVRAM Emulation': 'Intercepted by FirmAE Engine',
        'Thermal Die': '44.2 °C (Nominal Ambient)'
      }
    },
    eth: {
      id: 'eth',
      name: 'Microchip KSZ8081 Fast Ethernet PHY',
      role: 'Out-of-Band Telnet & SCADA Network Interface',
      status: 'STANDBY',
      tempC: 51.8,
      telemetry: {
        'Interface Standard': 'MII / RMII (100BASE-TX)',
        'Bridge State': 'Bound to br0 (192.168.0.1/24)',
        'Open Ports': 'Port 80 (HTTP), Port 23 (Telnet)',
        'Frame CRC Error': '0 Errors (Clean Wire Signal)',
        'Thermal Die': '51.8 °C (Active Link Negotiation)'
      }
    }
  };

  const selectedChip = chips[selectedChipId] || chips.mcu;

  // Refs for animation loop and interactivity
  const sceneStateRef = useRef<{
    targetCamPos: THREE.Vector3;
    targetCamLook: THREE.Vector3;
    visualMode: 'CYBER' | 'THERMAL';
    selectedChipId: string;
  }>({
    targetCamPos: new THREE.Vector3(0, 8, 11),
    targetCamLook: new THREE.Vector3(0, 0, 0),
    visualMode: 'CYBER',
    selectedChipId: 'mcu'
  });

  // Sync state to ref
  useEffect(() => {
    sceneStateRef.current.visualMode = visualMode;
  }, [visualMode]);

  useEffect(() => {
    sceneStateRef.current.selectedChipId = selectedChipId;
  }, [selectedChipId]);

  // Handle camera presets
  useEffect(() => {
    if (cameraPreset === 'ISOMETRIC') {
      sceneStateRef.current.targetCamPos.set(0, 8, 11);
      sceneStateRef.current.targetCamLook.set(0, 0, 0);
    } else if (cameraPreset === 'TOP_DOWN') {
      sceneStateRef.current.targetCamPos.set(0, 13, 0.5);
      sceneStateRef.current.targetCamLook.set(0, 0, 0);
    } else if (cameraPreset === 'SOC_MACRO') {
      sceneStateRef.current.targetCamPos.set(-1.2, 3.5, 3.5);
      sceneStateRef.current.targetCamLook.set(-1.2, 0.3, 0);
    } else if (cameraPreset === 'RF_VECTOR') {
      sceneStateRef.current.targetCamPos.set(1.8, 3.5, 4.2);
      sceneStateRef.current.targetCamLook.set(1.6, 0.3, 1.2);
    }
  }, [cameraPreset]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06090e, 0.035);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 8, 11);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    const domElement = renderer.domElement;
    container.appendChild(domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0x38bdf8, 1.0);
    scene.add(ambient);

    const dirCyan = new THREE.DirectionalLight(0x00f5d4, 2.5);
    dirCyan.position.set(6, 12, 8);
    scene.add(dirCyan);

    const dirRose = new THREE.DirectionalLight(0xff3366, 2.0);
    dirRose.position.set(-8, -4, -6);
    scene.add(dirRose);

    const boardGroup = new THREE.Group();
    scene.add(boardGroup);

    // 1. Motherboard PCB
    const pcbGeo = new THREE.BoxGeometry(8.4, 0.22, 5.8);
    const pcbCyberMat = new THREE.MeshStandardMaterial({
      color: 0x071e16,
      metalness: 0.3,
      roughness: 0.25
    });
    const pcbThermalMat = new THREE.MeshStandardMaterial({
      color: 0x110e2e, // Deep cool indigo
      metalness: 0.1,
      roughness: 0.6
    });
    const pcb = new THREE.Mesh(pcbGeo, pcbCyberMat);
    boardGroup.add(pcb);

    // Copper Traces Grid
    const traceGrid = new THREE.GridHelper(8.0, 24, 0x00f5d4, 0x133044);
    traceGrid.position.y = 0.12;
    boardGroup.add(traceGrid);

    // 2. Chips definitions & meshes
    const chipMeshes: Record<string, { mesh: THREE.Mesh; cyberMat: THREE.Material; thermalMat: THREE.Material; position: THREE.Vector3 }> = {};

    // ARM MCU
    const mcuGeo = new THREE.BoxGeometry(2.0, 0.35, 2.0);
    const mcuCyberMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.15,
      emissive: 0x00f5d4,
      emissiveIntensity: 0.15
    });
    const mcuThermalMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, // White-hot thermal core
      emissive: 0xff4500, // Blazing orange-red
      emissiveIntensity: 0.95
    });
    const mcuMesh = new THREE.Mesh(mcuGeo, mcuCyberMat);
    mcuMesh.position.set(-1.2, 0.28, 0);
    mcuMesh.userData = { chipId: 'mcu' };
    boardGroup.add(mcuMesh);
    chipMeshes.mcu = { mesh: mcuMesh, cyberMat: mcuCyberMat, thermalMat: mcuThermalMat, position: mcuMesh.position };

    // SPI Flash
    const flashGeo = new THREE.BoxGeometry(1.2, 0.26, 1.4);
    const flashCyberMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.1
    });
    const flashThermalMat = new THREE.MeshStandardMaterial({
      color: 0x4338ca, // Warm indigo-violet
      emissive: 0x3b82f6,
      emissiveIntensity: 0.5
    });
    const flashMesh = new THREE.Mesh(flashGeo, flashCyberMat);
    flashMesh.position.set(1.5, 0.24, -1.2);
    flashMesh.userData = { chipId: 'flash' };
    boardGroup.add(flashMesh);
    chipMeshes.flash = { mesh: flashMesh, cyberMat: flashCyberMat, thermalMat: flashThermalMat, position: flashMesh.position };

    // BLE RF module
    const bleGeo = new THREE.BoxGeometry(1.5, 0.38, 1.5);
    const bleCyberMat = new THREE.MeshStandardMaterial({
      color: 0x2e081c,
      metalness: 0.7,
      roughness: 0.2,
      emissive: 0xff3366,
      emissiveIntensity: 0.4
    });
    const bleThermalMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Amber hot
      emissive: 0xd97706,
      emissiveIntensity: 0.8
    });
    const bleMesh = new THREE.Mesh(bleGeo, bleCyberMat);
    bleMesh.position.set(1.6, 0.3, 1.2);
    bleMesh.userData = { chipId: 'ble' };
    boardGroup.add(bleMesh);
    chipMeshes.ble = { mesh: bleMesh, cyberMat: bleCyberMat, thermalMat: bleThermalMat, position: bleMesh.position };

    // Ethernet PHY
    const ethGeo = new THREE.BoxGeometry(1.5, 1.0, 1.5);
    const ethCyberMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0x10b981,
      emissiveIntensity: 0.1
    });
    const ethThermalMat = new THREE.MeshStandardMaterial({
      color: 0x6366f1, // Mild cyan-indigo
      emissive: 0x4f46e5,
      emissiveIntensity: 0.6
    });
    const ethMesh = new THREE.Mesh(ethGeo, ethCyberMat);
    ethMesh.position.set(-3.2, 0.62, -1.8);
    ethMesh.userData = { chipId: 'eth' };
    boardGroup.add(ethMesh);
    chipMeshes.eth = { mesh: ethMesh, cyberMat: ethCyberMat, thermalMat: ethThermalMat, position: ethMesh.position };

    // Pulsing RF Antenna Rings around BLE
    const rfRingGeo = new THREE.RingGeometry(1.0, 1.08, 48);
    const rfRingMat = new THREE.MeshBasicMaterial({
      color: 0xff3366,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    const rfRing = new THREE.Mesh(rfRingGeo, rfRingMat);
    rfRing.rotation.x = Math.PI / 2;
    rfRing.position.set(1.6, 0.32, 1.2);
    boardGroup.add(rfRing);

    // Glowing Target Halo for Selected Chip
    const haloGeo = new THREE.RingGeometry(1.4, 1.5, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const selectionHalo = new THREE.Mesh(haloGeo, haloMat);
    selectionHalo.rotation.x = Math.PI / 2;
    selectionHalo.position.y = 0.32;
    boardGroup.add(selectionHalo);

    // 3. SMD Indicator LEDs
    const ledCount = 4;
    const leds: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; rate: number }[] = [];
    const ledColors = [0x00f5d4, 0x10b981, 0xf59e0b, 0xff3366]; // Cyan Heartbeat, Green Pwr, Yellow TX/RX, Red Alert
    for (let i = 0; i < ledCount; i++) {
      const ledGeo = new THREE.BoxGeometry(0.12, 0.08, 0.12);
      const ledMat = new THREE.MeshBasicMaterial({ color: ledColors[i], transparent: true, opacity: 0.9 });
      const ledMesh = new THREE.Mesh(ledGeo, ledMat);
      ledMesh.position.set(-3.6 + i * 0.28, 0.16, 2.3);
      boardGroup.add(ledMesh);
      leds.push({ mesh: ledMesh, mat: ledMat, rate: 2 + i * 2.5 });
    }

    // 4. Animated Bus Signal Wave Lines & Photons
    // Route 1: BLE (1.6, 0.28, 1.2) -> MCU (-1.2, 0.28, 0)
    // Route 2: MCU (-1.2, 0.28, 0) -> SPI Flash (1.5, 0.28, -1.2)
    const curveBleMcu = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.6, 0.16, 1.2),
      new THREE.Vector3(0.5, 0.16, 0.8),
      new THREE.Vector3(0.0, 0.16, 0.2),
      new THREE.Vector3(-1.2, 0.16, 0.0)
    ]);
    const curveMcuFlash = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.2, 0.16, 0.0),
      new THREE.Vector3(-0.2, 0.16, -0.6),
      new THREE.Vector3(0.6, 0.16, -0.9),
      new THREE.Vector3(1.5, 0.16, -1.2)
    ]);

    // Tubes for buses
    const busTubeGeo1 = new THREE.TubeGeometry(curveBleMcu, 24, 0.03, 8, false);
    const busTubeMat1 = new THREE.MeshBasicMaterial({ color: 0xff3366, transparent: true, opacity: 0.45 });
    const busTube1 = new THREE.Mesh(busTubeGeo1, busTubeMat1);
    boardGroup.add(busTube1);

    const busTubeGeo2 = new THREE.TubeGeometry(curveMcuFlash, 24, 0.03, 8, false);
    const busTubeMat2 = new THREE.MeshBasicMaterial({ color: 0x00f5d4, transparent: true, opacity: 0.45 });
    const busTube2 = new THREE.Mesh(busTubeGeo2, busTubeMat2);
    boardGroup.add(busTube2);

    // Traveling Photons
    const photonCount = 16;
    const photonGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const photons1: THREE.Mesh[] = [];
    const photons2: THREE.Mesh[] = [];

    for (let i = 0; i < photonCount; i++) {
      const p1 = new THREE.Mesh(photonGeo, new THREE.MeshBasicMaterial({ color: 0xff3366 }));
      boardGroup.add(p1);
      photons1.push(p1);

      const p2 = new THREE.Mesh(photonGeo, new THREE.MeshBasicMaterial({ color: 0x00f5d4 }));
      boardGroup.add(p2);
      photons2.push(p2);
    }

    // 5. Volumetric Laser Diagnostic Plane
    const laserGeo = new THREE.PlaneGeometry(8.6, 6.0);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide
    });
    const laser = new THREE.Mesh(laserGeo, laserMat);
    laser.rotation.x = Math.PI / 2;
    scene.add(laser);

    // Mouse Parallax & Raycasting
    let mouseX = 0;
    let mouseY = 0;
    let isHovering = false;
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseVector.x = mouseX;
      mouseVector.y = mouseY;
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

      const interactiveMeshes = Object.values(chipMeshes).map((c) => c.mesh);
      const intersects = raycaster.intersectObjects(interactiveMeshes, false);

      if (intersects.length > 0) {
        const clickedChipId = intersects[0].object.userData.chipId;
        if (clickedChipId) {
          setSelectedChipId(clickedChipId);
        }
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('click', handleClick);

    let animId: number;
    const clock = new THREE.Clock();
    const currentCamLook = new THREE.Vector3(0, 0, 0);

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const state = sceneStateRef.current;

      // 1. Smooth Camera Transition
      const targetPos = state.targetCamPos;
      const targetLook = state.targetCamLook;

      if (isHovering && cameraPreset === 'ISOMETRIC') {
        camera.position.x += (targetPos.x + mouseX * 1.5 - camera.position.x) * 0.05;
        camera.position.y += (targetPos.y + mouseY * 1.0 - camera.position.y) * 0.05;
        camera.position.z += (targetPos.z - camera.position.z) * 0.05;
      } else {
        camera.position.lerp(targetPos, 0.05);
      }

      currentCamLook.lerp(targetLook, 0.05);
      camera.lookAt(currentCamLook);

      // 2. Material Swap depending on Visual Mode
      const isThermal = state.visualMode === 'THERMAL';
      pcb.material = isThermal ? pcbThermalMat : pcbCyberMat;

      Object.entries(chipMeshes).forEach(([id, chipItem]) => {
        chipItem.mesh.material = isThermal ? chipItem.thermalMat : chipItem.cyberMat;
      });

      // 3. Selection Halo Position
      const selectedChipItem = chipMeshes[state.selectedChipId];
      if (selectedChipItem) {
        selectionHalo.position.x = selectedChipItem.position.x;
        selectionHalo.position.z = selectedChipItem.position.z;
        selectionHalo.scale.setScalar(1.0 + Math.sin(time * 4) * 0.05);
        haloMat.color.setHex(state.selectedChipId === 'ble' ? 0xff3366 : 0x00f5d4);
      }

      // 4. Pulse RF Wave around BLE
      const ringScale = 1.0 + (time % 1.6) * 0.7;
      rfRing.scale.set(ringScale, ringScale, ringScale);
      rfRingMat.opacity = Math.max(0, 0.8 - (time % 1.6) * 0.5);

      // 5. Sweep Diagnostic Laser
      laser.position.y = Math.sin(time * 1.8) * 1.4 + 0.6;
      laserMat.opacity = isThermal ? 0.08 : 0.2;

      // 6. Blink Status LEDs
      leds.forEach((led, idx) => {
        if (idx === 1) {
          // Power LED: Solid
          led.mat.opacity = 0.95;
        } else if (idx === 0) {
          // Heartbeat LED: Sinusoidal breathe
          led.mat.opacity = 0.3 + 0.7 * Math.sin(time * 4);
        } else if (idx === 2) {
          // RX/TX: Erratic pseudo-random blink
          led.mat.opacity = Math.sin(time * 14 + idx) > 0 ? 0.9 : 0.15;
        } else if (idx === 3) {
          // Alert LED: Rapid strobe if tainted chip selected
          led.mat.opacity = state.selectedChipId === 'ble' ? (Math.sin(time * 20) > 0 ? 1.0 : 0.0) : 0.2;
        }
      });

      // 7. Update Traveling Photons
      photons1.forEach((p, idx) => {
        const progress = ((time * 0.6 + idx / photonCount) % 1.0);
        const pt = curveBleMcu.getPointAt(progress);
        p.position.copy(pt);
      });

      photons2.forEach((p, idx) => {
        const progress = ((time * 0.8 + idx / photonCount) % 1.0);
        const pt = curveMcuFlash.getPointAt(progress);
        p.position.copy(pt);
      });

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
      cancelAnimationFrame(animId);
      if (domElement.parentNode) {
        domElement.parentNode.removeChild(domElement);
      }
      renderer.dispose();
    };
  }, [cameraPreset]);

  return (
    <div className="w-full flex flex-col lg:flex-row gap-4 font-mono">
      {/* 3D Board Canvas */}
      <div className="flex-1 glass-panel p-4 rounded-2xl relative min-h-[460px] overflow-hidden border border-cyber-cyan/30 flex flex-col">
        {/* Top Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 z-10 mb-2">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${visualMode === 'THERMAL' ? 'bg-orange-500 animate-ping' : 'bg-cyber-cyan animate-pulse'}`} />
            <span className="text-xs font-bold text-white tracking-wider">
              {visualMode === 'THERMAL' ? 'FLIR INFRARED THERMAL TELEMETRY' : '3D HARDWARE DIGITAL TWIN'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Visual Mode Switcher */}
            <div className="flex items-center bg-cyber-bg/80 p-0.5 rounded-lg border border-cyber-border text-[11px]">
              <button
                onClick={() => setVisualMode('CYBER')}
                className={`px-2.5 py-1 rounded transition-all font-bold ${
                  visualMode === 'CYBER' ? 'bg-cyber-cyan text-cyber-bg shadow-[0_0_8px_rgba(0,245,212,0.4)]' : 'text-slate-400 hover:text-white'
                }`}
              >
                Cyber Bus
              </button>
              <button
                onClick={() => setVisualMode('THERMAL')}
                className={`px-2.5 py-1 rounded transition-all font-bold ${
                  visualMode === 'THERMAL' ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-[0_0_8px_rgba(249,115,22,0.5)]' : 'text-slate-400 hover:text-white'
                }`}
              >
                FLIR Thermal
              </button>
            </div>

            {/* Camera View Preset Switcher */}
            <div className="hidden sm:flex items-center bg-cyber-bg/80 p-0.5 rounded-lg border border-cyber-border text-[11px]">
              <button
                onClick={() => setCameraPreset('ISOMETRIC')}
                className={`px-2 py-1 rounded transition-all ${cameraPreset === 'ISOMETRIC' ? 'bg-cyber-surface text-cyber-cyan font-bold' : 'text-slate-400'}`}
              >
                Iso
              </button>
              <button
                onClick={() => setCameraPreset('TOP_DOWN')}
                className={`px-2 py-1 rounded transition-all ${cameraPreset === 'TOP_DOWN' ? 'bg-cyber-surface text-cyber-cyan font-bold' : 'text-slate-400'}`}
              >
                Top
              </button>
              <button
                onClick={() => setCameraPreset('SOC_MACRO')}
                className={`px-2 py-1 rounded transition-all ${cameraPreset === 'SOC_MACRO' ? 'bg-cyber-surface text-cyber-cyan font-bold' : 'text-slate-400'}`}
              >
                SoC
              </button>
              <button
                onClick={() => setCameraPreset('RF_VECTOR')}
                className={`px-2 py-1 rounded transition-all ${cameraPreset === 'RF_VECTOR' ? 'bg-cyber-surface text-cyber-cyan font-bold' : 'text-slate-400'}`}
              >
                RF
              </button>
            </div>
          </div>
        </div>

        {/* 3D Viewport */}
        <div ref={containerRef} className="flex-1 w-full h-full min-h-[380px] cursor-pointer" />

        {/* Overlay Chip Quick-Selector Buttons & Telemetry Bar */}
        <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="flex flex-wrap gap-2 pointer-events-auto">
            {Object.values(chips).map((chip) => (
              <button
                key={chip.id}
                onClick={() => setSelectedChipId(chip.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedChipId === chip.id
                    ? 'bg-cyber-cyan text-cyber-bg shadow-[0_0_12px_rgba(0,245,212,0.5)]'
                    : chip.status === 'TAINTED'
                    ? 'bg-cyber-rose/20 text-cyber-rose border border-cyber-rose/40'
                    : 'bg-cyber-surface/90 text-slate-300 border border-cyber-border hover:border-cyber-cyan/50'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    chip.status === 'TAINTED' ? 'bg-cyber-rose animate-ping' : 'bg-cyber-cyan'
                  }`}
                />
                {chip.name.split(' ')[0]} ({chip.tempC}°C)
              </button>
            ))}
          </div>

          <div className="text-[10px] text-cyber-muted bg-cyber-bg/80 px-2.5 py-1 rounded border border-cyber-border/40 backdrop-blur-sm pointer-events-auto">
            Click chips to inspect &bull; Drag to tilt
          </div>
        </div>
      </div>

      {/* Selected Chip Real-Time Telemetry Inspector */}
      {selectedChip && (
        <div className="w-full lg:w-84 glass-panel p-5 rounded-2xl flex flex-col gap-3 border border-cyber-border">
          <div className="flex items-center justify-between border-b border-cyber-border/40 pb-2">
            <span className="text-xs font-bold text-white">HARDWARE CHIP TELEMETRY</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                selectedChip.status === 'TAINTED'
                  ? 'bg-cyber-rose/20 text-cyber-rose border border-cyber-rose/40 animate-pulse'
                  : 'bg-cyber-emerald/20 text-cyber-emerald border border-cyber-emerald/40'
              }`}
            >
              {selectedChip.status}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-cyber-cyan">{selectedChip.name}</h4>
              <span className={`text-xs font-bold font-mono ${selectedChip.tempC > 80 ? 'text-cyber-rose animate-pulse' : 'text-orange-400'}`}>
                {selectedChip.tempC}°C
              </span>
            </div>
            <p className="text-[11px] text-cyber-muted mt-0.5 leading-tight">{selectedChip.role}</p>
          </div>

          {/* Thermal meter bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>THERMAL LOAD</span>
              <span>{Math.round((selectedChip.tempC / 100) * 100)}% TJMax</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  selectedChip.tempC > 80
                    ? 'bg-gradient-to-r from-orange-500 to-rose-500'
                    : 'bg-gradient-to-r from-cyber-cyan to-amber-400'
                }`}
                style={{ width: `${Math.min(100, (selectedChip.tempC / 100) * 100)}%` }}
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-cyber-border/30 text-xs flex-1 overflow-y-auto">
            {Object.entries(selectedChip.telemetry).map(([key, val]) => {
              const isAlert = val.includes('Fault') || val.includes('Corrupted') || val.includes('CRITICAL') || val.includes('Hijacked');
              return (
                <div key={key} className="p-2.5 rounded bg-cyber-surface/70 border border-cyber-border/40">
                  <div className="text-[10px] text-cyber-muted tracking-wider">{key.toUpperCase()}</div>
                  <div className={`font-mono text-[11px] mt-0.5 ${isAlert ? 'text-cyber-rose font-bold' : 'text-slate-200'}`}>
                    {val}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
