from collections import Counter

from app.database.supabase import supabase


def get_analytics_data(restaurant_id: str):

    result = (
        supabase
        .table("reviews")
        .select("*")
        .eq("restaurant_id", restaurant_id)
        .execute()
    )

    reviews = result.data or []

    total_reviews = len(reviews)

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

    for review in reviews:

        rating = review.get("rating")

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

    for review in reviews:

        sentiment = review.get("sentiment")

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

    unclassified_reviews = total_reviews - classified_reviews

    if classified_reviews > 0:

        positive_percentage = round(
            (
                sentiment_distribution["positive"]
                / classified_reviews
            ) * 100,
            2
        )

        negative_percentage = round(
            (
                sentiment_distribution["negative"]
                / classified_reviews
            ) * 100,
            2
        )

        neutral_percentage = round(
            (
                sentiment_distribution["neutral"]
                / classified_reviews
            ) * 100,
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

    for review in reviews:

        created_at = review.get("created_at")

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