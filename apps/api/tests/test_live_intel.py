import io
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_host_telemetry_endpoint():
    res = client.get("/api/v1/intel/host-telemetry")
    assert res.status_code == 200
    data = res.json()
    assert "system" in data
    assert "cpu" in data
    assert "memory" in data
    assert "architecture" in data["system"]
    assert data["execution"]["executionSandboxStatus"] == "OPERATIONAL"

def test_cisa_kev_live_endpoint():
    res = client.get("/api/v1/intel/cisa-kev?limit=5")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ONLINE"
    assert "vulnerabilities" in data
    assert len(data["vulnerabilities"]) > 0
    # Verify presence of real CVE identifier
    first_cve = data["vulnerabilities"][0]
    assert "cveID" in first_cve
    assert first_cve["cveID"].startswith("CVE-")

def test_live_epss_endpoint():
    res = client.get("/api/v1/intel/epss?cves=CVE-2024-3400,CVE-2021-44228")
    assert res.status_code == 200
    data = res.json()
    assert "data" in data

def test_analyze_binary_endpoint():
    # Construct small test ELF binary header
    # 0x7f, 'E', 'L', 'F', EI_CLASS=1 (32-bit), EI_DATA=1 (Little endian)
    elf_header = bytearray([
        0x7f, 0x45, 0x4c, 0x46, 0x01, 0x01, 0x01, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x02, 0x00, 0x28, 0x00  # e_type=ET_EXEC, e_machine=0x0028 (ARM)
    ])
    # Pad to 64 bytes with memcpy string
    elf_header.extend(b"\x00" * 20 + b"memcpy" + b"\x00" * 18)

    file_obj = io.BytesIO(bytes(elf_header))
    res = client.post(
        "/api/v1/intel/analyze-binary",
        files={"file": ("firmware_arm_test.elf", file_obj, "application/octet-stream")}
    )
    assert res.status_code == 200
    analysis = res.json()
    assert analysis["isElf"] is True
    assert "ARM" in analysis["architecture"]
    assert "memcpy" in analysis["dangerousSyscallsFound"]
    assert "sha256" in analysis
