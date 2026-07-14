from pydantic import BaseModel
from uuid import UUID

class GenerateReviewRequest(BaseModel):
    restaurant_id: UUID
    rating: int
    selected_tags: list[str]