import os
import joblib
import numpy as np
import tensorflow as tf
import re

BASE_DIR = os.path.dirname(__file__)
MODEL_DIR = os.path.join(BASE_DIR, "models")

# Load saved files
model = tf.keras.models.load_model(
    os.path.join(MODEL_DIR, "sentiment_model.keras")
)

vectorizer = joblib.load(
    os.path.join(MODEL_DIR, "tfidf_vectorizer.pkl")
)

label_encoder = joblib.load(
    os.path.join(MODEL_DIR, "label_encoder.pkl")
)


def clean_text(text: str):

    text = text.lower()

    text = re.sub(r"[^a-zA-Z ]", " ", text)

    text = re.sub(r"\s+", " ", text)

    return text.strip()


def predict_sentiment(review: str):

    review = clean_text(review)

    vector = vectorizer.transform([review])

    vector = vector.toarray()

    prediction = model.predict(vector, verbose=0)

    predicted_index = np.argmax(prediction)

    confidence = float(np.max(prediction))

    sentiment = label_encoder.inverse_transform([predicted_index])[0]

    return {
        "sentiment": sentiment,
        "confidence": round(confidence * 100, 2)
    }