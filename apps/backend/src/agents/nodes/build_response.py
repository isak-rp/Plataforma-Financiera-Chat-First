import unicodedata

from src.repositories.espacios_repository import EspaciosRepository


def _normalize(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    return normalized.strip().lower()


def _fmt_currency(amount: float) -> str:
    return f"${amount:,.2f}"


def _build_balance_response(state: dict) -> dict:
    repository = EspaciosRepository()
    perfil_id = state["perfil_id"]
    espacio_id = state["espacio_id"]

    apartados = repository.list_apartados(perfil_id, espacio_id)
    if not apartados:
        return {
            "accion": "consulta_saldo",
            "respuesta": "Este espacio aun no tiene apartados configurados.",
            "datos_extra": {"source": "computed", "scope": "workspace"},
        }

    message = _normalize(state.get("normalized_message") or state.get("mensaje", ""))
    requested_apartado = None

    for apartado in apartados:
        apartado_name = _normalize(str(apartado.get("nombre", "")))
        if apartado_name and apartado_name in message:
            requested_apartado = apartado
            break

    if not requested_apartado and "para" in message:
        possible_category = message.split("para", 1)[1].strip()
        if possible_category:
            requested_apartado = repository.find_apartado_by_name(
                perfil_id=perfil_id,
                espacio_id=espacio_id,
                nombre=possible_category,
            )

    if requested_apartado:
        presupuesto = float(requested_apartado.get("presupuesto") or 0)
        gastado = float(requested_apartado.get("gastado") or 0)
        restante = presupuesto - gastado
        nombre = str(requested_apartado.get("nombre") or "apartado")

        return {
            "accion": "consulta_saldo",
            "respuesta": (
                f"En {nombre} has gastado {_fmt_currency(gastado)} de {_fmt_currency(presupuesto)}. "
                f"Te quedan {_fmt_currency(restante)}."
            ),
            "datos_extra": {
                "source": "computed",
                "scope": "apartado",
                "categoria": nombre,
                "presupuesto": presupuesto,
                "gastado": gastado,
                "restante": restante,
            },
        }

    total_presupuesto = sum(float(ap.get("presupuesto") or 0) for ap in apartados)
    total_gastado = sum(float(ap.get("gastado") or 0) for ap in apartados)
    total_restante = total_presupuesto - total_gastado
    balance_total = repository.calculate_balance_total(perfil_id, espacio_id)

    return {
        "accion": "consulta_saldo",
        "respuesta": (
            f"Saldo general del espacio: {_fmt_currency(balance_total)}. "
            f"Presupuesto {_fmt_currency(total_presupuesto)}, gastado {_fmt_currency(total_gastado)}, "
            f"restante {_fmt_currency(total_restante)}."
        ),
        "datos_extra": {
            "source": "computed",
            "scope": "workspace",
            "balance_total": balance_total,
            "presupuesto_total": total_presupuesto,
            "gastado_total": total_gastado,
            "restante_total": total_restante,
        },
    }


def build_response_node(state: dict) -> dict:
    if state.get("error"):
        return {
            "accion": "error",
            "respuesta": state["error"],
            "datos_extra": state.get("datos_extra"),
        }

    intent = state.get("intent")
    if intent == "registrar_gasto" and state.get("transaccion"):
        tx = state["transaccion"]
        categoria = state.get("apartado_nombre", "Apartado")
        return {
            "accion": "gasto_registrado",
            "respuesta": f"Listo. Registre ${tx['monto']:.2f} en {categoria}.",
            "datos_extra": state.get("datos_extra"),
        }

    if intent == "consulta_saldo":
        try:
            return _build_balance_response(state)
        except Exception:
            return {
                "accion": "consulta_saldo",
                "respuesta": "No pude calcular el saldo en este momento. Intenta de nuevo.",
                "datos_extra": state.get("datos_extra"),
            }

    return {
        "accion": "resumen",
        "respuesta": "No pude identificar una accion financiera clara. Intenta con: 'Gaste 150 en comida'.",
        "datos_extra": state.get("datos_extra"),
    }
