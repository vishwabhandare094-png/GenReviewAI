from app.database.supabase import supabase, resolve_restaurant_id


def get_tags(restaurant_id: str):

    restaurant_id = resolve_restaurant_id(restaurant_id)

    response = (
        supabase.table("review_tags")
        .select("*")
        .eq("restaurant_id", restaurant_id)
        .execute()
    )

    positive = []
    negative = []

    for tag in response.data:

        if tag["sentiment"] == "Positive":
            positive.append(tag["tag_name"])

        else:
            negative.append(tag["tag_name"])

    tags = positive + negative

    return {
        "positive": positive,
        "negative": negative,
        "tags": tags
    }