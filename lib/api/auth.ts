// Authentication related API calls
import { apiRequest } from "./base"

interface LoginResponse {
  success: boolean
  message: string
}

interface VerifyCodeResponse {
  success: boolean
  isNewUser: boolean
  token: string
  user?: {
    id: string
    email: string
    firstName?: string
    lastName?: string
  }
}

export async function sendVerificationCode(email: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/send-code", {
    method: "POST",
    body: JSON.stringify({ email }),
  })
}

export async function verifyCode(email: string, code: string): Promise<VerifyCodeResponse> {
  try {
    const data = await apiRequest<VerifyCodeResponse>("/auth/verify-code", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    })

    // Store token if login successful
    if (data.success && data.token) {
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", data.token)
      }
    }

    return data
  } catch (error) {
    console.error("Verify code error:", error)
    throw error
  }
}

export async function resendVerificationCode(email: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/resend-code", {
    method: "POST",
    body: JSON.stringify({ email }),
  })
}

export function getAuthToken(): string | null {
  try {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token")
    }
  } catch (error) {
    console.error("Error getting auth token:", error)
  }
  return null
}

export function removeAuthToken(): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
  } catch (error) {
    console.error("Error removing auth token:", error)
  }
}
