from fastapi import HTTPException, status

from src.repositories.espacios_repository import EspaciosRepository


def resolve_workspace_node(state: dict) -> dict:
    perfil_id = state["perfil_id"]
    espacio_id = state["espacio_id"]

    repository = EspaciosRepository()
    if not repository.is_member(perfil_id, espacio_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No access to workspace")

    return {"workspace_resolved": True}
