import { apiRequest } from "@/lib/api/base"
import { type ClientResponse } from "@/lib/api/client-auth"
import { ExpertProfileResponse } from "@/lib/api/users"
import { ServiceDetailDto } from "../api/service"

export interface VerifyCodeRequest {
  code: string
}

export interface VerifyCodeResponse {
  clientResponse: ClientResponse
  expertProfile: ExpertProfileResponse
  services: ServiceDetailDto[]
  allowDirectPayment?: boolean
  directPaymentInstructions?: string
}

const CACHE_KEY_PREFIX = "clientBookingData_"
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

export async function validateClientCode(code: string): Promise<VerifyCodeResponse> {
  try {
    const request: VerifyCodeRequest = { code }
    const response = await apiRequest<VerifyCodeResponse>("/web/auth/verify/client", {
      method: "POST",
      body: JSON.stringify(request),
    })

    // Cache the response
    const cacheData = {
      data: response,
      timestamp: Date.now(),
    }
    localStorage.setItem(`${CACHE_KEY_PREFIX}${code}`, JSON.stringify(cacheData))

    return response
  } catch (error: any) {
    throw new Error(error.message || "Invalid client code")
  }
}

export function getCachedBookingData(clientCode: string): VerifyCodeResponse | null {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${clientCode}`)
    if (!cached) return null

    const { data, timestamp } = JSON.parse(cached)

    // Check if cache is still valid
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(`${CACHE_KEY_PREFIX}${clientCode}`)
      return null
    }

    return data
  } catch (error) {
    console.error("Error reading cached booking data:", error)
    return null
  }
}

export function clearCachedBookingData(clientCode: string): void {
  localStorage.removeItem(`${CACHE_KEY_PREFIX}${clientCode}`)
}

export function updateCachedBookingData(clientCode: string, updates: Partial<VerifyCodeResponse>): void {
  try {
    const cached = getCachedBookingData(clientCode)
    if (cached) {
      const updatedData = { ...cached, ...updates }
      const cacheData = {
        data: updatedData,
        timestamp: Date.now(),
      }
      localStorage.setItem(`${CACHE_KEY_PREFIX}${clientCode}`, JSON.stringify(cacheData))
    }
  } catch (error) {
    console.error("Error updating cached booking data:", error)
  }
}
