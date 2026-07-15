from collections import Counter

from app.database.supabase import supabase


def get_analytics_data(restaurant_id: str):

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
            "rating": r.get("rating"),
            "sentiment": r.get("sentiment"),
            "created_at": r.get("created_at")
        })
    for f in feedback_data:
        combined.append({
            "rating": f.get("rating"),
            "sentiment": f.get("sentiment"),
            "created_at": f.get("created_at")
        })

    total_reviews = len(combined)

    # -----------------------------
    # Rating Distribution
    # -----------------------------

    rating_distribution = {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0
    }

    for item in combined:
        rating = item.get("rating")
        if rating is not None:
            rating_key = str(rating)
            if rating_key in rating_distribution:
                rating_distribution[rating_key] += 1

    # -----------------------------
    # Sentiment Distribution
    # -----------------------------

    sentiment_distribution = {
        "positive": 0,
        "negative": 0,
        "neutral": 0
    }

    for item in combined:
        sentiment = item.get("sentiment")
        if sentiment:
            sentiment_key = sentiment.lower()
            if sentiment_key in sentiment_distribution:
                sentiment_distribution[sentiment_key] += 1

    # -----------------------------
    # Sentiment Percentages
    # -----------------------------

    classified_reviews = (
        sentiment_distribution["positive"]
        + sentiment_distribution["negative"]
        + sentiment_distribution["neutral"]
    )

    if classified_reviews > 0:
        positive_percentage = round(
            (sentiment_distribution["positive"] / classified_reviews) * 100,
            2
        )
        negative_percentage = round(
            (sentiment_distribution["negative"] / classified_reviews) * 100,
            2
        )
        neutral_percentage = round(
            (sentiment_distribution["neutral"] / classified_reviews) * 100,
            2
        )
    else:
        positive_percentage = 0
        negative_percentage = 0
        neutral_percentage = 0

    # -----------------------------
    # Review Trend
    # -----------------------------

    review_dates = []
    for item in combined:
        created_at = item.get("created_at")
        if created_at:
            review_dates.append(created_at[:10])

    date_counts = Counter(review_dates)

    review_trend = [
        {
            "date": date,
            "reviews": count
        }
        for date, count in sorted(date_counts.items())
    ]

    return {
        "success": True,
        "total_reviews": total_reviews,
        "rating_distribution": rating_distribution,
        "sentiment_distribution": sentiment_distribution,
        "sentiment_percentage": {
            "positive": positive_percentage,
            "negative": negative_percentage,
            "neutral": neutral_percentage
        },
        "review_trend": review_trend
    }