import { apiRequest } from "./base"
import type { ExpertDto } from "./users"

export interface AdminStats {
  totalAppointments: number
  appointmentsByStatus: {
    PAYMENT_PENDING: number
    NEEDS_APPROVAL: number
    SCHEDULED: number
    COMPLETED: number
    CANCELLED: number
    NO_SHOW: number
    PAYMENT_FAILED: number
  }
  totalExperts: number
  totalEmailVerifications: number
  emailVerificationsByStatus: {
    VERIFIED: number
    PENDING: number
  }
  recentAppointments: AdminAppointment[]
  experts: ExpertDto[]
}

export interface AdminAppointment {
  id: string
  expertName: string
  appointmentDateTime: string
  status: string
  gatewayOrderId: string
}

export interface ConfirmAppointmentRequest {
  orderId: string
}

export interface ConfirmAppointmentResponse {
  success: boolean
  message: string
}

export interface AdminAuthRequest {
  password: string
}

export interface AdminAuthResponse {
  success: boolean
  message?: string
}

export interface AdminTransactionRequest {
  expertId: string
  startDate: string // ISO 8601 format
  endDate: string // ISO 8601 format
}

export interface AdminPaymentTransactionDetails {
  id: string
  appointmentId: string
  invoiceId: string
  gatewayOrderId?: string
  totalAmount: number
  expertEarnings: number
  platformFee: number
  gateway: string
  status: string
  createdAt: string // ISO 8601 format
}

/**
 * Authenticate admin user with password
 */
export async function authenticateAdmin(password: string): Promise<AdminAuthResponse> {
  try {
    await apiRequest<void>("/admin/auth", {
      method: "POST",
      body: JSON.stringify({ password }),
    })
    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Authentication failed" 
    }
  }
}

/**
 * Fetch admin statistics and recent appointments
 */
export async function getAdminStats(): Promise<AdminStats> {
  return apiRequest<AdminStats>("/admin/stats")
}

/**
 * Manually confirm an appointment by order ID
 */
export async function confirmAppointment(orderId: string): Promise<ConfirmAppointmentResponse> {
  return apiRequest<ConfirmAppointmentResponse>("/admin/confirm-appointment", {
    method: "POST",
    body: JSON.stringify({ orderId }),
  })
}

/**
 * Get transaction details for a specific expert within date range
 */
export async function getAdminTransactions(
  expertId: string,
  startDate: string,
  endDate: string,
): Promise<AdminPaymentTransactionDetails[]> {
  return apiRequest<AdminPaymentTransactionDetails[]>("/admin/transactions", {
    method: "POST",
    body: JSON.stringify({ expertId, startDate, endDate }),
  })
}
