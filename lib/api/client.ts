import { apiRequest } from "./base"

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
  return apiRequest<any>("/invite/web/client/send", {
    method: "POST",
    body: JSON.stringify(inviteRequest),
  })
}

/**
 * Gender enum
 */
export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  NON_BINARY = "NON_BINARY",
  PREFER_NOT_TO_SAY = "PREFER_NOT_TO_SAY"
}

/**
 * Client status enum
 */
export enum ClientStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED"
}

/**
 * Address data structure
 */
export interface AddressDto {
  street: string
  city: string
  state: string
  stateCode: string
  country: string
  pincode: string
}

/**
 * Emergency contact data structure
 */
export interface EmergencyContactDto {
  name: string
  email?: string
  phoneNumber: string
  relation: string
}

/**
 * TimeZone serializer for Kotlin compatibility
 */
export class TimeZoneSerializer {
  static stringify(value: string): string {
    return value
  }
  
  static parse(value: string): string {
    return value || new Intl.DateTimeFormat().resolvedOptions().timeZone
  }
}

/**
 * Client update request structure
 */
export interface ClientUpdateRequest {
  id: string
  name?: string
  phoneNumber?: string
  age?: number
  gender?: Gender
  pictureUrl?: string
  timezone?: string
  clientStatus?: ClientStatus
  address?: AddressDto
  emergencyContact?: EmergencyContactDto
}

/**
 * Update client profile
 * @param updateRequest The client update request data
 * @returns Promise with the updated client
 */
export async function updateClientProfile(updateRequest: ClientUpdateRequest): Promise<Client> {
  return apiRequest<Client>("/client/profile", {
    method: "PUT",
    body: JSON.stringify(updateRequest),
  })
}
