from pydantic import BaseModel, Field

from src.schemas.domain import Perfil


class LoginRequest(BaseModel):
    email: str
    password: str = Field(min_length=6)


class RegistroRequest(BaseModel):
    nombre: str = Field(min_length=1, max_length=120)
    email: str
    password: str = Field(min_length=6)


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    perfil: Perfil
