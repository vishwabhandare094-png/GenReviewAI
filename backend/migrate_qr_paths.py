"""
Migration: update all restaurants that still have old local-disk QR paths
(uploads/qr/*.png) to the new stateless dynamic path (qr/image/{code}.png).
"""
from app.database.supabase import supabase

res = supabase.table("restaurants").select("id, restaurant_name, short_code, qr_code_url").execute()
restaurants = res.data or []

print(f"Found {len(restaurants)} restaurant(s) to check.\n")

updated = 0
for r in restaurants:
    rid = r["id"]
    name = r["restaurant_name"]
    sc = r.get("short_code")
    current_url = r.get("qr_code_url") or ""

    if not sc:
        print(f"  SKIP  {name} — no short_code assigned")
        continue

    new_url = f"qr/image/{sc}.png"

    if current_url == new_url:
        print(f"  OK    {name} ({sc}) — already using dynamic path")
        continue

    # Migrate
    supabase.table("restaurants").update({"qr_code_url": new_url}).eq("id", rid).execute()
    print(f"  FIXED {name} ({sc}) : '{current_url}' → '{new_url}'")
    updated += 1

print(f"\n✅ Migration complete. {updated} record(s) updated.")
