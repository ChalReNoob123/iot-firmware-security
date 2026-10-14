'use client';

import React from 'react';
import HeroSection from '@/components/hero/HeroSection';
import IndustrialVulnerabilityEngine from '@/components/vulnerability/IndustrialVulnerabilityEngine';
import FirmwareDropzoneTerminal from '@/components/dropzone/FirmwareDropzoneTerminal';
import BentoCapabilitiesGrid from '@/components/bento/BentoCapabilitiesGrid';
import AttackBlastRadiusSimulator from '@/components/simulator/AttackBlastRadiusSimulator';
import ComplianceMatrixSection from '@/components/compliance/ComplianceMatrixSection';

export default function LandingPage() {
  return (
    <div className="relative w-full flex flex-col bg-void-950 text-zinc-100 overflow-hidden">
      {/* Subtle Film Grain Noise Texture Overlay */}
      <div className="fixed inset-0 bg-grain pointer-events-none z-30 opacity-30" />

      {/* Hero Section (Kinetic Typography & Spatial 3D SoC Chip) */}
      <HeroSection />

      {/* Industrial Real-World Vulnerability Detector & Exploit Call-Chain Engine */}
      <IndustrialVulnerabilityEngine />

      {/* Interactive Firmware Dropzone (Tactile Simulation) */}
      <FirmwareDropzoneTerminal />

      {/* The Bento Grid Architecture (Capabilities Breakdown) */}
      <BentoCapabilitiesGrid />

      {/* Attack Blast Radius & Lateral Chain Simulator */}
      <AttackBlastRadiusSimulator />

      {/* Enterprise Compliance Matrix (EU CRA / NIST SSDF / ISO 21434) */}
      <ComplianceMatrixSection />
    </div>
  );
}
