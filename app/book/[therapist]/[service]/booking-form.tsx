"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, MapPin, ArrowLeft, Check, Globe, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useSearchParams } from "next/navigation"
import { useBooking } from "@/hooks/use-booking"

interface BookingFormProps {
  therapistId: string
  serviceId: string
}

interface AvailableSlots {
  dates?: Array<{
    date: string
    day: string
    dayNum: string
    available: boolean
  }>
  timeSlots?: Array<{
    time: string
    available: boolean
    timezone: string
  }>
}

export function BookingForm({ therapistId, serviceId }: BookingFormProps) {
  const searchParams = useSearchParams()
  const clientCode = searchParams.get("code")
  const { fetchAvailableSlots, bookSession, processPayment, loading, error } = useBooking()

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [paymentMode, setPaymentMode] = useState<"online" | "direct">("online")
  const [isBooked, setIsBooked] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<AvailableSlots | null>(null)
  const [bookingData, setBookingData] = useState<any>(null)

  // Load booking data from sessionStorage
  useEffect(() => {
    const storedData = sessionStorage.getItem("bookingData")
    if (storedData) {
      setBookingData(JSON.parse(storedData))
    }
  }, [])

  // Fetch available slots when component mounts
  useEffect(() => {
    const loadSlots = async () => {
      try {
        const slots = await fetchAvailableSlots(therapistId, serviceId)
        setAvailableSlots(slots)
      } catch (err) {
        console.error("Failed to load slots:", err)
      }
    }

    loadSlots()
  }, [therapistId, serviceId, fetchAvailableSlots])

  // Fetch time slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      const loadTimeSlots = async () => {
        try {
          const slots = await fetchAvailableSlots(therapistId, serviceId, selectedDate)
          setAvailableSlots((prev: AvailableSlots | null) => ({
            ...prev,
            timeSlots: slots.timeSlots,
          }))
        } catch (err) {
          console.error("Failed to load time slots:", err)
        }
      }

      loadTimeSlots()
    }
  }, [selectedDate, therapistId, serviceId, fetchAvailableSlots])

  const handleBooking = async () => {
    if (!bookingData || !selectedDate || !selectedTime || !clientCode) return

    try {
      const booking = await bookSession({
        clientCode,
        therapistId,
        serviceId,
        date: selectedDate,
        time: selectedTime,
        paymentMode,
      })

      if (paymentMode === "online" && booking.status === "pending_payment") {
        // Process payment
        await processPayment(booking.bookingId)
      }

      setIsBooked(true)
    } catch (err) {
      console.error("Booking failed:", err)
    }
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-light via-white to-lavender-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-charcoal/70">Loading booking information...</p>
        </div>
      </div>
    )
  }

  const { client, therapist, service } = bookingData
  const platformFee = Math.round(service.fee * 0.03)
  const taxes = Math.round(service.fee * 0.18)
  const total = service.fee + platformFee + taxes

  if (isBooked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-light via-white to-lavender-light">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto">
            <Card className="border-mint/20 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-mint-dark rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-charcoal mb-4">Booking Confirmed!</h1>
                <p className="text-lg text-charcoal/70 mb-6">
                  Thanks! You'll receive an email with your session details.
                </p>
                <div className="bg-mint/10 p-6 rounded-lg mb-6">
                  <h3 className="font-semibold text-charcoal mb-2">Session Details</h3>
                  <p className="text-charcoal/80">
                    {service.name} with {therapist.name}
                  </p>
                  <p className="text-charcoal/80">
                    {selectedDate} at {selectedTime}
                  </p>
                  <p className="text-charcoal/80">{service.location}</p>
                </div>
                <Button
                  variant="outline"
                  className="mt-6 border-mint-dark text-mint-dark hover:bg-mint-dark hover:text-white bg-transparent"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to SereneNow
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-light via-white to-lavender-light">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="text-charcoal hover:text-mint-dark mb-4"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Left Sidebar - Client & Booking Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Client Information */}
            <Card className="border-mint/20 shadow-sm bg-mint/5">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-4">Client Information</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Name:</span> {client.name}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {client.email}
                  </p>
                  <p>
                    <span className="font-medium">Code:</span> {clientCode}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Therapist & Service */}
            <Card className="border-mint/20 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-4">Therapist & Service</h3>

                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src={therapist.photo || "/placeholder.svg?height=60&width=60"}
                    alt={therapist.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-mint/20"
                  />
                  <div>
                    <h4 className="font-semibold text-charcoal">{therapist.name}</h4>
                    <p className="text-sm text-charcoal/70">{therapist.title}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="font-medium text-charcoal">{service.name}</h5>
                  <div className="flex items-center space-x-4 text-sm text-charcoal/70">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{service.duration} minutes</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{service.location}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Summary */}
            {selectedDate && selectedTime && (
              <Card className="border-mint/20 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-charcoal mb-4">Booking Summary</h3>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium text-charcoal">{therapist.name}</p>
                      <p className="text-charcoal/70">{service.name}</p>
                      <p className="text-charcoal/70">{service.duration} minutes</p>
                    </div>

                    <div>
                      <p className="font-medium text-charcoal">Date & Time</p>
                      <p className="text-charcoal/70">
                        {selectedDate} at {selectedTime}
                      </p>
                      <p className="text-charcoal/70">India (IST)</p>
                    </div>

                    <div>
                      <p className="font-medium text-charcoal">Payment Mode</p>
                      <p className="text-charcoal/70">
                        {paymentMode === "online" ? "Pay Online" : "Pay Directly to Therapist"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Content - Date/Time Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timezone */}
            <Card className="border-mint/20 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-mint-dark" />
                    <span className="font-medium text-charcoal">Timezone</span>
                  </div>
                  <select className="border border-mint/20 rounded-md px-3 py-2 bg-white">
                    <option>India (IST)</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Date Selection */}
            <Card className="border-mint/20 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Calendar className="h-5 w-5 text-mint-dark" />
                  <h3 className="text-lg font-semibold text-charcoal">Select a Date</h3>
                </div>

                {loading && <p className="text-charcoal/70">Loading available dates...</p>}

                {availableSlots?.dates && (
                  <div className="grid grid-cols-4 gap-3">
                    {availableSlots.dates.map((dateObj) => (
                      <button
                        key={dateObj.date}
                        onClick={() => setSelectedDate(dateObj.date)}
                        disabled={!dateObj.available}
                        className={`p-4 rounded-lg border text-center transition-colors ${
                          selectedDate === dateObj.date
                            ? "border-mint-dark bg-mint-dark text-white"
                            : dateObj.available
                              ? "border-gray-200 hover:border-mint-dark hover:bg-mint/5"
                              : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <div className="text-sm text-gray-500 mb-1">{dateObj.day}</div>
                        <div className="text-xl font-semibold">{dateObj.dayNum}</div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Time Selection */}
            {selectedDate && (
              <Card className="border-mint/20 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Clock className="h-5 w-5 text-mint-dark" />
                    <h3 className="text-lg font-semibold text-charcoal">Available Times (India (IST))</h3>
                  </div>

                  {loading && <p className="text-charcoal/70">Loading available times...</p>}

                  {availableSlots?.timeSlots && (
                    <div className="grid grid-cols-3 gap-3">
                      {availableSlots.timeSlots.map((timeSlot) => (
                        <button
                          key={timeSlot.time}
                          onClick={() => setSelectedTime(timeSlot.time)}
                          disabled={!timeSlot.available}
                          className={`p-4 rounded-lg border text-center transition-colors ${
                            selectedTime === timeSlot.time
                              ? "border-mint-dark bg-mint-dark text-white"
                              : timeSlot.available
                                ? "border-gray-200 hover:border-mint-dark hover:bg-mint/5"
                                : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {timeSlot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Payment Mode */}
            {selectedTime && (
              <Card className="border-mint/20 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <CreditCard className="h-5 w-5 text-mint-dark" />
                    <h3 className="text-lg font-semibold text-charcoal">Payment Mode</h3>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => setPaymentMode("online")}
                      className={`w-full p-4 rounded-lg border text-left transition-colors ${
                        paymentMode === "online"
                          ? "border-mint-dark bg-mint/5"
                          : "border-gray-200 hover:border-mint-dark"
                      }`}
                    >
                      <div className="font-medium text-charcoal">Pay Online</div>
                      <div className="text-sm text-charcoal/70">Secure payment via Razorpay</div>
                    </button>

                    <button
                      onClick={() => setPaymentMode("direct")}
                      className={`w-full p-4 rounded-lg border text-left transition-colors ${
                        paymentMode === "direct"
                          ? "border-mint-dark bg-mint/5"
                          : "border-gray-200 hover:border-mint-dark"
                      }`}
                    >
                      <div className="font-medium text-charcoal">Pay Directly to Therapist</div>
                      <div className="text-sm text-charcoal/70">Pay during or after the session</div>
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Price Breakdown & Payment */}
            {selectedTime && paymentMode === "online" && (
              <Card className="border-mint/20 shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span>Base Price</span>
                        <span>₹{service.fee}</span>
                      </div>
                      <div className="flex justify-between text-charcoal/70">
                        <span>Platform Fee (3%)</span>
                        <span>₹{platformFee}</span>
                      </div>
                      <div className="flex justify-between text-charcoal/70">
                        <span>Taxes (18%)</span>
                        <span>₹{taxes}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg pt-3 border-t border-mint/20">
                        <span>Total</span>
                        <span>₹{total}</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleBooking}
                      disabled={loading}
                      className="w-full bg-mint-dark hover:bg-mint-dark/90 text-white py-3"
                    >
                      {loading ? "Processing..." : `Pay ₹${total} & Book`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedTime && paymentMode === "direct" && (
              <Card className="border-mint/20 shadow-sm">
                <CardContent className="p-6">
                  <Button
                    onClick={handleBooking}
                    disabled={loading}
                    className="w-full bg-mint-dark hover:bg-mint-dark/90 text-white py-3"
                  >
                    {loading ? "Processing..." : "Book Session"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Error Display */}
            {error && (
              <Card className="border-red-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">{error}</div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
