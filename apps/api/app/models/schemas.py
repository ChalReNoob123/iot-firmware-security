from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field
from datetime import datetime

SeverityLevel = Literal['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL']
SSVCDecision = Literal['TRACK', 'TRACK_STAR', 'ATTEND', 'ACT']
VEXStatus = Literal['not_affected', 'affected', 'fixed', 'under_investigation']
StageStatus = Literal['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'SKIPPED']

class AttestationRequest(BaseModel):
    testerName: str
    testerEmail: str
    organization: str
    deviceId: str
    authorizationType: Literal['OWNER_CERTIFIED', 'AUTHORIZED_PENTEST', 'LAB_ISOLATED']
    attestationTermsAccepted: bool

class AttestationRecord(AttestationRequest):
    id: str
    deviceIdentifier: str
    timestamp: str
    signatureHash: str
    ipAddress: str

class DeviceInterfaces(BaseModel):
    hasUart: bool = True
    hasJtag: bool = True
    hasBle: bool = True
    hasWifi: bool = True
    hasZigbee: bool = False
    hasEthernet: bool = True

class DeviceProfile(BaseModel):
    id: str
    name: str
    manufacturer: str
    model: str
    architecture: Literal['ARM', 'MIPS', 'ARM64', 'MIPS64', 'RISCV', 'X86_64', 'ESP32', 'AVR']
    endianness: Literal['LITTLE', 'BIG'] = 'LITTLE'
    connectionType: Literal['USB_SERIAL', 'WEB_BLUETOOTH', 'WIFI_LAN', 'ZIGBEE', 'ZWAVE', 'FIRMWARE_UPLOAD']
    status: Literal['ONLINE', 'ANALYZING', 'EMULATING', 'FUZZING', 'OFFLINE'] = 'ONLINE'
    firmwareVersion: str
    firmwareHash: str
    firmwareSize: int
    lastScannedAt: Optional[str] = None
    riskScore: int = 42 # 0 - 100
    ssvcHighestPriority: SSVCDecision = 'ATTEND'
    activeAttestation: Optional[AttestationRecord] = None
    interfaces: DeviceInterfaces = Field(default_factory=DeviceInterfaces)

class TaintTraceStep(BaseModel):
    address: str
    instruction: str
    operation: str
    symbol: Optional[str] = None
    taintedRegisters: List[str]
    taintedMemoryOffset: Optional[str] = None
    notes: Optional[str] = None

class SymbolicTaintResult(BaseModel):
    id: str
    vulnerabilityClass: Literal['BUFFER_OVERFLOW', 'FORMAT_STRING', 'COMMAND_INJECTION', 'AUTH_BYPASS', 'MEMORY_CORRUPTION']
    entryPoint: Dict[str, Any]
    sinkFunction: str
    sinkAddress: str
    sinkOffset: str
    pathConstraintsCount: int
    satisfiability: Literal['SAT', 'UNSAT', 'UNKNOWN']
    exploitFeasibilityScore: float # 0.0 - 1.0
    taintTrace: List[TaintTraceStep]
    reproducingInputHex: str
    angrDecompiledSnippet: str

class FuzzCoverageMetrics(BaseModel):
    totalExecutions: int
    execSpeedPerSec: int
    uniquePaths: int
    crashesCount: int
    hangsCount: int
    codeCoveragePercent: float
    lastCrashDiscoveredAt: Optional[str] = None
    mutationEngine: str
    aiSteeringGainRatio: float

class DisassemblyLine(BaseModel):
    address: str
    instruction: str
    isCurrent: bool

class EmulatorCrashSnapshot(BaseModel):
    id: str
    timestamp: str
    signal: str
    faultingAddress: str
    programCounter: str
    stackPointer: str
    registers: Dict[str, str]
    stackTrace: List[str]
    disassemblyAroundPc: List[DisassemblyLine]
    inputPayloadBase64: str
    memoryDumpPreview: str

class AttackGraphNode(BaseModel):
    id: str
    label: str
    type: Literal['ASSET', 'ENTRY_POINT', 'VULNERABILITY', 'SERVICE', 'PRIVILEGE', 'PROTOCOL', 'PERIPHERAL']
    severity: Optional[SeverityLevel] = None
    properties: Dict[str, Any]

class AttackGraphEdge(BaseModel):
    id: str
    source: str
    target: str
    relationship: str
    isInShortestAttackPath: bool = False
    exploitConfidence: float = 0.95

class AttackGraphData(BaseModel):
    nodes: List[AttackGraphNode]
    edges: List[AttackGraphEdge]
    criticalAttackPathsCount: int
    shortestPathToRootCompromise: List[str]

class FindingAIExplanation(BaseModel):
    summary: str
    whyFlagged: str
    rootCauseAnalysis: str
    patchRecommendation: str

class Finding(BaseModel):
    id: str
    title: str
    description: str
    severity: SeverityLevel
    cvssV4Score: float
    epssProbability: float
    epssPercentile: float
    ssvcDecision: SSVCDecision
    cveId: Optional[str] = None
    cweId: Optional[str] = None
    emb3dId: Optional[str] = None
    owaspFstmStage: Optional[str] = None
    nistRequirement: Optional[str] = None
    etsiRequirement: Optional[str] = None
    iec62443Clause: Optional[str] = None
    affectedComponent: str
    componentVersion: Optional[str] = None
    detectionSource: Literal['SYMBOLIC_ANG_R', 'AFL_FUZZER', 'STATE_MACHINE', 'YARA_SECRET', 'GENOME_SIMILARITY', 'STATIC_RE']
    isZeroDay: bool
    vexStatus: VEXStatus
    vexJustification: Optional[str] = None
    remediationAdvice: str
    aiExplanation: FindingAIExplanation
    symbolicTrace: Optional[SymbolicTaintResult] = None
    crashSnapshot: Optional[EmulatorCrashSnapshot] = None

class PipelineStageInfo(BaseModel):
    id: str
    name: str
    category: Literal['PRE_PROCESSING', 'STATIC_ANALYSIS', 'DYNAMIC_DISCOVERY', 'SYNTHESIS']
    status: StageStatus
    progressPercent: int
    durationMs: int
    engine: str
    summary: str
    findingsCount: int
    startedAt: Optional[str] = None
    completedAt: Optional[str] = None

class SBOMComponent(BaseModel):
    bomRef: str
    name: str
    version: str
    type: str
    purl: Optional[str] = None
    cpe: Optional[str] = None
    license: Optional[str] = None
    vulnerabilitiesCount: int
    vexStatus: VEXStatus
    pqcReadiness: Literal['PQC_READY', 'LEGACY_VULNERABLE', 'NO_CRYPTO']

class ComplianceScorecard(BaseModel):
    overallCompliancePercent: int
    owaspFstmScore: int
    mitreEmb3dCoverage: int
    nistIr8259Score: int
    etsiEn303645Score: int
    iec62443Score: int
    pqcMigrationReadiness: int

class ScanSession(BaseModel):
    id: str
    deviceId: str
    deviceName: str
    status: Literal['PENDING', 'RUNNING', 'COMPLETED', 'FAILED']
    startedAt: str
    completedAt: Optional[str] = None
    stages: List[PipelineStageInfo]
    findings: List[Finding]
    fuzzMetrics: Optional[FuzzCoverageMetrics] = None
    attackGraph: Optional[AttackGraphData] = None
    compliance: ComplianceScorecard
    sbomSummary: Dict[str, Any]

class CopilotQueryRequest(BaseModel):
    prompt: str
    scanId: Optional[str] = None
    deviceId: Optional[str] = None
    selectedFindingId: Optional[str] = None

class CopilotToolCall(BaseModel):
    toolName: str
    server: str
    args: Dict[str, Any]
    resultSummary: str

class CopilotQueryResponse(BaseModel):
    response: str
    toolCallsExecuted: List[CopilotToolCall]
    referencedFindingIds: List[str]
    suggestedActions: List[str]

# --- PRD Section 9.1 OpenAPI Schemas ---
class FirmwareUploadResponse(BaseModel):
    status: str = "ACCEPTED"
    analysisId: str
    sha256: str
    estimatedTimeSec: int = 360
    links: Dict[str, str]

class AttackPathNodePRD(BaseModel):
    id: str
    type: str # "Service", "Vulnerability", "PrivilegeLevel", "Peripheral"
    name: Optional[str] = None
    cve: Optional[str] = None
    cvss: Optional[float] = None

class AttackPathItemPRD(BaseModel):
    pathId: str
    riskScore: float
    nodes: List[AttackPathNodePRD]
    mitigations: List[str]

class AttackPathsResponse(BaseModel):
    analysisId: str
    criticalPathCount: int
    paths: List[AttackPathItemPRD]

class CycloneDXProperty(BaseModel):
    name: str
    value: str

class CycloneDXComponentItem(BaseModel):
    type: str = "library"
    name: str
    version: str
    purl: Optional[str] = None
    properties: Optional[List[CycloneDXProperty]] = None

class CycloneDXTool(BaseModel):
    vendor: str = "SentinelForge"
    name: str = "Discovery Engine"
    version: str = "3.2.0"

class CycloneDXMetadataComponent(BaseModel):
    type: str = "firmware"
    name: str
    version: str

class CycloneDXMetadata(BaseModel):
    timestamp: str
    tools: List[CycloneDXTool] = Field(default_factory=lambda: [CycloneDXTool()])
    component: CycloneDXMetadataComponent

class CycloneDXExportResponse(BaseModel):
    bomFormat: str = "CycloneDX"
    specVersion: str = "1.5"
    serialNumber: str
    version: int = 1
    metadata: CycloneDXMetadata
    components: List[CycloneDXComponentItem]

class FuzzExecutionTelemetryPoint(BaseModel):
    time: str
    firmware_id: str
    worker_id: str
    execs_per_sec: float
    total_execs: int
    paths_found: int
    crashes_discovered: int
    current_hangs: int
    memory_usage_mb: int
    bitmap_density: float

class ExecutionCrashItem(BaseModel):
    time: str
    firmware_id: str
    crash_hash: str
    signal_type: str
    faulting_address: str
    pc_register: str
    stack_canary_intact: bool
    registers_state: Dict[str, Any]
    payload_size_bytes: int

class FirmwareTelemetryResponse(BaseModel):
    firmwareId: str
    telemetryHistory: List[FuzzExecutionTelemetryPoint]
    crashes: List[ExecutionCrashItem]
    currentExecSpeed: float
    totalExecs: int
    uniquePaths: int
    bitmapDensity: float

class FirmwareAnalysisRecord(BaseModel):
    id: str
    projectId: str
    userId: str
    filename: str
    sha256: str
    md5: str
    sizeBytes: int
    s3BlobPath: str
    architecture: str
    endianness: str
    status: Literal['QUEUED', 'EXTRACTING', 'STATIC_COMPLETE', 'EMULATING', 'FUZZING', 'SYNTHESIZING_GRAPH', 'COMPLETED', 'FAILED']
    errorReason: Optional[str] = None
    staticArtifacts: Optional[Dict[str, Any]] = None
    vulnerabilities: List[Dict[str, Any]] = Field(default_factory=list)
    sbomRecords: List[Dict[str, Any]] = Field(default_factory=list)
    createdAt: str
    updatedAt: str

