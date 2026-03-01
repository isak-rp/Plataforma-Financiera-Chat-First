from enum import Enum

from pydantic import BaseModel, Field


class TipoEspacio(str, Enum):
    personal = "personal"
    compartido = "compartido"


class RolMiembro(str, Enum):
    propietario = "propietario"
    administrador = "administrador"
    miembro = "miembro"


class TipoTransaccion(str, Enum):
    gasto = "gasto"
    ingreso = "ingreso"
    transferencia = "transferencia"


class EstadoTransaccion(str, Enum):
    confirmada = "confirmada"
    pendiente = "pendiente"
    aceptada = "aceptada"
    rechazada = "rechazada"
    liquidada = "liquidada"


class Perfil(BaseModel):
    id: str
    nombre: str | None = "Nuevo Usuario"  # Le damos un nombre provisional
    email: str | None = None
    avatar_url: str | None = None
    moneda: str | None = "MXN"
    zona_horaria: str | None = "America/Mexico_City"
    creado_en: str | None = None
    actualizado_en: str | None = None


class Espacio(BaseModel):
    id: str
    nombre: str
    tipo: TipoEspacio
    descripcion: str | None = None
    icono: str
    propietario_id: str
    creado_en: str
    actualizado_en: str


class MiembroEspacio(BaseModel):
    id: str
    espacio_id: str
    perfil_id: str
    rol: RolMiembro
    invitado_en: str
    aceptado_en: str | None = None
    activo: bool
    perfil: Perfil | None = None


class Apartado(BaseModel):
    id: str
    espacio_id: str
    nombre: str
    icono: str
    presupuesto: float
    gastado: float
    color: str
    orden: int
    activo: bool
    creado_en: str
    actualizado_en: str


class Transaccion(BaseModel):
    id: str
    apartado_id: str
    espacio_id: str
    perfil_id: str
    tipo: TipoTransaccion
    estado: EstadoTransaccion
    monto: float
    descripcion: str
    texto_original: str | None = None
    dividido_entre: list[str] = Field(default_factory=list)
    fecha: str
    creado_en: str
    actualizado_en: str
    perfil: Perfil | None = None
    apartado: Apartado | None = None


class EspacioDetalle(Espacio):
    miembros: list[MiembroEspacio]
    apartados: list[Apartado]
    balance_total: float
