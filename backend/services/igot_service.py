from typing import List, Optional
from backend.models.course import CourseModel
from backend.database import db_manager

# Curated mock iGOT Karmayogi course dataset aligned with MoSPI National Curricula
DEFAULT_IGOT_COURSES: List[dict] = [
    {
        "id": "IGOT-CS-101",
        "title": "Advanced React & Modern Micro-Frontends",
        "associated_skill": "React",
        "description": "Comprehensive guide to Concurrent Mode, Suspense, state management, and enterprise frontend architecture.",
        "link": "https://igotkarmayogi.gov.in/course/IGOT-CS-101",
        "provider": "iGOT Karmayogi / MoSPI Digital Wing",
        "duration_hours": 18,
        "modules_count": 6,
        "certification_badge": "Govt Certified",
        "level": "Intermediate"
    },
    {
        "id": "IGOT-STAT-204",
        "title": "National Sample Survey & MoSPI Data Frameworks",
        "associated_skill": "Statistical Inference",
        "description": "Official course on NSSO sampling methodology, Stratified Multi-Stage sampling, and national statistical governance.",
        "link": "https://igotkarmayogi.gov.in/course/IGOT-STAT-204",
        "provider": "National Statistical Systems Training Academy (NSSTA)",
        "duration_hours": 24,
        "modules_count": 8,
        "certification_badge": "Official MoSPI",
        "level": "Advanced",
        "tpac_recommended": True
    },
    {
        "id": "NSSTA-TPAC-011",
        "title": "TPAC-Recommended: Foundations of Official Statistics",
        "associated_skill": "Survey Design",
        "description": "Core induction programme recommended by NSSTA's Training Programme Advisory Committee (TPAC) for newly assigned statistical officers.",
        "link": "https://igotkarmayogi.gov.in/course/NSSTA-TPAC-011",
        "provider": "National Statistical Systems Training Academy (NSSTA) - TPAC",
        "duration_hours": 40,
        "modules_count": 12,
        "certification_badge": "NSSTA TPAC Certified",
        "level": "Foundation",
        "tpac_recommended": True
    },
    {
        "id": "NSSTA-TPAC-022",
        "title": "TPAC-Recommended: Ethics, Leadership & Governance for Statistical Officers",
        "associated_skill": "Leadership",
        "description": "Behavioural and managerial competency programme covering leadership, ethics, and decision-making, as recommended under the TPAC framework.",
        "link": "https://igotkarmayogi.gov.in/course/NSSTA-TPAC-022",
        "provider": "National Statistical Systems Training Academy (NSSTA) - TPAC",
        "duration_hours": 16,
        "modules_count": 5,
        "certification_badge": "NSSTA TPAC Certified",
        "level": "Intermediate",
        "tpac_recommended": True
    },
    {
        "id": "IGOT-OPS-302",
        "title": "Enterprise Containerization with Docker & Podman",
        "associated_skill": "Docker",
        "description": "Foundations of OCI container runtimes, multi-stage builds, orchestration, and Meghraj cloud deployment.",
        "link": "https://igotkarmayogi.gov.in/course/IGOT-OPS-302",
        "provider": "Digital India Academy / NIC",
        "duration_hours": 14,
        "modules_count": 5,
        "certification_badge": "Govt Certified",
        "level": "Beginner-Intermediate"
    },
    {
        "id": "IGOT-DATA-108",
        "title": "Applied Time Series & Economic Indicators for India",
        "associated_skill": "Time Series Forecasting",
        "description": "Analytical methodologies for Consumer Price Index (CPI), IIP, GDP indicators, and ARIMA modeling.",
        "link": "https://igotkarmayogi.gov.in/course/IGOT-DATA-108",
        "provider": "MoSPI & Reserve Bank Academy",
        "duration_hours": 20,
        "modules_count": 7,
        "certification_badge": "Official MoSPI",
        "level": "Advanced"
    },
    {
        "id": "IGOT-CLOUD-401",
        "title": "Cloud CI/CD & Infrastructure Governance",
        "associated_skill": "Cloud CI/CD",
        "description": "Automating continuous integration, security scans, and reproducible builds across national data centers.",
        "link": "https://igotkarmayogi.gov.in/course/IGOT-CLOUD-401",
        "provider": "National Informatics Centre (NIC)",
        "duration_hours": 16,
        "modules_count": 6,
        "certification_badge": "Govt Certified",
        "level": "Intermediate"
    },
    {
        "id": "IGOT-SQL-202",
        "title": "High-Performance Relational Databases & PostgreSQL",
        "associated_skill": "PostgreSQL",
        "description": "Relational schema design, query optimization, indexing, and transactional ACID properties for civic registers.",
        "link": "https://igotkarmayogi.gov.in/course/IGOT-SQL-202",
        "provider": "Digital India Corporation",
        "duration_hours": 15,
        "modules_count": 5,
        "certification_badge": "Govt Certified",
        "level": "Beginner-Intermediate"
    },
    {
        "id": "IGOT-AI-501",
        "title": "Deep Learning & NLP with PyTorch & HuggingFace",
        "associated_skill": "PyTorch / TensorFlow",
        "description": "Hands-on neural network architectures, transformers, and fine-tuning models on Indic languages.",
        "link": "https://igotkarmayogi.gov.in/course/IGOT-AI-501",
        "provider": "Ministry of Electronics and Information Technology (MeitY)",
        "duration_hours": 30,
        "modules_count": 10,
        "certification_badge": "MeitY Certified",
        "level": "Advanced"
    },
    {
        "id": "IGOT-SYS-303",
        "title": "Distributed Systems Architecture & Microservices",
        "associated_skill": "System Architecture",
        "description": "Designing high-availability systems, fault tolerance, API gateways, and asynchronous event streaming.",
        "link": "https://igotkarmayogi.gov.in/course/IGOT-SYS-303",
        "provider": "IIT Delhi & iGOT Academic Portal",
        "duration_hours": 22,
        "modules_count": 8,
        "certification_badge": "Govt Certified",
        "level": "Advanced"
    }
]

class IGOTService:
    @property
    def collection(self):
        return db_manager.get_collection("courses")

    async def seed_courses(self):
        """Seeds the mock iGOT courses into MongoDB or in-memory store if empty."""
        count = await self.collection.count_documents({})
        if count == 0:
            for course in DEFAULT_IGOT_COURSES:
                await self.collection.insert_one(dict(course))
            return len(DEFAULT_IGOT_COURSES)
        return count

    async def get_all_courses(self) -> List[CourseModel]:
        await self.seed_courses()
        cursor = await self.collection.find({})
        docs = await cursor.to_list(length=100)
        return [CourseModel(**doc) for doc in docs]

    async def find_courses_for_skills(self, skills: List[str]) -> List[CourseModel]:
        """Finds matching courses for a list of missing skill names (case-insensitive substring match)."""
        await self.seed_courses()
        all_courses = await self.get_all_courses()
        matched = []
        normalized_skills = [s.strip().lower() for s in skills]

        for course in all_courses:
            course_skill = course.associated_skill.lower()
            course_title = course.title.lower()
            if any(s in course_skill or course_skill in s or s in course_title for s in normalized_skills):
                matched.append(course)

        # If direct matches are fewer than needed, backfill with top recommended courses
        if not matched:
            matched = all_courses[:3]

        return matched

igot_service = IGOTService()
