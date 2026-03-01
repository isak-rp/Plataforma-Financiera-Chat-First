from fastapi import HTTPException

from src.schemas.domain import EstadoTransaccion, TipoTransaccion
from src.schemas.transacciones import CrearTransaccionRequest
from src.services.transacciones_service import ALLOWED_TRANSITIONS, TransaccionesService


class _FakeEspaciosRepo:
    def __init__(self, *, member: bool = True, admin: bool = False):
        self.member = member
        self.admin = admin

    def is_member(self, perfil_id: str, espacio_id: str) -> bool:
        return self.member

    def is_admin(self, perfil_id: str, espacio_id: str) -> bool:
        return self.admin


class _FakeTransaccionesRepo:
    def __init__(self, estado: str = "pendiente", owner_id: str = "user-1"):
        self.estado = estado
        self.owner_id = owner_id
        self.last_created_payload = None

    def create(self, payload: dict) -> dict:
        self.last_created_payload = payload
        return {
            "id": "txn-1",
            "apartado_id": payload["apartado_id"],
            "espacio_id": payload["espacio_id"],
            "perfil_id": payload["perfil_id"],
            "tipo": payload["tipo"],
            "estado": payload["estado"],
            "monto": payload["monto"],
            "descripcion": payload["descripcion"],
            "texto_original": payload.get("texto_original"),
            "dividido_entre": payload.get("dividido_entre", []),
            "fecha": payload["fecha"],
            "creado_en": "2026-01-01T00:00:00Z",
            "actualizado_en": "2026-01-01T00:00:00Z",
        }

    def get_by_id(self, transaccion_id: str) -> dict:
        return {
            "id": transaccion_id,
            "apartado_id": "apartado-1",
            "espacio_id": "space-1",
            "perfil_id": self.owner_id,
            "tipo": "gasto",
            "estado": self.estado,
            "monto": 100,
            "descripcion": "Comida",
            "texto_original": None,
            "dividido_entre": [],
            "fecha": "2026-01-01",
            "creado_en": "2026-01-01T00:00:00Z",
            "actualizado_en": "2026-01-01T00:00:00Z",
        }

    def update_estado(self, transaccion_id: str, estado: str) -> dict:
        self.estado = estado
        data = self.get_by_id(transaccion_id)
        data["estado"] = estado
        return data


def _build_service(espacios_repo: _FakeEspaciosRepo, tx_repo: _FakeTransaccionesRepo) -> TransaccionesService:
    service = object.__new__(TransaccionesService)
    service.espacios_repository = espacios_repo
    service.transacciones_repository = tx_repo
    return service


def test_pending_transitions():
    assert EstadoTransaccion.aceptada in ALLOWED_TRANSITIONS[EstadoTransaccion.pendiente]
    assert EstadoTransaccion.rechazada in ALLOWED_TRANSITIONS[EstadoTransaccion.pendiente]


def test_confirmada_does_not_allow_rechazada():
    assert EstadoTransaccion.rechazada not in ALLOWED_TRANSITIONS[EstadoTransaccion.confirmada]


def test_create_shared_transaction_sets_pending_state():
    fake_repo = _FakeTransaccionesRepo()
    service = _build_service(_FakeEspaciosRepo(member=True), fake_repo)

    payload = CrearTransaccionRequest(
        apartado_id="apartado-1",
        espacio_id="space-1",
        tipo=TipoTransaccion.gasto,
        monto=120,
        descripcion="Cena",
        dividido_entre=["user-2", "user-3"],
    )

    result = service.create_transaccion("user-1", payload)
    assert result.estado == EstadoTransaccion.pendiente
    assert fake_repo.last_created_payload["estado"] == "pendiente"


def test_update_estado_invalid_transition_raises_422():
    service = _build_service(
        _FakeEspaciosRepo(member=True, admin=True),
        _FakeTransaccionesRepo(estado="pendiente", owner_id="user-1"),
    )

    try:
        service.update_estado("user-1", "txn-1", EstadoTransaccion.liquidada)
        assert False, "Expected HTTPException"
    except HTTPException as exc:
        assert exc.status_code == 422


def test_cross_space_access_raises_403():
    service = _build_service(
        _FakeEspaciosRepo(member=False, admin=False),
        _FakeTransaccionesRepo(estado="pendiente", owner_id="user-1"),
    )

    try:
        service.update_estado("user-2", "txn-1", EstadoTransaccion.aceptada)
        assert False, "Expected HTTPException"
    except HTTPException as exc:
        assert exc.status_code == 403
