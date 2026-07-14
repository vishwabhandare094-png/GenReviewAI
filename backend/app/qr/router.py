from fastapi import APIRouter

from app.qr.service import generate_qr

router = APIRouter(
    prefix="/qr",
    tags=["QR Code"]
)


@router.post("/generate/{restaurant_id}")
def generate(restaurant_id: str):
    return generate_qr(restaurant_id)