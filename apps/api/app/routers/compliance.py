from typing import Dict, Any, List
from fastapi import APIRouter
from app.models.schemas import ComplianceScorecard
from app.services.discovery_pipeline import discovery_pipeline

router = APIRouter(prefix="/compliance", tags=["Compliance"])

@router.get("/scorecard", response_model=ComplianceScorecard)
def get_compliance_scorecard():
    scan = discovery_pipeline.get_scan("scan_gw9842_arm_prod")
    return scan.compliance

@router.get("/frameworks")
def get_framework_breakdown() -> Dict[str, Any]:
    return {
        "mitreEmb3d": {
            "title": "MITRE EMB3D Embedded Threat Model",
            "coveragePercent": 82,
            "mappedThreats": [
                {"id": "EMB3D-T0014", "name": "Unchecked Buffer in Radio Protocol Parser", "status": "FAIL", "severity": "CRITICAL"},
                {"id": "EMB3D-T0022", "name": "Privilege Escalation via SUID Binary", "status": "FAIL", "severity": "HIGH"},
                {"id": "EMB3D-T0008", "name": "Hardcoded Cryptographic Secrets", "status": "FAIL", "severity": "HIGH"},
                {"id": "EMB3D-T0035", "name": "Inadequate Cryptographic Algorithm (PQC Gap)", "status": "WARN", "severity": "MEDIUM"},
                {"id": "EMB3D-T0001", "name": "Secure Boot Integrity Verification", "status": "PASS", "severity": "LOW"}
            ]
        },
        "owaspFstm": {
            "title": "OWASP Firmware Security Testing Methodology (FSTM)",
            "coveragePercent": 78,
            "stages": [
                {"stage": "Stage 1: Information Gathering", "status": "PASS"},
                {"stage": "Stage 2: Firmware Acquisition", "status": "PASS"},
                {"stage": "Stage 3: Firmware Extraction", "status": "PASS"},
                {"stage": "Stage 4: Static Analysis & Secret Scan", "status": "FAIL (Secrets Found)"},
                {"stage": "Stage 5: Dynamic Emulation & Fuzzing", "status": "FAIL (Crash Found)"},
                {"stage": "Stage 6: Post-Quantum Cryptography Audit", "status": "WARN (Legacy RSA/ECC)"}
            ]
        },
        "nistIr8259A": {
            "title": "NIST IR 8259A / 8425 IoT Baseline",
            "coveragePercent": 68,
            "clauses": [
                {"clause": "4.1.1 Device Identification", "status": "COMPLIANT"},
                {"clause": "4.1.2 Logical Interface Protection", "status": "NON_COMPLIANT (BLE RCE)"},
                {"clause": "4.1.3 Software/Firmware Updates", "status": "COMPLIANT"},
                {"clause": "4.1.4 Cybersecurity State Awareness", "status": "COMPLIANT"}
            ]
        },
        "etsiEn303645": {
            "title": "ETSI EN 303 645 Consumer IoT Security",
            "coveragePercent": 61,
            "provisions": [
                {"provision": "5.1-1 No Universal Default Passwords", "status": "FAIL"},
                {"provision": "5.2-1 Implement Vulnerability Reporting", "status": "PASS"},
                {"provision": "5.3-1 Keep Software Updated", "status": "PASS"},
                {"provision": "5.4-1 Securely Store Sensitive Data", "status": "FAIL"}
            ]
        }
    }
