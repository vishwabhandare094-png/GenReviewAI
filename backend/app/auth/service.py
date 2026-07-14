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
                "phone": data.phone,
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

    if not verify_password(data.password, user["password_hash"]):
        return {
            "success": False,
            "message": "Invalid email or password"
        }

    return {
        "success": True,
        "message": "Login successful",
        "user": {
            "id": user["id"],
            "full_name": user["full_name"],
            "email": user["email"],
            "phone": user["phone"]
        }
    }