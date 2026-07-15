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

    # Fetch a default organization and role from the database
    orgs_res = supabase.table("organizations").select("id").limit(1).execute()
    roles_res = supabase.table("roles").select("id").eq("name", "business_owner").execute()
    
    org_id = orgs_res.data[0]["id"] if orgs_res.data else "00000000-0000-0000-0000-000000000000"
    role_id = roles_res.data[0]["id"] if roles_res.data else "a2f06723-49c7-4851-a429-7c4a99a3d5ad"

    result = (
        supabase.table("users")
        .insert(
            {
                "name": data.full_name,
                "email": data.email,
                "hashed_password": hashed_password,
                "org_id": org_id,
                "role_id": role_id,
                "is_active": True
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

    if not verify_password(data.password, user["hashed_password"]):
        return {
            "success": False,
            "message": "Invalid email or password"
        }

    # Look up the restaurant linked to this user's org
    restaurant_id = None
    restaurant_name = None
    restaurant_short_code = None
    try:
        org_id = user.get("org_id")
        if org_id:
            biz_res = supabase.table("businesses").select("id").eq("org_id", org_id).limit(1).execute()
            if biz_res.data:
                business_id = biz_res.data[0]["id"]
                rest_res = supabase.table("restaurants").select("id, name, short_code").eq("business_id", business_id).eq("status", "active").limit(1).execute()
                if rest_res.data:
                    restaurant_id = rest_res.data[0]["id"]
                    restaurant_name = rest_res.data[0].get("name")
                    restaurant_short_code = rest_res.data[0].get("short_code")
    except Exception as e:
        print(f"[Auth] Could not look up restaurant: {e}")

    return {
        "success": True,
        "message": "Login successful",
        "user": {
            "id": user["id"],
            "full_name": user["name"],
            "email": user["email"],
            "phone": user.get("phone", ""),
            "restaurant_id": restaurant_id,
            "restaurant_name": restaurant_name,
            "restaurant_short_code": restaurant_short_code,
        }
    }