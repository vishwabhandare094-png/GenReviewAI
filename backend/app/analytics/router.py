from fastapi import APIRouter

from .service import get_analytics_data


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


@router.get("/{restaurant_id}")
def get_analytics(restaurant_id: str):

    return get_analytics_data(restaurant_id)