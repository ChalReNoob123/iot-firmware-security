from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["service"] == "SentinelForge API Core"

def test_list_devices():
    response = client.get("/api/v1/devices")
    assert response.status_code == 200
    devices = response.json()
    assert len(devices) >= 3
    assert devices[0]["id"] == "dev_edge_gateway_01"

def test_attestation_signing():
    req_body = {
        "testerName": "Test Security Engineer",
        "testerEmail": "tester@sentinelforge.internal",
        "organization": "Security Audit Org",
        "deviceId": "dev_smart_meter_02",
        "authorizationType": "OWNER_CERTIFIED",
        "attestationTermsAccepted": True
    }
    response = client.post("/api/v1/devices/dev_smart_meter_02/attestation", json=req_body)
    assert response.status_code == 200
    data = response.json()
    assert "signatureHash" in data
    assert data["signatureHash"].startswith("sha256:")

def test_get_scan_and_findings():
    response = client.get("/api/v1/scans/scan_gw9842_arm_prod")
    assert response.status_code == 200
    scan = response.json()
    assert len(scan["stages"]) == 10
    assert len(scan["findings"]) >= 4

def test_symbolic_taint_trace():
    response = client.get("/api/v1/findings/SF-ZERO-2026-001/taint-trace")
    assert response.status_code == 200
    trace = response.json()
    assert trace["sinkFunction"] == "memcpy"
    assert trace["satisfiability"] == "SAT"
    assert len(trace["taintTrace"]) >= 4

def test_attack_graph():
    response = client.get("/api/v1/attack-graph")
    assert response.status_code == 200
    graph = response.json()
    assert len(graph["nodes"]) >= 5
    assert len(graph["shortestPathToRootCompromise"]) >= 4

def test_copilot_mcp_query():
    req = {
        "prompt": "Explain the zero-day buffer overflow in BLE and show the taint trace"
    }
    response = client.post("/api/v1/copilot/query", json=req)
    assert response.status_code == 200
    data = response.json()
    assert len(data["toolCallsExecuted"]) > 0
    assert "SF-ZERO-2026-001" in data["referencedFindingIds"]
