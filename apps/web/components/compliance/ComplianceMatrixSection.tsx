'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FileCheck, Shield, CheckCircle2, ArrowUpRight, Download, FileText, Lock, Globe } from 'lucide-react';

type TabKey = 'EU_CRA' | 'NIST_SSDF' | 'ISO_21434';

interface ComplianceDetail {
  title: string;
  subtitle: string;
  standard: string;
  score: number;
  mandateDate: string;
  tags: string[];
  requirements: { id: string; name: string; status: 'COMPLIANT' | 'AUTOMATED' | 'VERIFIED' }[];
  codePreview: string;
}

const COMPLIANCE_DATA: Record<TabKey, ComplianceDetail> = {
  EU_CRA: {
    title: 'EU Cyber Resilience Act (CRA)',
    subtitle: 'Automated CycloneDX 1.5 SBOM & Real-Time VEX Reachability',
    standard: 'Regulation (EU) 2024/2847',
    score: 96,
    mandateDate: 'Mandatory 2026/2027',
    tags: ['CycloneDX 1.5', 'VEX Justifications', 'Exploit Reachability', 'Post-Quantum Crypto'],
    requirements: [
      { id: 'CRA-REQ-01', name: 'Machine-readable Software Bill of Materials (SBOM)', status: 'COMPLIANT' },
      { id: 'CRA-REQ-02', name: 'Automated Vulnerability Exploitability eXchange (VEX)', status: 'AUTOMATED' },
      { id: 'CRA-REQ-03', name: 'Security by Design: Stripped debug interfaces in production', status: 'VERIFIED' },
      { id: 'CRA-REQ-04', name: 'Post-Quantum Cryptography (PQC) readiness audit', status: 'COMPLIANT' }
    ],
    codePreview: `{
  "bomFormat": "CycloneDX",
  "specVersion": "1.5",
  "serialNumber": "urn:uuid:3e670404-6338-4e58-9be5-472146f3c11d",
  "version": 1,
  "vulnerabilities": [
    {
      "id": "SF-ZERO-2026-001",
      "analysis": {
        "state": "affected",
        "justification": "vulnerable_code_in_execute_path",
        "response": ["can_be_mitigated_via_virtual_patch"]
      }
    }
  ]
}`
  },
  NIST_SSDF: {
    title: 'NIST SP 800-218 (SSDF) & NIST IR 8259A',
    subtitle: 'Cryptographic Provenance Attestation & Binary Execution Traces',
    standard: 'Secure Software Development Framework v1.1',
    score: 94,
    mandateDate: 'US Federal Mandate EO 14028',
    tags: ['Owner Certified Attestation', 'Deterministic Builds', 'Signed Binary Traces', 'Zero-Trust Pipeline'],
    requirements: [
      { id: 'PO.3.1', name: 'Follow secure coding practices & sanitize memory copy routines', status: 'VERIFIED' },
      { id: 'PS.1.1', name: 'Store software releases with verifiable cryptographic hashes', status: 'COMPLIANT' },
      { id: 'PW.4.1', name: 'Acquire verifiable evidence of firmware authorization (Attestation)', status: 'COMPLIANT' },
      { id: 'RV.1.1', name: 'Identify and remediate zero-day vulnerabilities in third-party code', status: 'AUTOMATED' }
    ],
    codePreview: `{
  "attestation": {
    "standard": "NIST SP 800-218 PO.3.1",
    "testerAuthorization": "OWNER_CERTIFIED",
    "signatureAlgorithm": "Ed25519-SHA512",
    "provenanceHash": "sha256:7a4192b947c92b23a101b4e207921...",
    "complianceStatus": "VERIFIED_DEFENSIVE_AUDIT"
  }
}`
  },
  ISO_21434: {
    title: 'ISO/SAE 21434 & UN R155',
    subtitle: 'Automotive Embedded Firmware Threat Analysis & Risk Assessment (TARA)',
    standard: 'Road Vehicles Cybersecurity Engineering',
    score: 91,
    mandateDate: 'UN ECE R155 Mandatory Worldwide',
    tags: ['TARA Methodology', 'CAN Bus Ingress', 'AUTOSAR Classic', 'TriCore/ARM Cortex-R'],
    requirements: [
      { id: 'RQ-09-01', name: 'Cybersecurity goals for ECU communications (CAN-FD, Ethernet)', status: 'COMPLIANT' },
      { id: 'RQ-09-02', name: 'Threat scenario identification via attack-path Dijkstra modeling', status: 'AUTOMATED' },
      { id: 'RQ-10-01', name: 'Vulnerability analysis & greybox fuzzing of diagnostic services', status: 'VERIFIED' },
      { id: 'RQ-10-03', name: 'Hardware security module (HSM) secure boot verification', status: 'COMPLIANT' }
    ],
    codePreview: `{
  "taraAssessment": {
    "standard": "ISO/SAE 21434:2021",
    "threatVector": "DIAGNOSTIC_UDS_OVER_CAN",
    "impactRating": "CRITICAL_SAFETY_LEVEL_ASIL_D",
    "attackFeasibility": "ENHANCED_EQUIPMENT_REQUIRED",
    "remediationAction": "FLASH_VIRTUAL_HOTPATCH_TC397"
  }
}`
  }
};

export default function ComplianceMatrixSection() {
  const [activeTab, setActiveTab] = useState<TabKey>('EU_CRA');
  const data = COMPLIANCE_DATA[activeTab];

  return (
    <section id="compliance" className="relative py-16 sm:py-24 border-t border-zinc-border/60 bg-void-900/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Heading */}
        <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-void-900 border border-zinc-border text-xs font-mono text-neon-emerald mb-3">
            <Globe className="w-3.5 h-3.5" />
            REGULATORY GOVERNANCE ENGINE
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-heading text-white tracking-tight">
            Enterprise Compliance Matrix
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-400 font-sans max-w-2xl">
            Automate regulatory audit evidence for the EU Cyber Resilience Act, NIST SSDF, and Automotive ISO/SAE 21434.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-full bg-void-950 border border-zinc-border font-mono text-xs">
            <button
              onClick={() => setActiveTab('EU_CRA')}
              className={`px-4 sm:px-6 py-2 rounded-full font-bold transition-all ${
                activeTab === 'EU_CRA'
                  ? 'bg-neon-cyan text-void-950 shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              EU CRA (CycloneDX)
            </button>
            <button
              onClick={() => setActiveTab('NIST_SSDF')}
              className={`px-4 sm:px-6 py-2 rounded-full font-bold transition-all ${
                activeTab === 'NIST_SSDF'
                  ? 'bg-neon-cyan text-void-950 shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              NIST SP 800-218
            </button>
            <button
              onClick={() => setActiveTab('ISO_21434')}
              className={`px-4 sm:px-6 py-2 rounded-full font-bold transition-all ${
                activeTab === 'ISO_21434'
                  ? 'bg-neon-cyan text-void-950 shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Automotive ISO 21434
            </button>
          </div>
        </div>

        {/* Tab Content Card */}
        <div className="rounded-3xl border border-zinc-border bg-void-950/80 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Requirements & Scorecard (lg:col-span-7) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div>
                <div className="flex items-center gap-2 font-mono text-xs text-neon-cyan mb-1">
                  <span>{data.standard}</span>
                  <span className="text-zinc-600">&bull;</span>
                  <span>{data.mandateDate}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold font-heading text-white">
                  {data.title}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-zinc-400 font-sans">
                  {data.subtitle}
                </p>
              </div>

              {/* Tag Pills */}
              <div className="flex flex-wrap gap-2">
                {data.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg bg-void-900 border border-zinc-border text-[11px] font-mono text-zinc-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Requirement Checklist */}
              <div className="space-y-2.5 pt-2 font-mono text-xs">
                {data.requirements.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-xl bg-void-900/80 border border-zinc-border/70 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-neon-emerald shrink-0" />
                      <span className="text-zinc-200">{req.name}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-neon-emerald/10 border border-neon-emerald/30 text-neon-emerald font-bold shrink-0">
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center gap-4">
                <Link
                  href="/sbom-vex"
                  className="px-5 py-2.5 rounded-full bg-neon-cyan text-void-950 font-mono font-bold text-xs hover:bg-neon-cyan/90 transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)] flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Inspect Live SBOM (CycloneDX)</span>
                </Link>
                <Link
                  href="/reports"
                  className="px-5 py-2.5 rounded-full bg-void-900 border border-zinc-border text-zinc-300 hover:text-white font-mono text-xs transition-colors flex items-center gap-2"
                >
                  <span>Full Compliance Scorecard</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Column: Automated Specification Export Code Preview (lg:col-span-5) */}
            <div className="lg:col-span-5 rounded-2xl bg-void-900 border border-zinc-border overflow-hidden font-mono text-xs shadow-xl">
              <div className="px-4 py-3 border-b border-zinc-border/60 bg-void-950/80 flex items-center justify-between text-[11px] text-zinc-400">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <FileCheck className="w-3.5 h-3.5 text-neon-cyan" />
                  AUTOMATED AUDIT ARTIFACT
                </span>
                <span className="text-neon-emerald font-bold">SCORE: {data.score}%</span>
              </div>
              <div className="p-4 bg-void-950/60 overflow-x-auto text-[11px] leading-relaxed text-zinc-300">
                <pre>{data.codePreview}</pre>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
