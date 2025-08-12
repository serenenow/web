// Booking related API calls (from your existing api.ts)
import { apiRequest } from "./base"
import { storePaymentSession, getPaymentSession, generateSessionReference, storeSessionReference } from "@/lib/utils/secure-payment"
import { logger } from "@/lib/utils/logger"

// Payment and appointment types
export enum PaymentProvider {
  CASH_FREE = "CASH_FREE",
  RAZORPAY = "RAZORPAY",
  DIRECT = "DIRECT",
}

export enum Location {
  IN_PERSON = "IN_PERSON",
  PHONE_CALL = "PHONE_CALL",
  GOOGLE_MEET = "GOOGLE_MEET"
}

export interface AppointmentPayment {
  amount: number
  taxAmount: number
  platformFee: number
  totalAmount: number
  gateway: PaymentProvider
}

export interface AppointmentAddRequest {
  startTime: string // ISO 8601 format
  endTime: string // ISO 8601 format
  serviceId: string
  expertId: string
  clientId: string
  location: Location
  notes?: string
  paymentData: AppointmentPayment
}

export interface AppointmentResponse {
  id: string
  orderId: string
  paymentSessionId: string
  orderAmount: number
}

// Cashfree integration types
declare global {
  interface Window {
    Cashfree: any
  }
}

// API call to create appointment
export const createAppointment = async (appointmentData: AppointmentAddRequest): Promise<AppointmentResponse> => {
  return apiRequest<AppointmentResponse>("/appointment", {
    method: "POST",
    body: JSON.stringify(appointmentData),
  })
}

// Cashfree SDK integrity hash (SHA-384)  
// This should be updated whenever the SDK is updated
const CASHFREE_SDK_INTEGRITY = "sha384-JcKb8q3iqJ61gNV9KGb8thSsNjpSL0n8PARn9HuZOnIxN0hoP+VmmDGMN5t9UJ0Z"

// Load Cashfree SDK with integrity check
export const loadCashfreeSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.Cashfree) {
      resolve()
      return
    }

    if (typeof window === "undefined") {
      reject(new Error("Window object not available"))
      return
    }

    const script = document.createElement("script")
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js"
    script.async = true
    
    // Add integrity and crossorigin attributes for security
    script.integrity = CASHFREE_SDK_INTEGRITY
    script.crossOrigin = "anonymous"
    
    script.onload = () => resolve()
    script.onerror = (error) => {
      logger.error("Failed to load Cashfree SDK:", error)
      reject(new Error("Failed to load Cashfree SDK. Please check network connection or try again later."))
    }
    document.head.appendChild(script)
  })
}

// Handle Cashfree payment
export const handleCashfreePayment = async (
  paymentSessionId: string, 
  orderId: string, 
  appointmentId: string,
  bookingData?: {
    bookingDate?: string;
    bookingTime?: string;
    bookingTimezone?: string;
    selectedService?: any;
    paymentMethod?: string;
  }
): Promise<boolean> => {
  try {
    // Store payment session data securely before initiating payment
    const sessionRef = generateSessionReference();
    storeSessionReference(sessionRef, paymentSessionId);
    
    // Store complete payment session data
    storePaymentSession({
      orderId,
      appointmentId,
      paymentSessionId,
      paymentMethod: bookingData?.paymentMethod || 'online',
      bookingDate: bookingData?.bookingDate,
      bookingTime: bookingData?.bookingTime,
      bookingTimezone: bookingData?.bookingTimezone,
      selectedService: bookingData?.selectedService
    });
    
    await loadCashfreeSDK()

    if (typeof window === "undefined" || !window.Cashfree) {
      throw new Error("Cashfree SDK not available")
    }

    const cashfree = window.Cashfree({
      mode: process.env.NODE_ENV === "production" ? "production" : "sandbox",
    })

    const checkoutOptions = {
      paymentSessionId: paymentSessionId,
      redirectTarget: "_modal",
    }

    const result = await cashfree.checkout(checkoutOptions)
    
    if (result.error) {
      logger.error("Payment failed:", result.error)
      throw new Error("Payment failed. Please try again.")
    }

    if (result.redirect) {
      return true
    }
    
    if (result.paymentDetails) {
      // This will be called whenever the payment is completed irrespective of transaction status
      return true
    }

    return false
  } catch (error) {
    logger.error("Cashfree payment error:", error)
    throw new Error("Payment processing failed. Please try again.")
  }
}
