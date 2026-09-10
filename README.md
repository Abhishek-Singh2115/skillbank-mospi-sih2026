# SkillBank - MoSPI Skill Gap Analyzer & AI Learning Platform
### Smart India Hackathon (SIH 2026) | Problem Statement 101
**Ministry of Statistics and Programme Implementation (MoSPI)**

---

## ⚙️ Architecture note (zero-build frontend)
`index.html` is a self-contained, zero-build React app: React, ReactDOM, Babel-standalone, and Tailwind are loaded via CDN, and JSX is compiled in the browser at load time. There is **no Vite build step** — `npm run dev` just serves the static files. This is intentional for hackathon iteration speed, not an oversight.

## 🛠️ Engineering status vs. PS-101 requirements (updated)
Being upfront about what's real, what's mocked, and what changed in this pass:

| Requirement | Status |
|---|---|
| Official profile (designation, department, job role, experience, prior trainings) | ✅ Backend data model updated (`backend/models/user.py`). ⚠️ Frontend onboarding form (`index.html`) still needs to be wired to collect these fields — not yet done in this pass to avoid destabilizing the existing working UI. |
| 4-domain competency framework (Statistical / Technical / Digital Governance / Behavioural & Managerial) | ✅ Implemented in `backend/services/skill_service.py` (`skill_domains` per role) and returned via `domain_breakdown` in `/api/skills/analyze`. Frontend does not yet render this breakdown. |
| NSSTA's TPAC-recommended programmes | ✅ `tpac_recommended` flag added to course model + two dedicated TPAC courses seeded in `igot_service.py`. |
| Administrator dashboard (org-wide insights) | ✅ New `GET /api/admin/overview` endpoint aggregates readiness scores, department breakdown, top skill gaps, and domain distribution across all profiles. ⚠️ No frontend admin UI page yet — API-only in this pass. |
| RBAC (learner vs admin) | ✅ `role` field added to user model (`learner` / `admin`). ⚠️ Not yet enforced on any route — currently informational only. |
| Semantic/LLM-based competency assessment | ❌ Still deterministic alias/keyword matching (`skill_service.py`). Gemini is only used for quiz generation. Wiring an LLM into the matching step itself is a follow-up, not done here. |
| iGOT Karmayogi live API integration | ❌ Still a mocked/seeded course catalog, no live external API calls. Present it to judges as "simulated, architected for real API swap-in," not "live." |
| Predictive analytics (forecasting future skill needs) | ❌ Not implemented. The new admin endpoint reports current-state aggregates only. |

---

## 🏛️ Executive Summary
**SkillBank** is a high-performance, AI-driven Skill Gap Analyzer and competency orchestration platform developed for **MoSPI** under **Smart India Hackathon 2026 (Problem Statement 101)**. It bridges the critical deficit between Indian tertiary academic curricula and the rapidly evolving technological and statistical needs of modern industry and government analytics cadres.

---

## 🌟 Key Features & Architectural Pillars

### 1. 🎯 Landing Page (The Pitch)
- **High-Impact Hero Section**: Bold headline *"Bridge the Gap Between Education and Industry"* with an interactive search bar for degrees and roles.
- **National Metrics Bar**: Live indicators for curricula mapped, NCO-2015 placement alignment, and iGOT modules.
- **Core Feature Grid**:
  1. **AI-Powered Competency Mapping**: Semantic natural language parsing matching university syllabi against active job market requirements and MoSPI statistical mandates.
  2. **Auto-Generated PDF Quizzes**: Instant Bloom's taxonomy MCQ generator with pedagogical explanations.
  3. **Official iGOT Karmayogi Integration**: Accredited pathways providing verifiable Government of India certificates.

### 2. 📊 Command Center Dashboard
- **Executive Metric Cards**:
  - **Industry Readiness Score**: 78% with trend metrics (+12% MoM).
  - **Identified Skill Gaps**: 3 High Priority alerts with actionable bridges.
  - **Modules Completed**: 14/18 progress tracker.
- **Custom Skill Radar Chart**: Responsive SVG visualizer comparing student competency vs. MoSPI/Industry benchmarks across 6 analytical axes.
- **Recent Platform Activity**: Chronological audit trail of quizzes taken, scores achieved, and iGOT courses enrolled.

### 3. 🔍 Skill Gap Analyzer (The Core Logic UI)
- **Clean Multi-Step Stepper**:
  - **Step 1**: Select Degree (e.g., B.Tech CSE, B.Sc Statistics & Data Analytics, BCA, etc.).
  - **Step 2**: Select Target Job Role (Full Stack Developer, MoSPI Statistical Analyst, AI Engineer, Cloud Specialist).
  - **Step 3**: Known Skills Tag Input with suggested skill pills and custom tag additions.
- **AI Scanning State**: Realistic simulation with pulse animations and diagnostic logs.
- **Side-by-Side Gap Matrix**: "What You Know" (validated competencies) vs. "What Industry Demands" (highlighted in red/amber with priority rankings).
- **Personalized Learning Roadmap**: Vertical stepper linking directly to certified **iGOT Karmayogi** courses with duration, modules, and 1-click enrollment.

### 4. 🧠 AI Quiz Generator (Bloom's Taxonomy)
- **Drag-and-Drop Upload Zone**: Upload university syllabi, textbooks, or notes (PDF, DOCX). Includes instant 1-click sample document loaders.
- **MCQ Assessment Engine**:
  - Progress bar & 15-minute countdown timer.
  - Interactive option cards (A, B, C, D) with hover, selected, and active states.
  - Expandable explanations citing specific MoSPI & iGOT reference modules.
  - Comprehensive scorecard with percentile rating and issued micro-credential badge.

---

## 🎨 Global Theme & UI/UX Design System
- **Primary Corporate Blue**: `#1E3A8A` (MoSPI Trustworthy Govt Blue) & `#2563EB` (Interactive Blue)
- **Secondary Alert Amber**: `#F59E0B` (Gaps, Highlights, and CTAs)
- **Emerald Green**: `#10B981` (Validated Skills & Mastery)
- **Soft Background**: `#F9FAFB` with crisp card surfaces (`#FFFFFF`)
- **Typography**: Inter & Outfit from Google Fonts
- **Styling**: Tailwind CSS with custom glassmorphism and subtle elevation shadows
- **Responsive**: 100% optimized across mobile, tablet, and desktop viewports

---

## 🚀 How to Run the Platform

### 1. Backend Server (FastAPI + MongoDB + Gemini AI)
The backend is located in the `/backend` directory.

#### Local Execution:
```bash
# Install dependencies
pip install -r backend/requirements.txt

# Start FastAPI server with live reloading
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
Once started, explore the **Interactive Swagger UI**:
- **Swagger Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

#### Run Automated Test Suite:
```bash
python -m backend.test_backend
```

#### Environment Variables (`backend/.env`):
```env
PORT=8000
HOST=0.0.0.0
MONGO_URI=mongodb://localhost:27017
DATABASE_NAME=skillbank_db
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

---

### 2. Core Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/users/profile` | Create or update student/officer profile; auto-computes readiness score |
| `GET` | `/api/users/{user_id}` | Retrieve profile by user ID, email, or name |
| `POST` | `/api/skills/analyze` | Calculate competency gaps, readiness %, and match iGOT courses |
| `GET` | `/api/skills/roles` | List all predefined role benchmarks & required skill matrices |
| `POST` | `/api/quiz/generate` | Upload PDF (`UploadFile`), extract text via `pypdf`, generate 5 MCQs via Gemini AI |
| `GET` | `/api/courses` | Query mock iGOT Karmayogi course catalog |
| `POST` | `/api/courses/seed` | Seed default accredited MoSPI / iGOT courses |

---

### 3. Frontend Web App
```bash
# Instant Zero-Dependency Run:
python -m http.server 3000
```
Open in your browser: [http://localhost:3000](http://localhost:3000)

---

## 🏆 Smart India Hackathon Alignment
- **Problem Statement**: 101
- **Organization**: Ministry of Statistics and Programme Implementation (MoSPI)
- **Category**: Software
- **Theme**: Smart Education & Governance
