from typing import List, Optional, Dict, Any
from fastapi import APIRouter
from pydantic import BaseModel
from app.models.schemas import SBOMComponent

router = APIRouter(prefix="/sbom", tags=["SBOM & VEX"])

SBOM_COMPONENTS_STORE: List[SBOMComponent] = [
    SBOMComponent(
        bomRef="pkg:generic/libble_protocol_core@2.4.1",
        name="libble_protocol_core",
        version="2.4.1",
        type="library",
        purl="pkg:generic/libble_protocol_core@2.4.1",
        cpe="cpe:2.3:a:iot_vendor:libble_protocol_core:2.4.1:*:*:*:*:*:*:*",
        license="Proprietary / Vendor SDK",
        vulnerabilitiesCount=1,
        vexStatus="affected",
        pqcReadiness="NO_CRYPTO"
    ),
    SBOMComponent(
        bomRef="pkg:generic/busybox@1.33.1",
        name="busybox",
        version="1.33.1",
        type="application",
        purl="pkg:generic/busybox@1.33.1",
        cpe="cpe:2.3:a:busybox:busybox:1.33.1:*:*:*:*:*:*:*",
        license="GPL-2.0-only",
        vulnerabilitiesCount=1,
        vexStatus="not_affected",
        pqcReadiness="NO_CRYPTO"
    ),
    SBOMComponent(
        bomRef="pkg:generic/openssl@1.1.1w",
        name="openssl",
        version="1.1.1w",
        type="library",
        purl="pkg:generic/openssl@1.1.1w",
        cpe="cpe:2.3:a:openssl:openssl:1.1.1w:*:*:*:*:*:*:*",
        license="Apache-2.0",
        vulnerabilitiesCount=2,
        vexStatus="affected",
        pqcReadiness="LEGACY_VULNERABLE"
    ),
    SBOMComponent(
        bomRef="pkg:generic/dropbear@2020.81",
        name="dropbear",
        version="2020.81",
        type="application",
        purl="pkg:generic/dropbear@2020.81",
        cpe="cpe:2.3:a:matt_johnston:dropbear_ssh_server:2020.81:*:*:*:*:*:*:*",
        license="MIT",
        vulnerabilitiesCount=0,
        vexStatus="not_affected",
        pqcReadiness="LEGACY_VULNERABLE"
    ),
    SBOMComponent(
        bomRef="pkg:generic/liboqs@0.9.0",
        name="liboqs (Post-Quantum Crypto)",
        version="0.9.0",
        type="library",
        purl="pkg:generic/liboqs@0.9.0",
        cpe="cpe:2.3:a:openquantumsafe:liboqs:0.9.0:*:*:*:*:*:*:*",
        license="MIT",
        vulnerabilitiesCount=0,
        vexStatus="not_affected",
        pqcReadiness="PQC_READY"
    )
]

@router.get("/components", response_model=List[SBOMComponent])
def get_sbom_components():
    return SBOM_COMPONENTS_STORE

@router.get("/cyclonedx-json")
def export_cyclonedx_sbom():
    return {
        "bomFormat": "CycloneDX",
        "specVersion": "1.5",
        "serialNumber": "urn:uuid:3e671687-395b-41f5-a30f-a58921a69b79",
        "version": 1,
        "metadata": {
            "timestamp": "2026-09-01T20:20:00Z",
            "tools": [{"vendor": "SentinelForge", "name": "Autonomous IoT Security Engine", "version": "1.0.0"}],
            "component": {
                "name": "Edge-Shield Gateway GW-800 Firmware",
                "version": "2.4.1",
                "type": "firmware"
            }
        },
        "components": [c.model_dump() for c in SBOM_COMPONENTS_STORE],
        "vulnerabilities": [
            {
                "id": "SF-ZERO-2026-001",
                "source": {"name": "SentinelForge Zero-Day Discovery Engine"},
                "affects": [{"ref": "pkg:generic/libble_protocol_core@2.4.1"}],
                "analysis": {
                    "state": "affected",
                    "justification": None,
                    "response": ["can_not_fix_in_field", "requires_firmware_ota_update"],
                    "detail": "Confirmed reachable stack buffer overflow in BLE advertisement parser via angr symbolic execution."
                }
            }
        ]
    }
