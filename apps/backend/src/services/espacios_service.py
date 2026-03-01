from src.repositories.espacios_repository import EspaciosRepository
from src.schemas.domain import Apartado, Espacio, EspacioDetalle, MiembroEspacio, Transaccion


class EspaciosService:
    def __init__(self) -> None:
        self.repository = EspaciosRepository()

    def get_espacios(self, perfil_id: str) -> list[Espacio]:
        rows = self.repository.list_espacios(perfil_id)
        return [Espacio.model_validate(row) for row in rows]

    def get_espacio_detalle(self, perfil_id: str, espacio_id: str) -> EspacioDetalle:
        espacio = Espacio.model_validate(self.repository.get_espacio(perfil_id, espacio_id))
        miembros = [
            MiembroEspacio.model_validate(row)
            for row in self.repository.list_miembros(perfil_id, espacio_id)
        ]
        apartados = [
            Apartado.model_validate(row)
            for row in self.repository.list_apartados(perfil_id, espacio_id)
        ]
        balance_total = self.repository.calculate_balance_total(perfil_id, espacio_id)

        return EspacioDetalle(
            **espacio.model_dump(),
            miembros=miembros,
            apartados=apartados,
            balance_total=balance_total,
        )

    def get_apartados(self, perfil_id: str, espacio_id: str) -> list[Apartado]:
        rows = self.repository.list_apartados(perfil_id, espacio_id)
        return [Apartado.model_validate(row) for row in rows]

    def get_transacciones(self, perfil_id: str, espacio_id: str) -> list[Transaccion]:
        rows = self.repository.list_transacciones(perfil_id, espacio_id)
        return [Transaccion.model_validate(row) for row in rows]

    def invite_member(self, perfil_id: str, espacio_id: str, email: str, rol: str) -> MiembroEspacio:
        row = self.repository.invite_member(perfil_id, espacio_id, email, rol)
        return MiembroEspacio.model_validate(row)
