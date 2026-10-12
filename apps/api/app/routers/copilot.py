from fastapi import APIRouter
from app.models.schemas import CopilotQueryRequest, CopilotQueryResponse
from app.services.mcp_gateway import mcp_gateway

router = APIRouter(prefix="/copilot", tags=["Copilot"])

@router.post("/query", response_model=CopilotQueryResponse)
async def query_copilot(req: CopilotQueryRequest):
    res = await mcp_gateway.execute_copilot_prompt(
        prompt=req.prompt,
        scan_id=req.scanId,
        finding_id=req.selectedFindingId
    )
    return res
