import asyncio
import httpx
from datetime import datetime, timedelta
import jwt

SESSION_SECRET = "super_secret_session_key_for_sih_2026_skillbank_app_development"

async def test_enroll():
    token_payload = {
        "sub": "test_officer_123",
        "email": "officer@mospi.gov.in",
        "name": "Test Officer",
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    token = jwt.encode(token_payload, SESSION_SECRET, algorithm="HS256")
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        resp = await client.put("/api/users/me", json={
            "name": "Test Officer",
            "email": "officer@mospi.gov.in",
            "designation": "Statistical Officer",
            "department": "NSSO",
            "job_role": "MoSPI Statistical Officer",
            "current_skills": ["Python"]
        }, headers=headers)
        assert resp.status_code == 200
        
        resp = await client.post("/api/courses/IGOT-STAT-204/enroll", headers=headers)
        print("Enroll status:", resp.status_code)
        print("Enroll response:", resp.json())
        assert resp.status_code == 200
        
        resp = await client.get("/api/users/me", headers=headers)
        profile = resp.json()
        print("Profile enrolled courses:", profile.get("enrolled_courses", []))
        assert "IGOT-STAT-204" in profile.get("enrolled_courses", [])
        print("SUCCESS")
        
if __name__ == "__main__":
    asyncio.run(test_enroll())
