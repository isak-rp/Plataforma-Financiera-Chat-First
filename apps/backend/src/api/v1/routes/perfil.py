from fastapi import APIRouter, Depends

from src.core.security import CurrentUser, get_current_user
from src.schemas.domain import Perfil
from src.services.perfil_service import PerfilService

router = APIRouter(tags=["perfil"])


@router.get("/perfil", response_model=Perfil)
async def get_perfil(current_user: CurrentUser = Depends(get_current_user)) -> Perfil:
    service = PerfilService()
    return service.get_perfil(current_user.id)
