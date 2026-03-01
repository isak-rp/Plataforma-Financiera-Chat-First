from functools import lru_cache

from fastapi import HTTPException, status
from supabase import Client, create_client

from src.core.config import settings


@lru_cache(maxsize=1)
def get_supabase_anon_client() -> Client:
    if not settings.supabase_url or not settings.supabase_anon_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase anon client is not configured",
        )
    return create_client(settings.supabase_url, settings.supabase_anon_key)


@lru_cache(maxsize=1)
def get_supabase_service_client() -> Client:
    key = settings.supabase_service_role_key or settings.supabase_anon_key
    if not settings.supabase_url or not key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase service client is not configured",
        )
    return create_client(settings.supabase_url, key)
