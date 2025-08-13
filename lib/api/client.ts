import { apiRequest } from "./base"
import { getBrowserTimezone } from "@/lib/utils/time-utils"

/**
 * Auth source enum for client authentication
 */
export enum AuthSource {
  WEB = "WEB",
  EMAIL = "EMAIL",
  GOOGLE = "GOOGLE"
}

/**
 * Activation status enum for client account status
 */
export enum ActivationStatus {
  PENDING = "PENDING",
  ACTIVATED = "ACTIVATED",
  DEACTIVATED = "DEACTIVATED"
}

/**
 * Client data structure returned by API
 */
export interface Client {
  id: string
  name: string
  email: string
  pictureUrl: string
  authSource: AuthSource
  activationStatus: ActivationStatus
  timeZone: string
  firebaseTokenId?: string
}

/**
 * Request structure for sending client invites
 */
export interface SendClientInviteRequest {
  expertId: string
  name: string
  email: string
  serviceIds: string[]
  allowDirectPayment: boolean
  directPaymentInstructions?: string | null
}

/**
 * Client payment options configuration
 */
export interface ClientPaymentOptions {
  allowDirectPayment: boolean
  directPaymentNotes?: string | null
}

/**
 * Fetch clients for a specific expert
 * @param expertId The expert's ID
 * @returns Promise with array of clients
 */
export async function getExpertClients(expertId: string): Promise<Client[]> {
  return apiRequest<Client[]>(`/expert/clients?expert_id=${expertId}`)
}

/**
 * Send an invitation to a client
 * @param inviteRequest The client invite request data
 * @returns Promise with the response
 */
export async function sendClientInvite(inviteRequest: SendClientInviteRequest): Promise<any> {
  return apiRequest<any>("/web/auth/invite/client", {
    method: "POST",
    body: JSON.stringify(inviteRequest),
  })
}

/**
 * Get payment options for a specific client
 * @param clientId The client's ID
 * @returns Promise with client payment options
 */
export async function getClientPaymentOptions(clientId: string): Promise<ClientPaymentOptions> {
  return apiRequest<ClientPaymentOptions>(`/client/payment-options?client_id=${clientId}`)
}
