"use client"

import { useState, useCallback } from "react"
import { validateClientCode, getAvailableSlots, createBooking, createPaymentOrder, verifyPayment } from "@/lib/api"

export function useBooking() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateCode = useCallback(async (code: string) => {
    setLoading(true)
    setError(null)

    try {
      const result = await validateClientCode(code)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to validate code"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAvailableSlots = useCallback(async (therapistId: string, serviceId: string, date?: string) => {
    setLoading(true)
    setError(null)

    try {
      const result = await getAvailableSlots(therapistId, serviceId, date)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch available slots"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const bookSession = useCallback(async (bookingData: Parameters<typeof createBooking>[0]) => {
    setLoading(true)
    setError(null)

    try {
      const result = await createBooking(bookingData)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create booking"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const processPayment = useCallback(async (bookingId: string) => {
    setLoading(true)
    setError(null)

    try {
      // Create payment order
      const paymentOrder = await createPaymentOrder(bookingId)

      // Initialize Razorpay
      return new Promise((resolve, reject) => {
        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        script.onload = () => {
          const options = {
            key: paymentOrder.key,
            amount: paymentOrder.amount,
            currency: paymentOrder.currency,
            order_id: paymentOrder.orderId,
            name: "SereneNow",
            description: "Therapy Session Payment",
            handler: async (response: any) => {
              try {
                const verification = await verifyPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  bookingId,
                })
                resolve(verification)
              } catch (err) {
                reject(err)
              }
            },
            modal: {
              ondismiss: () => reject(new Error("Payment cancelled")),
            },
          }

          const rzp = new (window as any).Razorpay(options)
          rzp.open()
        }
        document.body.appendChild(script)
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Payment failed"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    validateCode,
    fetchAvailableSlots,
    bookSession,
    processPayment,
  }
}
