import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import (
    devices, scans, findings, attack_graph, emulator,
    copilot, sbom_vex, compliance, auth, firmware, live_intel
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Autonomous IoT Firmware Security & Zero-Day Vulnerability Discovery API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "X-Requested-With"],
)


# Mount Routers
api_v1 = "/api/v1"
app.include_router(live_intel.router, prefix=api_v1)
app.include_router(auth.router, prefix=api_v1)
app.include_router(firmware.router, prefix=api_v1)
app.include_router(devices.router, prefix=api_v1)
app.include_router(scans.router, prefix=api_v1)
app.include_router(findings.router, prefix=api_v1)
app.include_router(attack_graph.router, prefix=api_v1)
app.include_router(emulator.router, prefix=api_v1)
app.include_router(copilot.router, prefix=api_v1)
app.include_router(sbom_vex.router, prefix=api_v1)
app.include_router(compliance.router, prefix=api_v1)

@app.get("/")
def root():
    return {
        "service": "SentinelForge API Core",
        "status": "ONLINE",
        "version": "1.0.0",
        "docs": "/docs"
    }

# Real-time WebSocket for Live Terminal and Live Pipeline Telemetry
@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Emit live heartbeats, coverage counter ticks, and simulated fuzzing stats
            payload = {
                "type": "FUZZ_TELEMETRY_UPDATE",
                "timestamp": asyncio.get_event_loop().time(),
                "execSpeed": 1840 + int(asyncio.get_event_loop().time() % 20 * 12),
                "totalExecs": 2481902 + int(asyncio.get_event_loop().time() * 1840),
                "uniquePaths": 738,
                "activeCrashes": 4
            }
            await websocket.send_text(json.dumps(payload))
            await asyncio.sleep(1.0)
    except WebSocketDisconnect:
        pass
