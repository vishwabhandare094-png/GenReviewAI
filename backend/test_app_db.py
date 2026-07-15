import pytest

from app.database.supabase import supabase


def test_app_database_connection():
    try:
        res = supabase.table("users").select("*").limit(1).execute()
    except Exception as exc:
        pytest.skip(f"Database connection unavailable: {exc}")

    assert hasattr(res, "data")
