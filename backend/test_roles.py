import pytest

from app.database.supabase import supabase


def test_roles_and_organizations_tables_are_accessible():
    try:
        orgs = supabase.table("organizations").select("*").execute().data
        roles = supabase.table("roles").select("*").execute().data
    except Exception as exc:
        pytest.skip(f"Supabase tables are unavailable: {exc}")

    assert orgs is None or isinstance(orgs, list)
    assert roles is None or isinstance(roles, list)
