import os
import re

BASE_DIR = os.path.dirname(__file__)
MODEL_DIR = os.path.join(BASE_DIR, "models")

model = None
vectorizer = None
label_encoder = None
model_load_error = None


def _load_model_files():
    global model, vectorizer, label_encoder, model_load_error
    if model is not None and vectorizer is not None and label_encoder is not None:
        return True
    if model_load_error is not None:
        return False

    try:
        import joblib
        import tensorflow as tf

        model = tf.keras.models.load_model(
            os.path.join(MODEL_DIR, "sentiment_model.keras")
        )
        vectorizer = joblib.load(
            os.path.join(MODEL_DIR, "tfidf_vectorizer.pkl")
        )
        label_encoder = joblib.load(
            os.path.join(MODEL_DIR, "label_encoder.pkl")
        )
        return True
    except Exception as e:
        model_load_error = str(e)
        print(f"[ML] Sentiment model unavailable, using keyword fallback: {e}")
        return False


def clean_text(text: str):

    text = text.lower()

    text = re.sub(r"[^a-zA-Z ]", " ", text)

    text = re.sub(r"\s+", " ", text)

    return text.strip()


def predict_sentiment(review: str):

    review = clean_text(review)

    if not _load_model_files():
        negative_words = {"bad", "slow", "poor", "cold", "rude", "dirty", "worst", "terrible", "awful", "disappointed"}
        positive_words = {"good", "great", "excellent", "amazing", "friendly", "fast", "clean", "best", "delicious", "happy"}
        words = set(review.split())
        if words & negative_words:
            sentiment = "negative"
        elif words & positive_words:
            sentiment = "positive"
        else:
            sentiment = "neutral"
        return {
            "sentiment": sentiment,
            "confidence": 50.0,
            "fallback": True,
        }

    vector = vectorizer.transform([review])

    vector = vector.toarray()

    prediction = model.predict(vector, verbose=0)

    import numpy as np

    predicted_index = np.argmax(prediction)

    confidence = float(np.max(prediction))

    sentiment = label_encoder.inverse_transform([predicted_index])[0]

    return {
        "sentiment": sentiment,
        "confidence": round(confidence * 100, 2)
    }
