from src.agents.nodes import build_response as build_module


class _DummyRepo:
    def __init__(self, apartados=None, balance=0.0):
        self._apartados = apartados or []
        self._balance = balance

    def list_apartados(self, perfil_id: str, espacio_id: str):
        return self._apartados

    def find_apartado_by_name(self, perfil_id: str, espacio_id: str, nombre: str):
        normalized = nombre.strip().lower()
        for apartado in self._apartados:
            if str(apartado.get("nombre", "")).strip().lower() == normalized:
                return apartado
        return None

    def calculate_balance_total(self, perfil_id: str, espacio_id: str) -> float:
        return self._balance


def test_build_response_consulta_saldo_for_specific_category(monkeypatch):
    apartados = [
        {"nombre": "Comida", "presupuesto": 1000, "gastado": 250},
        {"nombre": "Transporte", "presupuesto": 500, "gastado": 100},
    ]
    monkeypatch.setattr(build_module, "EspaciosRepository", lambda: _DummyRepo(apartados=apartados, balance=650))

    result = build_module.build_response_node(
        {
            "intent": "consulta_saldo",
            "perfil_id": "user-1",
            "espacio_id": "space-1",
            "normalized_message": "cuanto me queda para comida",
        }
    )

    assert result["accion"] == "consulta_saldo"
    assert "Comida" in result["respuesta"]
    assert result["datos_extra"]["scope"] == "apartado"
    assert result["datos_extra"]["restante"] == 750.0


def test_build_response_consulta_saldo_workspace_summary(monkeypatch):
    apartados = [
        {"nombre": "Comida", "presupuesto": 1000, "gastado": 250},
        {"nombre": "Transporte", "presupuesto": 500, "gastado": 100},
    ]
    monkeypatch.setattr(build_module, "EspaciosRepository", lambda: _DummyRepo(apartados=apartados, balance=1200))

    result = build_module.build_response_node(
        {
            "intent": "consulta_saldo",
            "perfil_id": "user-1",
            "espacio_id": "space-1",
            "normalized_message": "cual es mi saldo",
        }
    )

    assert result["accion"] == "consulta_saldo"
    assert "Saldo general del espacio" in result["respuesta"]
    assert result["datos_extra"]["scope"] == "workspace"
    assert result["datos_extra"]["balance_total"] == 1200
