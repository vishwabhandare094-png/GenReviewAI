from pydantic import BaseModel, Field
from uuid import UUID


class ReviewRequest(BaseModel):
    restaurant_id: UUID
    customer_name: str
    rating: int = Field(..., ge=1, le=5)
    review_text: str


class PrivateFeedbackRequest(BaseModel):
    restaurant_id: UUID
    customer_name: str
    rating: int = Field(..., ge=1, le=3)
    feedback_text: str