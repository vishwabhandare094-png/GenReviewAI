from app.database.supabase import supabase
from app.ml.predictor import predict_sentiment


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

    result = (
        supabase
        .table("reviews")
        .insert(
            {
                "restaurant_id": str(data.restaurant_id),
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

    return {
        "success": True,
        "message": "Review Submitted Successfully",
        "prediction": prediction,
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

    result = (
        supabase
        .table("private_feedback")
        .insert(
            {
                "restaurant_id": str(data.restaurant_id),
                "customer_name": data.customer_name,
                "rating": data.rating,
                "feedback_text": feedback_text,
                "sentiment": sentiment,
                "confidence": confidence,
            }
        )
        .execute()
    )

    return {
        "success": True,
        "message": "Private Feedback Submitted Successfully",
        "prediction": prediction,
        "data": result.data
    }