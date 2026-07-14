from dotenv import load_dotenv
import os

load_dotenv()

class Settings:
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL")
    MODEL_NAME = os.getenv("MODEL_NAME")

settings = Settings()