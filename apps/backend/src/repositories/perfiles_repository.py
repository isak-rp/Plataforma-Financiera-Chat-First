from fastapi import HTTPException, status

from src.db.supabase_client import get_supabase_service_client


class PerfilesRepository:
    def __init__(self) -> None:
        self.client = get_supabase_service_client()

    def get_by_id(self, perfil_id: str) -> dict:
        response = self.client.table("perfiles").select("*").eq("id", perfil_id).limit(1).execute()
        if not response.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
        return response.data[0]
