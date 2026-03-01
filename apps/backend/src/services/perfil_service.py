from src.repositories.perfiles_repository import PerfilesRepository
from src.schemas.domain import Perfil


class PerfilService:
    def __init__(self) -> None:
        self.repository = PerfilesRepository()

    def get_perfil(self, perfil_id: str) -> Perfil:
        return Perfil.model_validate(self.repository.get_by_id(perfil_id))
