import { apiRequest } from "./base"

export interface GoogleConnectionStatus {
  isConnected: boolean
  calendarAccess: boolean
  meetAccess: boolean
}

export interface GoogleAccessRequest {
  userId: string
  accessToken: string
  serverAuthCode: string
  codeVerifier?: string
}

export async function getGoogleConnectionStatus(expertId: string): Promise<GoogleConnectionStatus> {
  try {
    return await apiRequest<GoogleConnectionStatus>(`/google/access?expert_id=${expertId}`, {
      method: "GET",
    })
  } catch (error) {
    logger.error("Failed to get Google connection status:", error)
    // Return default status when API call fails
    return {
      isConnected: false,
      calendarAccess: false,
      meetAccess: false,
    }
  }
}

export async function exchangeGoogleAuthCode(request: GoogleAccessRequest): Promise<void> {
  // API returns empty success response, so we don't expect any body
  await apiRequest("/google/access", {
    method: "POST",
    body: JSON.stringify(request),
  })
}
