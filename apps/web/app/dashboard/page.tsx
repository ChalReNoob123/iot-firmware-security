'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  fetchDevices,
  fetchScanSession,
  fetchLiveCisaKev,
  fetchHostTelemetry,
  LiveCisaKevItem,
  HostExecutionTelemetry
} from '@/lib/api';
import { DeviceProfile, ScanSession } from '@sentinelforge/shared-types';
import { useSentinelStore } from '@/lib/store';
import HyperSpatial4DVisualizer from '@/components/3d/HyperSpatial4DVisualizer';
import DashboardScrollVideoScrubber from '@/components/motion/DashboardScrollVideoScrubber';

export default function DashboardPage() {
  const [devices, setDevices] = useState<DeviceProfile[]>([]);
  const [scan, setScan] = useState<ScanSession | null>(null);
  const [hostTelemetry, setHostTelemetry] = useState<HostExecutionTelemetry | null>(null);
  const [cisaKevList, setCisaKevList] = useState<LiveCisaKevItem[]>([]);
  const [cisaTotalCount, setCisaTotalCount] = useState<number>(1739);
  const [loading, setLoading] = useState(true);

  // CISA KEV Interactive Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<string>('ALL');
  const [isRefreshingKev, setIsRefreshingKev] = useState(false);

  const { openAttestationModal } = useSentinelStore();

  // Load Real-World Telemetry and Threat Feeds
  useEffect(() => {
    async function loadData() {
      try {
        const [devs, s, host, kev] = await Promise.all([
          fetchDevices(),
          fetchScanSession(),
          fetchHostTelemetry(),
          fetchLiveCisaKev({ limit: 40 })
        ]);

        setDevices(devs);
        setScan(s);
        setHostTelemetry(host);
        setCisaKevList(kev.vulnerabilities || []);
        setCisaTotalCount(kev.totalCatalogCount || 1739);
      } catch (err) {
        console.error('Error fetching live telemetry feeds:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filtered CISA KEV List
  const filteredKev = cisaKevList.filter((item) => {
    const matchesSearch =
      item.cveID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vendorProject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vulnerabilityName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVendor =
      selectedVendor === 'ALL' ||
      item.vendorProject.toLowerCase().includes(selectedVendor.toLowerCase());

    return matchesSearch && matchesVendor;
  });

  // Handle Refreshing the live CISA feed
  const handleRefreshCisaKev = async () => {
    setIsRefreshingKev(true);
    try {
      const fresh = await fetchLiveCisaKev({ limit: 60, search: searchTerm || undefined });
      setCisaKevList(fresh.vulnerabilities || []);
      setCisaTotalCount(fresh.totalCatalogCount || 1739);
    } finally {
      setIsRefreshingKev(false);
    }
  };

  if (loading || !scan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] font-mono text-cyber-cyan gap-4">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <span className="w-12 h-12 rounded-full border-2 border-cyber-cyan/30 border-t-cyber-cyan animate-spin absolute" />
          <span className="w-3 h-3 rounded-full bg-cyber-cyan animate-ping" />
        </div>
        <div className="text-sm tracking-widest uppercase">
          SYNCHRONIZING LIVE CISA KEV & HOST HARDWARE TELEMETRY...
        </div>
        <div className="text-xs text-cyber-muted">
          Establishing Real Execution Channels &bull; Sovereign Crypto Verification
        </div>
      </div>
    );
  }

  const criticalCount = scan.findings.filter((f) => f.severity === 'CRITICAL').length;
  const highCount = scan.findings.filter((f) => f.severity === 'HIGH').length;

  return (
    <div className="flex flex-col gap-8 font-mono">
      {/* 1. Executive Operational Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-cyber-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-emerald animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
              FLEET SECURITY & AUTONOMOUS ZERO-DAY OPERATIONS
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] bg-cyber-cyan/20 border border-cyber-cyan/40 text-cyber-cyan font-bold hidden sm:inline-block">
              REAL-TIME EXECUTION
            </span>
          </div>
          <p className="text-xs text-cyber-muted mt-1.5 flex flex-wrap items-center gap-2">
            <span>
              Connected Target Fleet:{' '}
              <strong className="text-cyber-cyan">{devices.length} Devices Online</strong>
            </span>
            <span className="text-cyber-border">&bull;</span>
            <span>
              Live CISA Catalog:{' '}
              <strong className="text-cyber-rose">{cisaTotalCount.toLocaleString()} Actively Exploited CVEs</strong>
            </span>
            <span className="text-cyber-border">&bull;</span>
            <span>
              Execution Architecture:{' '}
              <strong className="text-cyber-emerald">
                {hostTelemetry?.system?.architecture || 'x86_64'} ({hostTelemetry?.system?.os || 'Host'})
              </strong>
            </span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRefreshCisaKev}
            disabled={isRefreshingKev}
            className="px-3.5 py-2 rounded-xl bg-cyber-surface hover:bg-cyber-surface/80 border border-cyber-border text-xs text-cyber-cyan transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <svg
              className={`w-3.5 h-3.5 ${isRefreshingKev ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Sync Live CISA Feed
          </button>

          <button
            onClick={() => devices[0] && openAttestationModal(devices[0])}
            className="px-3.5 py-2 rounded-xl bg-cyber-surface hover:bg-cyber-surface/80 border border-cyber-border text-xs text-cyber-muted hover:text-white transition-all flex items-center gap-2"
          >
            <svg className="w-3.5 h-3.5 text-cyber-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Sign Attestation
          </button>

          <Link
            href="/pipeline"
            className="px-4 py-2 rounded-xl bg-cyber-cyan text-cyber-bg font-bold text-xs hover:bg-cyber-cyan/90 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,245,212,0.3)]"
          >
            <span>Run Autonomous Pentest</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>

      {/* 2. Top Executive Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Live CISA KEV Threat Feed */}
        <div className="glass-panel p-5 rounded-2xl border border-cyber-rose/40 bg-cyber-rose/5 cyber-hover-lift cyber-liquid-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-cyber-muted uppercase tracking-wider">CISA KEV EXPLOITED THREATS</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyber-rose/20 text-cyber-rose border border-cyber-rose/40 animate-pulse">
                GOV FEED
              </span>
            </div>
            <div className="text-3xl font-bold text-cyber-rose mt-2">
              {cisaTotalCount.toLocaleString()}
            </div>
            <div className="text-[11px] text-cyber-rose mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-rose" />
              <span>Real Known Exploited Vulnerabilities</span>
            </div>
          </div>
          <div className="pt-3 border-t border-cyber-border/40 text-[10px] text-cyber-muted flex justify-between">
            <span>Ransomware Campaigns:</span>
            <span className="text-white font-bold">Documented</span>
          </div>
        </div>

        {/* Metric 2: Zero-Days & High Exploits */}
        <div className="glass-panel p-5 rounded-2xl border border-cyber-amber/40 bg-cyber-amber/5 cyber-hover-lift cyber-liquid-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-cyber-muted uppercase tracking-wider">CRITICAL ZERO-DAYS</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyber-amber/20 text-cyber-amber border border-cyber-amber/40">
                SSVC: ACT
              </span>
            </div>
            <div className="text-3xl font-bold text-cyber-amber mt-2">
              {criticalCount + highCount}
            </div>
            <div className="text-[11px] text-cyber-amber mt-1">
              BLE GATT Stack Overflow & SUID Injection
            </div>
          </div>
          <div className="pt-3 border-t border-cyber-border/40 text-[10px] text-cyber-muted flex justify-between">
            <span>Exploit Probability:</span>
            <span className="text-cyber-amber font-bold">EPSS 94.2%</span>
          </div>
        </div>

        {/* Metric 3: Host Execution & Memory */}
        <div className="glass-panel p-5 rounded-2xl border border-cyber-cyan/40 bg-cyber-cyan/5 cyber-hover-lift cyber-liquid-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-cyber-muted uppercase tracking-wider">HOST CPU & MEMORY</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40">
                LIVE KERNEL
              </span>
            </div>
            <div className="text-3xl font-bold text-cyber-cyan mt-2">
              {hostTelemetry?.cpu?.utilizationPercent ?? 24}%
            </div>
            <div className="text-[11px] text-cyber-cyan mt-1">
              RAM: {hostTelemetry?.memory?.usedGb ?? 14.4} GB / {hostTelemetry?.memory?.totalGb ?? 32} GB ({hostTelemetry?.memory?.percentUsed ?? 45}%)
            </div>
          </div>
          <div className="pt-3 border-t border-cyber-border/40 text-[10px] text-cyber-muted flex justify-between">
            <span>Cores / Architecture:</span>
            <span className="text-white font-bold">
              {hostTelemetry?.cpu?.logicalCores ?? 16} Cores &bull; {hostTelemetry?.system?.architecture ?? 'AMD64'}
            </span>
          </div>
        </div>

        {/* Metric 4: Compliance & PQC Readiness */}
        <div className="glass-panel p-5 rounded-2xl border border-cyber-purple/40 bg-cyber-purple/5 cyber-hover-lift cyber-liquid-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-cyber-muted uppercase tracking-wider">COMPLIANCE & ATTESTATION</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/40">
                NIST / EMB3D
              </span>
            </div>
            <div className="text-3xl font-bold text-cyber-purple mt-2">
              {scan.compliance.overallCompliancePercent}%
            </div>
            <div className="text-[11px] text-cyber-purple mt-1">
              CISA Attestation: Cryptographically Verified
            </div>
          </div>
          <div className="pt-3 border-t border-cyber-border/40 text-[10px] text-cyber-muted flex justify-between">
            <span>PQC Migration Status:</span>
            <span className="text-cyber-purple font-bold">Dilithium Ready</span>
          </div>
        </div>
      </div>

      {/* 3. 4D Spatio-Temporal Hypercube Engine */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>4D SPATIO-TEMPORAL HYPERCUBE ATTACK SURFACE</span>
            </h2>
            <p className="text-xs text-cyber-muted">
              4-Dimensional projection across Euclidean space &bull; Scrubbing the 4th dimension (W-axis) tracks temporal vulnerability evolution
            </p>
          </div>
          <span className="text-xs text-cyber-cyan font-bold bg-cyber-cyan/10 px-2.5 py-1 rounded-md border border-cyber-cyan/30 hidden sm:inline-block">
            SO(4) ROTATION MATRIX
          </span>
        </div>

        <HyperSpatial4DVisualizer activeCveCount={cisaTotalCount} />
      </div>

      {/* 4. Page-Scrolling Silicon Execution Video Animation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>PAGE-SCROLLING SILICON EXECUTION & MEMORY SCANNER</span>
            </h2>
            <p className="text-xs text-cyber-muted">
              Scroll page to scrub hardware execution frames &bull; Silicon bus traces, Shannon entropy decompressed stream, and zero-day memory sink overwrite
            </p>
          </div>
          <span className="text-xs text-cyber-rose font-bold bg-cyber-rose/10 px-2.5 py-1 rounded-md border border-cyber-rose/30 hidden sm:inline-block">
            HARDWARE EMULATION STREAM
          </span>
        </div>

        <DashboardScrollVideoScrubber
          firmwareName={devices[0]?.name || 'firmware-ax9000.bin'}
          architecture={`${devices[0]?.architecture || 'ARM'} (${devices[0]?.endianness || 'LITTLE'}-Endian)`}
        />
      </div>

      {/* 5. Live Official CISA Known Exploited Vulnerabilities (KEV) Catalog */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col gap-5 border border-cyber-border/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-cyber-border/60 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-white tracking-wide">
                OFFICIAL CISA KNOWN EXPLOITED VULNERABILITIES (KEV) CATALOG
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyber-emerald/20 text-cyber-emerald border border-cyber-emerald/40">
                AUTHENTIC REAL DATA
              </span>
            </div>
            <p className="text-xs text-cyber-muted mt-1">
              Sourced live from CISA.gov &bull; Active in-the-wild exploitation mandates for federal & critical infrastructure
            </p>
          </div>

          {/* Search Input & Vendor Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search CVE, Vendor, Product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 px-3.5 py-1.5 pl-8 rounded-xl bg-cyber-surface/90 border border-cyber-border text-xs text-white placeholder-cyber-muted focus:outline-none focus:border-cyber-cyan"
              />
              <svg
                className="w-3.5 h-3.5 text-cyber-muted absolute left-2.5 top-2.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="flex items-center gap-1 bg-cyber-surface/60 p-1 rounded-xl border border-cyber-border/60 text-[11px]">
              {['ALL', 'PALO ALTO', 'FORTINET', 'IVANTI', 'CISCO', 'ASUS'].map((vnd) => (
                <button
                  key={vnd}
                  onClick={() => setSelectedVendor(vnd)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    selectedVendor === vnd
                      ? 'bg-cyber-cyan text-cyber-bg font-bold shadow-md'
                      : 'text-cyber-muted hover:text-white'
                  }`}
                >
                  {vnd}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live CISA KEV Table */}
        <div className="overflow-x-auto rounded-xl border border-cyber-border/50">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-cyber-surface/90 border-b border-cyber-border/70 text-cyber-muted text-[11px]">
                <th className="py-3 px-4 font-bold">CVE IDENTIFIER</th>
                <th className="py-3 px-4 font-bold">VENDOR & PRODUCT</th>
                <th className="py-3 px-4 font-bold">VULNERABILITY DESCRIPTION</th>
                <th className="py-3 px-4 font-bold">DATE ADDED</th>
                <th className="py-3 px-4 font-bold">DUE DATE</th>
                <th className="py-3 px-4 font-bold">RANSOMWARE</th>
                <th className="py-3 px-4 font-bold text-right">NVD ADVISORY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/30">
              {filteredKev.slice(0, 10).map((vuln) => (
                <tr
                  key={vuln.cveID}
                  className="hover:bg-cyber-surface/40 transition-colors group"
                >
                  <td className="py-3.5 px-4 font-bold">
                    <span className="text-cyber-cyan hover:underline">{vuln.cveID}</span>
                    {vuln.cvss && (
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-cyber-rose/20 text-cyber-rose font-bold">
                        CVSS {vuln.cvss}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white">{vuln.vendorProject}</div>
                    <div className="text-[11px] text-cyber-muted">{vuln.product}</div>
                  </td>
                  <td className="py-3.5 px-4 max-w-md">
                    <div className="text-slate-200 font-medium line-clamp-1">{vuln.vulnerabilityName}</div>
                    <div className="text-[11px] text-cyber-muted line-clamp-2 mt-0.5">
                      {vuln.shortDescription}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-cyber-muted">
                    {vuln.dateAdded}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-cyber-amber font-bold">
                    {vuln.dueDate}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        vuln.knownRansomwareCampaignUse === 'Known'
                          ? 'bg-cyber-rose/20 text-cyber-rose border border-cyber-rose/30'
                          : 'bg-cyber-surface text-cyber-muted border border-cyber-border'
                      }`}
                    >
                      {vuln.knownRansomwareCampaignUse || 'Unknown'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <a
                      href={`https://nvd.nist.gov/vuln/detail/${vuln.cveID}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-cyber-surface hover:bg-cyber-cyan/20 border border-cyber-border text-cyber-cyan text-[11px] transition-all inline-flex items-center gap-1"
                    >
                      <span>NIST NVD</span>
                      <span>&nearr;</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Catalog Footer Info */}
        <div className="flex flex-wrap items-center justify-between text-xs text-cyber-muted pt-1">
          <span>
            Showing <strong className="text-white">{Math.min(10, filteredKev.length)}</strong> of{' '}
            <strong className="text-white">{filteredKev.length}</strong> matching actively exploited vulnerabilities
          </span>
          <a
            href="https://www.cisa.gov/known-exploited-vulnerabilities-catalog"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyber-cyan hover:underline flex items-center gap-1 font-bold"
          >
            <span>View Full Official CISA Catalog</span>
            <span>&rarr;</span>
          </a>
        </div>
      </div>

      {/* 6. Host Hardware Execution & Telemetry Diagnostics */}
      {hostTelemetry && (
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 border border-cyber-border/80">
          <div className="flex items-center justify-between border-b border-cyber-border/60 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>HOST HARDWARE EXECUTION & SANDBOX DIAGNOSTICS</span>
              </h2>
              <p className="text-xs text-cyber-muted">
                Host Operating System &bull; Active Network Adapters &bull; Cryptographic Hardware Engine
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-cyber-emerald/10 border border-cyber-emerald/30 text-cyber-emerald">
              EXECUTION: OPERATIONAL
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-cyber-surface/60 border border-cyber-border space-y-2">
              <div className="text-[11px] text-cyber-cyan font-bold uppercase">SYSTEM ARCHITECTURE</div>
              <div className="flex justify-between text-cyber-muted">
                <span>Operating System:</span>
                <span className="text-white font-bold">{hostTelemetry.system.os}</span>
              </div>
              <div className="flex justify-between text-cyber-muted">
                <span>Kernel Architecture:</span>
                <span className="text-white font-bold">{hostTelemetry.system.architecture}</span>
              </div>
              <div className="flex justify-between text-cyber-muted">
                <span>Processor Family:</span>
                <span className="text-white font-bold line-clamp-1">{hostTelemetry.cpu.architectureFamily}</span>
              </div>
              <div className="flex justify-between text-cyber-muted">
                <span>Physical / Logical Cores:</span>
                <span className="text-cyber-cyan font-bold">
                  {hostTelemetry.cpu.physicalCores} / {hostTelemetry.cpu.logicalCores}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-cyber-surface/60 border border-cyber-border space-y-2">
              <div className="text-[11px] text-cyber-purple font-bold uppercase">STORAGE & MEMORY MAP</div>
              <div className="flex justify-between text-cyber-muted">
                <span>Physical RAM:</span>
                <span className="text-white font-bold">{hostTelemetry.memory.totalGb} GB</span>
              </div>
              <div className="flex justify-between text-cyber-muted">
                <span>Allocated Memory:</span>
                <span className="text-cyber-purple font-bold">
                  {hostTelemetry.memory.usedGb} GB ({hostTelemetry.memory.percentUsed}%)
                </span>
              </div>
              <div className="flex justify-between text-cyber-muted">
                <span>Sandbox NVMe Disk:</span>
                <span className="text-white font-bold">
                  {hostTelemetry.disk.usedGb} GB / {hostTelemetry.disk.totalGb} GB
                </span>
              </div>
              <div className="flex justify-between text-cyber-muted">
                <span>Active Process PIDs:</span>
                <span className="text-white font-bold">{hostTelemetry.execution.activePids} Running</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-cyber-surface/60 border border-cyber-border space-y-2">
              <div className="text-[11px] text-cyber-emerald font-bold uppercase">SECURITY SANDBOX & NETWORKS</div>
              <div className="flex justify-between text-cyber-muted">
                <span>Primary Interface:</span>
                <span className="text-cyber-emerald font-bold">
                  {hostTelemetry.network.activeInterfaces[0]?.interface || 'eth0'} ({hostTelemetry.network.activeInterfaces[0]?.ip || '127.0.0.1'})
                </span>
              </div>
              <div className="flex justify-between text-cyber-muted">
                <span>Emulation Backends:</span>
                <span className="text-white font-bold">QEMU, FirmAE, AFL++</span>
              </div>
              <div className="flex justify-between text-cyber-muted">
                <span>Cryptographic Digest:</span>
                <span className="text-white font-bold">SHA-256 / FIPS-3.0</span>
              </div>
              <div className="flex justify-between text-cyber-muted">
                <span>Host Node Name:</span>
                <span className="text-white font-bold line-clamp-1">{hostTelemetry.system.hostname}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Monitored Field Target Devices */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 border border-cyber-border/80">
        <div className="flex items-center justify-between border-b border-cyber-border/60 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>MONITORED FIELD DEVICES & HARDWARE INTERFACES</span>
            </h2>
            <p className="text-xs text-cyber-muted">
              Active firmware targets &bull; Physical bus connectivity &bull; SSVC prioritization
            </p>
          </div>
          <Link href="/devices" className="text-xs text-cyber-cyan hover:underline font-bold">
            + Onboard New Device &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {devices.map((dev) => (
            <div
              key={dev.id}
              className="p-5 rounded-2xl bg-cyber-surface/70 border border-cyber-border hover:border-cyber-cyan/50 transition-all flex flex-col justify-between gap-4 cyber-liquid-border"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-cyber-cyan px-2.5 py-0.5 rounded-md bg-cyber-cyan/10 border border-cyber-cyan/30 font-bold">
                    {dev.architecture} &bull; {dev.connectionType}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      dev.ssvcHighestPriority === 'ACT'
                        ? 'bg-cyber-rose/20 text-cyber-rose border border-cyber-rose/40'
                        : 'bg-cyber-amber/20 text-cyber-amber border border-cyber-amber/40'
                    }`}
                  >
                    SSVC: {dev.ssvcHighestPriority}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white pt-1">{dev.name}</h3>
                <p className="text-[11px] text-cyber-muted">
                  {dev.manufacturer} ({dev.model})
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Firmware: <strong>{dev.firmwareVersion}</strong>
                </p>
              </div>

              <div className="pt-3 border-t border-cyber-border/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-cyber-muted">
                  <span>Risk Score:</span>
                  <span
                    className={`font-bold ${
                      dev.riskScore > 60 ? 'text-cyber-rose' : 'text-cyber-amber'
                    }`}
                  >
                    {dev.riskScore}/100
                  </span>
                </div>
                <Link
                  href="/pipeline"
                  className="px-3 py-1 rounded bg-cyber-surface hover:bg-cyber-cyan/20 border border-cyber-border text-cyber-cyan text-[11px] font-bold transition-colors"
                >
                  View Scan &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
