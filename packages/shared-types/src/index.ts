/**
 * SentinelForge Core Domain Types
 */

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export type SSVCDecision = 'TRACK' | 'TRACK_STAR' | 'ATTEND' | 'ACT';

export type VEXStatus = 'not_affected' | 'affected' | 'fixed' | 'under_investigation';

export type VEXJustification =
  | 'component_not_present'
  | 'vulnerable_code_not_present'
  | 'vulnerable_code_cannot_be_controlled_by_adversary'
  | 'vulnerable_code_not_in_execute_path'
  | 'inline_mitigations_already_exist';

export type PipelineStageId =
  | 'stage_1_acquisition'
  | 'stage_2_unpacking'
  | 'stage_3_static_secrets'
  | 'stage_4_sbom_vex'
  | 'stage_5_symbolic_taint'
  | 'stage_6_dynamic_emulation'
  | 'stage_7_coverage_fuzzing'
  | 'stage_8_protocol_fuzzing'
  | 'stage_9_attack_graph'
  | 'stage_10_scoring_reporting';

export type StageStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';

export interface PipelineStageInfo {
  id: PipelineStageId;
  name: string;
  category: 'PRE_PROCESSING' | 'STATIC_ANALYSIS' | 'DYNAMIC_DISCOVERY' | 'SYNTHESIS';
  status: StageStatus;
  progressPercent: number;
  durationMs: number;
  engine: string;
  summary: string;
  findingsCount: number;
  startedAt?: string;
  completedAt?: string;
}

export interface AttestationRequest {
  testerName: string;
  testerEmail: string;
  organization: string;
  deviceId: string;
  authorizationType: 'OWNER_CERTIFIED' | 'AUTHORIZED_PENTEST' | 'LAB_ISOLATED';
  attestationTermsAccepted: boolean;
}

export interface AttestationRecord extends AttestationRequest {
  id: string;
  deviceIdentifier: string;
  timestamp: string;
  signatureHash: string;
  ipAddress: string;
}

export interface DeviceProfile {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  architecture: 'ARM' | 'MIPS' | 'ARM64' | 'MIPS64' | 'RISCV' | 'X86_64' | 'ESP32' | 'AVR';
  endianness: 'LITTLE' | 'BIG';
  connectionType: 'USB_SERIAL' | 'WEB_BLUETOOTH' | 'WIFI_LAN' | 'ZIGBEE' | 'ZWAVE' | 'FIRMWARE_UPLOAD';
  status: 'ONLINE' | 'ANALYZING' | 'EMULATING' | 'FUZZING' | 'OFFLINE';
  firmwareVersion: string;
  firmwareHash: string;
  firmwareSize: number;
  lastScannedAt?: string;
  riskScore: number; // 0 - 100
  ssvcHighestPriority: SSVCDecision;
  activeAttestation?: AttestationRecord;
  interfaces: {
    hasUart: boolean;
    hasJtag: boolean;
    hasBle: boolean;
    hasWifi: boolean;
    hasZigbee: boolean;
    hasEthernet: boolean;
  };
}

export interface TaintTraceStep {
  address: string;
  instruction: string;
  operation: string;
  symbol?: string;
  taintedRegisters: string[];
  taintedMemoryOffset?: string;
  notes?: string;
}

export interface SymbolicTaintResult {
  id: string;
  vulnerabilityClass: 'BUFFER_OVERFLOW' | 'FORMAT_STRING' | 'COMMAND_INJECTION' | 'AUTH_BYPASS' | 'MEMORY_CORRUPTION';
  entryPoint: {
    sourceType: 'NETWORK_PACKET' | 'BLE_CHARACTERISTIC' | 'USB_DESCRIPTOR' | 'UART_CLI' | 'CONFIG_PARSER';
    functionName: string;
    bufferVariable: string;
    maxUncheckedLength?: number;
  };
  sinkFunction: 'memcpy' | 'strcpy' | 'sprintf' | 'system' | 'popen' | 'execve' | 'eval';
  sinkAddress: string;
  sinkOffset: string;
  pathConstraintsCount: number;
  satisfiability: 'SAT' | 'UNSAT' | 'UNKNOWN';
  exploitFeasibilityScore: number; // 0.0 - 1.0
  taintTrace: TaintTraceStep[];
  reproducingInputHex: string;
  angrDecompiledSnippet: string;
}

export interface FuzzCoverageMetrics {
  totalExecutions: number;
  execSpeedPerSec: number;
  uniquePaths: number;
  crashesCount: number;
  hangsCount: number;
  codeCoveragePercent: number;
  lastCrashDiscoveredAt?: string;
  mutationEngine: 'AFL++_QEMU_AI_STEERED' | 'BOOFUZZ_STATE_MACHINE' | 'LIBFUZZER';
  aiSteeringGainRatio: number; // e.g. 3.4x faster coverage over naive random fuzzing
}

export interface EmulatorCrashSnapshot {
  id: string;
  timestamp: string;
  signal: 'SIGSEGV' | 'SIGBUS' | 'SIGABRT' | 'SIGILL';
  faultingAddress: string;
  programCounter: string;
  stackPointer: string;
  registers: Record<string, string>;
  stackTrace: string[];
  disassemblyAroundPc: {
    address: string;
    instruction: string;
    isCurrent: boolean;
  }[];
  inputPayloadBase64: string;
  memoryDumpPreview: string;
}

export interface AttackGraphNode {
  id: string;
  label: string;
  type: 'ASSET' | 'ENTRY_POINT' | 'VULNERABILITY' | 'SERVICE' | 'PRIVILEGE' | 'PROTOCOL' | 'PERIPHERAL';
  severity?: SeverityLevel;
  properties: {
    name: string;
    description?: string;
    cveId?: string;
    cvss?: number;
    epss?: number;
    emb3dRef?: string;
    port?: number;
    privilegeLevel?: string;
  };
}

export interface AttackGraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: 'EXPOSES' | 'EXPLOITS' | 'ESCALATES_TO' | 'COMPROMISES' | 'LEADS_TO' | 'CROSS_CORRELATES';
  isInShortestAttackPath?: boolean;
  exploitConfidence: number; // 0.0 - 1.0
}

export interface AttackGraphData {
  nodes: AttackGraphNode[];
  edges: AttackGraphEdge[];
  criticalAttackPathsCount: number;
  shortestPathToRootCompromise: string[]; // List of Node IDs
}

export interface Finding {
  id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  cvssV4Score: number;
  epssProbability: number; // 0.0 - 1.0 (e.g. 0.89 = 89% chance of in-the-wild exploitation)
  epssPercentile: number;
  ssvcDecision: SSVCDecision;
  cveId?: string;
  cweId?: string;
  emb3dId?: string; // MITRE EMB3D threat model identifier (e.g. EMB3D-T0042)
  owaspFstmStage?: string;
  nistRequirement?: string;
  etsiRequirement?: string;
  iec62443Clause?: string;
  affectedComponent: string;
  componentVersion?: string;
  detectionSource: 'SYMBOLIC_ANG_R' | 'AFL_FUZZER' | 'STATE_MACHINE' | 'YARA_SECRET' | 'GENOME_SIMILARITY' | 'STATIC_RE';
  isZeroDay: boolean;
  vexStatus: VEXStatus;
  vexJustification?: VEXJustification;
  remediationAdvice: string;
  aiExplanation: {
    summary: string;
    whyFlagged: string;
    rootCauseAnalysis: string;
    patchRecommendation: string;
  };
  symbolicTrace?: SymbolicTaintResult;
  crashSnapshot?: EmulatorCrashSnapshot;
}

export interface SBOMComponent {
  bomRef: string;
  name: string;
  version: string;
  type: 'library' | 'firmware' | 'operating-system' | 'application';
  purl?: string;
  cpe?: string;
  license?: string;
  vulnerabilitiesCount: number;
  vexStatus: VEXStatus;
  pqcReadiness: 'PQC_READY' | 'LEGACY_VULNERABLE' | 'NO_CRYPTO';
}

export interface ComplianceScorecard {
  overallCompliancePercent: number;
  owaspFstmScore: number; // 0-100
  mitreEmb3dCoverage: number; // 0-100
  nistIr8259Score: number; // 0-100
  etsiEn303645Score: number; // 0-100
  iec62443Score: number; // 0-100
  pqcMigrationReadiness: number; // 0-100
}

export interface ScanSession {
  id: string;
  deviceId: string;
  deviceName: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  startedAt: string;
  completedAt?: string;
  stages: PipelineStageInfo[];
  findings: Finding[];
  fuzzMetrics?: FuzzCoverageMetrics;
  attackGraph?: AttackGraphData;
  compliance: ComplianceScorecard;
  sbomSummary: {
    totalComponents: number;
    vulnerableComponents: number;
    pqcCompliantRatio: string;
  };
}

export interface MCPToolDefinition {
  name: string;
  description: string;
  server: 'binwalk-mcp' | 'qemu-mcp' | 'symbolic-exec-mcp' | 'fuzz-orchestrator-mcp' | 'cve-epss-mcp' | 'graph-query-mcp';
  parameters: Record<string, unknown>;
}

export interface CopilotChatMessage {
  id: string;
  sender: 'USER' | 'COPILOT' | 'SYSTEM_EVENT';
  timestamp: string;
  content: string;
  toolCallsExecuted?: {
    toolName: string;
    server: string;
    args: Record<string, unknown>;
    resultSummary: string;
  }[];
  referencedFindingIds?: string[];
  referencedTraceId?: string;
}

export interface CopilotQueryRequest {
  prompt: string;
  scanId?: string;
  deviceId?: string;
  selectedFindingId?: string;
}

export interface CopilotQueryResponse {
  response: string;
  toolCallsExecuted?: {
    toolName: string;
    server: string;
    args: Record<string, unknown>;
    resultSummary: string;
  }[];
  referencedFindingIds?: string[];
  suggestedActions?: string[];
}

// --- PRD Section 9.1 OpenAPI Types ---
export interface FirmwareUploadResponse {
  status: 'ACCEPTED';
  analysisId: string;
  sha256: string;
  estimatedTimeSec: number;
  links: {
    telemetryStream: string;
    graphVisualization: string;
  };
}

export interface AttackPathNodePRD {
  id: string;
  type: 'Service' | 'Vulnerability' | 'PrivilegeLevel' | 'Peripheral';
  name?: string;
  cve?: string;
  cvss?: number;
}

export interface AttackPathItemPRD {
  pathId: string;
  riskScore: number;
  nodes: AttackPathNodePRD[];
  mitigations: string[];
}

export interface AttackPathsResponse {
  analysisId: string;
  criticalPathCount: number;
  paths: AttackPathItemPRD[];
}

export interface CycloneDXProperty {
  name: string;
  value: string;
}

export interface CycloneDXComponentItem {
  type: string;
  name: string;
  version: string;
  purl?: string;
  properties?: CycloneDXProperty[];
}

export interface CycloneDXExportResponse {
  bomFormat: string;
  specVersion: string;
  serialNumber: string;
  version: number;
  metadata: {
    timestamp: string;
    tools: { vendor: string; name: string; version: string }[];
    component: {
      type: string;
      name: string;
      version: string;
    };
  };
  components: CycloneDXComponentItem[];
}

export interface FuzzExecutionTelemetryPoint {
  time: string;
  firmware_id: string;
  worker_id: string;
  execs_per_sec: number;
  total_execs: number;
  paths_found: number;
  crashes_discovered: number;
  current_hangs: number;
  memory_usage_mb: number;
  bitmap_density: number;
}

export interface ExecutionCrashItem {
  time: string;
  firmware_id: string;
  crash_hash: string;
  signal_type: string;
  faulting_address: string;
  pc_register: string;
  stack_canary_intact: boolean;
  registers_state: Record<string, unknown>;
  payload_size_bytes: number;
}

export interface FirmwareTelemetryResponse {
  firmwareId: string;
  telemetryHistory: FuzzExecutionTelemetryPoint[];
  crashes: ExecutionCrashItem[];
  currentExecSpeed: number;
  totalExecs: number;
  uniquePaths: number;
  bitmapDensity: number;
}

export interface FirmwareAnalysisRecord {
  id: string;
  projectId: string;
  userId: string;
  filename: string;
  sha256: string;
  md5: string;
  sizeBytes: number;
  s3BlobPath: string;
  architecture: string;
  endianness: string;
  status: 'QUEUED' | 'EXTRACTING' | 'STATIC_COMPLETE' | 'EMULATING' | 'FUZZING' | 'SYNTHESIZING_GRAPH' | 'COMPLETED' | 'FAILED';
  errorReason?: string;
  staticArtifacts?: Record<string, unknown>;
  vulnerabilities: Record<string, unknown>[];
  sbomRecords: Record<string, unknown>[];
  createdAt: string;
  updatedAt: string;
}

