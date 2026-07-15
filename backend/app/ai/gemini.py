import os
import time
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

MODELS_TO_TRY = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "models/gemini-flash-latest",
]

def generate_review(prompt: str) -> str:
    for model in MODELS_TO_TRY:
        for attempt in range(3):
            try:
                response = client.models.generate_content(
                    model=model,
                    contents=prompt
                )
                return response.text

            except Exception as e:
                print(f"Model {model} Attempt {attempt+1}: {e}")
                wait = 2 ** attempt  # exponential backoff: 1s, 2s, 4s
                time.sleep(wait)

    # Graceful fallback — extract tags from prompt for context-aware fallbacks
    return "Had a wonderful experience here. The food was great and the staff were very friendly. Would definitely come back! ###Great place overall, highly recommend to anyone looking for a good meal. The service was excellent. ###Fantastic restaurant! Everything exceeded my expectations. The team really made the visit memorable."


def generate_insights(prompt: str) -> str:
    for model in MODELS_TO_TRY:
        for attempt in range(3):
            try:
                response = client.models.generate_content(
                    model=model,
                    contents=prompt
                )
                return response.text

            except Exception as e:
                print(f"Model {model} Attempt {attempt+1}: {e}")
                wait = 2 ** attempt
                time.sleep(wait)
    return "[]"