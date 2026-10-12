'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

// Register GSAP ScrollTrigger plugin safely client-side
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface Props {
  sceneUrl?: string;
  className?: string;
}

/**
 * Spline & Three.js Hybrid 3D Canvas
 * Supports loading interactive scenes with smooth GSAP ScrollTrigger camera interpolation.
 */
export default function SplineThreeViewer({ className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 3, 10);

    // Renderer with high performance settings
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lights
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f5d4, 3.0);
    dirLight.position.set(8, 15, 10);
    scene.add(dirLight);

    const violetLight = new THREE.DirectionalLight(0xa855f7, 2.5);
    violetLight.position.set(-8, -5, -8);
    scene.add(violetLight);

    // 3D Object Group (Interactive IoT Core Asset)
    const meshGroup = new THREE.Group();
    scene.add(meshGroup);

    // Outer Cyber Crystal Ring
    const torusGeo = new THREE.TorusGeometry(2.5, 0.15, 16, 100);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0x00f5d4,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x00332c
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.rotation.x = Math.PI / 3;
    meshGroup.add(torus);

    // Central Floating Core Node (Octahedron)
    const coreGeo = new THREE.OctahedronGeometry(1.4, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x7b2cbf,
      metalness: 0.8,
      roughness: 0.2,
      wireframe: false
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    meshGroup.add(core);

    // Outer Wireframe Cage
    const cageGeo = new THREE.IcosahedronGeometry(2.0, 1);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const cage = new THREE.Mesh(cageGeo, cageMat);
    meshGroup.add(cage);

    // Floating Data Particle Cloud
    const particleCount = 150;
    const particleGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 8;
      pos[i + 1] = (Math.random() - 0.5) * 8;
      pos[i + 2] = (Math.random() - 0.5) * 8;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00f5d4,
      size: 0.05,
      transparent: true,
      opacity: 0.8
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // GSAP ScrollTrigger Integration: Tie Scroll Position to 3D Camera Transforms
    const scrollAnimation = gsap.to(camera.position, {
      x: 4,
      y: 1.5,
      z: 6,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.2
      }
    });

    const rotationAnimation = gsap.to(meshGroup.rotation, {
      y: Math.PI * 2,
      x: Math.PI / 4,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5
      }
    });

    // Render Animation Loop
    let reqId: number;
    const clock = new THREE.Clock();

    const render = () => {
      reqId = requestAnimationFrame(render);
      const time = clock.getElapsedTime();

      core.rotation.y = time * 0.5;
      core.rotation.z = time * 0.3;
      cage.rotation.y = -time * 0.2;
      torus.rotation.z = time * 0.4;
      particles.rotation.y = time * 0.05;

      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };

    render();

    // Resize Observer
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
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(reqId);
      scrollAnimation.kill();
      rotationAnimation.kill();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none ${className}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
