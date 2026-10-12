from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_full_attack_graph_endpoint():
    res = client.get("/api/v1/attack-graph")
    assert res.status_code == 200
    data = res.json()
    assert "nodes" in data
    assert "edges" in data
    assert len(data["nodes"]) >= 5
    assert len(data["edges"]) >= 4
    assert len(data["shortestPathToRootCompromise"]) > 0

def test_solve_shortest_path_dijkstra():
    res = client.post(
        "/api/v1/attack-graph/solve-shortest-path",
        json={
            "sourceNodeId": "node_entry_ble",
            "targetNodeId": "node_asset_root_shell",
            "algorithm": "DIJKSTRA",
            "severedEdges": []
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["pathFound"] is True
    assert data["hopCount"] == 4
    assert len(data["nodePath"]) == 5
    assert data["nodePath"][0] == "node_entry_ble"
    assert data["nodePath"][-1] == "node_asset_root_shell"
    assert data["totalResistanceCost"] > 0
    assert len(data["hops"]) == 4

def test_solve_shortest_path_with_severed_edge():
    # Sever the primary exploit edge (virtual patch)
    res = client.post(
        "/api/v1/attack-graph/solve-shortest-path",
        json={
            "sourceNodeId": "node_entry_ble",
            "targetNodeId": "node_asset_root_shell",
            "algorithm": "DIJKSTRA",
            "severedEdges": ["e_ble_overflow"]
        }
    )
    assert res.status_code == 200
    data = res.json()
    # BLE path is severed, no path to root shell from BLE
    assert data["pathFound"] is False

def test_run_cypher_endpoint():
    res = client.post(
        "/api/v1/attack-graph/run-cypher",
        json={
            "query": "MATCH path = shortestPath((s:Service)-[*..6]->(target:Peripheral)) RETURN path"
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["matchedPathsCount"] > 0
    assert len(data["records"]) > 0
    assert len(data["highlightedPathNodeIds"]) > 0

def test_solve_shortest_path_http_to_bmc():
    res = client.post(
        "/api/v1/attack-graph/solve-shortest-path",
        json={
            "sourceNodeId": "node_entry_http",
            "targetNodeId": "node_asset_bmc_flash",
            "algorithm": "DIJKSTRA",
            "severedEdges": []
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["pathFound"] is True
    assert data["nodePath"][0] == "node_entry_http"
    assert data["nodePath"][-1] == "node_asset_bmc_flash"
    assert "node_bus_spi" in data["nodePath"]

def test_solve_shortest_path_mqtt():
    res = client.post(
        "/api/v1/attack-graph/solve-shortest-path",
        json={
            "sourceNodeId": "node_entry_mqtt",
            "targetNodeId": "node_asset_root_shell",
            "algorithm": "A_STAR",
            "severedEdges": []
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["pathFound"] is True
    assert data["nodePath"][0] == "node_entry_mqtt"
    assert data["nodePath"][-1] == "node_asset_root_shell"
    assert len(data["rankedPaths"]) >= 3

