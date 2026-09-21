# EXECUTIVE SUMMARY
- **What works**: The React/FastAPI architecture is cleanly separated. The Gemini integration for generating MCQs and extracting skills from resumes works when a valid API key is present. The skill gap analyzer correctly compares known skills against predefined role benchmarks.
- **What is fake**: The iGOT Karmayogi integration is completely simulated using a hardcoded list of courses in `igot_service.py`. The "Semantic AI" competency mapping is actually deterministic string matching. The Admin dashboard uses static mock data when the backend is unavailable.
- **What is dangerous**: The authentication system is highly insecure. `backend/routes/auth.py` contains a fallback decoder (`_decode_jwt_payload_fallback`) that bypasses cryptographic signature verification, and `dependencies.py` blindly trusts any token starting with `google_token_`. This allows trivial identity spoofing and privilege escalation to the 'admin' role.
- **What is missing**: Real semantic matching for competencies, integration with the actual iGOT API, and 28 of the 33 named MoSPI competencies from the Problem Statement.

## 1. Coverage Statement
- **Fully read via grep extraction & analysis**: `config.py`, `database.py`, `dependencies.py`, `main.py`, `test_backend.py`, `models/*`, `routes/*`, `services/*`, `App.jsx`, `main.jsx`, `Dashboard.jsx`, `Header.jsx`, `LandingPage.jsx`, `SkillGapAnalyzer.jsx`, `AdminDashboard.jsx`.
- **Skimmed**: `index-legacy.html` (monolithic static React app from a prior iteration, essentially dead code), `scratch/` (temporary output/audit scripts).

## 2. Architecture
- **Frontend**: React 18 + Vite (`src/App.jsx`, `src/main.jsx`). Routes are protected by a custom `<ProtectedRoute>` wrapper.
- **API**: FastAPI (`backend/main.py`) exposing REST endpoints under `/api`.
- **Services**: Business logic separated into `gemini_service.py`, `igot_service.py`, `market_service.py`, and `skill_service.py`.
- **Database**: In-memory MongoDB mock (`backend/database.py`) using a fake `AsyncIOMotorClient` structure.

## 3. Security & Authentication
- **Authentication Flow**: The frontend sends a Google OAuth JWT to `/api/auth/google`.
- **Token Format**: The backend issues a custom token formatted as `google_token_{user_id}` (`auth.py:147`).
- **Verification Logic**: `dependencies.py` extracts the `user_id` by stripping the `google_token_` prefix without verifying a cryptographic signature (`dependencies.py:58`).
- **Role Handling**: Roles are stored as `"learner"` or `"admin"`. The `require_admin` dependency checks if `user.get("role") == "admin"`.
- **Vulnerabilities**: 
  - **P0 DANGER**: `auth.py` implements `_decode_jwt_payload_fallback()` which decodes the base64 JWT payload without verifying the signature if the Google certs fail. A malicious user can craft a forged JWT to log in as any user.
  - **P0 DANGER**: Because `dependencies.py` only checks for the `google_token_` prefix, any user can send `Authorization: Bearer google_token_admin_id` to bypass authentication and execute privileged actions.

## 4. Correctness Bugs
- **Silent Fallbacks**: `AdminDashboard.jsx:10` implements a `MOCK_FALLBACK` object. If the `/admin/overview` endpoint fails, it silently falls back to this hardcoded data, hiding system failures from the user.
- **Undefined Names (pyflakes)**: `backend/routes/skills.py` contains multiple undefined name errors: `logger` (lines 114, 123, 141) and `re` (line 116). This will cause 500 Internal Server Errors when that route is hit.
- **Dependency Issues**: `pip` and `pyflakes` failed to execute directly via CLI due to missing PATH configurations in the Windows environment, though `python -m venv` commands functioned correctly.

## 5. AI/Gemini
- **Features using LLM**:
  1. `generate_mcqs_from_text` & `generate_mcqs_for_topic` (`quiz.py` & `gemini_service.py`).
  2. `extract_skills_from_resume_text` (`skills.py` & `gemini_service.py`).
  3. `generate_learning_roadmap` (`skills.py` & `gemini_service.py`).
- **Deterministic/Fallback behavior**: When `GEMINI_API_KEY` is absent or the API fails, the system safely falls back to hardcoded mock data (e.g., predefined quiz questions about Stratified Multi-Stage sampling, static skills like "Python" and "Data Governance").

## 6. iGOT / NSSTA-TPAC
- **Status**: MOCK/SIMULATED.
- **Details**: The UI claims to be "Connected with DigiLocker and National Career Service (NCS)" (`Dashboard.jsx:211`). However, `backend/services/igot_service.py` contains a hardcoded list `DEFAULT_IGOT_COURSES` (e.g., `IGOT-STAT-204`, `NSSTA-TPAC-011`). There is zero actual API communication with iGOT Karmayogi or NSSTA servers.

## 7. Requirements Matrix
| Requirement | Status | Evidence file:line | Gap | Suggested Change |
|---|---|---|---|---|
| A. Competency profile (designation, exp, etc.) | PARTIAL | `user.py:18` | Profile model has fields, but UI wiring for work experience/prior training is incomplete. | Wire up official profile fields in frontend onboarding. |
| B. 33 predefined competencies | PARTIAL | `skill_service.py:16` | Found "Survey Design", "Sampling", "National Accounts", "Python". Missing 28+ specific competencies. | Expand `ROLE_BENCHMARKS` to include the full 33-skill framework. |
| C. AI mapping (ML, NLP, semantic search) | STUB | `skill_service.py:188` | Uses deterministic regex/string matching (`_match_role`), not true semantic mapping. | Implement a vector database (e.g., Chroma/Pinecone) for semantic similarity. |
| D. Personalized recommendations (iGOT & NSSTA) | MOCK | `igot_service.py:6` | Hardcoded array of 8 courses. Does not dynamically evaluate learning history. | Implement real recommendation engine based on user's past completions. |
| E. iGOT API integration | ABSENT | `igot_service.py` | No external HTTP calls are made to iGOT servers. | Integrate real iGOT Karmayogi REST APIs. |
| F. Virtual assistant, interactive modules | ABSENT | N/A | No chatbot or virtual assistant present. | Integrate a Gemini-powered chat interface. |
| G. Intelligent Assessment Engine (MCQs) | REAL | `gemini_service.py:104` | Successfully uses Gemini to generate JSON-formatted Bloom's taxonomy MCQs. | None (Functioning as intended). |
| H. Employee and Admin dashboards | PARTIAL | `AdminDashboard.jsx:114` | Admin dashboard falls back to static mock data on API failure. | Remove silent mock fallbacks; display real error states. |
| I. Secure, scalable, RBAC, SSO | STUB | `auth.py:43` | Custom token format allows trivial spoofing. | Use standard JWT libraries (e.g., `PyJWT`) to sign and verify tokens cryptographically. |

**Coverage count of 33 named competencies**: ~5/33 found explicitly in the codebase (Survey Design, Sampling, National Accounts, Python, Cybersecurity).

## 8. Code Quality & Maintainability
- **Dead Code**: `index-legacy.html` (290KB) is unused and should be removed to reduce repository bloat.
- **Silent Failures**: The frontend is littered with `try/catch` blocks that silently fallback to mock data (e.g., `Dashboard.jsx`, `AdminDashboard.jsx`), making debugging production issues difficult.

## 9. Unverified
- The actual API contract, authentication method, and endpoint structures for the real iGOT Karmayogi API.
- Integration requirements for DigiLocker and National Career Service (NCS).

## 10. Prioritized Fix List
1. **P0 (Security)**: Remove `_decode_jwt_payload_fallback` from `backend/routes/auth.py`. Update `backend/dependencies.py` to use `PyJWT` for cryptographically verifying tokens instead of relying on the `google_token_` prefix.
2. **P1 (Correctness)**: Remove `MOCK_FALLBACK` from `src/components/AdminDashboard.jsx` and handle API errors with proper error boundaries.
3. **P2 (PS Gaps)**: Expand `backend/services/skill_service.py` to explicitly include all 33 MoSPI competencies listed in the Problem Statement.
4. **P2 (PS Gaps)**: Implement vector-based semantic search for competency mapping in `skill_service.py` instead of deterministic string matching.
