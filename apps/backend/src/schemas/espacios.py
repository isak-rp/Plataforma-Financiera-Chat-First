from pydantic import BaseModel, Field

from src.schemas.domain import Apartado, Espacio, EspacioDetalle, MiembroEspacio, RolMiembro, TipoEspacio, Transaccion


class CrearEspacioRequest(BaseModel):
    nombre: str = Field(min_length=1, max_length=120)
    tipo: TipoEspacio
    descripcion: str | None = None
    icono: str | None = "wallet"


class InvitarMiembroRequest(BaseModel):
    email: str
    rol: RolMiembro = RolMiembro.miembro


EspaciosResponse = list[Espacio]
ApartadosResponse = list[Apartado]
TransaccionesResponse = list[Transaccion]
MiembrosResponse = list[MiembroEspacio]
DetalleResponse = EspacioDetalle
