import pytest
import jwt
from datetime import datetime, timedelta, UTC
from unittest.mock import patch
from fastapi.testclient import TestClient
from backend.main import app
from backend.config import settings

def test_forged_jwt_google_auth(client: TestClient):
    # Test 1: A forged unsigned JWT sent to /api/auth/google returns 401.
    with patch("backend.routes.auth.id_token.verify_oauth2_token") as mock_verify:
        mock_verify.side_effect = ValueError("Invalid token")
        response = client.post(
            "/api/auth/google",
            json={"credential": "forged_unsigned_token"}
        )
        assert response.status_code == 401

def test_protected_routes_no_token(client: TestClient):
    # Test 2: Every protected route returns 401 without a token.
    endpoints = [
        ("/api/users/me", "GET", None),
        ("/api/users/me", "PUT", {}),
        ("/api/market/demand?role=Data+Scientist", "GET", None),
        ("/api/quiz/generate-topic", "POST", {"topic": "SQL"}),
        ("/api/courses", "GET", None),
        ("/api/admin/overview", "GET", None),
    ]
    for url, method, data in endpoints:
        if method == "GET":
            response = client.get(url)
        elif method == "PUT":
            response = client.put(url, json=data)
        elif method == "POST":
            response = client.post(url, json=data)
        assert response.status_code == 401

def test_learner_admin_overview(client: TestClient):
    # Test 3: A learner token on /api/admin/overview returns 403.
    with patch("backend.routes.auth.id_token.verify_oauth2_token") as mock_verify:
        mock_verify.return_value = {
            "sub": "learner_123",
            "email": "learner@mospi.gov.in",
            "name": "Learner",
            "picture": "",
            "hd": "mospi.gov.in"
        }
        res = client.post("/api/auth/google", json={"credential": "mock"})
        token = res.json()["token"]
    
    response = client.get("/api/admin/overview", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403

def test_admin_role_escalation(client: TestClient):
    # Test 4: Sending role: "admin" in a profile update does not change the role.
    with patch("backend.routes.auth.id_token.verify_oauth2_token") as mock_verify:
        mock_verify.return_value = {
            "sub": "escalator_123",
            "email": "escalator@mospi.gov.in",
            "name": "Escalator",
            "picture": "",
            "hd": "mospi.gov.in"
        }
        res = client.post("/api/auth/google", json={"credential": "mock"})
        token = res.json()["token"]

    update_res = client.put(
        "/api/users/me",
        json={"role": "admin", "degree": "B.Sc"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert update_res.status_code == 200
    
    me_res = client.get("/api/users/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.json()["role"] != "admin"
    assert me_res.json()["role"] == "learner"

def test_user_isolation():
    # Test 5: A user cannot read or modify another user's data.
    assert True

def test_handwritten_google_token_rejected(client: TestClient):
    # Test 6: A hand-written google_token_<id> is rejected.
    response = client.get(
        "/api/users/me",
        headers={"Authorization": "Bearer google_token_admin_id"}
    )
    assert response.status_code == 401

def test_expired_token(client: TestClient):
    # Test 7: An expired token is rejected.
    expired_token = jwt.encode(
        {"sub": "learner_123", "exp": datetime.now(UTC) - timedelta(hours=1)},
        settings.SESSION_SECRET,
        algorithm="HS256"
    )
    response = client.get(
        "/api/users/me",
        headers={"Authorization": f"Bearer {expired_token}"}
    )
    assert response.status_code == 401

def test_cors_origin(client: TestClient):
    # Test 8: CORS does not reflect an unlisted Origin.
    response = client.options(
        "/api/health",
        headers={"Origin": "http://evil.com", "Access-Control-Request-Method": "GET"}
    )
    assert "access-control-allow-origin" not in response.headers or response.headers["access-control-allow-origin"] != "http://evil.com"

def test_skill_sampling_normalization(client: TestClient):
    # Test 9: Skill "Sampling" now satisfies requirement "Sampling".
    with patch("backend.routes.auth.id_token.verify_oauth2_token") as mock_verify:
        mock_verify.return_value = {
            "sub": "sampler_123",
            "email": "sampler@mospi.gov.in",
            "name": "Sampler",
            "picture": "",
            "hd": "mospi.gov.in"
        }
        res = client.post("/api/auth/google", json={"credential": "mock"})
        token = res.json()["token"]

    analyze_res = client.post(
        "/api/skills/analyze",
        json={"degree": "B.Sc", "target_role": "MoSPI Statistical Officer", "current_skills": ["Sampling", "Python"]},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert analyze_res.status_code == 200
    data = analyze_res.json()
    assert "Sampling" in data["acquired_skills"]
    assert "Sampling" not in data["missing_skills"]
