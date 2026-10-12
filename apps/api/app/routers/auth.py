from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["Auth & RBAC"])

class LoginRequest(BaseModel):
    email: str
    password: str
    totpCode: Optional[str] = None

class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    role: str # 'OWNER' | 'ADMIN' | 'ANALYST' | 'VIEWER' | 'AUDITOR'
    organization: str
    mfaEnabled: bool
    lastLogin: str

class AuthTokenResponse(BaseModel):
    accessToken: str
    tokenType: str = "Bearer"
    expiresInSec: int = 86400
    user: UserProfile

class AuditLogEntry(BaseModel):
    id: str
    timestamp: str
    actorEmail: str
    action: str
    resource: str
    ipAddress: str
    status: str

AUDIT_LOG_STORE: List[AuditLogEntry] = [
    AuditLogEntry(
        id="aud_1001",
        timestamp=datetime.now(timezone.utc).isoformat(),
        actorEmail="security-lead@sentinelforge.internal",
        action="ATTESTATION_SIGNED",
        resource="DEV:dev_edge_gateway_01",
        ipAddress="192.168.1.104",
        status="SUCCESS"
    ),
    AuditLogEntry(
        id="aud_1002",
        timestamp=datetime.now(timezone.utc).isoformat(),
        actorEmail="security-lead@sentinelforge.internal",
        action="AUTONOMOUS_FUZZING_STARTED",
        resource="Harness:AFL++_ARMv7",
        ipAddress="192.168.1.104",
        status="SUCCESS"
    ),
    AuditLogEntry(
        id="aud_1003",
        timestamp=datetime.now(timezone.utc).isoformat(),
        actorEmail="security-lead@sentinelforge.internal",
        action="VEX_STATEMENT_PUBLISHED",
        resource="libble_protocol_core@2.4.1",
        ipAddress="192.168.1.104",
        status="SUCCESS"
    )
]

@router.post("/login", response_model=AuthTokenResponse)
def login(req: LoginRequest):
    return AuthTokenResponse(
        accessToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sentinelforge_mock_token",
        user=UserProfile(
            id="usr_lead_architect_01",
            name="Lead Offensive Security Architect",
            email=req.email or "security-lead@sentinelforge.internal",
            role="OWNER",
            organization="SentinelForge CyberOps Lab",
            mfaEnabled=True,
            lastLogin=datetime.now(timezone.utc).isoformat()
        )
    )

@router.get("/me", response_model=UserProfile)
def get_current_user():
    return UserProfile(
        id="usr_lead_architect_01",
        name="Lead Offensive Security Architect",
        email="security-lead@sentinelforge.internal",
        role="OWNER",
        organization="SentinelForge CyberOps Lab",
        mfaEnabled=True,
        lastLogin=datetime.now(timezone.utc).isoformat()
    )

@router.get("/audit-logs", response_model=List[AuditLogEntry])
def get_audit_logs():
    return AUDIT_LOG_STORE
