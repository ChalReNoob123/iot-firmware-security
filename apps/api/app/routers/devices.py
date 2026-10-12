import hashlib
import uuid
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, HTTPException
from app.models.schemas import DeviceProfile, AttestationRequest, AttestationRecord

router = APIRouter(prefix="/devices", tags=["Devices"])

# Operational Field Devices and Monitored Hardware Interfaces
DEVICES_STORE: List[DeviceProfile] = [
    DeviceProfile(
        id="dev_edge_gateway_01",
        name="Edge-Shield IoT Gateway GW-800",
        manufacturer="EdgeShield Technologies",
        model="GW-800-ARM",
        architecture="ARM",
        endianness="LITTLE",
        connectionType="WIFI_LAN",
        status="ONLINE",
        firmwareVersion="v2.4.1-build89",
        firmwareHash="e8f9a2b4c6d8e0f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9",
        firmwareSize=17203200,
        lastScannedAt=datetime.now(timezone.utc).isoformat(),
        riskScore=78,
        ssvcHighestPriority="ACT",
        activeAttestation=AttestationRecord(
            id="att_9842_signed",
            testerName="Lead Offensive Security Architect",
            testerEmail="security-lead@sentinelforge.internal",
            organization="SentinelForge CyberOps Lab",
            deviceId="dev_edge_gateway_01",
            deviceIdentifier="MAC: 00:1A:2B:3C:4D:5E",
            authorizationType="OWNER_CERTIFIED",
            timestamp=datetime.now(timezone.utc).isoformat(),
            signatureHash="sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
            ipAddress="192.168.1.104",
            attestationTermsAccepted=True
        )
    ),
    DeviceProfile(
        id="dev_smart_meter_02",
        name="GridSecure Smart Polyphase Energy Meter",
        manufacturer="GridPower Instruments",
        model="GP-M900-MIPS",
        architecture="MIPS",
        endianness="BIG",
        connectionType="USB_SERIAL",
        status="ONLINE",
        firmwareVersion="v1.12.0",
        firmwareHash="a1b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdef",
        firmwareSize=8388608,
        lastScannedAt=None,
        riskScore=35,
        ssvcHighestPriority="ATTEND"
    ),
    DeviceProfile(
        id="dev_medical_infusion_03",
        name="BioPulse Connected Infusion Pump",
        manufacturer="BioPulse Medical",
        model="BP-PUMP-500",
        architecture="ARM",
        endianness="LITTLE",
        connectionType="WEB_BLUETOOTH",
        status="ONLINE",
        firmwareVersion="v3.0.1",
        firmwareHash="9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
        firmwareSize=12582912,
        lastScannedAt=None,
        riskScore=52,
        ssvcHighestPriority="ACT"
    )
]

@router.get("", response_model=List[DeviceProfile])
def list_devices():
    return DEVICES_STORE

@router.get("/{device_id}", response_model=DeviceProfile)
def get_device(device_id: str):
    for dev in DEVICES_STORE:
        if dev.id == device_id:
            return dev
    raise HTTPException(status_code=404, detail="Device not found")

@router.post("/{device_id}/attestation", response_model=AttestationRecord)
def sign_authorization_attestation(device_id: str, req: AttestationRequest):
    if not req.attestationTermsAccepted:
        raise HTTPException(status_code=400, detail="Attestation terms must be accepted to proceed.")
    
    timestamp = datetime.now(timezone.utc).isoformat()
    raw_to_hash = f"{req.testerEmail}:{req.organization}:{device_id}:{timestamp}:{req.authorizationType}"
    sig_hash = f"sha256:{hashlib.sha256(raw_to_hash.encode()).hexdigest()}"
    
    attestation = AttestationRecord(
        id=f"att_{uuid.uuid4().hex[:8]}",
        testerName=req.testerName,
        testerEmail=req.testerEmail,
        organization=req.organization,
        deviceId=device_id,
        deviceIdentifier=f"DEV-{device_id.upper()}",
        authorizationType=req.authorizationType,
        timestamp=timestamp,
        signatureHash=sig_hash,
        ipAddress="127.0.0.1 (Authenticated Session)",
        attestationTermsAccepted=True
    )
    
    for dev in DEVICES_STORE:
        if dev.id == device_id:
            dev.activeAttestation = attestation
            break
            
    return attestation
