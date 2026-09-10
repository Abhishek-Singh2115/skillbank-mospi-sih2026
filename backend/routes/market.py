from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Query, HTTPException, status
from pydantic import BaseModel, Field
from backend.services.market_service import market_service

router = APIRouter(prefix="/market", tags=["Job Market Analytics"])

class MarketDemandResponse(BaseModel):
    role: str = Field(..., example="Full Stack Web Developer")
    query: str = Field(..., example="Full Stack Web Developer")
    demand_percentage: int = Field(..., example=95)
    demand_score: str = Field(..., example="95% Market Demand")
    category: str = Field(..., example="Software Engineering")
    trending_skills: List[str] = Field(..., example=["React", "TypeScript", "Docker"])
    growth_rate: str = Field(..., example="+18% YoY")
    job_openings_sample: int = Field(..., example=14280)
    avg_salary_range: str = Field(..., example="₹8.5L - ₹24.0L")
    hiring_hotspots: List[str] = Field(..., example=["Bengaluru", "Hyderabad", "Pune"])
    source: str = Field(..., example="Adzuna & MoSPI Labor Intelligence")
    is_live_source: bool = Field(default=False)

@router.get("/demand", response_model=MarketDemandResponse)
async def get_role_market_demand(
    role: Optional[str] = Query(None, description="Role title to query market telemetry for")
):
    """
    Fetches real-time market demand metrics, trending competencies, and hiring analytics
    for the selected career role. Integrates Adzuna/Jooble aggregation logic.
    """
    target_role = role or "Full Stack Web Developer"
    try:
        data = await market_service.get_market_demand(target_role)
        return MarketDemandResponse(**data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch market demand metrics: {str(e)}"
        )
