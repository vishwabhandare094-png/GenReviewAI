from fastapi import APIRouter

from app.schemas.review import ReviewRequest, PrivateFeedbackRequest
from app.review.service import submit_review, submit_private_feedback


router = APIRouter(
    prefix="/review",
    tags=["Review"]
)


@router.post("/submit")
def submit(request: ReviewRequest):
    return submit_review(request)


@router.post("/private-feedback")
def private_feedback(request: PrivateFeedbackRequest):
    return submit_private_feedback(request)