import heapq
import time
from typing import List, Dict, Any, Optional, Set
from pydantic import BaseModel
from app.models.schemas import AttackGraphData, AttackGraphNode, AttackGraphEdge

class DijkstraPathRequest(BaseModel):
    sourceNodeId: str = "node_entry_ble"
    targetNodeId: str = "node_asset_root_shell"
    algorithm: str = "DIJKSTRA"  # DIJKSTRA, BFS, A_STAR
    severedEdges: List[str] = []

class DijkstraStepTrace(BaseModel):
    stepIndex: int
    currentNodeId: str
    currentNodeLabel: str
    evaluatingTargetId: str
    evaluatingTargetLabel: str
    edgeId: str
    edgeWeight: float
    currentDistance: float
    newCalculatedDistance: float
    action: str  # RELAXED, PRUNED, VISITED

class PathHopDetail(BaseModel):
    hopNumber: int
    fromNodeId: str
    fromNodeLabel: str
    toNodeId: str
    toNodeLabel: str
    relationship: str
    edgeId: str
    exploitDifficulty: str
    hopCost: float
    cumulativeCost: float
    tacticalExplanation: str

class RankedAttackPath(BaseModel):
    rank: int
    id: str
    name: str
    ingressType: str
    nodePath: List[str]
    edgePath: List[str]
    hopCount: int
    resistanceCost: float
    riskScore: float
    color: str
    tacticalSummary: str
    exploitPrimitive: str
    mitigationStrategy: str

class DijkstraPathResult(BaseModel):
    sourceNodeId: str
    targetNodeId: str
    algorithm: str
    pathFound: bool
    nodePath: List[str]
    edgePath: List[str]
    hopCount: int
    totalResistanceCost: float
    compositeRiskScore: float
    executionTimeMs: float
    nodesVisitedCount: int
    relaxationSteps: List[DijkstraStepTrace]
    hops: List[PathHopDetail]
    bottleneckNodeId: Optional[str] = None
    bottleneckNodeLabel: Optional[str] = None
    alternativePaths: List[List[str]] = []
    rankedPaths: List[RankedAttackPath] = []
    defenseEffectivenessPercent: float = 0.0
    mitigationAdvice: List[str] = []

class CypherQueryRequest(BaseModel):
    query: str

class CypherQueryResult(BaseModel):
    query: str
    executionTimeMs: float
    matchedPathsCount: int
    columns: List[str]
    records: List[Dict[str, Any]]
    highlightedPathNodeIds: List[str]
    highlightedEdgeIds: List[str]

# =====================================================================
# Rich Enterprise Knowledge Graph Definition
# =====================================================================
FULL_KNOWLEDGE_GRAPH_NODES: List[Dict[str, Any]] = [
    # 1. Entry Points (Ingress Layer)
    {
        "id": "node_entry_ble",
        "label": "BLE GATT Ingress (UUID 0xFFE0)",
        "type": "ENTRY_POINT",
        "severity": "MEDIUM",
        "properties": {
            "name": "Unauthenticated BLE Radio Ingress",
            "description": "GATT Advertisement & Characteristic Write interface exposed over Bluetooth 5.2 radio.",
            "protocol": "BLE",
            "port": 0,
            "cvss": 5.3,
            "epss": 0.35,
            "emb3dRef": "EMB3D-T0014: Unauthenticated Wireless Exposure"
        }
    },
    {
        "id": "node_entry_http",
        "label": "Mini-Web HTTP (Port 80/TCP)",
        "type": "ENTRY_POINT",
        "severity": "HIGH",
        "properties": {
            "name": "Embedded Web Server Interface",
            "description": "Lightweight HTTP daemon listening on external WAN/LAN bridge.",
            "protocol": "HTTP/1.1",
            "port": 80,
            "cvss": 7.5,
            "epss": 0.65,
            "emb3dRef": "EMB3D-T0002: Insecure Management Interface"
        }
    },
    {
        "id": "node_entry_uart",
        "label": "Hardware UART Console (115200 baud)",
        "type": "ENTRY_POINT",
        "severity": "LOW",
        "properties": {
            "name": "Physical Serial Debug Header (J4)",
            "description": "Unprotected PCB 4-pin UART test pads exposing U-Boot command prompt.",
            "protocol": "SERIAL",
            "port": 0,
            "cvss": 4.6,
            "epss": 0.12,
            "emb3dRef": "EMB3D-T0001: Physical Debug Port Enabled"
        }
    },
    {
        "id": "node_entry_mqtt",
        "label": "MQTT Cloud Ingress (/gw/telemetry)",
        "type": "ENTRY_POINT",
        "severity": "MEDIUM",
        "properties": {
            "name": "Telemetry Broker Ingress",
            "description": "Subscribed topic handling remote cloud commands and firmware updates.",
            "protocol": "MQTT_TLS",
            "port": 8883,
            "cvss": 6.1,
            "epss": 0.28,
            "emb3dRef": "EMB3D-T0009: Insecure Cloud Ingress"
        }
    },

    # 2. Vulnerabilities (Exploit Layer)
    {
        "id": "node_vuln_overflow",
        "label": "Zero-Day Stack Overflow (SF-ZERO-2026-001)",
        "type": "VULNERABILITY",
        "severity": "CRITICAL",
        "properties": {
            "name": "BLE Packet Parser RCE (parse_ble_advertisement_packet)",
            "description": "Unchecked user packet length triggers unbounded memcpy corrupting $lr register.",
            "cvss": 9.8,
            "epss": 0.942,
            "cveId": "CVE-2026-9042",
            "emb3dRef": "EMB3D-T0018: Memory Corruption via Insecure Deserialization"
        }
    },
    {
        "id": "node_vuln_http_auth_bypass",
        "label": "HTTP Cookie Auth Bypass (CVE-2024-21887)",
        "type": "VULNERABILITY",
        "severity": "HIGH",
        "properties": {
            "name": "Admin Session Impersonation in httpd_arm",
            "description": "Predictable PRNG in session token generator allows unauthenticated admin actions.",
            "cvss": 8.8,
            "epss": 0.824,
            "cveId": "CVE-2024-21887",
            "emb3dRef": "EMB3D-T0004: Broken Authentication Mechanism"
        }
    },
    {
        "id": "node_vuln_nvram_escalation",
        "label": "SUID Command Injection (CVE-2024-38912)",
        "type": "VULNERABILITY",
        "severity": "CRITICAL",
        "properties": {
            "name": "NVRAM Daemon Privilege Escalation (/bin/nvram_set)",
            "description": "SUID-root binary passes unsanitized command parameter directly to popen('/bin/sh').",
            "cvss": 9.1,
            "epss": 0.795,
            "cveId": "CVE-2024-38912",
            "emb3dRef": "EMB3D-T0022: Local Privilege Escalation via SUID Binary"
        }
    },
    {
        "id": "node_vuln_uboot_env",
        "label": "U-Boot Bootargs Injection",
        "type": "VULNERABILITY",
        "severity": "MEDIUM",
        "properties": {
            "name": "Kernel init=/bin/sh Parameter Override",
            "description": "Unauthenticated bootloader environment allows passing init=/bin/sh to Linux kernel.",
            "cvss": 6.8,
            "epss": 0.18,
            "emb3dRef": "EMB3D-T0003: Insecure Boot Configuration"
        }
    },
    {
        "id": "node_vuln_mqtt_wildcard",
        "label": "MQTT Wildcard Topic Injection (SF-ZERO-2026-002)",
        "type": "VULNERABILITY",
        "severity": "CRITICAL",
        "properties": {
            "name": "Cloud Command Broker RCE (/gw/telemetry/#)",
            "description": "Unsanitized MQTT topic subscription allows remote command injection via poisoned JSON payload.",
            "cvss": 9.4,
            "epss": 0.91,
            "cveId": "CVE-2026-9043",
            "emb3dRef": "EMB3D-T0025: Message Broker Command Injection"
        }
    },

    # 3. Privilege & Process Contexts (Execution Layer)
    {
        "id": "node_priv_ble_daemon",
        "label": "Daemon Execution Context (ble_gatewayd)",
        "type": "PRIVILEGE",
        "severity": "HIGH",
        "properties": {
            "name": "ble_gatewayd User Context (UID 1002)",
            "description": "Restricted process isolation sandbox with HCI raw socket privileges.",
            "privilegeLevel": "daemon_user (UID: 1002)"
        }
    },
    {
        "id": "node_priv_web_user",
        "label": "Web Worker Context (www-data)",
        "type": "PRIVILEGE",
        "severity": "MEDIUM",
        "properties": {
            "name": "httpd_arm User Context (UID 33)",
            "description": "Web server worker thread context with access to cgi-bin directory.",
            "privilegeLevel": "www-data (UID: 33)"
        }
    },
    {
        "id": "node_priv_operator",
        "label": "Console Shell Context (operator)",
        "type": "PRIVILEGE",
        "severity": "HIGH",
        "properties": {
            "name": "Interactive CLI Session (UID 1000)",
            "description": "Serial shell access with limited diagnostic utilities.",
            "privilegeLevel": "operator (UID: 1000)"
        }
    },

    # 4. Hardware Buses & Lateral Movement Layer
    {
        "id": "node_bus_spi",
        "label": "Hardware SPI Flash Bus (/dev/spidev0.0)",
        "type": "PERIPHERAL",
        "severity": "HIGH",
        "properties": {
            "name": "Serial Peripheral Interface Driver",
            "description": "Kernel driver mapping physical Winbond NOR Flash memory pins.",
            "bus": "SPI"
        }
    },

    # 5. Critical Assets (Target Assets Layer)
    {
        "id": "node_asset_root_shell",
        "label": "Full Root Shell & Kernel Control (UID 0)",
        "type": "ASSET",
        "severity": "CRITICAL",
        "properties": {
            "name": "Complete Device Takeover",
            "description": "Persistent arbitrary kernel code execution, secret extraction, and fleet lateral movement.",
            "impact": "MAXIMUM_SYSTEM_COMPROMISE"
        }
    },
    {
        "id": "node_asset_bmc_flash",
        "label": "ASPEED BMC Firmware Flash Chip",
        "type": "ASSET",
        "severity": "CRITICAL",
        "properties": {
            "name": "Baseboard Management Controller Flash",
            "description": "Out-of-band server motherboard controller capable of permanent bricking.",
            "impact": "PERMANENT_HARDWARE_SUBVERSION"
        }
    },
    {
        "id": "node_asset_crypto_store",
        "label": "Device Cryptographic Keystore (/etc/ssl/)",
        "type": "ASSET",
        "severity": "CRITICAL",
        "properties": {
            "name": "Device Identity TLS Private Keys",
            "description": "Fleet-wide authentication certificates enabling rogue cloud synchronization.",
            "impact": "FLEET_WIDE_IMPERSONATION"
        }
    }
]

FULL_KNOWLEDGE_GRAPH_EDGES: List[Dict[str, Any]] = [
    # Ingress to Vulnerabilities
    {
        "id": "e_ble_overflow",
        "source": "node_entry_ble",
        "target": "node_vuln_overflow",
        "relationship": "EXPOSES",
        "exploitConfidence": 0.98,
        "tacticalExplanation": "Unauthenticated BLE advertisement packet is parsed directly by vulnerable memcpy handler."
    },
    {
        "id": "e_http_auth_bypass",
        "source": "node_entry_http",
        "target": "node_vuln_http_auth_bypass",
        "relationship": "EXPOSES",
        "exploitConfidence": 0.92,
        "tacticalExplanation": "Remote web request with forged authentication header bypasses login check."
    },
    {
        "id": "e_uart_uboot",
        "source": "node_entry_uart",
        "target": "node_vuln_uboot_env",
        "relationship": "EXPOSES",
        "exploitConfidence": 0.85,
        "tacticalExplanation": "Attacker interrupts serial boot sequence during power-on autoboot countdown."
    },
    {
        "id": "e_mqtt_wildcard",
        "source": "node_entry_mqtt",
        "target": "node_vuln_mqtt_wildcard",
        "relationship": "EXPOSES",
        "exploitConfidence": 0.95,
        "tacticalExplanation": "Subscribed cloud broker parses unauthenticated command telemetry packet with wildcard topic."
    },
    {
        "id": "e_mqtt_ble_daemon",
        "source": "node_vuln_mqtt_wildcard",
        "target": "node_priv_ble_daemon",
        "relationship": "EXPLOITS",
        "exploitConfidence": 0.92,
        "tacticalExplanation": "Poisoned MQTT topic payload executes shellcode within ble_gatewayd shared IPC context (UID 1002)."
    },

    # Vulnerabilities to Privileges / Contexts
    {
        "id": "e_overflow_ble_daemon",
        "source": "node_vuln_overflow",
        "target": "node_priv_ble_daemon",
        "relationship": "EXPLOITS",
        "exploitConfidence": 0.94,
        "tacticalExplanation": "Stack buffer overflow hijacks $lr register, spawning shellcode under ble_gatewayd context (UID 1002)."
    },
    {
        "id": "e_auth_bypass_web_user",
        "source": "node_vuln_http_auth_bypass",
        "target": "node_priv_web_user",
        "relationship": "EXPLOITS",
        "exploitConfidence": 0.89,
        "tacticalExplanation": "Forged admin token invokes CGI command execution under www-data context (UID 33)."
    },
    {
        "id": "e_uboot_operator",
        "source": "node_vuln_uboot_env",
        "target": "node_priv_operator",
        "relationship": "EXPLOITS",
        "exploitConfidence": 0.90,
        "tacticalExplanation": "Overridden bootloader parameters boot Linux into single-user recovery mode."
    },

    # Privileges to Escalation Vulnerabilities
    {
        "id": "e_daemon_nvram_escalation",
        "source": "node_priv_ble_daemon",
        "target": "node_vuln_nvram_escalation",
        "relationship": "ESCALATES_TO",
        "exploitConfidence": 0.91,
        "tacticalExplanation": "ble_gatewayd invokes /bin/nvram_set with unsanitized parameters, triggering SUID injection."
    },
    {
        "id": "e_web_nvram_escalation",
        "source": "node_priv_web_user",
        "target": "node_vuln_nvram_escalation",
        "relationship": "ESCALATES_TO",
        "exploitConfidence": 0.84,
        "tacticalExplanation": "Web CGI script writes user input into NVRAM, reaching vulnerable SUID wrapper."
    },

    # Escalation to Root Asset
    {
        "id": "e_nvram_root",
        "source": "node_vuln_nvram_escalation",
        "target": "node_asset_root_shell",
        "relationship": "COMPROMISES",
        "exploitConfidence": 0.96,
        "tacticalExplanation": "SUID popen('/bin/sh') executes payload as UID 0, delivering an interactive root shell."
    },
    {
        "id": "e_operator_root",
        "source": "node_priv_operator",
        "target": "node_asset_root_shell",
        "relationship": "COMPROMISES",
        "exploitConfidence": 0.78,
        "tacticalExplanation": "Console operator abuses sudo misconfiguration or cleartext shadow password."
    },

    # Root to Lateral Hardware Flash & Keystore
    {
        "id": "e_root_spi_bus",
        "source": "node_asset_root_shell",
        "target": "node_bus_spi",
        "relationship": "ACCESSES_PERIPHERAL",
        "exploitConfidence": 0.99,
        "tacticalExplanation": "Root privilege grants raw read/write access to SPI flash device node /dev/spidev0.0."
    },
    {
        "id": "e_root_crypto_store",
        "source": "node_asset_root_shell",
        "target": "node_asset_crypto_store",
        "relationship": "EXFILTRATES",
        "exploitConfidence": 0.99,
        "tacticalExplanation": "Root user dumps unencrypted RSA-2048 private keys from /etc/ssl/."
    },
    {
        "id": "e_spi_bmc_flash",
        "source": "node_bus_spi",
        "target": "node_asset_bmc_flash",
        "relationship": "ALLOWS_LATERAL_MOVE",
        "exploitConfidence": 0.95,
        "tacticalExplanation": "Direct SPI bus commands overwrite ASPEED BMC firmware image on mother board."
    }
]

class AttackGraphEngine:
    """
    Graph Traversal Engine for Multi-Hop Vulnerability Chaining & Dijkstra Shortest Path.
    Simulates enterprise Neo4j graph algorithms with mathematical edge resistance weighting.
    """

    def __init__(self):
        self.nodes_map: Dict[str, Dict[str, Any]] = {n["id"]: n for n in FULL_KNOWLEDGE_GRAPH_NODES}
        self.edges_list: List[Dict[str, Any]] = FULL_KNOWLEDGE_GRAPH_EDGES

    def get_full_graph_data(self) -> AttackGraphData:
        # Default shortest path from BLE to Root Shell
        default_res = self.solve_shortest_path(DijkstraPathRequest())
        shortest_path_nodes = default_res.nodePath
        shortest_path_edge_set = set(default_res.edgePath)

        nodes = []
        for n in FULL_KNOWLEDGE_GRAPH_NODES:
            nodes.append(
                AttackGraphNode(
                    id=n["id"],
                    label=n["label"],
                    type=n["type"],
                    severity=n.get("severity", "MEDIUM"),
                    properties=n.get("properties", {})
                )
            )

        edges = []
        for e in self.edges_list:
            edges.append(
                AttackGraphEdge(
                    id=e["id"],
                    source=e["source"],
                    target=e["target"],
                    relationship=e["relationship"],
                    isInShortestAttackPath=e["id"] in shortest_path_edge_set,
                    exploitConfidence=e.get("exploitConfidence", 0.95)
                )
            )

        return AttackGraphData(
            nodes=nodes,
            edges=edges,
            criticalAttackPathsCount=len(default_res.alternativePaths) + 1,
            shortestPathToRootCompromise=shortest_path_nodes
        )

    def _compute_edge_resistance_cost(self, edge: Dict[str, Any]) -> float:
        """
        Mathematical resistance score for Dijkstra pathfinding.
        Lower resistance = easier exploit = attacker's path of least resistance.
        Formula: (10.0 / CVSS) * (1.05 - EPSS) * (1.0 / exploitConfidence)
        """
        target_node = self.nodes_map.get(edge["target"], {})
        props = target_node.get("properties", {})
        cvss = float(props.get("cvss", 7.0))
        epss = float(props.get("epss", 0.5))
        confidence = float(edge.get("exploitConfidence", 0.9))

        base_cost = (10.0 / max(1.0, cvss)) * (1.05 - min(0.99, epss)) * (1.0 / max(0.1, confidence))
        return round(max(0.5, base_cost), 3)

    def solve_shortest_path(self, req: DijkstraPathRequest) -> DijkstraPathResult:
        start_time = time.perf_counter()
        severed_set = set(req.severedEdges)

        # Build adjacency graph
        adj: Dict[str, List[Dict[str, Any]]] = {n["id"]: [] for n in FULL_KNOWLEDGE_GRAPH_NODES}
        for edge in self.edges_list:
            if edge["id"] in severed_set:
                continue
            cost = self._compute_edge_resistance_cost(edge)
            adj[edge["source"]].append({
                "target": edge["target"],
                "edgeId": edge["id"],
                "relationship": edge["relationship"],
                "tacticalExplanation": edge.get("tacticalExplanation", ""),
                "cost": cost if req.algorithm != "BFS" else 1.0
            })

        source = req.sourceNodeId if req.sourceNodeId in adj else "node_entry_ble"
        target = req.targetNodeId if req.targetNodeId in adj else "node_asset_root_shell"

        # Dijkstra priority queue: (distance, node_id, path_nodes, path_edges)
        pq = [(0.0, source, [source], [])]
        visited: Dict[str, float] = {}
        relaxation_steps: List[DijkstraStepTrace] = []
        found_node_path: List[str] = []
        found_edge_path: List[str] = []
        total_cost = 0.0

        step_counter = 0

        while pq:
            dist, current, p_nodes, p_edges = heapq.heappop(pq)
            step_counter += 1

            if current in visited and visited[current] <= dist:
                continue
            visited[current] = dist

            if current == target:
                found_node_path = p_nodes
                found_edge_path = p_edges
                total_cost = dist
                break

            curr_label = self.nodes_map.get(current, {}).get("label", current)

            for neighbor in adj.get(current, []):
                nxt = neighbor["target"]
                edge_cost = neighbor["cost"]
                nxt_dist = dist + edge_cost
                nxt_label = self.nodes_map.get(nxt, {}).get("label", nxt)

                if nxt in visited and visited[nxt] <= nxt_dist:
                    relaxation_steps.append(
                        DijkstraStepTrace(
                            stepIndex=step_counter,
                            currentNodeId=current,
                            currentNodeLabel=curr_label,
                            evaluatingTargetId=nxt,
                            evaluatingTargetLabel=nxt_label,
                            edgeId=neighbor["edgeId"],
                            edgeWeight=edge_cost,
                            currentDistance=dist,
                            newCalculatedDistance=nxt_dist,
                            action="PRUNED"
                        )
                    )
                    continue

                relaxation_steps.append(
                    DijkstraStepTrace(
                        stepIndex=step_counter,
                        currentNodeId=current,
                        currentNodeLabel=curr_label,
                        evaluatingTargetId=nxt,
                        evaluatingTargetLabel=nxt_label,
                        edgeId=neighbor["edgeId"],
                        edgeWeight=edge_cost,
                        currentDistance=dist,
                        newCalculatedDistance=nxt_dist,
                        action="RELAXED"
                    )
                )

                heapq.heappush(
                    pq,
                    (nxt_dist, nxt, p_nodes + [nxt], p_edges + [neighbor["edgeId"]])
                )

        exec_time_ms = round((time.perf_counter() - start_time) * 1000, 2)

        # Build detailed hop list
        hops: List[PathHopDetail] = []
        cum_cost = 0.0
        edge_id_to_edge = {e["id"]: e for e in self.edges_list}

        for i, edge_id in enumerate(found_edge_path):
            e_info = edge_id_to_edge.get(edge_id, {})
            c = self._compute_edge_resistance_cost(e_info)
            cum_cost += c
            from_n = self.nodes_map.get(e_info.get("source", ""), {})
            to_n = self.nodes_map.get(e_info.get("target", ""), {})

            hops.append(
                PathHopDetail(
                    hopNumber=i + 1,
                    fromNodeId=from_n.get("id", ""),
                    fromNodeLabel=from_n.get("label", ""),
                    toNodeId=to_n.get("id", ""),
                    toNodeLabel=to_n.get("label", ""),
                    relationship=e_info.get("relationship", "EXPLOITS"),
                    edgeId=edge_id,
                    exploitDifficulty="TRIVIAL" if c < 1.5 else "MODERATE" if c < 3.0 else "HARD",
                    hopCost=c,
                    cumulativeCost=round(cum_cost, 2),
                    tacticalExplanation=e_info.get("tacticalExplanation", "Exploit chain lateral progression step.")
                )
            )

        # Identify bottleneck / cut vertex (highest impact node to patch)
        bottleneck_id = None
        bottleneck_label = None
        if len(found_node_path) > 2:
            # First intermediate vulnerability node is typically highest value cut-vertex
            for nid in found_node_path[1:-1]:
                if self.nodes_map.get(nid, {}).get("type") == "VULNERABILITY":
                    bottleneck_id = nid
                    bottleneck_label = self.nodes_map.get(nid, {}).get("label")
                    break

        # Compute multi-hop ranked paths for comparison (Target-Aware)
        ranked_paths: List[RankedAttackPath] = []
        
        # Target extension helper for lateral movement
        target_suffix_nodes = []
        target_suffix_edges = []
        target_suffix_cost = 0.0
        if target == "node_asset_bmc_flash":
            target_suffix_nodes = ["node_bus_spi", "node_asset_bmc_flash"]
            target_suffix_edges = ["e_root_spi_bus", "e_spi_bmc_flash"]
            target_suffix_cost = 1.85
        elif target == "node_asset_crypto_store":
            target_suffix_nodes = ["node_asset_crypto_store"]
            target_suffix_edges = ["e_root_crypto_store"]
            target_suffix_cost = 0.95

        # Path 1: BLE Zero-Click
        ble_edges = ["e_ble_overflow", "e_overflow_ble_daemon", "e_daemon_nvram_escalation", "e_nvram_root"] + target_suffix_edges
        if not any(e in severed_set for e in ble_edges):
            ble_nodes = ["node_entry_ble", "node_vuln_overflow", "node_priv_ble_daemon", "node_vuln_nvram_escalation", "node_asset_root_shell"] + target_suffix_nodes
            ranked_paths.append(
                RankedAttackPath(
                    rank=1,
                    id="path_rank_1_ble",
                    name="Zero-Click BLE Ingress Kill-Chain",
                    ingressType="WIRELESS_RF",
                    nodePath=ble_nodes,
                    edgePath=ble_edges,
                    hopCount=len(ble_edges),
                    resistanceCost=round(1.48 + target_suffix_cost, 2),
                    riskScore=9.8,
                    color="#ff3366",
                    tacticalSummary=f"Unauthenticated BLE advertisement packet triggers buffer overflow in memcpy, elevating via SUID nvram_set to Root Shell{' and traversing SPI to BMC Flash' if target == 'node_asset_bmc_flash' else ''}.",
                    exploitPrimitive="Stack Buffer Overflow (Unbounded memcpy) + SUID popen() Injection",
                    mitigationStrategy="Enforce destination buffer bounds in parse_ble_advertisement_packet and drop ble_gatewayd capabilities."
                )
            )

        # Path 2: HTTP Web Auth Impersonation
        http_edges = ["e_http_auth_bypass", "e_auth_bypass_web_user", "e_web_nvram_escalation", "e_nvram_root"] + target_suffix_edges
        if not any(e in severed_set for e in http_edges):
            http_nodes = ["node_entry_http", "node_vuln_http_auth_bypass", "node_priv_web_user", "node_vuln_nvram_escalation", "node_asset_root_shell"] + target_suffix_nodes
            ranked_paths.append(
                RankedAttackPath(
                    rank=2,
                    id="path_rank_2_http",
                    name="Web Administrative Cookie Bypass Chain",
                    ingressType="NETWORK_TCP",
                    nodePath=http_nodes,
                    edgePath=http_edges,
                    hopCount=len(http_edges),
                    resistanceCost=round(2.15 + target_suffix_cost, 2),
                    riskScore=8.8,
                    color="#f59e0b",
                    tacticalSummary=f"Forged admin cookie triggers CGI command execution under www-data, leveraging SUID NVRAM helper to elevate to Root Shell{' and accessing target hardware' if target != 'node_asset_root_shell' else ''}.",
                    exploitPrimitive="Broken Authentication + Weak PRNG Session Token + SUID Helper",
                    mitigationStrategy="Migrate to cryptographically signed HMAC session tokens and restrict CGI execution permissions."
                )
            )

        # Path 3: Physical Console Bootargs Injection
        uart_edges = ["e_uart_uboot", "e_uboot_operator", "e_operator_root"] + target_suffix_edges
        if not any(e in severed_set for e in uart_edges):
            uart_nodes = ["node_entry_uart", "node_vuln_uboot_env", "node_priv_operator", "node_asset_root_shell"] + target_suffix_nodes
            ranked_paths.append(
                RankedAttackPath(
                    rank=3,
                    id="path_rank_3_uart",
                    name="Physical UART Serial Bootargs Hijack",
                    ingressType="PHYSICAL_UART",
                    nodePath=uart_nodes,
                    edgePath=uart_edges,
                    hopCount=len(uart_edges),
                    resistanceCost=round(3.40 + target_suffix_cost, 2),
                    riskScore=6.8,
                    color="#a855f7",
                    tacticalSummary="Attacker connects to UART test pads on PCB, interrupts U-Boot boot countdown, and passes init=/bin/sh to boot single-user root shell.",
                    exploitPrimitive="Bootloader Console Escape + Kernel Parameter Tampering",
                    mitigationStrategy="Disable autoboot countdown delay (bootdelay=0) and password-protect U-Boot interactive prompt."
                )
            )

        # Path 4: MQTT Cloud Ingress Kill-Chain
        mqtt_edges = ["e_mqtt_wildcard", "e_mqtt_ble_daemon", "e_daemon_nvram_escalation", "e_nvram_root"] + target_suffix_edges
        if not any(e in severed_set for e in mqtt_edges):
            mqtt_nodes = ["node_entry_mqtt", "node_vuln_mqtt_wildcard", "node_priv_ble_daemon", "node_vuln_nvram_escalation", "node_asset_root_shell"] + target_suffix_nodes
            ranked_paths.append(
                RankedAttackPath(
                    rank=4,
                    id="path_rank_4_mqtt",
                    name="MQTT Cloud Telemetry Ingress Kill-Chain",
                    ingressType="NETWORK_MQTT",
                    nodePath=mqtt_nodes,
                    edgePath=mqtt_edges,
                    hopCount=len(mqtt_edges),
                    resistanceCost=round(1.92 + target_suffix_cost, 2),
                    riskScore=9.4,
                    color="#00f5d4",
                    tacticalSummary="Cloud telemetry topic wildcard injection executes payload in broker daemon context, escalating through NVRAM helper.",
                    exploitPrimitive="Wildcard Topic Poisoning + Command Deserialization RCE",
                    mitigationStrategy="Validate topic strings against strict whitelist regex and disallow shell meta-characters."
                )
            )

        # Calculate defense effectiveness percentage
        defense_score = 0.0
        if "e_ble_overflow" in severed_set or "e_overflow_ble_daemon" in severed_set:
            defense_score += 40.0
        if "e_http_auth_bypass" in severed_set or "e_auth_bypass_web_user" in severed_set:
            defense_score += 25.0
        if "e_daemon_nvram_escalation" in severed_set or "e_web_nvram_escalation" in severed_set or "e_nvram_root" in severed_set:
            defense_score += 30.0
        if "e_uart_uboot" in severed_set:
            defense_score += 15.0
        if "e_mqtt_wildcard" in severed_set:
            defense_score += 20.0
        if "e_root_spi_bus" in severed_set or "e_spi_bmc_flash" in severed_set:
            defense_score += 35.0
        defense_score = min(100.0, defense_score)

        # Collect alternative node paths
        alt_paths = [p.nodePath for p in ranked_paths if p.nodePath != found_node_path]

        # Generate targeted mitigation recommendations
        mitigations: List[str] = []
        if "node_vuln_overflow" in found_node_path:
            mitigations.append("Apply input boundary enforcement at parse_ble_advertisement_packet (bounds check memcpy).")
        if "node_vuln_http_auth_bypass" in found_node_path:
            mitigations.append("Migrate web session tokens to HMAC-SHA256 cryptographically random tokens.")
        if "node_vuln_nvram_escalation" in found_node_path:
            mitigations.append("Strip SUID permissions from /bin/nvram_set and restrict shell invocations via AppArmor profiles.")
        if "node_vuln_uboot_env" in found_node_path:
            mitigations.append("Configure bootdelay=0 in U-Boot environment and enable hardware cryptographic signature verification.")
        if "node_vuln_mqtt_wildcard" in found_node_path:
            mitigations.append("Sanitize MQTT topic wildcards and disallow payload execution without digital signature.")
        if "node_bus_spi" in found_node_path:
            mitigations.append("Assert hardware SPI Write-Protect pin (WP#) via GPIO controller during operational runtime.")
        if not mitigations:
            mitigations.append("Primary attack vector severed. Maintain defense-in-depth hardware isolation.")

        return DijkstraPathResult(
            sourceNodeId=source,
            targetNodeId=target,
            algorithm=req.algorithm,
            pathFound=len(found_node_path) > 0,
            nodePath=found_node_path,
            edgePath=found_edge_path,
            hopCount=len(found_edge_path),
            totalResistanceCost=round(total_cost, 2),
            compositeRiskScore=round(max(0.0, 10.0 - (total_cost * 0.8)), 1) if len(found_node_path) > 0 else 0.0,
            executionTimeMs=exec_time_ms,
            nodesVisitedCount=len(visited),
            relaxationSteps=relaxation_steps[:20],
            hops=hops,
            bottleneckNodeId=bottleneck_id,
            bottleneckNodeLabel=bottleneck_label,
            alternativePaths=alt_paths,
            rankedPaths=ranked_paths,
            defenseEffectivenessPercent=round(defense_score, 1),
            mitigationAdvice=mitigations
        )

    def execute_cypher_query(self, query_str: str) -> CypherQueryResult:
        start_time = time.perf_counter()
        clean = query_str.strip().upper()

        records = []
        cols = ["Path", "Hops", "ChainingScore", "MitigationPriority"]
        hl_nodes = []
        hl_edges = []

        if "SHORTESTPATH" in clean or "DIJKSTRA" in clean:
            records = [
                {
                    "Path": "BLE Ingress -> SF-ZERO-2026-001 -> ble_gatewayd -> CVE-2024-38912 -> Root Shell",
                    "Hops": 4,
                    "ChainingScore": 9.8,
                    "MitigationPriority": "CRITICAL (Immediate)"
                },
                {
                    "Path": "Mini-Web (Port 80) -> CVE-2024-21887 -> www-data -> CVE-2024-38912 -> Root Shell",
                    "Hops": 4,
                    "ChainingScore": 8.9,
                    "MitigationPriority": "HIGH (Rapid)"
                }
            ]
            hl_nodes = ["node_entry_ble", "node_vuln_overflow", "node_priv_ble_daemon", "node_vuln_nvram_escalation", "node_asset_root_shell"]
            hl_edges = ["e_ble_overflow", "e_overflow_ble_daemon", "e_daemon_nvram_escalation", "e_nvram_root"]
        elif "BMC" in clean or "SPI" in clean:
            records = [
                {
                    "Path": "Root Shell -> /dev/spidev0.0 -> ASPEED BMC Flash",
                    "Hops": 2,
                    "ChainingScore": 9.9,
                    "MitigationPriority": "CRITICAL (Permanent Hardware Brick)"
                }
            ]
            hl_nodes = ["node_asset_root_shell", "node_bus_spi", "node_asset_bmc_flash"]
            hl_edges = ["e_root_spi_bus", "e_spi_bmc_flash"]
        elif "VULNERABILITY" in clean:
            records = [
                {"Vulnerability": "SF-ZERO-2026-001 (BLE Overflow)", "CVSS": 9.8, "EPSS": 0.94, "Remediation": "Bounds check"},
                {"Vulnerability": "CVE-2024-21887 (HTTP Auth Bypass)", "CVSS": 8.8, "EPSS": 0.82, "Remediation": "Cryptographic tokens"},
                {"Vulnerability": "CVE-2024-38912 (NVRAM SUID Injection)", "CVSS": 9.1, "EPSS": 0.79, "Remediation": "Remove SUID bit"}
            ]
            cols = ["Vulnerability", "CVSS", "EPSS", "Remediation"]
            hl_nodes = ["node_vuln_overflow", "node_vuln_http_auth_bypass", "node_vuln_nvram_escalation"]
        else:
            records = [
                {"Result": "Traversal matched 14 nodes and 12 relationships across firmware graph.", "Status": "COMPLETED"}
            ]
            cols = ["Result", "Status"]

        exec_ms = round((time.perf_counter() - start_time) * 1000, 2)

        return CypherQueryResult(
            query=query_str,
            executionTimeMs=exec_ms,
            matchedPathsCount=len(records),
            columns=cols,
            records=records,
            highlightedPathNodeIds=hl_nodes,
            highlightedEdgeIds=hl_edges
        )

attack_graph_engine = AttackGraphEngine()
