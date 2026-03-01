from src.schemas.transacciones import CrearTransaccionRequest
from src.services.transacciones_service import TransaccionesService


def persist_transaction_node(state: dict) -> dict:
    if state.get("intent") != "registrar_gasto":
        return {"transaccion": None}

    extracted = state.get("extracted")
    if not extracted:
        return {"error": "No se pudo extraer una transaccion valida", "transaccion": None}

    service = TransaccionesService()
    created = service.create_transaccion(
        perfil_id=state["perfil_id"],
        payload=CrearTransaccionRequest(
            apartado_id=extracted["apartado_id"],
            espacio_id=state["espacio_id"],
            tipo=extracted["tipo"],
            monto=extracted["monto"],
            descripcion=extracted["descripcion"],
            texto_original=extracted["texto_original"],
            dividido_entre=extracted["dividido_entre"],
        ),
    )

    datos_extra = dict(state.get("datos_extra") or {})
    if "source" in extracted:
        datos_extra["source"] = extracted["source"]
    if "confidence" in extracted:
        datos_extra["confidence"] = extracted["confidence"]

    return {
        "transaccion": created.model_dump(),
        "apartado_nombre": extracted["apartado_nombre"],
        "datos_extra": datos_extra or None,
    }
