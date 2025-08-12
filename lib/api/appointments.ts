// Appointment related API calls
import { apiRequest } from "./base"
import { getExpertData } from "./auth"
import type { ClientDto, ServiceDto } from "./users"

export interface ExpertAppointment {
  id: string
  startTime: string
  endTime: string
  client: ClientDto
  service: ServiceDto
  location: string
  status: string
  notes?: string
  meetingLink?: string
}

/**
 * Fetch all appointments for the logged-in expert
 * @returns Promise with array of all appointments (upcoming + past)
 */
export async function fetchAllAppointments(): Promise<ExpertAppointment[]> {
  try {
    // Fetch both upcoming and past appointments in parallel for better performance
    const [upcomingAppointments, pastAppointments] = await Promise.all([
      fetchUpcomingAppointments(),
      fetchPastAppointments()
    ])
    
    // Combine the results
    return [...upcomingAppointments, ...pastAppointments]
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
