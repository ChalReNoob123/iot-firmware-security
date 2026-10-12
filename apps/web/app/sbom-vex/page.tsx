'use client';

import React, { useState } from 'react';
import { SBOMComponent } from '@sentinelforge/shared-types';

export default function SbomVexPage() {
  const [components, setComponents] = useState<SBOMComponent[]>([
    {
      bomRef: 'pkg:generic/libble_protocol_core@2.4.1',
      name: 'libble_protocol_core',
      version: '2.4.1',
      type: 'library',
      purl: 'pkg:generic/libble_protocol_core@2.4.1',
      cpe: 'cpe:2.3:a:iot_vendor:libble_protocol_core:2.4.1:*:*:*:*:*:*:*',
      license: 'Proprietary / Vendor SDK',
      vulnerabilitiesCount: 1,
      vexStatus: 'affected',
      pqcReadiness: 'NO_CRYPTO'
    },
    {
      bomRef: 'pkg:generic/busybox@1.33.1',
      name: 'busybox',
      version: '1.33.1',
      type: 'application',
      purl: 'pkg:generic/busybox@1.33.1',
      cpe: 'cpe:2.3:a:busybox:busybox:1.33.1:*:*:*:*:*:*:*',
      license: 'GPL-2.0-only',
      vulnerabilitiesCount: 1,
      vexStatus: 'not_affected',
      pqcReadiness: 'NO_CRYPTO'
    },
    {
      bomRef: 'pkg:generic/openssl@1.1.1w',
      name: 'openssl',
      version: '1.1.1w',
      type: 'library',
      purl: 'pkg:generic/openssl@1.1.1w',
      cpe: 'cpe:2.3:a:openssl:openssl:1.1.1w:*:*:*:*:*:*:*',
      license: 'Apache-2.0',
      vulnerabilitiesCount: 2,
      vexStatus: 'affected',
      pqcReadiness: 'LEGACY_VULNERABLE'
    },
    {
      bomRef: 'pkg:generic/dropbear@2020.81',
      name: 'dropbear',
      version: '2020.81',
      type: 'application',
      purl: 'pkg:generic/dropbear@2020.81',
      cpe: 'cpe:2.3:a:matt_johnston:dropbear_ssh_server:2020.81:*:*:*:*:*:*:*',
      license: 'MIT',
      vulnerabilitiesCount: 0,
      vexStatus: 'not_affected',
      pqcReadiness: 'LEGACY_VULNERABLE'
    },
    {
      bomRef: 'pkg:generic/liboqs@0.9.0',
      name: 'liboqs (Post-Quantum Crypto)',
      version: '0.9.0',
      type: 'library',
      purl: 'pkg:generic/liboqs@0.9.0',
      cpe: 'cpe:2.3:a:openquantumsafe:liboqs:0.9.0:*:*:*:*:*:*:*',
      license: 'MIT',
      vulnerabilitiesCount: 0,
      vexStatus: 'not_affected',
      pqcReadiness: 'PQC_READY'
    }
  ]);

  const [selectedVexStatus, setSelectedVexStatus] = useState<string>('ALL');

  const filtered = selectedVexStatus === 'ALL'
    ? components
    : components.filter((c) => c.vexStatus === selectedVexStatus);

  const downloadJson = () => {
    const data = {
      bomFormat: 'CycloneDX',
      specVersion: '1.5',
      serialNumber: 'urn:uuid:3e671687-395b-41f5-a30f-a58921a69b79',
      version: 1,
      metadata: {
        timestamp: new Date().toISOString(),
        component: {
          name: 'Edge-Shield Gateway GW-800 Firmware',
          version: '2.4.1',
          type: 'firmware'
        }
      },
      components
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cyclonedx_sbom_sentinelforge.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="flex flex-col gap-6 font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-cyber-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-cyan animate-pulse" />
            <h1 className="text-xl font-bold text-white">CYCLONEDX 1.5 SBOM & CISA VEX MANAGER</h1>
          </div>
          <p className="text-xs text-cyber-muted">
            Machine-Readable Software Bill of Materials &bull; Automated Exploitability eXchange (VEX) Assertions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadJson}
            className="px-4 py-1.5 rounded-lg bg-cyber-cyan text-cyber-bg font-bold text-xs hover:bg-cyber-cyan/90 transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,245,212,0.25)]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CycloneDX 1.5 JSON
          </button>
        </div>
      </div>

      {/* VEX Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-cyber-border cyber-liquid-border cyber-hover-lift">
          <div className="text-xs text-cyber-muted">TOTAL SBOM PACKAGES</div>
          <div className="text-2xl font-bold text-white mt-1">{components.length}</div>
          <div className="text-[10px] text-cyber-muted">Binaries, Libs, OS</div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-cyber-rose/30 bg-cyber-rose/5 cyber-liquid-border cyber-hover-lift">
          <div className="text-xs text-cyber-rose font-bold">VEX: AFFECTED</div>
          <div className="text-2xl font-bold text-cyber-rose mt-1">
            {components.filter((c) => c.vexStatus === 'affected').length}
          </div>
          <div className="text-[10px] text-cyber-rose">Requires Vendor OTA Patch</div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-cyber-emerald/30 cyber-liquid-border cyber-hover-lift">
          <div className="text-xs text-cyber-emerald font-bold">VEX: NOT AFFECTED</div>
          <div className="text-2xl font-bold text-cyber-emerald mt-1">
            {components.filter((c) => c.vexStatus === 'not_affected').length}
          </div>
          <div className="text-[10px] text-cyber-muted">Unreachable Execution Path</div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-cyber-purple/30 cyber-liquid-border cyber-hover-lift">
          <div className="text-xs text-cyber-purple font-bold">PQC READINESS</div>
          <div className="text-2xl font-bold text-cyber-purple mt-1">
            {components.filter((c) => c.pqcReadiness === 'PQC_READY').length} / {components.length}
          </div>
          <div className="text-[10px] text-cyber-muted">NIST ML-KEM / ML-DSA Ready</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-cyber-border/40 pb-2 text-xs">
        {['ALL', 'affected', 'not_affected', 'under_investigation'].map((status) => (
          <button
            key={status}
            onClick={() => setSelectedVexStatus(status)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              selectedVexStatus === status
                ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40'
                : 'text-cyber-muted hover:text-white bg-cyber-surface/40'
            }`}
          >
            {status.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Components Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-cyber-border">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-cyber-surface/90 border-b border-cyber-border/40 text-cyber-muted">
            <tr>
              <th className="p-3.5">COMPONENT & PURL</th>
              <th className="p-3.5">VERSION</th>
              <th className="p-3.5">LICENSE</th>
              <th className="p-3.5">PQC STATUS</th>
              <th className="p-3.5">CISA VEX STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyber-border/30 bg-cyber-card/60">
            {filtered.map((comp) => (
              <tr key={comp.bomRef} className="hover:bg-cyber-surface/50 transition-colors">
                <td className="p-3.5">
                  <div className="text-white font-bold">{comp.name}</div>
                  <div className="text-[10px] text-cyber-muted truncate max-w-xs">{comp.purl}</div>
                </td>
                <td className="p-3.5 text-cyber-cyan font-bold">{comp.version}</td>
                <td className="p-3.5 text-slate-300">{comp.license}</td>
                <td className="p-3.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      comp.pqcReadiness === 'PQC_READY'
                        ? 'bg-cyber-emerald/20 text-cyber-emerald border border-cyber-emerald/40'
                        : comp.pqcReadiness === 'LEGACY_VULNERABLE'
                        ? 'bg-cyber-amber/20 text-cyber-amber border border-cyber-amber/40'
                        : 'bg-cyber-surface text-cyber-muted border border-cyber-border'
                    }`}
                  >
                    {comp.pqcReadiness}
                  </span>
                </td>
                <td className="p-3.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      comp.vexStatus === 'affected'
                        ? 'bg-cyber-rose/20 text-cyber-rose border border-cyber-rose/40'
                        : 'bg-cyber-emerald/20 text-cyber-emerald border border-cyber-emerald/40'
                    }`}
                  >
                    VEX: {comp.vexStatus.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
