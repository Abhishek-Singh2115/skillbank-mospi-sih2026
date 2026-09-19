from typing import List, Dict, Tuple
from backend.models.skill import SkillAnalysisRequest, SkillAnalysisResponse, RoleBenchmark, DomainGap, COMPETENCY_DOMAINS
from backend.services.igot_service import igot_service

# Predefined standard role benchmark matrices aligned with MoSPI and National Classification of Occupations (NCO-2015).
# Each role now tags every required skill with one of the 4 PS-101 competency domains:
#   Statistical Competencies | Technical Competencies | Digital Governance | Behavioural & Managerial Competencies
ROLE_BENCHMARKS: Dict[str, dict] = {
    "MoSPI Statistical Officer": {
        "id": "stat_officer",
        "title": "MoSPI Statistical Officer",
        "category": "Official Statistics System",
        "demand_score": "98% Government Priority (MoSPI PS-101)",
        "required_skills": [
            "Survey Design", "Sampling", "National Accounts", "Price Statistics",
            "SDG Indicators", "Data Quality Frameworks",
            "Python", "R Programming", "SQL", "Data Visualization",
            "Cybersecurity Awareness", "Data Privacy", "Government Cloud",
            "Leadership", "Communication", "Ethics", "Decision Making"
        ],
        "skill_domains": {
            "Survey Design": "Statistical Competencies",
            "Sampling": "Statistical Competencies",
            "National Accounts": "Statistical Competencies",
            "Price Statistics": "Statistical Competencies",
            "SDG Indicators": "Statistical Competencies",
            "Data Quality Frameworks": "Statistical Competencies",
            "Python": "Technical Competencies",
            "R Programming": "Technical Competencies",
            "SQL": "Technical Competencies",
            "Data Visualization": "Technical Competencies",
            "Cybersecurity Awareness": "Digital Governance",
            "Data Privacy": "Digital Governance",
            "Government Cloud": "Digital Governance",
            "Leadership": "Behavioural & Managerial Competencies",
            "Communication": "Behavioural & Managerial Competencies",
            "Ethics": "Behavioural & Managerial Competencies",
            "Decision Making": "Behavioural & Managerial Competencies",
        }
    },
    "MoSPI Statistical Data Analyst": {
        "id": "data_analyst",
        "title": "MoSPI Statistical Data Analyst",
        "category": "Public Sector & National Governance",
        "demand_score": "98% Government Priority (MoSPI PS-101)",
        "required_skills": [
            "Python", "R Programming", "Statistical Inference", "National Sampling (NSSO)",
            "SQL", "Tableau / PowerBI", "Time Series Forecasting", "Data Cleaning", "Data Governance",
            "Project Management", "Communication"
        ],
        "skill_domains": {
            "Statistical Inference": "Statistical Competencies",
            "National Sampling (NSSO)": "Statistical Competencies",
            "Time Series Forecasting": "Statistical Competencies",
            "Python": "Technical Competencies",
            "R Programming": "Technical Competencies",
            "SQL": "Technical Competencies",
            "Tableau / PowerBI": "Technical Competencies",
            "Data Cleaning": "Technical Competencies",
            "Data Governance": "Digital Governance",
            "Project Management": "Behavioural & Managerial Competencies",
            "Communication": "Behavioural & Managerial Competencies",
        }
    },
    "MoSPI Statistical Cadre Investigator": {
        "id": "mospi_investigator",
        "title": "MoSPI Statistical Cadre Investigator",
        "category": "Public Sector & Governance",
        "demand_score": "96% Field Operations (MoSPI PS-101)",
        "required_skills": [
            "Field Survey Methodology", "Data Verification", "Official Statistics (MoSPI)",
            "SPSS / R", "Economic Census", "Statistical Auditing", "Data Ethics"
        ],
        "skill_domains": {
            "Field Survey Methodology": "Statistical Competencies",
            "Data Verification": "Statistical Competencies",
            "Official Statistics (MoSPI)": "Statistical Competencies",
            "Economic Census": "Statistical Competencies",
            "SPSS / R": "Technical Competencies",
            "Statistical Auditing": "Digital Governance",
            "Data Ethics": "Behavioural & Managerial Competencies",
        }
    },
    "Public Policy & Governance Analyst": {
        "id": "public_policy_analyst",
        "title": "Public Policy & Governance Analyst",
        "category": "Public Sector & Governance",
        "demand_score": "93% Policy Priority (MoSPI PS-101)",
        "required_skills": [
            "Policy Impact Evaluation", "Quantitative Research", "Stakeholder Consultation",
            "Econometrics", "Report Writing", "Public Finance Management",
            "National Accounts Statistics"
        ],
        "skill_domains": {
            "Policy Impact Evaluation": "Statistical Competencies",
            "Quantitative Research": "Statistical Competencies",
            "Econometrics": "Statistical Competencies",
            "National Accounts Statistics": "Statistical Competencies",
            "Stakeholder Consultation": "Behavioural & Managerial Competencies",
            "Report Writing": "Behavioural & Managerial Competencies",
            "Public Finance Management": "Digital Governance",
        }
    },
    "Full Stack Web Developer": {
        "id": "fullstack",
        "title": "Full Stack Web Developer",
        "category": "Software Engineering",
        "demand_score": "95% High Market Demand",
        "required_skills": [
            "HTML/CSS", "JavaScript", "TypeScript", "React", "Node.js",
            "RESTful APIs", "SQL", "PostgreSQL", "Docker", "Git", "Cloud CI/CD", "System Architecture"
        ],
        "skill_domains": {}
    },
    "AI / ML Solutions Engineer": {
        "id": "ai_engineer",
        "title": "AI / ML Solutions Engineer",
        "category": "Artificial Intelligence & Automation",
        "demand_score": "96% High Growth Area",
        "required_skills": [
            "Python", "PyTorch / TensorFlow", "Vector Databases", "LangChain / LLM APIs",
            "Data Preprocessing", "Model Deployment", "Docker", "Linear Algebra & Probability"
        ],
        "skill_domains": {}
    },
    "Cloud & DevOps Specialist": {
        "id": "cloud_devops",
        "title": "Cloud & DevOps Specialist",
        "category": "Infrastructure & Reliability",
        "demand_score": "92% Market Demand",
        "required_skills": [
            "Linux Admin", "Docker", "Kubernetes", "AWS / NIC Meghraj Cloud",
            "Terraform", "CI/CD Pipelines", "Monitoring (Prometheus)", "Networking & Security"
        ],
        "skill_domains": {}
    }
}

# Skill synonyms dictionary for intelligent normalization
SKILL_ALIASES = {
    "js": "JavaScript",
    "ts": "TypeScript",
    "reactjs": "React",
    "react.js": "React",
    "nodejs": "Node.js",
    "node": "Node.js",
    "py": "Python",
    "postgres": "PostgreSQL",
    "r": "R Programming",
    "k8s": "Kubernetes",
    "ci/cd": "CI/CD Pipelines",
    "cicd": "CI/CD Pipelines",
    "timeseries": "Time Series Forecasting",
    "sampling": "National Sampling (NSSO)",
    "nsso": "National Sampling (NSSO)",
    "statistics": "Statistical Inference",
    "survey design": "Survey Design",
    "leadership": "Leadership",
    "communication": "Communication",
    "ethics": "Ethics",
    "cybersecurity": "Cybersecurity Awareness",
    "data privacy": "Data Privacy",
}

class SkillService:
    def get_all_roles(self) -> List[RoleBenchmark]:
        return [RoleBenchmark(**data) for data in ROLE_BENCHMARKS.values()]

    def normalize_skill(self, skill: str) -> str:
        """Cleans and maps skill string to canonical form using alias dictionary."""
        s = skill.strip().lower()
        if s in SKILL_ALIASES:
            return SKILL_ALIASES[s]
        for role_data in ROLE_BENCHMARKS.values():
            for req in role_data["required_skills"]:
                if s == req.lower():
                    return req
        return skill.strip()

    def _match_role(self, target_role_name: str) -> dict:
        # 1. Exact match (case-insensitive) — always wins
        for role_title, role_data in ROLE_BENCHMARKS.items():
            if target_role_name.strip().lower() == role_title.strip().lower():
                return role_data
        # 2. Substring containment — shorter string inside longer to avoid
        #    e.g. "Analyst" accidentally matching "Statistical Data Analyst" first
        name_lower = target_role_name.strip().lower()
        for role_title, role_data in ROLE_BENCHMARKS.items():
            title_lower = role_title.strip().lower()
            if name_lower in title_lower or title_lower in name_lower:
                return role_data
        return ROLE_BENCHMARKS["MoSPI Statistical Data Analyst"]

    def analyze_skills(
        self, target_role_name: str, current_skills: List[str], degree: str = ""
    ) -> Tuple[float, List[str], List[str], List[str]]:
        """
        Core skill gap matching algorithm:
        1. Normalizes user skills.
        2. Retrieves benchmark required skills for the target role.
        3. Computes intersection (acquired) and set difference (gaps).
        4. Calculates competency readiness score.

        NOTE (engineering honesty): this is deterministic alias/keyword matching,
        not semantic/LLM-based competency inference. Gemini is used elsewhere for
        quiz generation. Wiring an LLM into this scoring step is a follow-up task,
        not yet implemented here.
        """
        matched_role = self._match_role(target_role_name)

        required_skills = matched_role["required_skills"]
        normalized_current = [self.normalize_skill(s) for s in current_skills]
        normalized_current_lower = {s.lower() for s in normalized_current}

        acquired = []
        missing = []

        for req in required_skills:
            if req.lower() in normalized_current_lower:
                acquired.append(req)
            else:
                missing.append(req)

        req_lower_set = {r.lower() for r in required_skills}
        supplementary = [s for s in normalized_current if s.lower() not in req_lower_set]

        total_req = len(required_skills)
        readiness_score = round((len(acquired) / total_req) * 100, 1) if total_req > 0 else 0.0

        return readiness_score, acquired, missing, supplementary

    def build_domain_breakdown(self, target_role_name: str, acquired: List[str], missing: List[str]) -> List[DomainGap]:
        """Groups the acquired/missing skills into the 4 PS-101 competency domains."""
        matched_role = self._match_role(target_role_name)
        skill_domains = matched_role.get("skill_domains", {})

        buckets: Dict[str, DomainGap] = {d: DomainGap(domain=d) for d in COMPETENCY_DOMAINS}

        for skill in acquired:
            domain = skill_domains.get(skill, "Technical Competencies")
            buckets[domain].acquired.append(skill)
        for skill in missing:
            domain = skill_domains.get(skill, "Technical Competencies")
            buckets[domain].missing.append(skill)

        result = []
        for d in COMPETENCY_DOMAINS:
            b = buckets[d]
            total = len(b.acquired) + len(b.missing)
            b.readiness_score = round((len(b.acquired) / total) * 100, 1) if total > 0 else 0.0
            if total > 0:
                result.append(b)
        return result

    async def generate_skill_analysis_response(
        self, request: SkillAnalysisRequest
    ) -> SkillAnalysisResponse:
        role_name = request.target_role or "MoSPI Statistical Data Analyst"
        skills = request.current_skills or []
        degree = request.degree or "Bachelor of Engineering"

        readiness, acquired, missing, supplementary = self.analyze_skills(
            target_role_name=role_name,
            current_skills=skills,
            degree=degree
        )

        domain_breakdown = self.build_domain_breakdown(role_name, acquired, missing)

        recommended_courses = await igot_service.find_courses_for_skills(missing)

        milestones = [
            {
                "milestone": "1. Core Foundation Bridge",
                "focus": missing[0] if len(missing) > 0 else "Foundational Mastery",
                "action": "Address critical prerequisite deficit via interactive exercises."
            },
            {
                "milestone": "2. Applied Industry Frameworks",
                "focus": missing[1] if len(missing) > 1 else "Modern Tooling",
                "action": "Deploy production-grade implementations aligned with MoSPI standards."
            },
            {
                "milestone": "3. Government Capstone & Certification",
                "focus": "MoSPI Industry Readiness Assessment",
                "action": "Complete Bloom's taxonomy AI quiz and receive verified digital badge."
            }
        ]

        return SkillAnalysisResponse(
            target_role=role_name,
            degree=degree,
            readiness_score=readiness,
            acquired_skills=acquired,
            missing_skills=missing,
            supplementary_skills=supplementary,
            recommended_courses=recommended_courses,
            roadmap_steps=milestones,
            domain_breakdown=domain_breakdown
        )

skill_service = SkillService()
