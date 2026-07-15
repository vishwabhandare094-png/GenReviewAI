from app.database.supabase import supabase
from app.auth.security import hash_password, verify_password
from app.schemas.auth import LoginRequest


def register_user(data):
    existing = (
        supabase.table("users")
        .select("*")
        .eq("email", data.email)
        .execute()
    )

    if existing.data:
        return {
            "success": False,
            "message": "Email already exists"
        }

    hashed_password = hash_password(data.password)

    result = (
        supabase.table("users")
        .insert(
            {
                "full_name": data.full_name,
                "email": data.email,
                "password_hash": hashed_password,
                "phone": getattr(data, "phone", ""),
                "role": "owner",
                "is_verified": True
            }
        )
        .execute()
    )

    return {
        "success": True,
        "message": "User registered successfully",
        "data": result.data,
    }


def login_user(data: LoginRequest):
    result = (
        supabase.table("users")
        .select("*")
        .eq("email", data.email)
        .execute()
    )

    if not result.data:
        return {
            "success": False,
            "message": "Invalid email or password"
        }

    user = result.data[0]

    # The column is called password_hash now
    if not verify_password(data.password, user["password_hash"]):
        return {
            "success": False,
            "message": "Invalid email or password"
        }

    # Look up the restaurant linked to this user
    restaurant_id = None
    restaurant_name = None
    restaurant_short_code = None
    try:
        rest_res = supabase.table("restaurants").select("id, restaurant_name, short_code").eq("owner_id", user["id"]).limit(1).execute()
        if rest_res.data:
            restaurant_id = rest_res.data[0]["id"]
            restaurant_name = rest_res.data[0].get("restaurant_name")
            restaurant_short_code = rest_res.data[0].get("short_code")
    except Exception as e:
        print(f"[Auth] Could not look up restaurant: {e}")

    return {
        "success": True,
        "message": "Login successful",
        "user": {
            "id": user["id"],
            "full_name": user["full_name"],
            "email": user["email"],
            "phone": user.get("phone", ""),
            "restaurant_id": restaurant_id,
            "restaurant_name": restaurant_name,
            "restaurant_short_code": restaurant_short_code,
        }
    }