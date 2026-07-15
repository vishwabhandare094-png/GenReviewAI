import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

# Load .env from the backend directory (works locally and on Render)
_env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(_env_path)
load_dotenv()  # also try cwd .env as fallback

# ────────────────────────────────────────────────────────────────────────────
# Correct Supabase project (new project: sxqeciffmnujffwxasal)
# These defaults are used ONLY if env vars are missing or point to old project
# ────────────────────────────────────────────────────────────────────────────
_CORRECT_URL  = "https://sxqeciffmnujffwxasal.supabase.co"
_CORRECT_ANON = "sb_publishable_lRrduNLfmdvZq95ELb4bdw_gIlQ_MYO"

url = os.getenv("SUPABASE_URL") or _CORRECT_URL
key = (
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    or os.getenv("SUPABASE_KEY")
    or os.getenv("SUPABASE_ANON_KEY")
    or _CORRECT_ANON
)

# If Render still has the OLD project URL → override with the correct one
if url and "dggxhpnyvhildunxrebo" in url:
    print("[DB] ⚠️  Stale env var detected — overriding with correct Supabase project.")
    url = _CORRECT_URL
    key = os.getenv("SUPABASE_ANON_KEY") or _CORRECT_ANON

print(f"[DB] ✅ Connecting to: {url[:48]}...")
supabase: Client = create_client(url, key)


def resolve_restaurant_id(restaurant_id: str) -> str:
    if not restaurant_id:
        return restaurant_id
    # If it is not a full UUID (UUID is 36 chars), resolve from short_code
    if len(restaurant_id) < 36:
        try:
            res = supabase.table("restaurants").select("id").eq("short_code", restaurant_id.upper()).execute()
            if res.data:
                return res.data[0]["id"]
        except Exception as e:
            print(f"Error resolving short code {restaurant_id}: {e}")
    return restaurant_id