from pydantic import BaseModel


class RestaurantCreate(BaseModel):
    owner_id: str
    restaurant_name: str
    brand_name: str
    category: str
    phone: str
    email: str
    address: str
    city: str
    state: str
    country: str
    google_review_link: str
    rating_threshold: float = 4.0