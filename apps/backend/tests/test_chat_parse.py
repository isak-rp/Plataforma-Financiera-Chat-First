from src.agents.nodes import extract_transaction as extract_module


class _DummyRepo:
    def find_apartado_by_name(self, perfil_id: str, espacio_id: str, nombre: str):
        return {"id": "apartado-1", "nombre": "Comida"}


def test_extract_requires_gasto_intent(monkeypatch):
    monkeypatch.setattr(extract_module, "EspaciosRepository", lambda: _DummyRepo())
    result = extract_module.extract_transaction_node({"intent": "consulta_saldo", "normalized_message": "hola"})
    assert result["extracted"] is None


def test_extract_fallback_heuristic_when_gemini_unavailable(monkeypatch):
    monkeypatch.setattr(extract_module, "EspaciosRepository", lambda: _DummyRepo())
    monkeypatch.setattr(extract_module, "_extract_with_gemini", lambda message: None)

    result = extract_module.extract_transaction_node(
        {
            "intent": "registrar_gasto",
            "mensaje": "Gaste 150 en comida",
            "perfil_id": "user-1",
            "espacio_id": "space-1",
        }
    )

    assert result["extracted"] is not None
    assert result["extracted"]["monto"] == 150
    assert result["extracted"]["source"] == "heuristic"
    assert result["datos_extra"]["source"] == "heuristic"


def test_extract_prefers_gemini_result(monkeypatch):
    monkeypatch.setattr(extract_module, "EspaciosRepository", lambda: _DummyRepo())

    def fake_gemini(_: str):
        return {
            "monto": 200,
            "descripcion": "Cena",
            "categoria": "comida",
            "tipo": "gasto",
            "dividido_entre": [],
            "confidence": 0.92,
            "source": "gemini",
        }

    monkeypatch.setattr(extract_module, "_extract_with_gemini", fake_gemini)

    result = extract_module.extract_transaction_node(
        {
            "intent": "registrar_gasto",
            "mensaje": "Pague 200 de cena",
            "perfil_id": "user-1",
            "espacio_id": "space-1",
        }
    )

    assert result["extracted"]["source"] == "gemini"
    assert result["extracted"]["confidence"] == 0.92
