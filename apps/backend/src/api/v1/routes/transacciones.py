from fastapi import APIRouter, Depends

from src.core.security import CurrentUser, get_current_user
from src.schemas.domain import Transaccion
from src.schemas.transacciones import ActualizarEstadoRequest, CrearTransaccionRequest
from src.services.transacciones_service import TransaccionesService

router = APIRouter(tags=["transacciones"])


@router.post("/transacciones", response_model=Transaccion)
async def create_transaccion(
    payload: CrearTransaccionRequest,
    current_user: CurrentUser = Depends(get_current_user),
) -> Transaccion:
    service = TransaccionesService()
    return service.create_transaccion(current_user.id, payload)


@router.patch("/transacciones/{transaccion_id}/estado", response_model=Transaccion)
async def update_transaccion_estado(
    transaccion_id: str,
    payload: ActualizarEstadoRequest,
    current_user: CurrentUser = Depends(get_current_user),
) -> Transaccion:
    service = TransaccionesService()
    return service.update_estado(current_user.id, transaccion_id, payload.estado)
