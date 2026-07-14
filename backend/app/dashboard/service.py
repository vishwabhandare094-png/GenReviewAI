from app.database.supabase import supabase


def get_dashboard_data(restaurant_id: str):

    response = (
        supabase
        .table("reviews")
        .select("*")
        .eq("restaurant_id", restaurant_id)
        .order("created_at", desc=True)
        .execute()
    )

    reviews = response.data or []

    total_reviews = len(reviews)

    if total_reviews > 0:
        average_rating = round(
            sum(review.get("rating", 0) for review in reviews)
            / total_reviews,
            2
        )
    else:
        average_rating = 0.0

    positive_reviews = sum(
        1 for review in reviews
        if str(review.get("sentiment", "")).lower() == "positive"
    )

    negative_reviews = sum(
        1 for review in reviews
        if str(review.get("sentiment", "")).lower() == "negative"
    )

    neutral_reviews = sum(
        1 for review in reviews
        if str(review.get("sentiment", "")).lower() == "neutral"
    )

    recent_reviews = [
        {
            "customer_name": review.get("customer_name"),
            "rating": review.get("rating"),
            "review_text": review.get("review_text"),
            "sentiment": review.get("sentiment")
        }
        for review in reviews[:5]
    ]

    return {
        "success": True,
        "metrics": {
            "total_reviews": total_reviews,
            "average_rating": average_rating,
            "positive_reviews": positive_reviews,
            "negative_reviews": negative_reviews,
            "neutral_reviews": neutral_reviews
        },
        "recent_reviews": recent_reviews
    }