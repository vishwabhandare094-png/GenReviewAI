import os
import resend
from app.database.supabase import supabase

resend.api_key = os.environ.get("RESEND_API_KEY", "")


def get_owner_email_for_restaurant(restaurant_id: str) -> str | None:
    """Look up the owner's email for a given restaurant directly via owner_id."""
    try:
        # Get the owner_id from the restaurant
        res = supabase.table("restaurants").select("owner_id, restaurant_name").eq("id", restaurant_id).single().execute()
        if not res.data:
            return None, None
        owner_id = res.data.get("owner_id")
        restaurant_name = res.data.get("restaurant_name", "Your Restaurant")

        if not owner_id:
            return None, restaurant_name

        # Get owner email from users
        user_res = supabase.table("users").select("email").eq("id", owner_id).single().execute()
        if not user_res.data:
            return None, restaurant_name

        return user_res.data.get("email"), restaurant_name
    except Exception as e:
        print(f"[Email] Error looking up owner email: {e}")
        return None, None


def send_new_review_notification(
    restaurant_id: str,
    customer_name: str,
    rating: int,
    review_text: str,
    sentiment: str,
    is_private: bool = False,
):
    """Send an email notification to the restaurant owner when a new review is received."""
    if not resend.api_key:
        print("[Email] RESEND_API_KEY not set. Skipping email notification.")
        return {"success": False, "message": "RESEND_API_KEY not configured"}

    try:
        owner_email, restaurant_name = get_owner_email_for_restaurant(restaurant_id)
        if not owner_email:
            print(f"[Email] No owner email found for restaurant {restaurant_id}. Skipping.")
            return {"success": False, "message": "No owner email found"}

        stars = "⭐" * rating + "☆" * (5 - rating)
        review_type = "Private Feedback" if is_private else "Public Review"
        sentiment_emoji = "😊" if sentiment == "positive" else "😔" if sentiment == "negative" else "😐"

        html_body = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background: #C0392B; padding: 24px; color: white;">
            <h1 style="margin: 0; font-size: 20px;">New {review_type} Received</h1>
            <p style="margin: 4px 0 0; opacity: 0.85;">{restaurant_name}</p>
          </div>
          <div style="padding: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 13px;">Customer</td>
                <td style="padding: 8px 0; font-weight: 600;">{customer_name or 'Anonymous'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 13px;">Rating</td>
                <td style="padding: 8px 0; font-size: 18px;">{stars} ({rating}/5)</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 13px;">Sentiment</td>
                <td style="padding: 8px 0;">{sentiment_emoji} {sentiment.capitalize()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 13px; vertical-align: top;">Review</td>
                <td style="padding: 8px 0; line-height: 1.6;">{review_text}</td>
              </tr>
            </table>
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; text-align: center;">
              <a href="https://genreviewai-frontend.onrender.com/dashboard" style="background: #C0392B; color: white; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-size: 14px;">View Dashboard</a>
            </div>
          </div>
          <div style="background: #f9f9f9; padding: 12px 24px; text-align: center; color: #999; font-size: 12px;">
            GenReviewAI — Powered by AI
          </div>
        </div>
        """

        params = {
            "from": "GenReviewAI <onboarding@resend.dev>",
            "to": [owner_email],
            "subject": f"New {review_type}: {stars} from {customer_name or 'Anonymous'} at {restaurant_name}",
            "html": html_body,
        }

        email_res = resend.Emails.send(params)
        print(f"[Email] Sent notification to {owner_email}: {email_res}")
        return {"success": True, "message": f"Email sent to {owner_email}", "id": str(email_res)}

    except Exception as e:
        print(f"[Email] Failed to send notification: {e}")
        return {"success": False, "message": str(e)}
