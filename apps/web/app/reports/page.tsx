'use client';

import React from 'react';

export default function ReportsPage() {
  const frameworks = [
    {
      title: 'MITRE EMB3D Threat Model',
      score: 82,
      tag: 'EMBEDDED THREAT TAXONOMY',
      color: 'border-cyber-purple/40 bg-cyber-purple/5 text-cyber-purple',
      items: [
        { id: 'EMB3D-T0014', name: 'Unchecked Buffer in Radio Protocol Parser', status: 'CRITICAL FAIL', desc: 'BLE packet stack overflow in libble_protocol_core.so' },
        { id: 'EMB3D-T0022', name: 'Privilege Escalation via SUID Binary', status: 'HIGH FAIL', desc: 'Command injection in /bin/nvram_set' },
        { id: 'EMB3D-T0008', name: 'Hardcoded Cryptographic Secrets', status: 'HIGH FAIL', desc: 'Private RSA key in /etc/ssl/gateway.key' },
        { id: 'EMB3D-T0035', name: 'Inadequate Cryptographic Algorithm (PQC Gap)', status: 'MEDIUM WARN', desc: 'Legacy RSA-2048 lacking ML-KEM migration' }
      ]
    },
    {
      title: 'OWASP Firmware Security Testing Methodology (FSTM)',
      score: 78,
      tag: 'PIPELINE METHODOLOGY',
      color: 'border-cyber-cyan/40 bg-cyber-cyan/5 text-cyber-cyan',
      items: [
        { id: 'FSTM-STAGE-01', name: 'Information Gathering & Header Analysis', status: 'PASS', desc: 'Complete uImage and SquashFS layout extracted' },
        { id: 'FSTM-STAGE-02', name: 'Firmware Extraction & Unpacking', status: 'PASS', desc: '842 inodes decompressed via unblob' },
        { id: 'FSTM-STAGE-03', name: 'Static Secret & YARA Scanning', status: 'FAIL', desc: 'Universal TLS key flagged' },
        { id: 'FSTM-STAGE-05', name: 'Symbolic Execution & Dynamic Fuzzing', status: 'FAIL', desc: 'AFL++ identified reachable crash in BLE handler' }
      ]
    },
    {
      title: 'NIST IR 8259A / 8425 & ETSI EN 303 645',
      score: 68,
      tag: 'CONSUMER & IOT BASELINES',
      color: 'border-cyber-amber/40 bg-cyber-amber/5 text-cyber-amber',
      items: [
        { id: 'NIST-4.1.1', name: 'Device Identification (Unique Credentials)', status: 'FAIL', desc: 'Hardcoded RSA key shared across units' },
        { id: 'NIST-4.1.2', name: 'Protect Logical Interfaces', status: 'FAIL', desc: 'Unauthenticated BLE buffer overflow' },
        { id: 'NIST-4.1.3', name: 'Software Update Integrity', status: 'PASS', desc: 'U-Boot signature verification enforced' },
        { id: 'ETSI-5.1-1', name: 'No Universal Default Passwords', status: 'FAIL', desc: 'Telnet backdoor default credential' }
      ]
    },
    {
      title: 'IEC 62443-4-2 & PQC Post-Quantum Readiness',
      score: 58,
      tag: 'INDUSTRIAL OT & PQC AUDIT',
      color: 'border-cyber-rose/40 bg-cyber-rose/5 text-cyber-rose',
      items: [
        { id: 'IEC-CR-2.1', name: 'Least Privilege Separation', status: 'FAIL', desc: 'SUID helper executes as root' },
        { id: 'IEC-CR-3.5', name: 'Input Validation & Boundary Checking', status: 'FAIL', desc: 'Unchecked packet length header in memcpy' },
        { id: 'PQC-AUDIT-01', name: 'NIST PQC Migration (ML-KEM / ML-DSA)', status: 'WARN', desc: 'Classical RSA-2048 keys require hybrid dual-signature upgrade' }
      ]
    }
  ];

  return (
    <div className="flex flex-col gap-6 font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-cyber-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-purple animate-pulse" />
            <h1 className="text-xl font-bold text-white">STANDARDS & CERTIFICATION COMPLIANCE HUB</h1>
          </div>
          <p className="text-xs text-cyber-muted">
            Ground-Truth Framework Mapping &bull; OWASP FSTM, MITRE EMB3D, NIST IR 8259A, ETSI EN 303 645, IEC 62443, NIST PQC
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-1.5 rounded-lg bg-cyber-cyan text-cyber-bg font-bold text-xs hover:bg-cyber-cyan/90 transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,245,212,0.25)]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Formal Audit Report
        </button>
      </div>

      {/* Compliance Scorecard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {frameworks.map((f, idx) => (
          <div key={idx} className={`glass-panel p-5 rounded-2xl border ${f.color} flex flex-col justify-between gap-4 cyber-liquid-border cyber-hover-lift shadow-xl`}>
            <div>
              <div className="flex items-center justify-between border-b border-cyber-border/40 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider">{f.tag}</span>
                  <h3 className="text-sm font-bold text-white">{f.title}</h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{f.score}%</div>
                  <div className="text-[10px] text-cyber-muted">Readiness Score</div>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                {f.items.map((item, iIdx) => {
                  const isFail = item.status.includes('FAIL');
                  const isWarn = item.status.includes('WARN');
                  return (
                    <div key={iIdx} className="p-2.5 rounded-lg bg-cyber-surface/70 border border-cyber-border/40 flex flex-col gap-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-bold">{item.id}: {item.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isFail
                              ? 'bg-cyber-rose/20 text-cyber-rose border border-cyber-rose/40'
                              : isWarn
                              ? 'bg-cyber-amber/20 text-cyber-amber border border-cyber-amber/40'
                              : 'bg-cyber-emerald/20 text-cyber-emerald border border-cyber-emerald/40'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-cyber-muted">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
