import pytest

from app.database.supabase import supabase
from app.qr.service import generate_qr, get_qr_image_stream


def test_qr_generation_and_stream_for_existing_restaurant():
    try:
        res = supabase.table("restaurants").select("id, restaurant_name, short_code").limit(1).execute()
    except Exception as exc:
        pytest.skip(f"Supabase is unavailable for QR testing: {exc}")

    if not res.data:
        pytest.skip("No restaurants found for QR testing")

    restaurant = res.data[0]
    result = generate_qr(restaurant["id"], force_reset=False)
    assert result.get("short_code")
    assert result.get("stable") in (True, False)

    stream = get_qr_image_stream(result["short_code"])
    data = stream.read()
    assert data[:8] == b"\x89PNG\r\n\x1a\n"
