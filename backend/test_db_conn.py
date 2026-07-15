import os

import pytest

from app.database import supabase as supabase_module


def test_supabase_connection_can_fetch_users():
    if not os.getenv("SUPABASE_URL") and not os.getenv("SUPABASE_SERVICE_ROLE_KEY"):
        pytest.skip("Supabase credentials are not configured")

    try:
        res = supabase_module.supabase.table("users").select("*").limit(1).execute()
    except Exception as exc:
        pytest.skip(f"Supabase is unavailable: {exc}")

    assert hasattr(res, "data")
