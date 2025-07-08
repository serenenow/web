// Authentication related API calls
import { apiRequest } from "./base"

interface EmailValidateRequest {
  email: string
}

interface EmailVerifyRequest {
  email: string
  code: string
}

interface ExpertDto {
  id: string
  email: string
  name: string
  qualification: string
  pictureUrl: string
  authSource: string
  activationStatus: string
  timeZone: string
  firebaseTokenId?: string
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
    console.log('Saving auth token:', token);
    localStorage.setItem("auth_token", token)
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token")
  }
  return null
}

export function removeAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("expert_data")
  }
}

export function setExpertData(expert: ExpertDto): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("expert_data", JSON.stringify(expert))
  }
}

export function getExpertData(): ExpertDto | null {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem("expert_data")
    return data ? JSON.parse(data) : null
  }
  return null
}
