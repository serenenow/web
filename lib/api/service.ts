import { apiRequest } from "./base"

export enum Location {
  IN_PERSON = "IN_PERSON",
  PHONE_CALL = "PHONE_CALL",
  GOOGLE_MEET = "GOOGLE_MEET",
}

export interface ServiceAddRequest {
  expertId: string
  title: string
  description: string
  price: number
  taxId?: string | null
  durationMin: number
  bufferMin: number
  location: Location
  cancellationDeadlineHours: number
  cancellationPercent: number
  rescheduleDeadlineHours: number
  reschedulePercent: number
  useCustomAvailability: boolean
  minHoursNotice: number
}

export interface Service {
  id: string
  expertId: string
  title: string
  description: string
  price: number
  taxId?: string | null
  durationMin: number
  bufferMin: number
  location: Location
  status: string
  cancellationDeadlineHours: number
  cancellationPercent: number
  rescheduleDeadlineHours: number
  reschedulePercent: number
  useCustomAvailability: boolean
  minHoursNotice: number
  createdAt: string
  updatedAt: string
}

/**
 * Add a new service
 * @param service Service data to add
 * @returns The newly created service
 */
export async function addService(service: ServiceAddRequest): Promise<Service> {
  // Set default values for taxId and useCustomAvailability
  const serviceData: ServiceAddRequest = {
    ...service,
    taxId: service.taxId || null,
    useCustomAvailability: service.useCustomAvailability || false
  }
  
  return apiRequest<Service>("/service", {
    method: "POST",
    body: JSON.stringify(serviceData)
  })
}

/**
 * Get services for an expert
 * @param expertId The expert ID to get services for
 * @returns List of services for the expert
 */
export async function getExpertServices(expertId: string): Promise<Service[]> {
  return apiRequest<Service[]>(`/expert/services?expert_id=${expertId}`)
}
