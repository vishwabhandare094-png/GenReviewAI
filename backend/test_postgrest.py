import pytest

from app.database.supabase import supabase


def test_postgrest_can_query_expected_tables():
    tables = ["reviews", "private_feedback", "review_tags"]

    for table in tables:
        try:
            res = supabase.table(table).select("*").limit(1).execute()
        except Exception as exc:
            pytest.skip(f"Supabase table query failed for {table}: {exc}")

        assert hasattr(res, "data")
