from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.auth.router import router as auth_router
from app.restaurant.router import router as restaurant_router
from app.qr.router import router as qr_router
from app.review.router import router as review_router
from app.tags.router import router as tags_router
from app.ai.router import router as ai_router
from app.dashboard.router import router as dashboard_router
from app.rag.router import router as rag_router
from app.analytics.router import router as analytics_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="GenReviewAI API",
    version="1.0.0",
    description="AI Powered Review Management System"
)

<<<<<<< HEAD
# ==========================
# CORS Configuration
# ==========================
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]
=======
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

>>>>>>> 3314ed63acc16a44553802543ba3e3b9bae72c2b

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
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
from fastapi.staticfiles import StaticFiles

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

