import pytest
from fastapi.testclient import TestClient
from backend.main import app

def test_smoke(client: TestClient):
    res = client.get("/api/health")
    assert res.status_code == 200
