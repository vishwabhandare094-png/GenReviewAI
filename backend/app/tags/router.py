from fastapi import APIRouter

from app.tags.service import get_tags

router = APIRouter(
    prefix="/tags",
    tags=["Tags"]
)


@router.get("/{restaurant_id}")
def fetch_tags(restaurant_id: str):

    return get_tags(restaurant_id)