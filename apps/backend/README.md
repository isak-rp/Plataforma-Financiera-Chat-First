# Backend (FastAPI + LangGraph)

## Run locally

```bash
uv sync
uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

## Structure

- `src/api/v1/routes`: HTTP routes.
- `src/schemas`: Pydantic request/response models.
- `src/services`: Use-case and business service layer.
- `src/repositories`: Data access abstractions.
- `src/db`: Supabase/PostgreSQL clients.
- `src/agents/nodes`: LangGraph nodes.
