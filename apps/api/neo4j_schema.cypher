// =====================================================================
// SentinelForge: Neo4j Graph Model Definition
// Per Section 5.3 & Section 4.3 of SentinelForge PRD
// =====================================================================

// 1. Uniqueness & Index Constraints
CREATE CONSTRAINT unique_firmware IF NOT EXISTS FOR (fw:Firmware) REQUIRE fw.id IS UNIQUE;
CREATE CONSTRAINT unique_binary IF NOT EXISTS FOR (b:Binary) REQUIRE b.hash IS UNIQUE;
CREATE CONSTRAINT unique_vuln IF NOT EXISTS FOR (v:Vulnerability) REQUIRE v.signature IS UNIQUE;
CREATE CONSTRAINT unique_service IF NOT EXISTS FOR (s:Service) REQUIRE s.endpoint IS UNIQUE;
CREATE CONSTRAINT unique_privilege IF NOT EXISTS FOR (p:PrivilegeLevel) REQUIRE p.name IS UNIQUE;
CREATE CONSTRAINT unique_peripheral IF NOT EXISTS FOR (pr:Peripheral) REQUIRE pr.name IS UNIQUE;

// Indexing for high-speed multi-hop traversals
CREATE INDEX idx_binary_name IF NOT EXISTS FOR (b:Binary) ON (b.name);
CREATE INDEX idx_vuln_cve IF NOT EXISTS FOR (v:Vulnerability) ON (v.cve);
CREATE INDEX idx_service_port IF NOT EXISTS FOR (s:Service) ON (s.port);

// 2. Archetypal Attack Chain Ingestion Script
// Maps from exposed network daemon -> memory corruption -> root execution -> hardware bus / BMC flash
UNWIND $attackChains AS chain
MERGE (fw:Firmware {id: chain.firmwareId, name: chain.filename})
MERGE (bin:Binary {name: chain.binaryName, hash: chain.binaryHash})
MERGE (srv:Service {name: chain.serviceName, port: chain.servicePort, protocol: chain.serviceProtocol, endpoint: chain.serviceEndpoint})
MERGE (vuln:Vulnerability {
    signature: chain.vulnSignature,
    cve: chain.cveId,
    type: chain.vulnType,
    exploitability: chain.exploitability,
    cvss: chain.cvssScore,
    epss: chain.epssScore
})
MERGE (priv:PrivilegeLevel {name: chain.privilegeName, uid: chain.privilegeUid})
MERGE (dev:Peripheral {name: chain.peripheralDevice, bus: chain.busType})
MERGE (target:Peripheral {name: chain.targetHardware, bus: chain.targetBus})

MERGE (fw)-[:CONTAINS_BINARY]->(bin)
MERGE (bin)-[:EXPOSES_SERVICE]->(srv)
MERGE (srv)-[:HAS_VULNERABILITY]->(vuln)
MERGE (vuln)-[:GRANTS_PRIVILEGE]->(priv)
MERGE (priv)-[:ACCESSES_PERIPHERAL]->(dev)
MERGE (dev)-[:ALLOWS_LATERAL_MOVE {vector: 'hardware_bus_write', blastRadius: 'CRITICAL'}]->(target);

// 3. Shortest Lateral Movement Pathfinding Query (Dijkstra / Cypher)
// Finds critical paths from unauthenticated externally exposed services down to BMC or SPI controller
MATCH (start:Service)
MATCH (target:Peripheral {name: $targetName})
MATCH path = shortestPath((start)-[*..6]->(target))
RETURN path,
       reduce(score = 0.0, node in nodes(path) |
           score + CASE WHEN 'Vulnerability' in labels(node) THEN coalesce(node.cvss, 0.0) ELSE 0.0 END
       ) AS exploitChainingScore
ORDER BY exploitChainingScore DESC
LIMIT 5;
