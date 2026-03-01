from pydantic import BaseModel, Field

from src.schemas.domain import Transaccion


class ChatRequest(BaseModel):
    mensaje: str = Field(min_length=1, max_length=2000)
    espacio_id: str = Field(min_length=1)


class ChatResponse(BaseModel):
    id: str
    respuesta: str
    transaccion: Transaccion | None = None
    accion: str | None = None
    datos_extra: dict[str, object] | None = None
