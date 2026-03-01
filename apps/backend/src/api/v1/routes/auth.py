from fastapi import APIRouter

from src.schemas.auth import AuthResponse, LoginRequest, RegistroRequest
from src.services.auth_service import AuthService

router = APIRouter(tags=["auth"])


@router.post("/auth/login", response_model=AuthResponse)
async def login(payload: LoginRequest) -> AuthResponse:
    service = AuthService()
    return service.login(payload)


@router.post("/auth/registro", response_model=AuthResponse)
async def registro(payload: RegistroRequest) -> AuthResponse:
    service = AuthService()
    return service.registro(payload)
