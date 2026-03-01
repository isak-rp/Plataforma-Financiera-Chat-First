from typing import TypedDict


class ParseState(TypedDict, total=False):
    mensaje: str
    normalized_message: str


def parse_input_node(state: ParseState) -> ParseState:
    raw_message = state.get("mensaje", "")
    return {"normalized_message": raw_message.strip().lower()}
