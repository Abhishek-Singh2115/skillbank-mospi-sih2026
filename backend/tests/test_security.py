import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from backend.main import app

def test_google_auth_success(client: TestClient):
    with patch("backend.routes.auth.id_token.verify_oauth2_token") as mock_verify:
        mock_verify.return_value = {
            "sub": "1234567890",
            "email": "test@mospi.gov.in",
            "name": "Test User",
            "picture": "https://example.com/pic.jpg",
            "hd": "mospi.gov.in"
        }
        
        response = client.post(
            "/api/auth/google",
            json={"credential": "mocked-google-token"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["user"]["email"] == "test@mospi.gov.in"
        
        # Test protected endpoint
        token = data["token"]
        auth_response = client.get(
            "/api/users/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert auth_response.status_code == 200
        assert auth_response.json()["email"] == "test@mospi.gov.in"

def test_missing_auth(client: TestClient):
    response = client.get("/api/users/me")
    assert response.status_code == 401

def test_invalid_auth(client: TestClient):
    response = client.get(
        "/api/users/me",
        headers={"Authorization": "Bearer invalid.token.here"}
    )
    assert response.status_code == 401

def test_protected_routes(client: TestClient):
    # Test that endpoints require auth
    endpoints = [
        ("/api/users/me", "PUT", {}),
        ("/api/market/demand?role=Data+Scientist", "GET", None),
        ("/api/quiz/generate-topic", "POST", {"topic": "SQL"}),
    ]
    
    for url, method, data in endpoints:
        if method == "GET":
            response = client.get(url)
        elif method == "PUT":
            response = client.put(url, json=data)
        elif method == "POST":
            response = client.post(url, json=data)
            
        assert response.status_code == 401
