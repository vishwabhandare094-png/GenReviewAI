import uuid
from app.database.supabase import supabase, resolve_restaurant_id


def create_restaurant(data):
    """Create a restaurant and link it to the owner."""
    
    owner_id = getattr(data, "owner_id", None)
    
    restaurant_id = str(uuid.uuid4())
    short_code = str(uuid.uuid4())[:8].upper()

    result = (
        supabase.table("restaurants")
        .insert(
            {
                "id": restaurant_id,
                "owner_id": owner_id,
                "restaurant_name": getattr(data, "restaurant_name", "New Restaurant"),
                "brand_name": getattr(data, "brand_name", None) or getattr(data, "restaurant_name", "New Restaurant"),
                "cuisine": getattr(data, "category", "Restaurant"),
                "phone": getattr(data, "phone", ""),
                "email": getattr(data, "email", ""),
                "address": getattr(data, "address", ""),
                "city": getattr(data, "city", ""),
                "state": getattr(data, "state", ""),
                "country": getattr(data, "country", "India"),
                "google_review_url": getattr(data, "google_review_link", ""),
                "short_code": short_code,
                "is_active": True
            }
        )
        .execute()
    )

    return {
        "success": True,
        "message": "Restaurant Created Successfully",
        "data": result.data,
        "id": restaurant_id,
    }


def get_google_review_url(restaurant_id: str):

    restaurant_id = resolve_restaurant_id(restaurant_id)

    result = (
        supabase
        .table("restaurants")
        .select("google_review_url")
        .eq("id", restaurant_id)
        .single()
        .execute()
    )

    if not result.data:
        return {
            "success": False,
            "message": "Restaurant not found"
        }

    google_review_url = result.data.get("google_review_url")

    if not google_review_url:
        return {
            "success": False,
            "message": "Google review URL not configured"
        }

    return {
        "success": True,
        "google_review_link": google_review_url,
        "url": google_review_url
    }


def get_short_codes():
    res = supabase.table("restaurants").select("short_code").execute()
    return [item["short_code"] for item in res.data if item.get("short_code")]