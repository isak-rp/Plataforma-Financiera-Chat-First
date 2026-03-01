import base64
import json
from dataclasses import dataclass

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from src.core.config import settings
from src.db.supabase_client import get_supabase_anon_client

bearer_scheme = HTTPBearer(auto_error=True)


@dataclass
class CurrentUser:
    id: str
    token: str


def _decode_jwt_sub_unverified(token: str) -> str | None:
    try:
        payload = token.split(".")[1]
        padding = "=" * (-len(payload) % 4)
        decoded = base64.urlsafe_b64decode(payload + padding).decode("utf-8")
        claims = json.loads(decoded)
        sub = claims.get("sub")
        return str(sub) if sub else None
    except Exception:
        return None


def _verify_token_with_supabase(token: str) -> str | None:
    try:
        client = get_supabase_anon_client()
        response = client.auth.get_user(token)
        user = getattr(response, "user", None)
        if user and getattr(user, "id", None):
            return str(user.id)
    except Exception:
        return None
    return None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> CurrentUser:
    token = credentials.credentials
    user_id = _verify_token_with_supabase(token)

    # Development fallback when Supabase auth is not available yet.
    if not user_id and settings.env == "development":
        if token.startswith("dev-user:"):
            user_id = token.split(":", 1)[1].strip() or None
        if not user_id:
            user_id = _decode_jwt_sub_unverified(token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
        )

    return CurrentUser(id=user_id, token=token)
