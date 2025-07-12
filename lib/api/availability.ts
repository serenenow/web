import { apiRequest } from "./base"

/**
 * Enum for days of the week (1-7, Monday to Sunday)
 */
export enum DayOfWeek {
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
  SUNDAY = 7,
}

/**
 * Availability data structure returned by API
 */
export interface AvailabilityDto {
  id?: string | null
  dayOfWeek: number
  isRecurring: boolean
  isUnavailable: boolean
  startTime: string
  endTime: string
}

/**
 * Request structure for adding/updating availabilities
 */
export interface AvailabilityAddUpdateRequest {
  availabilities: AvailabilityDto[]
}

/**
 * Get expert availability
 * @param expertId - The expert ID
 * @returns Promise with list of AvailabilityDto
 */
export const getExpertAvailability = async (expertId: string): Promise<AvailabilityDto[]> => {
  try {
    const response = await apiRequest(`/availability/work?expert_id=${expertId}`, {
      method: "GET",
    })
    return response as AvailabilityDto[]
  } catch (error) {
    console.error("Error fetching expert availability:", error)
    throw error
  }
}

/**
 * Update expert availability
 * @param expertId - The expert ID
 * @param data - The availability data to update
 * @returns Promise with the response
 */
export const updateExpertAvailability = async (expertId: string, data: AvailabilityAddUpdateRequest): Promise<any> => {
  try {
    const response = await apiRequest<any>(`/availability/work?expert_id=${expertId}`, {
      method: "POST",
      body: JSON.stringify(data),
    })
    return response
  } catch (error) {
    console.error("Error updating expert availability:", error)
    throw error
  }
}
