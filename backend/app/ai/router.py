from fastapi import APIRouter
from .schemas import GenerateReviewRequest
from .service import generate_review_service

router = APIRouter(
    prefix="/ai",
    tags=["AI Review"]
)

@router.post("/generate-review")
def generate(request: GenerateReviewRequest):
    return generate_review_service(request)