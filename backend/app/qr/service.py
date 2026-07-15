import os
import uuid
import qrcode
import io

from app.database.supabase import supabase, resolve_restaurant_id


def _looks_like_uuid(value: str) -> bool:
    if not value:
        return False
    try:
        uuid.UUID(str(value))
        return True
    except (ValueError, TypeError):
        return False

def _frontend_url():
    configured = os.environ.get("FRONTEND_URL", "").strip()
    if configured:
        return configured.rstrip("/")

    origins = os.environ.get("CORS_ORIGINS", "")
    for origin in origins.split(","):
        origin = origin.strip().rstrip("/")
        if origin and "localhost" not in origin and "127.0.0.1" not in origin:
            return origin

    return "https://genreviewai-frontend.onrender.com"


def get_qr_image_stream(short_code: str):
    frontend_url = _frontend_url()
    review_url = f"{frontend_url}/r/{short_code}/"
    img = qrcode.make(review_url)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf


def generate_qr(restaurant_id: str, force_reset: bool = False):
    resolved_id = resolve_restaurant_id(restaurant_id)

    if resolved_id and not _looks_like_uuid(resolved_id):
        return {
            "success": False,
            "message": "Invalid restaurant identifier",
            "short_code": None,
            "review_url": None,
            "qr_path": None,
            "stable": False,
            "reset": False,
        }

    # Printed QR codes must stay stable. Reuse the same short_code unless
    # the owner explicitly requests a reset.
    res = (
        supabase.table("restaurants")
        .select("short_code, qr_code_url, restaurant_name")
        .eq("id", resolved_id)
        .execute()
    )
    
    if res.data and not force_reset:
        row = res.data[0]
        short_code = row.get("short_code")
        qr_code_url = row.get("qr_code_url")
        
        if short_code:
            dynamic_url = f"qr/image/{short_code}.png"
            frontend_url = _frontend_url()
            review_url = f"{frontend_url}/r/{short_code}/"
            
            # If the database URL is not set or points to old local uploads disk, update it
            if not qr_code_url or "uploads/" in qr_code_url:
                supabase.table("restaurants").update(
                    {
                        "qr_code_url": dynamic_url
                    }
                ).eq("id", resolved_id).execute()
                qr_code_url = dynamic_url
                
            return {
                "success": True,
                "message": "Existing stable QR code retrieved",
                "short_code": short_code,
                "review_url": review_url,
                "qr_path": qr_code_url,
                "stable": True,
                "reset": False
            }

    # Generate a fresh short code
    short_code = str(uuid.uuid4())[:8].upper()
    dynamic_url = f"qr/image/{short_code}.png"
    frontend_url = _frontend_url()
    review_url = f"{frontend_url}/r/{short_code}/"
    
    supabase.table("restaurants").update(
        {
            "short_code": short_code,
            "qr_code_url": dynamic_url
        }
    ).eq("id", resolved_id).execute()

    return {
        "success": True,
        "message": "QR generated successfully" if force_reset else "Stable QR image generated",
        "short_code": short_code,
        "review_url": review_url,
        "qr_path": dynamic_url,
        "stable": not force_reset,
        "reset": force_reset
    }
