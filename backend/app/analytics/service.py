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


def get_ai_insights_service(restaurant_id: str):
    import json
    from app.ai.gemini import generate_insights
    from app.database.supabase import resolve_restaurant_id

    resolved_id = resolve_restaurant_id(restaurant_id)

    # Fetch public reviews
    reviews_res = (
        supabase
        .table("reviews")
        .select("rating, review_text")
        .eq("restaurant_id", resolved_id)
        .execute()
    )
    reviews_data = reviews_res.data or []

    # Fetch private feedback
    feedback_res = (
        supabase
        .table("private_feedback")
        .select("rating, feedback_text")
        .eq("restaurant_id", resolved_id)
        .execute()
    )
    feedback_data = feedback_res.data or []

    if not reviews_data and not feedback_data:
        return {
            "success": True,
            "insights": [
                {
                    "title": "Welcome to AI Insights!",
                    "description": "Once your customers start using the QR code to leave reviews and private feedback, Gemini will analyze their sentiments and provide actionable business recommendations here.",
                    "priority": "medium"
                }
            ]
        }

    # Format feedback text for prompt
    text_data = []
    for idx, r in enumerate(reviews_data):
        text_data.append(f"Public Review {idx+1}: Rating: {r.get('rating')}/5, Text: {r.get('review_text') or 'No comments'}")
    for idx, f in enumerate(feedback_data):
        text_data.append(f"Private Feedback {idx+1}: Rating: {f.get('rating')}/5, Text: {f.get('feedback_text') or 'No comments'}")

    feedback_summary = "\n".join(text_data)

    prompt = f"""
You are an expert restaurant consultant and hospitality business analyst.
You are analyzing recent customer reviews and private feedback for a restaurant.

Customer Reviews and Feedback:
{feedback_summary}

Tasks:
1. Point out positive patterns and critical complaints from the feedback.
2. Generate exactly 3 highly specific, practical, and actionable business recommendations for the owner to improve their rating and customer satisfaction.
3. For each recommendation, provide:
   - "title" (3-6 words, clear and direct)
   - "description" (20-45 words, detailing what to change based on the comments)
   - "priority" (either "high", "medium", or "low" based on the frequency and severity of the issue)

Return your response strictly as a JSON array of objects.
Do not wrap it in markdown code blocks like ```json ... ```. Do not include any introductory or concluding text.

Example output:
[
  {{"title": "Improve Billing Speed", "description": "Multiple customers mentioned long queues at the counter. Consider adding another billing screen or training staff on quick payment processing during peak dinner hours.", "priority": "high"}}
]
"""

    response = generate_insights(prompt).strip()
    
    # Strip markdown formatting if the model returned it anyway
    if response.startswith("```json"):
        response = response[7:]
    if response.endswith("```"):
        response = response[:-3]
    response = response.strip()

    try:
        insights = json.loads(response)
        if not isinstance(insights, list):
            insights = []
    except Exception as e:
        print(f"Error parsing AI insights JSON: {e}. Raw response: {response}")
        # Fallback recommendations if JSON parsing fails
        insights = [
            {
                "title": "Action Low Ratings Quickly",
                "description": "Follow up on recent private feedback submissions to resolve issues before customers leave public negative reviews.",
                "priority": "high"
            },
            {
                "title": "Update Menu Context",
                "description": "Ensure your RAG knowledge base is up to date with your latest menu and specials to improve AI review draft relevance.",
                "priority": "medium"
            },
            {
                "title": "Promote Review QR Cards",
                "description": "Remind staff to direct happy customers to scan the table QR cards at the end of their meal to boost Google ratings.",
                "priority": "low"
            }
        ]

    return {
        "success": True,
        "insights": insights
    }