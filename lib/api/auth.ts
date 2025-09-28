// Authentication related API calls
import { Store } from "lucide-react"
import { STORAGE_KEYS } from "../utils/secure-storage"
import { apiRequest } from "./base"
import type { ExpertDto } from "./users"

interface EmailValidateRequest {
  email: string
}

interface EmailVerifyRequest {
  email: string
  code: string
}

interface ExpertResponse {
  accessToken: string
  hasSetupProfile: boolean
  expert: ExpertDto
}

export async function sendVerificationCode(email: string): Promise<void> {
  const requestData: EmailValidateRequest = { email }

  await apiRequest<void>("/email/auth/validate", {
    method: "POST",
    body: JSON.stringify(requestData),
  })
}

export async function verifyCode(email: string, code: string): Promise<ExpertResponse> {
  const requestData: EmailVerifyRequest = { email, code }

  return await apiRequest<ExpertResponse>("/web/auth/expert/verify", {
    method: "POST",
    body: JSON.stringify(requestData),
  })
}

// Token management functions
export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.EXPERT_AUTH_TOKEN, token)
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(STORAGE_KEYS.EXPERT_AUTH_TOKEN)
  }
  return null
}

export function removeAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEYS.EXPERT_AUTH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.EXPERT_DATA)
  }
}

export function setExpertData(expert: ExpertDto): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.EXPERT_DATA, JSON.stringify(expert))
  }
}

export function getExpertData(): ExpertDto | null {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(STORAGE_KEYS.EXPERT_DATA)
    return data ? JSON.parse(data) : null
  }
  return null
}

/**
 * Validates if the current auth token is still valid by making a test API call
 * Returns true if valid, false if invalid or expired
 */
export async function validateAuthToken(): Promise<boolean> {
  const token = getAuthToken()
  if (!token) {
    return false
  }

  try {
    // Make a simple API call to validate the token
    // Using a lightweight endpoint that requires authentication
    await apiRequest<any>("/token/validate", {
      method: "GET",
    })
    return true
  } catch (error: any) {
    // If we get a 401, the token is invalid
    if (error.status === 401) {
      return false
    }
    // For other errors, we'll assume the token is still valid
    // (could be network issues, server down, etc.)
    return true
  }
}
