from collections import Counter
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from backend.database import db_manager
from backend.services.skill_service import skill_service
from backend.models.skill import COMPETENCY_DOMAINS
from backend.dependencies import require_admin

router = APIRouter(prefix="/admin", tags=["Administrator Dashboard"])


class DomainDistribution(BaseModel):
    domain: str
    avg_readiness: float
    officials_with_gaps: int


class AdminOverviewResponse(BaseModel):
    total_officials: int
    avg_readiness_score: float
    department_breakdown: Dict[str, int]
    top_skill_gaps: List[Dict[str, Any]]
    domain_distribution: List[DomainDistribution]
    training_completion_rate: float


@router.get("/overview", response_model=AdminOverviewResponse)
async def get_admin_overview(
    _admin_user: Dict[str, Any] = Depends(require_admin),
):
    """
    Organization-wide insights for the Administrator dashboard (PS-101 requirement):
    workforce competency distribution, training effectiveness, and emerging skill gaps.

    NOTE (engineering honesty): this aggregates whatever profiles exist in the
    current store (in-memory or MongoDB). With a small number of demo users the
    numbers will look thin — that's expected for a hackathon demo, not a bug.
    Predictive analytics (forecasting future skill needs) is NOT implemented here;
    this endpoint reports current-state aggregates only.
    """
    try:
        users_col = db_manager.get_collection("users")
        cursor = users_col.find({})
        all_users = await cursor.to_list(length=1000)

        if not all_users:
            return AdminOverviewResponse(
                total_officials=0,
                avg_readiness_score=0.0,
                department_breakdown={},
                top_skill_gaps=[],
                domain_distribution=[DomainDistribution(domain=d, avg_readiness=0.0, officials_with_gaps=0) for d in COMPETENCY_DOMAINS],
                training_completion_rate=0.0
            )

        total = len(all_users)
        avg_readiness = round(sum((u.get("readiness_score") or 0.0) for u in all_users) / total, 1)

        dept_counter = Counter(u.get("department") or "Unassigned" for u in all_users)

        gap_counter = Counter()
        domain_scores: Dict[str, List[float]] = {d: [] for d in COMPETENCY_DOMAINS}
        domain_gap_counts: Dict[str, int] = {d: 0 for d in COMPETENCY_DOMAINS}

        for u in all_users:
            target_role = u.get("target_role") or u.get("job_role") or "MoSPI Statistical Data Analyst"
            current_skills = u.get("current_skills") or []
            _, acquired, missing, _ = skill_service.analyze_skills(target_role, current_skills)
            for skill in missing:
                gap_counter[skill] += 1

            breakdown = skill_service.build_domain_breakdown(target_role, acquired, missing)
            for d in breakdown:
                domain_scores[d.domain].append(d.readiness_score)
                if d.missing:
                    domain_gap_counts[d.domain] += 1

        top_gaps = [{"skill": skill, "officials_affected": count} for skill, count in gap_counter.most_common(8)]

        domain_distribution = []
        for d in COMPETENCY_DOMAINS:
            scores = domain_scores[d]
            avg = round(sum(scores) / len(scores), 1) if scores else 0.0
            domain_distribution.append(DomainDistribution(domain=d, avg_readiness=avg, officials_with_gaps=domain_gap_counts[d]))

        total_modules = sum((u.get("total_modules") or 18) for u in all_users)
        completed_modules = sum((u.get("completed_modules") or 0) for u in all_users)
        completion_rate = round((completed_modules / total_modules) * 100, 1) if total_modules > 0 else 0.0

        return AdminOverviewResponse(
            total_officials=total,
            avg_readiness_score=avg_readiness,
            department_breakdown=dict(dept_counter),
            top_skill_gaps=top_gaps,
            domain_distribution=domain_distribution,
            training_completion_rate=completion_rate
        )
    except Exception:
        import logging
        logging.exception("Admin overview failed")
        raise HTTPException(status_code=500, detail="Failed to fetch admin overview.")
