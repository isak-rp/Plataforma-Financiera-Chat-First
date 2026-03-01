from fastapi import HTTPException, status

from src.db.supabase_client import get_supabase_anon_client
from src.repositories.perfiles_repository import PerfilesRepository
from src.schemas.auth import AuthResponse, LoginRequest, RegistroRequest
from src.schemas.domain import Perfil


class AuthService:
    def __init__(self) -> None:
        self.anon_client = get_supabase_anon_client()
        self.perfiles_repository = PerfilesRepository()

    def login(self, payload: LoginRequest) -> AuthResponse:
        try:
            auth_response = self.anon_client.auth.sign_in_with_password(
                {"email": payload.email, "password": payload.password}
            )
        except Exception as exc:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales invalidas") from exc

        session = getattr(auth_response, "session", None)
        user = getattr(auth_response, "user", None)
        if not session or not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales invalidas")

        perfil = Perfil.model_validate(self.perfiles_repository.get_by_id(str(user.id)))
        return AuthResponse(access_token=str(session.access_token), perfil=perfil)

    def registro(self, payload: RegistroRequest) -> AuthResponse:
        try:
            auth_response = self.anon_client.auth.sign_up(
                {
                    "email": payload.email,
                    "password": payload.password,
                    "options": {"data": {"nombre": payload.nombre}},
                }
            )
        except Exception as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fue posible crear la cuenta") from exc

        session = getattr(auth_response, "session", None)
        user = getattr(auth_response, "user", None)
        if not user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fue posible crear la cuenta")

        # If email confirmation is required, session can be None.
        if not session:
            # Try immediate login fallback.
            return self.login(LoginRequest(email=payload.email, password=payload.password))

        perfil = Perfil.model_validate(self.perfiles_repository.get_by_id(str(user.id)))
        return AuthResponse(access_token=str(session.access_token), perfil=perfil)
