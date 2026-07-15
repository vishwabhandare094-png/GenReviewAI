import uuid
from app.database.supabase import supabase, resolve_restaurant_id


def create_restaurant(data):
    """Create a restaurant and link it to the owner's business via org."""
    
    # Determine business_id from owner_id if provided
    business_id = None
    owner_id = getattr(data, "owner_id", None)
    
    if owner_id:
        try:
            # Get owner's org_id
            user_res = supabase.table("users").select("org_id").eq("id", owner_id).single().execute()
            if user_res.data:
                org_id = user_res.data.get("org_id")
                if org_id:
                    biz_res = supabase.table("businesses").select("id").eq("org_id", org_id).limit(1).execute()
                    if biz_res.data:
                        business_id = biz_res.data[0]["id"]
        except Exception as e:
            print(f"[Restaurant] Could not find business for owner {owner_id}: {e}")
    
    if not business_id:
        # Fall back to the first available business
        biz_res = supabase.table("businesses").select("id").limit(1).execute()
        business_id = biz_res.data[0]["id"] if biz_res.data else "3a19a62a-8b64-4b77-8bc0-728feb597dd6"

    restaurant_id = str(uuid.uuid4())

    result = (
        supabase.table("restaurants")
        .insert(
            {
                "id": restaurant_id,
                "business_id": business_id,
                "name": data.restaurant_name,
                "cuisine": data.category,
                "phone": data.phone,
                "email": data.email,
                "address": data.address,
                "city": data.city,
                "state": data.state,
                "country": data.country,
                "google_review_url": data.google_review_link,
                "rating_threshold": data.rating_threshold,
                "status": "active"
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