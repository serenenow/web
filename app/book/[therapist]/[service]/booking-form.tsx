"use client"

import { useState } from "react"
import { Calendar, Clock, MapPin, Shield, ArrowLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface BookingFormProps {
  therapistId: string;
  serviceId: string;
}

export function BookingForm({ therapistId, serviceId }: BookingFormProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [isBooked, setIsBooked] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  // Mock data - would come from API
  const therapist = {
    name: "Dr. Priya Sharma",
    title: "Licensed Clinical Psychologist",
    photo: "/placeholder.svg?height=120&width=120",
  }

  const service = {
    name: "Individual Therapy Session",
    description: "A confidential 50-minute one-on-one therapy session focused on your mental health and wellbeing.",
    location: "Google Meet",
    fee: "₹1,500",
    duration: "50 minutes",
  }

  // Mock available dates and times
  const availableDates = [
    { date: "2024-01-15", day: "Mon", dayNum: "15" },
    { date: "2024-01-16", day: "Tue", dayNum: "16" },
    { date: "2024-01-17", day: "Wed", dayNum: "17" },
    { date: "2024-01-18", day: "Thu", dayNum: "18" },
    { date: "2024-01-19", day: "Fri", dayNum: "19" },
    { date: "2024-01-22", day: "Mon", dayNum: "22" },
    { date: "2024-01-23", day: "Tue", dayNum: "23" },
  ]

  const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"]

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedTime(null)
    setShowForm(false)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setShowForm(true)
  }

  const handleBooking = (paymentType: "online" | "later") => {
    // Mock booking logic
    setIsBooked(true)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

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
                <p className="text-sm text-charcoal/60">
                  A calendar invite with Google Meet link will be sent to your email.
                </p>
                <Button
                  variant="outline"
                  className="mt-6 border-mint-dark text-mint-dark hover:bg-mint-dark hover:text-white"
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
          <div className="text-center lg:text-left">
            <h1 className="text-2xl font-bold text-charcoal">Book a Session</h1>
            <p className="text-charcoal/70">Select a time that works for you</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left Column - Therapist & Service Info */}
          <div className="space-y-6">
            <Card className="border-mint/20 shadow-sm">
              <CardContent className="p-6">
                {/* Therapist Info */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                  <img
                    src={therapist.photo || "/placeholder.svg"}
                    alt={therapist.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-mint/20"
                  />
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl font-bold text-charcoal">{therapist.name}</h2>
                    <p className="text-charcoal/70">{therapist.title}</p>
                  </div>
                </div>

                {/* Service Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-charcoal mb-2">{service.name}</h3>
                    <p className="text-charcoal/70 text-sm leading-relaxed">{service.description}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-mint-dark" />
                      <span className="text-sm text-charcoal">{service.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-mint-dark" />
                      <span className="text-sm text-charcoal">{service.duration}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-mint/10">
                    <div className="text-2xl font-bold text-charcoal">{service.fee}</div>
                    <Badge className="bg-mint/10 text-mint-dark hover:bg-mint/20">
                      <Shield className="h-3 w-3 mr-1" />
                      Confidential Session
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking Flow */}
          <div className="space-y-6">
            {/* Date Selection */}
            <Card className="border-mint/20 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-mint-dark" />
                  Select a Date
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {availableDates.map((dateObj) => (
                    <button
                      key={dateObj.date}
                      onClick={() => handleDateSelect(dateObj.date)}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        selectedDate === dateObj.date
                          ? "border-mint-dark bg-mint-dark text-white"
                          : "border-gray-200 hover:border-mint-dark hover:bg-mint/5"
                      }`}
                    >
                      <div className="text-xs text-gray-500">{dateObj.day}</div>
                      <div className="font-semibold">{dateObj.dayNum}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Time Selection */}
            {selectedDate && (
              <Card className="border-mint/20 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-charcoal mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-mint-dark" />
                    Select a Time
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => handleTimeSelect(time)}
                        className={`p-3 rounded-lg border text-center transition-colors ${
                          selectedTime === time
                            ? "border-mint-dark bg-mint-dark text-white"
                            : "border-gray-200 hover:border-mint-dark hover:bg-mint/5"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Booking Form */}
            {showForm && (
              <Card className="border-mint/20 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-charcoal mb-4">Your Details</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">
                          Name <span className="text-coral">*</span>
                        </label>
                        <Input
                          placeholder="Your full name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          className="border-mint/20 focus:border-mint-dark"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">
                          Email <span className="text-coral">*</span>
                        </label>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="border-mint/20 focus:border-mint-dark"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Phone (Optional)</label>
                      <Input
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="border-mint/20 focus:border-mint-dark"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Message (Optional)</label>
                      <Textarea
                        placeholder="Anything you'd like to share before the session..."
                        rows={3}
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        className="border-mint/20 focus:border-mint-dark"
                      />
                    </div>
                  </div>

                  {/* Payment Options */}
                  <div className="mt-6 pt-6 border-t border-mint/10">
                    <div className="space-y-3">
                      <Button
                        onClick={() => handleBooking("online")}
                        className="w-full bg-mint-dark hover:bg-mint-dark/90 text-white py-3"
                        disabled={!formData.name || !formData.email}
                      >
                        Pay Online - {service.fee}
                      </Button>
                      <Button
                        onClick={() => handleBooking("later")}
                        variant="outline"
                        className="w-full border-mint-dark text-mint-dark hover:bg-mint-dark hover:text-white py-3"
                        disabled={!formData.name || !formData.email}
                      >
                        Book Without Payment
                      </Button>
                    </div>
                    <p className="text-xs text-charcoal/60 mt-3 text-center">
                      By booking, you agree to our terms of service and privacy policy.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
