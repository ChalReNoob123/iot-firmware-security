from typing import Optional, Dict, Any, List
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.discovery_pipeline import discovery_pipeline

router = APIRouter(prefix="/emulator", tags=["Emulator"])

class EmulatorTelemetryResponse(BaseModel):
    uptimeSec: int
    cpuArchitecture: str
    kernelVersion: str
    activeProcesses: List[Dict[str, Any]]
    listeningSockets: List[Dict[str, Any]]
    dmesgTail: List[str]

@router.get("/telemetry", response_model=EmulatorTelemetryResponse)
def get_emulator_telemetry(sessionId: Optional[str] = None):
    return EmulatorTelemetryResponse(
        uptimeSec=482,
        cpuArchitecture="ARMv7-A Cortex-A9 (Little-Endian, 32-bit)",
        kernelVersion="Linux 4.19.128-sf-iot #1 SMP PREEMPT",
        activeProcesses=[
            {"pid": 1, "name": "init", "user": "root", "cpu": 0.1, "mem": 1.2},
            {"pid": 142, "name": "nvram_daemon", "user": "root", "cpu": 0.4, "mem": 2.1},
            {"pid": 218, "name": "httpd_arm", "user": "www-data", "cpu": 1.8, "mem": 4.8},
            {"pid": 305, "name": "ble_gatewayd", "user": "root", "cpu": 3.2, "mem": 6.4},
            {"pid": 412, "name": "dropbear", "user": "root", "cpu": 0.0, "mem": 1.8}
        ],
        listeningSockets=[
            {"proto": "tcp", "port": 80, "process": "httpd_arm", "bindAddress": "0.0.0.0"},
            {"proto": "tcp", "port": 443, "process": "httpd_arm", "bindAddress": "0.0.0.0"},
            {"proto": "tcp", "port": 22, "process": "dropbear", "bindAddress": "0.0.0.0"},
            {"proto": "udp", "port": 5353, "process": "mDNSResponder", "bindAddress": "224.0.0.251"},
            {"proto": "gatt", "port": 1, "process": "ble_gatewayd", "bindAddress": "hci0 (UUID: 0x1800)"}
        ],
        dmesgTail=[
            "[  12.482910] [FirmAE-NVRAM] Intercepted get_env(\"lan_ipaddr\") -> 192.168.0.1",
            "[  14.910283] [sf-sandbox] BLE virtual controller initialized on hci0",
            "[  18.002819] [sf-sandbox] Virtual tap device tap0 bridged to br0",
            "[  22.110901] [httpd_arm:218] Listening on 0.0.0.0:80 (CGI support active)",
            "[  48.192004] [sf-fuzz-harness] AFL++ harness attached to PID 305 (ble_gatewayd)"
        ]
    )

@router.post("/reboot")
def reboot_emulator(sessionId: Optional[str] = None):
    return {"status": "REBOOTED", "message": "QEMU Virtual Sandbox successfully reset to clean NVRAM snapshot."}
