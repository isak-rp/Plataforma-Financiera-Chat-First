def classify_intent_node(state: dict) -> dict:
    message = state.get("normalized_message", "")
    expense_keywords = ["gaste", "gasté", "pague", "pague", "compre", "compré", "transferi", "transferí"]

    if any(keyword in message for keyword in expense_keywords):
        return {"intent": "registrar_gasto"}

    if "cuanto" in message or "cuánto" in message or "saldo" in message:
        return {"intent": "consulta_saldo"}

    return {"intent": "desconocido"}
