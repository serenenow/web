import { apiRequest } from "./base"
import { getBrowserTimezone, formatTime12Hour } from "../utils/time-utils"

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

// Get available slots
export interface TimeSlot {
  startTime: string // ISO 8601 format
  endTime: String
  available?: boolean // Optional property for UI display
}

// Format the response to match what the UI expects
export interface FormattedTimeSlot {
  time: string
  available: boolean
  timezone: string
  // Original UTC times from API
  startTimeUtc: string
  endTimeUtc: string
}

export interface FormattedAvailableSlots {
  timeSlots: Array<FormattedTimeSlot>
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

// Helper to format time slots for the UI
function formatTimeSlots(timeSlots: TimeSlot[]): FormattedTimeSlot[] {
  return timeSlots.map((slot) => {
    // Parse the ISO string to get hours and minutes
    const startTime = new Date(slot.startTime)
    const hours = startTime.getHours()
    const minutes = startTime.getMinutes()

    // Format as 24-hour time to 12-hour for display
    const formattedTime = formatTime12Hour(`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`)

    return {
      time: formattedTime,
      available: true, // Assume all returned slots are available
      timezone: getBrowserTimezone(), // Show times in browser timezoner
      // Store original UTC times from API
      startTimeUtc: slot.startTime,
      endTimeUtc: slot.endTime as string
    }
  })
}

export async function getAvailableSlots(expertId: string, serviceId: string, date?: string) {
  const params = new URLSearchParams()
  params.append("expert_id", expertId)
  params.append("service_id", serviceId)
  if (date) params.append("selected_date", date)

  // Get time slots from API
  const timeSlots = await apiRequest<TimeSlot[]>(`/service/slots?${params}`)

  // Format the response for the UI
  const formattedResponse: FormattedAvailableSlots = {
    // Format time slots
    timeSlots: formatTimeSlots(timeSlots),
  }

  return formattedResponse
}
