'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { cyberAudio } from '@/lib/audio';
import { useSentinelStore } from '@/lib/store';

interface GenomeMatch {
  deviceId: string;
  deviceName: string;
  manufacturer: string;
  industry: string;
  matchedBinary: string;
  similarityScore: number; // 0.0 - 1.0
  hashType: string;
  fuzzyHashDistance: number;
  transferability: 'IMMEDIATE_EXPLOIT' | 'PARTIAL_MATCH' | 'SAFE';
  status: 'VULNERABLE' | 'AT_RISK' | 'PATCHED';
}

export default function GenomeSimilarityPage() {
  const { showToast } = useSentinelStore();
  const [similarityThreshold, setSimilarityThreshold] = useState<number>(0.85);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<GenomeMatch | null>(null);

  const referenceVulnerability = {
    findingId: 'SF-ZERO-2026-001',
    name: 'Unchecked Stack Overflow in parse_ble_advertisement_packet',
    sourceBinary: 'libble_protocol_core.so (Build: 2.4.1-arm)',
    sha256: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    vectorEmbeddingDim: '1536-dim CodeBERT Embedding'
  };

  const matches: GenomeMatch[] = [
    {
      deviceId: 'dev_grid_meter_09',
      deviceName: 'PowerGrid Smart Industrial Meter PG-400',
      manufacturer: 'GridPower Technologies',
      industry: 'Smart Energy & OT',
      matchedBinary: 'libble_mesh_stack.so',
      similarityScore: 0.98,
      hashType: 'TLSH (Distance: 4)',
      fuzzyHashDistance: 4,
      transferability: 'IMMEDIATE_EXPLOIT',
      status: 'VULNERABLE'
    },
    {
      deviceId: 'dev_medical_pump_03',
      deviceName: 'BioPulse Connected Infusion Pump',
      manufacturer: 'BioPulse Medical',
      industry: 'Healthcare / Critical Medical',
      matchedBinary: 'libble_telemetry_arm.so',
      similarityScore: 0.94,
      hashType: 'pgvector Cosine (0.941)',
      fuzzyHashDistance: 7,
      transferability: 'IMMEDIATE_EXPLOIT',
      status: 'VULNERABLE'
    },
    {
      deviceId: 'dev_auto_tcu_07',
      deviceName: 'V2X Automotive Telematics Gateway TCU-9',
      manufacturer: 'AutoConnect Systems',
      industry: 'Connected Vehicles',
      matchedBinary: 'ble_radio_daemon.bin',
      similarityScore: 0.89,
      hashType: 'ssdeep (Match: 89%)',
      fuzzyHashDistance: 11,
      transferability: 'IMMEDIATE_EXPLOIT',
      status: 'VULNERABLE'
    },
    {
      deviceId: 'dev_building_access_12',
      deviceName: 'SecurePass Smart Lock & Badge Controller',
      manufacturer: 'FacilitySecure Inc.',
      industry: 'Building Access & Physical Security',
      matchedBinary: 'libnordic_ble_driver.so',
      similarityScore: 0.87,
      hashType: 'pgvector Cosine (0.872)',
      fuzzyHashDistance: 14,
      transferability: 'PARTIAL_MATCH',
      status: 'AT_RISK'
    },
    {
      deviceId: 'dev_hvac_controller_18',
      deviceName: 'ClimateOps Industrial Chiller Modbus Controller',
      manufacturer: 'HVAC Solutions Ltd.',
      industry: 'Critical Infrastructure',
      matchedBinary: 'libble_oob_auth.so',
      similarityScore: 0.72,
      hashType: 'TLSH (Distance: 32)',
      fuzzyHashDistance: 32,
      transferability: 'SAFE',
      status: 'PATCHED'
    }
  ];

  const filteredMatches = matches.filter((m) => m.similarityScore >= similarityThreshold);

  const handleRunSearch = () => {
    cyberAudio.playRadarSweep();
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      cyberAudio.playZeroDayAlert();
    }, 800);
  };

  return (
    <div className="flex flex-col gap-6 font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-cyber-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-purple animate-pulse" />
            <h1 className="text-xl font-bold text-white">FIRMWARE GENOME & FLEET BLAST-RADIUS SEARCH</h1>
          </div>
          <p className="text-xs text-cyber-muted">
            pgvector Code Embeddings &bull; Fuzzy Hashing (TLSH / ssdeep) &bull; Cross-Fleet Supply Chain Exposure
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunSearch}
            disabled={isSearching}
            className="px-4 py-1.5 rounded-lg bg-cyber-purple text-white font-bold text-xs hover:bg-cyber-purple/90 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
          >
            {isSearching ? 'Querying 12,400+ Binaries...' : '⚡ Re-Compute Fleet Similarity'}
          </button>
        </div>
      </div>

      {/* Differentiator Callout Banner */}
      <div className="p-4 rounded-xl glass-panel border border-cyber-purple/40 bg-cyber-purple/10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <div className="text-cyber-purple font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyber-purple animate-ping" />
            CORE DIFFERENTIATOR: ONE DISCOVERY &rarr; FLEET-WIDE INSTANT ADVISORY
          </div>
          <p className="text-slate-200 text-[11px] leading-relaxed">
            When SentinelForge proves a novel zero-day in a target device, the platform embeds all extracted binary functions into a high-dimensional vector store. In milliseconds, it identifies every other product across your fleet (or industry corpus) sharing the same vulnerable SDK or code clone.
          </p>
        </div>
        <div className="text-right whitespace-nowrap">
          <div className="text-2xl font-bold text-cyber-rose">3 Fleets Exposed</div>
          <div className="text-[10px] text-cyber-muted">Medical, Energy, Automotive</div>
        </div>
      </div>

      {/* Reference Vulnerability & Vector Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-cyber-border space-y-2 text-xs">
          <div className="text-cyber-cyan font-bold">SOURCE ZERO-DAY SIGNATURE</div>
          <div className="text-white font-bold">{referenceVulnerability.findingId}</div>
          <div className="text-cyber-muted text-[11px]">{referenceVulnerability.name}</div>
          <div className="p-2 rounded bg-cyber-surface/90 border border-cyber-border/60 text-[10px] space-y-0.5">
            <div>Binary: <span className="text-cyber-cyan">{referenceVulnerability.sourceBinary}</span></div>
            <div className="truncate">Embedding: <span className="text-cyber-purple">{referenceVulnerability.vectorEmbeddingDim}</span></div>
          </div>
        </div>

        <div className="lg:col-span-2 glass-panel p-4 rounded-xl border border-cyber-border flex flex-col justify-between gap-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="text-cyber-cyan font-bold">VECTOR SIMILARITY COSINE THRESHOLD</div>
            <span className="text-cyber-emerald font-bold text-sm">{(similarityThreshold * 100).toFixed(0)}% Match</span>
          </div>

          <input
            type="range"
            min="0.50"
            max="0.99"
            step="0.01"
            value={similarityThreshold}
            onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
            className="w-full accent-cyber-cyan cursor-pointer"
          />

          <div className="flex items-center justify-between text-[11px] text-cyber-muted">
            <span>Broad Semantic Clones (50%)</span>
            <span>Exact Firmware SDK Clones (95%+)</span>
          </div>
        </div>
      </div>

      {/* Matching Binaries Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-cyber-border">
        <div className="p-3.5 bg-cyber-surface/90 border-b border-cyber-border/40 flex items-center justify-between text-xs">
          <span className="font-bold text-white">CROSS-FLEET BLAST RADIUS MATCHES ({filteredMatches.length})</span>
          <span className="text-cyber-muted text-[11px]">Indexed Corpus: 12,480 Firmware Binaries</span>
        </div>

        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-cyber-surface/60 border-b border-cyber-border/30 text-cyber-muted">
            <tr>
              <th className="p-3.5">TARGET DEVICE & INDUSTRY</th>
              <th className="p-3.5">MATCHED BINARY</th>
              <th className="p-3.5">SIMILARITY</th>
              <th className="p-3.5">EXPLOIT TRANSFERABILITY</th>
              <th className="p-3.5">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyber-border/30 bg-cyber-card/60">
            {filteredMatches.map((m) => (
              <tr
                key={m.deviceId}
                onClick={() => {
                  setSelectedMatch(m);
                  cyberAudio.playClick();
                }}
                className="hover:bg-cyber-surface/60 cursor-pointer transition-colors"
              >
                <td className="p-3.5">
                  <div className="text-white font-bold">{m.deviceName}</div>
                  <div className="text-[10px] text-cyber-muted">{m.manufacturer} &bull; <span className="text-cyber-cyan">{m.industry}</span></div>
                </td>
                <td className="p-3.5">
                  <span className="font-mono text-slate-200">{m.matchedBinary}</span>
                  <div className="text-[10px] text-cyber-purple">{m.hashType}</div>
                </td>
                <td className="p-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 rounded-full bg-cyber-surface overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-rose"
                        style={{ width: `${m.similarityScore * 100}%` }}
                      />
                    </div>
                    <span className="font-bold text-white text-[11px]">{(m.similarityScore * 100).toFixed(0)}%</span>
                  </div>
                </td>
                <td className="p-3.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      m.transferability === 'IMMEDIATE_EXPLOIT'
                        ? 'bg-cyber-rose/20 text-cyber-rose border border-cyber-rose/40 animate-pulse'
                        : m.transferability === 'PARTIAL_MATCH'
                        ? 'bg-cyber-amber/20 text-cyber-amber border border-cyber-amber/40'
                        : 'bg-cyber-emerald/20 text-cyber-emerald border border-cyber-emerald/40'
                    }`}
                  >
                    {m.transferability}
                  </span>
                </td>
                <td className="p-3.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      showToast(`Automated fleet security advisory dispatched to ${m.manufacturer}.`, 'INFO');
                    }}
                    className="px-2.5 py-1 rounded bg-cyber-surface hover:bg-cyber-cyan/20 border border-cyber-border text-cyber-cyan text-[10px]"
                  >
                    Dispatch Advisory
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected Match Deep Vector Inspection */}
      {selectedMatch && (
        <div className="glass-panel p-5 rounded-xl border border-cyber-rose/40 bg-cyber-rose/5 flex flex-col gap-3 text-xs">
          <div className="flex items-center justify-between border-b border-cyber-border/40 pb-2">
            <span className="font-bold text-cyber-rose flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyber-rose animate-ping" />
              CODE EMBEDDING CORRELATION & VULNERABILITY SINK OVERLAP
            </span>
            <button onClick={() => setSelectedMatch(null)} className="text-cyber-muted hover:text-white">✕</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-cyber-bg/90 border border-cyber-border text-[11px] space-y-1">
              <div className="text-cyber-muted">DISCOVERED ZERO-DAY ORIGIN:</div>
              <div className="text-cyber-cyan font-bold">Edge-Shield GW-800 &bull; libble_protocol_core.so</div>
              <p className="text-slate-300 mt-2 leading-relaxed">
                Function: <code>parse_ble_advertisement_packet(char *packet_ptr, uint16_t len)</code><br />
                Vulnerability: Unbounded <code>memcpy(local_buf, packet_ptr + 8, len)</code>
              </p>
            </div>

            <div className="p-3 rounded-lg bg-cyber-bg/90 border border-cyber-rose/40 text-[11px] space-y-1">
              <div className="text-cyber-rose font-bold">MATCHED FLEET TARGET ({selectedMatch.deviceName}):</div>
              <div className="text-white font-bold">{selectedMatch.matchedBinary}</div>
              <p className="text-slate-300 mt-2 leading-relaxed">
                Matched Subroutine: <code>ble_handle_mesh_adv_frame()</code><br />
                Embedding Distance: <span className="text-cyber-emerald font-bold">0.024 cosine delta</span> &bull; 100% Shared Sink Signature
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
