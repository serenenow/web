"use client"

import { useState, useRef } from "react"
import {
  validateClientCode,
  getAvailableSlots,
  registerClient,
  createBookingWithPayment,
  handleCashfreePayment,
  type VerifyCodeResponse,
  type WebClientRegisterRequest,
  type FormattedAvailableSlots,
} from "@/lib/api/booking"
import { getBrowserTimezone } from "@/lib/utils/time-utils"
import { updateClientProfile, type ClientUpdateRequest } from "@/lib/api/client"

export function useBooking() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugMode, setDebugMode] = useState(false)
  
  // Helper function to log debug info
  const logDebug = (message: string, data?: any) => {
    if (debugMode) {
      console.log(`[Booking] ${message}`, data || '')
    }
  }

  const validateCode = async (code: string): Promise<VerifyCodeResponse> => {
    setLoading(true)
    setError(null)
    try {
      const result = await validateClientCode(code)
      
      logDebug('Received booking data from API', result)
      
      // Validate the result structure
      if (!result.expert) {
        console.error('Missing expert data in booking response')
      }
      
      if (!result.services || result.services.length === 0) {
        console.error('No services found in booking response')
      }

      // Store booking data in sessionStorage for persistence
      sessionStorage.setItem("bookingData", JSON.stringify(result))
      logDebug('Stored booking data in sessionStorage')

      return result
    } catch (err: any) {
      const errorMsg = err.message || "Failed to validate code"
      setError(errorMsg)
      console.error('Code validation error:', errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const registerNewClient = async (clientData: WebClientRegisterRequest) => {
    setLoading(true)
    setError(null)
    try {
      const result = await registerClient(clientData)
      return result
    } catch (err: any) {
      setError(err.message || "Failed to register client")
      throw err
    } finally {
      setLoading(false)
    }
  }
  
  const updateProfile = async (updateData: ClientUpdateRequest) => {
    setLoading(true)
    setError(null)
    try {
      const result = await updateClientProfile(updateData)
      return result
    } catch (err: any) {
      setError(err.message || "Failed to update client profile")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Cache for available slots to prevent redundant API calls
  const slotsCache = useRef<Record<string, FormattedAvailableSlots>>({});
  
  const fetchAvailableSlots = async (expertId: string, serviceId: string, date?: string, timezone?: string) => {
    // Create a cache key based on the parameters including timezone
    const cacheKey = `${expertId}_${serviceId}_${date || 'all'}_${timezone || getBrowserTimezone()}`;
    
    // Check if we have cached results
    if (slotsCache.current[cacheKey]) {
      logDebug(`Using cached slots for ${cacheKey}`);
      return slotsCache.current[cacheKey];
    }
    
    setLoading(true);
    setError(null);
    
    try {
      logDebug(`Fetching slots for expert: ${expertId}, service: ${serviceId}, date: ${date || 'all'}`);
      const result = await getAvailableSlots(expertId, serviceId, date);
      
      // Cache the result
      slotsCache.current[cacheKey] = result;
      logDebug('Slots fetched successfully', result);
      
      return result;
    } catch (err: any) {
      const errorMsg = err.message || "Failed to get available slots";
      setError(errorMsg);
      console.error('Error fetching slots:', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  const bookSession = async (bookingData: {
    clientCode: string
    expertId: string
    serviceId: string
    date: string
    time: string
    paymentMode: "online" | "direct"
    message?: string
  }) => {
    setLoading(true)
    setError(null)
    try {
      const result = await createBookingWithPayment({
        clientId: bookingData.clientCode,
        expertId: bookingData.expertId,
        serviceId: bookingData.serviceId,
        date: bookingData.date,
        time: bookingData.time,
        paymentMode: bookingData.paymentMode,
        timezone: getBrowserTimezone(),
        serviceDetails: { 
          id: '', 
          title: '', 
          description: '', 
          price: 0, 
          location: '', 
          platformFees: 0,
          totalTaxes: 0,
          total: 0,
          durationMin: 60,
          bufferMin: 0,
          cancellationDeadlineHours: 24,
          cancellationPercent: 0,
          rescheduleDeadlineHours: 24,
          reschedulePercent: 0,
          useCustomAvailability: false,
          minHoursNotice: 24
        } // This is required but will be populated from the server
      })
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
    bookingId: string
    orderId: string
    status: string
    paymentSessionId: string
    orderAmount: number
  }) => {
    setLoading(true)
    setError(null)
    try {
      // For online payments, initiate Cashfree payment flow
      if (bookingResult.status === "pending_payment" && bookingResult.paymentSessionId) {
        // Initialize Cashfree payment
        await handleCashfreePayment(bookingResult.paymentSessionId, bookingResult.orderId)
        return true
      } else if (bookingResult.status === "confirmed") {
        // For direct payments, no payment processing needed
        return {
          verified: true,
          appointmentId: bookingResult.bookingId,
          status: "confirmed",
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
    registerNewClient,
    updateProfile,
    fetchAvailableSlots,
    bookSession,
    processPayment,
  }
}
