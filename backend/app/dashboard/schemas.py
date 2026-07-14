from pydantic import BaseModel
from typing import List, Optional


class DashboardMetrics(BaseModel):
    total_reviews: int
    average_rating: float
    positive_reviews: int
    negative_reviews: int
    neutral_reviews: int


class RecentReview(BaseModel):
    customer_name: Optional[str] = None
    rating: int
    review_text: Optional[str] = None
    sentiment: Optional[str] = None


class DashboardResponse(BaseModel):
    success: bool
    metrics: DashboardMetrics
    recent_reviews: List[RecentReview]