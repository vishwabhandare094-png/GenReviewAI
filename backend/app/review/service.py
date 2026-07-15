from app.database.supabase import supabase, resolve_restaurant_id
from app.ml.predictor import predict_sentiment


def _notify_owner(restaurant_id: str, customer_name: str, rating: int, text: str, sentiment: str, is_private: bool = False):
    """Fire-and-forget email notification to restaurant owner only if rating is under threshold (4.0)."""
    if rating >= 4:
        print(f"[Review] Rating {rating} is at or above threshold. Skipping email notification to owner.")
        return {"success": True, "skipped": True, "message": "Rating is above alert threshold"}
    try:
        from app.email.service import send_new_review_notification
        return send_new_review_notification(restaurant_id, customer_name, rating, text, sentiment, is_private)
    except Exception as e:
        print(f"[Review] Email notification failed (non-fatal): {e}")
        return {"success": False, "message": str(e)}


def submit_review(data):

    review_text = data.review_text.strip()

    if not review_text:
        return {
            "success": False,
            "message": "Review text cannot be empty"
        }

    prediction = predict_sentiment(review_text)

    sentiment = prediction["sentiment"]
    confidence = prediction["confidence"]

    restaurant_id = resolve_restaurant_id(data.restaurant_id)

    result = (
        supabase
        .table("reviews")
        .insert(
            {
                "restaurant_id": restaurant_id,
                "customer_name": data.customer_name,
                "rating": data.rating,
                "review_text": review_text,
                "sentiment": sentiment,
                "confidence": confidence,
                "ai_reply": None,
            }
        )
        .execute()
    )

    # Send email notification to owner (non-blocking)
    email_alert = _notify_owner(restaurant_id, data.customer_name, data.rating, review_text, sentiment, is_private=False)

    return {
        "success": True,
        "message": "Review Submitted Successfully",
        "prediction": prediction,
        "email_alert": email_alert,
        "data": result.data
    }


def submit_private_feedback(data):

    feedback_text = data.feedback_text.strip()

    if not feedback_text:
        return {
            "success": False,
            "message": "Feedback text cannot be empty"
        }

    prediction = predict_sentiment(feedback_text)

    sentiment = prediction["sentiment"]
    confidence = prediction["confidence"]

    restaurant_id = resolve_restaurant_id(data.restaurant_id)

    result = (
        supabase
        .table("private_feedback")
        .insert(
            {
                "restaurant_id": restaurant_id,
                "customer_name": data.customer_name,
                "rating": data.rating,
                "feedback_text": feedback_text,
                "sentiment": sentiment,
                "confidence": confidence,
            }
        )
        .execute()
    )

    # Send email notification to owner (non-blocking)
    email_alert = _notify_owner(restaurant_id, data.customer_name, data.rating, feedback_text, sentiment, is_private=True)

    return {
        "success": True,
        "message": "Private Feedback Submitted Successfully",
        "prediction": prediction,
        "email_alert": email_alert,
        "data": result.data
    }
