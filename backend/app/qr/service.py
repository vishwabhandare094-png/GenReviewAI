import os
import uuid
import qrcode

from app.database.supabase import supabase


UPLOAD_DIR = "uploads/qr"

os.makedirs(UPLOAD_DIR, exist_ok=True)


def generate_qr(restaurant_id: str):

    short_code = str(uuid.uuid4())[:8].upper()

    review_url = f"http://localhost:3000/review/{short_code}"

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
        "message": "QR Generated Successfully",
        "short_code": short_code,
        "review_url": review_url,
        "qr_path": filepath
    }