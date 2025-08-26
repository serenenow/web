// Booking related API calls (from your existing api.ts)
import { apiRequest } from "./base"
import { storePaymentSession, getPaymentSession, generateSessionReference, storeSessionReference } from "@/lib/utils/secure-payment"
import { logger } from "@/lib/utils/logger"

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

// Payment SDK integration types
declare global {
  interface Window {
    Cashfree: any
    Razorpay: any
  }
}

// API call to create appointment
export const createAppointment = async (appointmentData: AppointmentAddRequest): Promise<AppointmentResponse> => {
  return apiRequest<AppointmentResponse>("/appointment", {
    method: "POST",
    body: JSON.stringify(appointmentData),
  })
}

// Load Cashfree SDK without integrity check to avoid CORS issues
// Note: In production, consider hosting the SDK locally or using a CDN with proper CORS headers
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

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src="https://sdk.cashfree.com/js/v3/cashfree.js"]')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve())
      existingScript.addEventListener('error', (error) => {
        logger.error("Failed to load Cashfree SDK:", error)
        reject(new Error("Failed to load Cashfree SDK. Please check network connection or try again later."))
      })
      return
    }

    const script = document.createElement("script")
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js"
    script.async = true
    
    // Remove integrity check to avoid CORS issues during development
    // The Cashfree CDN doesn't send proper CORS headers for integrity checks
    
    script.onload = () => {
      logger.info("Cashfree SDK loaded successfully")
      resolve()
    }
    script.onerror = (error) => {
      logger.error("Failed to load Cashfree SDK:", error)
      reject(new Error("Failed to load Cashfree SDK. Please check network connection or try again later."))
    }
    
    document.head.appendChild(script)
  })
}

// Load Razorpay SDK
export const loadRazorpaySDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve()
      return
    }

    if (typeof window === "undefined") {
      reject(new Error("Window object not available"))
      return
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve())
      existingScript.addEventListener('error', (error) => {
        logger.error("Failed to load Razorpay SDK:", error)
        reject(new Error("Failed to load Razorpay SDK. Please check network connection or try again later."))
      })
      return
    }

    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    
    script.onload = () => {
      logger.info("Razorpay SDK loaded successfully")
      resolve()
    }
    script.onerror = (error) => {
      logger.error("Failed to load Razorpay SDK:", error)
      reject(new Error("Failed to load Razorpay SDK. Please check network connection or try again later."))
    }
    
    document.head.appendChild(script)
  })
}

// Handle Cashfree payment
export const handleCashfreePayment = async (
  paymentSessionId: string, 
  orderId: string, 
  appointmentId: string,
  bookingData?: {
    bookingDate?: string;
    bookingTime?: string;
    bookingTimezone?: string;
    selectedService?: any;
    paymentMethod?: string;
  }
): Promise<boolean> => {
  try {
    // Store payment session data securely before initiating payment
    const sessionRef = generateSessionReference();
    storeSessionReference(sessionRef, paymentSessionId);
    
    // Store complete payment session data
    storePaymentSession({
      orderId,
      appointmentId,
      paymentSessionId,
      paymentMethod: bookingData?.paymentMethod || 'online',
      bookingDate: bookingData?.bookingDate,
      bookingTime: bookingData?.bookingTime,
      bookingTimezone: bookingData?.bookingTimezone,
      selectedService: bookingData?.selectedService
    });
    
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

    const result = await cashfree.checkout(checkoutOptions)
    
    if (result.error) {
      logger.error("Payment failed:", result.error)
      throw new Error("Payment failed. Please try again.")
    }

    if (result.redirect) {
      return true
    }
    
    if (result.paymentDetails) {
      // This will be called whenever the payment is completed irrespective of transaction status
      return true
    }

    return false
  } catch (error) {
    logger.error("Cashfree payment error:", error)
    throw new Error("Payment processing failed. Please try again.")
  }
}

// Handle Razorpay payment
export const handleRazorpayPayment = async (
  paymentSessionId: string, 
  orderId: string, 
  appointmentId: string,
  bookingData?: {
    bookingDate?: string;
    bookingTime?: string;
    bookingTimezone?: string;
    selectedService?: any;
    paymentMethod?: string;
  }
): Promise<boolean> => {
  try {
    // Store payment session data securely before initiating payment
    const sessionRef = generateSessionReference();
    storeSessionReference(sessionRef, paymentSessionId);
    
    // Store complete payment session data
    storePaymentSession({
      orderId,
      appointmentId,
      paymentSessionId,
      paymentMethod: bookingData?.paymentMethod || 'online',
      bookingDate: bookingData?.bookingDate,
      bookingTime: bookingData?.bookingTime,
      bookingTimezone: bookingData?.bookingTimezone,
      selectedService: bookingData?.selectedService
    });
    
    await loadRazorpaySDK()

    if (typeof window === "undefined" || !window.Razorpay) {
      throw new Error("Razorpay SDK not available")
    }

    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    
    // Validate required fields
    if (!razorpayKey) {
      throw new Error("Razorpay Key ID not configured");
    }
    
    // Validate key format (Razorpay Key IDs start with 'rzp_test_' or 'rzp_live_')
    if (!razorpayKey.startsWith('rzp_')) {
      throw new Error("Invalid Razorpay Key ID format");
    }
    
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      logger.info("Razorpay Key ID:", `${razorpayKey.substring(0, 12)}...`);
      logger.info("Order ID:", orderId);
    }
    
    if (!orderId) {
      throw new Error("Order ID is required");
    }
    
    return new Promise((resolve, reject) => {
      const options = {
        key: razorpayKey,
        // Remove amount from here - let Razorpay get it from the order
        currency: 'INR',
        name: 'SereneNow',
        description: 'Appointment Booking',
        order_id: orderId,
        handler: function (response: any) {
          logger.info("Razorpay payment successful:", response)
          // Verify payment on backend before resolving
          // TODO: Add backend verification call here
          resolve(true)
        },
        prefill: {
          name: bookingData?.selectedService?.expertName || 'Customer'
        },
        notes: {
          appointment_id: appointmentId,
          booking_date: bookingData?.bookingDate,
          booking_time: bookingData?.bookingTime
        },
        theme: {
          color: '#3399cc'
        },
        modal: {
          ondismiss: function() {
            logger.info("Razorpay payment modal dismissed")
            reject(new Error("Payment cancelled by user"))
          },
          // Add escape close option
          escape: true,
          // Handle modal close events properly
          onhidden: function() {
            logger.info("Razorpay modal hidden")
          }
        },
        // Add retry options
        retry: {
          enabled: true,
          max_count: 3
        },
        // Add timeout
        timeout: 300, // 5 minutes
        // Add remember customer option
        remember_customer: false
      }

      try {
        const rzp = new window.Razorpay(options)
        
        rzp.on('payment.failed', function (response: any) {
          logger.error("Razorpay payment failed:", response.error)
          const errorMessage = response.error?.description || "Payment failed. Please try again.";
          reject(new Error(errorMessage))
        })
        
        // Add additional error handling
        rzp.on('payment.error', function (response: any) {
          logger.error("Razorpay payment error:", response)
          reject(new Error("Payment processing error. Please try again."))
        })
        
        rzp.open()
      } catch (error) {
        logger.error("Error creating Razorpay instance:", error)
        reject(new Error("Failed to initialize payment. Please try again."))
      }
    })
  } catch (error) {
    logger.error("Razorpay payment error:", error)
    throw new Error("Payment processing failed. Please try again.")
  }
}
