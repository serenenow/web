import { apiRequest } from "@/lib/api/base"
import { updateCachedBookingData } from "./client-code-service"
import type { ClientDto } from "../api/client-auth"
import { type Client } from "@/lib/api/client"

export interface AddressDto {
  userId?: string
  street: string
  city: string
  state: string
  stateCode: string
  country: string
  pincode: string
}

export interface EmergencyContactDto {
  userId?: string
  name: string
  email?: string
  phoneNumber?: string
  relation: string
}


export interface ClientRegistrationData {
  name: string
  email: string
  phone?: string
}

export interface WebClientRegisterRequest {
  name: string
  email: string
  timeZone: string
  phoneNumber: string
  age: number
  gender: string
  address: AddressDto
  emergencyContact: EmergencyContactDto
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
 * Client update request structure
 */
export interface ClientUpdateRequest {
  id: string
  name?: string
  phoneNumber?: string
  age?: number
  gender?: string
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

