from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.v1.routes.auth import router as auth_router
from src.api.v1.routes.chat import router as chat_router
from src.api.v1.routes.espacios import router as espacios_router
from src.api.v1.routes.health import router as health_router
from src.api.v1.routes.perfil import router as perfil_router
from src.api.v1.routes.transacciones import router as transacciones_router
from src.core.config import settings

app = FastAPI(
    title="Plataforma Financiera Chat-First API",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(auth_router, prefix=settings.api_v1_prefix)
app.include_router(perfil_router, prefix=settings.api_v1_prefix)
app.include_router(chat_router, prefix=settings.api_v1_prefix)
app.include_router(espacios_router, prefix=settings.api_v1_prefix)
app.include_router(transacciones_router, prefix=settings.api_v1_prefix)
