/**
 * Secure payment utilities for handling payment session data
 * Prevents exposing sensitive payment IDs in URLs
 */

import { secureSessionStorage, STORAGE_KEYS } from "./secure-storage"
import type { ServiceDetailDto } from "@/lib/api/service"

// Payment session data interface
export interface PaymentSessionData {
  orderId: string
  appointmentId: string
  paymentSessionId: string
  paymentMethod: string
  bookingDate?: string
  bookingTime?: string
  bookingTimezone?: string
  selectedService?: ServiceDetailDto
  createdAt: number // Timestamp when this session was created
}

// Constants
const PAYMENT_SESSION_EXPIRY_MINUTES = 60 // 1 hour expiry for payment sessions

/**
 * Store payment session data securely
 * @param sessionData Payment session data to store
 */
export function storePaymentSession(sessionData: Omit<PaymentSessionData, "createdAt">): void {
  const dataWithTimestamp: PaymentSessionData = {
    ...sessionData,
    createdAt: new Date().getTime(),
  }
  
  secureSessionStorage.setItem(
    STORAGE_KEYS.PAYMENT_SESSION, 
    dataWithTimestamp, 
    PAYMENT_SESSION_EXPIRY_MINUTES
  )
}

/**
 * Get current payment session data
 * @returns Payment session data or null if not found
 */
export function getPaymentSession(): PaymentSessionData | null {
  return secureSessionStorage.getItem<PaymentSessionData>(STORAGE_KEYS.PAYMENT_SESSION)
}

/**
 * Clear payment session data
 */
export function clearPaymentSession(): void {
  secureSessionStorage.removeItem(STORAGE_KEYS.PAYMENT_SESSION)
}

/**
 * Generate a unique session reference ID for success/failure redirects
 * This avoids exposing actual payment session IDs in URLs
 * @returns A unique reference ID
 */
export function generateSessionReference(): string {
  return `ref_${Math.random().toString(36).substring(2, 15)}_${Date.now().toString(36)}`
}

/**
 * Store session reference mapping to actual payment session
 * @param reference The reference ID
 * @param sessionId The actual payment session ID
 */
export function storeSessionReference(reference: string, sessionId: string): void {
  const referenceMap = secureSessionStorage.getItem<Record<string, string>>(STORAGE_KEYS.PAYMENT_REFERENCES) || {}
  referenceMap[reference] = sessionId
  secureSessionStorage.setItem(STORAGE_KEYS.PAYMENT_REFERENCES, referenceMap, PAYMENT_SESSION_EXPIRY_MINUTES)
}

/**
 * Get payment session ID from reference
 * @param reference The reference ID
 * @returns The payment session ID or null if not found
 */
export function getSessionIdFromReference(reference: string): string | null {
  const referenceMap = secureSessionStorage.getItem<Record<string, string>>(STORAGE_KEYS.PAYMENT_REFERENCES)
  return referenceMap?.[reference] || null
}

/**
 * Remove a session reference mapping
 * @param reference The reference ID to remove
 */
export function removeSessionReference(reference: string): void {
  const referenceMap = secureSessionStorage.getItem<Record<string, string>>(STORAGE_KEYS.PAYMENT_REFERENCES)
  if (referenceMap && reference in referenceMap) {
    delete referenceMap[reference]
    secureSessionStorage.setItem(STORAGE_KEYS.PAYMENT_REFERENCES, referenceMap)
  }
}
