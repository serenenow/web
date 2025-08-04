// Client authentication related API calls and storage
import { apiRequest } from "./base"
import type { Client } from "./client"

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
 * Store client authentication token in localStorage
 */
export function setClientAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("client_auth_token", token)
  }
}

/**
 * Get client authentication token from localStorage
 */
export function getClientAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("client_auth_token")
  }
  return null
}

/**
 * Remove client authentication token from localStorage
 */
export function removeClientAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("client_auth_token")
  }
}

/**
 * Store client data in localStorage
 */
export function setClientData(client: ClientDto): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("client_data", JSON.stringify(client))
  }
}

/**
 * Get client data from localStorage
 */
export function getClientData(): ClientDto | null {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem("client_data")
    return data ? JSON.parse(data) : null
  }
  return null
}

/**
 * Store complete client response (token + data) in localStorage
 */
export function setClientResponse(response: ClientResponse): void {
  if (typeof window !== "undefined") {
    setClientAuthToken(response.accessToken)
    setClientData(response.client)
  }
}

/**
 * Clear all client-related data from localStorage
 */
export function clearClientData(): void {
  if (typeof window !== "undefined") {
    removeClientAuthToken()
    localStorage.removeItem("client_data")
  }
}
