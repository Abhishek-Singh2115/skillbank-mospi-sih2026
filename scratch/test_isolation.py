import asyncio
import json
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def run_test():
    print("--- Starting End-to-End Data Isolation Test ---")
    
    # 1. Login Account 1
    print("\n[Step 1] Logging in as Account 1: DEV_MOCK_alice@example.com")
    res1 = client.post("/api/auth/google", json={"credential": "DEV_MOCK_alice@example.com"})
    assert res1.status_code == 200
    alice_data = res1.json()
    alice_token = alice_data["token"]
    print(f"Alice Initial Data: Target Role='{alice_data['user'].get('target_role')}', Skills={alice_data['user'].get('current_skills')}")

    # 2. Run analysis for Account 1
    print("\n[Step 2] Running Skill Analyzer for Account 1 (Alice)")
    headers1 = {"Authorization": f"Bearer {alice_token}"}
    analyze_payload = {
        "target_role": "Data Scientist",
        "current_skills": ["Python", "SQL"],
        "degree": "Bachelors"
    }
    analyze_res1 = client.post("/api/skills/analyze", json=analyze_payload, headers=headers1)
    assert analyze_res1.status_code == 200
    print(f"Analysis Complete for Alice. Missing skills identified.")

    # 3. Verify Account 1 saved data by logging in again (simulating dashboard load)
    print("\n[Step 3] Re-authenticating Alice to verify data persistence")
    res1_re = client.post("/api/auth/google", json={"credential": "DEV_MOCK_alice@example.com"})
    alice_saved = res1_re.json()["user"]
    print(f"Alice Saved Data: Target Role='{alice_saved.get('target_role')}', Skills={alice_saved.get('current_skills')}")

    # 4. Login Account 2
    print("\n[Step 4] Logging in as Account 2 (Bob): DEV_MOCK_bob@example.com")
    res2 = client.post("/api/auth/google", json={"credential": "DEV_MOCK_bob@example.com"})
    assert res2.status_code == 200
    bob_data = res2.json()
    print(f"Bob Initial Data (Should be empty, isolated from Alice): Target Role='{bob_data['user'].get('target_role')}', Skills={bob_data['user'].get('current_skills')}")

    # 5. Verify Bob is clean
    if not bob_data['user'].get('target_role') and not bob_data['user'].get('current_skills'):
        print("\n✅ SUCCESS: Bob's data is completely isolated from Alice's data. Bob starts with a clean slate.")
    else:
        print("\n❌ FAILURE: Bob's data was contaminated by Alice's data.")

if __name__ == "__main__":
    # TestClient must be used inside its context manager so that lifespan events (like DB connect) run
    with client:
        run_test()
