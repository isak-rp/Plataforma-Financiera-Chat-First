// ============================================================
// Service layer: maps to FastAPI endpoints
// Each function calls apiClient with the correct endpoint
// ============================================================

import { apiClient, ApiClientError } from "./client"
import type {
  AuthResponse,
  LoginRequest,
  RegistroRequest,
  Perfil,
  Espacio,
  EspacioDetalle,
  Apartado,
  Transaccion,
  ChatRequest,
  ChatResponse,
  CrearEspacioRequest,
  InvitarMiembroRequest,
  MiembroEspacio,
  CrearTransaccionRequest,
  ActualizarEstadoRequest,
} from "./types"

// ---- Env-controlled mock mode ----
// Disabled by default; set NEXT_PUBLIC_USE_MOCK=true to force mock mode.
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true"

// ============================================================
// AUTH
// ============================================================

export async function login(data: LoginRequest): Promise<AuthResponse> {
  if (USE_MOCK) {
    return {
      access_token: "mock-jwt-token-xyz",
      token_type: "bearer",
      perfil: {
        id: "user-1",
        nombre: "Carlos Lopez",
        email: data.email,
        avatar_url: null,
        moneda: "MXN",
        zona_horaria: "America/Mexico_City",
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString(),
      },
    }
  }
  return apiClient<AuthResponse>("/api/v1/auth/login", {
    method: "POST",
    body: data,
    noAuth: true,
  })
}

export async function registro(data: RegistroRequest): Promise<AuthResponse> {
  if (USE_MOCK) {
    return {
      access_token: "mock-jwt-token-xyz",
      token_type: "bearer",
      perfil: {
        id: "user-1",
        nombre: data.nombre,
        email: data.email,
        avatar_url: null,
        moneda: "MXN",
        zona_horaria: "America/Mexico_City",
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString(),
      },
    }
  }
  return apiClient<AuthResponse>("/api/v1/auth/registro", {
    method: "POST",
    body: data,
    noAuth: true,
  })
}

export async function getPerfil(): Promise<Perfil> {
  if (USE_MOCK) {
    return {
      id: "user-1",
      nombre: "Carlos Lopez",
      email: "carlos@email.com",
      avatar_url: null,
      moneda: "MXN",
      zona_horaria: "America/Mexico_City",
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString(),
    }
  }
  return apiClient<Perfil>("/api/v1/perfil")
}

// ============================================================
// ESPACIOS
// ============================================================

export async function getEspacios(): Promise<Espacio[]> {
  if (USE_MOCK) {
    const { mockWorkspaces } = await import("@/lib/mock-data")
    return mockWorkspaces.map((w) => ({
      id: w.id,
      nombre: w.name,
      tipo: w.type === "personal" ? ("personal" as const) : ("compartido" as const),
      descripcion: null,
      icono: w.icon,
      propietario_id: "user-1",
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString(),
    }))
  }
  return apiClient<Espacio[]>("/api/v1/espacios")
}

export async function getEspacioDetalle(espacioId: string): Promise<EspacioDetalle> {
  if (USE_MOCK) {
    const { mockWorkspaces, mockBudgetCategories } = await import("@/lib/mock-data")
    const { mockSharedMembers } = await import("@/lib/mock-data")
    const workspace = mockWorkspaces.find((w) => w.id === espacioId)
    const nowIso = new Date().toISOString()
    return {
      id: espacioId,
      nombre: workspace?.name ?? "Espacio",
      tipo: workspace?.type === "personal" ? "personal" : "compartido",
      descripcion: null,
      icono: workspace?.icon ?? "wallet",
      propietario_id: "user-1",
      creado_en: nowIso,
      actualizado_en: nowIso,
      miembros: (mockSharedMembers ?? []).map((member) => ({
        id: member.id,
        espacio_id: espacioId,
        perfil_id: member.id,
        rol: member.role,
        invitado_en: nowIso,
        aceptado_en: member.accepted ? nowIso : null,
        activo: true,
        perfil: {
          id: member.id,
          nombre: member.name,
          email: member.email,
          avatar_url: null,
          moneda: "MXN",
          zona_horaria: "America/Mexico_City",
          creado_en: nowIso,
          actualizado_en: nowIso,
        },
      })),
      apartados: mockBudgetCategories.map((c) => ({
        id: c.id,
        espacio_id: espacioId,
        nombre: c.name,
        icono: c.icon,
        presupuesto: c.budget,
        gastado: c.spent,
        color: "#10b981",
        orden: Number(c.id),
        activo: true,
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString(),
      })),
      balance_total: workspace?.balance ?? 0,
    }
  }
  return apiClient<EspacioDetalle>(`/api/v1/espacios/${espacioId}`)
}

export async function crearEspacio(data: CrearEspacioRequest): Promise<Espacio> {
  if (USE_MOCK) {
    return {
      id: `space-${Date.now()}`,
      nombre: data.nombre,
      tipo: data.tipo,
      descripcion: data.descripcion ?? null,
      icono: data.icono ?? "users",
      propietario_id: "user-1",
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString(),
    }
  }
  return apiClient<Espacio>("/api/v1/espacios", {
    method: "POST",
    body: data,
  })
}

export async function invitarMiembro(
  espacioId: string,
  data: InvitarMiembroRequest
): Promise<MiembroEspacio> {
  if (USE_MOCK) {
    return {
      id: `member-${Date.now()}`,
      espacio_id: espacioId,
      perfil_id: `invited-${Date.now()}`,
      rol: data.rol ?? "miembro",
      invitado_en: new Date().toISOString(),
      aceptado_en: null,
      activo: true,
      perfil: {
        id: `invited-${Date.now()}`,
        nombre: data.email.split("@")[0],
        email: data.email,
        avatar_url: null,
        moneda: "MXN",
        zona_horaria: "America/Mexico_City",
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString(),
      },
    }
  }
  return apiClient<MiembroEspacio>(`/api/v1/espacios/${espacioId}/miembros`, {
    method: "POST",
    body: data,
  })
}

// ============================================================
// APARTADOS
// ============================================================

export async function getApartados(espacioId: string): Promise<Apartado[]> {
  if (USE_MOCK) {
    const { mockBudgetCategories } = await import("@/lib/mock-data")
    return mockBudgetCategories.map((c) => ({
      id: c.id,
      espacio_id: espacioId,
      nombre: c.name,
      icono: c.icon,
      presupuesto: c.budget,
      gastado: c.spent,
      color: "#10b981",
      orden: Number(c.id),
      activo: true,
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString(),
    }))
  }
  return apiClient<Apartado[]>(`/api/v1/espacios/${espacioId}/apartados`)
}

// ============================================================
// TRANSACCIONES
// ============================================================

export async function getTransacciones(espacioId: string): Promise<Transaccion[]> {
  if (USE_MOCK) {
    const { mockSharedTransactions } = await import("@/lib/mock-data")
    const nowIso = new Date().toISOString()
    return (mockSharedTransactions ?? []).map((txn, index) => ({
      id: txn.id,
      apartado_id: `apartado-${index + 1}`,
      espacio_id: espacioId,
      perfil_id: txn.createdByInitials || "user-1",
      tipo: "gasto",
      estado: txn.status,
      monto: txn.amount,
      descripcion: txn.description,
      texto_original: null,
      dividido_entre: txn.dividedBetween ?? [],
      fecha: txn.date,
      creado_en: nowIso,
      actualizado_en: nowIso,
    }))
  }
  return apiClient<Transaccion[]>(`/api/v1/espacios/${espacioId}/transacciones`)
}

export async function crearTransaccion(data: CrearTransaccionRequest): Promise<Transaccion> {
  if (USE_MOCK) {
    return {
      id: `txn-${Date.now()}`,
      ...data,
      perfil_id: "user-1",
      estado: "confirmada",
      texto_original: data.texto_original ?? null,
      dividido_entre: data.dividido_entre ?? [],
      fecha: new Date().toISOString().split("T")[0],
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString(),
    }
  }
  return apiClient<Transaccion>("/api/v1/transacciones", {
    method: "POST",
    body: data,
  })
}

export async function actualizarEstadoTransaccion(
  transaccionId: string,
  data: ActualizarEstadoRequest
): Promise<Transaccion> {
  if (USE_MOCK) {
    return {
      id: transaccionId,
      apartado_id: "1",
      espacio_id: "2",
      perfil_id: "user-1",
      tipo: "gasto",
      estado: data.estado,
      monto: 0,
      descripcion: "",
      texto_original: null,
      dividido_entre: [],
      fecha: new Date().toISOString().split("T")[0],
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString(),
    }
  }
  return apiClient<Transaccion>(`/api/v1/transacciones/${transaccionId}/estado`, {
    method: "PATCH",
    body: data,
  })
}

// ============================================================
// CHAT (AI Agent)
// ============================================================

export async function enviarMensajeChat(data: ChatRequest): Promise<ChatResponse> {
  if (USE_MOCK) {
    const { mockBotResponses } = await import("@/lib/mock-data")
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1200))
    const randomResponse = mockBotResponses[Math.floor(Math.random() * mockBotResponses.length)]
    return {
      id: `chat-${Date.now()}`,
      respuesta: randomResponse,
      accion: "gasto_registrado",
    }
  }
  return apiClient<ChatResponse>("/api/v1/chat", {
    method: "POST",
    body: data,
  })
}

export { ApiClientError }
