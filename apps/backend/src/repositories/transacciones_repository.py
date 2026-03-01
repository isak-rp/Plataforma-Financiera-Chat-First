from fastapi import HTTPException, status

from src.db.supabase_client import get_supabase_service_client


class TransaccionesRepository:
    def __init__(self) -> None:
        self.client = get_supabase_service_client()

    def get_by_id(self, transaccion_id: str) -> dict:
        response = (
            self.client.table("transacciones")
            .select("*")
            .eq("id", transaccion_id)
            .limit(1)
            .execute()
        )
        if not response.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
        return response.data[0]

    def create(self, payload: dict) -> dict:
        response = self.client.table("transacciones").insert(payload).execute()
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not create transaction",
            )
        return response.data[0]

    def update_estado(self, transaccion_id: str, estado: str) -> dict:
        response = (
            self.client.table("transacciones")
            .update({"estado": estado})
            .eq("id", transaccion_id)
            .execute()
        )
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not update transaction status",
            )
        return response.data[0]
