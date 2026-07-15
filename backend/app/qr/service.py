import os
import uuid
import qrcode

from app.database.supabase import supabase

UPLOAD_DIR = "uploads/qr"

os.makedirs(UPLOAD_DIR, exist_ok=True)


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


def generate_qr(restaurant_id: str, force_reset: bool = False):
    # Printed QR codes must stay stable. Reuse the same short_code unless
    # the owner explicitly requests a reset.
    res = (
        supabase.table("restaurants")
        .select("short_code, qr_code_url, restaurant_name")
        .eq("id", restaurant_id)
        .execute()
    )
    
    if res.data and not force_reset:
        row = res.data[0]
        short_code = row.get("short_code")
        qr_code_url = row.get("qr_code_url")
        
        if short_code and qr_code_url:
            # Verify file exists on disk
            if os.path.exists(qr_code_url):
                frontend_url = _frontend_url()
                review_url = f"{frontend_url}/r/{short_code}/"
                return {
                    "success": True,
                    "message": "Existing stable QR code retrieved",
                    "short_code": short_code,
                    "review_url": review_url,
                    "qr_path": qr_code_url,
                    "stable": True,
                    "reset": False
                }

    # If the image file is missing, regenerate the PNG but keep the same
    # short_code. A new code is created only for a deliberate reset.
    existing_short_code = None
    if res.data:
        existing_short_code = res.data[0].get("short_code")
        
    short_code = existing_short_code if (existing_short_code and not force_reset) else str(uuid.uuid4())[:8].upper()
    
    frontend_url = _frontend_url()
    review_url = f"{frontend_url}/r/{short_code}/"
    
    img = qrcode.make(review_url)
    filename = f"{short_code}.png"
    filepath = os.path.join(UPLOAD_DIR, filename)
    img.save(filepath)

    supabase.table("restaurants").update(
        {
            "short_code": short_code,
            "qr_code_url": filepath
        }
    ).eq("id", restaurant_id).execute()

    return {
        "success": True,
        "message": "QR generated successfully" if force_reset or not existing_short_code else "Stable QR image regenerated",
        "short_code": short_code,
        "review_url": review_url,
        "qr_path": filepath,
        "stable": not force_reset,
        "reset": force_reset
    }
