"use client"

import { useState } from "react"
import { 
  validateClientCode, 
  getAvailableSlots, 
  createBooking,
  initiateCashfreePayment
} from "@/lib/api/booking"

export function useBooking() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateCode = async (code: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await validateClientCode(code)
      
      // Store booking data in sessionStorage for persistence
      sessionStorage.setItem("bookingData", JSON.stringify(result))
      
      return result
    } catch (err: any) {
      setError(err.message || "Failed to validate code")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableSlots = async (therapistId: string, serviceId: string, date?: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await getAvailableSlots(therapistId, serviceId, date)
      return result
    } catch (err: any) {
      setError(err.message || "Failed to get available slots")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const bookSession = async (bookingData: {
    clientCode: string
    therapistId: string
    serviceId: string
    date: string
    time: string
    paymentMode: "online" | "direct"
    message?: string
  }) => {
    setLoading(true)
    setError(null)
    try {
      const result = await createBooking(bookingData)
      return result
    } catch (err: any) {
      setError(err.message || "Failed to create booking")
      throw err
    } finally {
      setLoading(false)
    }
  }
  
  // Process payment - used by booking form
  const processPayment = async (bookingResult: {
    bookingId: string;
    orderId: string;
    status: string;
    paymentSessionId: string;
    orderAmount: number;
  }) => {
    setLoading(true)
    setError(null)
    try {
      // For online payments, initiate Cashfree payment flow
      if (bookingResult.status === "pending_payment" && bookingResult.paymentSessionId) {
        // Initialize Cashfree payment
        await initiateCashfreePayment(bookingResult.paymentSessionId)
        return true
      } else if (bookingResult.status === "confirmed") {
        // For direct payments, no payment processing needed
        return {
          verified: true,
          appointmentId: bookingResult.bookingId,
          status: "confirmed"
        }
      } else {
        throw new Error("Invalid booking status or missing payment session ID")
      }
    } catch (err: any) {
      setError(err.message || "Payment processing failed")
      throw err
    } finally {
      setLoading(false)
    }
  }
  
  // NOTE: Payment verification is handled by backend webhooks

  return {
    loading,
    error,
    validateCode,
    fetchAvailableSlots,
    bookSession,
    processPayment
  }
}
