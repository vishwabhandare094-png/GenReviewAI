import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

if not url or not key:
    raise Exception("Supabase credentials are missing in .env")

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