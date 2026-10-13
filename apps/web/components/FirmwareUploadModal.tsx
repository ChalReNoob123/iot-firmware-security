'use client';

import React, { useState } from 'react';
import { useSentinelStore } from '@/lib/store';
import { uploadFirmware } from '@/lib/api';
import { FirmwareUploadResponse } from '@sentinelforge/shared-types';
import Link from 'next/link';

export default function FirmwareUploadModal() {
  const { uploadModalOpen, closeUploadModal } = useSentinelStore();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [projectId, setProjectId] = useState<string>('d6f78a22-387b-48ce-939e-4c55ec37d10e');
  const [fuzzBudgetMs, setFuzzBudgetMs] = useState<number>(300000);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadResult, setUploadResult] = useState<FirmwareUploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!uploadModalOpen) return null;

  const handleSelectSample = () => {
    // Create a mock File object representing a vendor router image
    const sampleBlob = new Blob(
      [new Uint8Array([0x7f, 0x45, 0x4c, 0x46, 0x01, 0x01, 0x01, 0x00, 0x66, 0x69, 0x72, 0x6d, 0x77, 0x61, 0x72, 0x65])],
      { type: 'application/octet-stream' }
    );
    const file = new File([sampleBlob], 'firmware-ax9000.bin', { type: 'application/octet-stream' });
    setSelectedFile(file);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select or drag a firmware binary package.');
      return;
    }

    if (selectedFile.size > 256 * 1024 * 1024) {
      setError('Firmware file exceeds the maximum 256MB upload limit.');
      return;
    }

    setIsUploading(true);

    setError(null);
    try {
      const res = await uploadFirmware(selectedFile, projectId, fuzzBudgetMs);
      setUploadResult(res);
    } catch (err: any) {
      console.error('Failed to upload firmware:', err);
      setError(err?.message || 'Error uploading firmware package.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-2xl glass-panel-glow p-6 rounded-2xl border border-cyber-cyan/40 flex flex-col gap-5 font-mono shadow-[0_0_35px_rgba(0,245,212,0.25)]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-cyber-border/40 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyber-cyan/20 border border-cyber-cyan/50 flex items-center justify-center text-cyber-cyan shadow-[0_0_15px_rgba(0,245,212,0.3)]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                FIRMWARE INGESTION & ZERO-DAY DISCOVERY ENGINE
              </h2>
              <p className="text-xs text-cyber-muted">
                Multiformat Unpacking &bull; Ephemeral QEMU MicroVM &bull; Neural Greybox Fuzzing
              </p>
            </div>
          </div>
          <button
            onClick={closeUploadModal}
            className="text-cyber-muted hover:text-white text-sm p-1.5 rounded-lg hover:bg-cyber-surface transition-colors"
          >
            ✕
          </button>
        </div>

        {uploadResult ? (
          /* Upload Success Screen (PRD Section 9.1 Response Display) */
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-cyber-emerald/10 border border-cyber-emerald/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-cyber-emerald animate-ping" />
                <div>
                  <div className="text-xs font-bold text-cyber-emerald">HTTP 202 ACCEPTED &bull; INGESTION DISPATCHED</div>
                  <div className="text-[11px] text-slate-300">Analysis Session ID: {uploadResult.analysisId}</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-cyber-emerald/20 text-cyber-emerald text-xs font-bold border border-cyber-emerald/40">
                ETA: ~{uploadResult.estimatedTimeSec}s
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-cyber-surface/80 border border-cyber-border text-xs space-y-2">
              <div className="flex items-center justify-between text-cyber-muted">
                <span>Cryptographic SHA-256 Digest:</span>
                <span className="font-mono text-white text-[11px] truncate max-w-[340px]">{uploadResult.sha256}</span>
              </div>
              <div className="flex items-center justify-between text-cyber-muted">
                <span>Egress Firewall Policy:</span>
                <span className="text-cyber-emerald font-bold">ANALYSIS_EGRESS_POLICY=deny-all</span>
              </div>
              <div className="flex items-center justify-between text-cyber-muted">
                <span>Hardware Attestation:</span>
                <span className="text-cyber-cyan font-bold">ATTESTATION_REQUIRED=true (vTPM Verified)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Link
                href="/attack-graph"
                onClick={closeUploadModal}
                className="p-3 rounded-xl bg-cyber-cyan text-cyber-bg font-bold text-xs hover:bg-cyber-cyan/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,245,212,0.3)]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Visualize 3D Attack Graph
              </Link>
              <Link
                href="/sbom-vex"
                onClick={closeUploadModal}
                className="p-3 rounded-xl bg-cyber-surface hover:bg-cyber-card border border-cyber-border text-white text-xs transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 text-cyber-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CycloneDX 1.5 SBOM
              </Link>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-xs text-cyber-muted hover:text-white transition-colors"
              >
                Upload Another Firmware Image
              </button>
            </div>
          </div>
        ) : (
          /* Form Input Screen */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* File Upload Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  setSelectedFile(e.dataTransfer.files[0]);
                  setError(null);
                }
              }}
              className="relative border-2 border-dashed border-cyber-border hover:border-cyber-cyan/50 rounded-xl p-5 text-center flex flex-col items-center justify-center gap-2 bg-cyber-surface/40 hover:bg-cyber-surface/60 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-cyber-cyan/10 flex items-center justify-center text-cyber-cyan">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>

              {selectedFile ? (
                <div className="space-y-1">
                  <div className="text-xs font-bold text-cyber-cyan">{selectedFile.name}</div>
                  <div className="text-[10px] text-cyber-muted">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Ready for Extraction
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-xs text-slate-200">
                    Drag & drop raw firmware package or <span className="text-cyber-cyan font-bold underline cursor-pointer">browse file</span>
                  </div>
                  <div className="text-[10px] text-cyber-muted">
                    Supports UEFI Capsules, SquashFS, CramFS, UBIFS, Ext4, Tarballs up to 4GB
                  </div>
                </div>
              )}

              <input
                type="file"
                onChange={handleFileChange}
                className="absolute opacity-0 inset-0 cursor-pointer"
              />
            </div>

            {/* Quick Sample Selector */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-cyber-muted text-[11px]">Need a reference target?</span>
              <button
                type="button"
                onClick={handleSelectSample}
                className="text-cyber-cyan hover:underline text-[11px] flex items-center gap-1 font-bold"
              >
                Use &quot;firmware-ax9000.bin&quot; (MIPS32el Benchmark)
              </button>
            </div>

            {/* Parameter Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-cyber-muted block text-[11px]">Organization Project UUID</label>
                <input
                  type="text"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-cyber-surface border border-cyber-border focus:border-cyber-cyan text-white text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-cyber-muted block text-[11px]">Fuzz Time Budget (ms)</label>
                <input
                  type="number"
                  value={fuzzBudgetMs}
                  onChange={(e) => setFuzzBudgetMs(parseInt(e.target.value) || 300000)}
                  className="w-full px-3 py-2 rounded-lg bg-cyber-surface border border-cyber-border focus:border-cyber-cyan text-white text-xs outline-none"
                />
              </div>
            </div>

            {/* MicroVM Sandbox Security Badges */}
            <div className="p-3 rounded-lg bg-cyber-purple/5 border border-cyber-purple/20 text-[11px] space-y-1">
              <div className="text-cyber-purple font-bold flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                EPHEMERAL MICROVM ISOLATION ACTIVE
              </div>
              <p className="text-slate-300 text-[10px]">
                Execution sandboxed in Firecracker KVM with zero egress socket leak (`ANALYSIS_EGRESS_POLICY=deny-all`). Branch transitions streamed to neural inference coprocessor (port 8501).
              </p>
            </div>

            {error && <div className="text-xs text-cyber-rose font-bold">{error}</div>}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeUploadModal}
                className="px-4 py-2 rounded-lg bg-cyber-surface hover:bg-cyber-card border border-cyber-border text-xs text-cyber-muted hover:text-white transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isUploading || !selectedFile}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  isUploading || !selectedFile
                    ? 'bg-cyber-surface text-cyber-muted cursor-not-allowed border border-cyber-border'
                    : 'bg-cyber-cyan text-cyber-bg hover:bg-cyber-cyan/90 shadow-[0_0_15px_rgba(0,245,212,0.3)]'
                }`}
              >
                {isUploading ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-cyber-bg animate-ping" />
                    Dispatching Ingestion Job...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Ingest Firmware (POST /api/v1/firmware/upload)
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
