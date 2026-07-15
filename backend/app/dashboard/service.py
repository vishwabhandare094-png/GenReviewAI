from app.database.supabase import supabase


def get_dashboard_data(restaurant_id: str):

    # Fetch public reviews
    reviews_res = (
        supabase
        .table("reviews")
        .select("*")
        .eq("restaurant_id", restaurant_id)
        .execute()
    )
    reviews_data = reviews_res.data or []

    # Fetch private feedback
    feedback_res = (
        supabase
        .table("private_feedback")
        .select("*")
        .eq("restaurant_id", restaurant_id)
        .execute()
    )
    feedback_data = feedback_res.data or []

    # Merge datasets
    combined = []
    for r in reviews_data:
        combined.append({
            "customer_name": r.get("customer_name"),
            "rating": r.get("rating"),
            "review_text": r.get("review_text"),
            "sentiment": r.get("sentiment"),
            "created_at": r.get("created_at"),
            "is_private": False
        })
    for f in feedback_data:
        combined.append({
            "customer_name": f.get("customer_name"),
            "rating": f.get("rating"),
            "review_text": f.get("feedback_text"),
            "sentiment": f.get("sentiment"),
            "created_at": f.get("created_at"),
            "is_private": True
        })

    # Sort combined reviews by created_at desc
    combined.sort(key=lambda x: x.get("created_at") or "", reverse=True)

    total_reviews = len(combined)

    if total_reviews > 0:
        average_rating = round(
            sum(r.get("rating", 0) for r in combined)
            / total_reviews,
            2
        )
    else:
        average_rating = 0.0

    positive_reviews = sum(
        1 for r in combined
        if str(r.get("sentiment", "")).lower() == "positive"
    )

    negative_reviews = sum(
        1 for r in combined
        if str(r.get("sentiment", "")).lower() == "negative"
    )

    neutral_reviews = sum(
        1 for r in combined
        if str(r.get("sentiment", "")).lower() == "neutral"
    )

    recent_reviews = [
        {
            "customer_name": r.get("customer_name"),
            "rating": r.get("rating"),
            "review_text": r.get("review_text"),
            "sentiment": r.get("sentiment"),
            "is_private": r.get("is_private")
        }
        for r in combined[:5]
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