// ============================================================
// HTTP client wrapper for FastAPI backend
// Base URL: NEXT_PUBLIC_API_URL (defaults to http://localhost:8000)
// ============================================================

import type { ApiError } from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
const TOKEN_STORAGE_KEY = "finchat_access_token"

let accessToken: string | null = null

function getBrowserStorage(): Storage | null {
  if (typeof window === "undefined") return null
  return window.localStorage
}

export function initializeAccessToken() {
  const storage = getBrowserStorage()
  if (!storage) return

  const stored = storage.getItem(TOKEN_STORAGE_KEY)
  if (stored) {
    accessToken = stored
  }
}

export function setAccessToken(token: string | null) {
  accessToken = token
  const storage = getBrowserStorage()
  if (!storage) return

  if (!token) {
    storage.removeItem(TOKEN_STORAGE_KEY)
    return
  }

  storage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearAccessToken() {
  setAccessToken(null)
}

export function getAccessToken(): string | null {
  return accessToken
}

export class ApiClientError extends Error {
  status: number
  detail: string

  constructor(status: number, detail: string) {
    super(detail)
    this.name = "ApiClientError"
    this.status = status
    this.detail = detail
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  headers?: Record<string, string>
  /** Skip adding Authorization header */
  noAuth?: boolean
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {}, noAuth = false } = options

  const url = `${API_BASE_URL}${endpoint}`

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  }

  if (!noAuth && accessToken) {
    requestHeaders["Authorization"] = `Bearer ${accessToken}`
  }

  const config: RequestInit = {
    method,
    headers: requestHeaders,
  }

  if (body && method !== "GET") {
    config.body = JSON.stringify(body)
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    let detail = "Error desconocido del servidor"
    try {
      const errorData: ApiError = await response.json()
      detail = errorData.detail
    } catch {
      detail = `Error ${response.status}: ${response.statusText}`
    }

    if (response.status === 401) {
      clearAccessToken()
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("finchat:unauthorized"))
      }
    }

    throw new ApiClientError(response.status, detail)
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}
