"use client"

import { useState } from "react"
import { validateClientCode, getAvailableSlots, createBooking } from "@/lib/api"

export function useBooking() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateCode = async (code: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await validateClientCode(code)
      return result
    } catch (err: any) {
      setError(err.message || "Failed to validate code")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const getSlots = async (therapistId: string, serviceId: string, date?: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getAvailableSlots(therapistId, serviceId, date)
      return result
    } catch (err: any) {
      setError(err.message || "Failed to get available slots")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const bookAppointment = async (bookingData: any) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await createBooking(bookingData)
      return result
    } catch (err: any) {
      setError(err.message || "Failed to create booking")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    error,
    validateCode,
    getSlots,
    bookAppointment,
  }
}
