from functools import lru_cache
from typing import TypedDict

from langgraph.graph import END, StateGraph

from src.agents.nodes.build_response import build_response_node
from src.agents.nodes.classify_intent import classify_intent_node
from src.agents.nodes.extract_transaction import extract_transaction_node
from src.agents.nodes.parse_input import parse_input_node
from src.agents.nodes.persist_transaction import persist_transaction_node
from src.agents.nodes.resolve_workspace import resolve_workspace_node


class ChatGraphState(TypedDict, total=False):
    mensaje: str
    espacio_id: str
    perfil_id: str
    normalized_message: str
    workspace_resolved: bool
    intent: str
    extracted: dict | None
    transaccion: dict | None
    apartado_nombre: str
    accion: str
    respuesta: str
    error: str
    datos_extra: dict


@lru_cache(maxsize=1)
def build_chat_graph():
    graph = StateGraph(ChatGraphState)

    graph.add_node("parse_input", parse_input_node)
    graph.add_node("resolve_workspace", resolve_workspace_node)
    graph.add_node("classify_intent", classify_intent_node)
    graph.add_node("extract_transaction", extract_transaction_node)
    graph.add_node("persist_transaction", persist_transaction_node)
    graph.add_node("build_response", build_response_node)

    graph.set_entry_point("parse_input")
    graph.add_edge("parse_input", "resolve_workspace")
    graph.add_edge("resolve_workspace", "classify_intent")
    graph.add_edge("classify_intent", "extract_transaction")
    graph.add_edge("extract_transaction", "persist_transaction")
    graph.add_edge("persist_transaction", "build_response")
    graph.add_edge("build_response", END)

    return graph.compile()


def run_chat_graph(payload: dict) -> dict:
    graph = build_chat_graph()
    return graph.invoke(payload)
