from app.database.supabase import supabase


def create_restaurant(data):

    result = (
        supabase.table("restaurants")
        .insert(
            {
                "owner_id": data.owner_id,
                "restaurant_name": data.restaurant_name,
                "brand_name": data.brand_name,
                "cuisine": data.category,
                "phone": data.phone,
                "email": data.email,
                "address": data.address,
                "city": data.city,
                "state": data.state,
                "country": data.country,
            }
        )
        .execute()
    )

    return {
        "success": True,
        "message": "Restaurant Created Successfully",
        "data": result.data,
    }

def get_google_review_url(restaurant_id: str):

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
        "google_review_url": google_review_url
    }