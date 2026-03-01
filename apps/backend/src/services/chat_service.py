from uuid import uuid4

from src.agents.graph import run_chat_graph
from src.schemas.chat import ChatRequest, ChatResponse
from src.schemas.domain import Transaccion


async def process_chat_message(perfil_id: str, payload: ChatRequest) -> ChatResponse:
    state = run_chat_graph(
        {
            "mensaje": payload.mensaje,
            "espacio_id": payload.espacio_id,
            "perfil_id": perfil_id,
        }
    )

    transaccion = None
    if state.get("transaccion"):
        transaccion = Transaccion.model_validate(state["transaccion"])

    return ChatResponse(
        id=f"chat-{uuid4()}",
        respuesta=state.get("respuesta", "No fue posible procesar el mensaje."),
        transaccion=transaccion,
        accion=state.get("accion", "error"),
        datos_extra=state.get("datos_extra"),
    )
