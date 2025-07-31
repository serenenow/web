"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Clock, MapPin, Globe, Check, ChevronLeft, ChevronRight, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useBooking } from "@/hooks/use-booking"
import { processPublicBooking } from "@/lib/services/booking-service"
import { apiRequest } from "@/lib/api/base"
import type { ServiceDetailDto } from "@/lib/api/booking"
import {
  timezones,
  getBrowserTimezone,
  getTimezoneDisplayWithOffset,
  formatTime12Hour,
  formatDate,
  convertTimeToTimezone,
} from "@/lib/utils/time-utils"

interface ExpertData {
  id: string
  name: string
  qualification: string
  pictureUrl: string
  description?: string
  timeZone: string
  languages: string
}

interface PublicBookingPageProps {
  params: Promise<{ expertId: string }>
}

type Step = "service" | "date" | "time" | "client" | "payment"

interface StepStatus {
  completed: boolean
  data?: any
}

export default function PublicBookingPage({ params }: PublicBookingPageProps) {
  const router = useRouter()
  const { fetchAvailableSlots, loading: slotsLoading } = useBooking()

  const [expertId, setExpertId] = useState<string>("")
  const [expert, setExpert] = useState<ExpertData | null>(null)
  const [services, setServices] = useState<ServiceDetailDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Booking state
  const [currentStep, setCurrentStep] = useState<Step>("service")
  const [stepStatus, setStepStatus] = useState<Record<Step, StepStatus>>({
    service: { completed: false },
    date: { completed: false },
    time: { completed: false },
    client: { completed: false },
    payment: { completed: false },
  })

  // Form data
  const [selectedService, setSelectedService] = useState<ServiceDetailDto | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [timezone, setTimezone] = useState(getBrowserTimezone() || "Asia/Kolkata")
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [paymentMode, setPaymentMode] = useState<"online" | "direct">("online")

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availableDates, setAvailableDates] = useState<
    Array<{
      date: string
      day: string
      dayNum: string
      available: boolean
    }>
  >([])
  const [availableTimeSlots, setAvailableTimeSlots] = useState<
    Array<{
      time: string
      available: boolean
      timezone: string
    }>
  >([])
  const [originalTimeSlots, setOriginalTimeSlots] = useState<
    Array<{
      time: string
      available: boolean
      timezone: string
    }>
  >([])

  // Booking process
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)

  // Initialize expert ID from params
  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params
      setExpertId(resolvedParams.expertId)
    }
    initParams()
  }, [params])

  // Load expert data and services
  useEffect(() => {
    if (!expertId) return

    const loadExpertData = async () => {
      try {
        setLoading(true)

        // Fetch expert profile
        const expertResponse = await apiRequest<ExpertData>(`/web/auth/expert/profile/${expertId}`)
        setExpert(expertResponse)

        // Fetch expert services
        const servicesResponse = await apiRequest<ServiceDetailDto[]>(`/web/auth/expert/services/${expertId}`)
        setServices(servicesResponse)

        // Auto-select service if only one
        if (servicesResponse.length === 1) {
          setSelectedService(servicesResponse[0])
          setStepStatus((prev) => ({
            ...prev,
            service: { completed: true, data: servicesResponse[0] },
          }))
          setCurrentStep("date")
        }
      } catch (err) {
        console.error("Failed to load expert data:", err)
        setError("Failed to load expert information")
      } finally {
        setLoading(false)
      }
    }

    loadExpertData()
  }, [expertId])

  // Generate dates for current month
  const generateDatesForMonth = (month: Date) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const dates = []
    const today = new Date()
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 6)

    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0)

    for (let date = new Date(firstDay); date <= lastDay; date.setDate(date.getDate() + 1)) {
      if (date >= today && date <= maxDate) {
        dates.push({
          date: date.toISOString().split("T")[0],
          day: days[date.getDay()],
          dayNum: date.getDate().toString(),
          available: true,
        })
      }
    }

    return dates
  }

  // Update available dates when month changes
  useEffect(() => {
    const dates = generateDatesForMonth(currentMonth)
    setAvailableDates(dates)
  }, [currentMonth])

  // Fetch time slots when date is selected
  useEffect(() => {
    if (selectedDate && selectedService) {
      const loadTimeSlots = async () => {
        try {
          const slots = await fetchAvailableSlots(expertId, selectedService.id, selectedDate)
          const originalSlots = slots.timeSlots.map((slot) => ({
            ...slot,
            originalTime: slot.time,
          }))

          setOriginalTimeSlots(originalSlots)

          const convertedSlots = originalSlots.map((slot) => ({
            ...slot,
            time: convertTimeToCurrentTimezone(slot.time, slot.timezone),
          }))

          setAvailableTimeSlots(convertedSlots)
        } catch (err) {
          console.error("Failed to load time slots:", err)
        }
      }

      loadTimeSlots()
    }
  }, [selectedDate, selectedService, expertId])

  // Convert time slots when timezone changes
  useEffect(() => {
    if (originalTimeSlots.length > 0) {
      const convertedSlots = originalTimeSlots.map((slot) => ({
        ...slot,
        time: convertTimeToCurrentTimezone(slot.originalTime || slot.time, slot.timezone),
      }))

      setAvailableTimeSlots(convertedSlots)
      setSelectedTime(null) // Reset selected time
    }
  }, [timezone, originalTimeSlots])

  const convertTimeToCurrentTimezone = (timeString: string, sourceTimezone: string) => {
    try {
      if (timeString.includes("AM") || timeString.includes("PM")) {
        return timeString
      }

      const today = new Date().toISOString().split("T")[0]
      const isoString = `${today}T${timeString}:00`
      return convertTimeToTimezone(isoString, timezone)
    } catch (error) {
      console.error("Error converting time:", error)
      return timeString
    }
  }

  const handleStepComplete = (step: Step, data?: any) => {
    setStepStatus((prev) => ({
      ...prev,
      [step]: { completed: true, data },
    }))

    // Move to next step
    const steps: Step[] = ["service", "date", "time", "client", "payment"]
    const currentIndex = steps.indexOf(step)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const handleStepEdit = (step: Step) => {
    setCurrentStep(step)
    setStepStatus((prev) => ({
      ...prev,
      [step]: { ...prev[step], completed: false },
    }))
  }

  const handleServiceSelect = (service: ServiceDetailDto) => {
    setSelectedService(service)
    handleStepComplete("service", service)
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    handleStepComplete("date", date)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    handleStepComplete("time", time)
  }

  const handleClientInfoSubmit = () => {
    if (clientName && clientEmail) {
      handleStepComplete("client", { name: clientName, email: clientEmail })
    }
  }

  const handleBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !clientName || !clientEmail) {
      setBookingError("Please complete all steps")
      return
    }

    setBookingLoading(true)
    setBookingError(null)

    try {
      const result = await processPublicBooking({
        expertId,
        serviceId: selectedService.id,
        selectedService,
        date: selectedDate,
        time: selectedTime,
        timezone,
        paymentMode,
        clientName,
        clientEmail,
      })

      if (result.success) {
        router.push(`/book/success?orderId=${result.orderId}&appointmentId=${result.appointmentId}`)
      } else {
        setBookingError(result.error || "Booking failed")
      }
    } catch (err) {
      setBookingError("Booking failed. Please try again.")
    } finally {
      setBookingLoading(false)
    }
  }

  const handlePreviousMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() - 1)
    const today = new Date()
    if (newMonth.getMonth() >= today.getMonth() && newMonth.getFullYear() >= today.getFullYear()) {
      setCurrentMonth(newMonth)
    }
  }

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() + 1)
    const maxMonth = new Date()
    maxMonth.setMonth(maxMonth.getMonth() + 6)
    if (newMonth <= maxMonth) {
      setCurrentMonth(newMonth)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-light via-white to-lavender-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-charcoal/70">Loading expert information...</p>
        </div>
      </div>
    )
  }

  if (error || !expert) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-light via-white to-lavender-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-charcoal/70">{error || "Expert not found"}</p>
        </div>
      </div>
    )
  }

  const platformFee = selectedService ? Math.round(selectedService.price * 0.035) : 0
  const taxes = selectedService ? Math.round(selectedService.price * 0.18) : 0
  const total = selectedService ? selectedService.price + platformFee + taxes : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-light via-white to-lavender-light">
      <div className="container mx-auto px-6 py-8">
         {/* Header with SereneNow Branding */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-charcoal">Book Appointment</h1>
          <div className="flex items-center space-x-2 text-sm text-charcoal/60">
            <span>Powered by</span>
            <img src="/icons/serenenow.png" alt="SereneNow" className="w-5 h-5" />
            <span className="font-medium text-mint-dark">SereneNow</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Left Panel - Expert Info & Booking Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Expert Information */}
            <Card className="border-mint/20 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={expert.pictureUrl || "/placeholder.svg?height=80&width=80"}
                    alt={expert.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-mint/20"
                  />
                  <div>
                    <h2 className="text-xl font-bold text-charcoal">{expert.name}</h2>
                    <p className="text-sm text-charcoal/70">{expert.qualification}</p>
                    <p className="text-xs text-mint-dark mt-1">{getTimezoneDisplayWithOffset(expert.timeZone)}</p>
                  </div>
                </div>

                {expert.description && (
                  <div>
                    <h3 className="font-semibold text-charcoal mb-2">About</h3>
                    <p className="text-sm text-charcoal/70">{expert.description}</p>
                  </div>
                )}

                {expert.languages && (
                  <div>
                    <h3 className="font-semibold text-charcoal mb-2">Languages</h3>
                    <p className="text-sm text-charcoal/70">{expert.languages}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Booking Summary */}
            <Card className="border-mint/20 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-4">Booking Summary</h3>

                <div className="space-y-3 text-sm">
                  {selectedService && (
                    <div>
                      <p className="font-medium text-charcoal">Service</p>
                      <p className="text-charcoal/70">{selectedService.title}</p>
                      <p className="text-charcoal/70">
                        {selectedService.durationMin} minutes • ₹{selectedService.price}
                      </p>
                    </div>
                  )}

                  {selectedDate && selectedTime && (
                    <div>
                      <p className="font-medium text-charcoal">Date & Time</p>
                      <p className="text-charcoal/70">
                        {formatDate(selectedDate)} at{" "}
                        {selectedTime.includes("AM") || selectedTime.includes("PM")
                          ? selectedTime
                          : formatTime12Hour(selectedTime)}
                      </p>
                      <p className="text-charcoal/70">{getTimezoneDisplayWithOffset(timezone)}</p>
                    </div>
                  )}

                  {clientName && clientEmail && (
                    <div>
                      <p className="font-medium text-charcoal">Client</p>
                      <p className="text-charcoal/70">{clientName}</p>
                      <p className="text-charcoal/70">{clientEmail}</p>
                    </div>
                  )}

                  {paymentMode && selectedService && (
                    <div>
                      <p className="font-medium text-charcoal">Payment</p>
                      <p className="text-charcoal/70">
                        {paymentMode === "online" ? "Pay Online" : "Pay Directly to Therapist"}
                      </p>
                      {paymentMode === "online" && (
                        <div className="mt-2 pt-2 border-t border-mint/20">
                          <div className="flex justify-between text-xs">
                            <span>Base Price</span>
                            <span>₹{selectedService.price}</span>
                          </div>
                          <div className="flex justify-between text-xs text-charcoal/70">
                            <span>Platform Fee</span>
                            <span>₹{platformFee}</span>
                          </div>
                          <div className="flex justify-between text-xs text-charcoal/70">
                            <span>Taxes</span>
                            <span>₹{taxes}</span>
                          </div>
                          <div className="flex justify-between font-semibold text-sm pt-1 border-t border-mint/20">
                            <span>Total</span>
                            <span>₹{total}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Stepper */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Service Selection */}
            <Card className={`border-mint/20 shadow-sm ${currentStep === "service" ? "ring-2 ring-mint-dark" : ""}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {stepStatus.service.completed ? (
                      <div className="w-8 h-8 bg-mint-dark rounded-full flex items-center justify-center">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-mint/20 rounded-full flex items-center justify-center">
                        <span className="text-mint-dark font-semibold">1</span>
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-charcoal">Select Service</h3>
                  </div>
                  {stepStatus.service.completed && (
                    <Button variant="ghost" size="sm" onClick={() => handleStepEdit("service")}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {(currentStep === "service" || !stepStatus.service.completed) && (
                  <div className="space-y-3">
                    {services.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => handleServiceSelect(service)}
                        className={`w-full p-4 rounded-lg border text-left transition-colors ${
                          selectedService?.id === service.id
                            ? "border-mint-dark bg-mint/5"
                            : "border-gray-200 hover:border-mint-dark"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-charcoal">{service.title}</h4>
                            <p className="text-sm text-charcoal/70 mt-1">{service.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-charcoal/70">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{service.durationMin} minutes</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{service.location}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-charcoal">₹{service.price}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {stepStatus.service.completed && currentStep !== "service" && (
                  <div className="text-sm text-charcoal/70">
                    Selected: {stepStatus.service.data?.title} - ₹{stepStatus.service.data?.price}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 2: Date Selection */}
            <Card className={`border-mint/20 shadow-sm ${currentStep === "date" ? "ring-2 ring-mint-dark" : ""}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {stepStatus.date.completed ? (
                      <div className="w-8 h-8 bg-mint-dark rounded-full flex items-center justify-center">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-mint/20 rounded-full flex items-center justify-center">
                        <span className="text-mint-dark font-semibold">2</span>
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-charcoal">Select Date</h3>
                  </div>
                  {stepStatus.date.completed && (
                    <Button variant="ghost" size="sm" onClick={() => handleStepEdit("date")}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {(currentStep === "date" || !stepStatus.date.completed) && stepStatus.service.completed && (
                  <div>
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-4">
                      <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="font-medium">
                        {formatDate(currentMonth.toISOString().split("T")[0], "MMMM yyyy")}
                      </span>
                      <Button variant="outline" size="sm" onClick={handleNextMonth}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-2">
                      {availableDates.map((dateObj) => (
                        <button
                          key={dateObj.date}
                          onClick={() => handleDateSelect(dateObj.date)}
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
                          <div className="font-semibold">{dateObj.dayNum}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {stepStatus.date.completed && currentStep !== "date" && (
                  <div className="text-sm text-charcoal/70">Selected: {formatDate(stepStatus.date.data)}</div>
                )}
              </CardContent>
            </Card>

            {/* Step 3: Time Selection */}
            <Card className={`border-mint/20 shadow-sm ${currentStep === "time" ? "ring-2 ring-mint-dark" : ""}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {stepStatus.time.completed ? (
                      <div className="w-8 h-8 bg-mint-dark rounded-full flex items-center justify-center">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-mint/20 rounded-full flex items-center justify-center">
                        <span className="text-mint-dark font-semibold">3</span>
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-charcoal">Select Time</h3>
                  </div>
                  {stepStatus.time.completed && (
                    <Button variant="ghost" size="sm" onClick={() => handleStepEdit("time")}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {(currentStep === "time" || !stepStatus.time.completed) && stepStatus.date.completed && (
                  <div>
                    {slotsLoading && <p className="text-charcoal/70 mb-4">Loading available times...</p>}

                    {/* Timezone Selection */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-mint-dark" />
                        <span className="text-sm font-medium text-charcoal">Timezone</span>
                      </div>
                      <select
                        className="border border-mint/20 rounded-md px-3 py-1 text-sm bg-white"
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                      >
                        {timezones.map((tz) => (
                          <option key={tz.id} value={tz.id}>
                            {tz.displayName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {availableTimeSlots.map((timeSlot) => (
                        <button
                          key={timeSlot.time}
                          onClick={() => handleTimeSelect(timeSlot.time)}
                          disabled={!timeSlot.available}
                          className={`p-3 rounded-lg border text-center transition-colors ${
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
                  </div>
                )}

                {stepStatus.time.completed && currentStep !== "time" && (
                  <div className="text-sm text-charcoal/70">
                    Selected:{" "}
                    {stepStatus.time.data?.includes("AM") || stepStatus.time.data?.includes("PM")
                      ? stepStatus.time.data
                      : formatTime12Hour(stepStatus.time.data)}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 4: Client Information */}
            <Card className={`border-mint/20 shadow-sm ${currentStep === "client" ? "ring-2 ring-mint-dark" : ""}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {stepStatus.client.completed ? (
                      <div className="w-8 h-8 bg-mint-dark rounded-full flex items-center justify-center">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-mint/20 rounded-full flex items-center justify-center">
                        <span className="text-mint-dark font-semibold">4</span>
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-charcoal">Your Information</h3>
                  </div>
                  {stepStatus.client.completed && (
                    <Button variant="ghost" size="sm" onClick={() => handleStepEdit("client")}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {(currentStep === "client" || !stepStatus.client.completed) && stepStatus.time.completed && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Full Name</label>
                      <Input
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Enter your full name"
                        className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Email Address</label>
                      <Input
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                      />
                    </div>
                    <Button
                      onClick={handleClientInfoSubmit}
                      disabled={!clientName || !clientEmail}
                      className="w-full bg-mint-dark hover:bg-mint-dark/90 text-white"
                    >
                      Continue
                    </Button>
                  </div>
                )}

                {stepStatus.client.completed && currentStep !== "client" && (
                  <div className="text-sm text-charcoal/70">
                    {stepStatus.client.data?.name} ({stepStatus.client.data?.email})
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 5: Payment */}
            <Card className={`border-mint/20 shadow-sm ${currentStep === "payment" ? "ring-2 ring-mint-dark" : ""}`}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-mint/20 rounded-full flex items-center justify-center">
                    <span className="text-mint-dark font-semibold">5</span>
                  </div>
                  <h3 className="text-lg font-semibold text-charcoal">Payment</h3>
                </div>

                {currentStep === "payment" && stepStatus.client.completed && (
                  <div className="space-y-4">
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

                    {paymentMode === "online" && selectedService && (
                      <div className="bg-mint/5 p-4 rounded-lg">
                        <div className="space-y-2 text-sm">
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
                          <div className="flex justify-between font-semibold text-lg pt-2 border-t border-mint/20">
                            <span>Total</span>
                            <span>₹{total}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handleBooking}
                      disabled={bookingLoading}
                      className="w-full bg-mint-dark hover:bg-mint-dark/90 text-white py-3"
                    >
                      {bookingLoading
                        ? "Processing..."
                        : paymentMode === "online"
                          ? `Pay ₹${total} & Book`
                          : "Book Appointment"}
                    </Button>

                    {bookingError && (
                      <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">{bookingError}</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
