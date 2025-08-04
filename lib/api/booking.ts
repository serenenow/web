// Booking related API calls (from your existing api.ts)
import { apiRequest } from "./base"
import { createTimeSlotFromString as createTimeSlotUtil, getBrowserTimezone } from "@/lib/utils/time-utils"

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

// Load Cashfree SDK
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
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Failed to load Cashfree SDK"))
    document.head.appendChild(script)
  })
}

// Handle Cashfree payment
export const handleCashfreePayment = async (paymentSessionId: string, orderId: string): Promise<boolean> => {
  try {
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

    console.log("Cashfree making the payment...")
    const result = await cashfree.checkout(checkoutOptions)
    console.log("Cashfree payment result "+ result)
    if (result.error) {
      console.error("Payment failed:", result.error)
      throw new Error("Payment failed. Please try again.")
    }

    if (result.redirect) {
      console.log("Payment completed successfully")
      return true
    }
    if (result.paymentDetails) {
        // This will be called whenever the payment is completed irrespective of transaction status
        console.log("Payment has been completed, Check for Payment Status");
        console.log(result.paymentDetails.paymentMessage);
        return true
      }

    return false
  } catch (error) {
    console.error("Cashfree payment error:", error)
    throw new Error("Payment processing failed. Please try again.")
  }
}
