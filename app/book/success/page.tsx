"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { CheckCircle, Calendar, Clock, MapPin, User, IndianRupee, ArrowLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { ServiceDetailDto } from "@/lib/api/service"
import { VerifyCodeResponse, getCachedBookingData } from "@/lib/services/client-code-service"
import { getPaymentSession, clearPaymentSession } from "@/lib/utils/secure-payment"
import { formatDate, formatTime } from "@/lib/utils/time-utils"
import { STORAGE_KEYS } from "@/lib/utils/secure-storage"

interface BookingSuccessData {
  orderId?: string
  appointmentId?: string
  paymentMethod?: string
  bookingDate?: string
  bookingTime?: string
  selectedService?: ServiceDetailDto
}

export default function BookingSuccessPage() {
  const [bookingData, setBookingData] = useState<VerifyCodeResponse | null>(null)
  const [successData, setSuccessData] = useState<BookingSuccessData>({})
  const [loading, setLoading] = useState(true)

  const router = useRouter()

  useEffect(() => {
    // Get success data from secure storage instead of URL params
    const paymentSession = getPaymentSession()
    
    if (paymentSession) {
      // Use data from secure storage
      setSuccessData({
        orderId: paymentSession.orderId,
        appointmentId: paymentSession.appointmentId,
        paymentMethod: paymentSession.paymentMethod,
        bookingDate: paymentSession.bookingDate,
        bookingTime: paymentSession.bookingTime,
        selectedService: paymentSession.selectedService,
      })
      
      // Clear payment session after retrieving data
      // This ensures the data is only used once
      clearPaymentSession()
    } else {
      // Fallback for backward compatibility
      const storedSuccessData = sessionStorage.getItem(STORAGE_KEYS.BOOKING_SUCCESS_DATA)
      
      if (storedSuccessData) {
        const successInfo = JSON.parse(storedSuccessData) as BookingSuccessData
        setSuccessData(successInfo)
        // Remove from session storage after use
        sessionStorage.removeItem(STORAGE_KEYS.BOOKING_SUCCESS_DATA)
      }
    }

    setLoading(false)
  }, [])

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "Duration TBD"
    if (minutes < 60) {
      return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-light via-white to-lavender-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mint-dark mx-auto mb-4"></div>
          <p className="text-charcoal/70">Loading confirmation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-light via-white to-lavender-light">
      <div className="container mx-auto px-6 py-8">
        {/* Success Header */}
        <div className="max-w-4xl mx-auto text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-charcoal mb-2">Booking Confirmed!</h1>
          <p className="text-charcoal/70">Your therapy session has been successfully booked</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Session Details */}
          <Card className="border-mint/20 shadow-lg">
            <CardHeader className="pb-4">
              <h2 className="text-xl font-semibold text-charcoal flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-mint-dark" />
                Session Details
              </h2>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Therapist Info */}
              {bookingData?.expertProfile && (
                <div className="flex items-center space-x-4 p-4 bg-mint/5 rounded-lg">
                  <div className="w-16 h-16 bg-mint/10 rounded-full flex items-center justify-center overflow-hidden">
                    {bookingData.expertProfile.pictureUrl ? (
                      <Image
                        src={bookingData.expertProfile.pictureUrl || "/placeholder.svg"}
                        alt={bookingData.expertProfile.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-mint-dark" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-charcoal">{bookingData.expertProfile.name}</h3>
                    <p className="text-charcoal/70">{bookingData.expertProfile.qualification}</p>
                    <p className="text-sm text-mint-dark">{bookingData.expertProfile.email}</p>
                  </div>
                </div>
              )}

              {/* Service & Schedule Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-charcoal mb-2">Service</h4>
                    <p className="text-charcoal/70">{successData.selectedService?.title || "Therapy Session"}</p>
                    {successData.selectedService?.description && (
                      <p className="text-sm text-charcoal/60 mt-1">{successData.selectedService.description}</p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium text-charcoal mb-2">Duration</h4>
                    <div className="flex items-center text-charcoal/70">
                      <Clock className="h-4 w-4 mr-2" />
                      {formatDuration(successData.selectedService?.durationMin)}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-charcoal mb-2">Location</h4>
                    <div className="flex items-center text-charcoal/70">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="capitalize">
                        {successData.selectedService?.location?.toLowerCase().replace("_", " ") || "Online"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-charcoal mb-2">Date</h4>
                    <p className="text-charcoal/70">{formatDate(successData.bookingDate)}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-charcoal mb-2">Time</h4>
                    <p className="text-charcoal/70">{formatTime(successData.bookingTime)}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-charcoal mb-2">Timezone</h4>
                    <p className="text-charcoal/70">{bookingData?.expertProfile.timeZone || "IST"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Information */}
          {bookingData?.clientResponse.client && (
            <Card className="border-mint/20 shadow-sm">
              <CardHeader className="pb-4">
                <h2 className="text-xl font-semibold text-charcoal flex items-center">
                  <User className="h-5 w-5 mr-2 text-mint-dark" />
                  Client Information
                </h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-charcoal mb-2">Name</h4>
                    <p className="text-charcoal/70">{bookingData.clientResponse.client.name}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-charcoal mb-2">Email</h4>
                    <p className="text-charcoal/70">{bookingData.clientResponse.client.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Information */}
          <Card className="border-mint/20 shadow-sm">
            <CardHeader className="pb-4">
              <h2 className="text-xl font-semibold text-charcoal">Order Information</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {successData.orderId && (
                  <div>
                    <h4 className="font-medium text-charcoal mb-2">Order ID</h4>
                    <p className="text-charcoal/70 font-mono text-sm">{successData.orderId}</p>
                  </div>
                )}
                {successData.appointmentId && (
                  <div>
                    <h4 className="font-medium text-charcoal mb-2">Appointment ID</h4>
                    <p className="text-charcoal/70 font-mono text-sm">{successData.appointmentId}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-charcoal mb-2">Payment Method</h4>
                  <p className="text-charcoal/70 capitalize">{successData.paymentMethod || "Online Payment"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          {successData.selectedService && (
            <Card className="border-mint/20 shadow-sm">
              <CardHeader className="pb-4">
                <h2 className="text-xl font-semibold text-charcoal flex items-center">
                  <IndianRupee className="h-5 w-5 mr-2 text-mint-dark" />
                  Payment Summary
                </h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-charcoal/70">Base Price</span>
                    <span className="text-charcoal">₹{successData.selectedService.price.toLocaleString()}</span>
                  </div>

                  {successData.selectedService.platformFees > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-charcoal/70">Platform Fee</span>
                      <span className="text-charcoal">
                        ₹{successData.selectedService.platformFees.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {successData.selectedService.totalTaxes > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-charcoal/70">Taxes</span>
                      <span className="text-charcoal">₹{successData.selectedService.totalTaxes.toLocaleString()}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span className="text-charcoal">Total Amount</span>
                    <span className="text-charcoal">₹{successData.selectedService.total.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          <Card className="border-mint/20 shadow-sm">
            <CardHeader className="pb-4">
              <h2 className="text-xl font-semibold text-charcoal">What's Next?</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-mint-dark text-white rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-charcoal">Confirmation Email</h4>
                    <p className="text-sm text-charcoal/70">
                      You'll receive a confirmation email with session details and joining instructions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-mint-dark text-white rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-charcoal">Session Reminder</h4>
                    <p className="text-sm text-charcoal/70">
                      We'll send you a reminder 24 hours and 1 hour before your session.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-mint-dark text-white rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-charcoal">Join Your Session</h4>
                    <p className="text-sm text-charcoal/70">
                      Use the meeting link provided in your confirmation email to join the session.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={() => router.push("/")} className="flex-1 bg-mint-dark hover:bg-mint-dark/90 text-white">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <Button
              onClick={() => router.push("/book")}
              variant="outline"
              className="flex-1 border-mint/20 text-charcoal hover:bg-mint/5"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Book Another Session
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
