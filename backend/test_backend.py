import asyncio
import io
from pypdf import PdfWriter
from httpx import AsyncClient, ASGITransport
from backend.main import app

def create_sample_pdf_bytes() -> bytes:
    """Generates an in-memory PDF with sample MoSPI statistical syllabus content."""
    writer = PdfWriter()
    page = writer.add_blank_page(width=612, height=792)
    # We can write minimal PDF stream
    buf = io.BytesIO()
    writer.write(buf)
    # If blank page has no text, let's create a text-containing PDF or test with txt
    return buf.getvalue()

async def run_tests():
    print("==================================================")
    print("Starting SkillBank Backend API Verification Suite")
    print("==================================================")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        
        # Authenticate first
        print("\n[Auth] Authenticating to get session token...")
        from unittest.mock import patch
        with patch("backend.routes.auth.id_token.verify_oauth2_token") as mock_verify:
            mock_verify.return_value = {
                "sub": "test_backend_user",
                "email": "test@mospi.gov.in",
                "name": "Test Backend User",
                "picture": "",
                "hd": "mospi.gov.in"
            }
            res_auth = await client.post("/api/auth/google", json={"credential": "mock"})
            assert res_auth.status_code == 200, "Auth failed"
            token = res_auth.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Test 1: Root and Health check
        print("\n[Test 1] Testing GET / and GET /api/health...")
        res_root = await client.get("/")
        assert res_root.status_code == 200, f"Root failed: {res_root.text}"
        print(f"  [OK] Root OK: {res_root.json()['project']} ({res_root.json()['version']})")

        res_health = await client.get("/api/health")
        assert res_health.status_code == 200, f"Health check failed: {res_health.text}"
        print(f"  [OK] Health OK: Database={res_health.json()['database']}, Gemini={res_health.json()['gemini_ai']}")

        # Test 2: Role benchmarks
        print("\n[Test 2] Testing GET /api/skills/roles...")
        res_roles = await client.get("/api/skills/roles", headers=headers)
        assert res_roles.status_code == 200
        roles_data = res_roles.json()
        assert len(roles_data) >= 4
        print(f"  [OK] Roles OK: Found {len(roles_data)} benchmark matrices:")
        for r in roles_data:
            print(f"    - {r['title']} ({len(r['required_skills'])} core skills)")

        # Test 3: iGOT Karmayogi Courses catalog
        print("\n[Test 3] Testing GET /api/courses...")
        res_courses = await client.get("/api/courses", headers=headers)
        assert res_courses.status_code == 200
        courses_data = res_courses.json()
        assert courses_data["total"] > 0
        print(f"  [OK] iGOT Courses OK: {courses_data['total']} courses loaded.")
        print(f"    Sample Course: {courses_data['courses'][0]['title']} ({courses_data['courses'][0]['id']})")

        # Test 4: User Profile Creation & Update
        print("\n[Test 4] Testing POST /api/users/profile...")
        user_payload = {
            "name": "Priya Patel",
            "email": "priya.patel@sih.gov.in",
            "degree": "B.Sc in Statistics & Data Analytics",
            "target_role": "MoSPI Statistical Data Analyst",
            "current_skills": ["Python", "SQL", "Tableau / PowerBI"],
            "completed_modules": 4
        }
        res_user = await client.put("/api/users/me", json=user_payload, headers=headers)
        assert res_user.status_code == 200, f"User creation failed: {res_user.text}"
        user_data = res_user.json()
        user_id = user_data["_id"]
        print(f"  [OK] User Profile Created OK: ID={user_id}, Name={user_data['name']}")
        print(f"    Computed Initial Readiness Score: {user_data['readiness_score']}%")

        # Test 5: Retrieve User Profile
        print("\n[Test 5] Testing GET /api/users/{user_id}...")
        res_get_user = await client.get(f"/api/users/me", headers=headers)
        assert res_get_user.status_code == 200
        assert res_get_user.json()["email"] == "test@mospi.gov.in"
        print(f"  [OK] Retrieve User OK: Verified {res_get_user.json()['name']}")

        # Test 6: Skill Gap Analyzer Endpoint
        print("\n[Test 6] Testing POST /api/skills/analyze...")
        skill_payload = {
            "user_id": user_id,
            "target_role": "MoSPI Statistical Data Analyst",
            "current_skills": ["Python", "SQL", "Git"],
            "degree": "B.Sc in Statistics & Data Analytics"
        }
        res_skill = await client.post("/api/skills/analyze", json=skill_payload, headers=headers)
        assert res_skill.status_code == 200, f"Skill analysis failed: {res_skill.text}"
        analysis_data = res_skill.json()
        print(f"  [OK] Skill Analysis OK:")
        print(f"    - Target Role: {analysis_data['target_role']}")
        print(f"    - Readiness Score: {analysis_data['readiness_score']}%")
        print(f"    - Acquired Skills ({len(analysis_data['acquired_skills'])}): {analysis_data['acquired_skills']}")
        print(f"    - Competency Gaps ({len(analysis_data['missing_skills'])}): {analysis_data['missing_skills']}")
        print(f"    - Matched iGOT Courses: {len(analysis_data['recommended_courses'])} courses found:")
        for c in analysis_data['recommended_courses'][:2]:
            print(f"      * [{c['id']}] {c['title']} ({c['duration_hours']}h)")
        print(f"    - Roadmap Milestones: {len(analysis_data['roadmap_steps'])} steps generated.")

        # Test 7: AI Quiz Generator with text/PDF upload
        print("\n[Test 7] Testing POST /api/quiz/generate...")
        sample_text_document = (
            "Ministry of Statistics and Programme Implementation (MoSPI) National Curricula 2026.\n"
            "Section 1: Multi-Stage Stratified Sampling in NSSO Rounds.\n"
            "Stratified random sampling divides diverse demographic populations into distinct socio-economic sub-groups.\n"
            "Section 2: Concurrent Rendering and Reactive Interfaces in Modern Portals.\n"
            "React 18 Concurrent Rendering enables UI task prioritization to eliminate blocking main thread execution.\n"
            "Section 3: Container Orchestration and Cloud Deployment.\n"
            "Docker multi-stage builds create reproducible immutable containers compliant with Meghraj standards.\n"
        ).encode("utf-8")

        files = {
            "file": ("MoSPI_National_Statistical_Framework_2026.txt", sample_text_document, "text/plain")
        }
        from backend.services.gemini_service import FALLBACK_MCQS
        with patch("backend.services.gemini_service.GeminiService.generate_mcqs_from_text") as mock_gen_mcqs:
            mock_gen_mcqs.return_value = FALLBACK_MCQS
            res_quiz = await client.post("/api/quiz/generate", files=files, headers=headers)
        assert res_quiz.status_code == 200, f"Quiz generation failed: {res_quiz.text}"
        quiz_data = res_quiz.json()
        print(f"  [OK] AI Quiz Generator OK:")
        print(f"    - Document: {quiz_data['document_name']}")
        print(f"    - Engine: {quiz_data['source_model']}")
        print(f"    - Generated Questions Count: {quiz_data['questions_count']}")
        assert len(quiz_data['questions']) == 5
        sample_q = quiz_data['questions'][0]
        print(f"    - Sample Question 1: \"{sample_q['question']}\"")
        print(f"      Options: {sample_q['options']}")
        print(f"      Correct Answer ({sample_q['correct_index']}): \"{sample_q['correct_answer']}\"")
        print(f"      Pedagogical Rationale: \"{sample_q['explanation']}\"")

        # Test 8: Job Market Demand API
        print("\n[Test 8] Testing GET /api/market/demand?role=Full%20Stack%20Web%20Developer...")
        res_market = await client.get("/api/market/demand", params={"role": "Full Stack Web Developer"}, headers=headers)
        assert res_market.status_code == 200, f"Market demand failed: {res_market.text}"
        market_data = res_market.json()
        print(f"  [OK] Market Demand OK:")
        print(f"    - Role: {market_data['role']}")
        print(f"    - Demand Score: {market_data['demand_score']} ({market_data['demand_percentage']}%)")
        print(f"    - Trending Skills: {market_data['trending_skills']}")
        print(f"    - Sample Openings: {market_data['job_openings_sample']}")

        # Test 9: Deep Topic Quiz Generation
        print("\n[Test 9] Testing POST /api/quiz/generate-topic with 'Docker'...")
        res_topic_quiz = await client.post("/api/quiz/generate-topic", json={"topic": "Docker"}, headers=headers)
        assert res_topic_quiz.status_code == 200, f"Topic quiz failed: {res_topic_quiz.text}"
        topic_quiz_data = res_topic_quiz.json()
        print(f"  [OK] Topic Quiz OK:")
        print(f"    - Topic: {topic_quiz_data['topic']}")
        print(f"    - Questions Count: {topic_quiz_data['questions_count']}")
        assert len(topic_quiz_data['questions']) == 5
        print(f"    - Sample Q: \"{topic_quiz_data['questions'][0]['question']}\"")

        # Test 10: Resume / CV Parsing
        print("\n[Test 10] Testing POST /api/skills/extract-resume...")
        sample_resume_content = (
            "Meet Patidar - Full Stack Software Developer\n"
            "Technical Skills: React, Node.js, TypeScript, Python, FastAPI, Docker, PostgreSQL, Git\n"
            "Experience: Built scalable web portals and microservices with responsive UI.\n"
        ).encode("utf-8")
        resume_files = {
            "file": ("meet_patidar_resume.txt", sample_resume_content, "text/plain")
        }
        res_resume = await client.post("/api/skills/extract-resume", files=resume_files, headers=headers)
        assert res_resume.status_code == 200, f"Resume extraction failed: {res_resume.text}"
        resume_data = res_resume.json()
        print(f"  [OK] Resume Extraction OK:")
        print(f"    - File: {resume_data['filename']}")
        print(f"    - Extracted Skills ({resume_data['extracted_count']}): {resume_data['skills']}")
        assert len(resume_data['skills']) > 0

    print("\n==================================================")
    print("ALL 10 BACKEND API TESTS PASSED SUCCESSFULLY! [OK]")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(run_tests())

