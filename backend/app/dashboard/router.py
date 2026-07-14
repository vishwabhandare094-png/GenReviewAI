from fastapi import APIRouter
from app.dashboard.service import get_dashboard_data
from app.dashboard.schemas import DashboardResponse


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get(
    "/{restaurant_id}",
    response_model=DashboardResponse
)
def get_dashboard(restaurant_id: str):
    return get_dashboard_data(restaurant_id)