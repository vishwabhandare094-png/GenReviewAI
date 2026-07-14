from fastapi import APIRouter

from app.schemas.auth import RegisterRequest, LoginRequest
from app.auth.service import register_user, login_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register")
def register(request: RegisterRequest):
    return register_user(request)

@router.post("/login")
def login(request: LoginRequest):
    return login_user(request)