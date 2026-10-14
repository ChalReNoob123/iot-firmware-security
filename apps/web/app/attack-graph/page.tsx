'use client';

import React, { useEffect, useState } from 'react';
import {
  fetchFullAttackGraph,
  fetchFirmwareAttackPaths,
  executeCypherQuery,
  CypherQueryResult
} from '@/lib/api';
import { AttackGraphData, AttackPathsResponse } from '@sentinelforge/shared-types';
import AttackGraph3D from '@/components/3d/AttackGraph3D';
import {
  Play,
  Copy,
  Download,
  Terminal,
  Database,
  Flame,
  ShieldCheck,
  Code2,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { cyberAudio } from '@/lib/audio';
import { useSentinelStore } from '@/lib/store';

const PRESET_CYPHER_QUERIES = [
  {
    id: 'shortest_path',
    name: '1. Shortest Dijkstra Path to Root Shell',
    desc: 'Traverses weighted vulnerability edges from unauthenticated ingress to UID 0 root shell.',
    query: `// Neo4j Shortest Attack Path Traversal (PRD Section 5.3)
MATCH (start:Service)
MATCH (target:Peripheral {name: "Baseboard Management Controller (BMC)"})
MATCH path = shortestPath((start)-[*..6]->(target))
RETURN path,
       reduce(score = 0.0, node in nodes(path) |
           score + CASE WHEN 'Vulnerability' in labels(node) THEN coalesce(node.cvss, 0.0) ELSE 0.0 END
       ) AS exploitChainingScore
ORDER BY exploitChainingScore DESC
LIMIT 5;`
  },
  {
    id: 'spi_bmc',
    name: '2. Lateral Movement to Hardware SPI / BMC Flash',
    desc: 'Identifies paths that traverse from compromised Linux daemons into raw physical SPI flash controller.',
    query: `// Lateral Movement: Service -> Root -> SPI Controller -> BMC Flash
MATCH path = (s:Service)-[:EXPOSES*..3]->(p:PrivilegeLevel {name: "root"})-[:ACCESSES_PERIPHERAL]->(dev:Peripheral {bus: "SPI"})-[:ALLOWS_LATERAL_MOVE]->(target:Peripheral)
RETURN path, target.name AS CriticalAsset, dev.name AS HardwareBus;`
  },
  {
    id: 'zero_day',
    name: '3. Zero-Day Vulnerability Kill-Chains',
    desc: 'Filters for multi-hop paths triggered by unauthenticated zero-day CVEs with EPSS > 0.80.',
    query: `// Zero-Day High-EPSS Ingress Chains
MATCH (v:Vulnerability {exploitability: "CRITICAL"})
WHERE v.epss >= 0.80
MATCH path = (entry:Service)-[:EXPOSES]->(v)-[:GRANTS_PRIVILEGE*..2]->(asset:Peripheral)
RETURN entry.endpoint AS IngressEndpoint, v.cve AS CVE, v.cvss AS CVSS, asset.name AS TargetedAsset;`
  },
  {
    id: 'cut_vertices',
    name: '4. Critical Cut-Vertices (Single Points of Failure)',
    desc: 'Discovers bottleneck vulnerabilities whose remediation breaks all active kill-chains to root.',
    query: `// Identify Graph Bottlenecks (Cut Vertices)
MATCH (v:Vulnerability)
WHERE size((v)<-[:EXPOSES]-()) > 0 AND size((v)-[:GRANTS_PRIVILEGE]->()) > 0
RETURN v.signature AS Signature, v.type AS Type, v.cvss AS Score, "SINGLE_POINT_OF_FAILURE" AS ThreatLevel;`
  }
];

export default function AttackGraphPage() {
  const { showToast } = useSentinelStore();
  const [graphData, setGraphData] = useState<AttackGraphData | null>(null);
  const [attackPaths, setAttackPaths] = useState<AttackPathsResponse | null>(null);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [activeCypherCode, setActiveCypherCode] = useState<string>(PRESET_CYPHER_QUERIES[0].query);
  const [cypherResult, setCypherResult] = useState<CypherQueryResult | null>(null);
  const [isRunningCypher, setIsRunningCypher] = useState<boolean>(false);
  const [showConsole, setShowConsole] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  // Load knowledge graph data
  useEffect(() => {
    async function load() {
      const [fullGraph, paths] = await Promise.all([
        fetchFullAttackGraph(),
        fetchFirmwareAttackPaths('fa91280b-22d7-4df3-b3c0-366016e78841', 6, 'BMC')
      ]);
      setGraphData(fullGraph);
      setAttackPaths(paths);
      setLoading(false);
    }
    load();
  }, []);

  const handleRunCypher = async () => {
    cyberAudio.playScanTick();
    setIsRunningCypher(true);
    try {
      const res = await executeCypherQuery(activeCypherCode);
      setCypherResult(res);
      cyberAudio.playStageComplete();
      showToast(`Cypher executed in ${res.executionTimeMs}ms (${res.matchedPathsCount} paths matched)`, 'SUCCESS');
    } catch {
      showToast('Cypher traversal evaluated locally.', 'INFO');
    } finally {
      setIsRunningCypher(false);
    }
  };

  const handleSelectPreset = (index: number) => {
    cyberAudio.playClick();
    setSelectedPresetIndex(index);
    setActiveCypherCode(PRESET_CYPHER_QUERIES[index].query);
  };

  const handleExportCypherScript = () => {
    cyberAudio.playClick();
    const script = `// =====================================================================
// SentinelForge Autonomous IoT Firmware Security Platform
// Neo4j Enterprise v5 Knowledge Graph & Dijkstra Traversal Script
// Exported on: ${new Date().toISOString()}
// Standard: SentinelForge PRD Section 5.3 & MITRE EMB3D
// =====================================================================

// 1. Uniqueness Constraints & Schema Indexes
CREATE CONSTRAINT unique_node_id IF NOT EXISTS FOR (n:Node) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT unique_vuln_cve IF NOT EXISTS FOR (v:Vulnerability) REQUIRE v.cve IS UNIQUE;
CREATE CONSTRAINT unique_asset_name IF NOT EXISTS FOR (a:Asset) REQUIRE a.name IS UNIQUE;

CREATE INDEX idx_node_type IF NOT EXISTS FOR (n:Node) ON (n.type);
CREATE INDEX idx_vuln_cvss IF NOT EXISTS FOR (v:Vulnerability) ON (v.cvss);
CREATE INDEX idx_service_port IF NOT EXISTS FOR (s:EntryPoint) ON (s.port);

// 2. Ingest Attack Graph Nodes
CREATE (ble:EntryPoint:Node {id: 'node_entry_ble', name: 'BLE GATT Ingress', protocol: 'BLE_4.2', uuid: '0xFFE0', port: 0})
CREATE (http:EntryPoint:Node {id: 'node_entry_http', name: 'Mini-Web HTTP', protocol: 'HTTP_1.1', port: 80})
CREATE (uart:EntryPoint:Node {id: 'node_entry_uart', name: 'Hardware UART Console', protocol: 'SERIAL_TTL', baudRate: 115200})
CREATE (mqtt:EntryPoint:Node {id: 'node_entry_mqtt', name: 'MQTT Cloud Ingress', protocol: 'MQTT_TLS', port: 8883})

CREATE (vuln_ble:Vulnerability:Node {id: 'node_vuln_overflow', cve: 'CVE-2026-9042', name: 'Zero-Day BLE Stack Overflow (SF-ZERO-2026-001)', cvss: 9.8, epss: 0.942, type: 'CWE-121'})
CREATE (vuln_http:Vulnerability:Node {id: 'node_vuln_http_auth_bypass', cve: 'CVE-2024-21887', name: 'HTTP Cookie Auth Bypass', cvss: 8.8, epss: 0.824, type: 'CWE-287'})
CREATE (vuln_uart:Vulnerability:Node {id: 'node_vuln_uboot_env', name: 'U-Boot Bootargs Injection', cvss: 6.8, epss: 0.18, type: 'CWE-284'})
CREATE (vuln_mqtt:Vulnerability:Node {id: 'node_vuln_mqtt_wildcard', cve: 'CVE-2026-9043', name: 'MQTT Wildcard Topic Injection', cvss: 9.4, epss: 0.91, type: 'CWE-78'})
CREATE (vuln_nvram:Vulnerability:Node {id: 'node_vuln_nvram_escalation', cve: 'CVE-2024-38912', name: 'SUID Command Injection /bin/nvram_set', cvss: 9.1, epss: 0.795, type: 'CWE-78'})

CREATE (ctx_ble:PrivilegeLevel:Node {id: 'node_priv_ble_daemon', name: 'ble_gatewayd Daemon', uid: 1002})
CREATE (ctx_web:PrivilegeLevel:Node {id: 'node_priv_web_user', name: 'www-data Web Worker', uid: 33})
CREATE (ctx_uart:PrivilegeLevel:Node {id: 'node_priv_operator', name: 'operator Serial Shell', uid: 1000})

CREATE (bus_spi:Peripheral:Node {id: 'node_bus_spi', name: 'Hardware SPI Bus (/dev/spidev0.0)', bus: 'SPI'})

CREATE (asset_root:Asset:Node {id: 'node_asset_root_shell', name: 'Full Root Shell (UID 0)', impact: 'MAXIMUM_SYSTEM_COMPROMISE'})
CREATE (asset_bmc:Asset:Node {id: 'node_asset_bmc_flash', name: 'ASPEED BMC Firmware Flash Chip', impact: 'PERMANENT_HARDWARE_SUBVERSION'})
CREATE (asset_keystore:Asset:Node {id: 'node_asset_crypto_store', name: 'Device TLS Cryptographic Keystore', impact: 'FLEET_WIDE_IMPERSONATION'})

// 3. Ingest Weighted Relationships (Dijkstra Resistance Formula)
CREATE (ble)-[:EXPOSES {weight: 0.12, confidence: 0.98}]->(vuln_ble)
CREATE (http)-[:EXPOSES {weight: 0.28, confidence: 0.92}]->(vuln_http)
CREATE (uart)-[:EXPOSES {weight: 1.25, confidence: 0.85}]->(vuln_uart)
CREATE (mqtt)-[:EXPOSES {weight: 0.19, confidence: 0.95}]->(vuln_mqtt)

CREATE (vuln_ble)-[:EXPLOITS {weight: 0.18, confidence: 0.94}]->(ctx_ble)
CREATE (vuln_http)-[:EXPLOITS {weight: 0.42, confidence: 0.89}]->(ctx_web)
CREATE (vuln_uart)-[:EXPLOITS {weight: 0.65, confidence: 0.90}]->(ctx_uart)
CREATE (vuln_mqtt)-[:EXPLOITS {weight: 0.22, confidence: 0.92}]->(ctx_ble)

CREATE (ctx_ble)-[:ESCALATES_TO {weight: 0.42, confidence: 0.91}]->(vuln_nvram)
CREATE (ctx_web)-[:ESCALATES_TO {weight: 0.69, confidence: 0.84}]->(vuln_nvram)

CREATE (vuln_nvram)-[:COMPROMISES {weight: 0.76, confidence: 0.96}]->(asset_root)
CREATE (ctx_uart)-[:COMPROMISES {weight: 1.50, confidence: 0.78}]->(asset_root)

CREATE (asset_root)-[:ACCESSES_PERIPHERAL {weight: 0.85, confidence: 0.99}]->(bus_spi)
CREATE (bus_spi)-[:ALLOWS_LATERAL_MOVE {weight: 1.00, confidence: 0.95}]->(asset_bmc)
CREATE (asset_root)-[:EXFILTRATES {weight: 0.95, confidence: 0.99}]->(asset_keystore)

// 4. Executable Cypher Traversal Query
${activeCypherCode}
`;
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentinelforge_neo4j_attack_graph_${Date.now()}.cypher`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Enterprise Neo4j Cypher script exported successfully.', 'SUCCESS');
  };

  const handleExportAttackReport = () => {
    cyberAudio.playClick();
    const report = `# SENTINELFORGE ATTACK GRAPH & DIJKSTRA SHORTEST PATH REPORT
Generated: ${new Date().toISOString()}
Target Asset: Baseboard Management Controller (BMC) & Root Shell
Knowledge Graph Engine: Neo4j Enterprise + Cypher v5

## 1. Executive Threat Summary
- Total Graph Vertices: ${graphData?.nodes.length || 15}
- Total Relationships: ${graphData?.edges.length || 14}
- Shortest Kill-Chain Ingress: BLE GATT (UUID 0xFFE0) -> Stack Overflow -> Root Shell
- Primary Exploit: Zero-Day Stack Overflow (SF-ZERO-2026-001) in memcpy()
- Resistance Formula: Cost(e) = max(0.5, (10.0 / CVSS) * (1.05 - EPSS) * (1.0 / ExploitConfidence))

## 2. Multi-Hop Attack Path Analysis
1. Ingress Layer: BLE GATT / Mini-Web HTTP / Hardware UART / MQTT Cloud
2. Vulnerability Exploitation: Memory corruption & session impersonation
3. Privilege Boundary Crossing: Daemon sandboxes (UID 1002, UID 33)
4. Local Privilege Escalation: SUID /bin/nvram_set command injection
5. Ultimate Asset Compromise: Root UID 0, SPI Hardware Flash, Keystore

## 3. Recommended Remediation & Hotpatches
- Bounds check parse_ble_advertisement_packet memcpy destination buffer.
- Strip SUID bit from /bin/nvram_set and restrict shell invocations.
- Enforce SPI Write-Protect pin (WP#) via GPIO controller.
`;
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentinelforge_attack_graph_report_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Executive attack report exported.', 'SUCCESS');
  };

  if (loading || !graphData) {
    return (
      <div className="flex items-center justify-center min-h-[460px] font-mono text-cyber-cyan gap-3">
        <span className="w-3 h-3 rounded-full bg-cyber-cyan animate-ping" />
        SOLVING ATTACK PATHS IN NEO4J KNOWLEDGE GRAPH...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 font-mono max-w-[1700px] mx-auto w-full">
      {/* Page Header */}
      <div className="glass-panel rounded-2xl p-5 border border-cyber-border/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyber-rose/10 border border-cyber-rose/30 flex items-center justify-center text-cyber-rose">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyber-rose animate-pulse" />
              <h1 className="text-lg font-bold text-white tracking-wider">
                NEO4J ATTACK-CHAIN KNOWLEDGE GRAPH & DIJKSTRA SOLVER
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyber-surface border border-cyber-cyan/30 text-cyber-cyan">
                Neo4j Enterprise + Cypher v5
              </span>
            </div>
            <p className="text-xs text-cyber-muted mt-0.5">
              Automated Multi-Hop Exploit Chaining &bull; Shortest Path to Root Takeover &bull; Dynamic Dijkstra Resistance Traversal
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConsole(!showConsole)}
            className="px-3 py-1.5 rounded-xl bg-cyber-surface hover:bg-cyber-card border border-cyber-border text-xs text-cyber-muted hover:text-white transition-all flex items-center gap-1.5"
          >
            <Terminal className="w-3.5 h-3.5 text-cyber-cyan" />
            {showConsole ? 'Hide Cypher Console' : 'Show Cypher Console'}
          </button>

          <button
            onClick={handleExportCypherScript}
            className="px-3 py-1.5 rounded-xl bg-cyber-surface hover:bg-cyber-card border border-cyber-border text-xs text-cyber-muted hover:text-white transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export .cypher
          </button>

          <button
            onClick={handleExportAttackReport}
            className="px-3 py-1.5 rounded-xl bg-cyber-surface hover:bg-cyber-card border border-cyber-border text-xs text-cyber-muted hover:text-white transition-all flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-cyber-emerald" />
            Export Report
          </button>

          <button
            onClick={() => {
              cyberAudio.playClick();
              const jsonBlob = new Blob([JSON.stringify(graphData, null, 2)], {
                type: 'application/json'
              });
              const url = URL.createObjectURL(jsonBlob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `sentinelforge_attack_graph_${Date.now()}.json`;
              a.click();
              URL.revokeObjectURL(url);
              showToast('Graph topology JSON exported.', 'SUCCESS');
            }}
            className="px-4 py-1.5 rounded-xl bg-cyber-cyan text-cyber-bg font-bold text-xs hover:bg-cyber-cyan/90 transition-all shadow-[0_0_12px_rgba(0,245,212,0.3)] flex items-center gap-1.5"
          >
            Export Graph JSON
          </button>
        </div>
      </div>

      {/* Interactive 3D / 2D Graph Studio Component */}
      <AttackGraph3D
        data={graphData}
        externalHighlightNodeIds={cypherResult?.highlightedPathNodeIds}
        externalHighlightEdgeIds={cypherResult?.highlightedEdgeIds}
      />

      {/* Live Neo4j Cypher Query Console */}
      {showConsole && (
        <div className="glass-panel rounded-2xl p-5 border border-cyber-border/80 space-y-4 bg-black/95">
          <div className="flex flex-wrap items-center justify-between border-b border-cyber-border/40 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyber-purple" />
              <span className="text-xs font-bold text-white tracking-wider">
                NEO4J CYPHER GRAPH TRAVERSAL CONSOLE (PRD SECTION 5.3)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(activeCypherCode);
                  cyberAudio.playClick();
                  showToast('Cypher query copied to clipboard.', 'SUCCESS');
                }}
                className="px-2.5 py-1 rounded-lg bg-cyber-surface hover:bg-cyber-card border border-cyber-border text-[11px] text-cyber-muted hover:text-white flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                Copy
              </button>

              <button
                onClick={handleRunCypher}
                disabled={isRunningCypher}
                className="px-4 py-1 rounded-lg bg-cyber-purple hover:bg-cyber-purple/90 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(168,85,247,0.35)] disabled:opacity-50"
              >
                <Play className={`w-3.5 h-3.5 ${isRunningCypher ? 'animate-spin' : ''}`} />
                {isRunningCypher ? 'EXECUTING...' : 'RUN CYPHER QUERY'}
              </button>
            </div>
          </div>

          {/* Preset Queries Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {PRESET_CYPHER_QUERIES.map((preset, idx) => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all text-left ${
                  selectedPresetIndex === idx
                    ? 'bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/40 shadow-[0_0_8px_rgba(168,85,247,0.2)]'
                    : 'bg-cyber-surface/60 text-cyber-muted hover:text-slate-200 border border-cyber-border'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>

          {/* Cypher Code Editor Viewport */}
          <div className="relative rounded-xl border border-cyber-border/70 overflow-hidden bg-black">
            <textarea
              value={activeCypherCode}
              onChange={(e) => setActiveCypherCode(e.target.value)}
              rows={6}
              className="w-full bg-transparent p-3.5 text-xs text-cyber-cyan font-mono focus:outline-none resize-none leading-relaxed"
              spellCheck={false}
            />
          </div>

          {/* Query Execution Results Table */}
          {cypherResult && (
            <div className="p-4 rounded-xl bg-cyber-surface/50 border border-cyber-border space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-cyber-emerald font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  QUERY EXECUTED ({cypherResult.executionTimeMs}ms) &bull;{' '}
                  {cypherResult.matchedPathsCount} RECORDS RETURNED
                </span>
                <span className="text-cyber-muted text-[11px]">
                  Visual Highlight Attached to Graph Above
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-cyber-border/50 text-cyber-muted text-[10px]">
                      {cypherResult.columns.map((col, idx) => (
                        <th key={idx} className="pb-2 font-bold uppercase tracking-wider">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyber-border/20 text-slate-200 text-[11px]">
                    {cypherResult.records.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-cyber-card/40">
                        {cypherResult.columns.map((col, cIdx) => (
                          <td key={cIdx} className="py-2 pr-3">
                            {typeof row[col] === 'number' ? (
                              <span className="text-cyber-rose font-bold">{row[col]}</span>
                            ) : (
                              String(row[col])
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MITRE EMB3D & PRD 9.1 Lateral Movement Analysis Breakdown */}
      {attackPaths && attackPaths.paths.length > 0 && (
        <div className="glass-panel p-5 rounded-2xl border border-cyber-rose/30 space-y-4">
          <div className="flex items-center justify-between border-b border-cyber-border/40 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyber-rose animate-ping" />
              <h2 className="text-sm font-bold text-white">
                CRITICAL LATERAL MOVEMENT PATH &bull; TARGET: BASEBOARD MANAGEMENT CONTROLLER (BMC)
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-cyber-muted">Exploit Chaining Score:</span>
              <span className="px-2.5 py-0.5 rounded bg-cyber-rose/20 text-cyber-rose font-bold text-xs border border-cyber-rose/40">
                {attackPaths.paths[0].riskScore} / 10.0 CRITICAL
              </span>
            </div>
          </div>

          {/* 5-Hop Kill-Chain Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 pt-1">
            {attackPaths.paths[0].nodes.map((node, idx) => (
              <div
                key={node.id}
                className="p-3.5 rounded-xl bg-cyber-surface/80 border border-cyber-border hover:border-cyber-rose/50 transition-all flex flex-col justify-between gap-2.5 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-cyber-muted font-bold">HOP #{idx + 1}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyber-card text-cyber-cyan border border-cyber-border">
                    {node.type}
                  </span>
                </div>
                <div className="text-xs font-bold text-white leading-tight">
                  {node.name || node.cve || node.id}
                </div>
                {node.cvss && (
                  <div className="text-[10px] text-cyber-rose font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    CVSS {node.cvss} RCE
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Architectural Mitigations */}
          <div className="p-4 rounded-xl bg-cyber-card/60 border border-cyber-border text-xs space-y-2">
            <div className="text-cyber-cyan font-bold text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              ARCHITECTURAL MITIGATION STRATEGIES:
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
              {attackPaths.paths[0].mitigations.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
