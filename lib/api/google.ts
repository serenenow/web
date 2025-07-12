import { apiRequest } from "./base"

export interface GoogleAuthResponse {
  auth_url: string
  state: string
}

export interface GoogleConnectionStatus {
  is_connected: boolean
  email?: string
  calendar_access: boolean
  meet_access: boolean
  connected_at?: string
}

/**
 * Initiates Google OAuth flow for Calendar and Meet access
 */
export async function initiateGoogleAuth(): Promise<GoogleAuthResponse> {
  try {
    const response = await apiRequest<GoogleAuthResponse>("/auth/google/initiate", {
      method: "POST",
      body: JSON.stringify({
        scopes: ["calendar", "meet"],
        redirect_uri: `${window.location.origin}/auth/google/callback`,
      }),
    })

    return response
  } catch (error) {
    console.error("Failed to initiate Google auth:", error)
    throw error
  }
}

/**
 * Checks if user has connected their Google account
 */
export async function getGoogleConnectionStatus(): Promise<GoogleConnectionStatus> {
  try {
    const response = await apiRequest<GoogleConnectionStatus>("/auth/google/status", {
      method: "GET",
    })

    return response
  } catch (error) {
    console.error("Failed to get Google connection status:", error)
    return {
      is_connected: false,
      calendar_access: false,
      meet_access: false,
    }
  }
}

/**
 * Disconnects Google account
 */
export async function disconnectGoogle(): Promise<void> {
  try {
    await apiRequest("/auth/google/disconnect", {
      method: "POST",
    })
  } catch (error) {
    console.error("Failed to disconnect Google account:", error)
    throw error
  }
}

/**
 * Handle Google OAuth callback
 */
export async function handleGoogleCallback(code: string, state: string): Promise<GoogleConnectionStatus> {
  return await apiRequest<GoogleConnectionStatus>("/auth/google/callback", {
    method: "POST",
    body: JSON.stringify({ code, state }),
  })
}
