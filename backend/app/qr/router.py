from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.qr.service import generate_qr, get_qr_image_stream

router = APIRouter(
    prefix="/qr",
    tags=["QR Code"]
)


@router.post("/generate/{restaurant_id}")
def generate(restaurant_id: str, force_reset: bool = False):
    return generate_qr(restaurant_id, force_reset)


@router.get("/image/{short_code}.png")
def qr_image(short_code: str):
    stream = get_qr_image_stream(short_code)
    return StreamingResponse(stream, media_type="image/png")