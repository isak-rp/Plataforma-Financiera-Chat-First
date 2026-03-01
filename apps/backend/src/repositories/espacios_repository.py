import unicodedata
from datetime import datetime

from fastapi import HTTPException, status

from src.db.supabase_client import get_supabase_service_client

CATEGORY_SYNONYMS: dict[str, list[str]] = {
    "comida": ["comida", "despensa", "super", "supermercado", "restaurante", "almuerzo", "cena"],
    "transporte": ["transporte", "uber", "taxi", "gasolina", "camion", "autobus"],
    "renta": ["renta", "alquiler", "arrendamiento"],
    "entretenimiento": ["entretenimiento", "ocio", "cine", "streaming", "netflix"],
    "servicios": ["servicios", "luz", "agua", "internet", "telefono"],
}


class EspaciosRepository:
    def __init__(self) -> None:
        self.client = get_supabase_service_client()

    def _normalize(self, text: str) -> str:
        normalized = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
        return normalized.strip().lower()

    def _get_member_space_ids(self, perfil_id: str) -> list[str]:
        response = (
            self.client.table("miembros_espacio")
            .select("espacio_id")
            .eq("perfil_id", perfil_id)
            .eq("activo", True)
            .execute()
        )
        return [row["espacio_id"] for row in (response.data or [])]

    def is_member(self, perfil_id: str, espacio_id: str) -> bool:
        response = (
            self.client.table("miembros_espacio")
            .select("id")
            .eq("perfil_id", perfil_id)
            .eq("espacio_id", espacio_id)
            .eq("activo", True)
            .limit(1)
            .execute()
        )
        return bool(response.data)

    def is_admin(self, perfil_id: str, espacio_id: str) -> bool:
        response = (
            self.client.table("miembros_espacio")
            .select("id")
            .eq("perfil_id", perfil_id)
            .eq("espacio_id", espacio_id)
            .eq("activo", True)
            .in_("rol", ["propietario", "administrador"])
            .limit(1)
            .execute()
        )
        return bool(response.data)

    def list_espacios(self, perfil_id: str) -> list[dict]:
        ids = self._get_member_space_ids(perfil_id)
        if not ids:
            return []

        response = self.client.table("espacios").select("*").in_("id", ids).execute()
        return response.data or []

    def get_espacio(self, perfil_id: str, espacio_id: str) -> dict:
        if not self.is_member(perfil_id, espacio_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No access to workspace")

        response = self.client.table("espacios").select("*").eq("id", espacio_id).limit(1).execute()
        if not response.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")
        return response.data[0]

    def list_apartados(self, perfil_id: str, espacio_id: str) -> list[dict]:
        if not self.is_member(perfil_id, espacio_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No access to workspace")

        response = (
            self.client.table("apartados")
            .select("*")
            .eq("espacio_id", espacio_id)
            .eq("activo", True)
            .order("orden")
            .execute()
        )
        return response.data or []

    def list_miembros(self, perfil_id: str, espacio_id: str) -> list[dict]:
        if not self.is_member(perfil_id, espacio_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No access to workspace")

        response = (
            self.client.table("miembros_espacio")
            .select("*")
            .eq("espacio_id", espacio_id)
            .eq("activo", True)
            .execute()
        )
        return response.data or []

    def list_transacciones(self, perfil_id: str, espacio_id: str) -> list[dict]:
        if not self.is_member(perfil_id, espacio_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No access to workspace")

        response = (
            self.client.table("transacciones")
            .select("*")
            .eq("espacio_id", espacio_id)
            .order("fecha", desc=True)
            .execute()
        )
        return response.data or []

    def calculate_balance_total(self, perfil_id: str, espacio_id: str) -> float:
        transactions = self.list_transacciones(perfil_id, espacio_id)
        total = 0.0
        for txn in transactions:
            amount = float(txn.get("monto") or 0)
            if txn.get("tipo") == "ingreso":
                total += amount
            else:
                total -= amount
        return total

    def _transaction_frequency_by_apartado(self, perfil_id: str, espacio_id: str) -> dict[str, int]:
        response = (
            self.client.table("transacciones")
            .select("apartado_id")
            .eq("espacio_id", espacio_id)
            .eq("perfil_id", perfil_id)
            .execute()
        )

        frequencies: dict[str, int] = {}
        for row in (response.data or []):
            apartado_id = str(row.get("apartado_id"))
            if not apartado_id:
                continue
            frequencies[apartado_id] = frequencies.get(apartado_id, 0) + 1
        return frequencies

    def find_apartado_by_name(self, perfil_id: str, espacio_id: str, nombre: str) -> dict | None:
        apartados = self.list_apartados(perfil_id, espacio_id)
        if not apartados:
            return None

        normalized = self._normalize(nombre)
        synonym_bucket = [normalized]
        for canonical, aliases in CATEGORY_SYNONYMS.items():
            normalized_aliases = [self._normalize(alias) for alias in aliases]
            if normalized in normalized_aliases or normalized == self._normalize(canonical):
                synonym_bucket = [self._normalize(canonical), *normalized_aliases]
                break

        exact_matches: list[dict] = []
        contains_matches: list[dict] = []
        synonym_matches: list[dict] = []

        for apartado in apartados:
            apartado_name = self._normalize(str(apartado.get("nombre", "")))
            if apartado_name == normalized:
                exact_matches.append(apartado)
                continue
            if normalized and normalized in apartado_name:
                contains_matches.append(apartado)
                continue
            if any(alias and alias in apartado_name for alias in synonym_bucket):
                synonym_matches.append(apartado)

        candidates = exact_matches or contains_matches or synonym_matches or apartados
        if len(candidates) == 1:
            return candidates[0]

        frequencies = self._transaction_frequency_by_apartado(perfil_id, espacio_id)
        candidates.sort(key=lambda item: frequencies.get(str(item.get("id")), 0), reverse=True)
        return candidates[0]

    def invite_member(self, perfil_id: str, espacio_id: str, email: str, rol: str) -> dict:
        if not self.is_admin(perfil_id, espacio_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to invite members")

        perfil_response = self.client.table("perfiles").select("id").eq("email", email).limit(1).execute()
        if not perfil_response.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Perfil not found for provided email")

        invited_perfil_id = perfil_response.data[0]["id"]

        existing = (
            self.client.table("miembros_espacio")
            .select("*")
            .eq("espacio_id", espacio_id)
            .eq("perfil_id", invited_perfil_id)
            .limit(1)
            .execute()
        )

        if existing.data:
            updated = (
                self.client.table("miembros_espacio")
                .update({"rol": rol, "activo": True})
                .eq("id", existing.data[0]["id"])
                .execute()
            )
            return updated.data[0]

        inserted = (
            self.client.table("miembros_espacio")
            .insert(
                {
                    "espacio_id": espacio_id,
                    "perfil_id": invited_perfil_id,
                    "rol": rol,
                    "invitado_en": datetime.utcnow().isoformat(),
                    "aceptado_en": None,
                    "activo": True,
                }
            )
            .execute()
        )
        return inserted.data[0]

    def create_espacio(self, perfil_id: str, nombre: str, tipo: str, descripcion: str, icono: str):
        data = {
            "nombre": nombre,
            "tipo": tipo,
            "descripcion": descripcion,
            "icono": icono,
            "creador_id": perfil_id,
            "estado": "activo"
        }
        
        result = self.client.table("espacios").insert(data).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Error al crear el espacio")
            
        nuevo_espacio = result.data[0]
        
        self.client.table("miembros_espacio").insert({
            "espacio_id": nuevo_espacio["id"],
            "perfil_id": perfil_id,
            "rol": "administrador",
            "activo": True
        }).execute()
        
        return nuevo_espacio