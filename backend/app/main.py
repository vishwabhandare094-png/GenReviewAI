import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from app.auth.router import router as auth_router
from app.restaurant.router import router as restaurant_router
from app.qr.router import router as qr_router
from app.review.router import router as review_router
from app.tags.router import router as tags_router
from app.ai.router import router as ai_router
from app.dashboard.router import router as dashboard_router
from app.rag.router import router as rag_router
from app.analytics.router import router as analytics_router

app = FastAPI(
    title="GenReviewAI API",
    version="1.0.0",
    description="AI Powered Review Management System"
)

# ==========================
# Global Exception Handler
# (ensures errors always return JSON with CORS headers)
# ==========================
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"[GLOBAL ERROR] {request.method} {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": f"Internal server error: {str(exc)}"},
    )


# ==========================
# CORS Configuration
# ==========================
# Allow all origins (wildcard) to prevent CORS blocks on Render.
# Specific origins are also listed for security on production rotations.
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "https://genreviewai-frontend.onrender.com",
    "https://genreviewai-1.onrender.com",
]

# Allow additional origins from environment variable
extra_origins = os.environ.get("CORS_ORIGINS", "")
if extra_origins:
    origins.extend([o.strip() for o in extra_origins.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================
# Home Route
# ==========================
@app.get("/")
def home():
    return {
        "status": "success",
        "message": "GenReviewAI Backend Running 🚀"
    }

@app.get("/health")
def health():
    """Check which environment variables are loaded on this server."""
    def configured(name: str) -> str:
        return "configured" if os.environ.get(name, "").strip() else "missing"

    return {
        "status": "ok",
        "env": {
            "SUPABASE_URL": configured("SUPABASE_URL"),
            "SUPABASE_ANON_KEY": configured("SUPABASE_ANON_KEY"),
            "SUPABASE_SERVICE_ROLE_KEY": configured("SUPABASE_SERVICE_ROLE_KEY"),
            "GEMINI_API_KEY": configured("GEMINI_API_KEY"),
            "RESEND_API_KEY": configured("RESEND_API_KEY"),
        }
    }

# ==========================
# API Routers
# ==========================
app.include_router(auth_router)
app.include_router(restaurant_router)
app.include_router(qr_router)
app.include_router(review_router)
app.include_router(tags_router)
app.include_router(ai_router)
app.include_router(dashboard_router)
app.include_router(rag_router)
app.include_router(analytics_router)


# ==========================
# Static Files
# ==========================
app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

