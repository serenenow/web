"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowRight, User, Loader2, Globe, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { createUserProfile } from "@/lib/api"

// Constants for dropdown options
const QUALIFICATIONS = [
  { value: "bachelor", label: "Bachelor's Degree" },
  { value: "master", label: "Master's Degree" },
  { value: "mphil", label: "M.Phil" },
  { value: "phd", label: "PhD" },
]

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-binary" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
]

const LANGUAGES = [
  { value: "english", label: "English" },
  { value: "hindi", label: "Hindi" },
  { value: "marathi", label: "Marathi" },
  { value: "gujarati", label: "Gujarati" },
  { value: "bengali", label: "Bengali" },
  { value: "tamil", label: "Tamil" },
  { value: "telugu", label: "Telugu" },
  { value: "kannada", label: "Kannada" },
  { value: "malayalam", label: "Malayalam" },
  { value: "punjabi", label: "Punjabi" },
  { value: "urdu", label: "Urdu" },
  { value: "other", label: "Other" },
]

const TIMEZONES = [
  { value: "Asia/Kolkata", label: "India Standard Time (IST)" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
  { value: "Europe/Berlin", label: "Central European Time (CET)" },
  { value: "Asia/Dubai", label: "Gulf Standard Time (GST)" },
  { value: "Asia/Singapore", label: "Singapore Standard Time (SGT)" },
  { value: "Australia/Sydney", label: "Australian Eastern Time (AET)" },
]

export default function ProfileOnboardingPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    rciNumber: "",
    specialization: "",
    bio: "",
    yearsOfExperience: "",
    qualification: "",
    gender: "",
    languages: [] as string[],
    age: "",
    timezone: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleLanguageChange = (languageValue: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      languages: checked ? [...prev.languages, languageValue] : prev.languages.filter((lang) => lang !== languageValue),
    }))
  }

  const validateForm = () => {
    const requiredFields = [
      "firstName",
      "lastName",
      "phone",
      "yearsOfExperience",
      "qualification",
      "gender",
      "age",
      "timezone",
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

    if (formData.languages.length === 0) {
      toast({
        title: "Missing information",
        description: "Please select at least one language you support.",
        variant: "destructive",
      })
      return false
    }

    // Validate age range
    const age = Number.parseInt(formData.age)
    if (isNaN(age) || age < 18 || age > 100) {
      toast({
        title: "Invalid age",
        description: "Please enter a valid age between 18 and 100.",
        variant: "destructive",
      })
      return false
    }

    // Validate years of experience
    const experience = Number.parseInt(formData.yearsOfExperience)
    if (isNaN(experience) || experience < 0 || experience > 50) {
      toast({
        title: "Invalid experience",
        description: "Please enter valid years of experience (0-50).",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const profileData = {
        ...formData,
        age: Number.parseInt(formData.age),
        yearsOfExperience: Number.parseInt(formData.yearsOfExperience),
      }

      const response = await createUserProfile(profileData)

      if (response.success) {
        toast({
          title: "Profile created!",
          description: "Welcome to SereneNow. Your account is ready.",
        })

        router.push("/dashboard")
      } else {
        throw new Error(response.error || "Failed to create profile")
      }
    } catch (error: any) {
      console.error("Profile creation error:", error)
      toast({
        title: "Something went wrong",
        description: error.message || "Failed to create profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-light via-white to-lavender-light flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <Image src="/favicon.png" alt="SereneNow Logo" width={48} height={48} />
            <span className="text-3xl font-bold bg-gradient-to-r from-mint-dark to-indigo bg-clip-text text-transparent ml-3">
              SereneNow
            </span>
          </div>
          <h1 className="text-2xl font-bold text-charcoal mb-2">Complete Your Profile</h1>
          <p className="text-charcoal/70 text-sm">Tell us about yourself to get started with SereneNow</p>
        </div>

        {/* Profile Form */}
        <Card className="border-mint/20 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-mint/10 rounded-full mx-auto">
              <User className="h-6 w-6 text-mint-dark" />
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <User className="h-5 w-5 text-mint-dark" />
                  <h3 className="text-lg font-semibold text-charcoal">Personal Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium text-charcoal">
                      First Name *
                    </label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium text-charcoal">
                      Last Name *
                    </label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="gender" className="text-sm font-medium text-charcoal">
                      Gender *
                    </label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => handleInputChange("gender", value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark">
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

                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium text-charcoal">
                      Phone Number *
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <GraduationCap className="h-5 w-5 text-mint-dark" />
                  <h3 className="text-lg font-semibold text-charcoal">Professional Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="qualification" className="text-sm font-medium text-charcoal">
                      Highest Qualification *
                    </label>
                    <Select
                      value={formData.qualification}
                      onValueChange={(value) => handleInputChange("qualification", value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark">
                        <SelectValue placeholder="Select qualification" />
                      </SelectTrigger>
                      <SelectContent>
                        {QUALIFICATIONS.map((qual) => (
                          <SelectItem key={qual.value} value={qual.value}>
                            {qual.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="yearsOfExperience" className="text-sm font-medium text-charcoal">
                      Years of Experience *
                    </label>
                    <Input
                      id="yearsOfExperience"
                      type="number"
                      placeholder="Enter years of experience"
                      min="0"
                      max="50"
                      value={formData.yearsOfExperience}
                      onChange={(e) => handleInputChange("yearsOfExperience", e.target.value)}
                      className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="rciNumber" className="text-sm font-medium text-charcoal">
                      RCI Number
                    </label>
                    <Input
                      id="rciNumber"
                      type="text"
                      placeholder="Enter your RCI registration number"
                      value={formData.rciNumber}
                      onChange={(e) => handleInputChange("rciNumber", e.target.value)}
                      className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="specialization" className="text-sm font-medium text-charcoal">
                      Specialization
                    </label>
                    <Input
                      id="specialization"
                      type="text"
                      placeholder="e.g., Clinical Psychology, Counseling Psychology"
                      value={formData.specialization}
                      onChange={(e) => handleInputChange("specialization", e.target.value)}
                      className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="bio" className="text-sm font-medium text-charcoal">
                    Bio
                  </label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about your experience and approach to therapy..."
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark min-h-[100px]"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Languages & Preferences Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Globe className="h-5 w-5 text-mint-dark" />
                  <h3 className="text-lg font-semibold text-charcoal">Languages & Preferences</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-charcoal">Languages You Support *</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {LANGUAGES.map((language) => (
                        <div key={language.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={language.value}
                            checked={formData.languages.includes(language.value)}
                            onCheckedChange={(checked) => handleLanguageChange(language.value, checked as boolean)}
                            disabled={isLoading}
                            className="border-mint/30 data-[state=checked]:bg-mint-dark data-[state=checked]:border-mint-dark"
                          />
                          <label htmlFor={language.value} className="text-sm text-charcoal cursor-pointer">
                            {language.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    {formData.languages.length > 0 && (
                      <p className="text-xs text-mint-dark">
                        Selected:{" "}
                        {formData.languages.map((lang) => LANGUAGES.find((l) => l.value === lang)?.label).join(", ")}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="timezone" className="text-sm font-medium text-charcoal">
                      Timezone *
                    </label>
                    <Select
                      value={formData.timezone}
                      onValueChange={(value) => handleInputChange("timezone", value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark">
                        <SelectValue placeholder="Select your timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEZONES.map((timezone) => (
                          <SelectItem key={timezone.value} value={timezone.value}>
                            {timezone.label}
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
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
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
  )
}
