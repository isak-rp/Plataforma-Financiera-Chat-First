import asyncio

from fastapi import HTTPException

from src.api.v1.routes import chat as chat_route
from src.api.v1.routes import transacciones as transacciones_route
from src.core.security import CurrentUser
from src.schemas.chat import ChatRequest, ChatResponse
from src.schemas.transacciones import ActualizarEstadoRequest


def test_chat_route_returns_response_and_trace_metadata(monkeypatch):
    async def fake_process_chat_message(perfil_id: str, payload):
        return ChatResponse(
            id="chat-1",
            respuesta="Listo. Registre $150.00 en Comida.",
            accion="gasto_registrado",
            transaccion=None,
            datos_extra={"source": "gemini", "confidence": 0.91},
        )

    monkeypatch.setattr(chat_route, "process_chat_message", fake_process_chat_message)

    result = asyncio.run(
        chat_route.chat(
            payload=ChatRequest(mensaje="Gaste 150 en comida", espacio_id="space-1"),
            current_user=CurrentUser(id="user-1", token="dev-user:user-1"),
        )
    )
    assert result.accion == "gasto_registrado"
    assert result.datos_extra and result.datos_extra["source"] == "gemini"


def test_transaccion_estado_invalid_transition_returns_422(monkeypatch):
    from src.services.transacciones_service import TransaccionesService

    def fake_init(self):
        return None

    def fake_update_estado(self, perfil_id: str, transaccion_id: str, nuevo_estado):
        raise HTTPException(status_code=422, detail="Invalid transition: pendiente -> liquidada")

    monkeypatch.setattr(TransaccionesService, "__init__", fake_init)
    monkeypatch.setattr(TransaccionesService, "update_estado", fake_update_estado)

    try:
        asyncio.run(
            transacciones_route.update_transaccion_estado(
                transaccion_id="txn-1",
                payload=ActualizarEstadoRequest(estado="liquidada"),
                current_user=CurrentUser(id="user-1", token="dev-user:user-1"),
            )
        )
        assert False, "Expected HTTPException"
    except HTTPException as exc:
        assert exc.status_code == 422
