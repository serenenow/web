import { createBookingWithPayment, handleCashfreePayment, type ServiceDetailDto } from "@/lib/api/booking"
import { sendClientInvite } from "@/lib/api/client"
import { setClientAuthToken } from "@/lib/api/client-auth"
import { createTimeSlotFromString } from "@/lib/utils/time-utils"

export interface BookingData {
  expertId: string
  serviceId: string
  selectedService: ServiceDetailDto
  date: string
  time: string
  timezone: string
  paymentMode: "online" | "direct"
  clientName: string
  clientEmail: string
}

export interface BookingResult {
  success: boolean
  orderId?: string
  appointmentId?: string
  error?: string
}

/**
 * Complete booking flow for public booking page
 * 1. Send client invite to get clientId
 * 2. Create appointment with payment
 * 3. Handle payment if online
 */
export async function processPublicBooking(bookingData: BookingData): Promise<BookingResult> {
  try {
    // Step 1: Send client invite to get clientId and accessToken
    console.log("Sending client invite...")
    const inviteResponse = await sendClientInvite({
      expertId: bookingData.expertId,
      name: bookingData.clientName,
      email: bookingData.clientEmail,
      serviceIds: [bookingData.serviceId],
      allowDirectPayment: false, // Always false for public bookings
    })

    // Extract clientId and accessToken from response
    const clientId = inviteResponse.clientId
    const accessToken = inviteResponse.accessToken
    
    if (!clientId) {
      throw new Error("Failed to create client - no client ID returned")
    }
    
    if (!accessToken) {
      throw new Error("Failed to create client - no access token returned")
    }
    
    // Save the access token to localStorage for subsequent API calls
    setClientAuthToken(accessToken)
    
    console.log("Client invite sent, clientId:", clientId)

    // Step 2: Create time slot
    const timeSlot = createTimeSlotFromString(
      bookingData.time,
      bookingData.date,
      bookingData.timezone,
      bookingData.selectedService.durationMin,
    )

    // Step 3: Create appointment
    console.log("Creating appointment...")
    const appointmentResponse = await createBookingWithPayment({
      clientId,
      expertId: bookingData.expertId,
      serviceId: bookingData.serviceId,
      date: bookingData.date,
      time: bookingData.time,
      timezone: bookingData.timezone,
      timeSlot,
      paymentMode: bookingData.paymentMode,
      serviceDetails: bookingData.selectedService,
    })

    console.log("Appointment created:", appointmentResponse)

    // Step 4: Handle payment if online
    if (bookingData.paymentMode === "online") {
      console.log("Processing online payment...")
      const paymentSuccess = await handleCashfreePayment(
        appointmentResponse.paymentSessionId,
        appointmentResponse.orderId,
      )

      if (!paymentSuccess) {
        throw new Error("Payment failed")
      }
    }

    // Step 5: Store success data for success page
    const successData = {
      orderId: appointmentResponse.orderId,
      appointmentId: appointmentResponse.id,
      paymentMethod: bookingData.paymentMode,
      bookingDate: bookingData.date,
      bookingTime: bookingData.time,
      selectedService: bookingData.selectedService,
      clientName: bookingData.clientName,
      clientEmail: bookingData.clientEmail,
    }

    sessionStorage.setItem("bookingSuccessData", JSON.stringify(successData))

    return {
      success: true,
      orderId: appointmentResponse.orderId,
      appointmentId: appointmentResponse.id,
    }
  } catch (error) {
    console.error("Booking failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Booking failed. Please try again.",
    }
  }
}

/**
 * Existing booking flow for authenticated users (booking-form.tsx)
 */
export async function processAuthenticatedBooking(
  bookingData: Omit<BookingData, "clientName" | "clientEmail"> & { clientId: string },
): Promise<BookingResult> {
  try {
    // Create time slot
    const timeSlot = createTimeSlotFromString(
      bookingData.time,
      bookingData.date,
      bookingData.timezone,
      bookingData.selectedService.durationMin,
    )

    // Create appointment
    const appointmentResponse = await createBookingWithPayment({
      clientId: bookingData.clientId,
      expertId: bookingData.expertId,
      serviceId: bookingData.serviceId,
      date: bookingData.date,
      time: bookingData.time,
      timezone: bookingData.timezone,
      timeSlot,
      paymentMode: bookingData.paymentMode,
      serviceDetails: bookingData.selectedService,
    })

    // Handle payment if online
    if (bookingData.paymentMode === "online") {
      const paymentSuccess = await handleCashfreePayment(
        appointmentResponse.paymentSessionId,
        appointmentResponse.orderId,
      )

      if (!paymentSuccess) {
        throw new Error("Payment failed")
      }
    }

    // Store success data
    const successData = {
      orderId: appointmentResponse.orderId,
      appointmentId: appointmentResponse.id,
      paymentMethod: bookingData.paymentMode,
      bookingDate: bookingData.date,
      bookingTime: bookingData.time,
      selectedService: bookingData.selectedService,
    }

    sessionStorage.setItem("bookingSuccessData", JSON.stringify(successData))

    return {
      success: true,
      orderId: appointmentResponse.orderId,
      appointmentId: appointmentResponse.id,
    }
  } catch (error) {
    console.error("Booking failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Booking failed. Please try again.",
    }
  }
}
