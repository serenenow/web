"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Gender } from "@/lib/api/client"
import Image from "next/image"
import { ArrowLeft, User, Phone, MapPin, UserCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useBooking } from "@/hooks/use-booking"
import { useClientData } from "@/hooks/use-client-data"
import type { VerifyCodeResponse, WebClientRegisterRequest } from "@/lib/api/booking"

const GENDERS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "NON_BINARY", label: "Non-binary" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
]

const EMERGENCY_RELATIONS = [
  { value: "PARENT", label: "Parent" },
  { value: "SPOUSE", label: "Spouse" },
  { value: "SIBLING", label: "Sibling" },
  { value: "CHILD", label: "Child" },
  { value: "FRIEND", label: "Friend" },
  { value: "OTHER", label: "Other" },
  { value: "NOT_SPECIFIED", label: "Not Specified" },
]

export default function ClientRegistrationPage() {
  const [bookingData, setBookingData] = useState<VerifyCodeResponse | null>(null)
  const [clientCode, setClientCode] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    age: "",
    gender: "",
    // Address
    street: "",
    city: "",
    state: "",
    stateCode: "",
    country: "India",
    pincode: "",
    // Emergency Contact
    emergencyName: "",
    emergencyEmail: "",
    emergencyPhone: "",
    emergencyRelation: "NOT_SPECIFIED",
  })

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { updateProfile, loading } = useBooking()
  const { setClientResponseData } = useClientData()

  useEffect(() => {
    // Get the code from URL params
    const code = searchParams.get("code")
    if (code) {
      setClientCode(code)
    }

    // Get booking data from sessionStorage
    const storedData = sessionStorage.getItem("pendingBookingData")
    if (storedData) {
      const data = JSON.parse(storedData) as VerifyCodeResponse & { code: string }
      setBookingData(data)

      // Store client data in our centralized system
      setClientResponseData(data.clientResponse)

      // Pre-fill email if available from the booking data
      if (data.clientResponse.client.email) {
        setFormData((prev) => ({ ...prev, email: data.clientResponse.client.email }))
      }
      if (data.clientResponse.client.name) {
        setFormData((prev) => ({ ...prev, name: data.clientResponse.client.name }))
      }
    } else {
      // If no booking data, redirect back to code entry
      router.push("/book")
    }
  }, [searchParams, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    // Set stateCode same as state for backward compatibility
    if (field === "state") {
      setFormData((prev) => ({ ...prev, stateCode: value }))
    }
  }

  const validateForm = () => {
    const requiredFields = [
      "name",
      "email",
      "phoneNumber",
      "age",
      "gender",
      "street",
      "city",
      "state",
      "pincode",
      "emergencyName",
      "emergencyPhone",
      "emergencyRelation",
    ]

    const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData])

    if (missingFields.length > 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return false
    }

    // Validate age
    const age = Number.parseInt(formData.age)
    if (isNaN(age) || age < 18 || age > 100) {
      toast({
        title: "Invalid age",
        description: "Please enter a valid age between 18 and 100.",
        variant: "destructive",
      })
      return false
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return false
    }

    // Validate phone numbers (basic validation)
    const phoneRegex = /^\+?[\d\s-()]{10,}$/
    if (!phoneRegex.test(formData.phoneNumber)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      })
      return false
    }

    if (formData.emergencyPhone && !phoneRegex.test(formData.emergencyPhone)) {
      toast({
        title: "Invalid emergency contact phone",
        description: "Please enter a valid emergency contact phone number.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !bookingData) {
      return
    }

    try {
      // Get client ID from the stored client response
      const clientId = bookingData.clientResponse.client.id
      
      // Create client update request
      const updateData = {
        id: clientId,
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        age: Number.parseInt(formData.age),
        gender: formData.gender as Gender,
        timezone: bookingData.expert.timeZone, // Use expert's timezone
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          stateCode: formData.stateCode,
          country: formData.country,
          pincode: formData.pincode,
        },
        emergencyContact: {
          name: formData.emergencyName,
          email: formData.emergencyEmail || undefined,
          phoneNumber: formData.emergencyPhone,
          relation: formData.emergencyRelation,
        },
      }

      // Update client profile
      const updatedClient = await updateProfile(updateData)

      // Update the booking data with the updated client
      const updatedBookingData = {
        ...bookingData,
        clientResponse: {
          ...bookingData.clientResponse,
          hasSetupProfile: true,
          client: updatedClient
        }
      }

      // Store updated booking data
      sessionStorage.setItem("bookingData", JSON.stringify(updatedBookingData))

      toast({
        title: "Profile setup complete!",
        description: "Your profile has been updated. Proceeding to booking...",
      })

      // Proceed to service selection or booking
      if (bookingData.services.length > 1) {
        router.push(`/book/services?code=${clientCode}`)
      } else if (bookingData.services.length === 1) {
        router.push(`/book/${bookingData.expert.id}/${bookingData.services[0].id}?code=${clientCode}`)
      }
    } catch (error: any) {
      console.error("Profile update error:", error)
      toast({
        title: "Profile update failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-light via-white to-lavender-light flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-mint-dark" />
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
            <h1 className="text-2xl font-bold text-charcoal mb-2">Complete Your Registration</h1>
            <p className="text-charcoal/70">We need some information to create your account</p>
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

        {/* Registration Form */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-mint/20 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-mint/10 rounded-full mx-auto">
                <UserCheck className="h-6 w-6 text-mint-dark" />
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <User className="h-5 w-5 text-mint-dark" />
                    <h3 className="text-lg font-semibold text-charcoal">Personal Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-charcoal">
                        Full Name *
                      </label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="border-mint/20 focus:border-mint-dark"
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-charcoal">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="border-mint/20 focus:border-mint-dark"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="phoneNumber" className="text-sm font-medium text-charcoal">
                        Phone Number *
                      </label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                        className="border-mint/20 focus:border-mint-dark"
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="age" className="text-sm font-medium text-charcoal">
                        Age *
                      </label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="Enter your age"
                        min="18"
                        max="100"
                        value={formData.age}
                        onChange={(e) => handleInputChange("age", e.target.value)}
                        className="border-mint/20 focus:border-mint-dark"
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="gender" className="text-sm font-medium text-charcoal">
                        Gender *
                      </label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value: string) => handleInputChange("gender", value)}
                        disabled={loading}
                      >
                        <SelectTrigger className="border-mint/20 focus:border-mint-dark">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          {GENDERS.map((gender) => (
                            <SelectItem key={gender.value} value={gender.value}>
                              {gender.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <MapPin className="h-5 w-5 text-mint-dark" />
                    <h3 className="text-lg font-semibold text-charcoal">Address Information</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="street" className="text-sm font-medium text-charcoal">
                        Street Address *
                      </label>
                      <Input
                        id="street"
                        type="text"
                        placeholder="Enter your street address"
                        value={formData.street}
                        onChange={(e) => handleInputChange("street", e.target.value)}
                        className="border-mint/20 focus:border-mint-dark"
                        disabled={loading}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="city" className="text-sm font-medium text-charcoal">
                          City *
                        </label>
                        <Input
                          id="city"
                          type="text"
                          placeholder="Enter your city"
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          className="border-mint/20 focus:border-mint-dark"
                          disabled={loading}
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="state" className="text-sm font-medium text-charcoal">
                          State/Province *
                        </label>
                        <Input
                          id="state"
                          type="text"
                          placeholder="Enter your state or province"
                          value={formData.state}
                          onChange={(e) => handleInputChange("state", e.target.value)}
                          className="border-mint/20 focus:border-mint-dark"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="pincode" className="text-sm font-medium text-charcoal">
                          Pincode *
                        </label>
                        <Input
                          id="pincode"
                          type="text"
                          placeholder="Enter your pincode"
                          value={formData.pincode}
                          onChange={(e) => handleInputChange("pincode", e.target.value)}
                          className="border-mint/20 focus:border-mint-dark"
                          disabled={loading}
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="country" className="text-sm font-medium text-charcoal">
                          Country *
                        </label>
                        <Input
                          id="country"
                          type="text"
                          placeholder="Enter your country"
                          value={formData.country}
                          onChange={(e) => handleInputChange("country", e.target.value)}
                          className="border-mint/20 focus:border-mint-dark"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Phone className="h-5 w-5 text-mint-dark" />
                    <h3 className="text-lg font-semibold text-charcoal">Emergency Contact</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="emergencyName" className="text-sm font-medium text-charcoal">
                        Contact Name *
                      </label>
                      <Input
                        id="emergencyName"
                        type="text"
                        placeholder="Enter emergency contact name"
                        value={formData.emergencyName}
                        onChange={(e) => handleInputChange("emergencyName", e.target.value)}
                        className="border-mint/20 focus:border-mint-dark"
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="emergencyPhone" className="text-sm font-medium text-charcoal">
                        Contact Phone *
                      </label>
                      <Input
                        id="emergencyPhone"
                        type="tel"
                        placeholder="Enter emergency contact phone"
                        value={formData.emergencyPhone}
                        onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                        className="border-mint/20 focus:border-mint-dark"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="emergencyEmail" className="text-sm font-medium text-charcoal">
                        Contact Email
                      </label>
                      <Input
                        id="emergencyEmail"
                        type="email"
                        placeholder="Enter emergency contact email (optional)"
                        value={formData.emergencyEmail}
                        onChange={(e) => handleInputChange("emergencyEmail", e.target.value)}
                        className="border-mint/20 focus:border-mint-dark"
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="emergencyRelation" className="text-sm font-medium text-charcoal">
                        Relationship *
                      </label>
                      <Select
                        value={formData.emergencyRelation}
                        onValueChange={(value: string) => handleInputChange("emergencyRelation", value)}
                        disabled={loading}
                      >
                        <SelectTrigger className="border-mint/20 focus:border-mint-dark">
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          {EMERGENCY_RELATIONS.map((relation) => (
                            <SelectItem key={relation.value} value={relation.value}>
                              {relation.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-mint-dark hover:bg-mint-dark/90 text-white py-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Complete Registration & Continue"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          <div className="mt-6 text-center">
            <p className="text-xs text-charcoal/50">* Required fields</p>
          </div>
        </div>
      </div>
    </div>
  )
}
