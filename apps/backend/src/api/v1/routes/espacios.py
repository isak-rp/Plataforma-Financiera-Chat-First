from fastapi import APIRouter, Depends

from src.core.security import CurrentUser, get_current_user
from src.schemas.domain import Apartado, Espacio, EspacioDetalle, MiembroEspacio, Transaccion
from src.schemas.espacios import InvitarMiembroRequest
from src.services.espacios_service import EspaciosService
from src.schemas.espacios import CrearEspacioRequest

router = APIRouter(tags=["espacios"])


@router.get("/espacios", response_model=list[Espacio])
async def list_espacios(current_user: CurrentUser = Depends(get_current_user)) -> list[Espacio]:
    service = EspaciosService()
    return service.get_espacios(current_user.id)


@router.get("/espacios/{espacio_id}", response_model=EspacioDetalle)
async def get_espacio_detalle(
    espacio_id: str,
    current_user: CurrentUser = Depends(get_current_user),
) -> EspacioDetalle:
    service = EspaciosService()
    return service.get_espacio_detalle(current_user.id, espacio_id)


@router.get("/espacios/{espacio_id}/apartados", response_model=list[Apartado])
async def get_apartados(
    espacio_id: str,
    current_user: CurrentUser = Depends(get_current_user),
) -> list[Apartado]:
    service = EspaciosService()
    return service.get_apartados(current_user.id, espacio_id)


@router.get("/espacios/{espacio_id}/transacciones", response_model=list[Transaccion])
async def get_transacciones(
    espacio_id: str,
    current_user: CurrentUser = Depends(get_current_user),
) -> list[Transaccion]:
    service = EspaciosService()
    return service.get_transacciones(current_user.id, espacio_id)


@router.post("/espacios/{espacio_id}/miembros", response_model=MiembroEspacio)
async def invite_member(
    espacio_id: str,
    payload: InvitarMiembroRequest,
    current_user: CurrentUser = Depends(get_current_user),
) -> MiembroEspacio:
    service = EspaciosService()
    return service.invite_member(current_user.id, espacio_id, payload.email, payload.rol.value)

@router.post("/espacios", response_model=Espacio)
async def create_espacio(
    payload: CrearEspacioRequest,
    current_user: CurrentUser = Depends(get_current_user),
) -> Espacio:
    service = EspaciosService()
    return service.create_espacio(current_user.id, payload)
    