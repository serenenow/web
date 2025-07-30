// Appointment related API calls
import { apiRequest } from "./base"
import { getExpertData } from "./auth"
import { ClientDto, ServiceDto } from "./users"

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
