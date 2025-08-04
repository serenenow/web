// Dashboard related API calls
import { apiRequest } from "./base"
import { ExpertDto, ServiceDto, ExpertAppointment } from "./users"

export interface DashboardData {
  services: ServiceDto[]
  appointments: ExpertAppointment[]
  isNewUser: boolean
}

/**
 * Fetches all data needed for the dashboard
 * @param expertId The ID of the expert
 * @returns Combined dashboard data with services and appointments
 */
export async function fetchDashboardData(expertId: string): Promise<DashboardData> {
  try {
    // Fetch services and appointments in parallel
    const [services, appointments] = await Promise.all([
      fetchExpertServices(expertId),
      fetchUpcomingAppointments(expertId)
    ])

    // Determine if this is a new user based on services
    const isNewUser = services.length === 0

    return {
      services,
      appointments,
      isNewUser
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    // Return empty data on error
    return {
      services: [],
      appointments: [],
      isNewUser: true // Default to new user flow on error
    }
  }
}

/**
 * Fetches services offered by an expert
 * @param expertId The ID of the expert
 * @returns List of services
 */
export async function fetchExpertServices(expertId: string): Promise<ServiceDto[]> {
  try {
    return await apiRequest<ServiceDto[]>(`/expert/services?expert_id=${expertId}`, {
      method: "GET"
    })
  } catch (error) {
    console.error("Error fetching expert services:", error)
    return []
  }
}

/**
 * Fetches upcoming appointments for an expert
 * @param expertId The ID of the expert
 * @returns List of upcoming appointments
 */
export async function fetchUpcomingAppointments(expertId: string): Promise<ExpertAppointment[]> {
  try {
    return await apiRequest<ExpertAppointment[]>(`/appointment/upcoming?expert_id=${expertId}`, {
      method: "GET"
    })
  } catch (error) {
    console.error("Error fetching upcoming appointments:", error)
    return []
  }
}

/**
 * Gets the expert data from localStorage
 * @returns The expert data or null if not found
 */
export function getStoredExpertData(): ExpertDto | null {
  try {
    const expertDataString = localStorage.getItem('expert_data')
    if (!expertDataString) return null
    
    return JSON.parse(expertDataString) as ExpertDto
  } catch (error) {
    console.error("Error retrieving expert data from localStorage:", error)
    return null
  }
}
