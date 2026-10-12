'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface AuthHologramCoreProps {
  className?: string;
  securityStatus?: 'SECURE' | 'AUTHENTICATING' | 'GRANTED';
}

export default function AuthHologramCore({
  className = '',
  securityStatus = 'SECURE'
}: AuthHologramCoreProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06090e, 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.2);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. Cyber Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x00f5d4, 3, 20);
    cyanLight.position.set(3, 3, 3);
    scene.add(cyanLight);

    const violetLight = new THREE.PointLight(0xa855f7, 2.5, 20);
    violetLight.position.set(-3, -3, 2);
    scene.add(violetLight);

    // 4. Central Hologram Group
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Central Security Core (Wireframe Icosahedron)
    const coreGeo = new THREE.IcosahedronGeometry(1.2, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x00f5d4,
      wireframe: true,
      emissive: 0x00f5d4,
      emissiveIntensity: 0.6,
      roughness: 0.2
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(coreMesh);

    // Inner Glowing Solid Diamond
    const innerGeo = new THREE.OctahedronGeometry(0.7, 0);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x7b2cbf,
      emissive: 0x7b2cbf,
      emissiveIntensity: 0.9,
      metalness: 0.8,
      roughness: 0.1
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerMesh);

    // Outer Orbital Rings (FIDO2 / Cryptographic Boundary)
    const ringGeo1 = new THREE.RingGeometry(2.0, 2.03, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    coreGroup.add(ring1);

    const ringGeo2 = new THREE.RingGeometry(2.4, 2.42, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = Math.PI / 3;
    ring2.rotation.y = Math.PI / 4;
    coreGroup.add(ring2);

    // Swarm Particles (Quantum Token Dust)
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 2.5 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      particlePositions[i] = radius * Math.cos(phi) * Math.cos(theta);
      particlePositions[i + 1] = radius * Math.sin(phi);
      particlePositions[i + 2] = radius * Math.cos(phi) * Math.sin(theta);
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00f5d4,
      size: 0.04,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    coreGroup.add(particleSystem);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Dynamic Rotation
      coreMesh.rotation.x = elapsed * 0.3;
      coreMesh.rotation.y = elapsed * 0.4;

      innerMesh.rotation.x = -elapsed * 0.5;
      innerMesh.rotation.y = -elapsed * 0.6;

      ring1.rotation.z = elapsed * 0.2;
      ring2.rotation.z = -elapsed * 0.25;

      particleSystem.rotation.y = elapsed * 0.1;

      // Status Reaction
      if (securityStatus === 'AUTHENTICATING') {
        const pulse = Math.sin(elapsed * 8) * 0.15 + 1.1;
        coreGroup.scale.setScalar(pulse);
      } else {
        coreGroup.scale.setScalar(1.0);
      }

      renderer.render(scene, camera);
    };

    animate();

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
  }, [securityStatus]);

  return (
    <div className={`relative w-full h-full flex items-center justify-center pointer-events-none ${className}`}>
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
}
