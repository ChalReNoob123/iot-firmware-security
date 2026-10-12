import io
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_firmware_upload_accepted():
    """
    Test PRD Section 9.1 POST /api/v1/firmware/upload
    Expects 202 Accepted, analysisId, sha256, links
    """
    mock_binary_data = b"\x7fELF\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00" + b"A" * 1024
    files = {
        "file": ("firmware-ax9000.bin", io.BytesIO(mock_binary_data), "application/octet-stream")
    }
    data = {
        "projectId": "d6f78a22-387b-48ce-939e-4c55ec37d10e",
        "fuzzBudgetMs": 300000
    }

    response = client.post("/api/v1/firmware/upload", files=files, data=data)
    assert response.status_code == 202
    res_json = response.json()
    assert res_json["status"] == "ACCEPTED"
    assert "analysisId" in res_json
    assert "sha256" in res_json
    assert res_json["estimatedTimeSec"] == 360
    assert "telemetryStream" in res_json["links"]
    assert "graphVisualization" in res_json["links"]

def test_query_lateral_movement_attack_paths():
    """
    Test PRD Section 9.1 GET /api/v1/firmware/{analysisId}/attack-paths?maxDepth=6&target=BMC
    """
    analysis_id = "fa91280b-22d7-4df3-b3c0-366016e78841"
    response = client.get(f"/api/v1/firmware/{analysis_id}/attack-paths?maxDepth=6&target=BMC")
    assert response.status_code == 200
    data = response.json()
    assert data["analysisId"] == analysis_id
    assert data["criticalPathCount"] >= 1
    assert len(data["paths"]) >= 1

    path = data["paths"][0]
    assert path["riskScore"] >= 9.0
    assert len(path["nodes"]) == 5
    # Verify exact archetypal node chain: Service -> Vulnerability -> Privilege -> Peripheral -> Target
    node_types = [n["type"] for n in path["nodes"]]
    assert node_types == ["Service", "Vulnerability", "PrivilegeLevel", "Peripheral", "Peripheral"]
    assert len(path["mitigations"]) >= 1

def test_export_cyclonedx_sbom():
    """
    Test PRD Section 9.1 GET /api/v1/firmware/{analysisId}/sbom/cyclonedx
    """
    analysis_id = "fa91280b-22d7-4df3-b3c0-366016e78841"
    response = client.get(f"/api/v1/firmware/{analysis_id}/sbom/cyclonedx")
    assert response.status_code == 200
    data = response.json()
    assert data["bomFormat"] == "CycloneDX"
    assert data["specVersion"] == "1.5"
    assert data["serialNumber"] == f"urn:uuid:{analysis_id}"
    assert len(data["components"]) >= 1
    # Check reachability property
    busybox = next((c for c in data["components"] if c["name"] == "busybox"), None)
    assert busybox is not None
    assert busybox["version"] == "1.33.1"
    assert busybox["properties"][0]["name"] == "sentinelforge:reachability"
    assert busybox["properties"][0]["value"] == "exploitable_path_confirmed"

def test_firmware_telemetry_and_crashes():
    """
    Test PRD Section 5.2 TimescaleDB Telemetry retrieval
    """
    analysis_id = "fa91280b-22d7-4df3-b3c0-366016e78841"
    response = client.get(f"/api/v1/firmware/{analysis_id}/telemetry")
    assert response.status_code == 200
    data = response.json()
    assert data["firmwareId"] == analysis_id
    assert len(data["telemetryHistory"]) > 0
    assert "currentExecSpeed" in data
    assert "crashes" in data

def test_firmware_analysis_detail():
    """
    Test PRD Section 5.1 Relational details
    """
    analysis_id = "fa91280b-22d7-4df3-b3c0-366016e78841"
    response = client.get(f"/api/v1/firmware/{analysis_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == analysis_id
    assert data["filename"] == "firmware-ax9000.bin"
    assert data["architecture"] == "MIPS32el"
    assert data["status"] == "COMPLETED"
    assert data["staticArtifacts"]["filesystemType"] == "squashfs"
