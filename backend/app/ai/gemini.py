import os
import time
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

def generate_review(prompt: str):

    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model="models/gemini-flash-latest",
                contents=prompt
            )
            return response.text

        except Exception as e:
            print(f"Attempt {attempt+1}: {e}")
            time.sleep(3)

    raise Exception("Gemini API unavailable after 3 retries.")