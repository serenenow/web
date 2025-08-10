"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Clock, IndianRupee, Calendar, Video, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import {
  getGoogleConnectionStatus,
  exchangeGoogleAuthCode,
  type GoogleConnectionStatus,
  type GoogleAccessRequest,
} from "@/lib/api/google"
import { addService, getExpertServices, type ServiceAddRequest, type Service, Location } from "@/lib/api/service"
import { useExpertData } from "@/hooks/use-expert-data"

export default function ServicesPage() {
  // Use our custom hook for expert data
  const { expertData: user, isLoading: isLoadingUser } = useExpertData()

  const [services, setServices] = useState<Service[]>([])
  const [isLoadingServices, setIsLoadingServices] = useState(false)

  const [showAddForm, setShowAddForm] = useState(false)
  const [showGooglePrompt, setShowGooglePrompt] = useState(false)
  const [googleStatus, setGoogleStatus] = useState<GoogleConnectionStatus>({
    isConnected: false,
    calendarAccess: false,
    meetAccess: false,
  })
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false)

  const [newService, setNewService] = useState<Partial<ServiceAddRequest>>({
    expertId: "", // Will be set when needed
    title: "",
    description: "",
    price: 0,
    durationMin: 50,
    bufferMin: 10,
    location: Location.IN_PERSON,
    cancellationDeadlineHours: 24,
    cancellationPercent: 0,
    rescheduleDeadlineHours: 12,
    reschedulePercent: 0,
    minHoursNotice: 2,
  })

  // Check Google connection status and fetch services when user data is available
  useEffect(() => {
    if (user.id) {
      checkGoogleStatus()
      fetchServices()
    }
  }, [user.id])

  const checkGoogleStatus = async () => {
    if (!user.id) {
      console.error("Expert Id is not set")
      return
    }

    try {
      const status = await getGoogleConnectionStatus(user.id)
      setGoogleStatus(status)
    } catch (error) {
      console.error("Failed to check Google status:", error)

      // Set default status when API call fails (including 404 not found)
      setGoogleStatus({
        isConnected: false,
        calendarAccess: false,
        meetAccess: false,
      })
    }
  }

  const handleLocationChange = (location: Location) => {
    setNewService((prev) => ({ ...prev, location }))

    if (location === Location.GOOGLE_MEET) {
      setShowGooglePrompt(true)
    } else {
      setShowGooglePrompt(false)
    }
  }

  const handleConnectGoogle = async () => {
    setIsConnectingGoogle(true)

    try {
      // Create the popup URL - use the Next.js route
      const popupUrl = `${window.location.origin}/google-oauth-popup.html`

      // Open popup window
      const popup = window.open(
        popupUrl,
        "google-oauth",
        "width=500,height=600,scrollbars=yes,resizable=yes,left=" +
          (window.screen.width / 2 - 250) +
          ",top=" +
          (window.screen.height / 2 - 300),
      )

      if (!popup) {
        throw new Error("Popup blocked. Please allow popups for this site.")
      }

      // Listen for message from popup
      const handleMessage = async (event: MessageEvent) => {
        // Verify origin for security
        if (event.origin !== window.location.origin) {
          return
        }

        if (event.data.type === "GOOGLE_OAUTH_SUCCESS") {
          try {
            // Prepare API request
            const request: GoogleAccessRequest = {
              userId: user.id,
              accessToken: "", // Empty as specified
              serverAuthCode: event.data.code,
              codeVerifier: event.data.codeVerifier,
            }

            // Make API call to exchange code for tokens (returns empty success response)
            await exchangeGoogleAuthCode(request)

            // Since API call succeeded, refresh the Google status
            await checkGoogleStatus()

            // Show success message
            alert("Google account connected successfully!")
          } catch (error) {
            console.error("Failed to exchange auth code:", error)
            alert("Failed to complete Google connection. Please try again.")
          } finally {
            // Clean up event listener
            window.removeEventListener("message", handleMessage)
            setIsConnectingGoogle(false)
          }
        } else if (event.data.type === "GOOGLE_OAUTH_ERROR") {
          console.error("OAuth error:", event.data.error)
          alert("Failed to connect Google account. Please try again.")
          window.removeEventListener("message", handleMessage)
          setIsConnectingGoogle(false)
        }
      }

      // Add event listener
      window.addEventListener("message", handleMessage)

      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          window.removeEventListener("message", handleMessage)
          setIsConnectingGoogle(false)
        }
      }, 1000)
    } catch (error) {
      console.error("Failed to connect to Google:", error)
      alert(error instanceof Error ? error.message : "Failed to connect to Google. Please try again.")
      setIsConnectingGoogle(false)
    }
  }

  const fetchServices = async () => {
    if (!user.id) {
      console.error("No expert ID available")
      return
    }

    setIsLoadingServices(true)
    try {
      const fetchedServices = await getExpertServices(user.id)
      setServices(fetchedServices)
    } catch (error) {
      console.error("Failed to fetch services:", error)
      // Show error message to user - consider using a toast notification instead of alert in production
      alert("Failed to fetch services. Please try again.")
    } finally {
      setIsLoadingServices(false)
    }
  }

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user.id) {
      console.error("Expert ID is not available")
      alert("You must be logged in to add a service")
      return
    }

    if (!newService.title || !newService.description || !newService.price) {
      alert("Please fill in all required fields")
      return
    }

    // Create the service request object
    const serviceRequest: ServiceAddRequest = {
      expertId: user.id,
      title: newService.title || "",
      description: newService.description || "",
      price: newService.price || 0,
      taxId: null, // Default to null as per requirements
      durationMin: newService.durationMin || 50,
      bufferMin: newService.bufferMin || 10,
      location: newService.location || Location.IN_PERSON,
      cancellationDeadlineHours: newService.cancellationDeadlineHours || 24,
      cancellationPercent: newService.cancellationPercent || 0,
      rescheduleDeadlineHours: newService.rescheduleDeadlineHours || 12,
      reschedulePercent: newService.reschedulePercent || 0,
      useCustomAvailability: false, // Default to false as per requirements
      minHoursNotice: newService.minHoursNotice || 2,
    }

    try {
      // Make API call to add service
      await addService(serviceRequest)

      // Re-fetch services to get the updated list
      await fetchServices()

      // Reset form
      setNewService({
        expertId: user.id,
        title: "",
        description: "",
        price: 0,
        durationMin: 50,
        bufferMin: 10,
        location: Location.IN_PERSON,
        cancellationDeadlineHours: 24,
        cancellationPercent: 0,
        rescheduleDeadlineHours: 12,
        reschedulePercent: 0,
        minHoursNotice: 2,
      })
      setShowAddForm(false)
      setShowGooglePrompt(false)
    } catch (error) {
      console.error("Failed to add service:", error)
      // Show error message to user
      alert("Failed to add service. Please try again.")
    }
  }

  const handleDeleteService = (id: string) => {
    // For now, just filter out the service locally
    // In a future implementation, this would make an API call to delete the service
    setServices(services.filter((service) => service.id !== id))
  }

  const getLocationDisplay = (location: string) => {
    switch (location) {
      case "IN_PERSON":
        return "📍 In-Person"
      case "PHONE_CALL":
        return "📞 Phone Call"
      case "GOOGLE_MEET":
        return "💻 Google Meet"
      default:
        return "📍 In-Person"
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-mint-light/30 via-white to-lavender-light/30 flex">
        <DashboardSidebar user={user} />

        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-charcoal mb-2">Services</h1>
                <p className="text-charcoal/70">Manage your therapy services and pricing</p>
              </div>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-mint-dark hover:bg-mint-dark/90 text-white"
                disabled={!user.id}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </div>

            {/* Loading state */}
            {(isLoadingUser || isLoadingServices) && (
              <div className="flex justify-center my-8">
                <p className="text-charcoal/70">Loading...</p>
              </div>
            )}

            {/* No user ID warning */}
            {!isLoadingUser && !user.id && (
              <Card className="border-amber-200 bg-amber-50 mb-6">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-amber-800">Authentication Required</h4>
                      <p className="text-amber-700">Please log in to manage your services.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Add Service Form */}
            {showAddForm && (
              <Card className="border-mint/20 mb-6">
                <CardHeader>
                  <CardTitle className="text-charcoal">Add New Service</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddService} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-charcoal">Basic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          placeholder="Service title"
                          value={newService.title || ""}
                          onChange={(e) => setNewService((prev) => ({ ...prev, title: e.target.value }))}
                          className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                          required
                        />
                        <Input
                          type="number"
                          placeholder="Price (₹)"
                          value={newService.price || ""}
                          onChange={(e) => setNewService((prev) => ({ ...prev, price: Number(e.target.value) }))}
                          className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                          required
                        />
                      </div>

                      <Textarea
                        placeholder="Service description"
                        value={newService.description || ""}
                        onChange={(e) => setNewService((prev) => ({ ...prev, description: e.target.value }))}
                        className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                        rows={3}
                        required
                      />
                    </div>

                    {/* Session Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-charcoal">Session Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-charcoal/70 mb-1">Duration (minutes)</label>
                          <Input
                            type="number"
                            placeholder="50"
                            value={newService.durationMin || ""}
                            onChange={(e) =>
                              setNewService((prev) => ({ ...prev, durationMin: Number(e.target.value) }))
                            }
                            className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-charcoal/70 mb-1">
                            Buffer time (minutes)
                          </label>
                          <Input
                            type="number"
                            placeholder="10"
                            value={newService.bufferMin || ""}
                            onChange={(e) => setNewService((prev) => ({ ...prev, bufferMin: Number(e.target.value) }))}
                            className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-charcoal/70 mb-1">Min hours notice</label>
                          <Input
                            type="number"
                            placeholder="2"
                            value={newService.minHoursNotice || ""}
                            onChange={(e) =>
                              setNewService((prev) => ({ ...prev, minHoursNotice: Number(e.target.value) }))
                            }
                            className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-charcoal">Location</h3>
                      <Select
                        value={newService.location}
                        onValueChange={(value) => handleLocationChange(value as Location)}
                      >
                        <SelectTrigger className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark">
                          <SelectValue placeholder="Select location type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={Location.IN_PERSON}>📍 In-Person</SelectItem>
                          <SelectItem value={Location.PHONE_CALL}>📞 Phone Call</SelectItem>
                          <SelectItem value={Location.GOOGLE_MEET}>💻 Google Meet</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Google Meet Connection Prompt */}
                      {showGooglePrompt && (
                        <Card
                          className={`border-2 ${googleStatus.isConnected ? "border-green-200 bg-green-50" : "border-blue-200 bg-blue-50"}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                {googleStatus.isConnected ? (
                                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                ) : (
                                  <Video className="h-5 w-5 text-blue-600 mt-0.5" />
                                )}
                              </div>
                              <div className="flex-1">
                                {googleStatus.isConnected ? (
                                  <>
                                    <h4 className="text-sm font-medium text-green-900 mb-1">
                                      Google Account Connected
                                    </h4>
                                    <p className="text-sm text-green-600">
                                      Your clients will automatically receive calendar invites with Google Meet links
                                      for their sessions.
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <h4 className="text-sm font-medium text-blue-900 mb-1">Connect Google Account</h4>
                                    <p className="text-sm text-blue-700 mb-3">
                                      To use Google Meet for sessions, please connect your Google Account to provide
                                      access to Calendar and Meet.
                                    </p>

                                    {/* Warning about skipping */}
                                    <div className="flex items-start space-x-2 mb-3 p-2 bg-amber-50 border border-amber-200 rounded">
                                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                      <div className="text-xs text-amber-700">
                                        <strong>Note:</strong> Without connecting Google, clients won't receive
                                        automatic calendar invites with meeting links. You'll need to manually send
                                        meeting details for each session.
                                      </div>
                                    </div>

                                    <div className="flex space-x-2">
                                      <Button
                                        type="button"
                                        size="sm"
                                        onClick={handleConnectGoogle}
                                        disabled={isConnectingGoogle}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                      >
                                        <Calendar className="h-4 w-4 mr-1" />
                                        {isConnectingGoogle ? "Connecting..." : "Connect Google"}
                                      </Button>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setShowGooglePrompt(false)}
                                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                      >
                                        Skip for now
                                      </Button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Cancellation Policy */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-charcoal">Cancellation Policy</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-charcoal/70 mb-1">
                            Cancellation deadline (hours)
                          </label>
                          <Input
                            type="number"
                            placeholder="24"
                            value={newService.cancellationDeadlineHours || ""}
                            onChange={(e) =>
                              setNewService((prev) => ({ ...prev, cancellationDeadlineHours: Number(e.target.value) }))
                            }
                            className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-charcoal/70 mb-1">
                            Cancellation fee (%)
                          </label>
                          <Input
                            type="number"
                            placeholder="0"
                            min="0"
                            max="100"
                            value={newService.cancellationPercent !== undefined ? newService.cancellationPercent : ""}
                            onChange={(e) =>
                              setNewService((prev) => ({ ...prev, cancellationPercent: Number(e.target.value) }))
                            }
                            className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Reschedule Policy */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-charcoal">Reschedule Policy</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-charcoal/70 mb-1">
                            Reschedule deadline (hours)
                          </label>
                          <Input
                            type="number"
                            placeholder="12"
                            value={newService.rescheduleDeadlineHours || ""}
                            onChange={(e) =>
                              setNewService((prev) => ({ ...prev, rescheduleDeadlineHours: Number(e.target.value) }))
                            }
                            className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-charcoal/70 mb-1">Reschedule fee (%)</label>
                          <Input
                            type="number"
                            placeholder="0"
                            min="0"
                            max="100"
                            value={newService.reschedulePercent !== undefined ? newService.reschedulePercent : ""}
                            onChange={(e) =>
                              setNewService((prev) => ({ ...prev, reschedulePercent: Number(e.target.value) }))
                            }
                            className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button type="submit" className="bg-mint-dark hover:bg-mint-dark/90 text-white">
                        Add Service
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowAddForm(false)
                          setShowGooglePrompt(false)
                        }}
                        className="border-mint/30 hover:bg-mint/10"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Services List */}
            <div className="grid gap-6">
              {services.map((service) => (
                <Card key={service.id} className="border-mint/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-charcoal">{service.title}</h3>
                          <Badge variant="secondary" className="bg-mint/20 text-mint-dark">
                            {service.status}
                          </Badge>
                        </div>
                        <p className="text-charcoal/70 mb-4">{service.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-charcoal/60">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {service.durationMin} min
                          </div>
                          <div className="flex items-center">
                            <IndianRupee className="h-4 w-4 mr-1" />
                            {service.price.toLocaleString()}
                          </div>
                          <div>{getLocationDisplay(service.location)}</div>
                          <div>🔔 {service.minHoursNotice}h notice</div>
                        </div>

                        <div className="mt-3 text-xs text-charcoal/50">
                          Cancellation: {service.cancellationDeadlineHours}h deadline, {service.cancellationPercent}%
                          fee • Reschedule: {service.rescheduleDeadlineHours}h deadline, {service.reschedulePercent}%
                          fee
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="border-mint/30 hover:bg-mint/10 bg-transparent">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteService(service.id)}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {isLoadingServices && !showAddForm && (
              <Card className="border-mint/20">
                <CardContent className="p-12 text-center">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="w-16 h-16 bg-mint/10 rounded-full flex items-center justify-center mx-auto mb-4"></div>
                    <div className="h-4 bg-mint/10 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-mint/10 rounded w-1/2 mb-4"></div>
                  </div>
                </CardContent>
              </Card>
            )}

            {!isLoadingServices && services.length === 0 && !showAddForm && (
              <Card className="border-mint/20">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-mint/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-mint-dark" />
                  </div>
                  <h3 className="text-lg font-semibold text-charcoal mb-2">No services yet</h3>
                  <p className="text-charcoal/60 mb-4">Create your first service to start accepting clients</p>
                  <Button
                    onClick={() => setShowAddForm(true)}
                    className="bg-mint-dark hover:bg-mint-dark/90 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Service
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </TooltipProvider>
  )
}
