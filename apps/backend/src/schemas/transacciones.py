from pydantic import BaseModel, Field

from src.schemas.domain import EstadoTransaccion, TipoTransaccion, Transaccion


class CrearTransaccionRequest(BaseModel):
    apartado_id: str
    espacio_id: str
    tipo: TipoTransaccion
    monto: float = Field(gt=0)
    descripcion: str = Field(min_length=1, max_length=200)
    texto_original: str | None = None
    dividido_entre: list[str] = Field(default_factory=list)


class ActualizarEstadoRequest(BaseModel):
    estado: EstadoTransaccion


class EstadoTransicionError(Exception):
    pass


TransaccionResponse = Transaccion
