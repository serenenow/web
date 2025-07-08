"use client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Clock, MapPin, IndianRupee, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { VerifyCodeResponse, ServiceDetailDto } from "@/lib/api/booking"

export default function ServiceSelectionPage() {
  const [bookingData, setBookingData] = useState<VerifyCodeResponse | null>(null)
  const [clientCode, setClientCode] = useState("")
  const [selectedService, setSelectedService] = useState<ServiceDetailDto | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get the code from URL params
    const code = searchParams.get("code")
    if (code) {
      setClientCode(code)
    }

    // Get booking data from sessionStorage
    const storedData = sessionStorage.getItem("bookingData")
    if (storedData) {
      const data = JSON.parse(storedData) as VerifyCodeResponse
      setBookingData(data)
    } else {
      // If no booking data, redirect back to code entry
      router.push("/book")
    }
  }, [searchParams, router])

  const handleServiceSelect = (service: ServiceDetailDto) => {
    setSelectedService(service)
  }

  const handleContinue = () => {
    if (selectedService && bookingData) {
      router.push(`/book/${bookingData.expert.id}/${selectedService.id}?code=${clientCode}`)
    }
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-light via-white to-lavender-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mint-dark mx-auto mb-4"></div>
          <p className="text-charcoal/70">Loading...</p>
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
            onClick={() => router.push("/book")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-charcoal mb-2">Select a Service</h1>
            <p className="text-charcoal/70">Choose the service you'd like to book</p>
          </div>
        </div>

        {/* Expert Info Card */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="border-mint/20 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-mint/10 rounded-full flex items-center justify-center overflow-hidden">
                  {bookingData.expert.pictureUrl ? (
                    <Image
                      src={bookingData.expert.pictureUrl || "/placeholder.svg"}
                      alt={bookingData.expert.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-mint-dark" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-charcoal">{bookingData.expert.name}</h3>
                  <p className="text-charcoal/70">{bookingData.expert.qualification}</p>
                  <p className="text-sm text-mint-dark">Code: {clientCode}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services List */}
        <div className="max-w-4xl mx-auto space-y-4">
          {bookingData.services.map((service) => (
            <Card
              key={service.id}
              className={`border-mint/20 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedService?.id === service.id
                  ? "ring-2 ring-mint-dark border-mint-dark bg-mint/5"
                  : "hover:border-mint/40"
              }`}
              onClick={() => handleServiceSelect(service)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-charcoal mb-2">{service.title}</h3>
                    <p className="text-charcoal/70 mb-4 text-sm">{service.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-charcoal/60">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(service.durationMin)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span className="capitalize">{service.location.toLowerCase().replace("_", " ")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right ml-6">
                    <div className="text-2xl font-bold text-charcoal flex items-center">
                      <IndianRupee className="h-5 w-5" />
                      {service.total.toLocaleString()}
                    </div>
                    <div className="text-sm text-charcoal/60">Base: ₹{service.price.toLocaleString()}</div>
                    {service.platformFees > 0 && (
                      <div className="text-xs text-charcoal/50">
                        + Platform fee: ₹{service.platformFees.toLocaleString()}
                      </div>
                    )}
                    {service.totalTaxes > 0 && (
                      <div className="text-xs text-charcoal/50">+ Taxes: ₹{service.totalTaxes.toLocaleString()}</div>
                    )}
                  </div>
                </div>

                {/* Service Details */}
                <div className="mt-4 pt-4 border-t border-mint/10">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-charcoal/60">
                    <div>
                      <span className="font-medium">Cancellation:</span>
                      <br />
                      {service.cancellationDeadlineHours}h notice, {service.cancellationPercent}% fee
                    </div>
                    <div>
                      <span className="font-medium">Reschedule:</span>
                      <br />
                      {service.rescheduleDeadlineHours}h notice, {service.reschedulePercent}% fee
                    </div>
                    <div>
                      <span className="font-medium">Min Notice:</span>
                      <br />
                      {service.minHoursNotice}h advance booking
                    </div>
                    <div>
                      <span className="font-medium">Buffer:</span>
                      <br />
                      {service.bufferMin} min between sessions
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Continue Button */}
        {selectedService && (
          <div className="max-w-4xl mx-auto mt-8">
            <Button onClick={handleContinue} className="w-full bg-mint-dark hover:bg-mint-dark/90 text-white py-3">
              Continue with {selectedService.title}
            </Button>
          </div>
        )}

        {/* Payment Options Info */}
        {bookingData.allowDirectPayment && bookingData.directPaymentInstructions && (
          <div className="max-w-4xl mx-auto mt-6">
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <h4 className="font-medium text-amber-800 mb-2">Direct Payment Available</h4>
                <p className="text-sm text-amber-700">{bookingData.directPaymentInstructions}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
