// API configuration and base functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.serenenow.in"

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      throw new ApiError(response.status, `API Error: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new Error("Network error occurred")
  }
}

// Client code validation
export async function validateClientCode(code: string) {
  return apiRequest<{
    valid: boolean
    client?: {
      id: string
      name: string
      email: string
      phone?: string
    }
    therapist?: {
      id: string
      name: string
      title: string
      photo?: string
    }
    service?: {
      id: string
      name: string
      description: string
      duration: number
      fee: number
      location: string
    }
  }>(`/validate-code/${code}`)
}

// Get available slots
export async function getAvailableSlots(therapistId: string, serviceId: string, date?: string) {
  const params = new URLSearchParams()
  if (date) params.append("date", date)

  return apiRequest<{
    dates: Array<{
      date: string
      day: string
      dayNum: string
      available: boolean
    }>
    timeSlots: Array<{
      time: string
      available: boolean
      timezone: string
    }>
  }>(`/therapists/${therapistId}/services/${serviceId}/slots?${params}`)
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
  return apiRequest<{
    bookingId: string
    status: "confirmed" | "pending_payment"
    paymentUrl?: string // For online payments
    meetingLink?: string
    calendarInvite?: string
  }>("/bookings", {
    method: "POST",
    body: JSON.stringify(bookingData),
  })
}

// Payment integration (Razorpay example)
export async function createPaymentOrder(bookingId: string) {
  return apiRequest<{
    orderId: string
    amount: number
    currency: string
    key: string // Razorpay key
  }>(`/bookings/${bookingId}/payment`, {
    method: "POST",
  })
}

// Verify payment
export async function verifyPayment(paymentData: {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
  bookingId: string
}) {
  return apiRequest<{
    verified: boolean
    bookingStatus: string
    meetingLink?: string
  }>("/payments/verify", {
    method: "POST",
    body: JSON.stringify(paymentData),
  })
}
