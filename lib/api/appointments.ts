// Appointment related API calls
import { apiRequest } from "./base"
import { getExpertData } from "./auth"
import type { ClientDto, ServiceDto } from "./users"
import { AppointmentStatus } from "@/lib/types/appointment"

export interface ExpertAppointment {
  id: string
  startTime: string
  endTime: string
  client: ClientDto
  service: ServiceDto
  location: string
  status: AppointmentStatus
  notes?: string
  meetingLink?: string
}

export interface AppointmentLists {
  upcoming: ExpertAppointment[]
  past: ExpertAppointment[]
}

/**
 * Fetch all appointments for the logged-in expert
 * @returns Promise with object containing separate upcoming and past appointment arrays
 */
export async function fetchAllAppointments(): Promise<AppointmentLists> {
  try {
    // Fetch both upcoming and past appointments in parallel for better performance
    const [upcomingAppointments, pastAppointments] = await Promise.all([
      fetchUpcomingAppointments(),
      fetchPastAppointments()
    ])
    
    // Return separate lists
    return {
      upcoming: upcomingAppointments,
      past: pastAppointments
    }
  } catch (error) {
    // If one of the requests fails, we could still return partial data
    // But for now, let's re-throw the error to maintain consistent error handling
    throw error
  }
}

/**
 * Fetch upcoming appointments for the logged-in expert
 * @returns Promise with array of upcoming appointments
 */
export async function fetchUpcomingAppointments(): Promise<ExpertAppointment[]> {
  const expertData = getExpertData()

  if (!expertData || !expertData.id) {
    throw new Error("Expert data not found. Please log in again.")
  }

  return await apiRequest<ExpertAppointment[]>(`/appointment/upcoming?expert_id=${expertData.id}`, {
    method: "GET",
  })
}

/**
 * Fetch past appointments for the logged-in expert
 * @returns Promise with array of past appointments
 */
export async function fetchPastAppointments(): Promise<ExpertAppointment[]> {
  const expertData = getExpertData()

  if (!expertData || !expertData.id) {
    throw new Error("Expert data not found. Please log in again.")
  }

  return await apiRequest<ExpertAppointment[]>(`/appointment/past?expert_id=${expertData.id}`, {
    method: "GET",
  })
}

/**
 * Approve an appointment
 * @param appointmentId - The ID of the appointment to approve
 * @returns Promise with the updated appointment data
 */
export async function approveAppointment(appointmentId: string): Promise<void> {
  return await apiRequest<void>(`/appointment/approve?appointment_id=${appointmentId}`, {
    method: "PUT",
  })
}

/**
 * Decline an appointment
 * @param appointmentId - The ID of the appointment to decline
 * @returns Promise with the updated appointment data
 */
export async function declineAppointment(appointmentId: string): Promise<void> {
  return await apiRequest<void>(`/appointment/decline?appointment_id=${appointmentId}`, {
    method: "PUT",
  })
}
