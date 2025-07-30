// Booking related API calls (from your existing api.ts)
import { apiRequest } from "./base"
import { 
  createTimeSlotFromString as createTimeSlotUtil,
  formatDate,
  formatTime12Hour,
  getBrowserTimezone
} from "@/lib/utils/time-utils"

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

export interface ClientResponse {
  accessToken: string
  hasSetupProfile: boolean
  client: ClientDto
}

export interface VerifyCodeResponse {
  clientResponse: ClientResponse
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

// Client code validation - Updated to use new API
export async function validateClientCode(code: string): Promise<VerifyCodeResponse> {
  const request: VerifyCodeRequest = { code }

  return apiRequest<VerifyCodeResponse>("/web/auth/verify/client", {
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
  available?: boolean // Optional property for UI display
}

// Format the response to match what the UI expects
export interface FormattedTimeSlot {
  time: string
  available: boolean
  timezone: string
}

export interface FormattedAvailableSlots {
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

    // Format as 24-hour time (e.g., "09:00") for internal use
    // The UI will format it to 12-hour format using formatTime12Hour
    const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`

    return {
      time: formattedTime,
      available: true, // Assume all returned slots are available
      timezone: getBrowserTimezone(), // Use browser's timezone
    }
  })
}

// Helper function to create time slot from string
// This is now a wrapper around the centralized utility
export function createTimeSlotFromString(
  timeString: string,
  dateString: string,
  timezone: string = getBrowserTimezone(),
  durationMinutes = 60
): { startTime: string; endTime: string } {
  return createTimeSlotUtil(timeString, dateString, timezone, durationMinutes)
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

// Create booking with complete flow
export async function createBookingWithPayment(bookingData: {
  clientId: string
  expertId: string
  serviceId: string
  date: string
  time: string
  timezone?: string
  timeSlot?: { startTime: string; endTime: string }
  paymentMode: "online" | "direct"
  serviceDetails: ServiceDetailDto
}) {
  // Use provided timeSlot if available, otherwise create one with the specified timezone
  const timeSlot = bookingData.timeSlot || 
    createTimeSlotFromString(bookingData.time, bookingData.date, bookingData.timezone || getBrowserTimezone(), bookingData.serviceDetails.durationMin)

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
      gateway: bookingData.paymentMode === "online" ? PaymentProvider.CASH_FREE : PaymentProvider.DIRECT,
    },
  }

  console.log("Creating appointment:", appointmentRequest)

  // Create appointment
  const appointmentResponse = await createAppointment(appointmentRequest)

  console.log("Appointment created:", appointmentResponse)

  return appointmentResponse
}

// NOTE: Payment verification is handled by backend webhooks
