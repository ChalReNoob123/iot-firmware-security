'use client';

import React, { useEffect, useState } from 'react';
import { fetchScanSession } from '@/lib/api';
import { ScanSession, PipelineStageInfo, Finding } from '@sentinelforge/shared-types';
import TaintFlow3D from '@/components/3d/TaintFlow3D';
import { StageInspector } from '@/components/pipeline/StageInspectors';

export default function PipelinePage() {
  const [scan, setScan] = useState<ScanSession | null>(null);
  const [selectedStage, setSelectedStage] = useState<PipelineStageInfo | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const s = await fetchScanSession();
      setScan(s);
      setSelectedStage(s.stages[4]); // Stage 5: Symbolic Taint by default
      setSelectedFinding(s.findings[0]); // Zero-Day BLE Buffer Overflow
      setLoading(false);
    }
    load();
  }, []);

  if (loading || !scan) {
    return (
      <div className="flex items-center justify-center min-h-[400px] font-mono text-cyber-cyan">
        <span className="w-2.5 h-2.5 rounded-full bg-cyber-cyan animate-ping mr-2" />
        INITIALIZING 10-STAGE AUTONOMOUS DISCOVERY PIPELINE...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-cyber-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-emerald animate-pulse" />
            <h1 className="text-xl font-bold text-white">10-STAGE AUTONOMOUS DISCOVERY PIPELINE</h1>
          </div>
          <p className="text-xs text-cyber-muted">
            Target: <span className="text-cyber-cyan font-bold">{scan.deviceName}</span> &bull; Status: <span className="text-cyber-emerald font-bold">DISCOVERY COMPLETE</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-cyber-surface border border-cyber-border text-xs text-cyber-muted">
            Total Duration: <span className="text-white font-bold">1m 32s</span>
          </span>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 rounded-lg bg-cyber-cyan text-cyber-bg font-bold text-xs hover:bg-cyber-cyan/90 transition-all shadow-[0_0_12px_rgba(0,245,212,0.3)]"
          >
            Re-run Pipeline
          </button>
        </div>
      </div>

      {/* 10 Stages Horizontal Timeline */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col gap-3 border border-cyber-border/60">
        <div className="text-xs font-bold text-cyber-cyan flex items-center justify-between">
          <span>PIPELINE STAGE SEQUENCER (OWASP FSTM STRUCTURED)</span>
          <span className="text-cyber-muted text-[11px]">Click any stage to inspect live execution telemetry</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
          {scan.stages.map((stage, idx) => {
            const isSelected = selectedStage?.id === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => setSelectedStage(stage)}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all cyber-hover-lift ${
                  isSelected
                    ? 'bg-cyber-cyan/20 border-cyber-cyan shadow-[0_0_15px_rgba(0,245,212,0.3)] scale-[1.02]'
                    : 'bg-cyber-surface/60 border-cyber-border hover:border-cyber-cyan/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-cyber-muted font-bold">#{idx + 1}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyber-emerald" />
                </div>
                <div className="text-[11px] font-bold text-white line-clamp-2 leading-tight">
                  {stage.name.replace(/^\d+\.\s*/, '')}
                </div>
                <div className="text-[9px] text-cyber-cyan font-mono truncate">{stage.durationMs}ms</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive 3D Taint Flow Visualizer */}
      <TaintFlow3D />

      {/* Stage Detail + Deep Engine Inspection */}
      {selectedStage && (
        <div className="glass-panel p-5 rounded-2xl flex flex-col gap-4 border border-cyber-cyan/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyber-border/40 pb-3">
            <div>
              <span className="text-xs text-cyber-cyan font-bold">STAGE {selectedStage.id.toUpperCase()}</span>
              <h2 className="text-base font-bold text-white">{selectedStage.name}</h2>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded bg-cyber-surface border border-cyber-border text-cyber-muted">
                Engine: <span className="text-slate-200">{selectedStage.engine}</span>
              </span>
              <span className="px-2.5 py-1 rounded bg-cyber-emerald/20 text-cyber-emerald border border-cyber-emerald/40 font-bold">
                {selectedStage.status}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-cyber-surface/60 p-3 rounded-lg border border-cyber-border/40">
            {selectedStage.summary}
          </p>

          {/* Deep Stage Telemetry Inspector for all 10 stages */}
          <StageInspector
            stage={selectedStage}
            scan={scan}
            finding={selectedFinding || undefined}
          />
        </div>
      )}
    </div>
  );
}
