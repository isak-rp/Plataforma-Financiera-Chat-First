// ============================================================
// TypeScript types matching the Supabase schema + FastAPI Pydantic models
// These mirror: scripts/001_create_tables.sql
// ============================================================

// --- Enums (matching PostgreSQL enums) ---

export type TipoEspacio = "personal" | "compartido"
export type RolMiembro = "propietario" | "administrador" | "miembro"
export type TipoTransaccion = "gasto" | "ingreso" | "transferencia"
export type EstadoTransaccion = "confirmada" | "pendiente" | "aceptada" | "rechazada" | "liquidada"

// --- Core Models ---

export interface Perfil {
  id: string
  nombre: string
  email: string
  avatar_url: string | null
  moneda: string
  zona_horaria: string
  creado_en: string
  actualizado_en: string
}

export interface Espacio {
  id: string
  nombre: string
  tipo: TipoEspacio
  descripcion: string | null
  icono: string
  propietario_id: string
  creado_en: string
  actualizado_en: string
}

export interface MiembroEspacio {
  id: string
  espacio_id: string
  perfil_id: string
  rol: RolMiembro
  invitado_en: string
  aceptado_en: string | null
  activo: boolean
  // Joined fields (populated by backend)
  perfil?: Perfil
}

export interface Apartado {
  id: string
  espacio_id: string
  nombre: string
  icono: string
  presupuesto: number
  gastado: number
  color: string
  orden: number
  activo: boolean
  creado_en: string
  actualizado_en: string
}

export interface Transaccion {
  id: string
  apartado_id: string
  espacio_id: string
  perfil_id: string
  tipo: TipoTransaccion
  estado: EstadoTransaccion
  monto: number
  descripcion: string
  texto_original: string | null
  dividido_entre: string[]
  fecha: string
  creado_en: string
  actualizado_en: string
  // Joined fields
  perfil?: Perfil
  apartado?: Apartado
}

// --- API Request/Response Shapes ---

export interface ChatRequest {
  mensaje: string
  espacio_id: string
}

export interface ChatResponse {
  id: string
  respuesta: string
  transaccion?: Transaccion
  accion?: "gasto_registrado" | "consulta_saldo" | "resumen" | "error"
  datos_extra?: Record<string, unknown>
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegistroRequest {
  nombre: string
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  perfil: Perfil
}

export interface CrearEspacioRequest {
  nombre: string
  tipo: TipoEspacio
  descripcion?: string
  icono?: string
}

export interface InvitarMiembroRequest {
  email: string
  rol?: RolMiembro
}

export interface CrearTransaccionRequest {
  apartado_id: string
  espacio_id: string
  tipo: TipoTransaccion
  monto: number
  descripcion: string
  texto_original?: string
  dividido_entre?: string[]
}

export interface ActualizarEstadoRequest {
  estado: EstadoTransaccion
}

// --- API Error ---

export interface ApiError {
  detail: string
  status_code: number
}

// --- Paginated Response ---

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
}

// --- Workspace Detail (enriched) ---

export interface EspacioDetalle extends Espacio {
  miembros: MiembroEspacio[]
  apartados: Apartado[]
  balance_total: number
}
