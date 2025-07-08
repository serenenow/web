// Booking related API calls (from your existing api.ts)
import { apiRequest } from "./base"

// Types for the new API
export interface VerifyCodeRequest {
  code: string
}

export interface ClientDto {
  id: string
  email: string
  name: string
  pictureUrl: string
  authSource: string
  activationStatus: string
  timeZone: string
  firebaseTokenId?: string
}

export interface ExpertDto {
  id: string
  email: string
  name: string
  qualification: string
  pictureUrl: string
  authSource: string
  activationStatus: string
  timeZone: string
  firebaseTokenId?: string
}

export interface TaxRateDto {
  id: string
  rate: number
  description: string
}

export interface ServiceDetailDto {
  id: string
  title: string
  description: string
  price: number
  location: string
  platformFees: number
  totalTaxes: number
  total: number
  taxRate?: TaxRateDto
  durationMin: number
  bufferMin: number
  cancellationDeadlineHours: number
  cancellationPercent: number
  rescheduleDeadlineHours: number
  reschedulePercent: number
  useCustomAvailability: boolean
  minHoursNotice: number
}

export interface VerifyCodeResponse {
  client: ClientDto
  expert: ExpertDto
  services: ServiceDetailDto[]
  allowDirectPayment: boolean
  directPaymentInstructions?: string
}

export interface AddressDto {
  userId?: string
  street: string
  city: string
  state: string
  stateCode: string
  country: string
  pincode: string
}

export interface EmergencyContactDto {
  userId?: string
  name: string
  email?: string
  phoneNumber?: string
  relation: string
}

export interface WebClientRegisterRequest {
  name: string
  email: string
  timeZone: string
  phoneNumber: string
  age: number
  gender: string
  address: AddressDto
  emergencyContact: EmergencyContactDto
}

// Client code validation - Updated to use new API
export async function validateClientCode(code: string): Promise<VerifyCodeResponse> {
  const request: VerifyCodeRequest = { code }

  return apiRequest<VerifyCodeResponse>("/web-booking/verify-client", {
    method: "POST",
    body: JSON.stringify(request),
  })
}

// Register new client
export async function registerClient(clientData: WebClientRegisterRequest): Promise<ClientDto> {
  return apiRequest<ClientDto>("/web-booking/register-client", {
    method: "POST",
    body: JSON.stringify(clientData),
  })
}

// Get available slots
export interface TimeSlot {
  startTime: string // ISO 8601 format
  endTime: string // ISO 8601 format
}

// Format the response to match what the UI expects
interface FormattedTimeSlot {
  time: string
  available: boolean
  timezone: string
}

interface FormattedAvailableSlots {
  dates: Array<{
    date: string
    day: string
    dayNum: string
    available: boolean
  }>
  timeSlots: Array<FormattedTimeSlot>
}

export async function getAvailableSlots(therapistId: string, serviceId: string, date?: string) {
  const params = new URLSearchParams()
  params.append("expert_id", therapistId)
  params.append("service_id", serviceId)
  if (date) params.append("selected_date", date)

  // Get time slots from API
  const timeSlots = await apiRequest<TimeSlot[]>(`/service/slots?${params}`)

  // Format the response for the UI
  const formattedResponse: FormattedAvailableSlots = {
    // Generate dates for the next 7 days
    dates: generateDateOptions(),
    // Format time slots
    timeSlots: formatTimeSlots(timeSlots),
  }

  return formattedResponse
}

// Helper to generate date options for the next 7 days
function generateDateOptions() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const dates = []

  for (let i = 0; i < 7; i++) {
    const date = new Date()
    date.setDate(date.getDate() + i)

    dates.push({
      date: date.toISOString().split("T")[0], // YYYY-MM-DD
      day: days[date.getDay()],
      dayNum: date.getDate().toString(),
      available: true, // Assume all dates are available
    })
  }

  return dates
}

// Helper to format time slots for the UI
function formatTimeSlots(timeSlots: TimeSlot[]): FormattedTimeSlot[] {
  return timeSlots.map((slot) => {
    // Parse the ISO string to get hours and minutes
    const startTime = new Date(slot.startTime)
    const hours = startTime.getHours()
    const minutes = startTime.getMinutes()

    // Format as 12-hour time (e.g., "9:00 AM")
    const formattedTime = `${hours % 12 || 12}:${minutes.toString().padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`

    return {
      time: formattedTime,
      available: true, // Assume all returned slots are available
      timezone: "IST", // Hardcoded for now
    }
  })
}

// Appointment types
export enum PaymentProvider {
  CASH_FREE = "CASH_FREE",
  RAZORPAY = "RAZORPAY",
  DIRECT = "DIRECT",
}

export enum Location {
  ONLINE = "ONLINE",
  IN_PERSON = "IN_PERSON",
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

// Create booking
export async function createBooking(bookingData: {
  clientCode: string
  therapistId: string
  serviceId: string
  date: string
  time: string
  paymentMode: "online" | "direct"
  message?: string
}) {
  // Find the selected time slot
  const params = new URLSearchParams()
  params.append("expert_id", bookingData.therapistId)
  params.append("service_id", bookingData.serviceId)
  params.append("selected_date", bookingData.date)

  // Get available time slots for the selected date
  const timeSlots = await apiRequest<TimeSlot[]>(`/service/slots?${params}`)

  // Find the matching time slot
  const selectedTimeStr = bookingData.time
  const selectedTimeSlot = findTimeSlotByFormattedTime(timeSlots, selectedTimeStr)

  if (!selectedTimeSlot) {
    throw new Error("Selected time slot not found")
  }

  // Calculate payment details (these would normally come from the service details)
  // For now, we'll use placeholder values
  const amount = 1500 // Base amount
  const taxAmount = amount * 0.18 // 18% tax
  const platformFee = amount * 0.03 // 3% platform fee
  const totalAmount = amount + taxAmount + platformFee

  // Create appointment request
  const appointmentRequest: AppointmentAddRequest = {
    startTime: selectedTimeSlot.startTime,
    endTime: selectedTimeSlot.endTime,
    serviceId: bookingData.serviceId,
    expertId: bookingData.therapistId,
    clientId: bookingData.clientCode, // Using client code as ID for now
    location: Location.ONLINE, // Default to online
    notes: bookingData.message,
    paymentData: {
      amount: amount,
      taxAmount: taxAmount,
      platformFee: platformFee,
      totalAmount: totalAmount,
      gateway: bookingData.paymentMode === "online" ? PaymentProvider.CASH_FREE : PaymentProvider.DIRECT,
    },
  }

  // Send appointment creation request
  const appointmentResponse = await apiRequest<AppointmentResponse>("/appointment", {
    method: "POST",
    body: JSON.stringify(appointmentRequest),
  })

  return {
    bookingId: appointmentResponse.id,
    orderId: appointmentResponse.orderId,
    status: bookingData.paymentMode === "online" ? "pending_payment" : "confirmed",
    paymentSessionId: appointmentResponse.paymentSessionId,
    orderAmount: appointmentResponse.orderAmount,
  }
}

// Helper function to find a time slot by its formatted time string
function findTimeSlotByFormattedTime(timeSlots: TimeSlot[], formattedTime: string): TimeSlot | undefined {
  for (const slot of timeSlots) {
    const startTime = new Date(slot.startTime)
    const hours = startTime.getHours()
    const minutes = startTime.getMinutes()

    // Format as 12-hour time (e.g., "9:00 AM")
    const slotFormattedTime = `${hours % 12 || 12}:${minutes.toString().padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`

    if (slotFormattedTime === formattedTime) {
      return slot
    }
  }

  return undefined
}

// Cashfree payment integration
export async function initiateCashfreePayment(paymentSessionId: string) {
  // This function will be called from the client side
  // It will redirect to the Cashfree payment page
  if (typeof window !== "undefined") {
    // Load Cashfree SDK if not already loaded
    if (!(window as any).Cashfree) {
      const script = document.createElement("script")
      script.src = "https://sdk.cashfree.com/js/ui/2.0.0/cashfree.sandbox.js"
      script.async = true
      document.body.appendChild(script)

      // Wait for script to load
      await new Promise<void>((resolve) => {
        script.onload = () => resolve()
      })
    }

    // Initialize Cashfree payment
    const cashfree = new (window as any).Cashfree(paymentSessionId)

    // Configure callbacks
    cashfree.redirect({
      onSuccess: (data: any) => {
        // Handle successful payment
        console.log("Payment success:", data)
        // Redirect to success page or show success message
        window.location.href = `/book/success?orderId=${data.order_id}`
      },
      onFailure: (data: any) => {
        // Handle payment failure
        console.error("Payment failed:", data)
        // Show error message
        alert("Payment failed. Please try again.")
      },
      onClose: () => {
        // Handle payment window close
        console.log("Payment window closed")
      },
    })
  }
}

// NOTE: Payment verification is handled by backend webhooks
