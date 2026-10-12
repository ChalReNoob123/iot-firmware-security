from typing import List, Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.models.schemas import ScanSession
from app.services.discovery_pipeline import discovery_pipeline

router = APIRouter(prefix="/scans", tags=["Scans"])

@router.get("", response_model=List[ScanSession])
def list_scans():
    return list(discovery_pipeline.active_scans.values())

@router.get("/{scan_id}", response_model=ScanSession)
def get_scan(scan_id: str):
    return discovery_pipeline.get_scan(scan_id)

@router.post("/trigger", response_model=ScanSession)
def trigger_scan(deviceId: str, deviceName: Optional[str] = "Discovered Device"):
    scan = discovery_pipeline.start_new_scan(deviceId, deviceName)
    return scan
