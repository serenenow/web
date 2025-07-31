"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, MapPin, ArrowLeft, Globe, CreditCard, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useSearchParams, useRouter } from "next/navigation"
import { useBooking } from "@/hooks/use-booking"
import { useClientData } from "@/hooks/use-client-data"
import type { ServiceDetailDto } from "@/lib/api/booking"
import {
  convertTimeToTimezone,
  formatTime12Hour,
  timezones,
  getBrowserTimezone,
  getTimezoneDisplayWithOffset,
  formatDate,
} from "@/lib/utils/time-utils"
import { processAuthenticatedBooking } from "@/lib/services/booking-service"

interface BookingFormProps {
  expertId: string
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
    originalTime?: string // Store original time for timezone conversion
  }>
}

export function BookingForm({ expertId, serviceId }: BookingFormProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { fetchAvailableSlots, loading: bookingLoading, error } = useBooking()
  const { clientData, isAuthenticated } = useClientData()

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [paymentMode, setPaymentMode] = useState<"online" | "direct">("online")
  const [availableSlots, setAvailableSlots] = useState<AvailableSlots | null>(null)
  const [originalTimeSlots, setOriginalTimeSlots] = useState<
    Array<{ time: string; available: boolean; timezone: string }>
  >([])
  const [bookingData, setBookingData] = useState<any>(null)
  const [selectedServiceIndex, setSelectedServiceIndex] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [timezone, setTimezone] = useState(getBrowserTimezone() || "Asia/Kolkata")
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Load booking data from sessionStorage
  useEffect(() => {
    const storedData = sessionStorage.getItem("bookingData")
    if (storedData) {
      const parsedData = JSON.parse(storedData)
      console.log("Loaded booking data:", parsedData)
      setBookingData(parsedData)
    } else {
      console.error("No booking data found in sessionStorage")
    }
  }, [])

  // Generate dates for current month view (up to 6 months in future)
  const generateDatesForMonth = (month: Date) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const dates = []
    const today = new Date()
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 6) // 6 months in future

    // Get first day of the month and last day
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0)

    // Generate dates for the month
    for (let date = new Date(firstDay); date <= lastDay; date.setDate(date.getDate() + 1)) {
      // Only include dates from today onwards and within 6 months
      if (date >= today && date <= maxDate) {
        dates.push({
          date: date.toISOString().split("T")[0], // YYYY-MM-DD
          day: days[date.getDay()],
          dayNum: date.getDate().toString(),
          available: true, // Assume all dates are available
        })
      }
    }

    return dates
  }

  // Initialize available dates for current month
  useEffect(() => {
    const dates = generateDatesForMonth(currentMonth)
    setAvailableSlots({ dates, timeSlots: [] })
  }, [currentMonth])

  // Fetch time slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      // Track if the component is still mounted
      let isMounted = true

      const loadTimeSlots = async () => {
        try {
          console.log(`Fetching slots for date: ${selectedDate}`)
          const slots = await fetchAvailableSlots(expertId, serviceId, selectedDate)

          // Only update state if component is still mounted
          if (isMounted) {
            // Store original time slots for timezone conversion
            const originalSlots = slots.timeSlots.map((slot) => ({
              ...slot,
              originalTime: slot.time, // Store original time
            }))

            setOriginalTimeSlots(originalSlots)

            // Convert time slots to current timezone
            const convertedSlots = originalSlots.map((slot) => ({
              ...slot,
              time: convertTimeToCurrentTimezone(slot.time, slot.timezone),
            }))

            setAvailableSlots((prev: AvailableSlots | null) => ({
              ...prev,
              timeSlots: convertedSlots,
            }))
            console.log(`Loaded ${convertedSlots.length} time slots for ${selectedDate}`)
          }
        } catch (err) {
          console.error("Failed to load time slots:", err)
        }
      }

      loadTimeSlots()

      // Cleanup function to prevent state updates after unmount
      return () => {
        isMounted = false
      }
    }
  }, [selectedDate, expertId, serviceId])

  // Convert time slots when timezone changes (without API call)
  useEffect(() => {
    if (originalTimeSlots.length > 0) {
      const convertedSlots = originalTimeSlots.map((slot) => ({
        ...slot,
        time: convertTimeToCurrentTimezone(slot.time, slot.timezone),
      }))

      setAvailableSlots((prev: AvailableSlots | null) => ({
        ...prev,
        timeSlots: convertedSlots,
      }))

      // Reset selected time when timezone changes
      setSelectedTime(null)
    }
  }, [timezone, originalTimeSlots])

  // Helper function to convert time to current timezone
  const convertTimeToCurrentTimezone = (timeString: string, sourceTimezone: string) => {
    try {
      // If time already includes AM/PM, return as is
      if (timeString.includes("AM") || timeString.includes("PM")) {
        return timeString
      }

      // Create a date object for today with the given time
      const today = new Date().toISOString().split("T")[0]
      const isoString = `${today}T${timeString}:00`

      // Convert from source timezone to target timezone
      return convertTimeToTimezone(isoString, timezone)
    } catch (error) {
      console.error("Error converting time to timezone:", error)
      return timeString
    }
  }

  const handleBooking = async () => {
    if (!bookingData || !selectedDate || !selectedTime || !clientData?.id) return

    setLoading(true)
    setBookingError(null)

    try {
      const selectedService: ServiceDetailDto = bookingData.services[selectedServiceIndex]

      const result = await processAuthenticatedBooking({
        clientId: clientData.id,
        expertId,
        serviceId: selectedService.id,
        selectedService,
        date: selectedDate,
        time: selectedTime,
        timezone,
        paymentMode,
      })

      if (result.success) {
        router.push(`/book/success?orderId=${result.orderId}&appointmentId=${result.appointmentId}`)
      } else {
        setBookingError(result.error || "Booking failed")
      }
    } catch (err) {
      console.error("Booking failed:", err)
      setBookingError(err instanceof Error ? err.message : "Booking failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handlePreviousMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() - 1)

    // Don't go before current month
    const today = new Date()
    if (newMonth.getMonth() >= today.getMonth() && newMonth.getFullYear() >= today.getFullYear()) {
      setCurrentMonth(newMonth)
    }
  }

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() + 1)

    // Don't go beyond 6 months in future
    const maxMonth = new Date()
    maxMonth.setMonth(maxMonth.getMonth() + 6)
    if (newMonth <= maxMonth) {
      setCurrentMonth(newMonth)
    }
  }

  const canGoPrevious = () => {
    const today = new Date()
    return currentMonth.getMonth() > today.getMonth() || currentMonth.getFullYear() > today.getFullYear()
  }

  const canGoNext = () => {
    const maxMonth = new Date()
    maxMonth.setMonth(maxMonth.getMonth() + 6)
    return currentMonth < maxMonth
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

  // Extract data from the booking data structure with error handling
  if (!bookingData.expert || !bookingData.services || bookingData.services.length === 0) {
    console.error("Missing critical booking data:", bookingData)
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-light via-white to-lavender-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-charcoal/70">Invalid booking data. Please go back and try again.</p>
        </div>
      </div>
    )
  }

  const expert = bookingData.expert

  // Use the selected service index from state
  const selectedService = bookingData.services[selectedServiceIndex]
  console.log("Selected service:", selectedService)

  const client = bookingData.clientResponse?.client

  const platformFee = Math.round(selectedService.price * 0.035)
  const taxes = Math.round(selectedService.price * 0.18)
  const total = selectedService.price + platformFee + taxes

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
                    <span className="font-medium">Client ID:</span> {clientData?.id}
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
                    src={expert.pictureUrl || "/placeholder.svg?height=60&width=60"}
                    alt={expert.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-mint/20"
                  />
                  <div>
                    <h4 className="font-semibold text-charcoal">{expert.name}</h4>
                    <p className="text-sm text-charcoal/70">{expert.qualification}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="service-select" className="block text-sm font-medium text-charcoal mb-2">
                      Select Service
                    </label>
                    <select
                      id="service-select"
                      value={selectedServiceIndex}
                      onChange={(e) => setSelectedServiceIndex(Number.parseInt(e.target.value))}
                      className="w-full border border-mint/20 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-mint-dark"
                    >
                      {bookingData.services.map((service: any, index: number) => (
                        <option key={service.id} value={index}>
                          {service.title} - ₹{service.price}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-charcoal/70">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{selectedService.durationMin} minutes</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedService.location}</span>
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
                      <p className="font-medium text-charcoal">{expert.name}</p>
                      <p className="text-charcoal/70">{selectedService.title}</p>
                      <p className="text-charcoal/70">{selectedService.durationMin} minutes</p>
                    </div>

                    <div>
                      <p className="font-medium text-charcoal">Date & Time</p>
                      <p className="text-charcoal/70">
                        {formatDate(selectedDate)} at{" "}
                        {selectedTime && (selectedTime.includes("AM") || selectedTime.includes("PM"))
                          ? selectedTime
                          : formatTime12Hour(selectedTime || "")}
                      </p>
                      <p className="text-charcoal/70">{getTimezoneDisplayWithOffset(timezone)}</p>
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
                  <select
                    className="border border-mint/20 rounded-md px-3 py-2 bg-white"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                  >
                    {timezones.map((tz) => (
                      <option key={tz.id} value={tz.id}>
                        {tz.displayName} {tz.offset ? `(UTC${tz.offset})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Date Selection */}
            <Card className="border-mint/20 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-mint-dark" />
                    <h3 className="text-lg font-semibold text-charcoal">Select a Date</h3>
                  </div>

                  {/* Month Navigation */}
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={handlePreviousMonth} disabled={!canGoPrevious()}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium min-w-[120px] text-center">
                      {formatDate(currentMonth.toISOString().split("T")[0], "MMMM yyyy")}
                    </span>
                    <Button variant="outline" size="sm" onClick={handleNextMonth} disabled={!canGoNext()}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {bookingLoading && <p className="text-charcoal/70">Loading available dates...</p>}

                {availableSlots?.dates && (
                  <div className="grid grid-cols-7 gap-2">
                    {availableSlots.dates.map((dateObj) => (
                      <button
                        key={dateObj.date}
                        onClick={() => setSelectedDate(dateObj.date)}
                        disabled={!dateObj.available}
                        className={`p-3 rounded-lg border text-center transition-colors ${
                          selectedDate === dateObj.date
                            ? "border-mint-dark bg-mint-dark text-white"
                            : dateObj.available
                              ? "border-gray-200 hover:border-mint-dark hover:bg-mint/5"
                              : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <div className="text-xs text-gray-500 mb-1">{dateObj.day}</div>
                        <div className="text-lg font-semibold">{dateObj.dayNum}</div>
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
                    <h3 className="text-lg font-semibold text-charcoal">
                      Available Times ({getTimezoneDisplayWithOffset(timezone)})
                    </h3>
                  </div>

                  {bookingLoading && <p className="text-charcoal/70">Loading available times...</p>}

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
                          {timeSlot.time.includes("AM") || timeSlot.time.includes("PM")
                            ? timeSlot.time
                            : formatTime12Hour(timeSlot.time)}
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
                      <div className="text-sm text-charcoal/70">Secure payment via Cashfree</div>
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
                        <span>₹{selectedService.price}</span>
                      </div>
                      <div className="flex justify-between text-charcoal/70">
                        <span>Platform Fee (3.5%)</span>
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
            {(error || bookingError) && (
              <Card className="border-red-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">{bookingError || error}</div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
