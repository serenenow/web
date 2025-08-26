import { 
  createAppointment, 
  handleCashfreePayment, 
  handleRazorpayPayment,
  Location, 
  PaymentProvider, 
  type AppointmentAddRequest } from "@/lib/api/booking"
import { sendClientInvite } from "@/lib/api/client"
import { setClientAuthToken } from "@/lib/api/client-auth"
import type { ServiceDetailDto } from "@/lib/api/service"
import { storePaymentSession } from "@/lib/utils/secure-payment"
import { createBookingValidationSchema, validateObject, isValidString, isValidDateString, isValidTimeString } from "@/lib/utils/validation"
import { logger } from "@/lib/utils/logger"

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
  // Original UTC times from API (optional)
  startTimeUtc: string
  endTimeUtc: string
}

export interface AuthenticatedBookingData {
  clientId: string
  expertId: string
  serviceId: string
  selectedService: ServiceDetailDto
  date: string
  time: string
  timezone: string
  paymentMode: "online" | "direct"
  // Original UTC times from API (optional)
  startTimeUtc: string
  endTimeUtc: string
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
    // Validate booking data before proceeding
    const validationSchema = createBookingValidationSchema();
    const validation = validateObject(bookingData, validationSchema);
    
    if (!validation.isValid) {
      logger.info("Data "+ bookingData + " " + validationSchema)
      logger.error("Booking validation failed:", validation.errors);
      return {
        success: false,
        error: `Invalid booking data: ${Object.values(validation.errors).join(", ")}`
      };
    }
    // Step 1: Send client invite to get clientId and accessToken
    logger.info("Sending client invite...")
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

    logger.info("Client invite sent, clientId:", clientId)

    // Step 3: Create appointment
    logger.info("Creating appointment...")
    const appointmentResponse = await createBookingWithPayment({
      clientId,
      expertId: bookingData.expertId,
      serviceId: bookingData.serviceId,
      date: bookingData.date,
      time: bookingData.time,
      timezone: bookingData.timezone,
      startTimeUtc: bookingData.startTimeUtc,
      endTimeUtc: bookingData.endTimeUtc,
      paymentMode: bookingData.paymentMode,
      serviceDetails: bookingData.selectedService,
    })

    logger.info("Appointment created:", appointmentResponse)

    // Step 4: Handle payment if online
    if (bookingData.paymentMode === "online") {
      logger.info("Processing online payment...")
      const paymentSuccess = await handleRazorpayPayment(
        appointmentResponse.paymentSessionId,
        appointmentResponse.orderId,
        appointmentResponse.id,
        {
          bookingDate: bookingData.date,
          bookingTime: bookingData.time,
          bookingTimezone: bookingData.timezone,
          selectedService: bookingData.selectedService,
          paymentMethod: bookingData.paymentMode
        }
      )

      if (!paymentSuccess) {
        throw new Error("Payment failed")
      }
    } else {
      // For direct payments, still store the payment session data securely
      storePaymentSession({
        orderId: appointmentResponse.orderId,
        appointmentId: appointmentResponse.id,
        paymentSessionId: appointmentResponse.paymentSessionId,
        paymentMethod: bookingData.paymentMode,
        bookingDate: bookingData.date,
        bookingTime: bookingData.time,
        bookingTimezone: bookingData.timezone,
        selectedService: bookingData.selectedService
      })
    }

    return {
      success: true,
      orderId: appointmentResponse.orderId,
      appointmentId: appointmentResponse.id,
    }
  } catch (error) {
    logger.error("Booking failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Booking failed. Please try again.",
    }
  }
}

/**
 * Booking flow for authenticated users (new booking page)
 */
export async function processAuthenticatedBooking(bookingData: AuthenticatedBookingData): Promise<BookingResult> {
  try {
    // Validate booking data before proceeding
    const validationSchema = {
      clientId: (value: string) => isValidString(value),
      expertId: (value: string) => isValidString(value),
      serviceId: (value: string) => isValidString(value),
      selectedService: (value: any) => value && typeof value === 'object',
      date: (value: string) => isValidString(value),
      time: (value: string) => isValidString(value),
      timezone: (value: string) => isValidString(value),
      paymentMode: (value: string) => ['online', 'direct'].includes(value),
      // Optional UTC time fields - if present, they should be valid ISO strings
      startTimeUtc: (value: string) => isValidString(value),
      endTimeUtc: (value: string) => isValidString(value),
    };
    
    const validation = validateObject(bookingData, validationSchema);
    
    if (!validation.isValid) {
      logger.error("Authenticated booking validation failed:", validation.errors);
      return {
        success: false,
        error: `Invalid booking data: ${Object.values(validation.errors).join(", ")}`
      };
    }

    // Create appointment
    const appointmentResponse = await createBookingWithPayment({
      clientId: bookingData.clientId,
      expertId: bookingData.expertId,
      serviceId: bookingData.serviceId,
      date: bookingData.date,
      time: bookingData.time,
      timezone: bookingData.timezone,
      startTimeUtc: bookingData.startTimeUtc,
      endTimeUtc: bookingData.endTimeUtc,
      paymentMode: bookingData.paymentMode,
      serviceDetails: bookingData.selectedService,
    })

    // Handle payment if online
    if (bookingData.paymentMode === "online") {
      const paymentSuccess = await handleRazorpayPayment(
        appointmentResponse.paymentSessionId,
        appointmentResponse.orderId,
        appointmentResponse.id,
        {
          bookingDate: bookingData.date,
          bookingTime: bookingData.time,
          bookingTimezone: bookingData.timezone,
          selectedService: bookingData.selectedService,
          paymentMethod: bookingData.paymentMode
        }
      )

      if (!paymentSuccess) {
        throw new Error("Payment failed")
      }
    } else {
      // For direct payments, still store the payment session data securely
      storePaymentSession({
        orderId: appointmentResponse.orderId,
        appointmentId: appointmentResponse.id,
        paymentSessionId: appointmentResponse.paymentSessionId,
        paymentMethod: bookingData.paymentMode,
        bookingDate: bookingData.date,
        bookingTime: bookingData.time,
        bookingTimezone: bookingData.timezone,
        selectedService: bookingData.selectedService
      })
    }

    return {
      success: true,
      orderId: appointmentResponse.orderId,
      appointmentId: appointmentResponse.id,
    }
  } catch (error) {
    logger.error("Booking failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Booking failed. Please try again.",
    }
  }
}

// Create booking with complete flow
async function createBookingWithPayment(bookingData: {
  clientId: string
  expertId: string
  serviceId: string
  date: string
  time: string
  timezone?: string
  timeSlot?: { startTime: string; endTime: string }
  startTimeUtc: string // Direct UTC time from API
  endTimeUtc: string // Direct UTC time from API
  paymentMode: "online" | "direct"
  serviceDetails: ServiceDetailDto
}) {
  // Use direct UTC times if available, then provided timeSlot, otherwise create one with the specified timezone
  const timeSlot = { startTime: bookingData.startTimeUtc, endTime: bookingData.endTimeUtc }

  // Calculate payment amounts
  const amount = bookingData.serviceDetails.price
  const taxAmount = Math.round(amount * 0.18) // 18% tax
  const platformFee = Math.round(amount * 0.035) // 3.5% platform fee
  const totalAmount = amount + taxAmount + platformFee

  // Create appointment request
  const appointmentRequest: AppointmentAddRequest = {
    startTime: timeSlot.startTime,
    endTime: timeSlot.endTime,
    serviceId: bookingData.serviceId,
    expertId: bookingData.expertId,
    clientId: bookingData.clientId,
    location: bookingData.serviceDetails.location === "GOOGLE_MEET" ? Location.GOOGLE_MEET : Location.IN_PERSON,
    notes: "",
    paymentData: {
      amount: amount,
      taxAmount: taxAmount,
      platformFee: platformFee,
      totalAmount: totalAmount,
      gateway: bookingData.paymentMode === "online" ? PaymentProvider.RAZORPAY : PaymentProvider.DIRECT,
    },
  }

  logger.info("Creating appointment:", appointmentRequest)

  // Create appointment
  const appointmentResponse = await createAppointment(appointmentRequest)

  logger.info("Appointment created:", appointmentResponse)

  return appointmentResponse
}
