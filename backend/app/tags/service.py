from app.database.supabase import supabase


def get_tags(restaurant_id: str):

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

    return {
        "positive": positive,
        "negative": negative
    }