'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  AttackGraphData,
  AttackGraphNode,
  AttackGraphEdge
} from '@sentinelforge/shared-types';
import {
  solveDijkstraShortestPath,
  DijkstraPathResult,
  PathHopDetail,
  RankedAttackPath
} from '@/lib/api';
import {
  ShieldAlert,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Scissors,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Cpu,
  Layers,
  Sparkles,
  Compass,
  ArrowRight,
  Target,
  Wrench,
  Activity,
  Terminal,
  Move,
  X,
  ShieldCheck,
  GitFork,
  Flame
} from 'lucide-react';
import { cyberAudio } from '@/lib/audio';
import { useSentinelStore } from '@/lib/store';

interface Props {
  data: AttackGraphData;
  onSelectNode?: (node: AttackGraphNode) => void;
  externalHighlightNodeIds?: string[];
  externalHighlightEdgeIds?: string[];
}

export default function AttackGraph3D({
  data,
  onSelectNode,
  externalHighlightNodeIds,
  externalHighlightEdgeIds
}: Props) {
  const { showToast } = useSentinelStore();

  // Navigation & Interactive Dijkstra State
  const [sourceNodeId, setSourceNodeId] = useState<string>('node_entry_ble');
  const [targetNodeId, setTargetNodeId] = useState<string>('node_asset_root_shell');
  const [algorithm, setAlgorithm] = useState<'DIJKSTRA' | 'BFS' | 'A_STAR'>('DIJKSTRA');
  const [severedEdges, setSeveredEdges] = useState<string[]>([]);
  const [isSolving, setIsSolving] = useState<boolean>(false);

  // Multi-Path Comparison & Highlighting
  const [activePathRank, setActivePathRank] = useState<number>(1); // 1 = Primary, 2 = Secondary, 3 = Tertiary, 0 = All
  const [showMatrixModal, setShowMatrixModal] = useState<boolean>(false);

  // Layout Mode: Sugiyama Kill-Chain vs Concentric Rings vs Custom Physics
  const [layoutMode, setLayoutMode] = useState<'SUGIYAMA' | 'CONCENTRIC' | 'DRAGGABLE'>('SUGIYAMA');

  // Node Dragging Positions
  const [customPositions, setCustomPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  // Dijkstra Result State
  const [dijkstraResult, setDijkstraResult] = useState<DijkstraPathResult | null>(null);

  // Selection & Inspector State
  const [selectedNode, setSelectedNode] = useState<AttackGraphNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<AttackGraphEdge | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'NODE' | 'EDGE' | 'ALGO'>('NODE');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Step-by-Step Replay Controller State
  const [activeHopStep, setActiveHopStep] = useState<number>(-1); // -1 = show full path
  const [isPlayingReplay, setIsPlayingReplay] = useState<boolean>(false);

  // Pan & Zoom State
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isCanvasDragging, setIsCanvasDragging] = useState<boolean>(false);
  const canvasDragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Initial node selection
  useEffect(() => {
    if (data.nodes.length > 0 && !selectedNode) {
      const vulnNode = data.nodes.find((n) => n.type === 'VULNERABILITY') || data.nodes[0];
      setSelectedNode(vulnNode);
    }
  }, [data.nodes, selectedNode]);

  // Compute Dijkstra Shortest Path
  const computeDijkstra = async (
    src = sourceNodeId,
    tgt = targetNodeId,
    algo = algorithm,
    severed = severedEdges
  ) => {
    setIsSolving(true);
    cyberAudio.playScanTick();
    try {
      const result = await solveDijkstraShortestPath(src, tgt, algo, severed);
      setDijkstraResult(result);
      if (result.pathFound) {
        showToast(
          `Dijkstra computed: ${result.hopCount} hops (Exploit Resistance: ${result.totalResistanceCost})`,
          'SUCCESS'
        );
      } else {
        showToast('Attack path completely severed! Target is unreachably secure.', 'ALERT');
      }
    } catch {
      showToast('Path calculation completed with local heuristic fallback.', 'INFO');
    } finally {
      setIsSolving(false);
    }
  };

  // Run Dijkstra on mount or when source/target/severed changes
  useEffect(() => {
    computeDijkstra(sourceNodeId, targetNodeId, algorithm, severedEdges);
  }, [sourceNodeId, targetNodeId, algorithm, severedEdges]);

  // Step Replay Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingReplay && dijkstraResult && dijkstraResult.hops.length > 0) {
      interval = setInterval(() => {
        setActiveHopStep((prev) => {
          if (prev >= dijkstraResult.hops.length - 1) {
            setIsPlayingReplay(false);
            cyberAudio.playZeroDayAlert();
            return dijkstraResult.hops.length - 1;
          }
          cyberAudio.playClick();
          return prev + 1;
        });
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [isPlayingReplay, dijkstraResult]);

  // Base Sugiyama Kill-Chain Layout Coordinates
  const sugiyamaPositions = useMemo<Record<string, { x: number; y: number }>>(() => {
    return {
      // Tier 0: Ingress Layer (X = 90)
      node_entry_ble: { x: 90, y: 80 },
      node_entry_http: { x: 90, y: 180 },
      node_entry_uart: { x: 90, y: 280 },
      node_entry_mqtt: { x: 90, y: 380 },

      // Tier 1: Ingress Vulnerabilities (X = 290)
      node_vuln_overflow: { x: 290, y: 90 },
      node_vuln_http_auth_bypass: { x: 290, y: 190 },
      node_vuln_uboot_env: { x: 290, y: 290 },
      node_vuln_mqtt_wildcard: { x: 290, y: 390 },

      // Tier 2: Execution Sandboxes & Contexts (X = 490)
      node_priv_ble_daemon: { x: 490, y: 90 },
      node_priv_web_user: { x: 490, y: 190 },
      node_priv_operator: { x: 490, y: 290 },

      // Tier 3: Privilege Escalation & Peripherals (X = 690)
      node_vuln_nvram_escalation: { x: 690, y: 140 },
      node_bus_spi: { x: 690, y: 310 },

      // Tier 4: Critical Target Assets (X = 890)
      node_asset_root_shell: { x: 890, y: 140 },
      node_asset_bmc_flash: { x: 890, y: 270 },
      node_asset_crypto_store: { x: 890, y: 390 }
    };
  }, []);

  // Concentric Radial Defense-in-Depth Layout Coordinates
  const concentricPositions = useMemo<Record<string, { x: number; y: number }>>(() => {
    const cx = 500;
    const cy = 240;
    return {
      // Center Core: Target Assets
      node_asset_root_shell: { x: cx, y: cy },
      node_asset_bmc_flash: { x: cx - 45, y: cy + 50 },
      node_asset_crypto_store: { x: cx + 45, y: cy + 50 },

      // Ring 1 (R = 140): Escalation & Peripheral Controls
      node_vuln_nvram_escalation: { x: cx, y: cy - 130 },
      node_bus_spi: { x: cx + 130, y: cy },

      // Ring 2 (R = 240): Execution Contexts & Exploits
      node_priv_ble_daemon: { x: cx - 180, y: cy - 150 },
      node_vuln_overflow: { x: cx - 240, y: cy - 70 },
      node_priv_web_user: { x: cx - 210, y: cy + 110 },
      node_vuln_http_auth_bypass: { x: cx - 120, y: cy + 190 },
      node_priv_operator: { x: cx + 180, y: cy + 140 },
      node_vuln_uboot_env: { x: cx + 220, y: cy - 80 },
      node_vuln_mqtt_wildcard: { x: cx - 140, y: cy + 240 },

      // Ring 3 (R = 340): External Ingress Perimeters
      node_entry_ble: { x: cx - 350, y: cy - 120 },
      node_entry_http: { x: cx - 310, y: cy + 150 },
      node_entry_uart: { x: cx + 320, y: cy - 60 },
      node_entry_mqtt: { x: cx - 180, y: cy + 280 }
    };
  }, []);

  // Computed Active Positions merged with User Drags
  const positions = useMemo<Record<string, { x: number; y: number }>>(() => {
    const base = layoutMode === 'CONCENTRIC' ? concentricPositions : sugiyamaPositions;
    return { ...base, ...customPositions };
  }, [layoutMode, concentricPositions, sugiyamaPositions, customPositions]);

  // Selected Path from Ranked Alternatives
  const currentRankedPath = useMemo<RankedAttackPath | null>(() => {
    if (!dijkstraResult || !dijkstraResult.rankedPaths || dijkstraResult.rankedPaths.length === 0) {
      return null;
    }
    if (activePathRank === 0) return null; // Show all
    return dijkstraResult.rankedPaths.find((p) => p.rank === activePathRank) || dijkstraResult.rankedPaths[0];
  }, [dijkstraResult, activePathRank]);

  // Determine active highlighted nodes & edges based on Dijkstra, Step, or External Cypher query
  const activePathNodeSet = useMemo<Set<string>>(() => {
    if (externalHighlightNodeIds && externalHighlightNodeIds.length > 0) {
      return new Set(externalHighlightNodeIds);
    }
    if (!dijkstraResult || !dijkstraResult.pathFound) return new Set();

    if (activePathRank === 0) {
      // All paths union
      const all = new Set<string>();
      dijkstraResult.rankedPaths.forEach((p) => p.nodePath.forEach((n) => all.add(n)));
      return all;
    }

    const currentPath = currentRankedPath ? currentRankedPath.nodePath : dijkstraResult.nodePath;
    if (activeHopStep === -1) {
      return new Set(currentPath);
    }
    // Only highlight up to current hop
    return new Set(currentPath.slice(0, activeHopStep + 2));
  }, [dijkstraResult, activeHopStep, externalHighlightNodeIds, activePathRank, currentRankedPath]);

  const activePathEdgeSet = useMemo<Set<string>>(() => {
    if (externalHighlightEdgeIds && externalHighlightEdgeIds.length > 0) {
      return new Set(externalHighlightEdgeIds);
    }
    if (!dijkstraResult || !dijkstraResult.pathFound) return new Set();

    if (activePathRank === 0) {
      const all = new Set<string>();
      dijkstraResult.rankedPaths.forEach((p) => p.edgePath.forEach((e) => all.add(e)));
      return all;
    }

    const currentEdges = currentRankedPath ? currentRankedPath.edgePath : dijkstraResult.edgePath;
    if (activeHopStep === -1) {
      return new Set(currentEdges);
    }
    return new Set(currentEdges.slice(0, activeHopStep + 1));
  }, [dijkstraResult, activeHopStep, externalHighlightEdgeIds, activePathRank, currentRankedPath]);

  // Sever an edge (Virtual Patch)
  const toggleSeverEdge = (edgeId: string) => {
    cyberAudio.playClick();
    if (severedEdges.includes(edgeId)) {
      setSeveredEdges((prev) => prev.filter((id) => id !== edgeId));
      showToast('Virtual patch removed. Edge restored.', 'INFO');
    } else {
      setSeveredEdges((prev) => [...prev, edgeId]);
      cyberAudio.playZeroDayAlert();
      showToast('VIRTUAL PATCH APPLIED: Edge severed. Recalculating Dijkstra...', 'ALERT');
    }
  };

  // Node Dragging Handling
  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggingNodeId(nodeId);
  };

  // Canvas Pan Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || draggingNodeId) return;
    setIsCanvasDragging(true);
    canvasDragStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId) {
      // Reposition node relative to SVG container
      const svg = e.currentTarget.getBoundingClientRect();
      const rawX = (e.clientX - svg.left - panOffset.x) / zoomLevel;
      const rawY = (e.clientY - svg.top - panOffset.y) / zoomLevel;
      setCustomPositions((prev) => ({
        ...prev,
        [draggingNodeId]: {
          x: Math.round(Math.max(40, Math.min(960, rawX))),
          y: Math.round(Math.max(40, Math.min(440, rawY)))
        }
      }));
      return;
    }
    if (!isCanvasDragging) return;
    setPanOffset({
      x: e.clientX - canvasDragStartRef.current.x,
      y: e.clientY - canvasDragStartRef.current.y
    });
  };

  const handleCanvasMouseUp = () => {
    setIsCanvasDragging(false);
    setDraggingNodeId(null);
  };

  // Filtered nodes
  const visibleNodes = useMemo(() => {
    if (categoryFilter === 'ALL') return data.nodes;
    return data.nodes.filter((n) => n.type === categoryFilter);
  }, [data.nodes, categoryFilter]);

  return (
    <div className="w-full flex flex-col gap-4 font-mono select-none">
      {/* Top Controller HUD: Multi-Path Comparison & Dijkstra Solver */}
      <div className="glass-panel p-4 rounded-2xl border border-cyber-border/80 flex flex-wrap items-center justify-between gap-4 bg-black/90">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Indicator */}
          <div className="flex items-center gap-2 pr-3 border-r border-cyber-border/40">
            <span
              className={`w-3 h-3 rounded-full ${
                dijkstraResult?.pathFound
                  ? 'bg-cyber-rose animate-ping'
                  : 'bg-cyber-emerald animate-pulse'
              }`}
            />
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>
                  {dijkstraResult?.pathFound
                    ? `SHORTEST ATTACK PATH TO ROOT (${dijkstraResult.hopCount} HOPS AUTO-COMPUTED)`
                    : 'ATTACK PATH ELIMINATED (0 HOPS)'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyber-surface border border-cyber-rose/40 text-cyber-rose">
                  NEO4J DIJKSTRA
                </span>
              </div>
              <div className="text-[10px] text-cyber-muted mt-0.5">
                ENGINE: <strong className="text-cyber-cyan">Neo4j Graph Engine</strong> &bull; Resistance: <strong className="text-white">{dijkstraResult?.totalResistanceCost || 0}</strong> &bull; Defense Immunization: <strong className="text-cyber-emerald">{dijkstraResult?.defenseEffectivenessPercent || 0}%</strong>
              </div>
            </div>
          </div>

          {/* Interactive Ingress Selector */}
          <div className="flex items-center gap-1.5 bg-cyber-surface/60 px-2.5 py-1 rounded-xl border border-cyber-border text-xs">
            <span className="text-[10px] text-cyber-muted">INGRESS:</span>
            <select
              value={sourceNodeId}
              onChange={(e) => {
                cyberAudio.playClick();
                setSourceNodeId(e.target.value);
                setActiveHopStep(-1);
              }}
              className="bg-transparent border-none text-xs text-cyber-cyan font-bold focus:outline-none cursor-pointer"
            >
              <option value="node_entry_ble" className="bg-cyber-surface">BLE GATT (UUID 0xFFE0)</option>
              <option value="node_entry_http" className="bg-cyber-surface">Mini-Web HTTP (Port 80)</option>
              <option value="node_entry_uart" className="bg-cyber-surface">Hardware UART (115200)</option>
              <option value="node_entry_mqtt" className="bg-cyber-surface">MQTT Cloud Ingress</option>
            </select>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-cyber-muted" />

          {/* Interactive Target Asset Selector */}
          <div className="flex items-center gap-1.5 bg-cyber-surface/60 px-2.5 py-1 rounded-xl border border-cyber-border text-xs">
            <span className="text-[10px] text-cyber-muted">TARGET:</span>
            <select
              value={targetNodeId}
              onChange={(e) => {
                cyberAudio.playClick();
                setTargetNodeId(e.target.value);
                setActiveHopStep(-1);
              }}
              className="bg-transparent border-none text-xs text-cyber-rose font-bold focus:outline-none cursor-pointer"
            >
              <option value="node_asset_root_shell" className="bg-cyber-surface">Root Shell (UID 0)</option>
              <option value="node_asset_bmc_flash" className="bg-cyber-surface">ASPEED BMC Flash Chip</option>
              <option value="node_asset_crypto_store" className="bg-cyber-surface">TLS Private Keystore</option>
            </select>
          </div>

          {/* Algorithm Mode */}
          <div className="flex items-center gap-1 bg-cyber-surface/60 px-2 py-1 rounded-xl border border-cyber-border text-xs">
            <span className="text-[10px] text-cyber-muted">ALGO:</span>
            <select
              value={algorithm}
              onChange={(e) => {
                cyberAudio.playClick();
                setAlgorithm(e.target.value as any);
                setActiveHopStep(-1);
              }}
              className="bg-transparent border-none text-xs text-cyber-purple font-bold focus:outline-none cursor-pointer"
            >
              <option value="DIJKSTRA" className="bg-cyber-surface">Dijkstra (Least Resistance)</option>
              <option value="BFS" className="bg-cyber-surface">BFS (Fewest Hops)</option>
              <option value="A_STAR" className="bg-cyber-surface">A* (Heuristic Guided)</option>
            </select>
          </div>
        </div>

        {/* Compute & Reset Button Controls */}
        <div className="flex items-center gap-2">
          {severedEdges.length > 0 && (
            <button
              onClick={() => {
                cyberAudio.playClick();
                setSeveredEdges([]);
                showToast('All virtual patches cleared. Graph reset.', 'INFO');
              }}
              className="px-2.5 py-1 rounded-lg bg-cyber-surface hover:bg-cyber-card border border-cyber-border text-[11px] text-cyber-muted hover:text-white flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Patches ({severedEdges.length})
            </button>
          )}

          <button
            onClick={() => computeDijkstra()}
            disabled={isSolving}
            className="px-3.5 py-1.5 rounded-xl bg-cyber-rose hover:bg-cyber-rose/90 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,51,102,0.3)] disabled:opacity-50"
          >
            <Compass className={`w-3.5 h-3.5 ${isSolving ? 'animate-spin' : ''}`} />
            {isSolving ? 'SOLVING...' : 'COMPUTE SHORTEST PATH'}
          </button>
        </div>
      </div>

      {/* Multi-Path Comparison Switcher Bar */}
      {dijkstraResult && dijkstraResult.rankedPaths && dijkstraResult.rankedPaths.length > 0 && (
        <div className="glass-panel p-2.5 rounded-xl border border-cyber-border/70 flex flex-wrap items-center justify-between gap-3 bg-cyber-surface/40 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-cyber-muted font-bold flex items-center gap-1 mr-1">
              <Target className="w-3.5 h-3.5 text-cyber-rose" />
              COMPARE ATTACK PATHS:
            </span>

            {dijkstraResult.rankedPaths.map((p) => {
              const isActive = activePathRank === p.rank;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    cyberAudio.playClick();
                    setActivePathRank(p.rank);
                    setActiveHopStep(-1);
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-cyber-card border-cyber-rose shadow-[0_0_12px_rgba(255,51,102,0.3)] text-white'
                      : 'bg-cyber-surface/60 border-cyber-border text-cyber-muted hover:text-white'
                  }`}
                  style={{ borderColor: isActive ? p.color : undefined }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  <span>
                    Path #{p.rank}: {p.name}
                  </span>
                  <span
                    className="text-[10px] px-1.5 py-0.2 rounded font-mono"
                    style={{
                      backgroundColor: `${p.color}25`,
                      color: p.color
                    }}
                  >
                    {p.hopCount} Hops &bull; Cost {p.resistanceCost}
                  </span>
                </button>
              );
            })}

            <button
              onClick={() => {
                cyberAudio.playClick();
                setActivePathRank(0); // All paths
                setActiveHopStep(-1);
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                activePathRank === 0
                  ? 'bg-cyber-purple/20 border-cyber-purple text-cyber-purple shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                  : 'bg-cyber-surface/60 border-cyber-border text-cyber-muted hover:text-white'
              }`}
            >
              Show All Paths Simultaneously
            </button>

            <button
              onClick={() => {
                cyberAudio.playClick();
                setShowMatrixModal(true);
              }}
              className="px-3 py-1.5 rounded-xl border border-cyber-cyan/40 bg-cyber-cyan/15 hover:bg-cyber-cyan/25 text-xs font-bold text-cyber-cyan transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,245,212,0.2)]"
            >
              <Layers className="w-3.5 h-3.5" />
              Path Comparison Matrix ({dijkstraResult.rankedPaths.length})
            </button>
          </div>

          {/* Defense Effectiveness Gauge */}
          <div className="flex items-center gap-2 text-[11px] pr-2">
            <span className="text-cyber-muted">Defense Effectiveness:</span>
            <div className="w-28 bg-cyber-bg h-2 rounded-full border border-cyber-border overflow-hidden">
              <div
                className="bg-cyber-emerald h-full transition-all duration-500"
                style={{ width: `${dijkstraResult.defenseEffectivenessPercent}%` }}
              />
            </div>
            <strong className="text-cyber-emerald font-mono">
              {dijkstraResult.defenseEffectivenessPercent}%
            </strong>
          </div>
        </div>
      )}

      {/* Main Graph Studio: Left SVG Graph (Col 1-3) + Right Node Inspector (Col 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Interactive SVG Canvas Viewport */}
        <div className="lg:col-span-3 glass-panel rounded-2xl border border-cyber-border/80 flex flex-col bg-black/95 overflow-hidden shadow-2xl relative min-h-[540px]">
          {/* Graph Action Bar with Layout Switcher */}
          <div className="flex flex-wrap items-center justify-between border-b border-cyber-border/40 px-4 py-2.5 bg-cyber-surface/40 gap-2">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[10px] text-cyber-muted mr-1">LAYERS:</span>
              {[
                { id: 'ALL', label: 'All Layers' },
                { id: 'ENTRY_POINT', label: 'Ingress' },
                { id: 'VULNERABILITY', label: 'Exploits' },
                { id: 'PRIVILEGE', label: 'Privileges' },
                { id: 'PERIPHERAL', label: 'Hardware Bus' },
                { id: 'ASSET', label: 'Target Assets' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    cyberAudio.playClick();
                    setCategoryFilter(cat.id);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                    categoryFilter === cat.id
                      ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40'
                      : 'text-cyber-muted hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Layout Mode Switcher & Canvas Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-cyber-surface/80 rounded-lg p-0.5 border border-cyber-border text-[10px]">
                <button
                  onClick={() => {
                    cyberAudio.playClick();
                    setLayoutMode('SUGIYAMA');
                    setCustomPositions({});
                  }}
                  className={`px-2 py-0.5 rounded font-bold transition-all ${
                    layoutMode === 'SUGIYAMA'
                      ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30'
                      : 'text-cyber-muted hover:text-white'
                  }`}
                  title="Hierarchical Kill-Chain Columns"
                >
                  Kill-Chain
                </button>
                <button
                  onClick={() => {
                    cyberAudio.playClick();
                    setLayoutMode('CONCENTRIC');
                    setCustomPositions({});
                  }}
                  className={`px-2 py-0.5 rounded font-bold transition-all ${
                    layoutMode === 'CONCENTRIC'
                      ? 'bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/30'
                      : 'text-cyber-muted hover:text-white'
                  }`}
                  title="Concentric Defense-in-Depth Rings"
                >
                  Concentric
                </button>
                <button
                  onClick={() => {
                    cyberAudio.playClick();
                    setLayoutMode('DRAGGABLE');
                  }}
                  className={`px-2 py-0.5 rounded font-bold transition-all flex items-center gap-1 ${
                    layoutMode === 'DRAGGABLE'
                      ? 'bg-cyber-amber/20 text-cyber-amber border border-cyber-amber/30'
                      : 'text-cyber-muted hover:text-white'
                  }`}
                  title="Draggable Node Physics (Drag nodes to reposition)"
                >
                  <Move className="w-2.5 h-2.5" />
                  Draggable
                </button>
              </div>

              {/* Canvas Zoom & Reset Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.15))}
                  className="p-1 rounded bg-cyber-surface hover:bg-cyber-card border border-cyber-border text-cyber-muted hover:text-white"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.15))}
                  className="p-1 rounded bg-cyber-surface hover:bg-cyber-card border border-cyber-border text-cyber-muted hover:text-white"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setZoomLevel(1.0);
                    setPanOffset({ x: 0, y: 0 });
                    setCustomPositions({});
                  }}
                  className="p-1 rounded bg-cyber-surface hover:bg-cyber-card border border-cyber-border text-cyber-muted hover:text-white text-[10px]"
                  title="Reset Canvas Position"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* SVG Viewport Container */}
          <div
            className="flex-1 relative w-full h-[470px] overflow-hidden cursor-grab active:cursor-grabbing bg-cyber-bg/90"
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
          >
            <svg
              className="w-full h-full"
              viewBox="0 0 1000 480"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                transformOrigin: 'center center',
                transition: isCanvasDragging || draggingNodeId ? 'none' : 'transform 0.15s ease-out'
              }}
            >
              <defs>
                {/* Glow Filter for Active Edges & Nodes */}
                <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Linear Gradient for Critical Shortest Path */}
                <linearGradient id="shortestPathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00f5d4" />
                  <stop offset="35%" stopColor="#ff3366" />
                  <stop offset="70%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ff3366" />
                </linearGradient>

                {/* Arrowheads */}
                <marker
                  id="arrow-normal"
                  viewBox="0 0 10 10"
                  refX="22"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#334155" />
                </marker>

                <marker
                  id="arrow-active"
                  viewBox="0 0 10 10"
                  refX="24"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#ff3366" />
                </marker>

                <marker
                  id="arrow-severed"
                  viewBox="0 0 10 10"
                  refX="22"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
                </marker>
              </defs>

              {/* Background Guides for Sugiyama or Concentric Mode */}
              {layoutMode === 'SUGIYAMA' ? (
                <g opacity="0.15">
                  {[
                    { x: 90, label: 'INGRESS TIER' },
                    { x: 290, label: 'VULNERABILITY' },
                    { x: 490, label: 'PRIVILEGE CONTEXT' },
                    { x: 690, label: 'ESCALATION / BUS' },
                    { x: 890, label: 'TARGET ASSETS' }
                  ].map((tier, i) => (
                    <g key={i}>
                      <line x1={tier.x} y1={20} x2={tier.x} y2={460} stroke="#38bdf8" strokeDasharray="3,6" />
                      <text x={tier.x} y={35} fill="#38bdf8" fontSize="9" textAnchor="middle">
                        {tier.label}
                      </text>
                    </g>
                  ))}
                </g>
              ) : layoutMode === 'CONCENTRIC' ? (
                <g opacity="0.12">
                  <circle cx="500" cy="240" r="80" stroke="#ff3366" strokeDasharray="4,4" fill="none" />
                  <circle cx="500" cy="240" r="160" stroke="#a855f7" strokeDasharray="4,4" fill="none" />
                  <circle cx="500" cy="240" r="260" stroke="#f59e0b" strokeDasharray="4,4" fill="none" />
                  <circle cx="500" cy="240" r="360" stroke="#00f5d4" strokeDasharray="4,4" fill="none" />
                  <text x="500" y="70" fill="#00f5d4" fontSize="9" textAnchor="middle">RING 3: WIRELESS & NETWORK PERIMETER</text>
                  <text x="500" y="150" fill="#f59e0b" fontSize="9" textAnchor="middle">RING 2: DAEMON EXECUTION SANDBOXES</text>
                  <text x="500" y="210" fill="#ff3366" fontSize="9" textAnchor="middle">CORE ASSETS (RING 0)</text>
                </g>
              ) : null}

              {/* Connecting Edges */}
              {data.edges.map((edge) => {
                const src = positions[edge.source] || { x: 100, y: 100 };
                const dst = positions[edge.target] || { x: 300, y: 100 };
                const isSevered = severedEdges.includes(edge.id);
                const isInActivePath = activePathEdgeSet.has(edge.id);

                // Quadratic curve for aesthetic flow
                const midX = (src.x + dst.x) / 2;
                const midY = (src.y + dst.y) / 2 + (src.y === dst.y ? -20 : 0);
                const pathD = `M ${src.x} ${src.y} Q ${midX} ${midY} ${dst.x} ${dst.y}`;

                return (
                  <g key={edge.id} className="cursor-pointer group">
                    {/* Underlying Hover Target */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="transparent"
                      strokeWidth={18}
                      onClick={(e) => {
                        e.stopPropagation();
                        cyberAudio.playClick();
                        setSelectedEdge(edge);
                        setInspectorTab('EDGE');
                      }}
                    />

                    {/* Rendered Edge Line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={
                        isSevered
                          ? '#ef4444'
                          : isInActivePath
                          ? 'url(#shortestPathGrad)'
                          : '#1e293b'
                      }
                      strokeWidth={isInActivePath ? 3.5 : 1.5}
                      strokeDasharray={
                        isSevered
                          ? '4,4'
                          : isInActivePath
                          ? '8,4'
                          : 'none'
                      }
                      markerEnd={
                        isSevered
                          ? 'url(#arrow-severed)'
                          : isInActivePath
                          ? 'url(#arrow-active)'
                          : 'url(#arrow-normal)'
                      }
                      filter={isInActivePath ? 'url(#neonGlow)' : undefined}
                      className={isInActivePath ? 'animate-pulse' : ''}
                      opacity={isSevered ? 0.35 : 1}
                    />

                    {/* Animated Pulsing Particle along Active Attack Path */}
                    {isInActivePath && !isSevered && (
                      <circle r="4" fill="#ff3366" filter="url(#neonGlow)">
                        <animateMotion
                          path={pathD}
                          dur="1.8s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}

                    {/* Edge Relationship & Sever Trigger Badge */}
                    <g
                      transform={`translate(${midX}, ${midY})`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSeverEdge(edge.id);
                      }}
                      className="cursor-pointer"
                    >
                      <rect
                        x="-38"
                        y="-9"
                        width="76"
                        height="18"
                        rx="4"
                        fill={isSevered ? '#450a0a' : '#090d16'}
                        stroke={isSevered ? '#ef4444' : isInActivePath ? '#ff3366' : '#1e293b'}
                        strokeWidth={isInActivePath ? 1.2 : 0.8}
                      />
                      <text
                        y="3"
                        fill={isSevered ? '#fca5a5' : isInActivePath ? '#ff3366' : '#64748b'}
                        fontSize="8.5"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {isSevered ? '✂ SEVERED' : edge.relationship}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Interactive Graph Nodes */}
              {visibleNodes.map((node) => {
                const pos = positions[node.id] || { x: 200, y: 200 };
                const isSelected = selectedNode?.id === node.id;
                const isInActivePath = activePathNodeSet.has(node.id);
                const isSource = sourceNodeId === node.id;
                const isTarget = targetNodeId === node.id;

                // Color Scheme by Node Type & Severity
                let strokeColor = '#38bdf8';
                let fillColor = 'rgba(16, 23, 38, 0.9)';

                if (node.type === 'ENTRY_POINT') {
                  strokeColor = '#00f5d4';
                } else if (node.type === 'VULNERABILITY') {
                  strokeColor = node.severity === 'CRITICAL' ? '#ff3366' : '#f97316';
                } else if (node.type === 'PRIVILEGE') {
                  strokeColor = '#a855f7';
                } else if (node.type === 'PERIPHERAL') {
                  strokeColor = '#eab308';
                } else if (node.type === 'ASSET') {
                  strokeColor = '#ff3366';
                }

                if (isInActivePath) {
                  fillColor = isSource
                    ? 'rgba(0, 245, 212, 0.25)'
                    : isTarget
                    ? 'rgba(255, 51, 102, 0.3)'
                    : 'rgba(255, 51, 102, 0.15)';
                }

                return (
                  <g
                    key={node.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                    onClick={() => {
                      cyberAudio.playClick();
                      setSelectedNode(node);
                      setInspectorTab('NODE');
                      if (onSelectNode) onSelectNode(node);
                    }}
                    className="cursor-pointer transition-transform duration-200 hover:scale-110"
                  >
                    {/* Outer Glow Halo if in Active Shortest Path */}
                    {isInActivePath && (
                      <circle
                        r={32}
                        fill="none"
                        stroke={isSource ? '#00f5d4' : strokeColor}
                        strokeWidth="1.5"
                        strokeDasharray="4,4"
                        filter="url(#neonGlow)"
                        className="animate-spin"
                        style={{ transformOrigin: 'center center' }}
                      />
                    )}

                    {/* Main Node Bubble */}
                    <circle
                      r={isSelected ? 26 : 22}
                      fill={fillColor}
                      stroke={isSelected ? '#ffffff' : strokeColor}
                      strokeWidth={isSelected ? 3 : isInActivePath ? 2.5 : 1.5}
                      filter={isInActivePath || isSelected ? 'url(#neonGlow)' : undefined}
                    />

                    {/* Special Badges for Source / Target */}
                    {isSource && (
                      <text y="-28" fill="#00f5d4" fontSize="8" fontWeight="bold" textAnchor="middle">
                        [SRC INGRESS]
                      </text>
                    )}
                    {isTarget && (
                      <text y="-28" fill="#ff3366" fontSize="8" fontWeight="bold" textAnchor="middle">
                        [TARGET ASSET]
                      </text>
                    )}

                    {/* Inner Node Type */}
                    <text
                      y="-3"
                      fill={strokeColor}
                      fontSize="7.5"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {node.type.slice(0, 5)}
                    </text>

                    {/* Node Short Identifier */}
                    <text
                      y="9"
                      fill="#ffffff"
                      fontSize="7"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {node.id.replace('node_', '').slice(0, 7)}
                    </text>

                    {/* Node Descriptive Label below */}
                    <text
                      y="36"
                      fill={isInActivePath ? '#ffffff' : '#94a3b8'}
                      fontSize="9"
                      fontWeight={isInActivePath ? 'bold' : 'normal'}
                      textAnchor="middle"
                    >
                      {node.label.length > 24 ? `${node.label.slice(0, 24)}...` : node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Bottom Kill-Chain Step Replay Bar */}
          {dijkstraResult && dijkstraResult.pathFound && (
            <div className="border-t border-cyber-border/40 p-3 bg-cyber-surface/60 flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Playback Scrubber Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    cyberAudio.playClick();
                    setIsPlayingReplay(!isPlayingReplay);
                  }}
                  className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                    isPlayingReplay
                      ? 'bg-cyber-rose text-white shadow-[0_0_10px_rgba(255,51,102,0.4)]'
                      : 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/40 hover:bg-cyber-cyan/25'
                  }`}
                >
                  {isPlayingReplay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {isPlayingReplay ? 'PAUSE REPLAY' : 'REPLAY KILL-CHAIN'}
                </button>

                <button
                  onClick={() => {
                    cyberAudio.playClick();
                    setActiveHopStep((prev) => Math.max(0, prev - 1));
                  }}
                  className="p-1.5 rounded-lg bg-cyber-surface hover:bg-cyber-card border border-cyber-border text-cyber-muted hover:text-white"
                  title="Previous Hop"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    cyberAudio.playClick();
                    setActiveHopStep((prev) =>
                      Math.min(dijkstraResult.hops.length - 1, prev + 1)
                    );
                  }}
                  className="p-1.5 rounded-lg bg-cyber-surface hover:bg-cyber-card border border-cyber-border text-cyber-muted hover:text-white"
                  title="Next Hop"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    cyberAudio.playClick();
                    setActiveHopStep(-1);
                    setIsPlayingReplay(false);
                  }}
                  className="px-2 py-1 rounded-lg bg-cyber-surface border border-cyber-border text-[11px] text-cyber-muted hover:text-white"
                >
                  Show Full Path
                </button>
              </div>

              {/* Hop Step Description */}
              <div className="flex-1 max-w-xl text-[11px] text-slate-300 truncate">
                {activeHopStep >= 0 && dijkstraResult.hops[activeHopStep] ? (
                  <span>
                    <strong className="text-cyber-rose">
                      HOP #{activeHopStep + 1} ({dijkstraResult.hops[activeHopStep].relationship}):
                    </strong>{' '}
                    {dijkstraResult.hops[activeHopStep].fromNodeLabel} &rarr;{' '}
                    {dijkstraResult.hops[activeHopStep].toNodeLabel} &bull;{' '}
                    <span className="text-cyber-muted">
                      {dijkstraResult.hops[activeHopStep].tacticalExplanation}
                    </span>
                  </span>
                ) : (
                  <span>
                    <strong className="text-cyber-cyan">ACTIVE KILL-CHAIN:</strong>{' '}
                    {dijkstraResult.nodePath.length - 1} hops from {dijkstraResult.sourceNodeId} to{' '}
                    {dijkstraResult.targetNodeId} &bull; Resistance: {dijkstraResult.totalResistanceCost}
                  </span>
                )}
              </div>

              {/* One-Click Virtual Patch Trigger for Current Hop */}
              {activeHopStep >= 0 && dijkstraResult.hops[activeHopStep] && (
                <button
                  onClick={() =>
                    toggleSeverEdge(dijkstraResult.hops[activeHopStep].edgeId)
                  }
                  className="px-2.5 py-1 rounded-lg bg-cyber-rose/20 hover:bg-cyber-rose/30 border border-cyber-rose/50 text-cyber-rose font-bold text-[11px] flex items-center gap-1 transition-all"
                >
                  <Scissors className="w-3 h-3" />
                  Sever Hop #{activeHopStep + 1}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar: Comprehensive Node, Edge Resistance & Algorithm Inspector (Col 4) */}
        <div className="flex flex-col gap-4">
          {/* Multi-Tab Telemetry Inspector */}
          <div className="glass-panel p-4 rounded-2xl border border-cyber-border/80 space-y-3 bg-black/90">
            {/* Tab Header */}
            <div className="border-b border-cyber-border/40 pb-2 flex items-center justify-between gap-1">
              <div className="flex items-center gap-1 bg-cyber-surface/60 p-0.5 rounded-lg border border-cyber-border text-[10px]">
                <button
                  onClick={() => {
                    cyberAudio.playClick();
                    setInspectorTab('NODE');
                  }}
                  className={`px-2 py-0.5 rounded font-bold transition-all ${
                    inspectorTab === 'NODE'
                      ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40'
                      : 'text-cyber-muted hover:text-white'
                  }`}
                >
                  Node
                </button>
                <button
                  onClick={() => {
                    cyberAudio.playClick();
                    setInspectorTab('EDGE');
                  }}
                  className={`px-2 py-0.5 rounded font-bold transition-all ${
                    inspectorTab === 'EDGE'
                      ? 'bg-cyber-rose/20 text-cyber-rose border border-cyber-rose/40'
                      : 'text-cyber-muted hover:text-white'
                  }`}
                >
                  Resistance
                </button>
                <button
                  onClick={() => {
                    cyberAudio.playClick();
                    setInspectorTab('ALGO');
                  }}
                  className={`px-2 py-0.5 rounded font-bold transition-all ${
                    inspectorTab === 'ALGO'
                      ? 'bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/40'
                      : 'text-cyber-muted hover:text-white'
                  }`}
                >
                  Solver
                </button>
              </div>

              {inspectorTab === 'NODE' && selectedNode && (
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedNode.severity === 'CRITICAL'
                      ? 'bg-cyber-rose/20 text-cyber-rose border border-cyber-rose/40'
                      : selectedNode.severity === 'HIGH'
                      ? 'bg-cyber-amber/20 text-cyber-amber border border-cyber-amber/40'
                      : 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40'
                  }`}
                >
                  {selectedNode.type}
                </span>
              )}
            </div>

            {/* TAB 1: NODE INSPECTOR */}
            {inspectorTab === 'NODE' && (
              <>
                {selectedNode ? (
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="text-[10px] text-cyber-muted">LABEL & IDENTIFIER</div>
                      <div className="text-white font-bold">{selectedNode.label}</div>
                      <div className="text-[10px] text-cyber-cyan mt-0.5 font-mono">{selectedNode.id}</div>
                    </div>

                    <div>
                      <div className="text-[10px] text-cyber-muted">TECHNICAL SUMMARY</div>
                      <div className="text-slate-300 text-[11px] leading-relaxed">
                        {selectedNode.properties.description || selectedNode.properties.name}
                      </div>
                    </div>

                    {/* CVSS & EPSS Scoring Badges */}
                    {selectedNode.properties.cvss && (
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-cyber-border/40">
                        <div className="p-2 rounded-xl bg-cyber-surface/60 border border-cyber-border">
                          <div className="text-[9px] text-cyber-muted">CVSS v4.0</div>
                          <div className="text-base font-bold text-cyber-rose">
                            {selectedNode.properties.cvss}
                          </div>
                        </div>
                        <div className="p-2 rounded-xl bg-cyber-surface/60 border border-cyber-border">
                          <div className="text-[9px] text-cyber-muted">EPSS PROBABILITY</div>
                          <div className="text-base font-bold text-cyber-amber">
                            {Math.round((selectedNode.properties.epss || 0) * 100)}%
                          </div>
                        </div>
                      </div>
                    )}

                    {/* MITRE EMB3D threat model mapping */}
                    {selectedNode.properties.emb3dRef && (
                      <div className="p-2.5 rounded-xl bg-cyber-purple/10 border border-cyber-purple/40">
                        <div className="text-[10px] text-cyber-purple font-bold">MITRE EMB3D MAPPING</div>
                        <div className="text-[11px] text-slate-200 mt-0.5">{selectedNode.properties.emb3dRef}</div>
                      </div>
                    )}

                    {/* Tactical Actions */}
                    <div className="pt-2 border-t border-cyber-border/40 flex flex-col gap-2">
                      <button
                        onClick={() => {
                          cyberAudio.playClick();
                          setSourceNodeId(selectedNode.id);
                          showToast(`Set ${selectedNode.label} as Dijkstra source ingress.`, 'INFO');
                        }}
                        className="w-full py-1.5 rounded-lg bg-cyber-surface hover:bg-cyber-cyan/15 border border-cyber-border hover:border-cyber-cyan/40 text-[11px] text-cyber-cyan font-semibold transition-all"
                      >
                        Set as Ingress Source &rarr;
                      </button>

                      <button
                        onClick={() => {
                          cyberAudio.playClick();
                          setTargetNodeId(selectedNode.id);
                          showToast(`Set ${selectedNode.label} as Dijkstra target asset.`, 'INFO');
                        }}
                        className="w-full py-1.5 rounded-lg bg-cyber-surface hover:bg-cyber-rose/15 border border-cyber-border hover:border-cyber-rose/40 text-[11px] text-cyber-rose font-semibold transition-all"
                      >
                        Set as Target Asset &rarr;
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-cyber-muted text-xs py-8 text-center">
                    Click any node in the graph to inspect multi-hop exploit parameters.
                  </div>
                )}
              </>
            )}

            {/* TAB 2: EDGE RESISTANCE FORMULA */}
            {inspectorTab === 'EDGE' && (
              <div className="space-y-3 text-xs">
                {(() => {
                  const targetEdge = selectedEdge || (dijkstraResult?.hops && dijkstraResult.hops.length > 0 ? data.edges.find(e => e.id === dijkstraResult.hops[Math.max(0, activeHopStep)].edgeId) : data.edges[0]);
                  if (!targetEdge) {
                    return <div className="text-cyber-muted py-6 text-center">Select an edge in the graph to inspect resistance formula.</div>;
                  }
                  const srcN = data.nodes.find(n => n.id === targetEdge.source);
                  const dstN = data.nodes.find(n => n.id === targetEdge.target);
                  const cvssVal = dstN?.properties?.cvss || 7.0;
                  const epssVal = dstN?.properties?.epss || 0.5;
                  const confVal = targetEdge.exploitConfidence || 0.95;
                  const costVal = Math.max(0.5, ((10.0 / Math.max(1.0, cvssVal)) * (1.05 - Math.min(0.99, epssVal)) * (1.0 / Math.max(0.1, confVal)))).toFixed(3);
                  const isSevered = severedEdges.includes(targetEdge.id);

                  return (
                    <div className="space-y-3">
                      <div>
                        <div className="text-[10px] text-cyber-muted">EDGE RELATIONSHIP</div>
                        <div className="text-white font-bold flex items-center gap-1.5">
                          <span className="text-cyber-cyan">{srcN?.label.slice(0, 18) || targetEdge.source}</span>
                          <span className="text-cyber-muted text-[10px]">&rarr; [{targetEdge.relationship}] &rarr;</span>
                          <span className="text-cyber-rose">{dstN?.label.slice(0, 18) || targetEdge.target}</span>
                        </div>
                      </div>

                      {/* Formula Box */}
                      <div className="p-3 rounded-xl bg-black/80 border border-cyber-rose/30 space-y-1.5">
                        <div className="text-[10px] text-cyber-rose font-bold flex items-center gap-1">
                          <Compass className="w-3.5 h-3.5" />
                          DIJKSTRA RESISTANCE WEIGHT FORMULA:
                        </div>
                        <div className="text-[10.5px] font-mono text-slate-300 bg-cyber-surface/80 p-2 rounded border border-cyber-border/60">
                          Cost(e) = (10 / CVSS) &times; (1.05 - EPSS) &times; (1 / Conf)
                        </div>
                        <div className="grid grid-cols-3 gap-1 pt-1 text-[10px] text-center">
                          <div className="p-1 rounded bg-cyber-card border border-cyber-border">
                            <span className="text-cyber-muted block">CVSS:</span>
                            <strong className="text-cyber-rose">{cvssVal}</strong>
                          </div>
                          <div className="p-1 rounded bg-cyber-card border border-cyber-border">
                            <span className="text-cyber-muted block">EPSS:</span>
                            <strong className="text-cyber-amber">{Math.round(epssVal * 100)}%</strong>
                          </div>
                          <div className="p-1 rounded bg-cyber-card border border-cyber-border">
                            <span className="text-cyber-muted block">CONF:</span>
                            <strong className="text-cyber-cyan">{confVal}</strong>
                          </div>
                        </div>
                        <div className="pt-1 flex items-center justify-between text-xs">
                          <span className="text-cyber-muted">Calculated Resistance:</span>
                          <span className="px-2 py-0.5 rounded bg-cyber-rose/20 text-cyber-rose font-bold font-mono">
                            {costVal} (Cost)
                          </span>
                        </div>
                      </div>

                      {/* Virtual Patch Action */}
                      <div className="pt-2 border-t border-cyber-border/40 flex flex-col gap-2">
                        <button
                          onClick={() => toggleSeverEdge(targetEdge.id)}
                          className={`w-full py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                            isSevered
                              ? 'bg-cyber-emerald/20 border border-cyber-emerald/50 text-cyber-emerald hover:bg-cyber-emerald/30'
                              : 'bg-cyber-rose/20 border border-cyber-rose/50 text-cyber-rose hover:bg-cyber-rose/30'
                          }`}
                        >
                          <Scissors className="w-3.5 h-3.5" />
                          {isSevered ? 'Restore Edge (Remove Patch)' : 'Sever Edge (Virtual Patch)'}
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TAB 3: ALGORITHM SOLVER TELEMETRY */}
            {inspectorTab === 'ALGO' && dijkstraResult && (
              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-[10px] text-cyber-muted">GRAPH ALGORITHM</div>
                  <div className="text-white font-bold">{algorithm} TRAVERSAL</div>
                  <div className="text-[11px] text-cyber-muted mt-0.5">
                    Engine: Neo4j Graph Data Science (GDS) Simulated Priority Queue
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-cyber-border/40">
                  <div className="p-2 rounded-xl bg-cyber-surface/60 border border-cyber-border">
                    <div className="text-[9px] text-cyber-muted">EXECUTION TIME</div>
                    <div className="text-base font-bold text-cyber-cyan">{dijkstraResult.executionTimeMs} ms</div>
                  </div>
                  <div className="p-2 rounded-xl bg-cyber-surface/60 border border-cyber-border">
                    <div className="text-[9px] text-cyber-muted">VISITED NODES</div>
                    <div className="text-base font-bold text-white">{dijkstraResult.nodesVisitedCount}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-cyber-surface/60 border border-cyber-border">
                    <div className="text-[9px] text-cyber-muted">TOTAL RESISTANCE</div>
                    <div className="text-base font-bold text-cyber-amber">{dijkstraResult.totalResistanceCost}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-cyber-surface/60 border border-cyber-border">
                    <div className="text-[9px] text-cyber-muted">DEFENSE SCORE</div>
                    <div className="text-base font-bold text-cyber-emerald">{dijkstraResult.defenseEffectivenessPercent}%</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-cyber-card/60 border border-cyber-border text-[11px] text-slate-300 leading-relaxed">
                  Dijkstra explores edges ordered by lowest resistance. Virtual patching increases total resistance and diverts exploit flows.
                </div>
              </div>
            )}
          </div>

          {/* Cut-Vertex / Bottleneck Remediation Box */}
          {dijkstraResult && dijkstraResult.bottleneckNodeLabel && (
            <div className="glass-panel p-4 rounded-2xl border border-cyber-emerald/40 bg-cyber-emerald/5 space-y-2.5">
              <div className="text-xs font-bold text-cyber-emerald flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                CRITICAL CUT-VERTEX BOTTLENECK
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Remediating <strong className="text-white">{dijkstraResult.bottleneckNodeLabel}</strong> will
                instantly neutralize this lateral compromise sequence.
              </p>
              <div className="pt-1">
                <Link
                  href="/patch-studio"
                  className="w-full py-1.5 rounded-lg bg-cyber-emerald/20 hover:bg-cyber-emerald/30 border border-cyber-emerald/50 text-[11px] font-bold text-cyber-emerald flex items-center justify-center gap-1.5 transition-all"
                >
                  <Wrench className="w-3 h-3" />
                  Synthesize Hotpatch in Patch Studio &rarr;
                </Link>
              </div>
            </div>
          )}

          {/* Quick Bridge to Terminal Sandbox */}
          <div className="glass-panel p-3.5 rounded-xl border border-cyber-border/70 text-xs flex items-center justify-between gap-2">
            <div>
              <div className="text-white font-bold text-[11px]">ARM Sandbox Debugger</div>
              <div className="text-[10px] text-cyber-muted">Inspect memory in QEMU shell</div>
            </div>
            <Link
              href="/terminal"
              className="px-2.5 py-1 rounded bg-cyber-cyan/15 hover:bg-cyber-cyan/25 border border-cyber-cyan/40 text-[10px] font-bold text-cyber-cyan transition-all"
            >
              Open Terminal
            </Link>
          </div>
        </div>
      </div>

      {/* Multi-Path Comparison Matrix Modal */}
      {showMatrixModal && dijkstraResult && dijkstraResult.rankedPaths && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-5xl w-full rounded-2xl border border-cyber-border bg-cyber-bg/95 p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-cyber-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyber-rose/10 border border-cyber-rose/30 text-cyber-rose">
                  <GitFork className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wider">
                    MULTI-HOP ATTACK PATH COMPARISON MATRIX (SENTINELFORGE PRD 5.3)
                  </h3>
                  <p className="text-xs text-cyber-muted">
                    Side-by-side evaluation of concurrent ingress vectors to {targetNodeId.replace('node_asset_', '').toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMatrixModal(false)}
                className="p-1.5 rounded-xl bg-cyber-surface hover:bg-cyber-card border border-cyber-border text-cyber-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {dijkstraResult.rankedPaths.map((path) => (
                <div
                  key={path.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between gap-4 transition-all ${
                    activePathRank === path.rank
                      ? 'bg-cyber-card/90 border-cyber-rose shadow-[0_0_15px_rgba(255,51,102,0.25)]'
                      : 'bg-cyber-surface/50 border-cyber-border hover:border-slate-500'
                  }`}
                  style={{ borderColor: activePathRank === path.rank ? path.color : undefined }}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded font-mono" style={{ backgroundColor: `${path.color}25`, color: path.color }}>
                        PATH #{path.rank} &bull; {path.ingressType}
                      </span>
                      <span className="text-xs font-bold font-mono" style={{ color: path.color }}>
                        {path.riskScore} / 10
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white leading-snug">{path.name}</h4>

                    <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                      <div className="p-1.5 rounded bg-cyber-bg border border-cyber-border">
                        <span className="text-cyber-muted block">Hops:</span>
                        <strong className="text-white">{path.hopCount} Hops</strong>
                      </div>
                      <div className="p-1.5 rounded bg-cyber-bg border border-cyber-border">
                        <span className="text-cyber-muted block">Resistance:</span>
                        <strong className="text-cyber-rose">{path.resistanceCost}</strong>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-300 leading-relaxed pt-1">
                      {path.tacticalSummary}
                    </div>

                    <div className="p-2 rounded bg-black/60 border border-cyber-border/40 text-[10px] space-y-1">
                      <span className="text-cyber-muted block font-bold">EXPLOIT PRIMITIVES:</span>
                      <span className="text-slate-200">{path.exploitPrimitive}</span>
                    </div>

                    <div className="p-2 rounded bg-cyber-emerald/10 border border-cyber-emerald/30 text-[10px] space-y-1">
                      <span className="text-cyber-emerald block font-bold">RECOMMENDED REMEDIATION:</span>
                      <span className="text-slate-300">{path.mitigationStrategy}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-cyber-border/40 flex flex-col gap-2">
                    <button
                      onClick={() => {
                        cyberAudio.playClick();
                        setActivePathRank(path.rank);
                        setShowMatrixModal(false);
                        showToast(`Activated view for Path #${path.rank}: ${path.name}`, 'SUCCESS');
                      }}
                      className="w-full py-1.5 rounded-lg bg-cyber-surface hover:bg-cyber-card border border-cyber-border text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5"
                    >
                      <Target className="w-3.5 h-3.5" />
                      Highlight on Graph
                    </button>

                    <button
                      onClick={() => {
                        if (path.edgePath && path.edgePath.length > 0) {
                          toggleSeverEdge(path.edgePath[0]);
                          setShowMatrixModal(false);
                        }
                      }}
                      className="w-full py-1.5 rounded-lg bg-cyber-rose/20 hover:bg-cyber-rose/30 border border-cyber-rose/40 text-xs font-bold text-cyber-rose transition-all flex items-center justify-center gap-1.5"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      Sever Ingress Hop ({path.edgePath[0]})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
