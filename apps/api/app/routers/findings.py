from typing import List, Optional
from fastapi import APIRouter, HTTPException
from app.models.schemas import Finding, SymbolicTaintResult, EmulatorCrashSnapshot
from app.services.discovery_pipeline import discovery_pipeline

router = APIRouter(prefix="/findings", tags=["Findings"])

@router.get("", response_model=List[Finding])
def list_findings(scan_id: Optional[str] = None):
    scan = discovery_pipeline.get_scan(scan_id)
    return scan.findings

@router.get("/{finding_id}", response_model=Finding)
def get_finding(finding_id: str, scan_id: Optional[str] = None):
    scan = discovery_pipeline.get_scan(scan_id)
    for f in scan.findings:
        if f.id == finding_id:
            return f
    raise HTTPException(status_code=404, detail=f"Finding {finding_id} not found")

@router.get("/{finding_id}/taint-trace", response_model=SymbolicTaintResult)
def get_taint_trace(finding_id: str, scan_id: Optional[str] = None):
    scan = discovery_pipeline.get_scan(scan_id)
    for f in scan.findings:
        if f.id == finding_id and f.symbolicTrace:
            return f.symbolicTrace
    raise HTTPException(status_code=404, detail="Symbolic taint trace not found for this finding")

@router.get("/{finding_id}/crash-snapshot", response_model=EmulatorCrashSnapshot)
def get_crash_snapshot(finding_id: str, scan_id: Optional[str] = None):
    scan = discovery_pipeline.get_scan(scan_id)
    for f in scan.findings:
        if f.id == finding_id and f.crashSnapshot:
            return f.crashSnapshot
    raise HTTPException(status_code=404, detail="Crash snapshot not found for this finding")
