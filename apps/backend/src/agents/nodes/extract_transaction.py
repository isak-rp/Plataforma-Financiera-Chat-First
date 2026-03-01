import json
import re
import unicodedata
from typing import Any

from langchain_google_genai import ChatGoogleGenerativeAI

from src.core.config import settings
from src.repositories.espacios_repository import EspaciosRepository

AMOUNT_PATTERN = re.compile(r"(\d+(?:[\.,]\d{1,2})?)")
JSON_BLOCK_PATTERN = re.compile(r"\{.*\}", re.DOTALL)

CATEGORY_HINTS = {
    "comida": "comida",
    "almuerzo": "comida",
    "cena": "comida",
    "despensa": "comida",
    "uber": "transporte",
    "taxi": "transporte",
    "transporte": "transporte",
    "gasolina": "transporte",
    "renta": "renta",
    "alquiler": "renta",
    "entretenimiento": "entretenimiento",
}


def _normalize_text(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    return normalized.strip().lower()


def _extract_json(text: str) -> dict[str, Any] | None:
    match = JSON_BLOCK_PATTERN.search(text)
    if not match:
        return None
    try:
        payload = json.loads(match.group(0))
        if isinstance(payload, dict):
            return payload
    except json.JSONDecodeError:
        return None
    return None


def _extract_with_gemini(message: str) -> dict[str, Any] | None:
    if not settings.gemini_api_key:
        return None

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        google_api_key=settings.gemini_api_key,
        temperature=0,
    )

    prompt = (
        "Extrae una transaccion financiera del mensaje. "
        "Responde SOLO JSON valido con esta forma: "
        '{"monto": number, "descripcion": string, "categoria": string, "tipo": "gasto"|"ingreso"|"transferencia", '
        '"dividido_entre": [string], "confidence": number}. '
        "Si no hay suficiente informacion, usa null en los campos faltantes y confidence bajo. "
        f"Mensaje: {message}"
    )

    response = llm.invoke(prompt)
    content = getattr(response, "content", "")
    if isinstance(content, list):
        content = " ".join(str(chunk) for chunk in content)

    parsed = _extract_json(str(content))
    if not parsed:
        return None

    if parsed.get("monto") is None:
        return None

    return {
        "monto": float(parsed["monto"]),
        "descripcion": str(parsed.get("descripcion") or "Gasto"),
        "categoria": str(parsed.get("categoria") or "gastos"),
        "tipo": str(parsed.get("tipo") or "gasto"),
        "dividido_entre": parsed.get("dividido_entre") or [],
        "confidence": float(parsed.get("confidence") or 0.75),
        "source": "gemini",
    }


def _extract_with_heuristic(message: str) -> dict[str, Any] | None:
    normalized = _normalize_text(message)
    amount_match = AMOUNT_PATTERN.search(normalized)
    if not amount_match:
        return None

    raw_amount = amount_match.group(1).replace(",", ".")
    amount = float(raw_amount)

    category_guess = "gastos"
    for hint, category in CATEGORY_HINTS.items():
        if hint in normalized:
            category_guess = category
            break

    return {
        "monto": amount,
        "descripcion": category_guess.capitalize(),
        "categoria": category_guess,
        "tipo": "gasto",
        "dividido_entre": [],
        "confidence": 0.55,
        "source": "heuristic",
    }


def extract_transaction_node(state: dict) -> dict:
    if state.get("intent") != "registrar_gasto":
        return {"extracted": None}

    message = state.get("mensaje", "")

    extracted = None
    try:
        extracted = _extract_with_gemini(message)
    except Exception:
        extracted = None

    if not extracted:
        extracted = _extract_with_heuristic(message)

    if not extracted:
        return {"extracted": None, "error": "No se pudo extraer una transaccion valida"}

    repository = EspaciosRepository()
    apartado = repository.find_apartado_by_name(
        perfil_id=state["perfil_id"],
        espacio_id=state["espacio_id"],
        nombre=extracted["categoria"],
    )

    if not apartado:
        return {"extracted": None, "error": "No hay apartados disponibles para registrar la transaccion"}

    return {
        "extracted": {
            "monto": extracted["monto"],
            "descripcion": extracted["descripcion"],
            "apartado_id": apartado["id"],
            "apartado_nombre": apartado["nombre"],
            "tipo": extracted["tipo"],
            "texto_original": message,
            "dividido_entre": extracted["dividido_entre"],
            "confidence": extracted["confidence"],
            "source": extracted["source"],
        },
        "datos_extra": {
            "source": extracted["source"],
            "confidence": extracted["confidence"],
        },
    }
