'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function ThreatRadarGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Wireframe Globe
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const globeGeo = new THREE.SphereGeometry(2.4, 28, 28);
    const globeMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    globeGroup.add(globe);

    // Inner Core Glow
    const coreGeo = new THREE.SphereGeometry(1.6, 20, 20);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x7b2cbf,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(core);

    // Orbit Radar Rings
    const ringGeo1 = new THREE.RingGeometry(2.9, 2.95, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 2.5;
    globeGroup.add(ring1);

    const ringGeo2 = new THREE.RingGeometry(3.3, 3.35, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xff3366,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 3;
    globeGroup.add(ring2);

    // Vulnerability Threat Incident Pins
    const pinCoords = [
      { lat: 37.77, lon: -122.41, type: 'CRITICAL', label: 'BLE Overflow' },
      { lat: 51.50, lon: -0.12, type: 'HIGH', label: 'SUID Injection' },
      { lat: 35.68, lon: 139.69, type: 'CRITICAL', label: 'Hardcoded Key' },
      { lat: 1.35, lon: 103.81, type: 'MEDIUM', label: 'PQC Migration Gap' },
      { lat: -33.86, lon: 151.20, type: 'HIGH', label: 'Telnet Backdoor' }
    ];

    const pinGroup = new THREE.Group();
    globeGroup.add(pinGroup);

    pinCoords.forEach((pin) => {
      const phi = (90 - pin.lat) * (Math.PI / 180);
      const theta = (pin.lon + 180) * (Math.PI / 180);
      const radius = 2.45;

      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);

      const markerGeo = new THREE.SphereGeometry(0.08, 12, 12);
      const markerMat = new THREE.MeshBasicMaterial({
        color: pin.type === 'CRITICAL' ? 0xff3366 : pin.type === 'HIGH' ? 0xf59e0b : 0x00f5d4
      });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.set(x, y, z);
      pinGroup.add(marker);
    });

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      globeGroup.rotation.y += 0.006;
      globeGroup.rotation.x = 0.2;
      ring1.rotation.z += 0.01;
      ring2.rotation.z -= 0.008;
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
      window.removeEventListener('resize', handleResize);
      const domElement = renderer.domElement;
      if (domElement && domElement.parentNode) {
        domElement.parentNode.removeChild(domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[320px] rounded-xl glass-panel overflow-hidden">
      <div className="absolute top-3 left-3 z-10 font-mono text-xs text-cyber-cyan flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-cyber-rose animate-ping" />
        GLOBAL FLEET THREAT RADAR
      </div>
      <div className="absolute bottom-3 left-3 z-10 font-mono text-[10px] text-cyber-muted space-y-0.5">
        <div>AUTONOMOUS TELEMETRY: <span className="text-cyber-cyan">CONNECTED</span></div>
        <div>CORRELATED ANOMALIES: <span className="text-cyber-rose font-bold">14 ACTIVE</span></div>
      </div>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
