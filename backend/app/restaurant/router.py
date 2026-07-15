from fastapi import APIRouter

from app.schemas.restaurant import RestaurantCreate
from app.restaurant.service import (
    create_restaurant,
    get_google_review_url
)


router = APIRouter(
    prefix="/restaurant",
    tags=["Restaurant"]
)


@router.post("/create")
def create(request: RestaurantCreate):
    return create_restaurant(request)


@router.get("/short-codes")
def get_all_short_codes():
    from app.restaurant.service import get_short_codes
    return get_short_codes()


@router.get("/{restaurant_id}/google-review-url")
def google_review_url(restaurant_id: str):
    return get_google_review_url(restaurant_id)