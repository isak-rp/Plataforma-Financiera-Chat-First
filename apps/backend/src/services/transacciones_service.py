from datetime import date

from fastapi import HTTPException, status

from src.repositories.espacios_repository import EspaciosRepository
from src.repositories.transacciones_repository import TransaccionesRepository
from src.schemas.domain import EstadoTransaccion, Transaccion
from src.schemas.transacciones import CrearTransaccionRequest

ALLOWED_TRANSITIONS: dict[EstadoTransaccion, set[EstadoTransaccion]] = {
    EstadoTransaccion.pendiente: {EstadoTransaccion.aceptada, EstadoTransaccion.rechazada},
    EstadoTransaccion.aceptada: {EstadoTransaccion.liquidada},
    EstadoTransaccion.confirmada: {EstadoTransaccion.liquidada},
    EstadoTransaccion.rechazada: set(),
    EstadoTransaccion.liquidada: set(),
}


class TransaccionesService:
    def __init__(self) -> None:
        self.espacios_repository = EspaciosRepository()
        self.transacciones_repository = TransaccionesRepository()

    def create_transaccion(self, perfil_id: str, payload: CrearTransaccionRequest) -> Transaccion:
        if not self.espacios_repository.is_member(perfil_id, payload.espacio_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No access to workspace")

        estado = "pendiente" if payload.dividido_entre else "confirmada"

        transaccion = self.transacciones_repository.create(
            {
                "apartado_id": payload.apartado_id,
                "espacio_id": payload.espacio_id,
                "perfil_id": perfil_id,
                "tipo": payload.tipo.value,
                "estado": estado,
                "monto": payload.monto,
                "descripcion": payload.descripcion,
                "texto_original": payload.texto_original,
                "dividido_entre": payload.dividido_entre,
                "fecha": str(date.today()),
            }
        )
        return Transaccion.model_validate(transaccion)

    def update_estado(self, perfil_id: str, transaccion_id: str, nuevo_estado: EstadoTransaccion) -> Transaccion:
        current = self.transacciones_repository.get_by_id(transaccion_id)
        espacio_id = str(current["espacio_id"])

        if not self.espacios_repository.is_member(perfil_id, espacio_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No access to workspace")

        is_owner = str(current["perfil_id"]) == perfil_id
        is_admin = self.espacios_repository.is_admin(perfil_id, espacio_id)
        if not is_owner and not is_admin:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to update transaction")

        estado_actual = EstadoTransaccion(str(current["estado"]))
        if nuevo_estado not in ALLOWED_TRANSITIONS[estado_actual]:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=f"Invalid transition: {estado_actual.value} -> {nuevo_estado.value}",
            )

        updated = self.transacciones_repository.update_estado(transaccion_id, nuevo_estado.value)
        return Transaccion.model_validate(updated)
