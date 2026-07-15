from fastapi import APIRouter

from .service import get_analytics_data, get_ai_insights_service


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


@router.get("/{restaurant_id}")
def get_analytics(restaurant_id: str):
    return get_analytics_data(restaurant_id)


@router.get("/{restaurant_id}/insights")
def get_ai_insights(restaurant_id: str):
    return get_ai_insights_service(restaurant_id)