from typing import Optional
from fastapi import APIRouter
from app.models.schemas import AttackGraphData
from app.services.attack_graph_engine import (
    attack_graph_engine,
    DijkstraPathRequest,
    DijkstraPathResult,
    CypherQueryRequest,
    CypherQueryResult
)

router = APIRouter(prefix="/attack-graph", tags=["Attack Graph & Dijkstra Traversal"])

@router.get("", response_model=AttackGraphData)
def get_attack_graph(scan_id: Optional[str] = None):
    """
    Returns full multi-hop knowledge graph with precomputed default shortest path.
    """
    return attack_graph_engine.get_full_graph_data()

@router.post("/solve-shortest-path", response_model=DijkstraPathResult)
def solve_shortest_path(request: DijkstraPathRequest):
    """
    Computes authentic Dijkstra / BFS / A* shortest attack path with mathematical edge resistance.
    Supports real-time edge severing (virtual patching) to prove path elimination.
    """
    return attack_graph_engine.solve_shortest_path(request)

@router.post("/run-cypher", response_model=CypherQueryResult)
def run_cypher_query(request: CypherQueryRequest):
    """
    Executes Cypher graph query against the knowledge graph model and returns matching paths & nodes.
    """
    return attack_graph_engine.execute_cypher_query(request.query)
