import json
import uuid
from app.database.supabase import supabase, resolve_restaurant_id


def _metadata_from_description(row):
    if not row:
        return {}
    desc_str = row.get("description")
    if not desc_str:
        return {}
    try:
        return json.loads(desc_str)
    except Exception:
        return {}


def _is_missing_column_error(exc):
    return "column" in str(exc).lower() and "does not exist" in str(exc).lower()


def create_restaurant(data):
    """Create a restaurant and link it to the owner."""
    
    owner_id = getattr(data, "owner_id", None)
    
    restaurant_id = str(uuid.uuid4())
    short_code = str(uuid.uuid4())[:8].upper()

    metadata = {
        "rating_threshold": getattr(data, "rating_threshold", 4.0),
        "theme_name": getattr(data, "theme_name", "Warm Ticket")
    }

    payload = {
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
        "is_active": True,
        "description": json.dumps(metadata)
    }

    try:
        result = supabase.table("restaurants").insert(payload).execute()
    except Exception as e:
        if not _is_missing_column_error(e):
            raise
        payload.pop("description", None)
        result = supabase.table("restaurants").insert(payload).execute()

    return {
        "success": True,
        "message": "Restaurant Created Successfully",
        "data": result.data,
        "id": restaurant_id,
    }


def list_restaurants(owner_id: str):
    select_cols = "id, restaurant_name, brand_name, cuisine, phone, email, address, city, state, country, google_review_url, short_code, is_active, description"
    try:
        result = supabase.table("restaurants").select(select_cols).eq("owner_id", owner_id).execute()
    except Exception as e:
        if not _is_missing_column_error(e):
            raise
        fallback_cols = select_cols.replace(", description", "")
        result = supabase.table("restaurants").select(fallback_cols).eq("owner_id", owner_id).execute()

    restaurants = []
    for row in (result.data or []):
        metadata = _metadata_from_description(row)
        row["rating_threshold"] = metadata.get("rating_threshold", 4.0)
        row["theme_name"] = metadata.get("theme_name", "Warm Ticket")
        restaurants.append(row)
        
    return {
        "success": True,
        "restaurants": restaurants
    }


def update_restaurant(restaurant_id: str, data):
    metadata = {
        "rating_threshold": getattr(data, "rating_threshold", 4.0),
        "theme_name": getattr(data, "theme_name", "Warm Ticket")
    }

    payload = {
        "restaurant_name": data.restaurant_name,
        "brand_name": data.brand_name or data.restaurant_name,
        "cuisine": data.category,
        "phone": data.phone,
        "email": data.email,
        "address": data.address,
        "city": data.city,
        "state": data.state,
        "country": data.country,
        "google_review_url": data.google_review_link,
        "description": json.dumps(metadata)
    }

    try:
        result = supabase.table("restaurants").update(payload).eq("id", restaurant_id).execute()
    except Exception as e:
        if not _is_missing_column_error(e):
            raise
        payload.pop("description", None)
        result = supabase.table("restaurants").update(payload).eq("id", restaurant_id).execute()
    
    res_data = result.data[0] if result.data else None
    if res_data:
        res_data["rating_threshold"] = metadata["rating_threshold"]
        res_data["theme_name"] = metadata["theme_name"]

    return {
        "success": True,
        "message": "Restaurant updated successfully",
        "restaurant": res_data,
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


def get_restaurant_by_short_code(short_code: str):
    select_cols = "id, restaurant_name, brand_name, short_code, google_review_url, is_active, description"
    try:
        result = (
            supabase
            .table("restaurants")
            .select(select_cols)
            .eq("short_code", short_code.upper())
            .limit(1)
            .execute()
        )
    except Exception as e:
        if not _is_missing_column_error(e):
            raise
        result = (
            supabase
            .table("restaurants")
            .select(select_cols.replace(", description", ""))
            .eq("short_code", short_code.upper())
            .limit(1)
            .execute()
        )

    restaurant = result.data[0] if result.data else None

    if not restaurant or restaurant.get("is_active") is False:
        return {
            "success": False,
            "message": "Restaurant not found"
        }

    metadata = _metadata_from_description(restaurant)

    return {
        "success": True,
        "restaurant": {
            "id": restaurant.get("id"),
            "restaurant_name": restaurant.get("restaurant_name"),
            "brand_name": restaurant.get("brand_name"),
            "short_code": restaurant.get("short_code"),
            "google_review_link": restaurant.get("google_review_url"),
            "google_review_url": restaurant.get("google_review_url"),
            "rating_threshold": metadata.get("rating_threshold", 4.0),
            "theme_name": metadata.get("theme_name", "Warm Ticket"),
        }
    }


def delete_restaurant(restaurant_id: str):
    # 1. Delete reviews
    try:
        supabase.table("reviews").delete().eq("restaurant_id", restaurant_id).execute()
    except Exception as e:
        print(f"Error deleting reviews: {e}")
        
    # 2. Delete private feedback
    try:
        supabase.table("private_feedback").delete().eq("restaurant_id", restaurant_id).execute()
    except Exception as e:
        print(f"Error deleting private feedback: {e}")
        
    # 3. Delete tags
    try:
        supabase.table("review_tags").delete().eq("restaurant_id", restaurant_id).execute()
    except Exception as e:
        print(f"Error deleting review tags: {e}")

    # 4. Delete knowledge base
    try:
        supabase.table("knowledge_base").delete().eq("restaurant_id", restaurant_id).execute()
    except Exception as e:
        print(f"Error deleting knowledge base: {e}")
        
    # 5. Delete drafts
    try:
        supabase.table("review_drafts").delete().eq("restaurant_id", restaurant_id).execute()
    except Exception as e:
        print(f"Error deleting review drafts: {e}")

    # 6. Delete the restaurant itself
    result = (
        supabase.table("restaurants")
        .delete()
        .eq("id", restaurant_id)
        .execute()
    )
    return {
        "success": True,
        "message": "Restaurant deleted successfully",
        "data": result.data
    }


def send_test_email_notification(restaurant_id: str):
    try:
        from app.email.service import send_new_review_notification
        result = send_new_review_notification(
            restaurant_id=restaurant_id,
            customer_name="Test Customer",
            rating=2,
            review_text="This is a test notification to verify your Resend email configuration is working correctly.",
            sentiment="Negative",
            is_private=True
        )
        return result
    except Exception as e:
        return {"success": False, "message": str(e)}
