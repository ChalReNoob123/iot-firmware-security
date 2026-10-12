from typing import Optional, List
from fastapi import APIRouter, Query, UploadFile, File
from app.services.live_intel import (
    fetch_cisa_kev,
    fetch_live_epss,
    get_real_host_telemetry,
    analyze_binary_stream
)

router = APIRouter(prefix="/intel", tags=["Real Cyber Intelligence & Host Execution Telemetry"])

@router.get("/cisa-kev")
def get_cisa_kev_feed(
    limit: int = Query(50, ge=1, le=500),
    search: Optional[str] = Query(None, description="Search term for CVE, vendor, or product"),
    vendor: Optional[str] = Query(None, description="Filter by vendor name (e.g. Cisco, Fortinet, Apple)")
):
    """
    Returns authentic live data from the official CISA Known Exploited Vulnerabilities catalog.
    No generated or placeholder data.
    """
    return fetch_cisa_kev(limit=limit, search=search, vendor=vendor)

@router.get("/epss")
def get_epss_scores(cves: str = Query(..., description="Comma-separated CVE identifiers")):
    """
    Returns authentic FIRST.org EPSS scores for requested CVEs.
    """
    cve_list = [c.strip() for c in cves.split(",") if c.strip()]
    return fetch_live_epss(cve_list)

@router.get("/host-telemetry")
def get_host_telemetry():
    """
    Returns real operating system, CPU, memory, architecture, and network interface telemetry from the execution host.
    """
    return get_real_host_telemetry()

@router.post("/analyze-binary")
async def analyze_binary(file: UploadFile = File(...)):
    """
    Performs real-time binary parsing, Shannon Entropy calculation, ELF header extraction,
    and cryptographic hashing on uploaded firmware binaries.
    """
    content = await file.read()
    return analyze_binary_stream(content, file.filename or "unknown_binary")
