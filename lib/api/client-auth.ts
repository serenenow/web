// Client authentication related API calls and storage
import { apiRequest } from "./base"
import type { Client } from "./client"
import { plainLocalStorage, STORAGE_KEYS } from "@/lib/utils/secure-storage"

export interface ClientDto {
  id: string
  email: string
  name: string
  phoneNumber?: string
  age?: number
  gender?: string
  timezone?: string
  address?: {
    street?: string
    city?: string
    state?: string
    stateCode?: string
    country?: string
    pincode?: string
  }
  emergencyContact?: {
    name?: string
    email?: string
    phoneNumber?: string
    relation?: string
  }
}

export interface ClientResponse {
  accessToken: string
  hasSetupProfile: boolean
  client: ClientDto
}

/**
 * Store client authentication token securely with expiration
 */
export function setClientAuthToken(token: string): void {
  plainLocalStorage.setItem(STORAGE_KEYS.CLIENT_AUTH_TOKEN, token)
}

/**
 * Get client authentication token from secure storage
 */
export function getClientAuthToken(): string | null {
  return plainLocalStorage.getItem<string>(STORAGE_KEYS.CLIENT_AUTH_TOKEN)
}

/**
 * Remove client authentication token from secure storage
 */
export function removeClientAuthToken(): void {
  plainLocalStorage.removeItem(STORAGE_KEYS.CLIENT_AUTH_TOKEN)
}

/**
 * Store client data in secure storage
 */
export function setClientData(client: ClientDto): void {
  plainLocalStorage.setItem(STORAGE_KEYS.CLIENT_DATA, client)
}

/**
 * Get client data from secure storage
 */
export function getClientData(): ClientDto | null {
  return plainLocalStorage.getItem<ClientDto>(STORAGE_KEYS.CLIENT_DATA)
}

/**
 * Store complete client response (token + data) in secure storage
 */
export function setClientResponse(response: ClientResponse): void {
  setClientAuthToken(response.accessToken)
  setClientData(response.client)
}

/**
 * Clear all client-related data from localStorage
 */
export function clearClientData(): void {
  if (typeof window !== "undefined") {
    removeClientAuthToken()
    plainLocalStorage.removeItem(STORAGE_KEYS.CLIENT_DATA)
  }
}
